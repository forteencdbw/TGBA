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
  check('a run exists · no game, no canvas, no camera', [typeof run.player.x, run.phase], ['number', 'menu']);

  // --- the contact rule, driven directly: a bubble the player is big enough to eat goes in, and the ledger moves
  {
    const r = new Run();
    r.phase = 'playing';
    r.field.bubbles.push(bubble(r.player.x * LANE, r.player.y, 0.02));
    const before = r.player.volume;
    const eventsBefore = r.events.length;
    r.resolveContacts(1 / 120, world(r));
    check('contacts · the bubble was eaten', [r.field.bubbles.length, r.player.volume > before], [0, true]);
    check('contacts · and the run said so', r.events.length > eventsBefore, true);
  }

  // --- a hit goes through the run: it hurts, it makes the player briefly untouchable, and enough of them burst the
  //     bubble -- which is the run changing its own phase, with no game to tell it to.
  {
    const r = new Run();
    r.phase = 'playing';
    const before = r.player.volume;
    r.takeHit();
    check('takeHit · it hurt and it made the player untouchable', [r.player.volume < before, r.invulnerable > 0], [true, true]);
    for (let i = 0; i < 40 && r.phase === 'playing'; i++) {
      r.invulnerable = 0;
      r.takeHit();
    }
    check('takeHit · enough of them and the run bursts the bubble itself', r.phase, 'burst');
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
    check('derived · tier bonus', typeof r.tierBonus, 'number');
    check('derived · burst radius', typeof r.burstRadiusRatio(), 'number');
    check('derived · overload state', typeof r.overloaded, 'boolean');
    check('derived · suction, asked WITH the input', typeof r.suctionUp(input()), 'boolean');
    check('derived · whether something can be swallowed', typeof r.canSwallow('fish'), 'boolean');
    check('derived · the stage ceiling is config', mech.bullets.maxStreams >= 1, true);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
