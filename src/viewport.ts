import { VIEW } from './config';
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
 * Fit the world play area to a canvas, capping how WIDE the lane may be.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PLAY AREA IS NARROWER THAN THE CANVAS
 * ---------------------------------------------------------------------------------------------
 * Scaling by width so the lane fills the canvas is what this used to do, and it breaks on anything wider
 * than a phone. On a 2560x1440 desktop window it computed 7.09 px per metre, which put the bubble at a
 * 109px radius, made the HUD (which scales with the viewport) render its headline at 283px until the
 * readouts collided, and pushed the skill button to x=2485 -- past the right edge of the screen.
 *
 * So the lane is capped at a portrait-shaped width and centred, and the water either side is drawn by the
 * background layer, filling the canvas. A wide window gets empty ocean at the sides rather than a
 * distorted game.
 *
 * @param maxLaneWidthPx the widest the play area may be, in pixels.
 *
 *   900 is chosen for how big the BUBBLE ends up. Player radius derives from the lane's width in metres
 *   times the scale, so on a phone the bubble is ~2.1% of the canvas height and at a 700px cap on a
 *   1440-tall desktop it was 29.8px -- a 5x difference between the two screens the game runs on. 900
 *   brings the desktop bubble to 38px, which is much closer to what a phone shows.
 */
export function computeViewport(screenWidth: number, screenHeight: number, maxLaneWidthPx = 900): Viewport {
  /**
   * The lane is as wide as the canvas when that is already narrow enough -- which is every phone, the
   * shipping target -- and is capped otherwise.
   *
   * The cap is on the LANE rather than on `scale`, because the two must not disagree: the scale is derived
   * from the lane, so capping the scale alone would leave the lane wider than the canvas and clip the play
   * area. An earlier version capped the width by taking the MAXIMUM of two scales, which is backwards --
   * the maximum always let the "fill the width" scale win, so the cap did nothing at all.
   */
  const laneWidthPx = Math.min(screenWidth, maxLaneWidthPx);
  const scale = laneWidthPx / WORLD_WIDTH;

  return {
    scale,
    // Centred: the water either side is drawn by the background layer, which fills the whole canvas, so
    // this reads as open ocean rather than as bars.
    left: (screenWidth - laneWidthPx) / 2,
    cy: screenHeight / 2,
    width: screenWidth,
    height: screenHeight,
    laneWidthPx,
    laneWidthMeters: WORLD_WIDTH,
    visibleDepthMeters: screenHeight / scale,
  };
}

/**
 * Scale for the fixed HUD, INDEPENDENT of the world zoom.
 *
 * The readouts are screen furniture, not world content: deriving their size from `viewport.scale` meant a
 * 2560px-wide desktop window rendered the headline at 283px, because world scale is 7x a phone's. It is
 * tied to the canvas size instead, against the same design box the HUD's proportions were authored for.
 *
 * Capped at 1.5 so text does not grow without bound on a large monitor, and floored at 0.55 so it stays
 * legible on a small window.
 */
export function designScale(screenWidth: number, screenHeight: number): number {
  const s = Math.min(screenWidth / VIEW.width, screenHeight / VIEW.height);
  return Math.min(1.5, Math.max(0.55, s));
}

/** Sanity check used by the layout probe: how much of the canvas the play area covers. */
export function laneCoverage(viewport: Viewport): { horizontal: number; vertical: number } {
  return {
    horizontal: viewport.laneWidthPx / viewport.width,
    vertical: Math.min(1, (WORLD_HEIGHT * viewport.scale) / viewport.height),
  };
}
