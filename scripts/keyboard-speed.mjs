// Measures what the keyboard actually does, and reads back the tuning values the game resolved.
//
// Exists because "I set the scale to 0.05 and it is still too fast" is arithmetically impossible if
// the value is being applied at all: 5% of the calibrated acceleration should give a top speed of
// roughly 11 px/s, i.e. about 11 seconds to cross the screen. Either the value is not reaching the
// player, or the player is not the input being used.
//
// Usage: node scripts/keyboard-speed.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = 500;
const H = 780;
const PORT = 9360;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-kb-'));
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
    const r = await cdp.send('Runtime.evaluate', {
      expression: 'window.__GB.game.diagnostics.phase',
      returnByValue: true,
    });
    if (r.result.value === 'playing') break;
    await sleep(250);
  }

  const evalJson = async (expr) => JSON.parse((await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value);

  const tuning = await evalJson(
    'JSON.stringify({ keyboardSpeed: window.__GB.game.diagnostics.lateral.keyboardSpeed, laneWidthMeters: window.__GB.game.diagnostics.laneWidthMeters, scale: window.__GB.camera.viewport.scale })',
  );

  const probe = () => evalJson('JSON.stringify({ x: window.__GB.player.x, vx: window.__GB.player.vx, axisX: window.__GB.input.axisX, drag: window.__GB.input.dragTargetX })');

  const pxPerLane = tuning.laneWidthMeters * tuning.scale;
  const start = await probe();

  // Hold the right key for a fixed window and record the velocity reached.
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd', windowsVirtualKeyCode: 68, nativeVirtualKeyCode: 68 });
  await sleep(400);
  const held = await probe();
  await sleep(600);
  const heldLonger = await probe();
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd', windowsVirtualKeyCode: 68, nativeVirtualKeyCode: 68 });
  await sleep(300);
  const released = await probe();

  const report = {
    tuning,
    lanePixels: +pxPerLane.toFixed(0),
    start,
    held400ms: held,
    held1000ms: heldLonger,
    released,
    vxPixelsPerSecond: {
      at400ms: +(held.vx * pxPerLane).toFixed(1),
      at1000ms: +(heldLonger.vx * pxPerLane).toFixed(1),
    },
    laneCrossingSecondsAtTopSpeed: Math.abs(heldLonger.vx) > 1e-6 ? +(1 / Math.abs(heldLonger.vx)).toFixed(2) : null,
  };
  console.log(JSON.stringify(report, null, 2));

  const speedAt400 = held.vx * pxPerLane;
  const speedAt1000 = heldLonger.vx * pxPerLane;
  const checks = {
    keyProducesVelocity: held.vx > 0,
    // The point of the model: speed must NOT ramp with how long the key is held.
    speedIsConstant: Math.abs(speedAt1000 - speedAt400) < 1,
    // And it must match the configured crossing time exactly, since there is no ramp to account for.
    matchesConfiguredCrossing: Math.abs(report.laneCrossingSecondsAtTopSpeed - 7) < 0.2,
    stopsOnRelease: released.vx === 0,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('KEYBOARD PROBE FAILED: ' + e.message);
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
