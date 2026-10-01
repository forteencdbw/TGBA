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
  await sleep(4000);

  const evalJson = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
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

  const before = await evalJson('JSON.stringify({ x: window.__GB.player.x, throttle: window.__GB.input.touchThrottle })');

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
  await sleep(500);
  const moved = await evalJson('JSON.stringify({ x: window.__GB.player.x })');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  const released = await evalJson('JSON.stringify({ x: window.__GB.player.x, ...window.__GB.game.touchState })');

  // Throttle slider: use the geometry the game actually laid out, rather than re-deriving it.
  const geo = await evalJson('JSON.stringify(window.__GB.game.touchGeometry)');
  const sliderX = Math.round(geo.x);
  const sliderMidY = Math.round((geo.top + geo.bottom) / 2);

  // Isolation probe: bypass the event system entirely and drive the value function directly.
  // This separates "the event never arrived" from "the value logic is wrong".
  const directDrive = await evalJson(
    `JSON.stringify((() => {
      const gb = window.__GB.game;
      const g = gb.touchGeometry;
      const atTop = gb.debugSetThrottleAtY(g.top + 2);
      const atMid = gb.debugSetThrottleAtY((g.top + g.bottom) / 2);
      const atBottom = gb.debugSetThrottleAtY(g.bottom - 2);
      gb.debugSetThrottleAtY((g.top + g.bottom) / 2);
      return { atTop, atMid, atBottom };
    })())`,
  );

  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: sliderX, y: sliderMidY, id: 2 }],
  });
  await sleep(120);
  const throttleNeutral = await evalJson('JSON.stringify({ ...window.__GB.game.touchState, inputThrottle: window.__GB.input.touchThrottle })');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: sliderX, y: Math.round(geo.top + 4), id: 2 }],
  });
  await sleep(250);
  const throttleUp = await evalJson(
    'JSON.stringify({ throttle: window.__GB.input.touchThrottle, axisY: window.__GB.input.axisY, vy: window.__GB.player.vy, zone: window.__GB.game.touchState.zone })',
  );
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(300);
  // Sticky: value must persist after the finger lifts.
  const throttleSticky = await evalJson('JSON.stringify({ throttle: window.__GB.input.touchThrottle, axisY: window.__GB.input.axisY })');

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
    throttle: { neutral: throttleNeutral, up: throttleUp, stickyAfterRelease: throttleSticky },
    sliderGeometry: geo,
    directDriveProbe: directDrive,
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
  const throttleWorks = throttleUp.throttle > 0.8 && throttleUp.axisY > 0.8 && throttleUp.vy > 0;
  const throttleIsSticky = Math.abs(throttleSticky.throttle - throttleUp.throttle) < 0.01;

  const checks = {
    canvasMatchesViewport: canvasMatches,
    playAreaFillsWidth: fillsWidth,
    touchDragSteers: dragWorks,
    throttleSliderWorks: throttleWorks,
    throttleIsSticky,
    noExceptions: exceptions2.length === 0,
  };
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
