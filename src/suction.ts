import { mech } from './mechanisms';

/**
 * Suction: a long press pulls light things toward the bubble.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT JUST A BIGGER MOUTH
 * ---------------------------------------------------------------------------------------------
 * Suction only PULLS. It does not eat. Everything it drags in still goes through the consumption tier rule, so
 * dragging a crab you cannot eat is accelerating a hazard into your own face. That is the whole point: it makes
 * "when do I hold this" a real decision rather than a free widening of the mouth, and it is what the design's
 * "sucking pulls the dangerous things too" means in practice.
 *
 * The other half of the price is speed. Movement drops to `moveSpeedFactor` while the field is up, so the player
 * is nearly unable to dodge exactly while they are committed to gathering. Both costs together are what turn a
 * vacuum into a choice.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT "LIGHT" MEANS
 * ---------------------------------------------------------------------------------------------
 * The pull on a target scales with how heavy it is RELATIVE TO THE PLAYER, not absolutely. This is what makes the
 * mechanic grow with the player: the same floating speck is heavy when you are tiny and trivial when you are
 * huge, so the suction radius and its effectiveness both improve with size without any second progression.
 *
 *   ratio <= 1          the target is lighter than the player: full speed, "swallowed directly"
 *   ratio 1..heavyRatio  decayed by the ratio
 *   ratio >= heavyRatio  the heavy floor, barely moves
 *
 * A floor rather than zero, because "a rock does not move at all" reads as a bug; a rock that creeps is legibly
 * just too heavy.
 */

/** The suction radius as a fraction of the lane width, for a given player volume. */
export function suctionRadiusFraction(volume: number): number {
  const raw = mech.suction.radiusRatio + Math.max(0, volume) * mech.suction.radiusPerVolume;
  return Math.min(mech.suction.maxRadiusRatio, raw);
}

/**
 * How much of full pull speed this target gets, 0..1, from its mass relative to the player's.
 *
 * Returned as a factor rather than as a force so the caller applies one multiplier to a velocity it already
 * knows, and so the rule can be asserted directly without running any physics.
 */
export function pullFactor(targetMass: number, playerMass: number): number {
  if (targetMass <= 0) return 1;
  // A player of zero mass has no pull at all; guard rather than divide.
  if (playerMass <= 0) return mech.suction.heavyFloor;
  const ratio = targetMass / playerMass;
  if (ratio <= 1) return 1;
  if (ratio >= mech.suction.heavyRatio) return mech.suction.heavyFloor;
  // Linear decay from 1 down to the floor across the heavy band.
  const t = (ratio - 1) / (mech.suction.heavyRatio - 1);
  return 1 - t * (1 - mech.suction.heavyFloor);
}

/** How fast a target is pulled, as a fraction of the lane width per second. */
export function pullSpeedFraction(targetMass: number, playerMass: number): number {
  return mech.suction.pullPerSecond * pullFactor(targetMass, playerMass);
}

/**
 * The movement multiplier while the field is up.
 *
 * Exposed rather than applied in place so the player's own speed calculation owns its own arithmetic, and so the
 * penalty is one number in one place that a test can assert against the config.
 */
export function suctionMoveFactor(): number {
  return mech.suction.moveSpeedFactor;
}
