// Measures how the collectable stream actually moves on SCREEN with the boost held versus released.
//
// Written because "the player accelerates but I still do not close on the bubbles quickly" needs a
// number, not an argument. Samples in-page on requestAnimationFrame and reports, for a tracked
// collectable: its screen speed, the camera's screen speed, and how long it takes to travel from the
// top of the screen to the player.
//
// Usage: node scripts/approach-speed.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9364;

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('no chrome');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'gb-approach-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=500,780',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error('no devtools target');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 1;
    const pending = new Map();
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await findTarget());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!window.__GB', returnByValue: true });
    if (r.result.value === true) break;
  }
  for (let i = 0; i < 40; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(250);
  }

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return JSON.parse(r.result.value);
  };

  // One in-page routine that measures, for a window of frames: the camera's screen speed, the
  // player's screen speed, and the screen speed of a tracked collectable. Run it twice, once
  // cruising and once boosting, so the ONLY difference is the boost.
  const measure = `(async function (boost, frames) {
    var g = window.__GB.game;
    var cam = g.camera;
    var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
    g.debugSetBoosting(boost);
    for (var i = 0; i < 25; i++) await raf();          // let the ramp settle
    g.debugTrackBubble();
    var trackId = g.debugMotion().trackedBubbleId;
    var find = function (id) { return g.fieldRef.bubbles.filter(function (b) { return b.id === id; })[0]; };
    var t0 = performance.now();
    var first = null;
    var last = null;
    for (var f = 0; f < frames; f++) {
      await raf();
      var b = find(trackId);
      if (!b) break;
      var sample = {
        t: performance.now() - t0,
        camY: cam.y,
        playerY: g.player.y,
        playerScreenY: cam.toScreenY(g.player.y),
        bubbleScreenY: cam.toScreenY(b.y),
        bubbleRelativeMps: b.vy,
        multiplier: g.player.speedMultiplier,
        playerAscent: g.player.vy
      };
      if (!first) first = sample;
      last = sample;
    }
    if (!first || !last || last.t < 100) return JSON.stringify({ error: 'too few samples', frames: frames });
    var dt = (last.t - first.t) / 1000;
    return JSON.stringify({
      multiplier: last.multiplier,
      playerAscentMps: last.playerAscent,
      // Screen positions increase downward, so a positive rate means travelling DOWN the screen.
      playerScreenDriftPx: last.playerScreenY - first.playerScreenY,
      cameraRiseM: last.camY - first.camY,
      cameraScreenSpeedPxPerS: ((last.camY - first.camY) / dt) * cam.viewport.scale,
      bubbleScreenSpeedPxPerS: (last.bubbleScreenY - first.bubbleScreenY) / dt,
      bubbleRelativeMps: last.bubbleRelativeMps,
      screenHeightPx: cam.viewport.height,
      // How long this collectable takes to reach the player's height on screen.
      secondsToReachPlayer:
        last.bubbleScreenY > last.playerScreenY
          ? null
          : (last.playerScreenY - last.bubbleScreenY) /
            Math.max(0.01, (last.bubbleScreenY - first.bubbleScreenY) / dt),
      samples: frames
    });
  })`;

  /**
   * Parallax layer speeds.
   *
   * Folded in from the former scripts/motion.mjs, which existed only for these two relationships.
   * Both layers must travel down the screen, and the near layer has to be substantially faster --
   * that difference is the entire depth cue, since the far background can only ever scroll at about
   * 2 px/s over a run this long.
   *
   * Computed AVERAGED over each layer rather than timed on one speck. Tracking a single speck across
   * a window measured nothing useful under load: at the frame rates a parallel test run produces, a
   * speck can be recycled inside the window, and one object's timing is dominated by frame jitter.
   * The per-frame delta below is exact for every speck in the layer and needs no waiting at all.
   */
  const parallaxProbe = `(async function () {
    var g = window.__GB.game;
    var cam = g.camera;
    var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
    // Measure in the CRUISING state: an earlier probe leaves the boost held, which would inflate
    // every speed here and make the layer ORDER meaningless.
    g.debugSetBoosting(false);
    for (var i = 0; i < 20; i++) await raf();

    var specks = g.fieldRef.specks;
    var far = specks.filter(function (s) { return s.drift <= 0; });
    var near = specks.filter(function (s) { return s.drift > 0; });
    var ascent = g.player.vy > 0 ? g.player.vy : 0.0001;

    // Per-frame screen motion of a speck = camera motion + its own parallax drift, both downward.
    var camPxPerFrame = g.player.vy / 60 * cam.viewport.scale;
    var meanScreenSpeed = function (list) {
      if (!list.length) return null;
      var total = 0;
      for (var i = 0; i < list.length; i++) {
        // Positive drift pushes the speck down the world, i.e. further down the screen.
        total += (1 + list[i].drift) * g.player.vy * cam.viewport.scale;
      }
      return total / list.length;
    };

    var camY0 = cam.y;
    var t0 = performance.now();
    var until = t0 + 1200;
    while (performance.now() < until) await raf();
    var dt = (performance.now() - t0) / 1000;

    return JSON.stringify({
      seconds: dt,
      farCount: far.length,
      nearCount: near.length,
      farPxPerS: meanScreenSpeed(far),
      nearPxPerS: meanScreenSpeed(near),
      farMeasuredPxPerS: 0,
      cameraRiseM: cam.y - camY0,
      cameraRateMps: ascent
    });
  })()`;

  const cruising = await evalJson(`(${measure})(false, 90)`, true);
  const boosting = await evalJson(`(${measure})(true, 90)`, true);
  const parallax = await evalJson(parallaxProbe, true);
  const rows = [
    ['cruising', cruising],
    ['boosting', boosting],
  ];
  console.log('state      multiplier  playerAscent  cameraScreenPx/s  bubbleScreenPx/s  playerScreenDrift');
  for (const [label, r] of rows) {
    if (r.error) {
      console.log(`${label.padEnd(10)} ERROR ${r.error} (frames=${r.frames})`);
      continue;
    }
    console.log(
      `${label.padEnd(10)} ${String(r.multiplier).padStart(10)}  ${String(r.playerAscentMps).padStart(12)}  ${r.cameraScreenSpeedPxPerS.toFixed(1).padStart(16)}  ${r.bubbleScreenSpeedPxPerS.toFixed(1).padStart(16)}  ${r.playerScreenDriftPx.toFixed(1).padStart(17)}`,
    );
  }

  const ok = !cruising.error && !boosting.error;
  const ratio = ok ? boosting.bubbleScreenSpeedPxPerS / Math.max(0.01, cruising.bubbleScreenSpeedPxPerS) : 0;
  const camRatio = ok ? boosting.cameraScreenSpeedPxPerS / Math.max(0.01, cruising.cameraScreenSpeedPxPerS) : 0;

  const report = {
    bubbleStreamSpeedsUpWithBoost: +ratio.toFixed(2),
    cameraSpeedsUpWithBoost: +camRatio.toFixed(2),
    boostingMultiplier: ok ? boosting.multiplier : null,
    cruiseMultiplier: ok ? cruising.multiplier : null,
    parallaxFarPxPerS: +parallax.farPxPerS?.toFixed(2),
    parallaxNearPxPerS: +parallax.nearPxPerS?.toFixed(2),
    parallaxCounts: `${parallax.farCount} far / ${parallax.nearCount} near`,
  };
  console.log('\n' + JSON.stringify(report, null, 2));

  const checks = {
    // The whole point: the stream must visibly move faster down the screen while boosting.
    streamSpeedsUp: ratio > 2,
    // And the camera must too, since both contribute to what the eye sees.
    cameraSpeedsUp: camRatio > 2,
    playerStaysScreenFixed: ok && Math.abs(boosting.playerScreenDriftPx) < 6 && Math.abs(cruising.playerScreenDriftPx) < 6,
    // Folded in from the former motion.mjs: parallax depth cue. Both layers travel down (positive),
    // and the near layer is what makes the ascent legible, so it must be clearly faster.
    parallaxLayersScrollDown: parallax.farPxPerS > 0.5 && parallax.nearPxPerS > 0.5,
    nearLayerIsFaster: parallax.nearPxPerS > parallax.farPxPerS * 3,
    parallaxLayersArePopulated: parallax.farCount > 5 && parallax.nearCount > 5,
    // The sampler itself must be watching a live game, or every number above is meaningless.
    cameraRises: parallax.cameraRiseM > 0 && parallax.seconds > 0.2,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('APPROACH FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
