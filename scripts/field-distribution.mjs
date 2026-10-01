// Samples the vertical distribution of collectables over time.
//
// "The bubbles are all bunched at the top" is a claim about a distribution, so this counts them in
// vertical bands across the screen at several moments and prints the counts as a small bar chart.
//
// Usage: node scripts/field-distribution.mjs [url] [samples] [intervalMs]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const SAMPLES = Number(process.argv[3] ?? 6);
const INTERVAL = Number(process.argv[4] ?? 1500);
const PORT = 9352;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-dist-'));
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

  const evalJson = async (expr) => JSON.parse((await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value);

  // Wait for the game to exist at all. Sampling before that throws "cannot read properties of
  // undefined", which reads like a bug in the game rather than a race in the probe.
  let booted = false;
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: '!!window.__GB', returnByValue: true });
    if (r.result.value === true) {
      booted = true;
      break;
    }
    await sleep(250);
  }
  if (!booted) throw new Error('window.__GB never appeared');
  void evalJson;

  const BANDS = 8;
  // Hand-built expression string: nested template literals inside a template literal are a reliable
  // way to produce a syntax error that surfaces only as "undefined is not valid JSON".
  const sampleExpr =
    '(function () {' +
    '  var g = window.__GB.game;' +
    '  var cam = g.camera;' +
    '  var h = cam.viewport.height;' +
    `  var bands = new Array(${BANDS}).fill(0);` +
    '  var onScreen = 0;' +
    '  var bs = g.fieldRef.bubbles;' +
    '  for (var i = 0; i < bs.length; i++) {' +
    '    var y = cam.toScreenY(bs[i].y);' +
    '    if (y < 0 || y > h) continue;' +
    '    onScreen++;' +
    `    var band = Math.min(${BANDS} - 1, Math.floor((y / h) * ${BANDS}));` +
    '    if (band < 0) band = 0;' +
    '    bands[band]++;' +
    '  }' +
    '  return JSON.stringify({' +
    '    phase: g.diagnostics.phase,' +
    '    total: bs.length,' +
    '    onScreen: onScreen,' +
    '    bands: bands,' +
    '    camY: Math.round(cam.y),' +
    '    viewMin: Math.round(cam.y - h / 2 / cam.viewport.scale),' +
    '    viewMax: Math.round(cam.y + h / 2 / cam.viewport.scale),' +
    '    relY: bs.map(function (x) { return Math.round(cam.toScreenY(x.y)); }).sort(function (a, b) { return a - b; })' +
    '  });' +
    '})()';

  const sample = async () => {
    const r = await cdp.send('Runtime.evaluate', { expression: sampleExpr, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    }
    return JSON.parse(r.result.value);
  };

  const rows = [];
  for (let i = 0; i < SAMPLES; i++) {
    rows.push(await sample());
    await sleep(INTERVAL);
  }

  console.log('bands run top -> bottom of the screen; each row is one sample\n');
  for (const [i, r] of rows.entries()) {
    const bar = r.bands.map((c) => String(c).padStart(3)).join('|');
    console.log(`t=${(i * INTERVAL) / 1000}s  phase=${r.phase.padEnd(7)} onScreen=${String(r.onScreen).padStart(3)} total=${r.total}  ${bar}`);
  }

  // Screen-space y of every collectable, so "they exist but are not visible" is unambiguous.
  const lastRow = rows[rows.length - 1];
  console.log(`\ncamera y=${lastRow.camY}  view=${lastRow.viewMin}..${lastRow.viewMax}`);
  console.log('screen y of every collectable (- = above the top, >height = below the bottom):');
  console.log('  ' + lastRow.relY.join(', '));

  const last = rows[rows.length - 1];
  const onScreen = last.bands.reduce((a, b) => a + b, 0);
  const topHalf = last.bands.slice(0, BANDS / 2).reduce((a, b) => a + b, 0);
  const bottomHalf = last.bands.slice(BANDS / 2).reduce((a, b) => a + b, 0);

  const checks = {
    fieldIsPopulated: onScreen >= 12,
    // Bubbles must be spread through the play area, not piled in one band.
    spreadAcrossScreen: bottomHalf >= 2 && topHalf >= 2,
    // Streaming means they should not all be at the very top.
    notAllAtTop: last.bands[0] < onScreen * 0.5,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));

  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('DIST FAILED: ' + e.message);
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
