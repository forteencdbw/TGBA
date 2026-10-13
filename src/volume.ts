// Volume: the bubble's SIZE, and what that size decides.
//
// ---------------------------------------------------------------------------------------------
// WHAT VOLUME IS NOW
// ---------------------------------------------------------------------------------------------
// It used to be health as well: a hit shrank it, absorbing grew it, and "how much health do I have" was answered by
// "how big am I". That split is gone -- health is its own pool for every route (`src/health.ts`) -- and what is left
// here is the other half of the old equation. Size:
//
//   - the DRAWN radius, which is also the hitbox (one function, so a bubble is exactly as big as it looks);
//   - the MOUTH, which is what decides what it can eat.
//
// Those two cannot be separated, and that is the tension the numbers still encode: bigger means a bigger hitbox,
// which is the cost of being able to eat more. It is why growth used to double as a health stat and why it is now
// purely a trade.
//
// What is NOT here any more: `hitCost`, `hitsSurvived` and `shrinkFromHit`. All three existed to convert between
// volume and hit points, and nothing converts between them now.

import { mech } from './mechanisms';
import { tuning } from './config';

/**
 * The volume a growing route's bubble should be, for a given health fraction.
 *
 * Four BANDS rather than a continuous mapping, and the band is chosen at two moments only -- the start of a level,
 * and the pick that makes the bubble a growing one -- rather than whenever health moves. The reason is the same in
 * both cases: a hitbox that changed size mid-fight would invalidate the "how close can I get" judgement the player
 * made a moment ago, and that judgement is the whole skill. See the config for why the bottom band is 2, not 5.
 *
 * A ratio below every band's floor gets the first band, which is why the loop starts there rather than at zero: the
 * table is the source of truth for what "nearly dead" means, and a hardcoded fallback could drift from it.
 */
export function volumeForHealthRatio(ratio: number): number {
  const bands = mech.volume.healthBands;
  let volume = bands[0]?.volume ?? mech.volume.max;
  for (const band of bands) {
    if (ratio >= band.minRatio) volume = band.volume;
  }
  return volume;
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
