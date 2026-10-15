// Does a Boids school swim as one body, with a harmless background behind it, and does the debug level load without
// touching the ladder?
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
  const schoolEntries = DEBUG_LEVEL.entries.filter((e) => e.school !== undefined);
  check('debug level · school entries carry their block', [...new Set(schoolEntries.map((e) => typeof e.school))], ['number']);
  const bySchool = new Map();
  for (const e of schoolEntries) bySchool.set(e.school, (bySchool.get(e.school) ?? 0) + 1);
  check('debug level · two schools of 120', [...bySchool.values()], [120, 120]);
  check('debug level · each brings its background', [...new Set(schoolEntries.map((e) => e.schoolDecor))], [160]);
  check('debug level · every fish knows its place in the school', schoolEntries.every((e) => e.schoolSize === 120 && Number.isInteger(e.schoolIndex)), true);
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
  refuses('a background without a school', { at: 10, kind: 'fish', count: 3, path: 'straight', backdropFish: 50 });
  refuses('a negative background', { at: 10, kind: 'fish', count: 3, path: 'straight', boids: true, backdropFish: -1 });
  // The refusal of a school born on the screen happens when a level FILE is read, so it is asserted against the real
  // file's own numbers here and exercised the other way round by hand (move the debug path's first point into the lane and
  // the page refuses to load, naming the path).
  check('loader · the debug level\'s school path starts off the screen', (() => {
    const p0 = DEBUG_LEVEL.paths.straight.points[0];
    return p0.x < -mech.hazards.boids.spawnSpread || p0.x > 1 + mech.hazards.boids.spawnSpread || p0.y >= 0.2;
  })(), true);
  check('loader · a good school is accepted', installSpawnBlocks([{ at: 10, kind: 'fish', count: 7, path: 'straight', boids: true, backdropFish: 5 }]), 7);
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

    // The background.
    check('background · 160 decor fish', leaderStart.decor.length, 160);
    check('background · none of them is a hazard', [fish.length, fish.some((h) => h.kind !== 'fish')], [120, false]);
    check('background · born in the leader\'s cloud, not on its place in the finished school', leaderStart.decor.every((d) => Math.hypot(d.x - leaderStart.x, d.y - leaderStart.y) <= cfg.spawnSpread * LANE + 1e-6), true);
    check('background · and every one of them is off the screen at birth', leaderStart.decor.every((d) => d.x > LANE), true);
    check('facing · every real fish faces the way the school goes from its first frame', fish.every((h) => h.heading === Math.sign(leaderStart.dirX)), true);

    let t = 0;
    const dt = 1 / 30;
    let sawNaN = false;
    const samples = {};
    const school0 = leaderStart;
    const SECONDS = DEBUG_LEVEL.paths.straight.seconds;
    const marks = [SECONDS * 0.25, SECONDS * 0.5, SECONDS * 0.75];
    let decorEver = 0;
    // Nothing teleports and nothing turns round: the biggest single-frame step of any fish or decor fish, and every
    // heading any real fish had while the school was swimming.
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
      for (const s of field.schools.values()) {
        for (const d of s.decor) {
          const last = lastAt.get(d);
          if (last) biggestStep = Math.max(biggestStep, Math.hypot(d.x - last.x, d.y - last.y));
          lastAt.set(d, { x: d.x, y: d.y });
        }
      }
      if (field.hazards.some((h) => !Number.isFinite(h.x) || !Number.isFinite(h.y))) sawNaN = true;
      for (const s of field.schools.values()) {
        if (s.decor.some((d) => !Number.isFinite(d.x) || !Number.isFinite(d.y))) sawNaN = true;
        decorEver = Math.max(decorEver, s.decor.length);
      }
      for (const mark of marks) if (!samples[mark] && school0.elapsed >= mark && field.hazards.some((h) => h.boid && !h.flee)) samples[mark] = { ...stats(field), leaderX: school0.x };
    }
    check('swim · nothing went NaN', sawNaN, false);
    // 0.8 lane widths a second is the fastest a fish may go (`maxSpeed`), so a frame at 30 fps is under 0.03 of a lane; a
    // fish that pops into view or snaps to a place would show as a step many times that.
    atMost('swim · no fish or decor fish jumps in a frame (lane widths)', biggestStep / LANE, 0.06);
    check('facing · no real fish ever turned round: the only heading was the school\'s', [...headings], [Math.sign(boidsModule.createSchool(1, DEBUG_LEVEL.paths.straight, 400, LANE, 800, 0, 0).dirX)]);
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

    check('end · every fish left the water by itself', field.hazards.length, 0);
    check('end · the background was there for the whole crossing', decorEver, 160);
    // The background outlives the real fish by a little, and goes the same way: out past the lane.
    let after = 0;
    while (field.schools.size > 0 && after < 20) {
      field.update(dt, ctxFor(LANE * 0.5, 400, t + after));
      after += dt;
    }
    check('end · and the school was dropped once the background had left too', field.schools.size, 0);
    atMost('end · within a minute', t + after, 60);
    // The leader waits for its school, so the crossing takes at least the path's seconds -- but not forever.
    atLeast('wait · the crossing took at least the path\'s seconds', t, SECONDS * 0.99);
    atMost('wait · and no more than twice as long (seconds)', t, SECONDS * 2);
  }

  // ---------------------------------------------------------------------------------------------
  // The leader snakes, and snakes less than its amplitude.
  // ---------------------------------------------------------------------------------------------
  {
    const path = DEBUG_LEVEL.paths.straight;
    const lateral = (amplitude) => {
      const keep = cfg.wobbleAmplitude;
      cfg.wobbleAmplitude = amplitude;
      const school = boidsModule.createSchool(1, path, 400, LANE, 800, 0, 0);
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
      const school = boidsModule.createSchool(1, path, 400, LANE, 800, 0, 0);
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
  // The background swims with the real fish nearest to it, and not with the leader.
  // ---------------------------------------------------------------------------------------------
  {
    const field = makeField(21);
    const school = [...field.schools.values()][0];
    const dt = 1 / 30;
    for (let t = 0; t < 2; t += dt) field.update(dt, ctxFor(LANE * 0.5, 400, t));
    // The leader teleports: a background tied to it would jump, one tied to the real fish would not notice.
    const before = school.decor.map((d) => ({ x: d.x, y: d.y }));
    school.x += 80 * LANE / 100;
    school.y += 60;
    const members = field.hazards.filter((h) => h.boid && !h.flee);
    boidsModule.advanceDecor(school, members, dt, LANE, { min: VIEW.min, max: VIEW.max });
    const moved = school.decor.map((d, i) => Math.hypot(d.x - before[i].x, d.y - before[i].y));
    atMost('background · does not jump when the leader does: the largest step in a frame (lane widths)', Math.max(...moved) / LANE, 0.06);

    // And it is going the way the real fish round it are going.
    let worst = 0;
    for (const d of school.decor) {
      const near = [...members].sort((a, b) => (a.x - d.x) ** 2 + (a.y - d.y) ** 2 - ((b.x - d.x) ** 2 + (b.y - d.y) ** 2)).slice(0, cfg.decor.neighbours);
      const vx = near.reduce((s, m) => s + m.boid.vx, 0) / near.length;
      const vy = near.reduce((s, m) => s + m.boid.vy, 0) / near.length;
      worst = Math.max(worst, Math.hypot(d.vx - vx, d.vy - vy) / LANE);
    }
    atMost('background · its velocity is its nearest real fish\'s: the worst difference (lane widths per second)', worst, 0.35);
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
    // And the background does not care.
    const school = [...field.schools.values()][0];
    check('shot · the background is untouched', school.decor.length, 160);
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
    atMost('cost · median update for 120 fish + 160 background (ms)', times[times.length >> 1], 5);
  }
} finally {
  await server.close();
}

if (failures) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
