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
  check('the turn band leaves a channel at each side', cfg.turnBand, 0.6);
  check('small fish are the lively ones', cfg.fishTurnEverySeconds < cfg.turnEverySeconds, true);
  check('the two that crawl', [cfg.crawlerSpeedScale, cfg.crawlerBandTop], [0.4, 0.33]);
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
  // Two rates, and one of them is small fish
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- how often a turn comes round ---');
  {
    /**
     * A roll BETWEEN the two thresholds, derived from the config rather than typed in, so this survives a retune --
     * as long as the two rates differ, which is the rule under test. A fish's threshold is `dt / 6` and a shark's is
     * `dt / 12`, so a roll of `dt / 8` is a yes to one and a no to the other.
     */
    const between = (DT / cfg.turnEverySeconds + DT / cfg.fishTurnEverySeconds) / 2;
    const turnFor = (kind) => {
      const cast = [{ kind, x: W * 0.5, y: H * 0.5, vx: 0.05, vy: 0, school: { burstLeft: 0 } }];
      const bd = build([...cast, ...filler(cfg.minAlive - 1)]);
      const restore = dice([NO, between]); // no dart, then this turn roll
      bd.update(DT);
      restore();
      return Math.sign(bd.velocity.get(cast[0].h.id).vx);
    };
    check('a small fish takes it', turnFor('fish'), -1);
    check('a shark does not', turnFor('shark'), 1);
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
  // Only small fish dart, and it is the animal that decides
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- who darts ---');
  {
    const fishSchool = { burstLeft: 0 };
    const sharkSchool = { burstLeft: 0 };
    const cast = [
      { kind: 'fish', x: W * 0.5, y: H * 0.5, vx: 0.05, vy: 0, school: fishSchool },
      { kind: 'shark', x: W * 0.5, y: H * 0.5, vx: 0.05, vy: 0, school: sharkSchool },
    ];
    const bd = build([...cast, ...filler(cfg.minAlive - 2)]);
    const before = cast.map((c) => c.h.x);
    // Every roll says yes: the first two belong to the fish (dart, then turn) and the next two to the shark.
    const restore = dice([0, 0, 0, 0]);
    bd.update(DT);
    restore();

    check('a small fish darts', fishSchool.burstLeft, cfg.burstSeconds);
    check('a shark never does', sharkSchool.burstLeft, 0);
    // Both turned -- the difference measured here is the SPEED, so the burst is the only thing left that could
    // explain it.
    near('and it crossed at the multiplier', Math.abs(cast[0].h.x - before[0]) / (0.05 * DT * W), cfg.burstScale);
    near('while the shark crossed at its own speed', Math.abs(cast[1].h.x - before[1]) / (0.05 * DT * W), 1);
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
  // The two that crawl
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the two that crawl ---');
  {
    /**
     * What the spawner hands a crawler, against what it hands a fish.
     *
     * The rolls are, in order: is it a fish, (only if not) which one, how many, which side, how fast, and the WAVE's
     * height -- then, per member, that member's own height. `0.23` picks the urchin out of `SWIMMERS`.
     *
     * A crawler ignores the wave's height and uses its own, so the two are given deliberately DIFFERENT values: had
     * they been the same, a test reading the wrong roll would have passed anyway.
     */
    const WAVE_Y = 0.9; // near the surface, where a swimmer would be
    const MEMBER_Y = 0.25; // a quarter of the way up a crawler's band
    const arrive = (isFish, yRoll) => {
      const bd = new MenuBackdrop();
      bd.layout(W, H);
      const restore = dice(isFish ? [0, NO, NO, NO, yRoll, 0.5] : [0.9, 0.23, NO, NO, NO, NO, yRoll]);
      bd.spawnWave();
      restore();
      const h = bd.swimmers.hazards[0];
      return { kind: h.kind, y: h.y, v: bd.velocity.get(h.id) };
    };
    const fish = arrive(true, WAVE_Y);
    const urchin = arrive(false, MEMBER_Y);
    check('the roll picked an urchin', urchin.kind, 'urchin');
    near('a fish arrives where its wave said', fish.y / H, 0.14 + WAVE_Y * 0.72);
    near('an urchin arrives at its own point in the band', urchin.y / H, MEMBER_Y * cfg.crawlerBandTop);
    near('and crawls at the slow multiple', Math.abs(urchin.v.vx) / Math.abs(fish.v.vx), cfg.crawlerSpeedScale);
    check('with no drift at all', urchin.v.vy, 0);
    check('where a fish has one', fish.v.vy !== 0, true);

    /**
     * And in the water they take no decisions.
     *
     * Both sit in the middle of the screen, so the turn band would allow a turn for either of them: the only thing
     * stopping the urchin is the animal it is -- which is what the fish beside it, under the same dice, is here to
     * show.
     */
    const crawlerSchool = { burstLeft: 0 };
    const fishSchool = { burstLeft: 0 };
    const cast = [
      { kind: 'urchin', x: W * 0.5, y: H * 0.2, vx: 0.05, vy: 0, school: crawlerSchool },
      { kind: 'fish', x: W * 0.5, y: H * 0.5, vx: 0.05, vy: 0, school: fishSchool },
    ];
    const bd = build([...cast, ...filler(cfg.minAlive - 2)]);
    const y0 = cast[0].h.y;
    const restore = dice([0, 0, 0, 0]); // every roll says yes, for the first frame of sixty
    for (let i = 0; i < 60; i++) bd.update(DT);
    restore();

    check('an urchin never darts', crawlerSchool.burstLeft, 0);
    check('and never turns', Math.sign(bd.velocity.get(cast[0].h.id).vx), 1);
    near('and never leaves its height', cast[0].h.y, y0);
    // The same sixty frames and the same dice, and the fish beside it did all three.
    check('while the fish beside it darted', fishSchool.burstLeft > 0, true);
    check('and turned', Math.sign(bd.velocity.get(cast[1].h.id).vx), -1);
  }

  // ---------------------------------------------------------------------------------------------
  // The backdrop's turn goes through the same door as the painter's
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- a backdrop turn is an animated turn ---');
  {
    const school = { burstLeft: 0 };
    const cast = [{ kind: 'fish', x: W * 0.5, y: H * 0.5, vx: 0.05, vy: 0, school }];
    const bd = build([...cast, ...filler(cfg.minAlive - 1)]);
    const h = cast[0].h;
    /**
     * `build` hands the hazard to the field the way the spawner does NOT -- it skips `faceTravel` -- so the arrival
     * facing is set here, by that same method. Which is itself the first thing checked: ARRIVING is what sets a
     * facing, and it is not a turn.
     */
    bd.faceTravel(h, 1);
    check('arriving is not a turn', h.turn, undefined);
    const before = h.facing;
    check('and it does leave a facing behind', typeof before, 'number');
    const restore = dice([NO, 0]); // no dart, and yes to the turn
    bd.update(DT);
    restore();
    check('but a turn is', h.turn !== undefined, true);
    check('the facing really changed', h.facing, -before);
    near('and the picture starts where it was', h.turn.from, before);

    /**
     * And the countdown runs on the BACKDROP's clock -- the same update loop that moves the fish -- rather than on a
     * wall clock, so a menu that is not being updated is a menu where nothing turns either. See `advanceTurn`.
     */
    const restore2 = dice([]);
    for (let i = 0; i < Math.ceil(mech.hazardFacing.turnSeconds / DT) + 1; i++) bd.update(DT);
    restore2();
    check('and it is over within the time it was given', h.turn, undefined);
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
