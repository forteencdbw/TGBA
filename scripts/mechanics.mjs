// D2 mechanics verification: absorb grows, bigger hurts, enough hits pop, and the run restarts.
//
// These use the game's test hooks to place a bubble exactly on the player and to force hits, so the
// outcomes are deterministic instead of depending on a random collision during a 3-minute climb.
//
// Usage: node scripts/mechanics.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = 500;
const H = 780;
const PORT = 9339;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-mech-'));
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
    const events = [];
    ws.addEventListener('open', () =>
      resolve({
        events,
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
        return;
      }
      if (msg.method) events.push(msg);
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await findTarget());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });
  await sleep(3500);

  const evalJson = async (expr) => JSON.parse((await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value);
  const state = () => evalJson('JSON.stringify(window.__GB.game.diagnostics)');

  /**
   * Wait until the game is actually in `playing`.
   *
   * A silent timeout here was the cause of an intermittent failure: the section after a restart
   * would run while the game was still in its birth intro, where `step` returns early, so a test
   * bubble was never resolved against the player and the assertion failed for no real reason. This
   * returns whether it succeeded so a caller can fail loudly instead of measuring a paused game.
   */
  const waitForPlaying = async (timeoutMs = 15000) => {
    const deadline = Date.now() + timeoutMs;
    let phase = '';
    while (Date.now() < deadline) {
      phase = (await state()).phase;
      if (phase === 'playing') return true;
      await sleep(200);
    }
    console.error(`WARNING: still in phase "${phase}" after ${timeoutMs}ms`);
    return false;
  };

  const introFinished = await waitForPlaying();
  if (!introFinished) throw new Error('game never reached the playing phase');

  const results = {};

  // --- 1. Absorbing a smaller bubble grows the player ---
  // `stats.absorbed` is cumulative and the field is random, so a bubble drifting into the player
  // during the sample would inflate it. Measure the DELTA attributable to the spawned bubble, and
  // compare volume against the pre-spawn value rather than asserting an absolute count.
  const beforeAbsorb = await state();
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnBubbleOnPlayer(0.5); return 1; })())');
  await sleep(200);
  const afterAbsorb = await state();
  results.absorb = {
    volumeBefore: +beforeAbsorb.volume.toFixed(4),
    volumeAfter: +afterAbsorb.volume.toFixed(4),
    absorbedDelta: afterAbsorb.stats.absorbed - beforeAbsorb.stats.absorbed,
    grew: afterAbsorb.volume > beforeAbsorb.volume,
  };

  /**
   * Poll until a condition holds, and return the state that satisfied it.
   *
   * Replaces fixed `sleep()`s in the timing-sensitive sections. A frame is capped at 50ms of
   * simulated time, so below 20fps the game advances slower than wall clock; under a parallel test
   * run these browsers fall well under that, and a sleep that is generous on an idle machine can
   * expire before a single hit is even resolved.
   *
   * The condition is checked FIRST, and the returned state is the one that satisfied it. Sampling
   * after the check instead would return the PREVIOUS state, which silently turns a short-lived
   * condition into a miss: at a low frame rate one round trip can outlast a whole 0.8s
   * invulnerability window.
   */
  const until = async (expr, timeoutMs, label) => {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const s = await state();
      const held = await evalJson(`JSON.stringify((() => { const s = window.__GB.game.diagnostics; return ${expr}; })())`);
      if (held === true) return s;
      if (Date.now() >= deadline) {
        console.error(`WARNING: condition never held within ${timeoutMs}ms: ${label}`);
        return s;
      }
      await sleep(40);
    }
  };

  // --- 2. A bigger bubble hurts instead of feeding ---
  const beforeHit = await state();
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnBubbleOnPlayer(1.6); return 1; })())');
  // Poll for the hit landing rather than sleeping, so the invulnerability reading is taken as soon
  // as the hit resolves, at whatever frame rate the browser manages.
  //
  // The threshold is deliberately loose (`> 0` rather than "near full"). At a low frame rate one
  // 50ms step drains 6% of the 0.8s window, and under heavy parallel load the browser can miss most
  // of it between samples. What is being asserted is that the window is RUNNING, not how much of it
  // is left -- pinning a fraction made the test measure the frame rate.
  const afterHit = await until('s.volume < ' + beforeHit.volume + ' && s.invulnerable > 0', 4000, 'the bigger bubble to deal damage');
  results.biggerHurts = {
    volumeBefore: +beforeHit.volume.toFixed(4),
    volumeAfter: +afterHit.volume.toFixed(4),
    hits: afterHit.stats.hits,
    shrunk: afterHit.volume < beforeHit.volume,
    invulnerable: +afterHit.invulnerable.toFixed(2),
  };

  // --- 3. Invulnerability means a second contact in the same window does not chain ---
  //
  // Spawn a second oversized bubble IMMEDIATELY after the first hit. `spawnBubbleOnPlayer` goes
  // through the real damage path, so unlike `debugForceHit` (which deliberately bypasses
  // invulnerability) it is subject to the window. Sampling at once keeps this well inside the 0.8s
  // window even on a slow frame, which is why this needs no timing tolerance.
  const atHit = await state();
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnBubbleOnPlayer(1.6); return 1; })())');
  const afterSecond = await until(`s.stats.hits !== ${atHit.stats.hits} || s.invulnerable > 0`, 300, 'a frame to pass');
  results.invulnerabilityBlocks = {
    hitsBefore: atHit.stats.hits,
    hitsAfter: afterSecond.stats.hits,
    invulnerableBefore: +atHit.invulnerable.toFixed(3),
    blocked: afterSecond.stats.hits === atHit.stats.hits,
  };

  // --- 4. Enough hits pop the bubble and the run restarts ---
  // `debugForceHit` bypasses invulnerability, so this does not need to wait it out between hits.
  const volumes = [];
  let popped = false;
  for (let i = 0; i < 14; i++) {
    const s = await state();
    if (s.phase === 'burst') {
      popped = true;
      break;
    }
    volumes.push(+s.volume.toFixed(4));
    await evalJson('JSON.stringify((() => { window.__GB.game.debugForceHit(); return 1; })())');
    await sleep(150);
  }
  const duringBurst = await state();
  results.pop = {
    popped,
    volumeTrace: volumes,
    phaseDuringPop: duringBurst.phase,
    hitCount: duringBurst.stats.hits,
  };

  // --- 5. It restarts on its own, with the volume back to 1 and a fresh field ---
  // Poll for the phase LEAVING `burst`, which is the moment the restart happens. A fixed sleep is
  // unreliable here: the restart replays the birth intro and the bubble then starts eating
  // immediately, so a sample taken a second later legitimately shows a much larger volume.
  let leftBurst = false;
  for (let i = 0; i < 60; i++) {
    if ((await state()).phase !== 'burst') {
      leftBurst = true;
      break;
    }
    await sleep(60);
  }
  if (!leftBurst) throw new Error('game never left the burst phase');

  const justRestarted = await state();
  // The counters are the part that must have been reset, and they are reset at the transition.
  results.restart = {
    phase: justRestarted.phase,
    volume: +justRestarted.volume.toFixed(3),
    bubbles: justRestarted.bubbles,
    absorbedReset: justRestarted.stats.absorbed === 0,
    hitsReset: justRestarted.stats.hits === 0,
    endedCount: justRestarted.stats.ended,
  };

  // Now let the intro finish and the field refill. Everything after this point needs a LIVE game:
  // during the intro `step` returns early, so nothing moves and no contact is ever resolved.
  await waitForPlaying();
  await sleep(600);
  const repopulated = await state();
  results.fieldRepopulates = { bubbles: repopulated.bubbles };

  // --- 6. Contact still registers while the bubble is moving ---
  // A bubble with a real relative velocity, held in place so the per-frame velocity solve cannot
  // carry it away before the collision is resolved.
  const beforeFast = await state();
  const spawnedFast = await evalJson(
    'JSON.stringify((() => { window.__GB.game.spawnFallingBubbleOnPlayer(0.5); return window.__GB.game.fieldRef.bubbles.length; })())',
  );
  await sleep(900);
  const afterFast = await state();
  results.fastContact = {
    volumeBefore: +beforeFast.volume.toFixed(4),
    volumeAfter: +afterFast.volume.toFixed(4),
    absorbedDelta: afterFast.stats.absorbed - beforeFast.stats.absorbed,
    hitDelta: afterFast.stats.hits - beforeFast.stats.hits,
    bulletsBefore: spawnedFast,
    bulletsAfter: afterFast.bubbles,
    playerY: (await evalJson('JSON.stringify({ y: window.__GB.player.y, phase: window.__GB.game.diagnostics.phase })')),
    registered: afterFast.volume !== beforeFast.volume || afterFast.stats.absorbed !== beforeFast.stats.absorbed,
  };
  void beforeFast;

  // --- 7. Keyboard and touch pacing must stay in the same league ---
  // Touch eases toward the finger and is quick; keyboard drives a binary axis and is scaled down
  // because it saturates. Neither should be wildly slower than the other: a keyboard far below the
  // touch speed makes it the sluggish input instead of the twitchy one.
  results.pacing = await evalJson(
    'JSON.stringify({ keyboardSpeed: window.__GB.game.diagnostics.lateral.keyboardSpeed, damping: window.__GB.game.diagnostics.lateral.damping })',
  );

  console.log(
    `restart: phase=${results.restart.phase} volume=${results.restart.volume} absorbedReset=${results.restart.absorbedReset} bubbles=${results.restart.bubbles} ended=${results.restart.endedCount}`,
  );
  console.log(JSON.stringify(results, null, 2));

  const exceptions = cdp.events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text);

  const checks = {
    absorbGrows: results.absorb.grew && results.absorb.absorbedDelta >= 1,
    biggerBubbleHurts: results.biggerHurts.shrunk && results.biggerHurts.invulnerable > 0,
    invulnerabilityBlocksChain: results.invulnerabilityBlocks.blocked,
    enoughHitsPops: results.pop.popped && results.pop.phaseDuringPop === 'burst',
    // The restart must reset the run's counters and bring the bubble back to its starting size.
    // Volume is allowed to have already grown: the game is live again by the time this is sampled,
    // and the bubble starts eating immediately. What must NOT be true is that the run continued.
    restartsWithFreshVolume:
      results.restart.volume < 1.5 && results.restart.absorbedReset && results.restart.hitsReset,
    fieldRepopulates: results.fieldRepopulates.bubbles > 5,
    // Contact must not be skipped just because the bubble is falling fast.
    fastContactRegisters: results.fastContact.registered,
    // Keyboard speed must be a usable lane-crossing rate, not the 0.13s an acceleration ramp once
    // produced. The band is wide on purpose: the crossing time is a knob the player is expected to
    // tune, so this guards against nonsense rather than against a particular taste.
    keyboardPaceIsSane: 1 / results.pacing.keyboardSpeed >= 1 && 1 / results.pacing.keyboardSpeed <= 20,
    noExceptions: exceptions.length === 0,
  };
  console.log('CHECKS: ' + JSON.stringify(checks));
  if (exceptions.length) console.log('EXCEPTIONS: ' + JSON.stringify(exceptions, null, 2));

  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('MECHANICS FAILED: ' + e.message);
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
