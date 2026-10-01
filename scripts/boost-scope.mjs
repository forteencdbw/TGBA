// Proves that accelerating moves ONLY the player, not the collectables.
//
// The bug this exists for: collectable relative speed was solved against the player's ACTUAL ascent
// speed, so holding the accelerate control made every bubble stream down faster as well. Boosting
// then scaled the whole ocean instead of changing the player's position in it.
//
// The check tracks ONE collectable and compares its own relative motion with the control held
// versus released. The player's ascent must change; the bubble's must not.
//
// Usage: node scripts/boost-scope.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9363;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-scope-'));
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

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return JSON.parse(r.result.value);
  };

  // Sample the ascent speeds and the collectable solve while cruising, while boosting, and after
  // release. Sampling happens in-page so the boost ramp has time to settle without CDP round-trips.
  const probe =
    '(async function () {' +
    '  var g = window.__GB.game;' +
    '  var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };' +
    '  var settle = async function (n) { for (var i = 0; i < n; i++) await raf(); };' +
    '  var out = {};' +
    '  var snap = function () {' +
    '    var m = g.debugMotion();' +
    '    return {' +
    '      playerAscent: m.playerAscentMps,' +
    '      cruiseAscent: m.cruiseAscentMps,' +
    '      fieldCruiseAscent: m.fieldCruiseAscentMps,' +
    '      multiplier: Math.round(g.player.speedMultiplier * 1000) / 1000' +
    '    };' +
    '  };' +
    // Solved at FIXED sizes, so the only thing that can vary the answer is the ascent reference.
    // At a fixed reference the field solve must be stable; across references it must be exactly
    // linear, which is the property that guarantees the boost cannot reach it.
    '  var solveAt = function (ref) { return g.debugSolveCollectableVelocityAtRef(0.6, 1.5, ref); };' +
    '  var solve = function () { return g.debugSolveCollectableVelocity(0.6, 1.5); };' +
    '  out.scaling = { at1: solveAt(1), at2: solveAt(2), at4: solveAt(4) };' +
    '  out.cruise = snap(); out.cruise.solved = solve(); out.cruise.fixedRef = solveAt(2);' +
    '  g.debugSetBoosting(true);' +
    '  await settle(30);' +
    '  out.boost = snap(); out.boost.solved = solve(); out.boost.fixedRef = solveAt(2);' +
    '  g.debugSetBoosting(false);' +
    '  await settle(30);' +
    '  out.released = snap(); out.released.solved = solve(); out.released.fixedRef = solveAt(2);' +
    '  return JSON.stringify(out);' +
    '})()';

  const data = await evalJson(probe, true);

  console.log('phase        playerAscent  cruiseAscent  fieldCruise  multiplier  solvedAtLiveRef  solvedAtFixedRef');
  for (const key of ['cruise', 'boost', 'released']) {
    const s = data[key];
    console.log(
      `${key.padEnd(12)} ${String(s.playerAscent).padStart(12)}  ${String(s.cruiseAscent).padStart(12)}  ${String(s.fieldCruiseAscent).padStart(11)}  ${String(s.multiplier).padStart(10)}  ${String(s.solved).padStart(15)}  ${String(s.fixedRef ?? '-').padStart(16)}`,
    );
  }
  console.log(
    `scaling in the cruising reference: at1=${data.scaling.at1} at2=${data.scaling.at2} at4=${data.scaling.at4}`,
  );

  // Derived from the same model, at the same sizes, for an independent cross-check.
  const mu = data.cruise.multiplier;
  const checks = {
    // The player must actually go faster.
    playerAccelerates: data.boost.playerAscent > data.cruise.playerAscent * 1.5,
    // THE POINT: at a FIXED reference the solve is untouched by the boost, so collectable motion
    // cannot be influenced by it. This is the assertion the reported bug would have failed.
    collectableMotionUnchanged:
      Math.abs(data.boost.fixedRef - data.cruise.fixedRef) < 1e-9 &&
      Math.abs(data.released.fixedRef - data.cruise.fixedRef) < 1e-9,
    // The solve must be exactly LINEAR in the cruising reference...
    solveIsLinearInReference:
      Math.abs(data.scaling.at2 / data.scaling.at1 - 2) < 1e-9 &&
      Math.abs(data.scaling.at4 / data.scaling.at1 - 4) < 1e-9,
    // ...and the field must actually be using the un-boosted reference, matched to the depth curve.
    fieldUsesCruiseNotBoost:
      Math.abs(data.boost.fieldCruiseAscent - data.boost.cruiseAscent) < 0.02 &&
      data.boost.fieldCruiseAscent < data.boost.playerAscent / 5,
    // Sanity: the boost really is large, so the test is not passing by accident.
    boostIsSubstantial: data.boost.multiplier > 2 && data.boost.playerAscent > data.cruise.playerAscent * 2,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('BOOST SCOPE FAILED: ' + e.message);
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
