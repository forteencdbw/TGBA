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

  // Each verb gets a clean slate via the game's own reset hook, so a previous hazard cannot
  // contaminate the reading. `debugResetStats` tops the player up as well, which matters: the trash
  // bag drains health, and without headroom the player would pop mid-probe.
  const probeFor = (kind) =>
    `(async function () {
      var g = window.__GB.game;
      var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
      var until = async function (cond, ms) {
        var end = performance.now() + ms;
        while (performance.now() < end) {
          if (cond()) return true;
          await raf();
        }
        return false;
      };
      var d = function () { return g.diagnostics; };
      g.debugResetStats();
      // Baiting is suspended for the duration of the probe. It is a CHANCE by design, so leaving it
      // on would make the fish's chase fail to appear 25% of the time and look like a dead mechanic.
      // The bait beat is exercised separately, in bait-luck below.
      g.debugSetBaitEnabled(false);
      // Cruise, so a trash bag's grip is not torn off by the struggle check before it is observed.
      g.debugSetSteadyCruise();
      await raf();
      var yBefore = g.player.y;
      var vyBefore = g.player.vy;
      var xBefore = g.player.x;
      var gripSeen = false;
      g.debugSpawnHazardOnPlayer('${kind}');
      // Resolve it, however slow the frame rate is. The monotonic counters are what matter: a grip
      // can be torn off within one frame, so a boolean sampled at the end proves nothing.
      await until(function () {
        var s = d();
        return s.slow.remaining > 0 ||
               s.stats.hits > 0 ||
               s.hazards.grabs > 0 ||
               s.hazards.comedyBeats > 0 ||
               (s.slow.impulseVy > 1);
      }, ${kind === 'trash' ? 9000 : 2500});
      for (var i = 0; i < 5; i++) await raf();
      var after = d();
      var h = g.hazardsRef.hazards[0];
      return JSON.stringify({
        kind: '${kind}',
        hits: after.stats.hits,
        volume: after.volume,
        slowSeconds: after.slow.remaining,
        slowFactor: after.slow.factor,
        impulse: after.slow.impulseVy,
        beats: after.hazards.comedyBeats,
        grabs: after.hazards.grabs,
        baits: after.hazards.baits,
        gripping: h ? !!h.gripping : false,
        gainedHeight: +(g.player.y - yBefore).toFixed(2),
        peakVy: +Math.max(vyBefore, g.player.vy).toFixed(2),
        xDrift: +(g.player.x - xBefore).toFixed(4)
      });
    })()`;

  const rows = [];
  for (const kind of ['fish', 'jelly', 'trash', 'crab']) {
    rows.push(await evalJson(probeFor(kind), true));
  }

  console.log('verb     hits  slow(s)  impulse  beats  grabs  gained(m)  peakVy   reads as');
  const summary = {};
  for (const r of rows) {
    let reads;
    if (r.slowSeconds > 0) reads = 'slows you';
    else if (Math.abs(r.impulse) > 1) reads = 'launches you up';
    else if (r.grabs > 0) reads = 'grabs and holds you';
    else if (r.hits > 0) reads = 'costs health';
    else reads = 'NO EFFECT';
    console.log(
      `${r.kind.padEnd(8)} ${String(r.hits).padStart(4)}  ${r.slowSeconds.toFixed(2).padStart(7)}  ${String(r.impulse).padStart(7)}  ${String(r.beats).padStart(5)}  ${String(r.grabs).padStart(5)}  ${String(r.gainedHeight).padStart(9)}  ${String(r.peakVy).padStart(6)}   ${reads}`,
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
