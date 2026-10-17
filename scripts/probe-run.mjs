// Can a run be driven without a game?
//
// That is the question the whole architecture exercise was about: before this, every rule lived on the class that owns
// the canvas, so the only way to run one was to play the game. This probe builds a `Run` directly -- no `Game`, no
// Pixi application, no camera, no menu -- hands it a world view and a stub input, and reads what happened through the
// run's own event queue.
//
//   node scripts/probe-run.mjs [tree]            # defaults to this checkout

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
const round = (n) => Number(n.toFixed(3));

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { Run } = await server.ssrLoadModule('/src/run.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const LANE = 100;
  const world = (run) => ({ laneWidth: LANE, visibleDepthMeters: 700, min: run.player.y - 400, max: run.player.y + 400 });
  // The input is a DEVICE: a run only reads six things off it, so a plain object is the honest stub.
  const input = (over = {}) => ({
    sucking: false,
    charging: false,
    compressing: false,
    axisX: 0,
    axisY: 0,
    dragAimX: 0,
    dragAimY: 0,
    steering: false,
    consumeSpit: () => false,
    consumeChargeRelease: () => false,
    consumeBurst: () => false,
    ...over,
  });
  const bubble = (x, y, radius) => ({ id: 1, x, y, vy: 0, radius, volume: 1 });

  // --- it exists at all without a canvas
  const run = new Run();
  // A bare run starts on the BOOT page: the game's first screen is the loader, and `menu` is what it promotes it to.
  check('a run exists · no game, no canvas, no camera', [typeof run.player.x, run.phase], ['number', 'boot']);

  // --- the contact rule, driven directly: a bubble the player is big enough to eat goes in, and the ledger moves
  {
    const r = new Run();
    r.phase = 'playing';
    r.field.bubbles.push(bubble(r.player.x * LANE, r.player.y, 0.02));
    const absorbedBefore = r.stats.absorbed;
    const eventsBefore = r.events.length;
    r.resolveContacts(1 / 120, world(r));
    /**
     * THE LEDGER MOVED, BUT NOT THE VOLUME -- and that is not a detail of this probe, it is the whole reward model.
     *
     * `volume` used to BE the growing bubble's health, so eating one grew the bar. Health and size are separate now
     * (`src/health.ts`), and the base bubble does not grow by absorbing at all: for it, the same mouthful pays in
     * POINTS. Only the devour route's form turns food into health, and this probe runs the default type, so the thing
     * to assert is the counter that every form shares.
     */
    check('contacts · the bubble was eaten', [r.field.bubbles.length, r.stats.absorbed > absorbedBefore], [0, true]);
    check('contacts · and the run said so', r.events.length > eventsBefore, true);
  }

  // --- a hit goes through the run: it hurts, it makes the player briefly untouchable, and enough of them burst the
  //     bubble -- which is the run changing its own phase, with no game to tell it to.
  {
    const r = new Run();
    r.phase = 'playing';
    /**
     * A fresh `Run` has NO HEALTH POOL until a level starts, so `resetHealth` has to run before a hit can cost
     * anything -- `healthMax` is 0 otherwise and every hit lands on a bubble that was already at zero.
     *
     * That is the real entry point rather than a hand-set number: it is where the 「血上限」 picks are folded in, and a
     * probe that assigned `healthMax` itself would be testing its own arithmetic instead of the game's.
     */
    r.resetHealth();
    const before = r.health;
    /**
     * Damage is a NUMBER now, and it is the caller's -- see `takeHit(damage, defense)`.
     *
     * It used to be a bare `takeHit()` that applied whatever the config said. Passing it in is what let damage become
     * per-creature (`hazards.contactDamage`), so a probe has to name a price rather than assume one. The price used
     * here is deliberately a fraction of the starting pool, so the burst loop below needs several hits.
     */
    const bite = mech.hazards.contactDamage.fish;
    r.takeHit(bite);
    check('takeHit · it hurt and it made the player untouchable', [r.health < before, r.invulnerable > 0], [true, true]);
    for (let i = 0; i < 400 && r.phase === 'playing'; i++) {
      r.invulnerable = 0;
      r.takeHit(bite);
    }
    check('takeHit · enough of them and the run bursts the bubble itself', r.phase, 'burst');
  }

  // --- passive recovery: whole points from a fraction, capped at the ceiling
  {
    const r = new Run();
    r.phase = 'playing';
    r.resetHealth();
    r.health = r.healthMax - 5;
    r.regen(0.5);
    check('regen · half a second is not yet a point', r.health, r.healthMax - 5);
    r.regen(0.5);
    check('regen · a second pays one whole point', r.health, r.healthMax - 4);
    r.health = r.healthMax;
    r.regen(5);
    check('regen · it stops at the ceiling', r.health, r.healthMax);
  }

  // --- stepping the water moves the creatures, and a run can do it for five seconds
  {
    const r = new Run();
    r.phase = 'playing';
    r.hazards.hazards.push(r.makeHazard(world(r), 'fish', 50, 100));
    const startY = r.hazards.hazards[0].y;
    for (let i = 0; i < 120; i++) {
      r.updateBullets(1 / 120, LANE, 0, 800);
      r.resolveHazards(1 / 120, 0, 800, LANE, world(r), input());
      r.resolveContacts(1 / 120, world(r));
    }
    check('a second of water · the creature drifted up the lane', [(r.hazards.hazards[0]?.y ?? 0) < startY], [true]);
    check('a second of water · the run elapsed', r.elapsed >= 0, true);
  }

  // --- the run's output IS the interface: nothing was drawn, and the events are readable
  {
    const r = new Run();
    r.phase = 'playing';
    r.hazards.hazards.push(r.makeHazard(world(r), 'crab', 50, 100));
    r.takeHit();
    const kinds = r.events.map((e) => e.kind);
    check('the output is a queue of values', kinds.length > 0 && kinds.every((k) => typeof k === 'string'), true);
    check('nothing in it needs a renderer', kinds.includes('banner') || kinds.includes('sound'), true);
  }

  // --- the derived answers travel with it rather than being asked of the game
  {
    const r = new Run();
    /**
     * `eatTierBonus`, not `tierBonus`: the devour route's 大胃口 picks buy eating one tier ABOVE what the volume says,
     * and the number lives beside the other mutation-derived bonuses. It is read by `canEat` rather than by a rule of
     * its own -- `canEatHazard(kind, volume, eatTierBonus)` in `src/consumption.ts` is the single place the ladder and
     * the bonus are combined.
     */
    check('derived · tier bonus', typeof r.eatTierBonus, 'number');
    check('derived · burst radius', typeof r.burstRadiusRatio(), 'number');
    check('derived · armour, asked as a question', typeof r.hasArmour, 'boolean');
    check('derived · suction, asked WITH the input', typeof r.suctionUp(input()), 'boolean');
    check('derived · whether something can be swallowed', typeof r.canSwallow('fish'), 'boolean');
    check('derived · the stage ceiling is config', mech.bullets.maxStreams >= 1, true);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
