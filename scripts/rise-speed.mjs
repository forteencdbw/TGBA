// Verifies the size/rise-speed relationship.
//
// The physical claim the game is built on: bigger bubbles rise faster, so relative to the player a
// large bubble descends MORE SLOWLY than a small one -- and a large enough one rises faster than the
// player and travels UP the screen.
//
// This samples every visible collectable and prints its size alongside its relative screen motion,
// so the correlation is visible in the data rather than asserted by eye.
//
// Usage: node scripts/rise-speed.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9361;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-rise-'));
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

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!window.__GB', returnByValue: true });
    if (r.result.value === true) break;
  }
  for (let i = 0; i < 40; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(250);
  }

  const expr =
    '(function () {' +
    '  var g = window.__GB.game;' +
    '  var m = g.debugMotion();' +
    '  return JSON.stringify({' +
    '    ascentSpeed: Math.round(g.player.vy * 100) / 100,' +
    '    count: m.collectables.length,' +
    '    bubbles: m.collectables' +
    '  });' +
    '})()';

  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  const data = JSON.parse(r.result.value);

  console.log(`ascent = ${data.ascentSpeed} m/s, ${data.count} visible collectables\n`);
  console.log('  size x player   wobble   relative(m/s)   screen(px/s)   direction');
  for (const b of data.bubbles) {
    const dir = b.relativeFallMps > 0.05 ? 'down' : b.relativeFallMps < -0.05 ? 'UP' : 'alongside';
    console.log(
      `  ${String(b.sizeRatio).padStart(11)}   ${String(b.wobble).padStart(6)}   ${String(b.relativeFallMps).padStart(12)}   ${String(b.screenSpeedPxPerS).padStart(11)}   ${dir}`,
    );
  }

  // Correlation between size and relative fall speed across everything visible.
  const pairs = data.bubbles;
  const meanSize = pairs.reduce((a, b) => a + b.sizeRatio, 0) / Math.max(1, pairs.length);
  const meanFall = pairs.reduce((a, b) => a + b.relativeFallMps, 0) / Math.max(1, pairs.length);
  let cov = 0;
  let varSize = 0;
  let varFall = 0;
  for (const b of pairs) {
    cov += (b.sizeRatio - meanSize) * (b.relativeFallMps - meanFall);
    varSize += (b.sizeRatio - meanSize) ** 2;
    varFall += (b.relativeFallMps - meanFall) ** 2;
  }
  const corr = varSize > 0 && varFall > 0 ? cov / Math.sqrt(varSize * varFall) : 0;

  const big = pairs.filter((b) => b.sizeRatio >= 1.4);
  const small = pairs.filter((b) => b.sizeRatio <= 0.6);
  const report = {
    count: pairs.length,
    sizeVsRelativeFallCorrelation: +corr.toFixed(3),
    smallestSizeRatio: pairs.length ? pairs[0].sizeRatio : null,
    largestSizeRatio: pairs.length ? pairs[pairs.length - 1].sizeRatio : null,
    meanFallSmall: small.length ? +(small.reduce((a, b) => a + b.relativeFallMps, 0) / small.length).toFixed(3) : null,
    meanFallBig: big.length ? +(big.reduce((a, b) => a + b.relativeFallMps, 0) / big.length).toFixed(3) : null,
    anyRisingUp: pairs.some((b) => b.relativeFallMps < -0.05),
    wobbleDecreasesWithSize:
      pairs.length >= 4 && pairs[0].wobble >= pairs[pairs.length - 1].wobble,
  };
  console.log('\n' + JSON.stringify(report, null, 2));

  const checks = {
    // The headline physics: larger means slower to descend, i.e. a NEGATIVE correlation.
    biggerDescendsSlower: corr < -0.5,
    // And large enough bubbles should actually outrun the player.
    someBubblesRiseFasterThanPlayer: report.anyRisingUp,
    smallBubblesFallFast: report.meanFallSmall !== null && report.meanFallSmall > 0.5,
    // Cosmetic detail: small bubbles shimmy more than large ones.
    wobbleDecreasesWithSize: report.wobbleDecreasesWithSize,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('RISE-SPEED FAILED: ' + e.message);
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
