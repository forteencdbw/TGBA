/**
 * Render view. The design box that world-independent HUD sizes are authored against.
 */
export const VIEW = {
  width: 540,
  height: 960,
} as const;

/**
 * World scale.
 *
 * The play area spans `WORLD_WIDTH` metres of width and `WORLD_HEIGHT` metres of depth, where the
 * ratio between them is chosen so the visuals sit at the intended size relative to the lane. The
 * viewport then zooms that box to FILL the canvas horizontally, so the play area always reaches
 * both screen edges and the left/right letterbox bars are gone on every aspect ratio.
 *
 * Why the world is wider than it is deep:
 *   The bubble's on-screen size is controlled by `BUBBLE_LANE_RATIO` (a fraction of the LANE
 *   width), not by a pixel count, so it scales with the play area instead of collapsing to a dot
 *   on a wide display. Fixing the vertical density while filling the width instead would leave the
 *   bubble at ~3% of the lane on a desktop -- measured, not guessed.
 *
 * Two invariants this keeps:
 *   - the world is isotropic (one uniform scale for both axes), so circles stay circles;
 *   - horizontal handling is expressed as crossing TIMES and the bubble's x as a FRACTION of the
 *     lane, so feel is identical on every device.
 *
 * `WORLD_HEIGHT`, `WORLD_WIDTH` and `DEPTH_TOTAL` all live in `levels.ts` now: they are properties
 * of a LEVEL, not global constants, because the level's length and the amount of water on screen
 * have to change together. See that file for why.
 *
 * World-space convention: world y is metres above the seabed, so
 *   seabed  -> y = 0
 *   surface -> y = DEPTH_TOTAL
 * and `depth = DEPTH_TOTAL - y`.
 */

/**
 * Where the bubble sits vertically on screen, as a fraction of view height from the top.
 *
 * 0.9 puts it near the bottom, which is what makes the ascent read as upward motion: almost all
 * of the screen is the water it is about to enter, so approaching hazards are visible early.
 * Lower = the bubble sits higher and you see less of what is coming.
 */
export const PLAYER_SCREEN_Y_RATIO = 0.9;

/**
 * Lateral feel targets, expressed as CROSSING TIMES so the controls feel identical on every
 * device regardless of how wide the lane turns out to be.
 *
 * `lateral.ts` calibrates the acceleration and the boost penalty from these, by simulating the
 * real update loop -- never in closed form, because speed approaches its steady state
 * asymptotically and `accel / damping` is not the speed actually reached from a standstill.
 */
/** Seconds to cross the lane from a standstill at cruising speed. */
export const COLUMN_CROSSING_SECONDS = 2.5;
/** Seconds to cross the lane from a standstill while holding accelerate. */
export const BOOST_CROSSING_SECONDS = 6.5;
/**
 * Seconds for the KEYBOARD to cross the lane, at a fixed speed with no acceleration.
 *
 * Keyboard steering is a constant velocity on purpose. An acceleration ramp on a binary axis
 * saturates almost immediately and overshoots, which reads as twitchy no matter how the ramp is
 * scaled -- and scaling it is exactly what a previous attempt got wrong: even at 5% of the
 * calibrated acceleration the top speed came out around 8 lane-widths per second, which is both too
 * fast to aim and impossible to judge by eye.
 *
 * Bigger = slower. Touch steering is unaffected: it eases toward the finger and never reads this.
 */
export const KEYBOARD_CROSSING_SECONDS = 2;
/** Passive drag toward zero velocity, per second. Higher = stops sooner = less floaty. */
export const LATERAL_DAMPING = 5.5;
/** Fixed simulation step (120Hz). Shared by the game loop and the lateral calibration. */
export const SIM_DT = 1 / 120;

/** Where the bubble starts across the play area, as a fraction of WORLD_WIDTH. */
export const SPAWN_X_RATIO = 0.38;

/**
 * LIVE TUNING VALUES. Every number that decides how the game *feels* lives here so that D1 can
 * actually answer "is this fun?" instead of guessing. Mutate at runtime from the console via
 * `window.__GB.tuning` and watch the result immediately.
 */
export const tuning = {
  // --- Vertical (progress) -------------------------------------------------
  //
  // The ascent CURVE now lives on the LEVEL (`src/levels.ts`), because it is part of what defines a
  // level: its length plus its curve is the whole pacing. There is deliberately no `targetRunSeconds`
  // here. Run time is an OUTPUT -- `nominalAscentSeconds()` integrates the real curve -- and having a
  // duration target as well made the curve a back-solved quantity, which is how the game ended up
  // with a first 40% of climb that barely changed speed and read as frozen water.

  /**
   * Top ascent speed while the accelerate control is held, as a multiple of the cruising speed.
   *
   * A large value is safe: the accelerate control changes how fast the player moves THROUGH the
   * water, and collectables are solved against the cruising speed so they do not change. See
   * `tuning.bubbleRise*` and `EntityField.update`.
   *
   * NOTE this changes the run length if held, and `nominalAscentSeconds()` (the HUD `eta`) only
   * models the NO-INPUT case.
   */
  boostMultiplier: 13,
  /** Speed multiplier while braking. */
  brakeMultiplier: 0.4,
  /**
   * Seconds to accelerate from cruising speed to the boost ceiling, and to settle back afterwards.
   *
   * Expressed as a TIME rather than as an acceleration in m/s^2, because the ascent speed itself
   * changes with depth and a constant acceleration would therefore reach the ceiling at a different
   * rate at every depth. A time constant keeps the feel identical for the whole climb.
   *
   * The approach is exponential, so ~63% of the change happens in this time and it is visibly
   * settled by about 3x it. Setting it to 0 makes the change instant, which is what the game did
   * before this was configurable.
   */
  boostAccelSeconds: 0.5,

  // --- Horizontal (the actual controls) -----------------------------------
  //
  // NOT here on purpose. Because the play area's width follows the display, the lateral constants
  // depend on the lane width and are calibrated at runtime by `lateral.ts` from the crossing-time
  // targets above. See `window.__GB.lateral` for the values this device resolved to.

  // --- Volume economy (D2: volume IS health) ------------------------------
  //
  // A closed economy: these numbers constrain each other. `src/volume.ts` holds the formulas and
  // the reasoning; `node scripts/solve-volume.mjs` prints the resulting curve.
  //
  // Health is a fixed number of hits; volume is the pool holding them. A hit costs exactly one
  // hit-point, so hits-to-die is the same at any size. See `src/volume.ts` for the two shapes this
  // replaced and why both were wrong.
  /** Volume worth one hit. Start volume 1 with 0.2 => 5 hits. */
  hitPointVolume: 0.2,
  /** Fraction of an absorbed bubble's volume that transfers to the player. */
  absorbEfficiency: 0.9,
  /** Volume ceiling, so repeated absorption cannot make the bubble a permanent wall. */
  volumeMax: 3.2,
  /**
   * The bubble's radius as a fraction of the PLAY AREA WIDTH.
   *
   * Sized against the lane rather than in pixels so it keeps the same proportion of the play area
   * on every display. Also the reference length for collectable bubble sizes.
   */
  bubbleLaneRatio: 0.053,

  // --- Collectables -------------------------------------------------------
  /**
   * How fast a collectable rises ON ITS OWN, as a multiple of the player's ascent speed.
   *
   * This is the real-world relationship: bigger bubbles rise faster, because buoyancy grows with
   * volume while drag grows with cross-section, so terminal velocity increases with radius.
   *
   * What the player sees is the DIFFERENCE:
   *
   *     screen speed = playerAscent - the bubble's own rise speed
   *
   * so with these bounds:
   *   - a bubble at 0.15x the player's radius rises at 0.15 of the player's pace, so it falls away
   *     down the screen at 0.85x the ascent;
   *   - one the player's own size rises at about 1.0, so it hangs almost still alongside;
   *   - one at 1.6x or more rises FASTER than the player and climbs up the screen.
   *
   * That makes size legible with no UI at all: what drifts downward is what you can eat, and what
   * climbs away is what you cannot.
   *
   * Note the whole field is measured RELATIVE to the ascent, so the spread is modest near the
   * seabed (about 1-2 px/s on a phone) and obvious near the surface (about 3-5 px/s across a
   * 13-second crossing). That follows from being physically consistent, and is not a defect.
   *
   * Replaces an earlier model that scaled a fixed downward speed by the player's ascent. That got
   * the magnitude right -- the stream moved -- but had no relationship to bubble size whatsoever.
   */
  bubbleRiseMin: 0.15,
  bubbleRiseMax: 1.6,
  /** How the rise multiple scales with size. 1 = linear in radius, which is the readable choice. */
  riseSpeedExponent: 1,
  /**
   * Lateral wobble amplitude as a fraction of a collectable's own radius.
   *
   * Small bubbles visibly shimmy as they rise, while large ones hold their shape, so the amplitude
   * scales DOWN with size. Purely cosmetic and deliberately small: it must never move a bubble
   * enough to change when it passes the player, or reading the screen becomes guesswork.
   */
  bubbleWobbleMin: 0.05,
  bubbleWobbleMax: 0.3,

  // --- Keyboard steering --------------------------------------------------
  // NOT a tuning value: keyboard speed is derived from KEYBOARD_CROSSING_SECONDS above, so it is
  // expressed as a crossing time rather than as an acceleration scale. Scaling the acceleration was
  // the wrong lever -- see the note on that constant.

  // --- Hazards (D3) -------------------------------------------------------
  /**
   * Jellyfish slow: how much of the ascent speed is removed, and for how long.
   *
   * The one hazard that takes CONTROL away rather than health, so it is tuned to be annoying rather
   * than lethal: at 0.55 the player still moves, which means they can still steer out of trouble.
   * A slow that stopped the bubble entirely would be a stun, and a stun in a game about smooth
   * upward flow is just a pause.
   */
  hazardSlowFactor: 0.55,
  hazardSlowSeconds: 1.5,
  /**
   * How hard a crab launches the player upward, in m/s.
   *
   * An upward launch is the only hazard that HELPS as well as hurts -- it skips water, at the cost of
   * losing control of where you land. That ambiguity is the point, and it is why the launch is
   * telegraphed with a visible arc for a full second: it has to read as an opportunity you can choose
   * to take, not a punishment.
   */
  hazardCrabLaunchMps: 30,
  /**
   * How quickly a launch impulse decays, as a time constant in seconds.
   *
   * Short enough to read as a kick rather than a lift, long enough that the player gains real height
   * from it. Roughly, the height gained is `speed * this`, so 30 m/s over 0.9s is about 27m -- a
   * meaningful shortcut, not a teleport.
   */
  hazardLaunchDecaySeconds: 0.9,

  // --- Talents (D4) -------------------------------------------------------
  /**
   * How many bait bubbles a 鱼屁泡 fart leaves behind.
   *
   * These are the BACKLASH, and the count is the whole point: the fart pushes fish off you, then
   * leaves food that feeds them and (via the emergence rules) splits them. Set it to 0 and the talent
   * becomes a free escape, which is exactly what the design principle forbids.
   */
  fartBaitCount: 3,

  // --- Invulnerability ----------------------------------------------------
  /** Seconds of invulnerability after a hit, so a swarm cannot chain-kill in one touch. */
  invulnerableSeconds: 0.8,
} as const;

export type Tuning = typeof tuning;
