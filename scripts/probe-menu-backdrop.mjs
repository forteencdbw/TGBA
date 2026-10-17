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

/**
 * A CANVAS, FOR A PROBE -- because Pixi bakes a `FillGradient` into a texture with Canvas 2D.
 *
 * Building one calls `document.createElement('canvas')` and then a 2D context's `createLinearGradient` / `fillRect`,
 * and the menu's deep-sea lighting builds three in `layout` -- which every check in this file calls. Node has no DOM,
 * and a gradient is a fill and not a texture, which is why this had to be found out by running rather than by reading:
 * the whole point of choosing `FillGradient` over generated textures was to keep this file working.
 *
 * NOTHING HERE EVER RASTERISES. The canvas is wrapped in an `ImageSource` and held; it only reaches the GPU at draw
 * time, which a probe never gets to. So recording the calls and drawing nothing is the whole of what is needed.
 *
 * It is installed HERE rather than guarded for in `src/`: production code should not carry a check for an environment
 * it will never run in, and a `buildLight` that quietly did nothing would be a silent failure in the one place the
 * lighting is the whole feature.
 */
globalThis.document ??= {
  createElement: () => ({
    width: 0,
    height: 0,
    /**
     * The whole of the 2D surface Pixi's gradient builders touch: they make the gradient object, set it as the fill
     * style, and fill a 1-pixel-tall strip with it. Every one of these is a call to be answered, not a picture.
     */
    getContext: () => ({
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      fillStyle: '',
    }),
  }),
};

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
  const drift = await server.ssrLoadModule('/src/menuDrift.ts');
  const cfg = mech.menu.backdrop;

  /**
   * The numbers below are the OWNER'S, so they are printed rather than asserted.
   *
   * Pinning them here would turn every hand-tune into a failed check -- this block used to say `burstEverySeconds: 8`
   * and went red the first time it was set to 12 -- and a probe whose red means "somebody turned a dial" is a probe
   * people learn to ignore. What IS asserted is the SHAPE the code depends on: the relationships that make each rule
   * mean what it says, which is what a retune can genuinely break.
   */
  console.log('--- the numbers everything below is measured against ---');
  console.log(`    speed ${cfg.speedMin}..${cfg.speedMax}   drift ${cfg.driftRatio}`);
  console.log(`    turn every ${cfg.fishTurnEverySeconds}s (fish) / ${cfg.turnEverySeconds}s (other), inside ${cfg.turnBand}`);
  console.log(`    burst x${cfg.burstScale} for ${cfg.burstSeconds}s, every ${cfg.burstEverySeconds}s`);
  console.log(`    teams ${cfg.schoolMin}..${cfg.schoolMax}   shoals ${cfg.fishSchoolMin}..${cfg.fishSchoolMax}`);
  console.log(`    crawlers x${cfg.crawlerSpeedScale} in the bottom ${cfg.crawlerBandTop}`);
  check('small fish are the lively ones', cfg.fishTurnEverySeconds < cfg.turnEverySeconds, true);
  check('a shoal is bigger than a team, which is what "a big group" means', cfg.fishSchoolMin > cfg.schoolMax, true);
  check('a team holds at least one', cfg.schoolMin >= 1 && cfg.schoolMin <= cfg.schoolMax, true);
  check('the spawner has room between its floor and its ceiling', cfg.minAlive < cfg.maxAlive, true);
  check('a burst is faster than a swim', cfg.burstScale > 1, true);
  check('the turn band leaves a channel at each side', cfg.turnBand > 0 && cfg.turnBand <= 1, true);
  check('and the crawlers have the bottom of the screen', cfg.crawlerBandTop > 0 && cfg.crawlerBandTop < 0.5, true);
  check('where they crawl rather than swim', cfg.crawlerSpeedScale < 1, true);

  /** Hand the rules a script instead of dice. Values beyond the list are all `NO`. */
  const dice = (values) => {
    let i = 0;
    const real = Math.random;
    Math.random = () => (i < values.length ? values[i++] : NO);
    return () => {
      Math.random = real;
    };
  };

  // ---------------------------------------------------------------------------------------------
  // The water is the lane, not the window
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the backdrop is laid out against the lane ---');
  {
    const LANE = 900;
    const LEFT = 350;
    const bd = new MenuBackdrop();
    bd.layout(LANE, H, LEFT);
    check('it measures itself in lane widths', bd.width, LANE);
    check('and sits where the lane is', bd.root.position.x, LEFT);
    /**
     * The clip, read back off the mask rather than assumed.
     *
     * It is the half of this that is easy to leave out: a creature is BORN just off the lane -- that is how every
     * arrival slides in from behind the edge instead of appearing mid-window -- and is only retired a third of a lane
     * beyond it, so with no mask a fish crosses the letterbox in plain sight for a good fraction of a second.
     */
    const clip = bd.root.mask?.getLocalBounds();
    check('and is clipped to exactly the lane', clip ? [clip.minX, clip.width] : null, [LEFT, LANE]);
  }

  /**
   * A backdrop with the spawner switched off, holding a hand-built cast.
   *
   * `sinceSpawn` is driven far into the past so the arrival gap never ripens, and the cast is held at or above
   * `minAlive` so the "a sea should never look empty" rule never fires either. What is left is only what existing
   * creatures do -- and an arrival halfway through a measurement would move every number in it.
   *
   * Laid out at `left = 0`, which is what a phone is: the lane and the window are the same width, so everything below
   * measures one coordinate system instead of two.
   */
  const build = (cast) => {
    const bd = new MenuBackdrop();
    bd.layout(W, H, 0);
    bd.sinceSpawn = -1e9;
    for (const c of cast) {
      const h = bd.swimmers.spawnAt(c.kind ?? 'fish', c.x, c.y, { deterministic: true, variety: 0 });
      bd.velocity.set(h.id, { vx: c.vx, vy: c.vy, school: c.school, ...(c.vertical ? { vertical: c.vertical } : {}) });
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

    /**
     * AND IT DOES NOT END SUDDENLY, which is the whole of the tail.
     *
     * `boostAt` hands `measure` one frame MORE than it is asking about, because `update` is what takes the frame:
     * without that the sample would always be one frame further down the tail than the number it was asked for, and
     * every expected value here would be out by a frame's worth of easing.
     */
    const fall = cfg.burstFallSeconds;
    const boostAt = (left) => measure(left + DT).dx;
    near('at the start of the tail it is still at full speed', boostAt(fall), cfg.burstScale);
    near('a quarter of the way down', boostAt(fall * 0.75), 1 + (cfg.burstScale - 1) * 0.5625);
    near('halfway down', boostAt(fall * 0.5), 1 + (cfg.burstScale - 1) * 0.25);
    near('and it has all but arrived by the end', boostAt(fall * 0.1), 1 + (cfg.burstScale - 1) * 0.01, 0.02);
    near('while a burst that is over is over', boostAt(0), 1);

    /**
     * And sampled across the whole tail: it only ever slows, it never dips below cruising on the way back, and it
     * never overshoots the burst. Those three ARE the shape, and the shape is what a retune can break.
     */
    const steps = Array.from({ length: Math.round(fall / DT / 4) }, (_, i) => boostAt(fall - i * 4 * DT));
    check('the tail only ever slows down', steps.every((b, i) => i === 0 || b <= steps[i - 1] + 1e-9), true);
    check('and never dips below cruising on the way back', steps.every((b) => b >= 1 - 1e-9), true);
    check('and never overshoots the burst', steps.every((b) => b <= cfg.burstScale + 1e-9), true);
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

    check('a small fish darts', fishSchool.burstLeft, cfg.burstSeconds + cfg.burstFallSeconds);
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
  // The jelly is the one vertical swimmer
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the jelly climbs ---');
  {
    const cast = [
      {
        kind: 'jelly',
        x: W * 0.5,
        y: H * 0.3,
        vx: 0.14,
        vy: 0,
        school: { burstLeft: 0 },
        vertical: { climb: 0.06, entryLeft: 1 },
      },
      ...filler(cfg.minAlive - 1),
    ];
    const bd = build(cast);
    const h = cast[0].h;
    const y0 = h.y;
    bd.update(DT);
    check('a jelly leans into its diagonal entry', Math.abs(h.artRotation) > 0.05, true);
    for (let i = 0; i < 119; i++) bd.update(DT);
    check('a jelly climbs', h.y > y0, true);
    check('and straightens once the entry is spent', Math.abs(h.artRotation) < 0.01, true);
    check('and stays inside the lane once its entry is spent', h.x > 0 && h.x < W, true);
    check('the entry timer runs out', bd.velocity.get(h.id).vertical.entryLeft <= 1e-9, true);
    const y1 = h.y;
    bd.update(1);
    check('and it keeps climbing', h.y > y1, true);
    bd.beginExit();
    check('and leaves through the top, not a side', h.flee, 'up');

    // The electric jelly is drawn as the same animal, so the menu moves it the same way.
    const zcast = [
      {
        kind: 'zapper',
        x: W * 0.5,
        y: H * 0.3,
        vx: 0.14,
        vy: 0,
        school: { burstLeft: 0 },
        vertical: { climb: 0.06, entryLeft: 1 },
      },
      ...filler(cfg.minAlive - 1),
    ];
    const zbd = build(zcast);
    const zh = zcast[0].h;
    const zy0 = zh.y;
    for (let i = 0; i < 60; i++) zbd.update(DT);
    check('the electric jelly climbs too', zh.y > zy0, true);
    zbd.beginExit();
    check('and leaves through the top as well', zh.flee, 'up');
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
  // The deep-sea light, and where each piece of it sits
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the light, in the stack ---');
  {
    const light = mech.menu.lighting;
    const bd = new MenuBackdrop();
    bd.layout(W, H, 0);

    /**
     * WHERE EACH PIECE SITS IS THE EFFECT.
     *
     * A mask over the whole scene and a mask over the water alone are the same three lines of code and two completely
     * different pictures, and the second is the one that was chosen -- because at 0.65 of the way down the mask is
     * 0.85 opaque while the creatures live from 0.14 to 0.86. `children` is draw order, so this list is BOTTOM-FIRST.
     */
    const name = (child) =>
      child === bd.backLayer
        ? 'back reef'
        : child === bd.motes.graphics
          ? 'specks'
          : child === bd.beamLayer
            ? 'shafts'
            : child === bd.darkGfx
              ? 'darkness'
              : child === bd.bubbles.root
                ? 'bubbles'
                : child === bd.swimLayer
                  ? 'swimmers'
                  : child === bd.glowGfx
                    ? 'halo'
                    : child === bd.frontLayer
                      ? 'front reef'
                      : '?';
    check('the stack, bottom first', bd.root.children.map(name), [
      'back reef',
      'specks',
      'shafts',
      'darkness',
      'bubbles',
      'swimmers',
      'halo',
      'front reef',
    ]);
    const at = (child) => bd.root.children.indexOf(child);
    check('so the shafts are darkened with the water', at(bd.darkGfx) > at(bd.beamLayer), true);
    check('and the specks are under the shafts that light them', at(bd.beamLayer) > at(bd.motes.graphics), true);
    check('but the creatures are drawn OVER the mask', at(bd.swimLayer) > at(bd.darkGfx), true);
    check(
      'and the bubbles are over it too, but behind the creatures',
      at(bd.bubbles.root) > at(bd.darkGfx) && at(bd.bubbles.root) < at(bd.swimLayer),
      true,
    );
    check('and the halo is over them', at(bd.glowGfx) > at(bd.swimLayer), true);
    check('but under the near reef', at(bd.frontLayer) > at(bd.glowGfx), true);

    check('as many shafts as the config asks for', bd.beams.length, Math.round(light.beamCount));
    check(
      'and the light ADDS rather than painting over',
      [bd.glowGfx.blendMode, bd.beamLayer.children[0].children[0].blendMode],
      ['add', 'add'],
    );

    /**
     * The sea surface, sampled over a full period of the SLOWEST thing in it -- which is what makes "it reaches both
     * ends of its band" mean something, rather than being an assertion that the first frame looked busy.
     *
     * What is NOT asserted is as much of the point: the shafts' geometry is built once, in `layout`, so everything
     * moving here is a container property. And the bands are what is checked rather than the values, because the
     * values are the owner's and the BANDS are the thing a retune can break.
     */
    const seen = { rot: [], scale: [], drift: [], pulse: [], glowY: [], glowAlpha: [] };
    for (let i = 0; i < 3000; i++) {
      bd.update(DT);
      for (const b of bd.beams) {
        seen.rot.push(b.holder.rotation - b.lean);
        seen.scale.push(b.holder.scale.x - 1);
        seen.drift.push(b.holder.position.x - b.baseX);
        seen.pulse.push(b.holder.alpha / light.beamAlpha - 1);
      }
      seen.glowY.push(bd.glowGfx.position.y);
      seen.glowAlpha.push(bd.glowGfx.alpha - 1);
    }
    const within = (values, limit) => values.every((v) => Math.abs(v) <= limit + 1e-9);
    const reached = (values, limit) => Math.max(...values) - Math.min(...values) > limit * 1.9;
    const band = (label, values, limit) => {
      check(`${label} stays inside its band`, within(values, limit), true);
      check(`${label} reaches both ends of it`, reached(values, limit), true);
    };

    band('the angle', seen.rot, light.beamSway);
    band('the width', seen.scale, light.beamWidth);
    band('the root', seen.drift, light.beamDrift * W);
    band('the brightness', seen.pulse, light.beamPulse);
    band('the halo', seen.glowY, light.glowDrift * H);
    check('and the halo brightens within its own pulse', within(seen.glowAlpha, light.glowPulse), true);
  }

  // ---------------------------------------------------------------------------------------------
  // What drifts up through the water
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the specks and the bubbles ---');
  {
    /** The two ends: born invisible at the bottom, gone again before the top. */
    check('something at the very bottom is invisible', drift.edgeFade(0, 100, 0.1), 0);
    check('fully visible past the band', drift.edgeFade(10, 100, 0.1), 1);
    check('and invisible again at the top', drift.edgeFade(100, 100, 0.1), 0);
    check('and never negative', drift.edgeFade(-5, 100, 0.1), 0);
    near('halfway into the far band', drift.edgeFade(95, 100, 0.1), 0.5);

    const bd = new MenuBackdrop();
    bd.layout(W, H, 0);
    // One frame first: the sway is what gives the shafts the alpha the specks read off them.
    bd.update(DT);

    /**
     * THE LIGHT THE SPECKS STAND IN, which is the whole of what makes them dust in a sunbeam rather than dots.
     *
     * Sampled across the lane at one height instead of asked about one point, because where a shaft actually is
     * depends on its lean, its root and its width -- a probe that hard-coded a point would be testing its own
     * arithmetic rather than the code's.
     */
    const litAcross = (y) => Array.from({ length: 41 }, (_, i) => bd.beamLightAt((i / 40) * W, y));
    const high = litAcross(H * 0.8);
    const low = litAcross(H * 0.2);
    check('the light across the lane is not flat', Math.max(...high) - Math.min(...high) > 0.02, true);
    check('and there is somewhere really lit', Math.max(...high) > 0.05, true);
    /**
     * And it thins with depth. The mask is not in this at all: this is the light the WATER has, not what survives to
     * the eye -- two different things, which is why the specks can be dark low down without the mask's help.
     */
    check('and the light thins with depth', Math.max(...low) < Math.max(...high), true);

    const specks = bd.motes.lighting;
    check('as many specks as the config asks for', specks.length, Math.round(mech.menu.water.motes.count));
    check('and they are not all in the same light', Math.max(...specks) - Math.min(...specks) > 0.01, true);

    /** The bubbles: a few fixed vents, spread out, each letting go of whole strings over time. */
    const vents = bd.bubbles.ventXs;
    check('as many vents as the config asks for', vents.length, Math.round(mech.menu.water.bubbles.vents));
    check('and they are spread across the lane', Math.min(...vents) < W * 0.4 && Math.max(...vents) > W * 0.6, true);

    const before = bd.bubbles.count;
    // Long enough for every vent to have let at least one string go, whatever its staggered start.
    for (let i = 0; i < 600; i++) bd.update(DT);
    check('bubbles come out of the vents', bd.bubbles.count > before, true);
    /**
     * The depths, which are the whole of the distance cue: a far vent's string is drawn fainter. They are the evenly
     * spaced set DEALT OUT at random rather than counted off in order -- counting them off would put the faintest vent
     * at one end of the lane and the brightest at the other, which reads as light falling from one side rather than as
     * distance.
     *
     * What is asserted is that they are still that set, whatever order they landed in. The ORDER itself is a roll and
     * is deliberately NOT asserted: a shuffle produces the sorted order about once in twenty-four, so a check on it
     * would go red on its own about that often, and a probe that fails at random is a probe people stop reading.
     */
    const depths = bd.bubbles.ventDepths;
    const expected = depths.map((_, i) => (depths.length === 1 ? 1 : i / (depths.length - 1)));
    check('every vent has a distance', depths.length, vents.length);
    check(
      'and the distances are the evenly spaced set, whatever order they were dealt in',
      [...depths].sort((a, b) => a - b).map((d) => +d.toFixed(3)),
      expected.map((d) => +d.toFixed(3)),
    );
    check(
      'and the specks are still all inside the lane',
      bd.motes.heights.every((y) => y >= 0 && y <= H),
      true,
    );

    /**
     * And the bubbles on the INTERFACE, which are a different field in a different coordinate space -- and the one
     * thing about them a probe has to pin down is the direction: these rise up the screen, so their `y` must DECREASE.
     * Getting that from the water's convention would send them down through the buttons, which is the kind of bug a
     * screenshot catches and nothing else does.
     */
    console.log('\n--- the bubbles on the title and the stones ---');
    const ui = new drift.UiBubbles();
    ui.setScreen(W, H);
    ui.setSpouts([{ x: W * 0.3, y: H * 0.5 }, { x: W * 0.3, y: H * 0.8 }]);
    check('the spouts the menu handed over', ui.spoutCount, 2);
    for (let i = 0; i < 300; i++) ui.update(DT);
    check('bubbles come off them', ui.count > 0, true);
    const life = mech.menu.uiBubbles;
    // One is followed from birth: it must start at the spout and be ABOVE it a moment later.
    const bornAt = H * 0.8;
    const rises = ui.yOf(0) < bornAt;
    check('and they rise UP the screen, not down into the stones', rises, true);
    const early = ui.sizeOf(0);
    check('and they are blown up rather than appearing whole', early >= 0 && early <= 1, true);
    check('with a growth time the config owns', life.growSeconds > 0 && life.growSeconds < 2, true);
  }

  // ---------------------------------------------------------------------------------------------
  // The ones that travel alone
  // ---------------------------------------------------------------------------------------------
  console.log('\n--- the loners ---');
  {
    /**
     * THE DICE SAY YES TO EVERYTHING, and that is the point: a loner that got batched would be nearly invisible in a
     * probe that rolled the way the game does, because most rolls say no. `0.7` picks the shark out of `SWIMMERS` and
     * `0.08` the tuna -- and the kind that comes OUT is asserted too, or this would be testing the probe's own
     * arithmetic about where a kind sits in that list.
     */
    const waveOf = (kindRoll) => {
      const bd = new MenuBackdrop();
      bd.layout(W, H, 0);
      const restore = dice([0.9, kindRoll, 0, 0]);
      bd.spawnWave();
      restore();
      return bd.swimmers.hazards.map((h) => h.kind);
    };

    const shark = waveOf(0.7);
    check('a roll of 0.7 really does pick a shark', shark[0], 'shark');
    check('and a shark arrives alone however the dice fall', shark.length, 1);

    const octopus = waveOf(0.65);
    check('a roll of 0.65 picks an octopus', octopus[0], 'octopus');
    check('and it arrives alone too', octopus.length, 1);

    const tuna = waveOf(0.08);
    check('a roll of 0.08 picks a tuna', tuna[0], 'tuna');
    check('and a tuna still comes in a team', tuna.length, 2);

    /**
     * And every name in the list is a creature that CAN turn up -- checked by producing them rather than by trusting
     * the names, which is the difference between asking the spawner and reading the config back to itself.
     *
     * `menuBackdrop.ts` throws at import if a name is not a swimmer, so this can only ever fail for a name that IS a
     * swimmer but that the spawner never reaches; that is a different bug and worth catching separately.
     */
    const bd = new MenuBackdrop();
    bd.layout(W, H, 0);
    const produced = new Set();
    for (let i = 0; i < 40; i++) {
      bd.swimmers.hazards.length = 0;
      bd.velocity.clear();
      const restore = dice([0.9, i / 40 + 0.001, 0, 0]);
      bd.spawnWave();
      restore();
      for (const h of bd.swimmers.hazards) produced.add(h.kind);
    }
    check(
      'and every name in the list is one the spawner can actually produce',
      cfg.loners.every((k) => produced.has(k)),
      true,
    );
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
      bd.layout(W, H, 0);
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
