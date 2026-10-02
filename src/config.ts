import { mech } from './mechanisms';

/**
 * Non-tunable constants: the design box, and the display geometry.
 *
 * Deliberately NOT in `config/mechanics.json5`. These are not tuning knobs -- they describe the shape of the
 * world and the reference resolution the HUD was authored against, and changing one is a code change with
 * consequences that a hand-edit should not invite. The hand-editable numbers all live in the config file, with
 * Chinese explanations.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE TO CHANGE THINGS
 * ---------------------------------------------------------------------------------------------
 *   Feel, difficulty, economy, pacing   ->  config/mechanics.json5
 *   How the world is projected          ->  here, or `src/viewport.ts`
 *
 * `tuning` below is a thin alias of the config's gameplay sections, kept under its old name because a lot of
 * code reads `tuning.x` and because `window.__GB.tuning` is how live tuning is done from the console. It is a
 * live view: mutating `tuning.volumeMax` changes `mech.volume.max`, so the config file and the console are
 * editing the same object rather than two copies that drift.
 */

/** Render view. The design box that world-independent HUD sizes are authored against. */
export const VIEW = {
  width: 540,
  height: 960,
} as const;

/**
 * Aspect of the play area, as width / height. Sets the shipping lane width.
 *
 * 1.9 is WIDER than it is tall, which is deliberate: the world is authored so a screenful shows plenty of
 * water across, and the lane-relative sizes of collectables then line up with the metre-scaled depth through
 * this number. Changing it changes how big everything looks, not just the layout.
 */
export const PLAY_AREA_ASPECT = 1.9;

/**
 * Largest the play area may be drawn, in canvas pixels.
 *
 * The game is a portrait vertical scroller; a desktop window is not. Scaling the lane to fill the window
 * inflates the world zoom, which inflates the HUD and puts the skill button off the right edge -- see
 * `computeViewport`. 900 is chosen for how big the BUBBLE ends up: at a 700px cap the desktop bubble was
 * 29.8px against a phone's 16.6px, and 900 brings them within 2.3x.
 */
export const MAX_LANE_WIDTH_PX = 900;

/** Touch hit-target padding, in design pixels, so a control is not smaller than a fingertip. */
export const TOUCH_SLOP_PX = 12;

/**
 * How fast lateral velocity bleeds off when the player is not steering, per second.
 *
 * This is the COAST-DOWN rate: releasing a key or centring the wheel decays `vx` by this factor each second
 * rather than stopping dead, which is what makes a small correction possible instead of a lurch.
 *
 * It used to double as the touch steering's easing rate, when touch named a destination and the bubble eased
 * toward it. That model is gone -- the wheel produces an axis like the keyboard does -- so this is now only the
 * coast-down and the calibration value `src/lateral.ts` solves against. Kept out of the config file for that
 * reason: it is part of the calibration contract, not a knob the balance depends on.
 */
export const LATERAL_DAMPING = 5.5;

/**
 * Player steering: seconds to cross the play area.
 *
 * A CONSTANT speed rather than an acceleration ramp. A binary key axis through a ramp saturates almost
 * immediately and overshoots, which reads as twitchy however the ramp is scaled -- scaling it down made the
 * top speed absurd rather than making it controllable. A crossing time is directly predictable: hold the key,
 * cross in this long.
 *
 * Shared by the keyboard and the touch wheel: full deflection on the wheel is exactly this speed. One constant
 * for both, so switching device does not switch feel.
 */
export const KEYBOARD_CROSSING_SECONDS = mech.movement.keyboardCrossingSeconds;

/**
 * Lateral calibration targets, expressed as CROSSING TIMES rather than as speeds.
 *
 * A time is what a player can feel and what stays constant across devices; the speeds are solved per-display
 * from the lane width by `src/lateral.ts`. Both are here rather than in the config file because they are part
 * of the calibration contract, not of the game's balance.
 */
export const COLUMN_CROSSING_SECONDS = 2.5;
/** Crossing time for the reference column, used to sanity-check the calibration. */
export const BOOST_CROSSING_SECONDS = 6.5;

/** Simulation step. Fixed, so the physics is frame-rate independent. */
export const SIM_DT = 1 / 120;

/** Where the bubble starts across the lane, as a fraction. Slightly left of centre, arbitrarily. */
export const SPAWN_X_RATIO = 0.38;

/** The player's vertical screen position at the start of a run, as a fraction from the bottom. */
export const PLAYER_SCREEN_Y_RATIO = 0.5;

/**
 * The gameplay tuning, as a live alias of the config file.
 *
 * A getter-based proxy would be tidier, but a plain object built from the config's sections is enough and keeps
 * `tuning.x = 5` writing straight through to the same values the game reads.
 */
export const tuning = {
  // Volume economy.
  get volumeMax() {
    return mech.volume.max;
  },
  set volumeMax(v: number) {
    mech.volume.max = v;
  },
  get absorbEfficiency() {
    return mech.volume.absorbEfficiency;
  },
  set absorbEfficiency(v: number) {
    mech.volume.absorbEfficiency = v;
  },
  get bubbleLaneRatio() {
    return mech.volume.laneRatio;
  },
  set bubbleLaneRatio(v: number) {
    mech.volume.laneRatio = v;
  },
  hitPointVolume: mech.volume.hitCost,

  // Movement.
  verticalSpeedScale: mech.movement.verticalSpeedScale,

  // Collectables.
  bubbleRiseMin: mech.collectables.riseMin,
  bubbleRiseMax: mech.collectables.riseMax,
  riseSpeedExponent: mech.collectables.riseSpeedExponent,
  bubbleWobbleMin: mech.collectables.wobbleMin,
  bubbleWobbleMax: mech.collectables.wobbleMax,

  // Hazards.
  hazardSlowFactor: mech.hazards.slowFactor,
  hazardSlowSeconds: mech.hazards.slowSeconds,
  hazardCrabLaunchMps: mech.hazards.crabLaunchMps,
  hazardLaunchDecaySeconds: mech.hazards.launchDecaySeconds,
  hazardCrabLaunchScreenBonus: mech.hazards.crabLaunchScreenBonus,
  invulnerableSeconds: mech.hazards.invulnerableSeconds,
  /**
   * Bait bubbles a fish-fart leaves behind.
   *
   * The talent's backlash, and therefore its balance: the fart pushes fish away AND feeds them, so a rescue
   * that is not followed up makes the swarm bigger. Read from the config so the size of that backlash is a
   * tunable number rather than a constant buried in the talent's code.
   */
  fartBaitCount: 3,
};

/** The config file itself, re-exported so callers have one import for "the mechanics". */
export { mech };
