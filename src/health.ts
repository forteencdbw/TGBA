import { mech } from './mechanisms';

/**
 * The hit points of a route whose bubble never changes size.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE GAME HAS TWO HEALTH ECONOMIES
 * ---------------------------------------------------------------------------------------------
 * `volume` is the growing routes' health, and it is a good answer for them: eating adds to it, a hit takes one
 * hit-point out of it, and the bubble's SIZE moves with it -- so "how much health do I have" is answered by "how
 * big am I", with no HUD element at all.
 *
 * That answer only holds while the size is actually moving. Measured on the shipped numbers: at the volume a run
 * starts at the bubble takes 5 hits, at the ceiling it takes 50 -- a tenfold range -- while the drawn radius
 * travels 2.6x. The information was there and could not be read off the bubble.
 *
 * So a route whose bubble is a FIXED size gets a number of its own, and this module is that number's economy.
 * The two do not share arithmetic on purpose: volume is a continuous pool that both grows and shrinks, health is
 * a count that only goes down (until a card puts some back), and a shared implementation would have to pretend
 * one of those is the other. What they DO share is `resistance` -- see `healthAfterHit`.
 *
 * The split lives in `bubbleTypes.growsByAbsorbing`: the routes that grow keep the volume rule, and every other
 * form (the base bubble included) uses this one.
 */

/** The maximum, from how many 「血上限」 picks the run has taken. */
export function healthMaxFor(maxPicks: number): number {
  return mech.health.start + mech.health.maxPerPick * Math.max(0, maxPicks);
}

/**
 * After one hit.
 *
 * `resistance` (0..1) is the 「减伤」 card and the silt talent's discount. It is applied HERE for the same reason
 * `shrinkFromHit` applies it there: "one hit is worth the same at every size" is the delicate part of the volume
 * economy, and for health the delicate part is that a hit costs one point -- so the discount scales the POINT
 * rather than the number of points (a 8% discount that sometimes skipped a whole point would be a different card,
 * and one that rounded would be a card that does nothing at nine tenths of the time).
 */
export function healthAfterHit(health: number, resistance = 0): number {
  const factor = 1 - Math.min(1, Math.max(0, resistance));
  return Math.max(0, health - factor);
}

/** After a 「修复血条」 pick: it heals, and never past the maximum. */
export function healthAfterHeal(health: number, max: number): number {
  return Math.min(max, health + mech.health.healPerPick);
}

/**
 * Whole hits still available, for the bar's label.
 *
 * Rounded UP, and the difference is real: at 4.1 health the fifth hit is the one that kills (`4.1 - 5 = -0.9`),
 * so the honest answer to "how many more can I take" is 5. Rounding down would call that a 4 and be wrong about
 * the only thing the label is for. The fraction is not lost -- the bar's LENGTH carries it, which is why the pair
 * exists rather than a number on its own.
 */
export function hitsLeft(health: number): number {
  return Math.max(0, Math.ceil(health));
}
