// Volume economy for D2 (volume = health, absorbing = growing).
//
// This is its own module because the numbers form a CLOSED ECONOMY. Deriving them in three
// different files is how you end up with a bubble that cannot die, or one that dies in two hits.
//
// Design intent (spec section 5):
//   - volume IS health, and a hit shrinks you;
//   - absorbing grows you, so growth is a survivability buffer;
//   - bigger means a bigger hitbox, which is the cost.
//
// The model, and why it is shaped this way:
//
//   Health is a FIXED number of hits (5). A hit spends exactly one, implemented as removing a fixed
//   share of BASE volume, so the share is the same whether the bubble is tiny or grown. Volume is
//   the pool of hit-points above zero: absorbing adds hit-points, and the pool's ceiling is capped.
//
//   Two earlier attempts got this wrong in opposite directions, and both were about the same
//   mistake -- letting the SIZE of a hit depend on the size of the bubble:
//
//     - loss proportional to current volume: multiplicative decay, so a big bubble survived 13 hits
//       and a small one 8. Growing made the game easier, inverting the premise.
//     - loss as a fixed absolute amount: survivability was flat but a big bubble's hit cost 3x as
//       much to undo, because the reward stayed fixed while the cost scaled.
//
//   Fixing the hit at one hit-point solves both: hits-to-die is exactly `hitPoints` at any size,
//   and the reward for absorbing scales with the bubble you ate, so the economy stays proportional.

import { tuning } from './config';

/** Hits the bubble can survive at this volume. */
export function hitsSurvived(volume: number): number {
  return (volume / tuning.hitPointVolume) | 0;
}

/** Whether the next hit would pop the bubble. */
export function isPopped(volume: number): boolean {
  return hitsSurvived(volume) <= 0;
}

/** Volume after absorbing a bubble whose own volume is `bubbleVolume`. */
export function growByAbsorbing(volume: number, bubbleVolume: number): number {
  return Math.min(tuning.volumeMax, volume + bubbleVolume * tuning.absorbEfficiency);
}

/**
 * Volume after taking a hit: exactly one hit-point, regardless of current size.
 *
 * Removing a fixed share of BASE volume rather than of current volume is what keeps a hit worth the
 * same at every size. See the header for the two shapes this replaced.
 *
 * `resistance` (0..1) scales the SIZE of the loss, and exists for the silt talent's backlash
 * discount. It is applied HERE rather than by the caller on purpose: the "one hit is worth the same
 * at every size" invariant is the delicate part of this economy, and it should have exactly one
 * implementation. A caller computing `volume - hitPointVolume * (1 - r)` itself would quietly fork
 * that rule.
 *
 * Note a hit still costs one hit-POINT: resistance changes how much volume leaves, not how many hits
 * the bubble has left, so `hitsSurvived` is unaffected.
 */
export function shrinkFromHit(volume: number, resistance = 0): number {
  const factor = 1 - Math.min(1, Math.max(0, resistance));
  return Math.max(0, volume - tuning.hitPointVolume * factor);
}

/**
 * Visual radius as a fraction of the play area width. Kept here next to the growth curve so the
 * drawn size and the mechanical size cannot drift apart.
 */
export function visualRadiusFraction(volume: number): number {
  return tuning.bubbleLaneRatio * (0.82 + 0.18 * volume);
}

/**
 * Volume of a collectable bubble from its drawn radius fraction. Quadratic, so the big visible
 * bubbles are genuinely worth chasing.
 */
export function bubbleVolumeFromRadius(radiusFraction: number): number {
  const base = tuning.bubbleLaneRatio;
  return (radiusFraction / base) ** 2;
}

/** Drawn radius fraction of a collectable, from its volume (inverse of `bubbleVolumeFromRadius`). */
export function radiusFractionFromBubbleVolume(volume: number): number {
  return Math.sqrt(Math.max(0, volume)) * tuning.bubbleLaneRatio;
}

/**
 * How fast a collectable RISES on its own, as a multiple of the player's ascent speed.
 *
 * Real bubbles rise faster the bigger they are: buoyancy grows with volume while drag grows with
 * cross-section, so terminal velocity ends up increasing with radius. Within the size range that
 * matters here the relationship is close to linear in radius, which is also the easiest version to
 * read on screen, so `riseSpeedExponent` defaults to 1.
 *
 * The consequence for the player is the interesting part:
 *
 *     screen speed of a bubble = playerAscent - itsOwnRiseSpeed
 *
 * so a large bubble rises faster than the player and therefore moves UP the screen, a medium one
 * hangs alongside, and a small one falls away down the screen. That is exactly the real-world
 * relationship the game should be showing, and it makes size selection legible: the thing that
 * drifts downward is the thing you can eat.
 */
export function bubbleRiseRatio(bubbleVolume: number, playerVolume: number): number {
  const r = radiusFractionFromBubbleVolume(bubbleVolume);
  const rRef = visualRadiusFraction(playerVolume);
  const sizeRatio = Math.max(1e-4, r / Math.max(1e-4, rRef));
  const shaped = Math.pow(sizeRatio, tuning.riseSpeedExponent);
  return Math.min(tuning.bubbleRiseMax, Math.max(tuning.bubbleRiseMin, shaped));
}

/**
 * Signed screen speed of a collectable, as a multiple of the player's ascent speed.
 *
 * POSITIVE means it travels DOWN the screen relative to the player (the player overtakes it);
 * NEGATIVE means it travels UP (it rises faster than the player and pulls away).
 */
export function bubbleRelativeFallRatio(bubbleVolume: number, playerVolume: number): number {
  return 1 - bubbleRiseRatio(bubbleVolume, playerVolume);
}
