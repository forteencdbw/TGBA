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
 * World-space convention: world y is metres above the seabed, so
 *   seabed  -> y = 0
 *   surface -> y = DEPTH_TOTAL
 * and `depth = DEPTH_TOTAL - y`.
 */
export const DEPTH_TOTAL = 500;
/**
 * Visible vertical span, in metres. Sets how much depth fits on screen; larger = more zoomed out.
 * The bubble and every world-space visual are sized relative to `WORLD_WIDTH`, so this only
 * controls how much of the climb is on screen at once.
 */
export const WORLD_HEIGHT = 190;
/** Play area width in metres. The viewport scales this to fill the canvas width exactly. */
export const WORLD_WIDTH = WORLD_HEIGHT * 1.9;

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
  /** Ascent speed (m/s) at the seabed. */
  ascentSpeedBase: 1.7,
  /**
   * Ascent speed (m/s) as the bubble reaches the surface.
   *
   * There is no elementary closed form for the traversal time when the exponent is not 1, so
   * re-solve it numerically (`node scripts/solve-ascent.mjs`) rather than deriving it by hand:
   *   1.7 / 2.4 / 8.55  =>  a no-input run lasts 175.0s  (design target: ~3 minutes)
   *   500m 1.70  400m 1.84  300m 2.46  180m 4.05  100m 5.71  50m 7.02  0m 8.55
   * Confirm from the running game: the HUD `eta` field and `window.__GB.game.diagnostics.nominalSeconds`.
   */
  ascentSpeedPeak: 8.55,
  /** >1 keeps the early game slow and back-loads the speed. 1 = perfectly linear. */
  ascentCurveExponent: 2.4,
  /** Player input multiplier while accelerating / braking. */
  boostMultiplier: 1.55,
  brakeMultiplier: 0.4,

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

  // --- Invulnerability ----------------------------------------------------
  /** Seconds of invulnerability after a hit, so a swarm cannot chain-kill in one touch. */
  invulnerableSeconds: 0.8,
} as const;

export type Tuning = typeof tuning;
