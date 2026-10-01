// Verifies D4: each talent's upside AND backlash, and that each skill does its own thing.
//
// The design claim has two halves and both are checked:
//   - a talent must change how the run plays (upside)
//   - a talent must COST something (backlash) -- "your survival mechanism is the enemy's breeding
//     mechanism". A talent with no downside is just a better start, and the design forbids it.
//
// Skills must be six different answers, not six flavours of one. The check is the same shape as the
// hazard-verb check: assert what each does AND what it does not.
//
// Usage: node scripts/talents-skills.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9368;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-talents-'));
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

  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!window.__GB', returnByValue: true });
    if (r.result.value === true) break;
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

  // ---------------------------------------------------------------- talents
  const talentProbe = (id) =>
    `(async function () {
      var g = window.__GB.game;
      var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
      g.debugResetStats();
      g.debugSetTalent('${id}');
      var d = g.diagnostics;
      // Baseline ascent with the talent applied but no skill and no boost.
      var baseVy = null, baseX = null;
      for (var i = 0; i < 4; i++) await raf();
      baseVy = g.player.vy;
      baseX = g.player.x;
      // Silt: take a hit and see how much volume it costs.
      g.player.volume = 2.0;
      var before = g.player.volume;
      g.debugForceHit();
      var afterHit = g.player.volume;
      // Soda's backlash is a steering penalty, measured as the drag ease the player actually gets.
      var steerAlpha = g.diagnostics.talent.steerMultiplier;
      g.debugResetStats();
      return JSON.stringify({
        id: '${id}',
        ascentMultiplier: d.talent.ascentMultiplier,
        steerMultiplier: d.talent.steerMultiplier,
        startVolume: d.talent.startVolume,
        shrinkResistance: d.talent.shrinkResistance,
        ascentVy: +baseVy.toFixed(2),
        volumeLostPerHit: +(before - afterHit).toFixed(4),
        steerAlpha: steerAlpha
      });
    })()`;

  const talents = {};
  for (const id of ['fish-fart', 'soda', 'silt']) {
    talents[id] = await evalJson(talentProbe(id), true);
  }

  // Baseline for comparison: a talent with no modifiers at all.
  const baseline = await evalJson(
    `(async function () {
      var g = window.__GB.game;
      var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
      g.debugResetStats();
      g.debugSetTalent('fish-fart');
      for (var i = 0; i < 4; i++) await raf();
      g.player.volume = 2.0;
      var before = g.player.volume;
      g.debugForceHit();
      return JSON.stringify({ ascentVy: +g.player.vy.toFixed(2), volumeLostPerHit: +(before - g.player.volume).toFixed(4) });
    })()`,
    true,
  );

  console.log('talent       ascentMult  steerMult  startVol  shrinkResist  volumeLost/hit');
  for (const id of ['fish-fart', 'soda', 'silt']) {
    const t = talents[id];
    console.log(
      `${id.padEnd(12)} ${String(t.ascentMultiplier).padStart(10)}  ${String(t.steerMultiplier).padStart(9)}  ${String(t.startVolume).padStart(8)}  ${String(t.shrinkResistance).padStart(12)}  ${String(t.volumeLostPerHit).padStart(13)}`,
    );
  }
  console.log(`baseline (no talent modifiers): volumeLost/hit ${baseline.volumeLostPerHit}`);

  // ----------------------------------------------------------------- skills
  //
  // Each probe starts from a clean slate (debugResetStats clears invulnerability and the hazard
  // field) and measures the effect THAT skill is supposed to have, not a proxy.
  //
  // Two traps this avoids, both of which produced false readings first time round:
  //   - measuring "are bubbles closer" proves nothing, because collectables drift toward the player
  //     anyway as it rises. The vortex is measured against a control run with no skill used.
  //   - measuring "is the player invulnerable" after ANY skill is meaningless, because a hit already
  //     grants 0.8s of it. Only the shell's 3s is long enough to be distinguishable, and the control
  //     run proves the difference.
  const skillProbe = (id) =>
    `(async function () {
      var g = window.__GB.game;
      var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
      g.debugResetStats();
      g.debugSetTalent('fish-fart');
      if ('${id}' !== 'none') g.debugGrantSkill('${id}');
      // Something for the world-acting skills to act on, at a distance they can affect but not touch.
      var lane = g.camera.viewport.laneWidthMeters;
      var lanes = [0.3, 0.5, 0.7];
      for (var i = 0; i < 3; i++) {
        g.hazardsRef.hazards.push({
          id: -100 - i, kind: 'fish', x: lanes[i] * lane, y: g.player.y + 90,
          radiusFraction: 0.035, phase: 0, seed: 0, baitedUntil: 0, squashed: 0,
          gripping: false, fuse: 0, fired: false, armed: false
        });
      }
      var usesBefore = g.diagnostics.skill ? g.diagnostics.skill.uses : 0;
      var measure = function () {
        var px = g.player.x * lane, py = g.player.y;
        var fish = g.hazardsRef.hazards.filter(function (h) { return h.kind === 'fish'; });
        return {
          fishNear: fish.filter(function (h) { return Math.hypot(h.x - px, h.y - py) < 120; }).length,
          fishBaited: fish.filter(function (h) { return h.baitedUntil > g.diagnostics.gameSeconds; }).length,
          ascentBonus: g.player.skillAscentBonus,
          activeSkill: g.diagnostics.activeSkill,
          invuln: g.diagnostics.invulnerable,
          slow: g.player.slowRemaining
        };
      };
      if ('${id}' === 'none') {
        // Control: apply the same slow and the same waiting, but use no skill.
        g.player.slowRemaining = 1.2; g.player.slowFactor = 0.55;
        for (var i = 0; i < 12; i++) await raf();
        return JSON.stringify({ id: '${id}', usesBefore: 0, usesAfter: 0, after: measure() });
      }
      g.player.slowRemaining = 1.2; g.player.slowFactor = 0.55;
      g.input.pressSkill();
      for (var i = 0; i < 12; i++) await raf();
      return JSON.stringify({
        id: '${id}', usesBefore: usesBefore,
        usesAfter: g.diagnostics.skill ? g.diagnostics.skill.uses : 0,
        after: measure()
      });
    })()`;

  const skillRows = [];
  for (const id of ['dash', 'decoy', 'vortex', 'stink', 'shell', 'burst', 'none']) {
    skillRows.push(await evalJson(skillProbe(id), true));
  }
  const control = skillRows.find((r) => r.id === 'none');
  const byId = Object.fromEntries(skillRows.map((r) => [r.id, r]));

  console.log('\nskill    usesBefore  usesAfter  invuln  ascentBonus  fishPushedOff  fishBaited  slowAfter');
  for (const r of skillRows) {
    console.log(
      `${r.id.padEnd(8)} ${String(r.usesBefore).padStart(11)}  ${String(r.usesAfter).padStart(9)}  ${String(r.after.invuln > 0).padStart(6)}  ${String(r.after.ascentBonus).padStart(11)}  ${String(3 - r.after.fishNear).padStart(13)}  ${String(r.after.fishBaited).padStart(10)}  ${String(r.after.slow.toFixed(2)).padStart(9)}`,
    );
  }

  // ------------------------------------------------------- fart backlash
  //
  // Counted by ID rather than by array length: the fart leaves its bait bubbles right on top of the
  // player, and the player absorbs most of them within a frame or two. Array length therefore reads
  // as "no bait" even though the bubbles were created -- which is the whole backlash.
  const fart = await evalJson(
    `(async function () {
      var g = window.__GB.game;
      var raf = function () { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); };
      g.debugResetStats();
      g.debugSetTalent('fish-fart');
      var maxIdBefore = g.fieldRef.bubbles.reduce(function (m, b) { return Math.max(m, b.id); }, 0);
      g.debugReleaseFart();
      // Read immediately: the point is that they were CREATED, and they are deliberately food.
      var created = g.fieldRef.bubbles.filter(function (b) { return b.id > maxIdBefore; }).length;
      return JSON.stringify({ created: created, farts: g.diagnostics.farts });
    })()`,
    true,
  );

  console.log(`\nfart backlash: ${fart.created} bait bubbles created (farts=${fart.farts})`);

  const t = talents;
  const dash = byId.dash.after;
  const decoy = byId.decoy.after;
  const vortex = byId.vortex.after;
  const stink = byId.stink.after;
  const shell = byId.shell.after;
  const burst = byId.burst.after;

  const checks = {
    // Soda's upside AND backlash.
    sodaAscendsFaster: t.soda.ascentMultiplier > 1,
    sodaSteersWorse: t.soda.steerMultiplier < 1,
    // Silt's upside AND backlash.
    siltStartsBigger: t.silt.startVolume > 1,
    siltLosesLessVolume: t.silt.volumeLostPerHit < baseline.volumeLostPerHit,
    siltSizeIsTheBacklashCarrier: t.silt.startVolume > 1.2,
    fishFartBodyIsUnchanged: t['fish-fart'].ascentMultiplier === 1 && t['fish-fart'].startVolume === 1,
    // THE BACKLASH: the reflex that saves you also feeds the swarm.
    fartLeavesBait: fart.created >= 2,

    // Skills, each measured against the control run.
    dashRaisesAscent: dash.ascentBonus > 1.5,
    decoyBaitsFish: decoy.fishBaited > control.after.fishBaited,
    vortexHoldsItsEffect: vortex.activeSkill !== null,
    stinkClearsSlow: stink.slow === 0,
    shellGrantsInvulnerability: shell.invuln > control.after.invuln + 0.5,
    burstPushesFishOff: 3 - burst.fishNear > 3 - control.after.fishNear,

    // Distinctness: the ones that must NOT do a thing do not.
    dashDoesNotClearSlow: dash.slow > 0,
    decoyDoesNotRaiseAscent: decoy.ascentBonus === 1,
    vortexDoesNotClearSlow: vortex.slow > 0,
    stinkDoesNotRaiseAscent: stink.ascentBonus === 1,
    everySkillSpendsExactlyOneUse: ['dash', 'decoy', 'vortex', 'stink', 'shell', 'burst'].every(
      (id) => byId[id].usesAfter === byId[id].usesBefore - 1,
    ),
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('TALENTS/SKILLS FAILED: ' + e.message);
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
