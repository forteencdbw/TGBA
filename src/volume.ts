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
//
// Run `node scripts/solve-volume.mjs` to see the resulting curve and to re-check it after a change.

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
 */
export function shrinkFromHit(volume: number): number {
  return Math.max(0, volume - tuning.hitPointVolume);
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
