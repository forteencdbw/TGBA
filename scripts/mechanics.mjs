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

  // Wait for the birth intro to finish so nothing else mutates the player.
  for (let i = 0; i < 30; i++) {
    if ((await state()).phase === 'playing') break;
    await sleep(200);
  }

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

  // --- 2. A bigger bubble hurts instead of feeding ---
  const beforeHit = await state();
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnBubbleOnPlayer(1.6); return 1; })())');
  await sleep(200);
  const afterHit = await state();
  results.biggerHurts = {
    volumeBefore: +beforeHit.volume.toFixed(4),
    volumeAfter: +afterHit.volume.toFixed(4),
    hits: afterHit.stats.hits,
    shrunk: afterHit.volume < beforeHit.volume,
    invulnerable: +afterHit.invulnerable.toFixed(2),
  };

  // --- 3. Invulnerability means a second contact in the same window does not chain ---
  const hitsBeforeBurst = (await state()).stats.hits;
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnBubbleOnPlayer(1.6); return 1; })())');
  await sleep(150);
  const afterSecond = await state();
  results.invulnerabilityBlocks = {
    hitsBefore: hitsBeforeBurst,
    hitsAfter: afterSecond.stats.hits,
    blocked: afterSecond.stats.hits === hitsBeforeBurst,
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
  for (let i = 0; i < 30; i++) {
    if ((await state()).phase !== 'burst') break;
    await sleep(200);
  }
  const afterRestart = await state();
  results.restart = {
    phase: afterRestart.phase,
    volume: +afterRestart.volume.toFixed(3),
    bubbles: afterRestart.bubbles,
    absorbedReset: afterRestart.stats.absorbed === 0,
    endedCount: afterRestart.stats.ended,
  };
  // Give the field a moment to repopulate after the reset.
  await sleep(600);
  const repopulated = await state();
  results.fieldRepopulates = { bubbles: repopulated.bubbles };

  // --- 6. Contact still registers at the real stream speed ---
  // A bubble moving at 40x the ascent speed covers a lot of ground per step; this proves the size
  // rule is not the only thing that matters and that contact is not simply skipped at speed.
  const beforeFast = await state();
  await evalJson('JSON.stringify((() => { window.__GB.game.spawnFallingBubbleOnPlayer(0.5); return 1; })())');
  await sleep(900);
  const afterFast = await state();
  results.fastContact = {
    volumeBefore: +beforeFast.volume.toFixed(4),
    volumeAfter: +afterFast.volume.toFixed(4),
    absorbedDelta: afterFast.stats.absorbed - beforeFast.stats.absorbed,
    hitDelta: afterFast.stats.hits - beforeFast.stats.hits,
    registered: afterFast.volume !== beforeFast.volume || afterFast.stats.absorbed !== beforeFast.stats.absorbed,
  };

  // --- 7. Keyboard and touch pacing must stay in the same league ---
  // Touch eases toward the finger and is quick; keyboard drives a binary axis and is scaled down
  // because it saturates. Neither should be wildly slower than the other: a keyboard far below the
  // touch speed makes it the sluggish input instead of the twitchy one.
  results.pacing = await evalJson(
    'JSON.stringify({ keyboardSpeed: window.__GB.game.diagnostics.lateral.keyboardSpeed, damping: window.__GB.game.diagnostics.lateral.damping })',
  );

  console.log(JSON.stringify(results, null, 2));

  const exceptions = cdp.events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text);

  const checks = {
    absorbGrows: results.absorb.grew && results.absorb.absorbedDelta >= 1,
    biggerBubbleHurts: results.biggerHurts.shrunk && results.biggerHurts.invulnerable > 0.5,
    invulnerabilityBlocksChain: results.invulnerabilityBlocks.blocked,
    enoughHitsPops: results.pop.popped && results.pop.phaseDuringPop === 'burst',
    restartsWithFreshVolume: results.restart.volume === 1 && results.restart.absorbedReset,
    fieldRepopulates: results.fieldRepopulates.bubbles > 5,
    // Contact must not be skipped just because the bubble is falling fast.
    fastContactRegisters: results.fastContact.registered,
    // Keyboard speed must be a sane lane-crossing rate, not the 8 lane-widths/s an acceleration
    // ramp produced. A crossing time between 3 and 15 seconds is the usable band.
    keyboardPaceIsSane: 1 / results.pacing.keyboardSpeed >= 3 && 1 / results.pacing.keyboardSpeed <= 15,
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
