// Measures whether the game actually holds frame rate, at the sizes it ships at.
//
// Written for D7's "砍 (cut), not add" pass. By this point the scene carries a 1500m level, ~32
// collectables, 130 parallax specks, up to 44 fish, six hazard kinds and a synthesised audio graph,
// and the whole visual layer is redrawn procedurally every frame. That is a lot of geometry for one
// draw-call-per-Graphics design, and none of it had been measured under load.
//
// Reports frame time as percentiles rather than an average, because a hitch is what a player feels:
// an average hides a stall.
//
// Usage: node scripts/performance.mjs [url] [width] [height]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = Number(process.argv[3] ?? 390);
const H = Number(process.argv[4] ?? 844);
const PORT = 9376;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-perf-'));
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
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Page.navigate', { url: URL_ARG });

  let booted = false;
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.__GB && window.__GB.game)', returnByValue: true });
    if (r.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) throw new Error('the game never booted');
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(200);
  }

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
    return JSON.parse(r.result.value);
  };

  // Measure frames in-page. `requestAnimationFrame` is capped by the display, so this reports what the
  // compositor actually delivered, which is the thing that decides whether the game feels smooth.
  const measure = (seconds) =>
    `(async function () {
       const g = window.__GB.game;
       const frames = [];
       let last = performance.now();
       const t0 = last;
       while (performance.now() - t0 < ${seconds * 1000}) {
         await new Promise((r) => requestAnimationFrame(() => r()));
         const now = performance.now();
         frames.push(now - last);
         last = now;
       }
       frames.sort((a, b) => a - b);
       const at = (p) => frames[Math.min(frames.length - 1, Math.floor(frames.length * p))];
       const d = g.diagnostics;
       return JSON.stringify({
         frames: frames.length,
         medianMs: +at(0.5).toFixed(2),
         p90Ms: +at(0.9).toFixed(2),
         p99Ms: +at(0.99).toFixed(2),
         worstMs: +frames[frames.length - 1].toFixed(1),
         fps: +(1000 / at(0.5)).toFixed(1),
         counts: {
           bubbles: g.fieldRef.bubbles.length,
           specks: g.fieldRef.specks.length,
           hazards: g.hazardsRef.hazards.length,
           fish: d.emergence.fishCount
         },
         report: d.report
       });
     })()`;

  // A calm stretch, then the worst case the design can produce: the endgame burst plus an active
  // swarm, which is exactly when a player will notice a stall.
  console.log(`measuring at ${W}x${H} (mobile emulation, software rasteriser)\n`);
  const calm = await evalJson(measure(4), true);
  console.log(`calm:      ${String(calm.fps).padStart(5)} fps   median ${calm.medianMs}ms  p90 ${calm.p90Ms}ms  p99 ${calm.p99Ms}ms  worst ${calm.worstMs}ms`);
  console.log(`           bubbles ${calm.counts.bubbles}  specks ${calm.counts.specks}  hazards ${calm.counts.hazards}`);

  // Load it up: jump to the endgame event and let the swarm build.
  await evalJson(
    `(async function () {
       const g = window.__GB.game;
       // Drive the player near the surface so the 爆发 event fires, and give it a big volume so the
       // burst scales to its maximum.
       g.player.volume = 3.2;
       g.player.y = 240;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       for (let i = 0; i < 30; i++) await raf();
       return JSON.stringify({ ok: true });
     })()`,
    true,
  );
  const loaded = await evalJson(measure(4), true);
  console.log(`endgame:   ${String(loaded.fps).padStart(5)} fps   median ${loaded.medianMs}ms  p90 ${loaded.p90Ms}ms  p99 ${loaded.p99Ms}ms  worst ${loaded.worstMs}ms`);
  console.log(`           bubbles ${loaded.counts.bubbles}  specks ${loaded.counts.specks}  hazards ${loaded.counts.hazards}  fish ${loaded.counts.fish}`);
  console.log(`           events fired: ${JSON.stringify(loaded.report.events ?? null)}`);

  // The renderer's own view, which is what a mobile GPU budget is actually spent on.
  const report = await evalJson('JSON.stringify(window.__GB.frame())');
  console.log(`\nrenderer: ${JSON.stringify(report)}`);

  /**
   * BASELINE, from this machine's SOFTWARE rasteriser.
   *
   * These numbers are not a performance verdict and must not be read as one. Headless Chrome here
   * renders through SwiftShader with no GPU, so it is dominated by rasterisation and says nothing
   * about a phone (which is orders of magnitude faster at exactly that). Real-device verification
   * needs real hardware.
   *
   * What it IS good for: measuring a CHANGE. The same machine gives the same numbers, so a regression
   * -- an unbounded entity count, a per-frame allocation in a hot loop, geometry that grew without
   * bound -- shows up as a drop here.
   *
   * Measured 2026 on this box at 390x844, canvas buffer 780x1688:
   *   calm     ~8.6 fps   median ~117ms   p99 ~150ms
   *   endgame  ~8.7 fps   median ~114ms   p99 ~155ms
   */
  const BASELINE = { calmFps: 6.0, loadedFps: 6.0, worstMs: 400 };

  const checks = {
    // Well below the baseline, so this catches a collapse rather than normal variation.
    calmNotCollapsed: calm.fps >= BASELINE.calmFps,
    loadedNotCollapsed: loaded.fps >= BASELINE.loadedFps,
    // A frame of over 400ms has stopped being a game. The design's own ceiling is the entity cap.
    noPathologicalStalls: loaded.worstMs < BASELINE.worstMs,
    // The scene is actually loaded, or the numbers above mean nothing.
    sceneIsPopulated: loaded.counts.bubbles > 10 && loaded.counts.specks > 50,
    // The design's guard must hold under load: unbounded fish would be the crash, not the frame rate.
    entityCountsAreBounded: loaded.counts.hazards < 80 && loaded.counts.specks < 200,
  };
  console.log(
    `\nbaseline on this machine (software rasteriser, NOT a device measurement): calm >= ${BASELINE.calmFps} fps, loaded >= ${BASELINE.loadedFps} fps, worst < ${BASELINE.worstMs}ms`,
  );
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('PERFORMANCE FAILED: ' + e.message);
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
