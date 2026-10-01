// Measures the ascent acceleration ramp against its configured time constant.
//
// The multiplier eases exponentially: mult -> target with time constant boostAccelSeconds. This
// samples it densely and fits the curve, so "the ramp is slower than configured" is a measurement
// rather than an opinion.
//
// Usage: node scripts/accel-ramp.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9362;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-ramp-'));
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

  // One evaluate call that flips the boost on and samples the multiplier on a fixed schedule inside
  // the page. Doing it in-page removes the round-trip latency that made an earlier measurement look
  // like a slow ramp.
  //
  // Sampled against the GAME's clock rather than `performance.now()`. A frame is capped at 50ms of
  // simulated time, so below 20fps -- which a parallel test run easily reaches -- game time advances
  // slower than wall clock, and fitting a wall-clock curve to a game-time constant reported the frame
  // rate instead of the ramp.
  const probe =
    '(async function () {' +
    '  var g = window.__GB.game;' +
    '  var gb = window.__GB.game;' +
    '  var cfg = { target: window.__GB.tuning.boostMultiplier, tau: window.__GB.tuning.boostAccelSeconds };' +
    '  var before = g.player.speedMultiplier;' +
    '  gb.debugSetBoosting(true);' +
    '  var t0 = g.diagnostics.gameSeconds;' +
    '  var samples = [];' +
    '  for (var i = 0; i < 60; i++) {' +
    '    await new Promise(function (r) { requestAnimationFrame(function () { r(); }); });' +
    '    samples.push([+(g.diagnostics.gameSeconds - t0).toFixed(4), Math.round(g.player.speedMultiplier * 1000) / 1000]);' +
    '  }' +
    '  gb.debugSetBoosting(false);' +
    '  return JSON.stringify({ cfg: cfg, before: before, samples: samples });' +
    '})()';

  const r = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  const data = JSON.parse(r.result.value);

  console.log(`configured: target=${data.cfg.target}  tau=${data.cfg.tau}s  (from ${data.before})\n`);
  console.log('  t(game s)   mult   expected   delta');
  for (const [t, m] of data.samples) {
    const expected = 1 + (data.cfg.target - 1) * (data.cfg.tau <= 0 ? 1 : 1 - Math.exp(-t / data.cfg.tau));
    console.log(`  ${String(t).padStart(9)}  ${String(m).padStart(6)}   ${expected.toFixed(3).padStart(8)}   ${(m - expected).toFixed(3).padStart(6)}`);
  }

  // Fit the observed time constant: for an exponential approach, 1 - e^(-t/tau) = progress, so
  // tau = -t / ln(1 - progress). `t` is in GAME seconds already.
  const target = data.cfg.target;
  const fits = data.samples
    .filter(([, m]) => m > 1.02 && m < target - 0.02)
    .map(([t, m]) => {
      const progress = (m - 1) / (target - 1);
      return progress > 0.02 && progress < 0.98 ? -t / Math.log(1 - progress) : null;
    })
    .filter((v) => v !== null && Number.isFinite(v) && v > 0);

  const observedTau = fits.length ? fits.reduce((a, b) => a + b, 0) / fits.length : null;
  const finalMult = data.samples[data.samples.length - 1][1];

  const report = {
    configuredTau: data.cfg.tau,
    observedTau: observedTau === null ? null : +observedTau.toFixed(3),
    configuredTarget: target,
    finalMultiplier: finalMult,
    finalFractionOfTarget: +(((finalMult - 1) / (target - 1)) * 100).toFixed(1),
  };
  console.log('\n' + JSON.stringify(report, null, 2));

  const checks = {
    rampRises: finalMult > 1.5,
    // Fitted against the GAME's clock, so this can be tight: the model IS exponential and the sample
    // interval cancels out. Only the residual from per-frame stepping remains, which measured 0.8%
    // error on an idle machine (observed 0.496 against a configured 0.5).
    tauMatchesConfig:
      observedTau !== null && Math.abs(observedTau - data.cfg.tau) < Math.max(0.08, data.cfg.tau * 0.2),
    reachesNearTarget: finalMult > 1 + (target - 1) * 0.8,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('ACCEL RAMP FAILED: ' + e.message);
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
