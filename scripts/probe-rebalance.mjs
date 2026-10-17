// Prints what the x5 rescale did, row by row: the numbers as they were, the numbers as they are, and the
// shots-to-drive-off both ways.
//
//   node scripts/probe-rebalance.mjs [tree]           # defaults to this checkout
//
// WHY THE OLD NUMBERS LIVE IN THIS FILE
//
// The commit that multiplied everything by 5 left no copy of what came before, and "did the rescale preserve the
// feel" is a question about the DIFFERENCE between two revisions. `git show HEAD^:config/mechanics.json5` would
// answer it too, but only against a working tree of that revision; this answers it from the shipped config alone,
// which is what makes it runnable at any point in the future.
//
// It PRINTS and does not assert. How many rounds a fish takes is an OUTCOME of the numbers, not a specification --
// the same fish is a different number of rounds to a player with damage cards -- so a mismatch here is a question
// to look at, not a failure to exit on. What it is for is the two ways a rescale goes wrong, and both show up as a
// ratio in the last column: a row that was MISSED (ratio 1) and a row that was scaled TWICE (ratio 25).
//
// Nothing plays and no browser opens: this loads the config through Vite's SSR transform and reads it.

import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });

/** The scale this pass applied. Every row should move by exactly this, and the ones that do not are the point. */
const SCALE = 5;

/**
 * `hazards.health` at v1.5.1, the commit before the rescale.
 *
 * The zeros are in here on purpose: a row that is 0 both ways is row that was CORRECTLY left alone, and leaving it
 * out of this table would make the probe silent about the largest group of kinds in the game.
 */
const BEFORE_HEALTH = {
  fish: 2,
  tuna: 3,
  dolphin: 3,
  octopus: 5,
  shark: 6,
  whale: 8,
  jelly: 2,
  trash: 0,
  crab: 0,
  urchin: 15,
  bombfish: 10,
  boss: 0,
  'boss-crab': 0,
  'boss-octopus': 0,
  'boss-jelly': 0,
  'boss-shark': 0,
  'boss-netshark': 0,
  'boss-eye': 0,
  vent: 0,
  mineral: 0,
  shrimp: 2,
  angler: 10,
  torpedo: 2,
  zapper: 2,
  foam: 0,
  rain: 0,
  eel: 5,
  rot: 0,
  oil: 0,
  archer: 3,
  pistol: 10,
  puffer: 6,
  starfish: 4,
};

/** The other half of a "shots" figure. Both sides of the comparison need one. */
const BEFORE_BULLET_DAMAGE = 1;

/** Per-level `boss.health` at v1.5.1. Keyed by level id rather than by position, so a reordered campaign cannot lie. */
const BEFORE_BOSS_HEALTH = {
  'black-smokers': 140,
  'wreck-gorge': 180,
  'jelly-forest': 200,
  thermocline: 240,
  'storm-surge': 280,
  'dawn-surface': 320,
  debug: 40,
};

/**
 * `obstacles.health` at v1.5.1.
 *
 * `net` is the row to watch, and the reason this section exists at all: it is the one entry in the table whose unit
 * is SECONDS rather than damage points -- a net is torn by shoving against it, one point per second -- so a rescale
 * that reached it would have made nets unfinishable rather than tougher. It should read `ok x1` here.
 */
const BEFORE_OBSTACLE_HEALTH = { crate: 1.0, coral: 3.5, wall: 3.0, net: 0.4, tube: 3.0 };

/**
 * Every other number in the game that lands on a creature's health or an obstacle's, at v1.5.1.
 *
 * Damage to the PLAYER is deliberately absent: those numbers are spent out of a hundred-point pool that this pass
 * did not touch, and mixing the two scales into one table is how a rescale gets applied to the wrong half.
 */
const BEFORE_SOURCES = {
  'bullets.damage': 1,
  'angry.aura.damagePerTick': 0.5,
  'angry.armour.damage': 4,
  'hazards.charge.chainDamage': 4,
  'angry.armour.obstacleDamage': 2.0,
  'angry.burst.obstacleDamage': 1.6,
  'obstacles.ramDamagePerVolume': 1.1,
};

const shots = (health, damage) => (health > 0 && damage > 0 ? Math.ceil(health / damage) : 0);

/** `ok x5`, or the ratio that is not the scale, which is the whole reason to print a column for it. */
function verdict(before, after) {
  if (before === 0 && after === 0) return 'ok x1 (0 both ways)';
  if (before === 0 || after === 0) return `!! ${before} -> ${after}`;
  const r = after / before;
  return Math.abs(r - SCALE) < 1e-9 ? 'ok x5' : `!! x${Number(r.toFixed(4))}`;
}

const rows = [];
let offScale = 0;
const check = (label, before, after) => {
  const v = verdict(before, after);
  if (v.startsWith('!!')) offScale++;
  rows.push({ kind: label, before, after, v });
};

const cell = (v) => String(v).padEnd(9).slice(0, 9);

try {
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const { LEVELS, DEBUG_LEVEL } = await server.ssrLoadModule('/src/levels.ts');

  const damageBefore = BEFORE_BULLET_DAMAGE;
  const damageAfter = mech.bullets.damage;

  console.log(`\n===== bullets.damage   ${damageBefore} -> ${damageAfter}   (${verdict(damageBefore, damageAfter)})`);
  console.log('  A driven-off count is ceil(health / damage), so both columns below are read against this.');

  console.log('\n===== hazards.health   (creatures)');
  console.log(`  ${'kind'.padEnd(16)}${cell('before')}${cell('after')}   ${cell('shots b')}${cell('shots a')}ratio`);
  for (const [kind, after] of Object.entries(mech.hazards.health)) {
    const before = BEFORE_HEALTH[kind];
    if (before === undefined) {
      console.log(`  ${kind.padEnd(16)}${cell('--')}${cell(after)}   ${cell('--')}${cell('--')}!! not in the record`);
      offScale++;
      continue;
    }
    check(kind, before, after);
    const row = rows[rows.length - 1];
    console.log(
      `  ${kind.padEnd(16)}${cell(before)}${cell(after)}   ${cell(shots(before, damageBefore))}${cell(shots(after, damageAfter))}${row.v}`,
    );
  }
  for (const kind of Object.keys(BEFORE_HEALTH)) {
    if (!(kind in mech.hazards.health)) {
      console.log(`  ${kind.padEnd(16)}${cell(BEFORE_HEALTH[kind])}${cell('--')}   !! gone from the config`);
      offScale++;
    }
  }

  console.log('\n===== boss.health   (per level, which is where bosses are priced)');
  console.log(`  ${'level'.padEnd(20)}${cell('before')}${cell('after')}   ${cell('shots b')}${cell('shots a')}ratio`);
  // The debug level is a level in the ordinary format but is NOT in `LEVELS`, so it has to be asked for by name.
  for (const level of [...LEVELS, DEBUG_LEVEL]) {
    const after = level.boss?.health;
    if (after === undefined) continue;
    const before = BEFORE_BOSS_HEALTH[level.id];
    if (before === undefined) {
      console.log(`  ${level.id.padEnd(20)}${cell('--')}${cell(after)}   !! not in the record`);
      offScale++;
      continue;
    }
    const v = verdict(before, after);
    if (v.startsWith('!!')) offScale++;
    console.log(
      `  ${level.id.padEnd(20)}${cell(before)}${cell(after)}   ${cell(shots(before, damageBefore))}${cell(shots(after, damageAfter))}${v}`,
    );
  }

  console.log('\n===== obstacles.health   (damage points -- except net, which is seconds)');
  console.log(`  ${'kind'.padEnd(16)}${cell('before')}${cell('after')}   ratio`);
  for (const [kind, after] of Object.entries(mech.obstacles.health)) {
    const before = BEFORE_OBSTACLE_HEALTH[kind];
    if (before === undefined) {
      console.log(`  ${kind.padEnd(16)}${cell('--')}${cell(after)}   !! not in the record`);
      offScale++;
      continue;
    }
    const scaled = before > 0 && Math.abs(after / before - SCALE) < 1e-9;
    // `net` is the one row whose unit is SECONDS, so it is expected to sit at x1 and is not a finding.
    if (kind === 'net') {
      console.log(
        `  ${kind.padEnd(16)}${cell(before)}${cell(after)}   ${
          scaled ? '!! scaled -- but the unit is seconds' : 'ok x1  <- seconds, not scaled on purpose'
        }`,
      );
      continue;
    }
    if (!scaled) offScale++;
    console.log(`  ${kind.padEnd(16)}${cell(before)}${cell(after)}   ${scaled ? 'ok x5' : `!! x${Number((after / before).toFixed(4))}`}`);
  }

  console.log('\n===== the other damage that lands on a creature or an obstacle');
  console.log(`  ${'key'.padEnd(34)}${cell('before')}${cell('after')}   ratio`);
  const live = {
    'bullets.damage': mech.bullets.damage,
    'angry.aura.damagePerTick': mech.angry.aura.damagePerTick,
    'angry.armour.damage': mech.angry.armour.damage,
    'hazards.charge.chainDamage': mech.hazards.charge.chainDamage,
    'angry.armour.obstacleDamage': mech.angry.armour.obstacleDamage,
    'angry.burst.obstacleDamage': mech.angry.burst.obstacleDamage,
    'obstacles.ramDamagePerVolume': mech.obstacles.ramDamagePerVolume,
  };
  for (const [key, after] of Object.entries(live)) {
    const before = BEFORE_SOURCES[key];
    const v = verdict(before, after);
    if (v.startsWith('!!')) offScale++;
    console.log(`  ${key.padEnd(34)}${cell(before)}${cell(after)}   ${v}`);
  }

  /**
   * The two things this pass did NOT touch, printed as a contrast rather than described in a comment.
   *
   * `contactDamage` is the whole player-facing table and `health.start` is the pool it is spent out of: if either
   * of these ever shows a 5 next to it, the wrong half of the game got scaled.
   */
  console.log('\n===== NOT scaled: the player-side pool (should read x1 across the board)');
  console.log(`  health.start                          ${mech.health.start}`);
  const contact = Object.entries(mech.hazards.contactDamage);
  console.log(`  hazards.contactDamage                 ${contact.length} rows, ${Math.min(...contact.map(([, v]) => v))}..${Math.max(...contact.map(([, v]) => v))}`);
  console.log(`  obstacles.contactDamage               ${mech.obstacles.contactDamage}`);
  console.log(`  consumption.bumpDamage                ${mech.consumption.bumpDamage}`);

  console.log(`\n  ${rows.length} creature rows checked, ${offScale} row(s) not on the x${SCALE} scale.`);
  if (offScale) console.log('  (Printed only. A row off the scale is a question, not a failure -- see the header.)');
} finally {
  await server.close();
}
