import { LEVEL, WORLD_HEIGHT } from './levels.ts';

/**
 * Where the camera should be, given how far the level has scrolled.
 *
 * The camera travels up a fixed stretch of water at a constant rate. That is what makes the whole world
 * appear to descend, and what carries new content in from the top of the screen.
 *
 * There is no ascent-speed curve any more. That existed to shape a forced climb -- "slow at the seabed,
 * frantic at the surface" -- and with the player moving freely and the level authoring its own content,
 * pacing comes from the timeline and the scroll speed instead. A curve that accelerates the player
 * would now just be a speed the player did not ask for.
 */
export function cameraYAtScroll(scrollMetres: number): number {
  return scrollMetres;
}

/**
 * How far the level has scrolled at a given moment, in metres.
 *
 * The single source of pacing: `speed * time`, clamped to the level's length.
 */
export function scrollAtTime(seconds: number): number {
  return Math.min(LEVEL.scrollLength, Math.max(0, seconds) * LEVEL.scrollSpeed);
}

/**
 * How long a full scroll takes, in seconds.
 *
 * An OUTPUT of the level's length and speed, never an input. Nothing back-solves a duration: the
 * earlier project made that mistake once, with a run length as the target, and the ascent curve had to
 * be distorted to hit it.
 */
export function nominalAscentSeconds(): number {
  return LEVEL.scrollLength / LEVEL.scrollSpeed;
}

/**
 * A collectable's rise speed in m/s, from its share of the scroll speed.
 *
 * Kept here because "how fast does this thing move through the water" is a property of the level's
 * motion, and the bubble's own rise is expressed as a fraction of it.
 */
export function bubbleRiseSpeed(ratioOfScroll: number): number {
  return ratioOfScroll * LEVEL.scrollSpeed;
}

/**
 * Screen-heights of scroll in the level.
 *
 * The number that actually describes pacing: how many screenfuls of water pass. Two levels with the
 * same value feel the same regardless of their length in metres, so this is what to match when
 * authoring a new one.
 */
export function levelScreenHeights(): number {
  return LEVEL.scrollLength / WORLD_HEIGHT;
}

/**
 * Seconds to traverse each screenful, in order from the start of the level.
 *
 * Reported as a series rather than an average, because a mean of a curve describes no part of it. With
 * a CONSTANT scroll speed every screenful takes the same time, so this is a series for consistency with
 * the tooling -- and it will stop being flat the moment a level varies its speed, which is a natural
 * thing to want later.
 */
export function secondsPerScreenSeries(maxScreens = 12): number[] {
  const perScreen = WORLD_HEIGHT / LEVEL.scrollSpeed;
  const count = Math.min(maxScreens, Math.max(1, Math.round(LEVEL.scrollLength / WORLD_HEIGHT)));
  return Array.from({ length: count }, () => perScreen);
}
