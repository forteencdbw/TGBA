import { Application, Container, FillGradient, Graphics, Text } from 'pixi.js';
import { LATERAL_DAMPING, VIEW } from './config';
import { mech } from './mechanisms';
import { Backdrop, Parallax } from './parallax';
import { DEPTH_TOTAL, LEVEL } from './levels';
import type { LateralAuthority } from './lateral';
import type { Player } from './player';
import { computeViewport, designScale, type Viewport } from './viewport';

export { computeViewport, designScale, type Viewport };

export class Camera {
  /** World y (metres above seabed) at the centre of the screen. */
  y = 0;
  /** Placeholder until `Game.layout()` installs the real one, derived from the actual canvas. */
  viewport: Viewport = computeViewport(VIEW.width, VIEW.height);

  /**
   * Centre the view on the player, biased so the bubble sits low on screen.
   *
   * The camera is placed `PLAYER_SCREEN_Y_RATIO - 0.5` visible-spans ABOVE the bubble, which puts
   * the bubble that far below the middle. The sign matters: an earlier build subtracted instead of
   * adding, which mirrored the bias and parked the bubble at 38% down instead of 62%.
   */
  /**
   * Put the camera at a scroll position.
   *
   * The camera does NOT follow the player. That was the earlier model, and it coupled the two things
   * this design needs kept apart: following meant holding "up" advanced the level. The camera's height
   * is the level's own progress, and the player moves independently within the window it presents.
   */
  setScroll(scrolledMetres: number): void {
    this.y = scrolledMetres;
  }

  /** World (metres) -> screen (pixels). */
  toScreenX(worldX: number): number {
    return this.viewport.left + worldX * this.viewport.scale;
  }

  toScreenY(worldY: number): number {
    return this.viewport.cy - (worldY - this.y) * this.viewport.scale;
  }

  /**
   * Screen (pixels) -> world (metres), the inverse of `toScreenY`.
   *
   * Needed by the touch controls, which receive finger positions in canvas pixels and have to turn them
   * into a place in the water for the bubble to head for.
   */
  toWorldY(screenY: number): number {
    return this.y + (this.viewport.cy - screenY) / this.viewport.scale;
  }

  /** Lowest / highest world y currently on screen, with a margin in metres. */
  visibleWorldRange(margin = 12): { min: number; max: number } {
    const halfSpan = this.viewport.height / 2 / this.viewport.scale;
    return { min: this.y - halfSpan - margin, max: this.y + halfSpan + margin };
  }

  /**
   * Applied every frame to the container holding all world-space content.
   *
   * This is the single place that converts world metres to screen pixels. Drawing world-space
   * content with raw pixel coordinates is what produced a lane of marine snow outside the play
   * area, a depth ruler offset by the letterbox margin, and a bubble pinned to the left wall.
   */
  applyTo(container: Container): void {
    const s = this.viewport.scale;
    // World y grows upward, screen y grows downward, hence the negative scaleY. Pixi accepts
    // negative scale factors directly, which keeps this to one call with no skew matrix.
    container.updateTransform({
      x: this.toScreenX(0),
      y: this.toScreenY(0),
      scaleX: s,
      scaleY: -s,
    });
  }
}

/**
 * A HUD label, in the game's UI font.
 *
 * The family comes from `mech.text.fontFamily` rather than being written here, and that is not cosmetic: see the
 * config's note on Pixi measuring the line box from the FIRST family while Chinese glyphs come from a fallback.
 * Pass `mech.text.monoFontFamily` for ASCII-only text whose column alignment needs a monospace face.
 */
export function makeLabel(
  text: string,
  colour: number,
  size: number,
  weight: 'normal' | 'bold' = 'bold',
  family: string = mech.text.fontFamily,
): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: family,
      fontSize: size,
      fill: colour,
      fontWeight: weight,
      letterSpacing: 0.5,
    },
  });
  label.resolution = 2;
  return label;
}

/**
 * How far from the play area's left edge the marine snow starts, as a FRACTION of the lane width.
 *
 * A fraction rather than metres: the play area is sized to the display, so a metre constant would put the
 * band in a different place on every screen.
 *
 * This used to sit beside a set of tick-length constants for a depth ruler on the left edge. The ruler is
 * gone -- see `WorldLayer` -- and only the snow's left margin needed this.
 */
const RULER_X_RATIO = 0.008;

/**
 * Everything that lives in the water column and moves with the camera: the colour gradient, the
 * parallax marine snow, and the depth ruler. Children use world metres.
 */
export class WorldLayer {
  readonly root = new Container();
  readonly world = new Container();

  /** Background gradient is drawn in SCREEN pixels, behind everything. */
  private readonly gradient = new Graphics();
  /**
   * The darkened water outside the play area, drawn over the gradient.
   *
   * Screen pixels, and separate from the gradient because it is redrawn every frame rather than cached: its
   * geometry depends on the lane's position and width, and caching it alongside the gradient's colours
   * would tie two unrelated invalidation conditions together.
   */
  private readonly margins = new Graphics();
  /** Marine snow: world space. */
  private readonly snow = new Graphics();
  /** The four-layer parallax field. See `src/parallax.ts`. */
  readonly parallax = new Parallax();
  /**
   * The level's backdrop image, if it has one.
   *
   * Rebuilt when the LEVEL changes rather than when the canvas does: it belongs to the place, not to the window.
   */
  private backdrop: Backdrop | null = null;
  private backdropImage = '';
  /** Whether the current level's backdrop image has finished loading. */
  get backdropLoaded(): boolean {
    return this.backdrop?.isLoaded ?? false;
  }

  /** Why the level's backdrop failed to load, if it did. */
  get backdropError(): string {
    return this.backdrop?.error ?? '';
  }
  /** The canvas the backdrop was last sized against, so a level change mid-run still sizes it. */
  private lastCanvasWidth = 0;
  private lastCanvasHeight = 0;
  private lastLaneWidthMeters = 0;

  private readonly maskShape = new Graphics();
  private snowPoints: { x: number; y: number; r: number; driftX: number; driftY: number }[] = [];

  /** Cached colours so the gradient object is only rebuilt when a colour actually changes. */
  private lastTopColour = -1;
  private lastBottomColour = -1;
  /** Cached canvas size, so a resize also forces a rebuild. See `update`. */
  private lastGradientWidth = -1;
  private lastGradientHeight = -1;
  private lastWaterAlpha = -1;

  constructor() {
    this.snow.eventMode = 'none';
    this.gradient.eventMode = 'none';
    this.margins.eventMode = 'none';

    this.world.addChild(this.snow);
    /**
     * The parallax field, UNDER the marine snow.
     *
     * Two fields rather than one because they are different jobs: the snow is the near, coarse, obvious stuff the player
     * reads as "I am moving", and the parallax layers are the depth behind it. Drawn first so the snow stays legible on
     * top of them.
     */
    this.world.addChild(this.parallax.root);
    this.world.mask = this.maskShape;

    // Margin shading goes AFTER the gradient but BEFORE the world, so the water's colour is dimmed while
    // the marine snow stays inside the lane it belongs to.
    this.root.addChild(this.gradient, this.margins, this.world);
  }

  private seedSnow(laneWidth: number): void {
    const railX = laneWidth * RULER_X_RATIO;
    this.snowPoints = [];
    for (let i = 0; i < 90; i++) {
      this.snowPoints.push({
        x: railX + Math.random() * (laneWidth - railX),
        y: Math.random() * DEPTH_TOTAL,
        r: laneWidth * (0.0006 + Math.random() * 0.0019),
        driftX: (Math.random() - 0.5) * laneWidth * 0.0007,
        driftY: -(0.05 + Math.random() * 0.15) * (laneWidth / 120),
      });
    }
  }

  layout(viewport: Viewport): void {
    // The mote FIELD is scattered here rather than per frame: its count and its sizes depend on the lane IN METRES, so a
    // new canvas is a new field -- and re-scattering every frame would make the whole thing jump, which is the one thing
    // a depth cue must never do.
    this.parallax.layout(viewport.laneWidthMeters, viewport.visibleDepthMeters);
    this.lastCanvasWidth = viewport.width;
    this.lastCanvasHeight = viewport.height;
    this.lastLaneWidthMeters = viewport.laneWidthMeters;
    this.backdrop?.layout(viewport.width, viewport.height, viewport.laneWidthMeters);
    // Rebuild the gradient on the next update: its geometry depends on the viewport.
    this.lastTopColour = -1;
    this.lastBottomColour = -1;
    this.lastGradientWidth = -1;
    this.lastGradientHeight = -1;

    const columnLeft = viewport.left;
    const columnWidth = viewport.laneWidthPx;

    // Invisible mask keeping the marine snow inside the play area. Drawn in screen pixels, so a
    // screen-space fill is correct here despite the rest of the class using world metres.
    //
    // Not belt-and-braces any more: the lane is capped and CENTRED on a wide window, so snow drawn outside
    // it would be visible in the surrounding water rather than clipped at the canvas edge.
    this.maskShape.clear();
    this.maskShape.rect(columnLeft, -1000, columnWidth, viewport.height + 2000).fill(0xffffff);

    // World-space prop sizes are relative to the play area width, so they need rebuilding here.
    this.seedSnow(viewport.laneWidthMeters);
  }

  /**
   * `WorldLayer.update`: the scenery. Draws no readouts, so it does not need the player.
   *
   * @param scrolled how far the LEVEL has travelled, in metres. Used by the marine-snow recycle, which
   *   keeps the drifting specks distributed across the visible band.
   */
  /**
   * Make sure the right backdrop image is the one on screen, and draw it.
   *
   * The water gradient is drawn UNDER it, so the image is tinted and dimmed by the level's own palette rather than
   * pasted on top of it -- which is what makes a hand-authored picture sit inside the level's colour instead of beside
   * it.
   */
  private drawBackdrop(scrolled: number, pixelsPerMetre: number): void {
    const spec = LEVEL.backdrop;
    if (!spec) {
      if (this.backdrop) {
        this.backdrop.root.destroy({ children: true });
        this.backdrop = null;
        this.backdropImage = '';
      }
      return;
    }
    if (!this.backdrop || this.backdropImage !== spec.image) {
      if (this.backdrop) this.backdrop.root.destroy({ children: true });
      this.backdrop = new Backdrop(spec);
      this.backdropImage = spec.image;
      /**
       * Placed just UNDER the parallax field, not at the very back.
       *
       * The water gradient is an opaque fill that covers the whole canvas, so a backdrop behind it is a backdrop nobody
       * sees. The layering that works is: gradient (the water), then the image (what is far away IN it), then the
       * parallax motes (the water between the camera and that distance).
       */
      /**
       * BEHIND the water, which is where the owner wants it: the picture is the far distance, and the water is in front
       * of it. oot's first child is behind gradient, margins and world -- and the backdrop has to be SCREEN space
       * for that, because the gradient is a screen-space fill.
       */
      this.root.addChildAt(this.backdrop.root, 0);
      this.backdrop.layout(this.lastCanvasWidth, this.lastCanvasHeight, this.lastLaneWidthMeters);
    }
    /**
     * The camera's pixels-per-metre, which is what turns the backdrop's screen size into world metres. The world layer is
     * drawn in world coordinates, so every size here has to be converted -- sizing the image in canvas pixels was what
     * made it a patch over part of the frame rather than a backdrop.
     */
    this.backdrop.draw(scrolled, pixelsPerMetre);
  }

  update(camera: Camera, _player: Player, dt: number, scrolled: number): void {
    const viewport = camera.viewport;
    const { min, max } = camera.visibleWorldRange(20);
    void scrolled;

    // --- World transform --------------------------------------------------
    camera.applyTo(this.world);

    // --- Depth gradient (screen space) ------------------------------------
    // Sample in world metres across the visible vertical span, so the colour is a pure function
    // of depth rather than of the device pixel ratio.
    //
    // `depth` here is the LEVEL's depth, not the bubble's. It used to be the bubble's, which was right
    // when the two were the same thing and wrong the moment the player could move: steering toward the
    // top of the screen raised the bubble's world position, which brightened the whole sea as though the
    // surface were near, and at the top of the level drove the value negative.
    const halfSpan = viewport.height / 2 / viewport.scale;
    const levelDepth = DEPTH_TOTAL - scrolled;
    const topColour = waterColour(camera.y + halfSpan, levelDepth);
    const bottomColour = waterColour(camera.y - halfSpan, levelDepth);

    /**
     * Rebuild the gradient when the COLOUR changes **or the canvas changes size**.
     *
     * The colour cache alone was not enough, and the symptom was subtle: the rectangle is built from
     * `viewport.width`, so a canvas resize left the geometry stale and the water was drawn at the OLD width,
     * showing as flat bands either side of the play area with a soft vertical seam. Easy to misread as a
     * letterboxing decision rather than as a caching bug.
     */
    const sizeChanged = viewport.width !== this.lastGradientWidth || viewport.height !== this.lastGradientHeight;
    if (topColour !== this.lastTopColour || bottomColour !== this.lastBottomColour || sizeChanged || LEVEL.palette.waterAlpha !== this.lastWaterAlpha) {
      this.lastWaterAlpha = LEVEL.palette.waterAlpha;
      this.lastTopColour = topColour;
      this.lastBottomColour = bottomColour;
      this.lastGradientWidth = viewport.width;
      this.lastGradientHeight = viewport.height;

      const gradient = new FillGradient({
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        colorStops: [
          { offset: 0, color: toCss(topColour) },
          { offset: 1, color: toCss(bottomColour) },
        ],
        textureSpace: 'local',
      });

      this.gradient.clear();
      // Full canvas width: the water fills the whole screen, and the lane is marked on top.
      /**
       * The water's own opacity, from the level's palette.
       *
       * A fully opaque gradient IS the picture: nothing behind it can show, and a level with a hand-authored backdrop
       * (level 1 has one) ends up with the picture hidden behind its own water. `waterAlpha` lets the water be a WASH
       * over what is behind it instead -- which is also more honest, because the backdrop is drawn INSIDE the water
       * rather than behind it. 1.0 is the old behaviour, and every level except the one with a picture still uses it.
       */
      this.gradient
        .rect(0, 0, viewport.width, viewport.height)
        .fill({ fill: gradient, alpha: LEVEL.palette.waterAlpha });
    }

    /**
     * Dim the water OUTSIDE the play area, so the lane reads as a channel rather than the whole window
     * being the game.
     *
     * A vertical gradient band either side, NOT a shape with a feathered point: the first attempt tapered
     * the band to a point at mid-height, which drew a visible trapezoid outline -- it read as a decal stuck
     * on top of the water rather than as the water being darker further from the lane.
     *
     * Screen space, rebuilt every frame because it depends on the lane's position.
     */
    this.margins.clear();
    const marginWidth = viewport.left;
    if (marginWidth > 1) {
      const rightEdge = viewport.left + viewport.laneWidthPx;
      // Left band: opaque at the canvas edge, fading to clear where the lane begins.
      paintMargin(this.margins, 0, marginWidth, viewport.height, false);
      // Right band, mirrored so both fade INWARD.
      paintMargin(this.margins, rightEdge, viewport.width - rightEdge, viewport.height, true);
    }

    // --- The level's backdrop, behind everything ---------------------------
    this.drawBackdrop(scrolled, camera.viewport.scale);

    // --- Parallax (four layers, far to near) ------------------------------
    this.parallax.draw(scrolled, min, max);

    // --- Marine snow (world space) ----------------------------------------
    // Graphics keeps its path until `clear()`, so this is mandatory: without it the circles
    // accumulate frame after frame and the snow smears outward into stray strokes.
    this.snow.clear();
    for (const p of this.snowPoints) {
      p.x += p.driftX * dt;
      p.y += p.driftY * dt;
      if (p.y < min) {
        p.y = max;
        p.x = viewport.laneWidthMeters * RULER_X_RATIO + Math.random() * (viewport.laneWidthMeters * (1 - RULER_X_RATIO));
      }
      this.snow.circle(p.x, p.y, p.r);
    }
    // One fill call for the whole field rather than one per particle.
    this.snow.fill({ color: 0xdff6ff, alpha: 0.26 });
  }
}

function toCss(colour: number): string {
  return `#${colour.toString(16).padStart(6, '0')}`;
}

/**
 * The water colour function, exposed for probes.
 *
 * Exported so a test can assert on the REAL implementation rather than a copy of its arithmetic. An
 * earlier probe re-derived the channels itself and therefore kept reporting the overflow after the
 * function had been fixed -- the classic shape of a test that measures its own model of the code.
 */
export function waterColourForTest(worldY: number, depth: number): number {
  return waterColour(worldY, depth);
}

/**
 * Paint one margin band: darkened water that fades to clear toward the play area.
 *
 * @param mirrored when true the fade runs right-to-left, for the band on the far side of the lane.
 *
 * The gradient's colour stops carry the alpha, which is the only way Pixi expresses a fade in a fill -- two
 * opaque stops would simply be a rectangle.
 */
function paintMargin(g: Graphics, x: number, width: number, height: number, mirrored: boolean): void {
  if (width <= 0.5) return;
  const dark = 'rgba(1,6,15,0.85)';
  const clear = 'rgba(1,6,15,0)';
  const gradient = new FillGradient({
    start: { x: mirrored ? 1 : 0, y: 0 },
    end: { x: mirrored ? 0 : 1, y: 0 },
    colorStops: [
      { offset: 0, color: dark },
      { offset: 1, color: clear },
    ],
    textureSpace: 'local',
  });
  g.rect(x, 0, width, height).fill({ fill: gradient, alpha: 1 });
}

/**
 * Water colour as a function of world height, brightening with height so the whole climb reads as
 * progress rather than only the last stretch.
 *
 * The exponent is deliberately gentle: measured on screen, a steeper curve left the first 400m
 * a flat near-black and put all the visible change in the final 90m. `depth` drives an extra
 * bloom near the surface, which is the "almost there" cue.
 *
 * ---------------------------------------------------------------------------------------------
 * EVERY CHANNEL IS CLAMPED, AND THAT IS NOT DEFENSIVE PADDING
 * ---------------------------------------------------------------------------------------------
 * The channels are packed with bit shifts, and `Math.round(r) << 16` SILENTLY WRAPS when `r` exceeds
 * 255. A caller passing a slightly out-of-range value therefore does not get a wrong shade of blue, it
 * gets an illegal colour: measured with `depth = -400`, the channels came out (406, 384, 342) and packed
 * to `#1978156` -- a seven-digit value that is not a colour at all. The screen goes red and the renderer
 * is handed garbage.
 *
 * The bloom is what pushes a channel past its limit, and `depth` reaching the bubble is what pushed the
 * bloom. Clamping here means no future caller can reproduce that, whatever it passes.
 */
function waterColour(worldY: number, depth: number): number {
  /**
   * The level's own water, not one global ramp.
   *
   * Every level names four colours (see `LevelPalette`): the seabed, the top of its climb, the light coming down from
   * the surface, and a mood tint over both. The span is the LEVEL's length rather than a constant, which it was before
   * -- a level shorter than the first one never reached its own shallow colour, so the deepest levels looked like the
   * first one seen through a slightly different filter.
   */
  const palette = LEVEL.palette;
  const deep = { r: (palette.deep >> 16) & 0xff, g: (palette.deep >> 8) & 0xff, b: palette.deep & 0xff };
  const shallow = { r: (palette.shallow >> 16) & 0xff, g: (palette.shallow >> 8) & 0xff, b: palette.shallow & 0xff };

  const t = Math.min(Math.max(worldY / Math.max(1, LEVEL.scrollLength), 0), 1);
  const eased = Math.pow(t, 1.15);

  let r = deep.r + (shallow.r - deep.r) * eased;
  let g = deep.g + (shallow.g - deep.g) * eased;
  let b = deep.b + (shallow.b - deep.b) * eased;

  // Surface bloom over the last 55m, on top of the gradient. Kept narrow and subtle: a wider,
  // stronger bloom washed out most of the screen whenever the camera was anywhere near the top.
  const bloom = Math.max(0, Math.min(1, 1 - depth / 55));
  const br = (palette.bloom >> 16) & 0xff;
  const bg = (palette.bloom >> 8) & 0xff;
  const bb = palette.bloom & 0xff;
  r += (br - r) * bloom * 0.3;
  g += (bg - g) * bloom * 0.3;
  b += (bb - b) * bloom * 0.3;

  /**
   * The mood tint, over everything.
   *
   * A separate channel from the gradient on purpose: the gradient says how DEEP this is and the tint says what KIND of
   * water it is -- black and red for a smoker field, violet for the jellyfish forest, warm gold for the dawn surface.
   * Mixing it here rather than folding it into the two end colours also means a level can change its mood without
   * re-doing its depth ramp.
   */
  if (palette.tintStrength > 0) {
    const tr = (palette.tint >> 16) & 0xff;
    const tg = (palette.tint >> 8) & 0xff;
    const tb = palette.tint & 0xff;
    r += (tr - r) * palette.tintStrength;
    g += (tg - g) * palette.tintStrength;
    b += (tb - b) * palette.tintStrength;
  }

  const channel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));
  return (channel(r) << 16) | (channel(g) << 8) | channel(b);
}

export interface Landmark {
  depth: number;
  label: string;
}

/**
 * Fixed HUD, in screen pixels: the "metres to surface" headline, the depth gauge on the right
 * edge, the prototype landmark markers, and a live tuning readout.
 */
import { buildLabel } from './version';

export class Hud {
  readonly root = new Container();

  private readonly subline: Text;
  /** The second resource's readout, for a bubble type that has one. Hidden otherwise. */
  private readonly resourceLabel: Text;
  /** The resource's gauge. Own layer, so hiding it cannot erase anything else. */
  private readonly resourceGauge = new Graphics();
  private readonly debug: Text;
  /**
   * The score, in the top-left corner.
   *
   * Its own label rather than a line in the subline block, because the subline block is CENTRED and belongs to the
   * depth readout: the score is a running number that changes constantly, and putting it in the middle of the screen
   * would put the one thing that moves next to the one thing the player is steering by.
   */
  private readonly scoreLabel: Text;
  /**
   * The boss fight's readout: a name and a bar across the top.
   *
   * Own layer and own label, hidden as a pair. It appears when a boss does and disappears when the fight ends, so it
   * is the one piece of HUD furniture whose ABSENCE is information -- before the boss arrives, and after it dies, the
   * top of the screen is not a boss bar at zero.
   */
  private readonly bossName: Text;
  private readonly bossBar = new Graphics();
  /** The run's progress chart: a pip per level, plus the gauge layer that draws them. */
  private readonly progressGauge = new Graphics();
  private readonly progressLabel: Text;
  private progressChart: { total: number; cleared: number; current: number } | null = null;
  /** What the bar currently shows, so a per-frame call does not redraw a bar that has not moved. */
  private shownBossFraction = -1;
  /** What the label currently shows, so a per-frame update does not rebuild a string that has not changed. */
  private shownScore = -1;
  /**
   * The HUD's own scale, set by `layout`.
   *
   * Separate from the world zoom on purpose: this is screen furniture, sized against the canvas. See
   * `designScale`.
   */
  private hudScale = 1;
  /** The canvas width in CSS pixels, remembered for the boss bar (which is centred on the screen). */
  private canvasWidth = 0;
  /** The lane's width and centre in canvas pixels, remembered from layout for the resource gauge. */
  private laneWidthPx = 0;
  private laneCentreX = 0;
  private debugTimer = 0;
  /** Metres to the surface as the last `update` computed it: used by the debug line, not by any gauge. */
  private levelDepthMeters = 0;
  /** Which of the three birth types this run rolled. Set by the game after construction. */
  private seedLabel = '';
  /** This run's talent, and the carried skill with its uses. Empty strings mean "show nothing". */
  private talentLabel = '';
  private skillLabel = '';

  constructor() {

    this.subline = makeLabel('', 0x7fc4e8, 11);
    this.subline.anchor.set(0.5, 0);

    /**
     * The second resource's line, hidden until a type has one.
     *
     * Its own object rather than a slot in the subline because it carries its own colour, and because hiding it must
     * leave no gap: a type with no resource shows exactly the HUD it always did.
     */
    this.resourceLabel = makeLabel('', 0x7fc4e8, 11);
    this.resourceLabel.anchor.set(0.5, 0);
    this.resourceLabel.visible = false;

    /**
     * The debug readout, the one label that stays monospace.
     *
     * Its lines align their values into columns with spaces, which only reads as columns in a monospace face -- and
     * it is pure ASCII, so it never touches the CJK fallback that forced the rest of the UI onto a different stack.
     * See `config/mechanics.json5`.
     */
    this.debug = makeLabel('', 0x7fc4e8, 11, 'normal', mech.text.monoFontFamily);
    this.debug.alpha = 0.8;

    /**
     * The score.
     *
     * Gold, like the landmarks and the spit button, and the only other gold number on the screen -- the top block is
     * the cyan family ("where am I"), so the score reads as a different KIND of number at a glance.
     */
    this.scoreLabel = makeLabel('', mech.hud.score.colour, mech.hud.score.size);
    this.bossName = makeLabel('', mech.hud.bossBar.nameColour, mech.hud.bossBar.nameSize);
    this.progressLabel = makeLabel('', mech.hud.progressChart.labelColour, mech.hud.progressChart.labelSize);
    this.progressGauge.visible = false;
    this.progressLabel.visible = false;
    this.bossName.anchor.set(0.5, 1);
    this.bossName.visible = false;
    this.bossBar.visible = false;
    this.scoreLabel.alpha = mech.hud.score.alpha;

    this.root.addChild(
      this.resourceGauge,
      this.subline,
      this.resourceLabel,
      this.scoreLabel,
      this.bossBar,
      this.bossName,
      this.progressGauge,
      this.progressLabel,
      this.debug,
    );

    /**
     * The level's signpost LABELS are gone.
     *
     * They were three small yellow words pinned down the left edge (鱼群 / 气泡潮 / 爆发), naming sections of the level
     * the player is in the middle of. Two reasons they went: the level already ANNOUNCES each of them with a banner at
     * the moment it happens, which is where the player is looking; and a permanent list of section names down the edge
     * reads as a menu, not as a view of the water. `landmarks` itself is still level data -- it is what fires those
     * announcements.
     */
  }

  layout(viewport: Viewport): void {
    /**
     * The HUD's own scale, NOT the world zoom.
     *
     * `viewport.scale` is how many pixels a world metre occupies, which is a property of the GAME VIEW --
     * on a wide window it is several times a phone's, so sizing readouts with it rendered the headline at
     * 283px. The readouts are screen furniture, so they are sized against the canvas.
     */
    const s = designScale(viewport.width, viewport.height);
    // Remembered for `update`, which draws the gauge in screen pixels and would otherwise have to
    // re-derive it -- and previously reached for the world zoom instead, which is a different number.
    this.hudScale = s;
    /**
     * The lane's own geometry, remembered for `update`.
     *
     * The resource gauge is sized and centred against the LANE rather than the canvas, and `update` has no viewport
     * to read it from -- the same reason `hudScale` is remembered above.
     */
    this.laneWidthPx = viewport.laneWidthPx;
    this.laneCentreX = viewport.left + viewport.laneWidthPx / 2;
    const centreX = this.laneCentreX;

    /**
     * The headline slot is GONE, and the subline took its place.
     *
     * It used to be the metres to the surface, which was the level's progress. A level now ends when its boss does, so
     * that number was measuring something the player could no longer do anything with -- and the space belongs to the
     * boss bar, which measures the thing they can.
     */
    this.subline.scale.set(s);
    this.subline.x = centreX;
    this.subline.y = 22 * s;
    // The resource sits directly under the subline: same block of screen furniture, one line lower, so the two read
    // as one readout rather than as two unrelated facts in different corners.
    this.resourceLabel.scale.set(s);
    this.resourceLabel.x = centreX;
    this.resourceLabel.y = this.subline.y + 16 * s;

    this.debug.scale.set(s * 0.9);
    /**
     * Pinned to the column edge, but never so far left that it runs off a narrow desktop window.
     *
     * Shifted clear of the gauge when the gauge is on the left: the readout is nine lines of small text starting at
     * the top of the lane, and the bar would run straight through its first characters.
     */
    this.debug.x = Math.max(6, viewport.left + 3 * s);
    this.debug.y = 116 * s;

    /**
     * The score: the top-left corner, above the gauge and above the readout.
     *
     * The one piece of HUD furniture whose job is to be noticed when it changes, so it owns a corner rather than
     * sharing the centred block with the depth.
     */
    this.scoreLabel.scale.set(s);
    this.scoreLabel.x = viewport.left + mech.hud.score.x * s;
    this.scoreLabel.y = mech.hud.score.y * s;

    // The boss bar is centred on the CANVAS rather than on the lane: it is a headline about the fight, not a marker in
    // the water, and the lane can be much narrower than the screen.
    this.canvasWidth = viewport.width;
    this.bossName.scale.set(s);
    this.bossName.x = viewport.width / 2;
    this.bossName.y = mech.hud.bossBar.y * s - mech.hud.bossBar.nameOffset * s;



  }

  /** Which birth type to show under the headline. */
  setSeedLabel(label: string): void {
    this.seedLabel = label;
  }

  /**
   * The run's score.
   *
   * Called every frame, and it does nothing when the number has not moved: the digits are the point of this label, so
   * rebuilding the string and re-laying out the text sixty times a second for a number that changes a few times a
   * minute would be pure waste on the one screen that has to keep up with a phone.
   */
  setScore(points: number): void {
    if (points === this.shownScore) return;
    this.shownScore = points;
    this.scoreLabel.text = `分数 ${points}`;
  }

  /**
   * The boss fight, or nothing.
   *
   * Called every frame with the boss's state: `null` hides the pair, and a name with a fraction draws them. The bar is
   * only redrawn when the fraction actually moves, for the same reason the score label is: this is a phone, and the
   * digits and the bar are the only things on screen that change every frame.
   */
  setBoss(boss: { name: string; fraction: number } | null): void {
    const cfg = mech.hud.bossBar;
    const visible = boss !== null;
    this.bossBar.visible = visible;
    this.bossName.visible = visible;
    if (!boss) {
      this.shownBossFraction = -1;
      this.bossBar.clear();
      return;
    }
    const s = this.hudScale;
    if (this.bossName.text !== boss.name) this.bossName.text = boss.name;
    const fraction = Math.max(0, Math.min(1, boss.fraction));
    if (fraction === this.shownBossFraction) return;
    this.shownBossFraction = fraction;

    const width = this.canvasWidth * cfg.widthRatio;
    const height = cfg.height * s;
    const x = (this.canvasWidth - width) / 2;
    const y = cfg.y * s;
    const g = this.bossBar;
    g.clear();
    g.roundRect(x, y, width, height, height / 2).fill({ color: cfg.backColour, alpha: cfg.backAlpha });
    const filled = width * fraction;
    if (filled > 1) {
      g.roundRect(x, y, filled, height, height / 2).fill({ color: cfg.fillColour, alpha: 1 });
    }
    g.roundRect(x, y, width, height, height / 2).stroke({ color: cfg.borderColour, alpha: cfg.borderAlpha, width: 1 });
  }

  /**
   * The score exactly as the player reads it.
   *
   * Exposed for the same reason as the headline: "it says 350" can only be checked against the string the HUD really
   * shows, and a test that re-derived the format would pass while the screen showed something else.
   */
  /**
   * The run's progress chart: one pip per level, filled as the run clears them.
   *
   * The whole game is a ladder of six levels, and until now nothing on the play screen said so -- the level's own
   * progress (a boss's health) is a different fact from the run's. Six pips answer "how far have I got" in one glance,
   * which matters most exactly when the answer changes: the moment a boss dies and the run walks into the next level.
   *
   * `null` hides it, which is what the menu and the codex want: this is a chart about a RUN, and there is no run
   * happening on those screens.
   */
  setProgress(chart: { total: number; cleared: number; current: number } | null): void {
    this.progressChart = chart;
    this.progressGauge.visible = chart !== null;
    this.progressLabel.visible = chart !== null;
    this.redrawProgress();
  }

  /** Where the pips go and what they look like: only `layout` knows the canvas. */
  private redrawProgress(): void {
    const g = this.progressGauge;
    g.clear();
    const chart = this.progressChart;
    if (!chart) return;
    const cfg = mech.hud.progressChart;
    const s = this.hudScale;
    const r = cfg.pipRadius * s;
    const step = r * 2 + cfg.pipGap * s;
    const y = cfg.y * s;
    const x0 = this.canvasWidth - cfg.rightInset * s - (chart.total - 1) * step;
    for (let i = 0; i < chart.total; i++) {
      const x = x0 + i * step;
      const done = i < chart.cleared;
      const here = i === chart.current;
      g.circle(x, y, r).fill({
        color: done ? cfg.doneColour : cfg.pendingColour,
        alpha: done ? cfg.doneAlpha : cfg.pendingAlpha,
      });
      if (here) {
        // The current level gets a ring rather than a different fill: "where I am" and "what I have done" are two
        // facts, and one pip cannot carry both with one channel.
        g.circle(x, y, r * 1.7).stroke({ color: cfg.currentColour, alpha: cfg.currentAlpha, width: Math.max(1, r * 0.4) });
      }
    }
    this.progressLabel.scale.set(s);
    this.progressLabel.anchor.set(1, 0.5);
    this.progressLabel.x = this.canvasWidth - cfg.rightInset * s;
    this.progressLabel.y = y + r * 2.6;
    this.progressLabel.text = `总进度 ${chart.cleared}/${chart.total}`;
    this.progressLabel.style.fill = cfg.labelColour;
  }

  /** Test hooks: the boss bar as the player sees it. Absence is information, so both are read. */
  get bossBarVisible(): boolean {
    return this.bossBar.visible;
  }

  /** Test hook: the progress chart as the player reads it. */
  get progressText(): string {
    return this.progressLabel.visible ? this.progressLabel.text : '(hidden)';
  }

  get bossBarName(): string {
    return this.bossName.text;
  }

  get scoreText(): string {
    return this.scoreLabel.text;
  }

  /** The run's talent, shown next to the seed so the player can see what they got. */
  setTalentLabel(label: string | null): void {
    this.talentLabel = label ?? '';
  }

  /**
   * The carried skill and its remaining uses.
   *
   * `null` empties the slot, which the HUD shows as nothing at all rather than as an empty box: an
   * empty slot is the normal state for most of a run, and a permanent empty frame would just be
   * clutter on a screen that is already busy.
   */
  setSkillLabel(name: string | null, uses: number): void {
    this.skillLabel = name ? `${name} ×${uses}` : '';
  }


  /**
   * The state line under the headline, exactly as the player reads it.
   *
   * Exposed for the same reason as the headline: "the plain bubble promises a next stage it can never reach" is a
   * claim about THIS string, and a probe that re-derived it would pass while the screen said something else.
   */
  get sublineText(): string {
    return this.subline.text;
  }

  /**
   * The debug readout, exactly as the player reads it.
   *
   * Same reasoning as the headline: the build line is only useful if it is really on the screen, and a test that
   * asked the version module directly would pass while the readout showed nothing.
   */
  get debugText(): string {
    return this.debug.text;
  }

  /**
   * `Hud.update`: the readouts, and the water's colour.
   *
   * @param scrolled how far the LEVEL has travelled, in metres. Progress and depth both belong to the
   *   scroll, not to the player: the bubble moves freely within the window, so reading either off its
   *   world position made every press of "up" advance the bar AND brighten the whole sea.
   */
  /**
   * The rage gauge: a bar under the resource line, filled in the live stage's colour.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY IT IS DRAWN ONLY WHEN THERE IS A RESOURCE
   * ---------------------------------------------------------------------------------------------
   * The devour bubble never calls this, and its HUD is exactly what it always was. That is the same rule the whole
   * type abstraction follows: a second type's furniture must cost the first type nothing.
   *
   * The ticks are the STAGE THRESHOLDS, read from the appearance table rather than from a second list -- so moving a
   * threshold in the config moves the tick with it, and "one more hit and I change colour" is visible without the
   * player memorising any numbers.
   */
  private drawResourceGauge(fraction: number, colour: number): void {
    const cfg = mech.angry.gauge;
    const s = this.hudScale;
    const g = this.resourceGauge;
    g.clear();

    const w = this.laneWidthPx * cfg.widthRatio;
    const h = cfg.height * s;
    const x = this.laneCentreX - w / 2;
    // Measured from the resource line's own position, so the pieces stay together if the HUD's spacing moves.
    const y = this.resourceLabel.y + this.resourceLabel.height + cfg.gap * s;
    const r = cfg.radius * s;

    g.roundRect(x, y, w, h, r).fill({ color: cfg.trackColour, alpha: cfg.trackAlpha });
    g.roundRect(x, y, w, h, r).stroke({ color: cfg.trackStroke, alpha: cfg.trackStrokeAlpha, width: 1 });

    const filled = Math.min(1, Math.max(0, fraction)) * w;
    if (filled > 0.5) g.roundRect(x, y, filled, h, r).fill({ color: colour, alpha: cfg.fillAlpha });

    // The stage thresholds, as ticks. Zero is the bar's own start, so it is skipped.
    for (const row of mech.angry.appearance) {
      if (row.minRage <= 0) continue;
      const at = x + Math.min(1, row.minRage / Math.max(1e-6, mech.angry.rage.max)) * w;
      g.moveTo(at, y).lineTo(at, y + h);
    }
    g.stroke({ color: cfg.tickColour, alpha: cfg.tickAlpha, width: cfg.tickWidth * s });
  }

  /**
   * Exposed for probes: whether the resource's furniture is on screen.
   *
   * Read from the display objects rather than from the payload, so a test asserts what a player can see.
   */
  get resourceGaugeVisible(): boolean {
    return this.resourceLabel.visible;
  }

  update(
    player: Player,
    fps: number,
    nominalSeconds: number,
    elapsed: number,
    lateral: LateralAuthority,
    /**
     * How far the level has scrolled.
     *
     * Still a parameter because the water colour is a function of depth, and no longer used for a progress readout --
     * a level's progress is its boss's health now, and that arrives through `setBoss`.
     */
    scrolled: number,
    /**
     * The growth stage, how far into the next one, and the eating rank digestion has bought.
     *
     * In the subline rather than the headline: the headline is the one number a player reads at a glance, and
     * the stage is a slower-changing fact. The progress toward the next stage is the part that matters,
     * because it is what makes "should I eat one more" a decision.
     *
     * `tierBonus` is shown only when it is non-zero, because it is zero for most of a run: a permanent "+0" would
     * spend subline space on a fact the player has not earned. Once it exists it has to be visible, though -- it
     * changes what the bubble can eat while the volume number says otherwise, and an invisible discrepancy
     * between what the bubble looks like and what it can do is the one thing the marker and the rule must never
     * disagree about.
     */
    stage: {
      stage: number;
      name: string;
      absorbedInStage: number;
      neededForNext: number | null;
      /** False for a type that does not grow from absorbing at all, which has no next stage to count toward. */
      grows: boolean;
      tierBonus: number;
      /**
       * A second resource, for a bubble type that has one: its label, its readout, and its colour.
       *
       * Null for the devour bubble, which has no second meter -- and the null is the honest representation of that
       * rather than a zero, because "0 rage" and "no rage at all" are different claims and the HUD should not make
       * the second one.
       */
      resource?: { label: string; text: string; colour: number; fraction: number } | null;
    },
  ): void {
    /**
     * The metres-to-surface readout is DELETED rather than hidden.
     *
     * It was the level's progress while the surface was the finish line. A level now ends when its boss is defeated, so
     * the number measured something the player could not act on -- and a HUD that shows a countdown to nothing teaches
     * the player to ignore the HUD. What replaced it is the boss bar below, which is the one progress that means
     * something.
     */
    // The talent and the skill share the subline: they are both "what am I this run", and the screen
    // has no room for a third line. The skill comes first because it is the one that changes.
    const tags = [this.skillLabel, this.talentLabel].filter(Boolean).join('   ·   ');
    /**
     * The stage readout: which tier, and how many more collectables to the next one.
     *
     * At the top stage it shows the name alone rather than a fake "complete" bar -- there is nothing left to
     * earn, and the interesting information becomes the fact that the bubble is now at its slowest.
     *
     * A type that does not grow gets neither count. It would sit at "0/12" for a whole run -- a countdown to
     * something that cannot happen -- and "满" would be worse, because it would say the bubble had finished a
     * progression it never took part in.
     */
    const stageText =
      (!stage.grows
        ? `${stage.name} 不成长`
        : stage.neededForNext === null
          ? `${stage.name} ${stage.stage}阶 满`
          : `${stage.name} ${stage.stage}阶 ${stage.absorbedInStage}/${stage.neededForNext}`) +
      (stage.tierBonus > 0 ? `  吞阶+${stage.tierBonus}` : '');
    this.subline.text = tags
      ? `${stageText}   ·   ${this.seedLabel}${this.seedLabel ? '   ·   ' : ''}${tags}`
      : this.seedLabel
        ? `${stageText}   ·   ${this.seedLabel}`
        : stageText;

    /**
     * The second resource gets its OWN line, in its own colour, rather than a slot in the subline.
     *
     * The subline was already at the width of a phone before rage existed: adding "怒气 100 失控" to it clipped the
     * label at BOTH ends, which a screenshot showed and no assertion would have. A line of its own is also the
     * better answer on its own terms -- it can carry the resource's colour, which is the same colour the bubble is
     * turning, and it can be empty without leaving a gap in the middle of a sentence.
     */
    if (stage.resource) {
      this.resourceLabel.visible = true;
      this.resourceLabel.text = `${stage.resource.label} ${stage.resource.text}`;
      this.resourceLabel.style.fill = stage.resource.colour;
      this.drawResourceGauge(stage.resource.fraction, stage.resource.colour);
    } else {
      this.resourceLabel.visible = false;
      this.resourceLabel.text = '';
      this.resourceGauge.clear();
    }
    // The subline's own colour is put back every frame: the field is shared with the resource's line only in the
    // sense that both are HUD text, and a stale fill from a previous type would outlive the type change.
    this.subline.style.fill = 0x7fc4e8;

    // The level gauge is gone; the boss bar is drawn by `setBoss` from the game's own state.
    //
    // `scrolled` still matters because the level's DEPTH remains a real reading -- the water colour and the debug line
    // both use it -- even though it no longer drives a progress bar.
    this.levelDepthMeters = Math.max(0, DEPTH_TOTAL - scrolled);

    if (++this.debugTimer % 10 === 0) {
      this.debug.text = [
        /**
         * The build, first, because it is the line that answers "am I looking at the code I think I am".
         *
         * First rather than last on purpose: this readout is 9 monospace lines on a phone screen and the bottom of
         * it is the part that gets cropped out of a screenshot -- which is exactly when somebody needs to read it.
         */
        `build   ${buildLabel()}`,
        `fps     ${fps.toFixed(0)}`,
        `depth   player ${player.depth.toFixed(1)} m   level ${this.levelDepthMeters.toFixed(0)} m to surface`,
        // The player's own motion, on both axes, and the SCREEN fraction the vertical is expressed in:
        // "depth" alone no longer describes where the bubble is, because the world moves under it.
        `vy      ${player.vy.toFixed(3)} screen/s`,
        `vx      ${player.vx.toFixed(3)} lane/s`,
        `x       ${(player.x * 100).toFixed(1)}% of lane   screenY ${(player.screenY * 100).toFixed(0)}%`,
        `time    ${elapsed.toFixed(1)}s   level ${nominalSeconds.toFixed(0)}s`,
        `lane    ${this.laneWidthMeters.toFixed(1)} m   depth view ${this.visibleDepthMeters.toFixed(0)} m`,
        `lateral ${lateral.keyboardSpeed.toFixed(3)} lane/s keyboard  damp ${LATERAL_DAMPING}`,
        `cross   ${lateral.crossingSeconds}s rest / ${lateral.boostCrossingSeconds}s with boost penalty`,
      ].join('\n');
    }
  }

  /** Installed by `Game.layout()`. Shown in the debug readout only. */
  private laneWidthMeters = 0;
  private visibleDepthMeters = 0;

  setWorldMetrics(laneWidthMeters: number, visibleDepthMeters: number): void {
    this.laneWidthMeters = laneWidthMeters;
    this.visibleDepthMeters = visibleDepthMeters;
  }
}

export async function createApp(): Promise<Application> {
  const app = new Application();
  await app.init({
    background: 0x01050c,
    antialias: false,
    // Deliberately NOT `resizeTo: window`. On mobile the layout viewport is still moving while the
    // page loads (URL bar collapsing, visual viewport settling), and resizing to it at init can
    // lock in a size that no longer matches the screen -- which showed up as the game drawn into a
    // quarter of the display. Sizing is driven by a ResizeObserver on the container instead.
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: 'webgl',
    powerPreference: 'high-performance',
  });
  return app;
}







































