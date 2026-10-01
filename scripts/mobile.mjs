// Mobile-device verification.
//
// Runs the game in a phone-sized viewport with TOUCH emulation and real touch events, then checks
// the three things that broke on a real handset:
//   1. the canvas is actually sized to the viewport (the "game in the top-left quarter" symptom);
//   2. the play area spans the full width, i.e. no letterbox bars;
//   3. dragging a finger on the water moves the bubble.
//
// Usage: node scripts/mobile.mjs [url] [width] [height]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = Number(process.argv[3] ?? 390);
const H = Number(process.argv[4] ?? 844);
const PORT = 9337;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-mobile-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`,
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
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error(`no devtools target on ${PORT}`);
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let nextId = 1;
    const pending = new Map();
    const events = [];
    ws.addEventListener('open', () =>
      resolve({
        events,
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => pending.set(id, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws: ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
        return;
      }
      if (msg.method) events.push(msg);
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await findTarget());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  // Emulate a handset: touch points, a mobile UA, and a device pixel ratio > 1.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: W,
    height: H,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp.send('Emulation.setUserAgentOverride', {
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
  });

  // Collect any exception the page throws, including during boot.
  const exceptions = [];
  cdp.events.push; // (events are read after the fact)

  await cdp.send('Page.navigate', { url: URL_ARG });

  /**
   * Wait for the game to exist, and then for the birth intro to finish.
   *
   * This replaced a fixed `sleep(4000)`. Under a parallel test run the four headless Chromes share
   * one CPU and everything takes roughly twice as long, so a fixed sleep that used to be generous
   * became a timeout -- and it failed as an obscure "cannot read properties of undefined", pointing
   * at the game rather than at the wait. Poll for the condition instead of guessing a duration.
   */
  const waitFor = async (expression, timeoutMs, label) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
      if (r.result?.value === true) return;
      await sleep(100);
    }
    throw new Error(`timed out after ${timeoutMs}ms waiting for ${label}`);
  };
  await waitFor('!!window.__GB', 20000, 'window.__GB (the game failed to boot)');
  await waitFor('window.__GB.game.diagnostics.phase === "playing"', 20000, 'the birth intro to finish');

  const evalJson = async (expr, { awaitPromise = false } = {}) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    }
    return JSON.parse(r.result.value);
  };

  const frameInfo = await evalJson('JSON.stringify(window.__GB && window.__GB.frame ? window.__GB.frame() : { missing: true })');

  const viewportInfo = await evalJson(`JSON.stringify((() => {
    const gb = window.__GB;
    if (!gb) return { missing: true };
    const vp = gb.game.camera.viewport;
    return {
      laneWidthPx: vp.laneWidthPx,
      canvasWidth: vp.width,
      left: vp.left,
      coveragePct: +(vp.laneWidthPx / vp.width * 100).toFixed(1),
      scale: +vp.scale.toFixed(4),
      laneWidthMeters: +vp.laneWidthMeters.toFixed(1),
      lateral: gb.game.diagnostics.lateral,
    };
  })())`);

  // Real touch drag across the water area: press left, move right, release.
  const dragStartX = Math.round(W * 0.2);
  const dragEndX = Math.round(W * 0.7);
  const dragY = Math.round(H * 0.5);

  const before = await evalJson('JSON.stringify({ x: window.__GB.player.x, boosting: window.__GB.input.touchBoosting })');

  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: dragStartX, y: dragY, id: 1 }],
  });
  await sleep(150);
  const during = await evalJson('JSON.stringify({ x: window.__GB.player.x, ...window.__GB.game.touchState })');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: dragEndX, y: dragY, id: 1 }],
  });
  // Poll until the bubble has actually travelled, rather than sleeping a fixed 500ms. Under a
  // parallel test run this browser gets a fraction of the CPU and runs far fewer simulation steps per
  // wall-clock second, so a fixed window that is generous alone becomes too short and the drag
  // assertion fails for a reason that has nothing to do with dragging.
  const moved = await (async () => {
    const deadline = Date.now() + 6000;
    let last = await evalJson('JSON.stringify({ x: window.__GB.player.x })');
    while (Date.now() < deadline) {
      if (last.x > before.x + 0.2) return last;
      await sleep(150);
      last = await evalJson('JSON.stringify({ x: window.__GB.player.x })');
    }
    return last;
  })();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  const released = await evalJson('JSON.stringify({ x: window.__GB.player.x, ...window.__GB.game.touchState })');

  // Accelerate BUTTON: use the geometry the game actually laid out, not a re-derived guess.
  const geo = await evalJson('JSON.stringify(window.__GB.game.touchGeometry)');
  const buttonX = Math.round(geo.x);
  const buttonY = Math.round(geo.y);

  // Baseline: cruising, no input. Read the configured ramp so the timing check can be derived
  // rather than pinned to a number the player is expected to tune.
  const settings = await evalJson(
    'JSON.stringify({ boostMultiplier: window.__GB.tuning.boostMultiplier, boostAccelSeconds: window.__GB.tuning.boostAccelSeconds })',
  );
  const beforeBoost = await evalJson(
    'JSON.stringify({ vy: window.__GB.player.vy, mult: window.__GB.player.speedMultiplier, boosting: window.__GB.input.touchBoosting })',
  );

  // Hold the button and sample IN PAGE. Doing the timing across CDP round-trips inflated the
  // apparent ramp duration, which made a correct acceleration curve look slow. Samples are taken on
  // requestAnimationFrame against performance.now() instead.
  const rampProbe =
    '(async function () {' +
    '  var g = window.__GB.game;' +
    '  var cfg = { target: window.__GB.tuning.boostMultiplier, tau: window.__GB.tuning.boostAccelSeconds };' +
    '  var before = g.player.speedMultiplier;' +
    '  var out = { cfg: cfg, before: before, zone: null, boosting: null, samples: [] };' +
    '  g.onPointerDownForTest(' + buttonX + ', ' + buttonY + ');' +
    '  out.zone = g.touchState.zone;' +
    '  out.boosting = g.touchState.boosting;' +
    '  var t0 = performance.now();' +
    // Sample for a fixed DURATION, not a fixed frame count. In a headless browser the frame rate is
    // low and variable, so a frame budget can end before the ramp has had time to move, which made
    // a correct accelerator look broken whenever boostAccelSeconds was tuned up.
    '  var until = t0 + Math.max(2500, cfg.tau * 6000);' +
    '  while (performance.now() < until) {' +
    '    await new Promise(function (r) { requestAnimationFrame(function () { r(); }); });' +
    '    out.samples.push([Math.round(performance.now() - t0), Math.round(g.player.speedMultiplier * 1000) / 1000]);' +
    '  }' +
    '  g.onPointerUpForTest();' +
    '  return JSON.stringify(out);' +
    '})()';

  const ramp = await evalJson(rampProbe, { awaitPromise: true });
  const early = ramp.samples.find(([t]) => t >= 140) ?? ramp.samples[0];
  const settled = ramp.samples[ramp.samples.length - 1];
  await sleep(900);
  const recovered = await evalJson('JSON.stringify({ mult: window.__GB.player.speedMultiplier })');

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const shotPath = join(process.cwd(), 'mobile.png');
  writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));

  const report = {
    url: URL_ARG,
    emulated: `${W}x${H} @3x, mobile, touch`,
    frame: frameInfo,
    viewport: viewportInfo,
    steering: {
      before,
      during,
      moved,
      released,
      displacementLaneWidths: +(moved.x - before.x).toFixed(3),
    },
    accelerate: {
      cfg: ramp.cfg,
      cruisingMultiplier: ramp.before,
      zone: ramp.zone,
      boosting: ramp.boosting,
      early: { tMs: early[0], mult: early[1] },
      settled: { tMs: settled[0], mult: settled[1] },
      recoveredMultiplier: recovered.mult,
      samples: ramp.samples,
    },
    buttonGeometry: geo,
    accelerateSettings: settings,
    screenshot: shotPath,
  };
  console.log(JSON.stringify(report, null, 2));

  const exceptions2 = cdp.events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text);
  void exceptions;

  // The canvas must be sized to the viewport in CSS pixels, with a backing store scaled by the
  // device pixel ratio. `screen` is the logical size the game lays out from.
  const canvasMatches =
    frameInfo.canvasCss === `${W}x${H}` &&
    frameInfo.screen === `${W}x${H}` &&
    frameInfo.canvasBuffer === `${W * frameInfo.resolution}x${H * frameInfo.resolution}`;
  const fillsWidth = viewportInfo.coveragePct !== undefined && viewportInfo.coveragePct >= 99.5;
  const dragWorks = moved.x > before.x + 0.15;

  // Expected progress of an exponential approach after `elapsed` seconds. Derived from the
  // configured multiplier and time constant, so this stays valid when the ramp is retuned.
  const rampProgress = (elapsedSeconds) =>
    ramp.cfg.tau <= 0 ? 1 : 1 - Math.exp(-elapsedSeconds / ramp.cfg.tau);
  const expectedAt = (ms) => 1 + (ramp.cfg.target - 1) * rampProgress(ms / 1000);
  const earlyExpected = expectedAt(early[0]);
  const settledExpected = expectedAt(settled[0]);

  const checks = {
    canvasMatchesViewport: canvasMatches,
    playAreaFillsWidth: fillsWidth,
    touchDragSteers: dragWorks,
    // A press inside the button must be routed to the boost zone and raise the ascent multiplier.
    buttonBoosts: ramp.zone === 'boost' && ramp.boosting === true && early[1] > 1.02,
    // It must ACCELERATE rather than jump: below the ceiling early, closer to it after settling.
    // The curve shape itself is asserted precisely by scripts/accel-ramp.mjs, which measures in a
    // controlled way; here the point is that the BUTTON is wired to a ramped ascent at all.
    boostAccelerates:
      early[1] < settled[1] - 0.1 &&
      early[1] < ramp.cfg.target &&
      earlyExpected > 1.05,
    // Releasing must not leave it pinned at the ceiling.
    boostRecovers: recovered.mult < settled[1] - 0.2,
    noExceptions: exceptions2.length === 0,
  };
  console.log(
    `ramp: target=${ramp.cfg.target} tau=${ramp.cfg.tau}s | early t=${early[0]}ms mult=${early[1]} (curve says ${earlyExpected.toFixed(3)}) | settled t=${settled[0]}ms mult=${settled[1]} (curve says ${settledExpected.toFixed(3)})`,
  );
  console.log('CHECKS: ' + JSON.stringify(checks));
  if (exceptions2.length) console.log('EXCEPTIONS: ' + JSON.stringify(exceptions2, null, 2));

  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (err) {
  console.error('MOBILE TEST FAILED:', err.message);
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
