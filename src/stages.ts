import { mech } from './mechanisms';

/**
 * Bubble growth stages.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT A STAGE IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------------------------
 * A stage is a SPEED TIER. Absorbing enough collectables promotes the bubble, and each promotion makes it
 * slower: stage 1 is the fastest, stage 2 is 80% of it, stage 3 is 80% of stage 2.
 *
 * That is the whole tension of the game in one rule -- **the more you eat, the harder it is to dodge** -- so
 * "should I keep eating" becomes a real decision rather than a free upgrade.
 *
 * A stage is NOT the visual size. Size comes from `volume`, which still accumulates one collectable at a time,
 * and it is what decides whether the player can eat a given bubble. Keeping those separate means the speed
 * tiers can be retuned without touching the size economy, and vice versa.
 *
 * ---------------------------------------------------------------------------------------------
 * EVERY NUMBER COMES FROM config/mechanics.json5
 * ---------------------------------------------------------------------------------------------
 * Nothing here is a literal. The thresholds, the multipliers, the floor, the colours and the names are all in
 * the config file with Chinese explanations, because the point of that file is that tuning does not mean
 * editing TypeScript.
 */

/** The stage the player is in, 1-based, and the movement multiplier that comes with it. */
export interface StageState {
  /** 1, 2, 3, ... */
  stage: number;
  /** Collectables absorbed since the last promotion. */
  absorbedInStage: number;
  /** How many more are needed for the next stage, or null at the top stage. */
  neededForNext: number | null;
  /** Movement multiplier for this stage, after the floor is applied. */
  speedMultiplier: number;
}

/** How many stages the config defines. */
export function stageCount(): number {
  return mech.stages.speedMultiplier.length;
}

/**
 * How many collectables must be absorbed to leave a given stage.
 *
 * @return the count, or null at the top stage where there is nowhere to go.
 *
 * Reads the two thresholds from the config rather than using a formula: they are two independent authored
 * numbers, so a designer can make stage 3 a long grind without that implying anything about stage 2.
 */
export function absorbsRequiredToLeave(stage: number): number | null {
  if (stage >= stageCount()) return null;
  // Stage 1 -> 2 uses absorbToStage2; stage 2 -> 3 uses absorbToStage3. Beyond the configured pairs there is
  // no threshold, so a config with more speed entries than thresholds simply stops promoting.
  if (stage === 1) return mech.stages.absorbToStage2;
  if (stage === 2) return mech.stages.absorbToStage3;
  return null;
}

/**
 * The movement multiplier for a stage, with the configured floor applied.
 *
 * The floor is a guard rather than a design choice: chaining 0.8 makes stage 3 cost 36% of the player's speed,
 * and a future config with more stages would compound that until the bubble cannot reach anything. One number
 * in the config keeps that from being possible.
 */
export function speedMultiplierFor(stage: number): number {
  const raw = mech.stages.speedMultiplier[Math.max(0, Math.min(stageCount() - 1, stage - 1))] ?? 1;
  return Math.max(mech.stages.minSpeedMultiplier, raw);
}

/** A fresh stage state, for the start of a run. */
export function initialStageState(): StageState {
  return {
    stage: 1,
    absorbedInStage: 0,
    neededForNext: absorbsRequiredToLeave(1),
    speedMultiplier: speedMultiplierFor(1),
  };
}

/** The display colour for a stage, falling back to the last one defined. */
export function stageColor(stage: number): number {
  const list = mech.stages.color;
  return list[Math.min(list.length - 1, Math.max(0, stage - 1))] ?? 0xffffff;
}

/** The display name for a stage, falling back to the last one defined. */
export function stageName(stage: number): string {
  const list = mech.stages.name;
  return list[Math.min(list.length - 1, Math.max(0, stage - 1))] ?? `阶段 ${stage}`;
}

/**
 * Record one absorbed collectable, and report whether that promoted the bubble.
 *
 * In place, because the caller owns the state: the game holds it so it survives across frames and resets with
 * the run.
 *
 * @return true if the stage changed, so the caller can grant the growth invulnerability and play a cue. The
 *   promotion is the caller's to celebrate -- this function only knows the numbers.
 */
export function recordAbsorb(state: StageState): boolean {
  const needed = absorbsRequiredToLeave(state.stage);
  if (needed === null) {
    // Already at the top stage. Keep counting so the HUD can still show progress if it wants, but the count
    // cannot run away.
    state.absorbedInStage = Math.min(state.absorbedInStage + 1, 9999);
    return false;
  }
  state.absorbedInStage += 1;
  if (state.absorbedInStage < needed) return false;

  state.stage += 1;
  state.absorbedInStage = 0;
  state.neededForNext = absorbsRequiredToLeave(state.stage);
  state.speedMultiplier = speedMultiplierFor(state.stage);
  return true;
}

/**
 * Reset one stage back, for a hit that costs a growth stage.
 *
 * NOT wired up anywhere yet: the design has not decided whether damage should demote the bubble, and doing it
 * silently would change the whole risk calculus. It is here because the reverse of a mechanic belongs beside
 * it, and because `stages` being reversible is the obvious next tuning question.
 */
export function demote(state: StageState): boolean {
  if (state.stage <= 1) return false;
  state.stage -= 1;
  state.absorbedInStage = 0;
  state.neededForNext = absorbsRequiredToLeave(state.stage);
  state.speedMultiplier = speedMultiplierFor(state.stage);
  return true;
}
