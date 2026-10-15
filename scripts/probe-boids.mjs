// Does a Boids school swim as one body, can a school be put in the background where nothing can touch it, and does the debug
// level load without touching the ladder?
//
// Everything here runs on `src/*.ts` through Vite's SSR transform: no canvas, no Pixi, no camera. The school's rules are
// pure arithmetic over a list of hazards, so the test is the arithmetic -- a school is placed through the same
// `placeEntry` the game uses and stepped through the same `HazardField.update`.
//
// What it cannot see is the picture: the draw order, the layer the background sits in and the tints are checked in the
// real game (the sprites need a canvas).
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
const std = (values) => {
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  return Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length);
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
  const { HazardField, hazardSizeFraction, depthTint } = await server.ssrLoadModule('/src/hazards.ts');
  const { backScaleAt, backTintAt } = await server.ssrLoadModule('/src/backSchools.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const boidsModule = await server.ssrLoadModule('/src/boids.ts');
  const { LEVELS, DEBUG_LEVEL, isDebugLevel, selectLevel, installSpawnBlocks } = levels;

  // ---------------------------------------------------------------------------------------------
  // The debug level is a level that is not on the ladder.
  // ---------------------------------------------------------------------------------------------
  check('debug level · not on the ladder', LEVELS.some((l) => l.id === DEBUG_LEVEL.id), false);
  check('debug level · recognised', [isDebugLevel(DEBUG_LEVEL), isDebugLevel(LEVELS[0])], [true, false]);
  check('debug level · water is the first level\'s', [DEBUG_LEVEL.palette === LEVELS[0].palette, DEBUG_LEVEL.looksLike], [true, LEVELS[0].id]);
  const allSchoolEntries = DEBUG_LEVEL.entries.filter((e) => e.school !== undefined);
  const schoolEntries = allSchoolEntries.filter((e) => e.layer === undefined);
  const backEntries = allSchoolEntries.filter((e) => e.layer === 'back');
  check('debug level · school entries carry their block', [...new Set(allSchoolEntries.map((e) => typeof e.school))], ['number']);
  const countBy = (entries) => {
    const m = new Map();
    for (const e of entries) m.set(e.school, (m.get(e.school) ?? 0) + 1);
    return m;
  };
  check('debug level · two foreground schools of 120', [...countBy(schoolEntries).values()], [120, 120]);
  check('debug level · several background schools', [...countBy(backEntries).values()].length >= 3, true);
  check('debug level · each background school has a distance in 0..1', backEntries.every((e) => typeof e.distance === 'number' && e.distance >= 0 && e.distance <= 1), true);
  check('debug level · and a foreground one has none', schoolEntries.every((e) => e.layer === undefined && e.distance === undefined), true);
  // The author's wish: some background schools swim past first, to give the player notice, and THEN the foreground school.
  const firstFrontAt = Math.min(...schoolEntries.map((e) => e.at));
  const earlyBacks = new Set(backEntries.filter((e) => e.at < firstFrontAt).map((e) => e.school));
  check('debug level · at least three background schools come on before the first foreground one', earlyBacks.size >= 3, true);
  check('debug level · every fish knows its place in the school', allSchoolEntries.every((e) => Number.isInteger(e.schoolSize) && Number.isInteger(e.schoolIndex)), true);
  check('debug level · a school has no delay between its fish', allSchoolEntries.every((e) => e.pathDelaySeconds === undefined), true);
  check('debug level · no entry still carries the old background count', allSchoolEntries.some((e) => 'schoolDecor' in e), false);

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
  refuses('the old background count, which is gone', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, backdropFish: 50 });
  refuses('a background layer that is not a school', { at: 10, kind: 'fish', count: 3, path: 'straight', layer: 'back', distance: 0.5 });
  refuses('a background school with no distance', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, layer: 'back' });
  refuses('a distance on a foreground school', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, distance: 0.5 });
  refuses('a distance beyond far', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, layer: 'back', distance: 1.5 });
  refuses('a distance below near', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, layer: 'back', distance: -0.1 });
  refuses('a layer that is neither', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, layer: 'middle' });
  // The refusal of a school born on the screen happens when a level FILE is read, so it is asserted against the real
  // file's own numbers here and exercised the other way round by hand (move the debug path's first point into the lane and
  // the page refuses to load, naming the path).
  check('loader · the debug level\'s school path starts off the screen', (() => {
    const p0 = DEBUG_LEVEL.paths.straight.points[0];
    return p0.x < -mech.hazards.boids.spawnSpread || p0.x > 1 + mech.hazards.boids.spawnSpread || p0.y >= 0.2;
  })(), true);
  check('loader · a good school is accepted', installSpawnBlocks([{ at: 10, kind: 'fish', count: 7, path: 'straight', boids: true }]), 7);
  check('loader · and so is a good background school', installSpawnBlocks([{ at: 10, kind: 'fish', count: 7, path: 'straight', boids: true, layer: 'back', distance: 0.5 }]), 7);
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
  const ctxFor = (playerX, playerY, elapsed, invulnerable = true) => ({
    min: VIEW.min,
    max: VIEW.max,
    laneWidth: LANE,
    playerX,
    playerY,
    playerRadiusFraction: 0.08,
    driftSpeed: 30,
    cameraRise: 0,
    elapsed,
    invulnerable,
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
    return { n, cx, cy, spread, polarisation, nearest: nearest / n, length, width, speedSd: std(fish.map((h) => Math.hypot(h.boid.vx, h.boid.vy))) };
  };

  {
    const field = makeField(7);
    const leaderStart = [...field.schools.values()][0];
    const fish = field.hazards;
    check('placed · one school', field.schools.size, 1);
    check('placed · 120 fish, all members', fish.filter((h) => h.boid).length, 120);
    check('placed · no fish carries a spline of its own', fish.every((h) => h.path === null), true);
    // The cloud is centred one radius BEHIND the leader, so the leader is at its front edge.
    const cloudX = leaderStart.x - leaderStart.dirX * cfg.spawnSpread * LANE;
    const cloudY = leaderStart.y - leaderStart.dirY * cfg.spawnSpread * LANE;
    check(
      'placed · all born inside the cloud behind the leader',
      fish.every((h) => Math.hypot(h.x - cloudX, h.y - cloudY) <= cfg.spawnSpread * LANE + 1e-6),
      true,
    );
    check('placed · and none is ahead of the leader to begin with', fish.every((h) => (h.x - leaderStart.x) * leaderStart.dirX + (h.y - leaderStart.y) * leaderStart.dirY <= 1e-6), true);
    check('placed · born off the lane, where a school starts', fish.every((h) => h.x > LANE), true);
    check('placed · one variety, the block\'s', new Set(fish.map((h) => h.variety)).size, 1);

    // Size: the real fish are `scale` of an ordinary one, and their hitbox is too.
    check('size · every real fish is drawn at the configured scale', [...new Set(fish.map((h) => h.scale))], [cfg.scale]);
    check('size · the hitbox follows the scale', +hazardSizeFraction('fish', cfg.scale).toFixed(6), +(hazardSizeFraction('fish') * cfg.scale).toFixed(6));
    check('size · and an ordinary fish is still full size', new HazardField().spawnForTest('fish', 0, 0).scale, 1);

    // Individuality: the three numbers that stop it being a rigid body, and the depth that orders it.
    const speedVars = fish.map((h) => h.boid.speedVar);
    check('variation · every fish has its own speed, within the jitter', [new Set(speedVars).size > 100, Math.min(...speedVars) >= 1 - cfg.speedJitter - 1e-9, Math.max(...speedVars) <= 1 + cfg.speedJitter + 1e-9], [true, true, true]);
    const depths = fish.map((h) => h.boid.d);
    check('depth · far first, near last, evenly spread, inside 0..1', [depths.every((d, i) => i === 0 || d < depths[i - 1]), depths[0] < 1, depths[depths.length - 1] > 0], [true, true, true]);
    check('depth · the far ones are tinted, the near ones are not', [depthTint(0) === 0xffffff, depthTint(1) !== 0xffffff, depthTint(1) < depthTint(0)], [true, true, true]);

    check('placed · a foreground school makes no background fish', field.back.fishCount, 0);
    check('facing · every real fish faces the way the school goes from its first frame', fish.every((h) => h.heading === Math.sign(leaderStart.dirX)), true);

    let t = 0;
    const dt = 1 / 30;
    let sawNaN = false;
    const samples = {};
    const school0 = leaderStart;
    const SECONDS = DEBUG_LEVEL.paths.straight.seconds;
    const marks = [SECONDS * 0.25, SECONDS * 0.5, SECONDS * 0.75];
    // Nothing teleports and nothing turns round: the biggest single-frame step of any fish, and every heading any fish had
    // while the school was swimming.
    let biggestStep = 0;
    const headings = new Set();
    const lastAt = new Map();
    for (; t < 60 && (field.hazards.length > 0 || t < 0.1); t += dt) {
      field.update(dt, ctxFor(LANE * 0.5, 400, t));
      for (const h of field.hazards) {
        if (!h.boid) continue;
        headings.add(h.heading);
        const last = lastAt.get(h);
        if (last) biggestStep = Math.max(biggestStep, Math.hypot(h.x - last.x, h.y - last.y));
        lastAt.set(h, { x: h.x, y: h.y });
      }
      if (field.hazards.some((h) => !Number.isFinite(h.x) || !Number.isFinite(h.y))) sawNaN = true;
      for (const mark of marks) if (!samples[mark] && school0.elapsed >= mark && field.hazards.some((h) => h.boid && !h.flee)) samples[mark] = { ...stats(field), leaderX: school0.x };
    }
    check('swim · nothing went NaN', sawNaN, false);
    // 0.8 lane widths a second is the fastest a fish may go (`maxSpeed`), so a frame at 30 fps is under 0.03 of a lane; a
    // fish that pops into view or snaps to a place would show as a step many times that.
    atMost('swim · no fish jumps in a frame (lane widths)', biggestStep / LANE, 0.06);
    check('facing · no real fish ever turned round: the only heading was the school\'s', [...headings], [Math.sign(boidsModule.createSchool(1, DEBUG_LEVEL.paths.straight, 400, LANE, 800).dirX)]);
    const [m3, m6, m9] = marks;
    const s3 = samples[m3];
    const s6 = samples[m6];
    const s9 = samples[m9];
    atLeast('swim · the school is still 120 a quarter of the way along', s3.n, 120);
    atMost('swim · cohesion, mean distance from centre (lane widths)', s6.spread / LANE, 0.35);
    atLeast('swim · separation, mean nearest neighbour (lane widths)', s6.nearest / LANE, 0.01);
    atLeast('swim · alignment, polarisation halfway along', s6.polarisation, 0.8);
    atLeast('swim · it is NOT a rigid body: the fish do not all go the same speed (lane widths per second)', s6.speedSd / LANE, 0.005);
    check('swim · the centre travels left', s3.cx > s6.cx && s6.cx > s9.cx, true);
    const px = DEBUG_LEVEL.paths.straight.points;
    void px;
    // The leader waits for its school and stays at the front of it: the school's centre is behind the leader, by no more than
    // the school is long. (Before the leader waited, the centre was 0.66 of a lane from it by halfway, and growing.)
    atMost('swim · the school is not left behind: its centre is within its own length of the leader (lane widths)', Math.abs(s6.cx - s6.leaderX) / LANE, s6.length / LANE);
    atLeast('shape · length over width halfway along', s6.length / s6.width, 1.5);
    // The reported bug: a long stream at the start that was one lump by the end. Three quarters along, still a stream.
    atLeast('shape · and still a stream three quarters along, as the school is leaving (length over width)', s9.length / s9.width, 2.5);

    check('end · every fish left the water by itself', field.hazards.length, 0);
    // A school is dropped with its last fish: nothing keeps it alive, so a finished level's schools do not pile up.
    field.update(dt, ctxFor(LANE * 0.5, 400, t));
    check('end · and the school was dropped with it', field.schools.size, 0);
    atMost('end · within a minute', t, 60);
    // The leader waits for a school that has fallen behind and hurries to take the front back, so the crossing is the path's
    // seconds give or take -- but not forever, and not a fraction of it.
    atLeast('wait · the crossing took about the path\'s seconds (at least 80%)', t, SECONDS * 0.8);
    atMost('wait · and no more than twice as long (seconds)', t, SECONDS * 2);
  }

  // ---------------------------------------------------------------------------------------------
  // The leader walks at a constant speed, and does not stop where the path ends.
  // ---------------------------------------------------------------------------------------------
  {
    const path = DEBUG_LEVEL.paths['back-high'];
    const keep = cfg.wobbleAmplitude;
    cfg.wobbleAmplitude = 0;
    const school = boidsModule.createSchool(1, path, 400, LANE, 800);
    const speeds = [];
    const dt = 1 / 60;
    while (!school.finished && speeds.length < 100000) {
      boidsModule.advanceLeader(school, dt, LANE, 800);
      if (school.elapsed > dt * 3 && !school.finished) speeds.push(Math.hypot(school.vx, school.vy));
    }
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    // Without the arc-length walk the same path's speed ranged over a factor of two as the curve's parameter bunched up.
    atMost('leader · constant speed along a curved path: the widest departure from the mean (share of it)', Math.max(...speeds.map((v) => Math.abs(v - mean))) / mean, 0.05);
    const parked = { x: school.x, y: school.y };
    for (let i = 0; i < 60; i++) boidsModule.advanceLeader(school, dt, LANE, 800);
    atLeast('leader · after the path ends it goes on out of the picture, not parked (lane widths in a second)', Math.hypot(school.x - parked.x, school.y - parked.y) / LANE, 0.1);
    atLeast('leader · at the speed it arrived with (metres per second)', Math.hypot(school.vx, school.vy), mean * 0.9);
    cfg.wobbleAmplitude = keep;
  }

  // A school longer than the screen, and a long crossing, for a level that wants "this school has been going a long time".
  {
    const base = seedEntries[0];
    const keepSeconds = DEBUG_LEVEL.paths.straight.seconds;
    DEBUG_LEVEL.paths.straight.seconds = 20;
    const random = Math.random;
    Math.random = seeded(15);
    const world = { field: new EntityField(), obstacles: new ObstacleField(), hazards: new HazardField(), playerRadiusFraction: 0.08 };
    for (let i = 0; i < 200; i++) placeEntry({ ...base, schoolSize: 200, schoolIndex: i }, VIEW.max, VIEW, LANE, world);
    Math.random = random;
    const field = world.hazards;
    let widest = 0;
    let ratioLate = 0;
    const dt = 1 / 30;
    for (let t = 0; t < 30 && field.hazards.length > 100; t += dt) {
      field.update(dt, ctxFor(LANE * 0.5, 400, t));
      const fish = field.hazards.filter((h) => h.boid);
      if (fish.length < 150) break;
      const xs = fish.map((h) => h.x).sort((a, b) => a - b);
      const ys = fish.map((h) => h.y);
      const extent = (xs[Math.floor(0.98 * (xs.length - 1))] - xs[Math.floor(0.02 * (xs.length - 1))]) / LANE;
      widest = Math.max(widest, extent);
      const my = ys.reduce((a, b) => a + b, 0) / ys.length;
      const wid = Math.sqrt(ys.reduce((a, b) => a + (b - my) ** 2, 0) / ys.length) / LANE;
      if (t > 8) ratioLate = extent / (4 * wid);
    }
    DEBUG_LEVEL.paths.straight.seconds = keepSeconds;
    atLeast('long · a school of 200 is longer than the screen is wide at some point (lane widths)', widest, 1.2);
    atLeast('long · and well into a 20 second crossing it is still a stream, not a lump (length over width, a lump is about 1)', ratioLate, 2.0);
  }

  // ---------------------------------------------------------------------------------------------
  // The leader snakes, and snakes less than its amplitude.
  // ---------------------------------------------------------------------------------------------
  {
    const path = DEBUG_LEVEL.paths.straight;
    const lateral = (amplitude) => {
      const keep = cfg.wobbleAmplitude;
      cfg.wobbleAmplitude = amplitude;
      const school = boidsModule.createSchool(1, path, 400, LANE, 800);
      let worst = 0;
      for (let t = 0; t < path.seconds + 0.5; t += 1 / 30) {
        boidsModule.advanceLeader(school, 1 / 30, LANE, 800);
        // The straight path is level in the water, so any departure from its own y is the snaking.
        worst = Math.max(worst, Math.abs(school.y - (400 + path.points[0].y * 800)));
      }
      cfg.wobbleAmplitude = keep;
      return worst / LANE;
    };
    atMost('wobble · off, the leader stays on the line (lane widths)', lateral(0), 1e-6);
    atLeast('wobble · on, the leader leaves the line (lane widths)', lateral(cfg.wobbleAmplitude), cfg.wobbleAmplitude * 0.3);
    atMost('wobble · and never by more than its amplitude', lateral(cfg.wobbleAmplitude), cfg.wobbleAmplitude + 1e-6);
  }

  // ---------------------------------------------------------------------------------------------
  // The leader reaches only the fish near it, and only turns their velocity -- no spring to a position.
  // ---------------------------------------------------------------------------------------------
  {
    const path = DEBUG_LEVEL.paths.straight;
    const lone = (distanceLane, away) => {
      // One fish alone in the school (nothing for alignment, cohesion or separation to act on), `distanceLane` from the
      // leader, at rest relative to the water. What it does next is the leader's doing and nobody else's.
      const f = new HazardField();
      const school = boidsModule.createSchool(1, path, 400, LANE, 800);
      school.vx = -100;
      school.vy = 0;
      school.dirX = -1;
      school.dirY = 0;
      const h = f.spawnForTest('fish', school.x + away * distanceLane * LANE, school.y);
      h.boid = { school: 1, vx: 0, vy: 0, speedVar: 1, d: 0.5 };
      boidsModule.steerSchool([h], school, 1 / 30, LANE);
      return { vx: h.boid.vx, vy: h.boid.vy, x: h.x, y: h.y };
    };
    const inside = lone(cfg.leaderReach * 0.3, 1);
    check('leader · a fish inside its reach is steered toward the leader\'s velocity', inside.vx < -1, true);
    // Between the reach and the tether: nothing -- not its velocity, and (checked on the position terms by there being no
    // force at all) not a pull. `minSpeed` still keeps it moving, so compare against the floor.
    const between = lone((cfg.leaderReach + cfg.leaderTether) / 2, 1);
    check('leader · a fish between the reach and the tether is not touched by it', Math.abs(between.vx) <= cfg.minSpeed * LANE + 1e-6, true);
    const beyond = lone(cfg.leaderTether * 1.8, 1);
    check('leader · a fish far beyond the tether is pulled back toward it', beyond.vx < -1, true);
    const beyondOther = lone(cfg.leaderTether * 1.8, -1);
    check('leader · from the other side too', beyondOther.vx > 1, true);
  }

  // ---------------------------------------------------------------------------------------------
  // The BACKGROUND layer: the same simulation, with nothing in the game able to touch it.
  // ---------------------------------------------------------------------------------------------
  {
    const backBlock = backEntries[0].school;
    const backSet = backEntries.filter((e) => e.school === backBlock);
    const SIZE = backSet.length;
    const makeBack = (seed, entries = backSet, distanceOf = (e) => e.distance) => {
      const random = Math.random;
      Math.random = seeded(seed);
      const world = { field: new EntityField(), obstacles: new ObstacleField(), hazards: new HazardField(), playerRadiusFraction: 0.08 };
      for (const entry of entries) placeEntry({ ...entry, distance: distanceOf(entry) }, VIEW.max, VIEW, LANE, world);
      Math.random = random;
      return world.hazards;
    };
    const backStats = (field) => {
      const fish = [...field.back.schools.values()].flatMap((s) => s.members);
      const n = fish.length;
      const cx = fish.reduce((s, f) => s + f.x, 0) / n;
      const cy = fish.reduce((s, f) => s + f.y, 0) / n;
      let ux = 0;
      let uy = 0;
      let speed = 0;
      for (const f of fish) {
        const sp = Math.hypot(f.boid.vx, f.boid.vy) || 1;
        ux += f.boid.vx / sp;
        uy += f.boid.vy / sp;
        speed += Math.hypot(f.boid.vx, f.boid.vy);
      }
      const xs = fish.map((f) => f.x);
      return { n, cx, cy, polarisation: Math.hypot(ux, uy) / n, speed: speed / n, length: Math.max(...xs) - Math.min(...xs) };
    };

    {
      const field = makeBack(4);
      check('back · placed as a background school: its fish are not hazards at all', [field.hazards.length, field.back.fishCount, field.back.schools.size], [0, SIZE, 1]);
      check('back · and no foreground school was made', field.schools.size, 0);
      const entry = [...field.back.schools.values()][0];
      check('back · it carries its distance and its look', [entry.distance, entry.variety], [backSet[0].distance, backSet[0].variety ?? 0]);
      check('back · every fish has its own place in the depth order', new Set(entry.members.map((f) => f.boid.d)).size, SIZE);
      check('back · born off the lane, where a school starts', entry.members.every((f) => f.x > LANE || f.x < 0), true);
      check('back · facing the way the school goes from its first frame', entry.members.every((f) => f.heading === Math.sign(entry.school.dirX)), true);

      // Untouchable, by construction: put the player in the middle of the school, awake and not invulnerable.
      let touched = 0;
      const dt = 1 / 30;
      for (let t = 0; t < 4; t += dt) {
        const c = backStats(field);
        const effects = field.update(dt, ctxFor(c.cx, c.cy, t, false));
        touched += effects.length;
      }
      check('back · a bubble in the middle of it is touched by nothing (effects produced)', touched, 0);
      check('back · and it still swims', backStats(field).n, SIZE);
      // A round has nothing to land on: the bullet field walks the hazard list, and the list is empty.
      check('back · the list a round tests against has no fish in it', field.hazards.length, 0);
    }

    // The same simulation: shape and flow of a background school, judged the way the foreground one is.
    {
      const field = makeBack(9);
      const entry = [...field.back.schools.values()][0];
      const dt = 1 / 30;
      const SECONDS = DEBUG_LEVEL.paths[backSet[0].path].seconds;
      let mid = null;
      let t = 0;
      let sawNaN = false;
      let biggest = 0;
      const last = new Map();
      for (; t < 90 && field.back.schools.size > 0; t += dt) {
        field.update(dt, ctxFor(LANE * 0.5, 400, t));
        for (const s of field.back.schools.values()) {
          for (const f of s.members) {
            if (!Number.isFinite(f.x) || !Number.isFinite(f.y)) sawNaN = true;
            const l = last.get(f);
            if (l) biggest = Math.max(biggest, Math.hypot(f.x - l.x, f.y - l.y));
            last.set(f, { x: f.x, y: f.y });
          }
        }
        if (!mid && entry.school.elapsed >= SECONDS * 0.5 && entry.members.length > 0) mid = backStats(field);
      }
      check('back · nothing went NaN', sawNaN, false);
      atMost('back · no fish jumps in a frame (lane widths)', biggest / LANE, 0.06);
      atLeast('back · alignment: the school goes one way halfway along (polarisation)', mid.polarisation, 0.8);
      atLeast('back · and it is a stream (length in lane widths)', mid.length / LANE, 0.3);
      check('back · every fish left by itself, and the school was dropped with the last', [field.back.fishCount, field.back.schools.size], [0, 0]);
      atLeast('back · the crossing took about the path\'s seconds (at least 80%)', t, SECONDS * 0.8);
      atMost('back · and not forever (seconds)', t, SECONDS * 3);
    }

    // On the screen, like everything alive: the camera's rise is handed back, so the school does not sink with the scroll.
    {
      const rise = 2;
      // Three frames and no more: the school is a chaotic system (a count of fish in reach flips the leader's pace), so over
      // seconds a difference of a part in 10^13 from a larger y would grow; over three frames it cannot, and what is being
      // asserted is the carry itself, which is exact.
      const frames = 3;
      const still = makeBack(13);
      const climbing = makeBack(13);
      const dt = 1 / 30;
      for (let i = 0; i < frames; i++) {
        still.update(dt, ctxFor(LANE * 0.5, 400, i * dt));
        climbing.update(dt, { ...ctxFor(LANE * 0.5, 400, i * dt), cameraRise: rise });
      }
      const a = backStats(still);
      const b = backStats(climbing);
      // The world moved up by rise x frames under the school, and the school went with it: it is that much higher in the
      // world and in exactly the same place on the screen.
      atMost('back · camera rise: the school is carried by exactly the camera\'s travel (metres off)', Math.abs(b.cy - a.cy - rise * frames), 1e-6);
      atMost('back · and sideways it is unmoved (metres off)', Math.abs(b.cx - a.cx), 1e-6);
      // Over a few seconds it is still the same school on the screen, to within what chaos allows.
      const longStill = makeBack(13);
      const longClimb = makeBack(13);
      for (let i = 0; i < 90; i++) {
        longStill.update(dt, ctxFor(LANE * 0.5, 400, i * dt));
        longClimb.update(dt, { ...ctxFor(LANE * 0.5, 400, i * dt), cameraRise: rise });
      }
      const la = backStats(longStill);
      const lb = backStats(longClimb);
      atMost('back · three seconds on, still the same school on the screen (lane widths off)', Math.hypot(lb.cx - la.cx, lb.cy - la.cy - rise * 90) / LANE, 0.15);
      // Foreground school, same rule.
      const fStill = makeField(13);
      const fClimb = makeField(13);
      for (let i = 0; i < frames; i++) {
        fStill.update(dt, ctxFor(LANE * 0.5, 400, i * dt));
        fClimb.update(dt, { ...ctxFor(LANE * 0.5, 400, i * dt), cameraRise: rise });
      }
      // Not as tight as the background school above: the hazard field draws random numbers of its own while it steps (so two
      // otherwise identical fields differ by ~1e-4 m sideways after three frames), which the background school never does.
      atMost('front · camera rise: a foreground school is carried the same way (metres off)', Math.abs(stats(fClimb).cy - stats(fStill).cy - rise * frames), 1e-3);
    }

    // Distance: how big and how dim, in a straight line between the config's two ends -- and nothing about how fast.
    {
      const b = mech.hazards.boids.back;
      check('distance · near is the near size, far is the far size', [backScaleAt(0).toFixed(9), backScaleAt(1).toFixed(9)], [b.scaleNear.toFixed(9), b.scaleFar.toFixed(9)]);
      check('distance · halfway is halfway', +backScaleAt(0.5).toFixed(9), +((b.scaleNear + b.scaleFar) / 2).toFixed(9));
      check('distance · and it is clamped outside 0..1', [backScaleAt(-3).toFixed(9), backScaleAt(7).toFixed(9)], [b.scaleNear.toFixed(9), b.scaleFar.toFixed(9)]);
      const lum = (c) => ((c >> 16) & 255) + ((c >> 8) & 255) + (c & 255);
      check('distance · a farther school is darker', lum(backTintAt(0)) > lum(backTintAt(0.5)) && lum(backTintAt(0.5)) > lum(backTintAt(1)), true);
      // Colder, not just darker: the red channel falls further than the blue at the far end.
      const far = backTintAt(1);
      check('distance · and colder: red falls further than blue', ((far >> 16) & 255) < (far & 255), true);
      // Speed is the path's: two schools on the same path at the near and far ends cruise at the same pace.
      const near = makeBack(17, backSet, () => 0);
      const faraway = makeBack(17, backSet, () => 1);
      const dt = 1 / 30;
      const SECONDS = DEBUG_LEVEL.paths[backSet[0].path].seconds;
      const pace = (field) => {
        const entry = [...field.back.schools.values()][0];
        for (let t = 0; t < 90 && entry.school.elapsed < SECONDS * 0.5; t += dt) field.update(dt, ctxFor(LANE * 0.5, 400, t));
        return backStats(field).speed;
      };
      const pn = pace(near);
      const pf = pace(faraway);
      atLeast('distance · speed is not slowed by distance: far / near pace', pf / pn, 0.8);
      atMost('distance · nor sped up (far / near pace)', pf / pn, 1.25);
    }

    // The school leaves with the hazard field's reset, like everything else in the water.
    {
      const field = makeBack(2);
      field.reset();
      check('back · reset clears it', [field.back.fishCount, field.back.schools.size], [0, 0]);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Nothing looks at the player: the same school, with the player in the middle of it, swims identically.
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
  // The hitbox is the size the fish is drawn: a fish at 60% is touched at 60%, not at an ordinary fish's size.
  // ---------------------------------------------------------------------------------------------
  {
    const playerR = LANE * 0.08;
    const reachFull = playerR + LANE * hazardSizeFraction('fish');
    const reachScaled = playerR + LANE * hazardSizeFraction('fish', cfg.scale);
    // Between the two reaches: the full-size fish touches the bubble and the scaled one does not.
    const gap = (reachFull + reachScaled) / 2;
    const damaged = (scale) => {
      const f = new HazardField();
      // A fish is baited by chance, and a baited one hurts nobody: the chance is switched off so this is not a coin flip.
      f.baitEnabled = false;
      const h = f.spawnForTest('fish', 0, 0);
      h.scale = scale;
      h.x = LANE * 0.5 + gap;
      h.y = 400;
      const effects = f.update(1 / 60, ctxFor(LANE * 0.5, 400, 0, false));
      return effects.some((e) => e.damage !== undefined && e.damage > 0);
    };
    check('hitbox · a full-size fish at that gap hurts', damaged(1), true);
    check('hitbox · a fish at the school\'s scale, at the same gap, does not', damaged(cfg.scale), false);
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
    check('shot · the rest of the school carries on', field.hazards.filter((h) => h.boid && !h.flee).length >= 119, true);
  }

  // ---------------------------------------------------------------------------------------------
  // The cost, for the record: what one frame of a school is on this machine. The bound is loose on purpose -- a number
  // from a laptop says nothing about a phone -- but a regression to something absurd would show here first.
  // ---------------------------------------------------------------------------------------------
  {
    const field = makeField(5);
    const dt = 1 / 60;
    const times = [];
    for (let t = 0; t < 2; t += dt) {
      const a = performance.now();
      field.update(dt, ctxFor(LANE * 0.5, 400, t));
      times.push(performance.now() - a);
    }
    times.sort((x, y) => x - y);
    atMost('cost · median update for one school of 120 fish (ms)', times[times.length >> 1], 5);
  }
  {
    // The author's scene: three background schools and a foreground one on the screen together.
    const random = Math.random;
    Math.random = seeded(6);
    const world = { field: new EntityField(), obstacles: new ObstacleField(), hazards: new HazardField(), playerRadiusFraction: 0.08 };
    const wanted = allSchoolEntries.filter((e) => e.school === schoolEntries[0].school || (e.layer === 'back' && e.at < firstFrontAt));
    for (const entry of wanted) placeEntry(entry, VIEW.max, VIEW, LANE, world);
    Math.random = random;
    const field = world.hazards;
    const dt = 1 / 60;
    const times = [];
    for (let t = 0; t < 2; t += dt) {
      const a = performance.now();
      field.update(dt, ctxFor(LANE * 0.5, 400, t));
      times.push(performance.now() - a);
    }
    times.sort((x, y) => x - y);
    check('cost · three background schools and one in front, all on at once', [field.back.schools.size, field.schools.size], [3, 1]);
    atMost('cost · median update for all four (ms)', times[times.length >> 1], 12);
  }
} finally {
  await server.close();
}

if (failures) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
