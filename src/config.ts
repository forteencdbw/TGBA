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
 * How fast lateral velocity bleeds off when the player is not steering, per second.
 *
 * This is the COAST-DOWN rate: releasing a key decays `vx` by this factor each second rather than stopping dead,
 * which is what makes a small correction possible instead of a lurch.
 *
 * It used to double as the touch steering's easing rate, when touch named a destination and the bubble eased
 * toward it. Touch does not coast at all any more -- it is a drag, a distance rather than a speed, and it stops the
 * instant the finger does -- so this is only the keyboard's coast-down and the calibration value
 * `src/lateral.ts` solves against. Kept out of the config file for that reason: it is part of the calibration
 * contract, not a knob the balance depends on.
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
 * The KEYBOARD's speed, and only the keyboard's: the touch drag is 1:1 with the finger and therefore has no speed
 * of its own to state. See `movement.drag` in the config file.
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
 * ---------------------------------------------------------------------------------------------
 * EVERY MEMBER IS A GETTER, AND THAT IS THE WHOLE POINT
 * ---------------------------------------------------------------------------------------------
 * `window.__GB.tuning` is the documented way to dial a number in from the browser console, and to hold that
 * promise a member has to be a live view of `mech` rather than a copy of it. It was a mix of the two: three
 * getters and eleven values captured at module load, so editing `tuning.verticalSpeedScale`, `hitPointVolume` or
 * any of the other eleven did nothing at all -- silently, because a captured number looks exactly like a live one.
 * A tunable that cannot be tuned is worse than one that is not there, which is the rule this project already holds
 * for the whole config file.
 *
 * So: a new member is a getter/setter pair, never a value. The names are the flat, gameplay-facing vocabulary for
 * knobs whose config paths are grouped by system; where the two disagree (`hitPointVolume` against
 * `volume.hitCost`) this is the name the simulation reads by.
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
  get hitPointVolume() {
    return mech.volume.hitCost;
  },
  set hitPointVolume(v: number) {
    mech.volume.hitCost = v;
  },

  // Movement.
  get verticalSpeedScale() {
    return mech.movement.verticalSpeedScale;
  },
  set verticalSpeedScale(v: number) {
    mech.movement.verticalSpeedScale = v;
  },

  // Collectables.
  get bubbleRiseMin() {
    return mech.collectables.riseMin;
  },
  set bubbleRiseMin(v: number) {
    mech.collectables.riseMin = v;
  },
  get bubbleRiseMax() {
    return mech.collectables.riseMax;
  },
  set bubbleRiseMax(v: number) {
    mech.collectables.riseMax = v;
  },
  get riseSpeedExponent() {
    return mech.collectables.riseSpeedExponent;
  },
  set riseSpeedExponent(v: number) {
    mech.collectables.riseSpeedExponent = v;
  },
  get bubbleWobbleMin() {
    return mech.collectables.wobbleMin;
  },
  set bubbleWobbleMin(v: number) {
    mech.collectables.wobbleMin = v;
  },
  get bubbleWobbleMax() {
    return mech.collectables.wobbleMax;
  },
  set bubbleWobbleMax(v: number) {
    mech.collectables.wobbleMax = v;
  },

  // Hazards.
  get hazardSlowFactor() {
    return mech.hazards.slowFactor;
  },
  set hazardSlowFactor(v: number) {
    mech.hazards.slowFactor = v;
  },
  get hazardSlowSeconds() {
    return mech.hazards.slowSeconds;
  },
  set hazardSlowSeconds(v: number) {
    mech.hazards.slowSeconds = v;
  },
  get hazardLaunchDecaySeconds() {
    return mech.hazards.launchDecaySeconds;
  },
  set hazardLaunchDecaySeconds(v: number) {
    mech.hazards.launchDecaySeconds = v;
  },
  get hazardCrabLaunchScreenBonus() {
    return mech.hazards.crabLaunchScreenBonus;
  },
  set hazardCrabLaunchScreenBonus(v: number) {
    mech.hazards.crabLaunchScreenBonus = v;
  },
  get invulnerableSeconds() {
    return mech.hazards.invulnerableSeconds;
  },
  set invulnerableSeconds(v: number) {
    mech.hazards.invulnerableSeconds = v;
  },
};

/** The config file itself, re-exported so callers have one import for "the mechanics". */
export { mech };
