// Measures relative motion: is the player fixed on screen while the world scrolls DOWN past it?
//
// Samples the player's screen position, a nearby collectable and a background speck over time, and
// reports the signed screen-Y velocity of each. World objects must move DOWN (screen y increasing)
// while the player's screen position stays put.
//
// Usage: node scripts/motion.mjs [url] [samples] [intervalMs]
//
// The interval matters: a bubble's fall speed is a multiple of the player's ascent, so near the
// seabed it crosses the screen in well under a second. At a 500ms interval the tracked bubble has
// already been recycled between samples and the measurement comes back null.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const SAMPLES = Number(process.argv[3] ?? 10);
const INTERVAL = Number(process.argv[4] ?? 150);
const W = 500;
const H = 780;
const PORT = 9341;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-motion-'));
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

  // Wait for the birth intro to finish so only the playing phase is sampled.
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', {
      expression: 'window.__GB ? JSON.stringify(window.__GB.game.diagnostics.phase) : ""',
      returnByValue: true,
    });
    if (r.result.value === '"playing"') break;
  }

  // Follow ONE collectable so its motion means something across samples.
  await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.debugTrackBubble()' });

  const samples = [];
  for (let i = 0; i < SAMPLES; i++) {
    const r = await cdp.send('Runtime.evaluate', {
      expression: 'JSON.stringify(window.__GB.game.debugMotion())',
      returnByValue: true,
    });
    samples.push(JSON.parse(r.result.value));
    await sleep(INTERVAL);
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const seconds = ((samples.length - 1) * INTERVAL) / 1000;

  const rate = (a, b) => (a === null || b === null ? null : +((b - a) / seconds).toFixed(2));

  const motion = {
    seconds,
    playerScreenYDriftPx: +(last.playerScreenY - first.playerScreenY).toFixed(2),
    playerScreenYRatio: last.playerScreenYRatio,
    cameraRiseMps: rate(first.cameraY, last.cameraY),
    depthGainM: +(first.depth - last.depth).toFixed(1),
    ascentSpeedMps: last.ascentSpeed,
    // Both layers are tracked by world position so the SAME object is compared across samples.
    // Identity matters: comparing `specks[0]` after recycling compares two different objects.
    farSpeckScreenYVelocityPxPerS: rate(first.speckScreenY, last.speckScreenY),
    nearSpeckScreenYVelocityPxPerS: rate(first.nearSpeckScreenY, last.nearSpeckScreenY),
    nearSpeckDrift: last.nearSpeckDrift,
    farSpeckDrift: last.farSpeckDrift,
    // The tracked bubble: same object across samples, so this is its true fall rate on screen.
    bubbleScreenSpeedPxPerS: rate(first.trackedBubbleScreenY, last.trackedBubbleScreenY),
    bubbleFallMps: last.nearestBubbleFallMps,
    trackedBubbleId: last.trackedBubbleId,
    samples: samples.map((s) => ({
      playerY: s.playerScreenY,
      camY: s.cameraY,
      depth: s.depth,
      farSpecY: s.speckScreenY,
      nearSpecY: s.nearSpeckScreenY,
      bubbleY: s.trackedBubbleScreenY,
    })),
  };

  console.log(JSON.stringify(motion, null, 2));

  const checks = {
    // On screen the player must not move: the camera tracks it exactly.
    playerIsScreenFixed: Math.abs(motion.playerScreenYDriftPx) < 2,
    // Everything else must travel DOWN the screen (increasing screen y).
    farSpecksScrollDown: motion.farSpeckScreenYVelocityPxPerS !== null && motion.farSpeckScreenYVelocityPxPerS > 1,
    // The near layer is a speed cue, so it must be substantially faster than the far one.
    nearLayerIsFaster:
      motion.nearSpeckScreenYVelocityPxPerS !== null &&
      motion.farSpeckScreenYVelocityPxPerS !== null &&
      motion.nearSpeckScreenYVelocityPxPerS > motion.farSpeckScreenYVelocityPxPerS * 3,
    // THE headline requirement: collectables must visibly stream DOWN past the player.
    bubblesStreamDown: motion.bubbleScreenSpeedPxPerS !== null && motion.bubbleScreenSpeedPxPerS > 25,
    cameraRises: motion.cameraRiseMps !== null && motion.cameraRiseMps > 0,
    depthDecreases: motion.depthGainM > 0,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));

  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('MOTION CHECK FAILED: ' + e.message);
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
