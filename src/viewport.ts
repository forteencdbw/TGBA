import { WORLD_HEIGHT, WORLD_WIDTH } from './levels';

/**
 * Maps the world play area onto the canvas.
 *
 * All state here is SCREEN PIXELS except `scale` and `laneWidthMeters`, which describe the world.
 * Everything drawn in world metres goes through `Camera.applyTo`, so this is the only place that
 * knows about the canvas size.
 */
export interface Viewport {
  /** Uniform world->pixel scale. One factor for both axes, so the world stays isotropic. */
  scale: number;
  /** Screen x of world x = 0 (the left wall of the play area). Always 0: the lane fills the width. */
  left: number;
  /** Screen y of the camera centre. */
  cy: number;
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Width of the play area on screen, in pixels. Equal to `width` by construction. */
  laneWidthPx: number;
  /** Width of the play area in world metres. */
  laneWidthMeters: number;
  /** How many metres of depth fit on screen. */
  visibleDepthMeters: number;
}

/**
 * Fit the world play area to a canvas, filling it horizontally.
 *
 * The world's own aspect (`WORLD_WIDTH / WORLD_HEIGHT`) is wider than a phone screen, so scaling
 * to fill the width means the visible depth is the canvas height divided by that scale. The
 * resulting view is a consistent, isotropic zoom: circles stay circles and lateral handling is
 * unchanged because speed and position are expressed lane-relative.
 *
 * On a taller-than-world canvas this fills exactly; on a wider one it also fills, showing more
 * depth. Either way there are no letterbox bars, which is the point.
 */
export function computeViewport(screenWidth: number, screenHeight: number): Viewport {
  const scale = screenWidth / WORLD_WIDTH;

  return {
    scale,
    left: 0,
    cy: screenHeight / 2,
    width: screenWidth,
    height: screenHeight,
    laneWidthPx: screenWidth,
    laneWidthMeters: WORLD_WIDTH,
    visibleDepthMeters: screenHeight / scale,
  };
}

/** Sanity check used by the layout probe: how much of the canvas the play area covers. */
export function laneCoverage(viewport: Viewport): { horizontal: number; vertical: number } {
  return {
    horizontal: viewport.laneWidthPx / viewport.width,
    vertical: Math.min(1, (WORLD_HEIGHT * viewport.scale) / viewport.height),
  };
}
