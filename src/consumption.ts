import { mech } from './mechanisms';
import type { HazardKind } from './hazards';

/**
 * Consuming hazards: the food-chain reversal.
 *
 * ---------------------------------------------------------------------------------------------
 * THE ONE IDEA
 * ---------------------------------------------------------------------------------------------
 * **What you had to dodge, you can turn around and eat.**
 *
 * The judgement is DELIBERATELY double-sided, and that is what makes it interesting:
 *
 *   at or above the tier  ->  you touch it and it becomes mass
 *   below the tier        ->  the same touch, and it hurts you
 *
 * So one jellyfish is a threat in the first half of a level and a supply in the second, and the line between
 * them is drawn by the player's own eating. Nothing is scripted to change; the world's meaning changes because
 * the player did.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A TIER LADDER RATHER THAN A CONTINUOUS SIZE COMPARISON
 * ---------------------------------------------------------------------------------------------
 * A continuous rule ("you can eat what is smaller than you") has no answer at the boundary. The player's size
 * is changing every frame, so "can I eat this fish" would flicker, and the only way to know would be to try --
 * which costs a hit. A discrete tier is a yes/no the player can be TOLD, which is what makes the outline marker
 * possible and what turns "can I eat this" from a memory test into a strategy decision.
 *
 * The tier comes from `volume`, which already drives the size stages. There is no second resource: mass IS
 * volume here, so the mechanic lands on the existing growth system instead of duplicating it.
 */

/**
 * The volume tier the player is in, 1-based, as the consumption table counts them.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS ITS OWN LADDER AND NOT THE GROWTH STAGE
 * ---------------------------------------------------------------------------------------------
 * The growth stages advance by ABSORPTION COUNT (`absorbToStage2` collectables), while volume accumulates per
 * collectable's own size. Those are different quantities, so volume cannot be converted into a stage -- the first
 * version of this file tried, using the absorption counts as volume thresholds, and the result was that a player
 * who had legitimately reached stage 2 had a volume of 2.3 against a computed threshold of 13 and could NEVER
 * eat the fish that stage 2 was supposed to unlock.
 *
 * So consumption has its own ladder, in VOLUME units, authored in the config. The two progress at similar rates
 * by design, which is what makes the unlock feel like it arrives with the growth, without one being derived from
 * the other.
 */
export function volumeTier(volume: number): number {
  const ladder = mech.consumption.tierVolume;
  let tier = 1;
  for (let i = 1; i < ladder.length; i++) {
    /**
     * A small epsilon, because these are binary floating point numbers compared against thresholds a human wrote.
     *
     * `2.2` is not representable exactly, so a player whose volume computes to 2.1999999999999997 against a
     * threshold of 2.2 would be judged one tier short -- and being one tier short means a fish HURTS instead of
     * feeding. The cost of the epsilon is that a volume a hair below a threshold counts as reaching it, which is
     * unobservable; the cost of not having it is a rule that appears to work and then randomly kills you.
     */
    if (volume + 1e-9 >= ladder[i]!) tier = i + 1;
  }
  return tier;
}

/** How much mass (in volume) a hazard of this kind is worth. */
export function hazardMass(kind: HazardKind): number {
  return mech.consumption.mass[kind] ?? 0;
}

/** The volume tier at which this hazard kind becomes edible. */
export function edibleAtTier(kind: HazardKind): number {
  return mech.consumption.edibleAtTier[kind] ?? Number.POSITIVE_INFINITY;
}

/**
 * Whether the player can eat this kind of hazard right now.
 *
 * The single place the rule lives, so the collision resolution and the outline marker cannot disagree about it.
 * A marker that said "edible" while the collision said "damage" would be the worst possible bug in this feature,
 * because the player would be punished for trusting the game.
 */
export function canEatHazard(kind: HazardKind, volume: number): boolean {
  return volumeTier(volume) >= edibleAtTier(kind);
}

/** The mass gained by eating a hazard of this kind, after the digestion loss. */
export function massFromEating(kind: HazardKind): number {
  return hazardMass(kind) * mech.consumption.massEfficiency;
}
