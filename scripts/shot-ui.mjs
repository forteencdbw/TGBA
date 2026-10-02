// Opens the settings panel and leaves it open, so a screenshot shows the panel rather than the game.
//
// `probe-layout.mjs` screenshots whatever state the page is in, which is the menu on boot. This one drives
// the game into the state worth looking at and then stops.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = Number(process.argv[3] ?? 390);
const H = Number(process.argv[4] ?? 844);
const OUT = process.argv[5] ?? 'ui-panel.png';
const MODE = process.argv[6] ?? 'panel';
const PORT = 9393;
const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) process.exit(2);

const profile = mkdtempSync(join(tmpdir(), 'gb-shot-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`, 'about:blank',
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

const evalJson = async (expr, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
  return JSON.parse(r.result.value);
};

const state = await evalJson(
  `(async function () {
     const g = window.__GB.game;
     const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
     const tap = async function (x, y) { g.handlePointerDown(900, x, y); await raf(); g.handlePointerUp(900); await raf(); };
     const menuGeo = g.menuRef.geometry;
     await tap(menuGeo.button.x + menuGeo.button.w / 2, menuGeo.button.y + menuGeo.button.h / 2);
     for (let i = 0; i < 300 && g.diagnostics.phase !== 'playing'; i++) await raf();
     for (let i = 0; i < 120; i++) await raf();
     if ('${MODE}' === 'panel') {
       const geo = g.settingsRef.geometry;
       await tap(geo.gear.x, geo.gear.y);
       for (let i = 0; i < 6; i++) await raf();
     }
     return JSON.stringify({ phase: g.diagnostics.phase, open: g.settingsRef.isOpen, scroll: +g.diagnostics.level.scrolled.toFixed(1) });
   })()`,
  true,
);
console.log('state for the screenshot: ' + JSON.stringify(state));

const shot = await send('Page.captureScreenshot', { format: 'png' });
// `send` already unwraps the CDP envelope, so this is `{ data }` rather than `{ result: { data } }`.
writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
console.log('SCREENSHOT: ' + OUT);

chrome.kill();
await sleep(200);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
process.exit(0);
