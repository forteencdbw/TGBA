// Verifies the D3 hazard verbs are actually DIFFERENT from each other.
//
// The design claim is not "there are four hazards", it is that each one changes the player's state
// in a way the others do not. This drops each kind on the player in turn and reports what happened,
// so that claim is checked rather than assumed.
//
// Usage: node scripts/hazard-verbs.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9365;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-verbs-'));
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
  // Record page exceptions from the start: a boot-time throw shows up as "cannot read properties of
  // undefined" from the first probe expression, which points at the probe instead of the game.
  await cdp.send('Runtime.evaluate', {
    expression: 'window.__PAGE_ERRORS = []; window.addEventListener("error", (e) => window.__PAGE_ERRORS.push(String(e.message)));',
  });
  await cdp.send('Page.navigate', { url: URL_ARG });

  // Wait for the object the probes actually use, not just for `window.__GB`. The harness assigns
  // `__GB` and then fills it in, so `typeof window.__GB === 'object'` can be true while `__GB.game`
  // is still undefined -- and the failure then surfaces as "cannot read properties of undefined"
  // from the first probe expression, which points at the probe instead of at the wait.
  let booted = false;
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', {
      expression: '!!(window.__GB && window.__GB.game && window.__GB.game.diagnostics)',
      returnByValue: true,
    });
    if (r.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) {
    const err = await cdp.send('Runtime.evaluate', {
      expression: 'JSON.stringify({ gb: typeof window.__GB, game: window.__GB && typeof window.__GB.game })',
      returnByValue: true,
    });
    throw new Error(`the game never booted: ${err.result.value}`);
  }
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(200);
  }

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return JSON.parse(r.result.value);
  };

  // Each probe advances the game by ONE short window. Several small calls add up to the same elapsed
  // time as one long one, but a single long in-page loop over `requestAnimationFrame` appears to stall
  // this harness -- a probe driving the trash grip for 400 frames never published a result at all,
  // while the identical rule passes deterministically in scripts/emergence.mjs.
  const probeFor = (kind, step) =>
    '(async function () {' +
    '  var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };' +
    '  var g = window.__GB.game;' +
    '  var d = function () { return g.diagnostics; };' +
    (step === 0
      ? '  g.debugResetStats();' +
        '  g.debugSetBaitEnabled(false);' +
        '  g.debugSetSteadyCruise();' +
        '  await raf();' +
        '  var yBefore = g.player.y;' +
        `  g.debugSpawnHazardOnPlayer('${kind}');`
      : '  var yBefore = g.player.y;') +
    '  var gripFrames = 0, maxGripSeconds = 0, hits0 = d().stats.hits;' +
    // Peak-tracking inside the window, not just an end-of-window sample. A crab's launch impulse decays
    // exponentially with a 0.9s time constant, so a single reading taken after 40 frames can miss it
    // entirely -- which made a working crab look like it did nothing.
    '  var peakImpulse = 0, peakSlow = 0;' +
    '  for (var i = 0; i < 40; i++) {' +
    '    var h = g.hazardsRef.hazards.filter(function (x) { return x.kind === "trash"; })[0];' +
    '    if (h && h.gripping) { gripFrames++; maxGripSeconds = Math.max(maxGripSeconds, h.gripSeconds); }' +
    '    var dd = d();' +
    '    peakImpulse = Math.max(peakImpulse, dd.slow.impulseVy);' +
    '    peakSlow = Math.max(peakSlow, dd.slow.remaining);' +
    '    await raf();' +
    '  }' +
    '  var a = d();' +
    '  return JSON.stringify({' +
    `    kind: '${kind}',` +
    '    hits: a.stats.hits,' +
    '    hitsThisWindow: a.stats.hits - hits0,' +
    '    slowSeconds: peakSlow,' +
    '    impulse: peakImpulse,' +
    '    beats: a.hazards.comedyBeats,' +
    '    grabs: a.hazards.grabs,' +
    '    baits: a.hazards.baits,' +
    '    gripFrames: gripFrames,' +
    '    maxGripSeconds: a.maxGripSeconds,' +
    '    trashDrain: a.trashDrain,' +
    '    gainedHeight: +(g.player.y - yBefore).toFixed(2),' +
    '    peakVy: +peakImpulse.toFixed(2)' +
    '  });' +
    '})()';

  const rows = [];
  for (const kind of ['fish', 'jelly', 'trash', 'crab']) {
    // Several short windows rather than one long one. A single in-page loop driving the trash grip for
    // 400 frames never published a result at all through this harness, whereas the same total elapsed
    // time split into small calls behaves normally -- and it is also the shape that gives the trash
    // grip enough frames to accumulate its drain.
    const windows = kind === 'trash' ? 14 : 1;
    let acc = null;
    let truncated = false;
    for (let step = 0; step < windows && !truncated; step++) {
      const stepRes = await evalJson(probeFor(kind, step), true);
      if (stepRes.harnessError) throw new Error(`harness lost the page: ${JSON.stringify(stepRes)}`);
      if (step === 0) acc = stepRes;
      else {
        // Cumulative counters come from the LAST window; effect timers are taken at their PEAK across
        // windows, because a jellyfish's slow expires inside the run and the final reading would be 0.
        acc.hits = stepRes.hits;
        acc.grabs = stepRes.grabs;
        acc.baits = stepRes.baits;
        acc.gripFrames += stepRes.gripFrames;
        acc.maxGripSeconds = Math.max(acc.maxGripSeconds, stepRes.maxGripSeconds);
        acc.trashDrain = stepRes.trashDrain;
        acc.slowSeconds = Math.max(acc.slowSeconds, stepRes.slowSeconds);
        acc.beats = stepRes.beats;
      }

      // Trust the harness's own reading of the cumulative counters: window 0 reports them from BEFORE
      // the hazard it spawned had a chance to act, so the per-window values alone read as zeros even
      // while a bag is plainly gripping.
      const snap = await evalJson(
        'JSON.stringify({ hits: window.__GB.game.diagnostics.stats.hits, grabs: window.__GB.game.diagnostics.hazards.grabs, baits: window.__GB.game.diagnostics.hazards.baits, slow: window.__GB.game.diagnostics.slow.remaining, impulse: window.__GB.game.diagnostics.slow.impulseVy, beats: window.__GB.game.diagnostics.hazards.comedyBeats, maxGrip: window.__GB.game.diagnostics.maxGripSeconds, drain: window.__GB.game.diagnostics.trashDrain, phase: window.__GB.game.diagnostics.phase })',
      );

      /**
       * STOP once the run has restarted.
       *
       * A trash bag can kill the player outright -- a single grip landed 18 hits in one measurement --
       * and every counter resets on the restart. An earlier version kept observing through the reset
       * and overwrote good readings with zeros, reporting NO EFFECT for a mechanic that was working
       * perfectly. The run is over; the numbers from before it ended are the answer.
       */
      if (snap.phase !== 'playing' || (step > 0 && snap.grabs < (acc.grabs ?? 0))) {
        truncated = true;
        break;
      }

      acc.hits = Math.max(acc.hits, snap.hits);
      acc.grabs = Math.max(acc.grabs, snap.grabs);
      acc.baits = Math.max(acc.baits, snap.baits);
      // Effect timers peak and then expire, so these are taken at their peak.
      acc.slowSeconds = Math.max(acc.slowSeconds, snap.slow);
      acc.impulse = Math.max(acc.impulse, snap.impulse);
      acc.beats = Math.max(acc.beats, snap.beats);
      acc.maxGripSeconds = Math.max(acc.maxGripSeconds, snap.maxGrip);
      acc.trashDrain = Math.max(acc.trashDrain, snap.drain);
      if (kind === 'trash' && process.env.GB_VERBOSE) {
        console.error(
          `    [trash window ${step}] grabs=${snap.grabs} maxGrip=${snap.maxGrip} drain=${snap.drain} hits=${snap.hits} gripFrames=${stepRes.gripFrames} phase=${snap.phase}`,
        );
      }
    }
    rows.push(acc);
  }

  console.log('verb     hits  slow(s)  impulse  beats  grabs  gripFrames  maxGrip  drain  gained(m)  reads as');
  const summary = {};
  for (const r of rows) {
    let reads;
    if (r.slowSeconds > 0) reads = 'slows you';
    else if (Math.abs(r.impulse) > 1) reads = 'launches you up';
    else if (r.grabs > 0) reads = 'grabs and holds you';
    else if (r.hits > 0) reads = 'costs health';
    else reads = 'NO EFFECT';
    console.log(
      `${r.kind.padEnd(8)} ${String(r.hits).padStart(4)}  ${r.slowSeconds.toFixed(2).padStart(7)}  ${String(r.impulse).padStart(7)}  ${String(r.beats).padStart(5)}  ${String(r.grabs).padStart(5)}  ${String(r.gripFrames ?? '-').padStart(10)}  ${String(r.maxGripSeconds ?? '-').padStart(8)}  ${String(r.trashDrain ?? '-').padStart(7)}  ${String(r.gainedHeight).padStart(9)}   ${reads}`,
    );
    summary[r.kind] = r;
  }

  // The design claim, expressed as code: the four must not all do the same thing.
  const jellySlows = summary.jelly.slowSeconds > 0;
  const jellyDoesNotDamage = summary.jelly.hits === 0;
  const crabLaunches = Math.abs(summary.crab.impulse) > 1 && summary.crab.slowSeconds === 0;
  const crabDoesNotDamage = summary.crab.hits === 0;
  const crabDoesNotSlow = summary.crab.slowSeconds === 0;
  const fishDamages = summary.fish.hits > 0;
  const fishDoesNotSlow = summary.fish.slowSeconds === 0;
  const trashGrabs = summary.trash.grabs > 0;
  // Trash also drains, which is its second half: a grab that cost nothing would just be a hold.
  const trashDrains = summary.trash.hits > 0;
  // The crab's whole justification is that it is a fair launch, so it must give real height.
  const crabGainsHeight = summary.crab.gainedHeight > 1;

  const checks = {
    fishDamages,
    jellySlows,
    crabLaunches,
    trashGrabs,
    trashDrains,
    crabGainsHeight,
    // The important part: they are DISTINCT verbs, not four flavours of damage.
    jellyDoesNotDamage,
    crabDoesNotDamage,
    crabDoesNotSlow,
    fishDoesNotSlow,
    verbsAreDistinct: jellySlows && crabLaunches && fishDamages && trashGrabs && jellyDoesNotDamage && crabDoesNotSlow,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('HAZARD VERBS FAILED: ' + e.message);
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
