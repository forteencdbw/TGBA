// Does taking a pickup give what it says, including when it gives nothing?
//
// `updatePickup` was a private method on `Game`, so the CAPPED cases -- where a pickup is consumed at the ceiling and
// must still say so -- could only be checked by playing until you found a third upgrade. The rule decides now and
// returns what it took, so the ceiling is three lines of setup.
//
//   node scripts/probe-pickups.mjs [tree]            # defaults to this checkout

import { resolve } from 'node:path';
const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`);
};

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { updatePickups } = await server.ssrLoadModule('/src/pickups.ts');
  const { Score } = await server.ssrLoadModule('/src/score.ts');
  const { SKILLS } = await server.ssrLoadModule('/src/skills.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const { LEVEL } = await server.ssrLoadModule('/src/levels.ts');

  const MIN = 0;
  const MAX = 800;
  const water = (over = {}) => ({
    drops: [],
    playerX: 50,
    playerY: 100,
    reachMeters: 10,
    gunStreams: 1,
    rateTier: 1,
    score: new Score(),
    events: [],
    ...over,
  });
  const drop = (kind, x, y, id = null) => ({ kind, id, x, y });

  // A pickup the player is not near is carried down by the scroll and left alone.
  {
    const w = water({ drops: [drop('skill', 500, 100)] });
    const taken = updatePickups(1 / 120, MIN, MAX, w);
    check('out of reach · not taken, still there', [taken.length, w.drops.length], [0, 1]);
    check('out of reach · carried down by the scroll', Number((w.drops[0].y - 100).toFixed(4)), Number((-(LEVEL.scrollSpeed / 120)).toFixed(4)));
  }

  // A pickup below the band is dropped, not carried for ever.
  {
    const w = water({ drops: [drop('skill', 500, MIN - 100)] });
    check('below the band · culled', [updatePickups(1 / 120, MIN, MAX, w).length, w.drops.length], [0, 0]);
  }

  // An upgrade raises the gun by one row, and reports the new count.
  {
    const w = water({ drops: [drop('upgrade', 50, 100)] });
    check('upgrade · one row, not capped', updatePickups(1 / 120, MIN, MAX, w), [{ kind: 'upgrade', streams: 2, capped: false }]);
    check('upgrade · consumed', w.drops.length, 0);
    check('upgrade · a sound and a number', w.events.map((e) => e.event ?? e.kind), ['skill', 'scorePopup']);
  }

  // At the ceiling it is still consumed, and still says so -- a pickup that did nothing silently reads as a bug.
  {
    const w = water({ drops: [drop('upgrade', 50, 100)], gunStreams: mech.bullets.maxStreams });
    check('upgrade at the ceiling · consumed, capped', [updatePickups(1 / 120, MIN, MAX, w), w.drops.length], [[{ kind: 'upgrade', streams: mech.bullets.maxStreams, capped: true }], 0]);
  }

  // Two in one step: the running count carries, so the second sees the first.
  {
    const w = water({ drops: [drop('upgrade', 50, 100), drop('upgrade', 52, 100)], gunStreams: mech.bullets.maxStreams - 1 });
    const taken = updatePickups(1 / 120, MIN, MAX, w);
    const streams = taken.filter((t) => t.kind === 'upgrade').map((t) => `${t.streams}${t.capped ? 'capped' : ''}`);
    check('two upgrades in one step · the count carries', streams.sort(), [`${mech.bullets.maxStreams}capped`, `${mech.bullets.maxStreams}`].sort());
  }

  // The fire-rate ladder, to its own ceiling, which is the LADDER'S LENGTH rather than a number of its own.
  {
    const w = water({ drops: [drop('rate', 50, 100)] });
    check('rate · up one tier', updatePickups(1 / 120, MIN, MAX, w), [{ kind: 'rate', tier: 2, capped: false }]);
    const top = water({ drops: [drop('rate', 50, 100)], rateTier: mech.bullets.rateTiers.length });
    check('rate at the top · capped, consumed', [updatePickups(1 / 120, MIN, MAX, top), top.drops.length], [[{ kind: 'rate', tier: mech.bullets.rateTiers.length, capped: true }], 0]);
  }

  // A skill pickup hands over a skill that EXISTS, and one the level named is the one it hands over.
  {
    const declared = water({ drops: [drop('skill', 50, 100, SKILLS[1].id)] });
    check('skill · the declared one', updatePickups(1 / 120, MIN, MAX, declared), [{ kind: 'skill', id: SKILLS[1].id }]);

    const rolled = water({ drops: [drop('skill', 50, 100)] });
    const one = updatePickups(1 / 120, MIN, MAX, rolled);
    check('skill · rolled from the list', [one.length, SKILLS.some((s) => s.id === one[0].id)], [1, true]);
  }

  // Two pickups within reach are both taken, and scored once each.
  {
    const w = water({ drops: [drop('skill', 50, 100), drop('upgrade', 52, 100)] });
    const taken = updatePickups(1 / 120, MIN, MAX, w);
    const scored = w.events.filter((e) => e.kind === 'scorePopup');
    check('two in reach · both taken', [taken.length, w.drops.length], [2, 0]);
    check('two in reach · scored once each', [scored.length, scored[0].points === scored[1].points], [2, true]);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
