// Headless smoke check driven over the Chrome DevTools Protocol.
//
// Loads the game in a real (headless, SwiftShader) Chrome, waits real wall-clock time, and
// reports the page's own diagnostics plus every console error and uncaught exception.
// This is the only way to answer "does it actually run and advance" without a human looking.
//
// Usage: node scripts/smoke.mjs [url] [waitMs]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const WAIT_MS = Number(process.argv[3] ?? 4000);
const PORT = 9333;

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));

if (!chromePath) {
  console.error('SMOKE: no Chrome/Edge binary found');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'gb-smoke-'));

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
    '--window-size=600,1000',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error('devtools target never appeared');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
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
    ws.addEventListener('error', (e) => reject(new Error('ws error: ' + e.message)));
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

let exitCode = 1;
try {
  const wsUrl = await findTarget();
  const cdp = await connect(wsUrl);

  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });

  // Give the engine real wall-clock time to boot, resize and advance.
  await sleep(WAIT_MS);

  const probe = `(() => {
    const gb = window.__GB;
    if (!gb) return JSON.stringify({ ready: false });
    const d = gb.game.diagnostics;
    const canvas = document.querySelector('canvas');
    return JSON.stringify({
      ready: true,
      frames: d.frames,
      elapsed: +d.elapsed.toFixed(3),
      intro: +d.intro.toFixed(3),
      lastDelta: +d.lastDelta.toFixed(4),
      nominalSeconds: +d.nominalSeconds.toFixed(2),
      level: d.level,
      ascentSpeed: +d.ascentSpeed.toFixed(3),
      bannerAlpha: +d.bannerAlpha.toFixed(3),
      bannerSeen: d.bannerSeen,
      phase: d.phase,
      volume: +d.volume.toFixed(3),
      hitsSurvived: +d.hitsSurvived.toFixed(2),
      bubbles: d.bubbles,
      absorbed: d.stats.absorbed,
      stats: d.stats,
      depth: +gb.player.depth.toFixed(2),
      y: +gb.player.y.toFixed(3),
      x: +gb.player.x.toFixed(2),
      vy: +gb.player.vy.toFixed(3),
      vx: +gb.player.vx.toFixed(3),
      canvas: canvas ? canvas.width + 'x' + canvas.height : null,
      dpr: window.devicePixelRatio,
      webgl: (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })(),
    });
  })()`;

  const first = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true });
  await sleep(1200);
  const second = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true });

  // --- Horizontal input path -------------------------------------------------
  // Must run BEFORE the finish-path test: finishing resets the player and restarts the ~1.6s
  // birth intro, during which `step` deliberately skips physics. Measuring input inside that
  // window reports vx === 0 for a perfectly healthy control path.
  const key = (type, code, keyCode, keyName) =>
    cdp.send('Input.dispatchKeyEvent', {
      type,
      code,
      key: keyName,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    });

  const readMotion = async () => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `JSON.stringify({
        axisX: window.__GB.input.axisX,
        axisY: window.__GB.input.axisY,
        vx: +window.__GB.player.vx.toFixed(5),
        x: +window.__GB.player.x.toFixed(4),
        intro: +window.__GB.game.diagnostics.intro.toFixed(3),
        frames: window.__GB.game.diagnostics.frames,
        updates: window.__GB.player.debugUpdates,
        dt: window.__GB.player.debugLastDt,
        accel: window.__GB.tuning.lateralAccel,
        damping: window.__GB.tuning.lateralDamping,
        cruiseCap: window.__GB.tuning.cruiseSpeedCap,
        boostSteerFactor: window.__GB.tuning.boostSteerFactor,
        stopSpeed: window.__GB.tuning.lateralStopSpeed,
      })`,
      returnByValue: true,
    });
    return JSON.parse(r.result.value);
  };

  // Wait out the birth intro so nothing else is mutating the player.
  for (let i = 0; i < 20; i++) {
    const s = await readMotion();
    if (s.intro <= 0) break;
    await sleep(200);
  }

  // Baseline acceleration with only the lateral key held.
  const inputStart = await readMotion();
  await key('keyDown', 'KeyD', 68, 'd');
  await sleep(250);
  const inputHeld = await readMotion();
  await sleep(900);
  const inputMoved = await readMotion();
  await key('keyUp', 'KeyD', 68, 'd');
  await sleep(600);
  const inputReleased = await readMotion();

  // Same lateral input, but ALSO holding accelerate. Steering authority must visibly drop, so
  // the speed built over the same interval has to be clearly lower than the run above.
  await cdp.send('Runtime.evaluate', { expression: 'window.__GB.player.reset()' });
  await sleep(100);
  const boostStart = await readMotion();
  await key('keyDown', 'KeyD', 68, 'd');
  await key('keyDown', 'Space', 32, ' ');
  await sleep(250);
  const boostHeld = await readMotion();
  await sleep(900);
  const boostMoved = await readMotion();
  await key('keyUp', 'Space', 32, ' ');
  await key('keyUp', 'KeyD', 68, 'd');
  await sleep(400);

  // Exercise the finish -> banner -> burst -> restart path without waiting out a full run.
  // The surface trigger starts a 1.5s burst, so the probe waits past it rather than assuming the
  // reset is immediate.
  await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.teleportToSurface()' });
  await sleep(200);
  const atSurface = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true });
  await sleep(2600);
  const afterReset = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true });

  const a = JSON.parse(first.result.value);
  const b = JSON.parse(second.result.value);
  const surf = JSON.parse(atSurface.result.value);
  const reset = JSON.parse(afterReset.result.value);

  const consoleErrors = cdp.events
    .filter((e) => e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(e.params.type))
    .map((e) => e.params.type + ': ' + e.params.args.map((x) => x.value ?? x.description ?? x.type).join(' '));
  const exceptions = cdp.events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text);
  const logErrors = cdp.events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => 'log: ' + e.params.entry.text);

  const report = {
    url: URL_ARG,
    started: a.ready,
    canvas: b.canvas ?? a.canvas,
    webgl2: b.webgl,
    nominalSeconds: b.nominalSeconds,
    level: b.level,
    before: a,
    after: b,
    advanced: a.ready && b.ready ? { frames: b.frames - a.frames, elapsedS: +(b.elapsed - a.elapsed).toFixed(3), yGain: +(b.y - a.y).toFixed(3) } : null,
    finishPath: { atSurface: surf, afterReset: reset },
    horizontalInput: {
      start: inputStart,
      held: inputHeld,
      moved: inputMoved,
      released: inputReleased,
      axisResponded: inputHeld.axisX === 1,
      // Player x is a FRACTION of the play-area width, so this is in lane-widths, not metres.
      displacementLaneWidths: +(inputMoved.x - inputStart.x).toFixed(3),
    },
    boostSteering: {
      start: boostStart,
      held: boostHeld,
      moved: boostMoved,
      axisYWhileBoosting: boostMoved.axisY,
      // Same elapsed input, so these two speeds are directly comparable.
      cruiseSpeedAfterInput: inputMoved.vx,
      boostSpeedAfterInput: boostMoved.vx,
      authorityRatio: inputMoved.vx > 0 ? +(boostMoved.vx / inputMoved.vx).toFixed(3) : null,
    },
    consoleErrors,
    exceptions,
    logErrors,
  };

  console.log(JSON.stringify(report, null, 2));

  const animating = a.ready && b.ready && b.frames > a.frames && b.elapsed > a.elapsed;
  // The surface banner is transient, so the game reports whether it was ever shown rather than
  // hoping a sample lands inside its lifetime.
  // 500 is DEPTH_TOTAL from src/config.ts; if that changes, this threshold moves with it.
  const bannerShown = surf.bannerSeen === true || reset.bannerSeen === true;
  // Restarting puts the player back at the seabed, in a fresh birth intro, and clears the run stats.
  const resetWorked = reset.depth > 495 && reset.intro > 0 && reset.elapsed < 3 && reset.stats.absorbed === 0;
  const displacement = inputMoved.x - inputStart.x;
  // Threshold is deliberately modest: keyboard steering is a fixed, fairly slow speed (one lane
  // crossing per KEYBOARD_CROSSING_SECONDS), so it covers ~0.15 lane-widths in the sample window.
  // An absolute value tuned to a faster model is how this assertion went wrong before.
  const inputWorks =
    inputHeld.axisX === 1 &&
    inputHeld.vx > 0 &&
    displacement > 0.05 &&
    inputReleased.axisX === 0 &&
    inputReleased.vx < inputMoved.vx;
  // Boosting must measurably reduce steering authority with the same key held for the same time.
  // The keyboard scales its fixed speed by the boost factor, so the ratio should track it.
  const boostSteersWorse = boostMoved.axisY === 1 && boostMoved.vx < inputMoved.vx * 0.9;
  const checks = {
    animating,
    inputWorks,
    boostSteersWorse,
    bannerShown,
    resetWorked,
    noExceptions: exceptions.length === 0,
    // The level declares its length and curve; the run time is what those add up to, so there is no
    // target to compare against any more. Assert instead that the derived time is plausible for a
    // level and that the level states its pacing in screen-heights.
    runTimeIsPlausibleAsALevel: b.nominalSeconds > 30 && b.nominalSeconds < 400,
    levelPacingIsStated: b.level.screenHeights > 1.5 && b.level.secondsPerScreen > 0,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));

  exitCode = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (err) {
  console.error('SMOKE FAILED:', err.message);
  exitCode = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(exitCode);
}
