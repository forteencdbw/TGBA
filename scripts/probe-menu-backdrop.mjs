// Do the menu's swimmers do what the water says they do?
//
// Four of the backdrop's rules are invisible to `typecheck` because every one of them comes out of a random roll: a
// school turns as one body, a batch that is NOT a school does not, a turn only happens in the middle of the screen,
// and a burst moves the creature faster AND beats its tail faster with it. "It looks about right" is not evidence for
// any of those, so this probe takes the dice away and hands the rules a script instead.
//
// The seam that makes it possible: every decision is a single `Math.random()` comparison whose ORDER is fixed -- for
// each school, in the order the schools entered the water, first its burst roll and then its turn roll. So a list of
// values IS a list of decisions, and `NO` (never below a per-frame chance) is "no" for every rule there is.
//
//   node scripts/probe-menu-backdrop.mjs [tree]          # defaults to this checkout

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
const near = (label, got, want, tol = 0.001) => {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${got.toFixed(4)}${ok ? '' : ` (want ~${want})`}`);
};

const W = 400;
const H = 800;
const DT = 1 / 120;
/** A roll that is below no chance there is: the per-frame chances are around a thousandth. */
const NO = 0.999999;

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { MenuBackdrop } = await server.ssrLoadModule('/src/menuBackdrop.ts');
  /**
   * Importing the config is itself a check.
   *
   * `mechanisms.ts` walks the config and the rule list against each other IN BOTH DIRECTIONS at import time, so a key
   * with no rule -- or a rule with no key -- throws here rather than being a number nobody validates. The five keys
   * this probe is about are new, which is exactly the case that check exists for.
   */
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const cfg = mech.menu.backdrop;

  console.log('--- the numbers everything below is measured against ---');
  check('a non-fish batch is 2..3', [cfg.schoolMin, cfg.schoolMax], [2, 3]);
  check('a fish shoal is 8..10', [cfg.fishSchoolMin, cfg.fishSchoolMax], [8, 10]);
  check('the drift is half the horizontal speed', cfg.driftRatio, 0.5);
  check('the turn band leaves a channel at each side', [cfg.turnBand, cfg.turnEverySeconds], [0.6, 6]);
  check('a burst', [cfg.burstScale, cfg.burstSeconds, cfg.burstEverySeconds], [2.5, 1.2, 8]);

  /** Hand the rules a script instead of dice. Values beyond the list are all `NO`. */
  const dice = (values) => {
    let i = 0;
    const real = Math.random;
    Math.random = () => (i < values.length ? values[i++] : NO);
    return () => {
      Math.random = real;
    };
  };

  /**
   * A backdrop with the spawner switched off, holding a hand-built cast.
   *
   * `sinceSpawn` is driven far into the past so the arrival gap never ripens, and the cast is held at or above
   * `minAlive` so the "a sea should never look empty" rule never fires either. What is left is only what existing
   * creatures do -- and an arrival halfway through a measurement would move every number in it.
   */
  const build = (cast) => {
    const bd = new MenuBackdrop();
    bd.layout(W, H);
    bd.sinceSpawn = -1e9;
    for (const c of cast) {
      const h = bd.swimmers.spawnAt(c.kind ?? 'fish', c.x, c.y, { deterministic: true, variety: 0 });
      bd.velocity.set(h.id, { vx: c.vx, vy: c.vy, school: c.school });
      bd.swimmers.hazards.push(h);
      c.h = h;
    }
    return bd;
  };

  /**
   * The creatures that are not the measurement, each in a school of its own.
   *
   * A school of one is what a real lone creature gets, so these are not an inert fixture invented for the probe --
   * they are the ordinary case, and a probe that watched them turn would be watching a bug.
   */
  const filler = (n) =>
    Array.from({ length: n }, (_, i) => ({
      x: W * 0.5,
      y: H * 0.5,
      vx: 0.05,
      vy: 0,
      school: { burstLeft: 0 },
      tag: `filler${i}`,
    }));

  const swimmers = (bd, cast) => cast.map((c) => bd.velocity.get(c.h.id));

  // ---------------------------------------------------------------------------------------------
  // A school turns as one body, and a batch that is not a school does not
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- three fish: one school, against three schools ---');
  {
    const run = (shared) => {
      const schools = shared ? [{ burstLeft: 0 }] : null;
      const cast = Array.from({ length: 3 }, () => ({
        x: W * 0.5,
        y: H * 0.5,
        vx: 0.05,
        vy: 0,
        school: shared ? schools[0] : { burstLeft: 0 },
      }));
      const bd = build([...cast, ...filler(cfg.minAlive - 3)]);
      const restore = dice([NO, 0]); // the first school: no burst, and yes to the turn
      bd.update(DT);
      restore();
      return swimmers(bd, cast).map((v) => Math.sign(v.vx));
    };
    check('one school of three turns together', run(true), [-1, -1, -1]);
    check('three schools of one turn one at a time', run(false), [-1, 1, 1]);
  }

  // ---------------------------------------------------------------------------------------------
  // A turn only happens in the middle of the screen
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the turn band ---');
  {
    const turnAt = (at) => {
      const school = { burstLeft: 0 };
      const cast = [{ x: W * at, y: H * 0.5, vx: 0.05, vy: 0, school }];
      const bd = build([...cast, ...filler(cfg.minAlive - 1)]);
      const restore = dice([NO, 0]);
      bd.update(DT);
      restore();
      return Math.sign(bd.velocity.get(cast[0].h.id).vx);
    };
    const low = (1 - cfg.turnBand) / 2;
    check(`at the left channel edge (${low}) it keeps going`, turnAt(low - 0.05), 1);
    check('just inside the band it turns', turnAt(low + 0.05), -1);
    check('in the middle it turns', turnAt(0.5), -1);
    check(`at the right channel edge (${1 - low}) it keeps going`, turnAt(1 - low + 0.05), 1);
  }

  // ---------------------------------------------------------------------------------------------
  // A burst moves the body faster, and beats the tail faster with it
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- a burst ---');
  {
    const measure = (burstLeft) => {
      const school = { burstLeft };
      const cast = [{ x: W * 0.5, y: H * 0.5, vx: 0.08, vy: 0.02, school }];
      const bd = build([...cast, ...filler(cfg.minAlive - 1)]);
      const h = cast[0].h;
      const before = { x: h.x, y: h.y, phase: h.phase };
      const restore = dice([]); // nothing rolls: a running burst re-arms only when it has run out
      bd.update(DT);
      restore();
      return {
        dx: (h.x - before.x) / (0.08 * DT * W),
        dy: (h.y - before.y) / (0.02 * DT * H),
        dphase: (h.phase - before.phase) / DT,
        left: school.burstLeft,
      };
    };
    const idle = measure(0);
    const bursting = measure(cfg.burstSeconds);
    near('swimming normally moves at exactly the speed it was given', idle.dx, 1);
    near('and its tail beats at real time', idle.dphase, 1);
    near('a burst moves it at the multiplier', bursting.dx, cfg.burstScale);
    near('in both axes', bursting.dy, cfg.burstScale);
    near('and beats the tail at the same multiplier', bursting.dphase, cfg.burstScale);
    near('and it is counting down', bursting.left, cfg.burstSeconds - DT);

    const spent = measure(0);
    near('a burst that has run out is back to normal speed', spent.dx, 1);
  }

  // ---------------------------------------------------------------------------------------------
  // Leaving is not a decision
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- a departing creature ---');
  {
    const school = { burstLeft: cfg.burstSeconds };
    const cast = [{ x: W * 0.5, y: H * 0.5, vx: 0.08, vy: 0, school }];
    const bd = build([...cast, ...filler(cfg.minAlive - 1)]);
    const h = cast[0].h;
    h.flee = 'right';
    const before = h.x;
    const restore = dice([NO, 0]); // it would have TURNED here, if leaving were a thing it did
    bd.update(DT);
    restore();
    check('the burst is dropped', school.burstLeft, 0);
    check('it does not turn, it leaves', Math.sign(bd.velocity.get(h.id).vx), 1);
    // `fleeScreensPerSecond` is a fraction of the screen HEIGHT, which is the unit the water uses for a departure.
    near('and it leaves at the departure speed', (h.x - before) / (mech.hazards.fleeScreensPerSecond * H * DT), 1);
  }

  // ---------------------------------------------------------------------------------------------
  // Only small fish ever share a school
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- what the spawner hands out ---');
  {
    /**
     * The spawner's rolls, in order: is it a fish, then -- only if it is not -- which one, then how many, then the
     * size of that batch, then which side, then speed and height, then the per-member noise. Everything past the
     * interesting ones is `NO`.
     */
    const wave = (rolls) => {
      const bd = new MenuBackdrop();
      bd.layout(W, H);
      const restore = dice(rolls);
      bd.spawnWave();
      restore();
      const ids = bd.swimmers.hazards.map((h) => h.id);
      const schools = new Set(ids.map((id) => bd.velocity.get(id).school));
      return { kind: bd.swimmers.hazards[0].kind, count: ids.length, schools: schools.size };
    };

    const shoal = wave([0, 0, 0]); // a fish, its shoal chance hit, the smallest shoal it makes
    check('a fish shoal arrives as one school', [shoal.kind, shoal.count, shoal.schools], ['fish', 8, 1]);

    const team = wave([0.9, 0.5, 0, 0]); // not a fish, some other kind, its team chance hit, the smallest team
    check('a batch of anything else arrives as one school each', [team.kind === 'fish', team.count, team.schools], [
      false,
      2,
      2,
    ]);
  }
} finally {
  await server.close();
}

console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
