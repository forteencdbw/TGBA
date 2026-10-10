import { mech, type RageAppearance, type RageLook } from './mechanisms';

/**
 * Rage: the volatile bubble's resource, its countdown, and its four stages.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE IT COMES FROM, AND WHY THAT IS A DELIBERATE HALF-IMPLEMENTATION
 * ---------------------------------------------------------------------------------------------
 * This round has exactly ONE source: **taking a hit without popping**. The design document is explicit that this is
 * not the original intent -- "the closer to danger, the stronger" wanted the player to seek danger out, and this
 * rewards only surviving it. Keeping the near-miss judgement out of it is what makes the system affordable now:
 * damage already exists as an event, and "nearly touched" does not exist at all.
 *
 * The consequence to keep in mind while tuning: **rage is bought with volume**, because volume is health. That is
 * a real mechanic (fighting back from the brink) and it has one failure mode -- being too hurt to use what you
 * earned. The answer here is not a guard rail on the gauge, it is in `src/bubbleTypes.ts`: the charge's power comes
 * from rage and NOT from volume, so a nearly-dead bubble with full rage still hits at full strength. See
 * `slamDamage`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE STAGES ARE AN APPEARANCE, NOT A MECHANIC (YET)
 * ---------------------------------------------------------------------------------------------
 * `stage` picks a look and a HUD name. The document's overload COUNTDOWN (the fourth stage threatening to pop you)
 * is deliberately not here -- it needs the burst verb to be fair, so it lands with it.
 */

export interface RageState {
  /** 0..rage.max. */
  rage: number;
  /** Seconds since the last damage. Rage only starts falling after the configured delay. */
  safeSeconds: number;
  /**
   * Seconds left of the overload, or 0 when the bubble is not overloaded.
   *
   * The design's "rage is both a resource and a countdown": a full gauge does not simply sit there, it starts a
   * clock the player has to beat. See `tickRage`.
   */
  overloadLeft: number;
}

export function initialRageState(): RageState {
  return { rage: 0, safeSeconds: mech.angry.rage.decayDelaySeconds, overloadLeft: 0 };
}

/** Whether the bubble is in overload right now. */
export function isOverloaded(state: RageState): boolean {
  return state.overloadLeft > 0;
}

/**
 * Start the overload, if it is not already running.
 *
 * @return true when this call started it, so the caller can announce it exactly once -- a warning played every frame
 *   would be noise rather than a warning.
 */
export function beginOverload(state: RageState): boolean {
  if (state.overloadLeft > 0) return false;
  state.overloadLeft = mech.angry.overload.seconds;
  return true;
}

/**
 * End the overload: the rage was released, one way or another.
 *
 * Idempotent, and it does NOT touch `rage` -- releasing by breaking something large leaves the rage spent by the
 * hits that did it, while the burst has already emptied the gauge. Two different amounts, one shared "it is over".
 */
export function endOverload(state: RageState): void {
  state.overloadLeft = 0;
}

/**
 * Rage gained from ONE non-fatal hit.
 *
 * Non-fatal by definition: a fatal hit ends the run, and there is no state left to carry rage in. The threshold is
 * therefore not checked here -- `gainRage` is only ever called from the hit path that survived.
 */
export function hitRage(): number {
  return mech.angry.rage.perHit;
}

export function gainRage(state: RageState, amount: number): void {
  state.rage = Math.min(mech.angry.rage.max, state.rage + Math.max(0, amount));
  // Any damage resets the clock, even damage that overflowed the cap: the player was in danger this frame, and the
  // decay is meant to reward being left alone, not to reward being at full rage.
  state.safeSeconds = 0;
  /**
   * Reaching the cap is what puts the bubble INTO overload.
   *
   * Here rather than in the tick, so the countdown starts on the frame the gauge fills: a clock that only noticed a
   * full gauge on the next tick would give the player one extra frame of grace, and "the moment it fills" is the
   * only moment the design describes.
   */
  if (state.rage >= mech.angry.rage.max) beginOverload(state);
}

/**
 * Spend rage, floored at zero.
 *
 * @return how much was actually spent, so the caller can tell "this cost me everything I had" from "this was free"
 *   -- which is the difference between a charge that ends a fight and one that continues it.
 */
export function spendRage(state: RageState, amount: number): number {
  const spent = Math.min(state.rage, Math.max(0, amount));
  state.rage -= spent;
  return spent;
}

/**
 * Advance the clock: count safe time, decay once the delay has passed, and run the overload countdown.
 *
 * @param dt seconds
 * @param inDanger whether something is currently touching or draining the player. The design calls the delay "no
 *   dangerous behaviour for three seconds", and being mid-grab is the clearest version of that: a trash bag that is
 *   draining the bubble should not also be letting its rage cool down.
 * @param decayMultiplier what the route's 余温 picks do to the cooling rate. 1 for a run that has not stacked the
 *   card; below 1 and the heat lingers, which is the whole idea of the card.
 * @return whether the overload EXPIRED this frame, which is the caller's cue to apply the punishment -- the volume
 *   loss belongs to the game, and this module knows nothing about volume.
 */
export function tickRage(state: RageState, dt: number, inDanger: boolean, decayMultiplier = 1): { overloadExpired: boolean } {
  /**
   * The countdown, before anything else, and it REPLACES the decay while it runs.
   *
   * The decay would otherwise fight the countdown: a full gauge would start ticking down from 100 at the same moment
   * the clock started, so the player could "escape" the overload by simply waiting -- which is the one thing the
   * design says must not work.
   */
  if (state.overloadLeft > 0) {
    state.overloadLeft = Math.max(0, state.overloadLeft - dt);
    if (state.overloadLeft === 0) {
      // Expired: the caller punishes, and rage is cleared here because "forced to empty" is this module's rule
      // rather than the game's.
      state.rage = 0;
      state.safeSeconds = 0;
      return { overloadExpired: true };
    }
    state.safeSeconds = 0;
    return { overloadExpired: false };
  }

  if (inDanger) {
    state.safeSeconds = 0;
    return { overloadExpired: false };
  }
  state.safeSeconds += dt;
  if (state.safeSeconds < mech.angry.rage.decayDelaySeconds) return { overloadExpired: false };
  state.rage = Math.max(0, state.rage - mech.angry.rage.decayPerSecond * decayMultiplier * dt);
  return { overloadExpired: false };
}

/**
 * The rage stage: the LAST row whose threshold has been reached.
 *
 * Ordered ascending and checked at load, so this cannot return the wrong row because of a config that was written
 * out of order -- see the loader's check.
 */
export function rageStageFor(rage: number): number {
  const rows = mech.angry.appearance;
  let index = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rage >= rows[i]!.minRage) index = i;
  }
  return index;
}

export function rageAppearance(rage: number): RageAppearance {
  return mech.angry.appearance[rageStageFor(rage)]!;
}

export function rageStageName(rage: number): string {
  return rageAppearance(rage).name;
}

export function rageColor(rage: number): number {
  return rageAppearance(rage).hudColor;
}

/** The geometry the rage stages share. Exposed so the drawing code reads one object rather than fourteen keys. */
export function rageLook(): RageLook {
  return mech.angry.look;
}

/** How full the gauge is, 0..1. What the HUD and any pulse want. */
export function rageFraction(rage: number): number {
  return Math.min(1, Math.max(0, rage / Math.max(1e-6, mech.angry.rage.max)));
}

/**
 * Damage one slam does at a given rage: `P = P0 x (1 + scale x rage/max)`.
 *
 * **Deliberately not a function of volume.** That is the design answer to the document's fourth open question: the
 * loop "get hit -> earn rage -> spend it on a charge" has to keep working when the player is nearly dead, or being
 * hurt both arms and disarms them at once. So a small bubble at full rage hits exactly as hard as a big one, and
 * the charge is the one thing in this game that does not care how big you are.
 */
export function slamDamage(rage: number): number {
  const { slamDamageBase, slamRageScale } = mech.angry.charge;
  return slamDamageBase * (1 + slamRageScale * rageFraction(rage));
}
