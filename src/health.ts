import { mech } from './mechanisms';

/**
 * The health economy: hit points, defence, and what one blow costs.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE ARE TWO HEALTH ECONOMIES
 * ---------------------------------------------------------------------------------------------
 * `volume` is the growing routes' health, and it is a good answer for them: eating adds to it, a hit takes one
 * hit-point out of it, and the bubble's SIZE moves with it -- so "how much health do I have" is answered by "how
 * big am I", with no HUD element at all.
 *
 * That answer only holds while the size is actually moving. Measured under that economy: at the volume a run
 * starts at the bubble takes 5 hits, at the ceiling it takes 50 -- a tenfold range -- while the drawn radius
 * travels 2.6x. The information was there and could not be read off the bubble.
 *
 * So a route whose bubble is a FIXED size gets a number of its own, and this module is that number's economy.
 *
 * ---------------------------------------------------------------------------------------------
 * AND WHY THE NUMBERS ARE BIG NOW
 * ---------------------------------------------------------------------------------------------
 * This pool started at 5, which made everything else small: a creature's damage could only be 1, 2 or 5, and the
 * 「减伤」 card's 8% had nowhere to land (8% of one point is 0.92). At 100 the scale has room -- damage reads as
 * 20, defence reads as 2 -- and `defense` becomes a whole number a player can count.
 *
 * The formula is SUBTRACTION, with one floor:
 *
 *     damageAfterDefense = max(damage × minDamageRatio, damage − defense)
 *
 * The floor is not "at least 1 point": on a 100-point pool that is barely a floor at all -- a 20-damage fish
 * against 30 defence would cost 1 each, which is invulnerability with extra steps. `minDamageRatio` says DEFENCE
 * MAY EAT AT MOST NINETY PERCENT, so a big blow still lands as a big blow.
 *
 * There is no percentage resistance anywhere. `shrinkResistance` and the 「减伤」 card that granted it are gone:
 * defence and resistance together were two channels answering one question, and a defender who can stack a
 * percentage on top of a subtraction has no readable ceiling at all.
 */

/** The maximum, from how many 「血上限」 picks the run has taken. */
export function healthMaxFor(maxPicks: number): number {
  return mech.health.start + mech.health.maxPerPick * Math.max(0, maxPicks);
}

/**
 * What one blow costs, after the player's defence.
 *
 * `defense` is floored at 0 here rather than at every call site, so a config value with a minus sign in it cannot
 * turn into healing.
 */
export function damageAfterDefense(damage: number, defense: number): number {
  const floor = Math.max(0, damage) * mech.health.minDamageRatio;
  return Math.max(floor, Math.max(0, damage) - Math.max(0, defense));
}

/** Health after one blow. Floors at zero rather than going negative: nothing reads a negative pool. */
export function healthAfterHit(health: number, damage: number, defense: number): number {
  return Math.max(0, health - damageAfterDefense(damage, defense));
}

/** After a 「修复血条」 pick: it heals, and never past the maximum. */
export function healthAfterHeal(health: number, max: number): number {
  return Math.min(max, health + mech.health.healPerPick);
}
