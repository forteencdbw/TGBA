// Does a Boids school swim as one body, and does the debug level load without touching the ladder?
//
// Everything here runs on `src/*.ts` through Vite's SSR transform: no canvas, no Pixi, no camera. The school's rules are
// pure arithmetic over a list of hazards, so the test is the arithmetic -- a school is placed through the same
// `placeEntry` the game uses and stepped through the same `HazardField.update`.
//
//   node scripts/probe-boids.mjs [tree]          # defaults to this checkout
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
const atLeast = (label, got, min) => {
  const ok = Number.isFinite(got) && got >= min;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${Number(got).toFixed(3)}${ok ? '' : ` (want at least ${min})`}`);
};
const atMost = (label, got, max) => {
  const ok = Number.isFinite(got) && got <= max;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${Number(got).toFixed(3)}${ok ? '' : ` (want at most ${max})`}`);
};

/** A seeded generator, so two runs that differ only in where the player stands can be compared exactly. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const levels = await server.ssrLoadModule('/src/levels.ts');
  const { placeEntry } = await server.ssrLoadModule('/src/placement.ts');
  const { EntityField } = await server.ssrLoadModule('/src/entities.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const { LEVELS, DEBUG_LEVEL, isDebugLevel, selectLevel, installSpawnBlocks } = levels;

  // ---------------------------------------------------------------------------------------------
  // The debug level is a level that is not on the ladder.
  // ---------------------------------------------------------------------------------------------
  check('debug level · not on the ladder', LEVELS.some((l) => l.id === DEBUG_LEVEL.id), false);
  check('debug level · recognised', [isDebugLevel(DEBUG_LEVEL), isDebugLevel(LEVELS[0])], [true, false]);
  check('debug level · water is the first level\'s', [DEBUG_LEVEL.palette === LEVELS[0].palette, DEBUG_LEVEL.looksLike], [true, LEVELS[0].id]);
  const schoolEntries = DEBUG_LEVEL.entries.filter((e) => e.school !== undefined);
  check('debug level · school entries carry their block', [...new Set(schoolEntries.map((e) => typeof e.school))], ['number']);
  const bySchool = new Map();
  for (const e of schoolEntries) bySchool.set(e.school, (bySchool.get(e.school) ?? 0) + 1);
  check('debug level · two schools of fifty', [...bySchool.values()], [50, 50]);
  check('debug level · a school has no delay between its fish', schoolEntries.every((e) => e.pathDelaySeconds === undefined), true);

  // Selecting it and coming back leaves the ladder's level selectable again.
  check('select · the debug level can be chosen', selectLevel(DEBUG_LEVEL.id), true);
  check('select · it is the live level', levels.LEVEL.id, DEBUG_LEVEL.id);

  // The loader refuses a school that cannot exist, rather than ignoring the key.
  const refuses = (label, block) => {
    let message = '';
    try {
      installSpawnBlocks([block]);
    } catch (e) {
      message = String(e.message);
    }
    check(`loader · ${label}`, message.includes('spawns[0]'), true);
  };
  refuses('boids on a shark', { at: 10, kind: 'shark', count: 3, path: 'straight', boids: true });
  refuses('boids with no path', { at: 10, kind: 'fish', count: 3, boids: true });
  refuses('boids from a side', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, from: 'left' });
  refuses('boids that is not a boolean', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: 'yes' });
  check('loader · a good school is accepted', installSpawnBlocks([{ at: 10, kind: 'fish', count: 7, path: 'straight', boids: true }]), 7);
  selectLevel(LEVELS[0].id);

  // ---------------------------------------------------------------------------------------------
  // A school, placed the way the game places it, and stepped the way the game steps it.
  // ---------------------------------------------------------------------------------------------
  selectLevel(DEBUG_LEVEL.id);
  const LANE = 361;
  const VIEW = { min: 0, max: 800 };
  const cfg = mech.hazards.boids;
  const seedEntries = DEBUG_LEVEL.entries.filter((e) => e.school === schoolEntries[0].school);

  const makeField = (seed) => {
    const random = Math.random;
    Math.random = seeded(seed);
    const world = { field: new EntityField(), obstacles: new ObstacleField(), hazards: new HazardField(), playerRadiusFraction: 0.08 };
    for (const entry of seedEntries) placeEntry(entry, VIEW.max, VIEW, LANE, world);
    Math.random = random;
    return world.hazards;
  };
  const ctxFor = (playerX, playerY, elapsed) => ({
    min: VIEW.min,
    max: VIEW.max,
    laneWidth: LANE,
    playerX,
    playerY,
    playerRadiusFraction: 0.08,
    descentSpeed: 30,
    elapsed,
    invulnerable: true,
    struggling: false,
    playerVolume: 1,
    canEat: () => false,
    suction: null,
    bubbles: [],
    eatenBubbleIds: [],
    splitCount: 0,
  });
  const stats = (field) => {
    const fish = field.hazards.filter((h) => h.boid);
    const n = fish.length;
    const cx = fish.reduce((s, h) => s + h.x, 0) / n;
    const cy = fish.reduce((s, h) => s + h.y, 0) / n;
    const spread = fish.reduce((s, h) => s + Math.hypot(h.x - cx, h.y - cy), 0) / n;
    // The mean unit velocity: 1 when every fish is going the same way, near 0 when they are going every which way.
    let ux = 0;
    let uy = 0;
    for (const h of fish) {
      const sp = Math.hypot(h.boid.vx, h.boid.vy) || 1;
      ux += h.boid.vx / sp;
      uy += h.boid.vy / sp;
    }
    const polarisation = Math.hypot(ux, uy) / n;
    let nearest = 0;
    for (const a of fish) {
      let best = Infinity;
      for (const b of fish) if (a !== b) best = Math.min(best, Math.hypot(a.x - b.x, a.y - b.y));
      nearest += best;
    }
    const xs = fish.map((h) => h.x);
    const ys = fish.map((h) => h.y);
    const length = Math.max(...xs) - Math.min(...xs);
    const width = Math.max(...ys) - Math.min(...ys);
    return { n, cx, cy, spread, polarisation, nearest: nearest / n, length, width };
  };

  {
    const field = makeField(7);
    const leaderStart = [...field.schools.values()][0];
    check('placed · one school', field.schools.size, 1);
    check('placed · fifty fish, all members', field.hazards.filter((h) => h.boid).length, 50);
    check('placed · no fish carries a spline of its own', field.hazards.every((h) => h.path === null), true);
    check(
      'placed · all born inside the cloud round the leader',
      field.hazards.every((h) => Math.hypot(h.x - leaderStart.x, h.y - leaderStart.y) <= cfg.spawnSpread * LANE + 1e-6),
      true,
    );
    check('placed · born off the lane, where a school starts', field.hazards.every((h) => h.x > LANE), true);
    check('placed · one variety, the block\'s', new Set(field.hazards.map((h) => h.variety)).size, 1);

    let t = 0;
    const dt = 1 / 30;
    let sawNaN = false;
    const samples = {};
    const SECONDS = DEBUG_LEVEL.paths.straight.seconds;
    const marks = [SECONDS * 0.25, SECONDS * 0.5, SECONDS * 0.75];
    for (; t < 60 && (field.hazards.length > 0 || t < 0.1); t += dt) {
      field.update(dt, ctxFor(LANE * 0.5, 400, t));
      if (field.hazards.some((h) => !Number.isFinite(h.x) || !Number.isFinite(h.y))) sawNaN = true;
      for (const mark of marks) if (Math.abs(t - mark) < dt / 2) samples[mark] = stats(field);
    }
    check('swim · no fish went NaN', sawNaN, false);
    const [m3, m6, m9] = marks;
    const s3 = samples[m3];
    const s6 = samples[m6];
    const s9 = samples[m9];
    atLeast('swim · the school is still fifty a quarter of the way along', s3.n, 50);
    // Held together: the mean distance from the centroid is a fraction of the lane, not a spray across it.
    atMost('swim · cohesion, mean distance from centre (lane widths)', s6.spread / LANE, 0.35);
    // And not a pile: the average nearest neighbour is not on top of the fish.
    atLeast('swim · separation, mean nearest neighbour (lane widths)', s6.nearest / LANE, cfg.separationRadius * 0.25);
    // Moving the same way.
    atLeast('swim · alignment, polarisation halfway along', s6.polarisation, 0.8);
    // And following the leader along the path, which runs right to left.
    check('swim · the centre travels left', s3.cx > s6.cx && s6.cx > s9.cx, true);
    // Close to the leader rather than strung out behind it.
    const px = DEBUG_LEVEL.paths.straight.points;
    const leaderX = (tt) => LANE * (px[0].x + ((px[px.length - 1].x - px[0].x) * tt) / SECONDS);
    atMost('swim · the centre keeps up with the leader halfway along (lane widths)', Math.abs(s6.cx - leaderX(m6)) / LANE, 0.3);

    check('end · every fish left the water by itself', field.hazards.length, 0);
    // The school is dropped by the NEXT frame's pre-pass, which is the first one that finds it has no members.
    field.update(dt, ctxFor(LANE * 0.5, 400, t));
    check('end · and the school was dropped with them', field.schools.size, 0);
    atMost('end · within a minute', t, 60);
    // Long, not round: the school is at least twice as long as it is wide along its heading (the path runs along x).
    atLeast('shape · length over width halfway along', s6.length / s6.width, 2);
  }

  // ---------------------------------------------------------------------------------------------
  // The school does not look at the player: the same school, with the player in the middle of it, swims identically.
  // ---------------------------------------------------------------------------------------------
  {
    const far = makeField(11);
    const near = makeField(11);
    const dt = 1 / 30;
    for (let t = 0; t < 3; t += dt) {
      far.update(dt, ctxFor(LANE * 0.05, 40, t));
      const c = stats(near);
      near.update(dt, ctxFor(c.cx, c.cy, t));
    }
    const a = stats(far);
    const b = stats(near);
    check('player · standing in the school changes nothing', [a.cx.toFixed(6), a.cy.toFixed(6)], [b.cx.toFixed(6), b.cy.toFixed(6)]);
  }

  // ---------------------------------------------------------------------------------------------
  // A fish that is shot is driven off, and the school neither drags it back nor steers it any more.
  // ---------------------------------------------------------------------------------------------
  {
    const field = makeField(3);
    const dt = 1 / 30;
    for (let t = 0; t < 2; t += dt) field.update(dt, ctxFor(LANE * 0.05, 40, t));
    const victim = field.hazards.find((h) => h.boid);
    const outcome = field.hit(victim, 9999);
    check('shot · a lethal hit drives it off', outcome, 'fled');
    const before = { vx: victim.boid.vx, vy: victim.boid.vy };
    for (let t = 0; t < 0.5; t += dt) field.update(dt, ctxFor(LANE * 0.05, 40, 2 + t));
    check('shot · the school stopped steering it', [victim.boid.vx, victim.boid.vy], [before.vx, before.vy]);
    check('shot · the rest of the school carries on', field.hazards.filter((h) => h.boid && !h.flee).length >= 49 - 0, true);
  }
} finally {
  await server.close();
}

if (failures) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
