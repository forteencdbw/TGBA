// Does a spent round do what it is supposed to do?
//
// `updateProjectiles` was a private method on `Game`, so this could only be asked by playing. It takes the water it acts
// on now, so a probe can build a crate, a fish and a round, and read what happened.
//
//   node scripts/probe-projectiles.mjs [tree]        # defaults to this checkout
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
  const { updateProjectiles } = await server.ssrLoadModule('/src/spit.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const LANE = 100;
  const MIN = 0;
  const MAX = 800;

  const scene = () => {
    const hazards = new HazardField();
    const obstacles = new ObstacleField();
    const projectiles = [];
    return { hazards, obstacles, projectiles, events: [], world: { projectiles, obstacles, hazards } };
  };
  const spit = (s, kind, x, y, vx, vy) => {
    s.projectiles.push({ kind, x, y, vx, vy, screenY: 0, radiusFraction: 0.05, age: 0 });
    return s.world;
  };
  const step = (s, dt = 1 / 120) => updateProjectiles(dt, LANE, MIN, MAX, s.world, s.events);

  // A round with nothing to hit is carried along by its own velocity and decayed.
  {
    const s = scene();
    spit(s, 'crab', 50, 100, 0, 60);
    step(s);
    const p = s.projectiles[0];
    check('empty water · still flying', [s.projectiles.length, round(p.x), round(p.vy) < 60], [1, 50, true]);
  }

  // An obstacle is the thing a round is FOR: it stops the shot, and reports the hit.
  {
    const s = scene();
    s.obstacles.spawn('crate', 50, 100);
    spit(s, 'crab', 50, 96, 0, 60);
    const hits = step(s);
    check('crate · stopped the round', [s.projectiles.length, hits], [0, 1]);
  }

  // ... so a creature standing BEHIND the crate is not hit through it.
  {
    const s = scene();
    s.obstacles.spawn('crate', 50, 100);
    const fish = s.hazards.spawnAt('fish', 50, 100, { deterministic: true });
    s.hazards.hazards.push(fish);
    const before = { x: fish.x, y: fish.y };
    spit(s, 'crab', 50, 96, 0, 60);
    step(s);
    check('crate · the fish behind it is untouched', [round(fish.x), round(fish.y)], [round(before.x), round(before.y)]);
  }

  // A creature is shoved ALONG the round's path, and lighter creatures are shoved further.
  {
    const s = scene();
    const fish = s.hazards.spawnAt('fish', 50, 100, { deterministic: true });
    s.hazards.hazards.push(fish);
    spit(s, 'crab', 50, 98, 0, 60);
    const hits = step(s);
    check('creature · hit and shoved up the path', [hits, fish.y > 100], [1, true]);
    check('creature · the sound it made', s.events.map((e) => e.event ?? e.kind), ['hit']);
  }

  {
    const light = scene();
    const small = light.hazards.spawnAt('fish', 50, 100, { deterministic: true });
    light.hazards.hazards.push(small);
    spit(light, 'crab', 50, 98, 0, 60);
    step(light);
    const heavy = scene();
    const big = heavy.hazards.spawnAt('urchin', 50, 100, { deterministic: true });
    heavy.hazards.hazards.push(big);
    spit(heavy, 'crab', 50, 98, 0, 60);
    step(heavy);
    const fishMove = small.y - 100;
    const urchinMove = big.y - 100;
    check('mass · the lighter one moves further for the same round', [round(fishMove) > round(urchinMove), round(urchinMove) > 0], [true, true]);
  }

  // An explosive round (a swallowed bomb fish) keeps going off after the first thing it touches.
  {
    const s = scene();
    const first = s.hazards.spawnAt('fish', 50, 100, { deterministic: true });
    const nearby = s.hazards.spawnAt('fish', 52, 100, { deterministic: true });
    const far = s.hazards.spawnAt('fish', 50 + 1000, 100, { deterministic: true });
    s.hazards.hazards.push(first, nearby, far);
    const farY = far.y;
    spit(s, 'bombfish', 50, 98, 0, 60);
    step(s);
    check('blast · the neighbour goes with it', [nearby.y !== 100, round(far.y)], [true, round(farY)]);
    check('blast · both sounds', s.events.map((e) => e.event ?? e.kind), ['hit', 'crab']);
  }

  // Recycle conditions: a round that has slowed to a stop, or left the band, is taken off the list.
  {
    const slow = scene();
    spit(slow, 'crab', 50, 100, 0.1, 0.1);
    step(slow);
    check('recycle · a round that has stopped', slow.projectiles.length, 0);

    const gone = scene();
    spit(gone, 'crab', 50, MAX + 100, 0, -1);
    step(gone);
    check('recycle · a round out of the band', gone.projectiles.length, 0);

    const flying = scene();
    spit(flying, 'crab', 50, 400, 0, 60);
    step(flying);
    check('recycle · a round in flight stays', flying.projectiles.length, 1);
  }

  // Two rounds, two hits, counted once each.
  {
    const s = scene();
    s.hazards.hazards.push(s.hazards.spawnAt('fish', 50, 100, { deterministic: true }));
    s.hazards.hazards.push(s.hazards.spawnAt('fish', 20, 300, { deterministic: true }));
    spit(s, 'crab', 50, 98, 0, 60);
    spit(s, 'crab', 20, 298, 0, 60);
    check('counting · two rounds, two hits', step(s), 2);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
