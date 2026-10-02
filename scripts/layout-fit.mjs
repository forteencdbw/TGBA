// Checks that the game is framed correctly at every screen size, not just the one it was built on.
//
// The reported problem was a 2560x1440 desktop window: the play area was stretched to the full width, so
// the world zoomed 7x, the HUD grew until the readouts collided, and the skill button was pushed off the
// screen. Each of those is a number, so each is asserted rather than eyeballed.
//
// Usage: node scripts/layout-fit.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9383;
const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) process.exit(2);

const profile = mkdtempSync(join(tmpdir(), 'gb-layout-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=800,900', 'about:blank',
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

const evalJson = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
  return JSON.parse(r.result.value);
};

/**
 * The sizes worth checking: the one that was reported broken, a laptop, a small window, and two phones.
 *
 * Every value comes from the game's OWN layout functions, so this measures the shipping code path rather
 * than a restatement of its arithmetic.
 */
const result = await evalJson(
  `(function () {
     const cv = window.__GB.layout.computeViewport;
     const ds = window.__GB.layout.designScale;
     const sizes = [
       ['desktop-2560x1440-reported', 2560, 1440],
       ['desktop-1920x1080', 1920, 1080],
       ['laptop-1440x900', 1440, 900],
       ['small-window-900x700', 900, 700],
       ['phone-390x780', 390, 780],
       ['phone-412x915', 412, 915]
     ];
     const rows = sizes.map(function (entry) {
       const name = entry[0], w = entry[1], h = entry[2];
       const v = cv(w, h);
       const hud = ds(w, h);
       // The bubble's drawn radius in SCREEN pixels: the player's radius fraction times the lane, in metres,
       // times the world scale.
       const playerRadiusPx = v.laneWidthMeters * 0.0425 * v.scale;
       return {
         name: name,
         scale: +v.scale.toFixed(2),
         laneWidthPx: Math.round(v.laneWidthPx),
         left: Math.round(v.left),
         right: Math.round(v.left + v.laneWidthPx),
         canvasWidth: w,
         visibleDepthMeters: Math.round(v.visibleDepthMeters),
         hudScale: +hud.toFixed(2),
         headlinePx: Math.round(40 * hud),
         playerRadiusPx: +playerRadiusPx.toFixed(1),
         // Would the skill button be on screen? It sits at the lane's right edge.
         skillButtonX: Math.round(v.left + v.laneWidthPx - 38 * hud - 12 * hud)
       };
     });
     return JSON.stringify(rows);
   })()`,
);

console.log(
  'screen'.padEnd(30) + 'scale  lanePx   lane[left..right]  viewDepth  hud   headline  playerR  skillBtnX',
);
for (const r of result) {
  console.log(
    r.name.padEnd(30) +
    String(r.scale).padStart(5) +
    String(r.laneWidthPx).padStart(8) +
    ('[' + r.left + '..' + r.right + ']').padStart(19) +
    (r.visibleDepthMeters + 'm').padStart(11) +
    String(r.hudScale).padStart(6) +
    (r.headlinePx + 'px').padStart(10) +
    (r.playerRadiusPx + 'px').padStart(9) +
    String(r.skillButtonX).padStart(11),
  );
}

/**
 * The invariants. Each one corresponds to something visibly wrong in the reported screenshot.
 */
const phones = result.filter((r) => r.name.startsWith('phone'));
const desktops = result.filter((r) => r.name.startsWith('desktop') || r.name.startsWith('laptop'));
const checks = {
  // The skill button must be INSIDE the canvas on every size. It was off-screen at 2021px on a 2560px
  // window, which is a control the player simply does not have.
  skillButtonOnScreenEverywhere: result.every((r) => r.skillButtonX > 0 && r.skillButtonX < r.canvasWidth),
  // The lane must never be wider than the canvas, and must be centred.
  laneFitsTheCanvas: result.every((r) => r.laneWidthPx <= r.canvasWidth + 1),
  laneIsCentred: result.every((r) => Math.abs(r.left - (r.canvasWidth - r.laneWidthPx) / 2) <= 1),
  // HUD text must stay a sensible size. It was 283px on the reported window, which filled the screen and
  // collided with the other readouts.
  hudTextStaysReasonable: result.every((r) => r.headlinePx >= 20 && r.headlinePx <= 64),
  // The bubble must be big enough to see and steer, and must not vary wildly between the two kinds of
  // screen the game runs on. Measured: 16.6px on a phone against 38px at a 900px lane cap, where the
  // uncapped desktop was 109px -- seven times the phone's, which is what made the game look wrong there.
  playerStaysVisible: result.every((r) => r.playerRadiusPx >= 10 && r.playerRadiusPx <= 46),
  playerSizeIsConsistentAcrossScreens: (function () {
    const radii = result.map((r) => r.playerRadiusPx);
    return Math.max.apply(null, radii) / Math.min.apply(null, radii) <= 2.6;
  })(),
  // The water on screen must stay comparable across sizes: this is what keeps hazards at a readable size
  // and stops a wide window from zooming out into a soup of equal-sized objects.
  depthViewIsComparable: (function () {
    const depths = result.map((r) => r.visibleDepthMeters);
    const lo = Math.min.apply(null, depths);
    const hi = Math.max.apply(null, depths);
    return hi / lo <= 3.2;
  })(),
  // A phone must still fill its width -- the desktop cap must not letterbox the target device.
  phonesStillFillTheirWidth: phones.every((r) => Math.abs(r.laneWidthPx - r.canvasWidth) <= 1),
  // And the desktop must NOT fill its width, or the fix did nothing.
  desktopsAreCapped: desktops.every((r) => r.laneWidthPx < r.canvasWidth),
};
console.log('\nCHECKS: ' + JSON.stringify(checks, null, 1));

chrome.kill();
await sleep(200);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
