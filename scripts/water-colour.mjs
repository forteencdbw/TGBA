// Checks that the water colour cannot produce an illegal channel value, at ANY depth.
//
// Calls the game's real `waterColour` through the hook rather than re-deriving the arithmetic: an earlier
// probe copied the formula, so it kept reporting the overflow after the bug was fixed.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9382;
const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) process.exit(2);

const profile = mkdtempSync(join(tmpdir(), 'gb-water-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=500,780', 'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const page = (await res.json()).find((t) => t.type === 'page');
    if (page?.webSocketDebuggerUrl) { ws = page.webSocketDebuggerUrl; break; }
  } catch { /* not up */ }
  await sleep(250);
}
const sock = new WebSocket(ws);
let id = 1;
const pending = new Map();
await new Promise((r) => sock.addEventListener('open', r));
sock.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) =>
  new Promise((r) => { const i = id++; pending.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: URL_ARG });
for (let i = 0; i < 80; i++) {
  const r = await send('Runtime.evaluate', { expression: '!!(window.__GB && window.__GB.game)', returnByValue: true });
  if (r.result.value) break;
  await sleep(250);
}
for (let i = 0; i < 60; i++) {
  const r = await send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
  if (r.result.value === 'playing') break;
  await sleep(200);
}

const evalJson = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
  return JSON.parse(r.result.value);
};

// Sweep every world height and every depth, including the out-of-range values a free-moving player can
// produce: depth goes negative when the bubble is above the level's top.
const sweep = await evalJson(
  `(function () {
     const g = window.__GB.game;
     const bad = [];
     let checked = 0;
     const depths = [2000, 1500, 1000, 500, 100, 55, 20, 0, -50, -200, -1000];
     for (const depth of depths) {
       for (let worldY = -300; worldY <= 1900; worldY += 10) {
         const packed = g.waterColourAt(worldY, depth);
         checked++;
         const r = (packed >> 16) & 0xff;
         const gg = (packed >> 8) & 0xff;
         const b = packed & 0xff;
         // A legal colour must be a non-negative integer under 2^24, with every channel in 0..255.
         const illegal = !Number.isInteger(packed) || packed < 0 || packed > 0xffffff;
         // And it must be a shade of BLUE water: blue highest, red lowest.
         const notWater = !(b >= r);
         if (illegal || notWater) bad.push({ depth, worldY, packed, r, g: gg, b, illegal, notWater });
       }
     }
     return JSON.stringify({
       checked,
       badCount: bad.length,
       sample: bad.slice(0, 6),
       // The reported symptom, checked directly: at the top of the level the water must be pale BLUE,
       // never red.
       atSurface: (function () {
         const p = g.waterColourAt(1500, 0);
         return { packed: p, r: (p >> 16) & 0xff, g: (p >> 8) & 0xff, b: p & 0xff };
       })(),
       aboveTop: (function () {
         const p = g.waterColourAt(1900, -400);
         return { packed: p, r: (p >> 16) & 0xff, g: (p >> 8) & 0xff, b: p & 0xff };
       })()
     });
   })()`,
);

console.log('checked ' + sweep.checked + ' (worldY, depth) combinations through the real function');
console.log('illegal or non-water results: ' + sweep.badCount);
if (sweep.sample.length) console.log('  samples: ' + JSON.stringify(sweep.sample));
console.log('at the surface (1500, depth 0):  #' + sweep.atSurface.packed.toString(16).padStart(6, '0') + '  ' + JSON.stringify(sweep.atSurface));
console.log('above the top (1900, depth -400): #' + sweep.aboveTop.packed.toString(16).padStart(6, '0') + '  ' + JSON.stringify(sweep.aboveTop));

const checks = {
  noIllegalColours: sweep.badCount === 0,
  surfaceIsPaleBlueNotRed: sweep.atSurface.b >= sweep.atSurface.r,
  outOfRangeIsStillAWaterColour: sweep.aboveTop.b >= sweep.aboveTop.r,
};
console.log('\nCHECKS: ' + JSON.stringify(checks));

chrome.kill();
await sleep(200);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
