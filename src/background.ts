import { Application, Container, FillGradient, Graphics, Text } from 'pixi.js';
import { LATERAL_DAMPING, VIEW } from './config';
import { DEPTH_TOTAL } from './levels';
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

export function makeLabel(text: string, colour: number, size: number, weight: 'normal' | 'bold' = 'bold'): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
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
 * Horizontal placement of world-space props, as a FRACTION of the play area width.
 *
 * Fractions rather than metres: the play area is sized to the display, so a metre constant would
 * put the ruler in a different place on every screen.
 */
const RULER_X_RATIO = 0.008;
const RULER_TICK_MAJOR_RATIO = 0.014;
const RULER_TICK_MINOR_RATIO = 0.007;

/**
 * Everything that lives in the water column and moves with the camera: the colour gradient, the
 * parallax marine snow, and the depth ruler. Children use world metres.
 */
export class WorldLayer {
  readonly root = new Container();
  readonly world = new Container();

  /** Background gradient is drawn in SCREEN pixels, behind everything. */
  private readonly gradient = new Graphics();
  /** Ruler rails and ticks: world space. */
  private readonly ruler = new Graphics();
  /** Marine snow: world space. */
  private readonly snow = new Graphics();

  private readonly maskShape = new Graphics();
  private snowPoints: { x: number; y: number; r: number; driftX: number; driftY: number }[] = [];

  /** Cached colours so the gradient object is only rebuilt when a colour actually changes. */
  private lastTopColour = -1;
  private lastBottomColour = -1;
  /** Cached canvas size, so a resize also forces a rebuild. See `update`. */
  private lastGradientWidth = -1;
  private lastGradientHeight = -1;
  constructor() {
    this.snow.eventMode = 'none';
    this.gradient.eventMode = 'none';
    this.ruler.eventMode = 'none';

    this.world.addChild(this.ruler, this.snow);
    this.world.mask = this.maskShape;

    this.root.addChild(this.gradient, this.world);
  }

  /** Ruler geometry depends on the play area width, so it is rebuilt on every layout. */
  private buildRuler(laneWidth: number): void {
    const railX = laneWidth * RULER_X_RATIO;
    const majorLen = laneWidth * RULER_TICK_MAJOR_RATIO;
    const minorLen = laneWidth * RULER_TICK_MINOR_RATIO;
    const railW = laneWidth * 0.0018;

    this.ruler.clear();
    this.ruler.rect(railX, 0, railW, DEPTH_TOTAL).fill({ color: 0x3d7fa8, alpha: 0.3 });
    // Ticks run inwards from the rail, i.e. toward larger world x.
    for (let depth = 0; depth <= DEPTH_TOTAL; depth += 10) {
      const y = DEPTH_TOTAL - depth;
      const isMajor = depth % 50 === 0;
      this.ruler
        .rect(railX, y, isMajor ? majorLen : minorLen, DEPTH_TOTAL * 0.0005)
        .fill({ color: isMajor ? 0x8fe3ff : 0x5ba6c9, alpha: isMajor ? 0.6 : 0.3 });
    }
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
    // Rebuild the gradient on the next update: its geometry depends on the viewport.
    this.lastTopColour = -1;
    this.lastBottomColour = -1;
    this.lastGradientWidth = -1;
    this.lastGradientHeight = -1;

    const columnLeft = viewport.left;
    const columnWidth = viewport.laneWidthPx;

    // Invisible mask keeping ruler and snow inside the play area. Drawn in screen pixels, so a
    // screen-space fill is correct here despite the rest of the class using world metres.
    // The lane always spans the full canvas width now, so this is a belt-and-braces clip.
    this.maskShape.clear();
    this.maskShape.rect(columnLeft, -1000, columnWidth, viewport.height + 2000).fill(0xffffff);

    // World-space prop sizes are relative to the play area width, so they need rebuilding here.
    this.buildRuler(viewport.laneWidthMeters);
    this.seedSnow(viewport.laneWidthMeters);
  }

  /**
   * `WorldLayer.update`: the scenery. Draws no readouts, so it does not need the player.
   *
   * @param scrolled how far the LEVEL has travelled, in metres. Used by the marine-snow recycle, which
   *   keeps the drifting specks distributed across the visible band.
   */
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
    if (topColour !== this.lastTopColour || bottomColour !== this.lastBottomColour || sizeChanged) {
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
      this.gradient.rect(0, 0, viewport.width, viewport.height).fill(gradient);
    }

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
  const deep = { r: 0x02, g: 0x07, b: 0x10 };
  const shallow = { r: 0x2e, g: 0x8f, b: 0xc4 };

  const t = Math.min(Math.max(worldY / DEPTH_TOTAL, 0), 1);
  const eased = Math.pow(t, 1.15);

  let r = deep.r + (shallow.r - deep.r) * eased;
  let g = deep.g + (shallow.g - deep.g) * eased;
  let b = deep.b + (shallow.b - deep.b) * eased;

  // Surface bloom over the last 55m, on top of the gradient. Kept narrow and subtle: a wider,
  // stronger bloom washed out most of the screen whenever the camera was anywhere near the top.
  const bloom = Math.max(0, Math.min(1, 1 - depth / 55));
  r += (0xbf - r) * bloom * 0.3;
  g += (0xf0 - g) * bloom * 0.3;
  b += (0xff - b) * bloom * 0.3;

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
export class Hud {
  readonly root = new Container();

  private readonly headline: Text;
  private readonly subline: Text;
  private readonly gauge = new Graphics();
  private readonly debug: Text;
  private readonly landmarkLabels: Text[] = [];
  private barGeometry = { barX: 0, barTop: 0, barBottom: 0, barW: 0 };
  /**
   * The HUD's own scale, set by `layout`.
   *
   * Separate from the world zoom on purpose: this is screen furniture, sized against the canvas. See
   * `designScale`.
   */
  private hudScale = 1;
  private debugTimer = 0;
  /** Which of the three birth types this run rolled. Set by the game after construction. */
  private seedLabel = '';
  /** This run's talent, and the carried skill with its uses. Empty strings mean "show nothing". */
  private talentLabel = '';
  private skillLabel = '';

  constructor(private readonly landmarks: readonly Landmark[]) {
    this.headline = makeLabel('500', 0xeaf9ff, 40);
    this.headline.anchor.set(0.5, 0);
    this.headline.y = 22;

    this.subline = makeLabel('', 0x7fc4e8, 11);
    this.subline.anchor.set(0.5, 0);

    this.debug = makeLabel('', 0x7fc4e8, 11, 'normal');
    this.debug.alpha = 0.8;

    this.root.addChild(this.gauge, this.headline, this.subline, this.debug);

    for (const mark of landmarks) {
      const label = makeLabel(mark.label, 0xffd479, 11);
      label.anchor.set(1, 0.5);
      this.landmarkLabels.push(label);
      this.root.addChild(label);
    }
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
    const right = viewport.left + viewport.laneWidthPx;
    const centreX = viewport.left + viewport.laneWidthPx / 2;

    this.headline.scale.set(s);
    this.headline.x = centreX;
    this.subline.scale.set(s);
    this.subline.x = centreX;
    this.subline.y = this.headline.y + 50 * s;

    this.debug.scale.set(s * 0.9);
    // Pinned to the column edge, but never so far left that it runs off a narrow desktop window.
    this.debug.x = Math.max(6, viewport.left + 3 * s);
    this.debug.y = 132 * s;

    const barTop = 110 * s;
    const barBottom = viewport.height - 46 * s;
    const barW = 9 * s;
    // Inside the column's right edge, so the gauge belongs to the lane rather than the letterbox.
    this.barGeometry = { barX: right - 14 * s - barW, barTop, barBottom, barW };

    for (const [i, label] of this.landmarkLabels.entries()) {
      const mark = this.landmarks[i];
      if (!mark) continue;
      const t = mark.depth / DEPTH_TOTAL;
      label.scale.set(s);
      label.x = this.barGeometry.barX - 4 * s;
      label.y = barBottom - t * (barBottom - barTop);
    }
  }

  /** Which birth type to show under the headline. */
  setSeedLabel(label: string): void {
    this.seedLabel = label;
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
   * The headline number, exactly as the player reads it.
   *
   * Exposed because a bug report in terms of "it says 130" can only be checked against the string the
   * HUD actually shows, not against a re-derivation that might disagree with it.
   */
  get headlineText(): string {
    return this.headline.text;
  }

  /**
   * `Hud.update`: the readouts, and the water's colour.
   *
   * @param scrolled how far the LEVEL has travelled, in metres. Progress and depth both belong to the
   *   scroll, not to the player: the bubble moves freely within the window, so reading either off its
   *   world position made every press of "up" advance the bar AND brighten the whole sea.
   */
  update(
    player: Player,
    fps: number,
    nominalSeconds: number,
    elapsed: number,
    lateral: LateralAuthority,
    scrolled: number,
  ): void {
    // Distance still to travel, from the LEVEL's progress rather than the bubble's position. The bubble
    // is born on the seabed with the whole length ahead of it, and it cannot change this number by
    // steering -- which is exactly the point.
    const remaining = Math.max(0, DEPTH_TOTAL - scrolled);
    this.headline.text = `${Math.round(remaining)}`;
    // The talent and the skill share the subline: they are both "what am I this run", and the screen
    // has no room for a third line. The skill comes first because it is the one that changes.
    const tags = [this.skillLabel, this.talentLabel].filter(Boolean).join('   ·   ');
    this.subline.text = tags
      ? `距海面 / TO SURFACE (m)   ·   ${this.seedLabel}${this.seedLabel ? '   ·   ' : ''}${tags}`
      : this.seedLabel
        ? `距海面 / TO SURFACE (m)   ·   ${this.seedLabel}`
        : `距海面 / TO SURFACE (m)`;

    const { barX, barTop, barBottom, barW } = this.barGeometry;
    // Reads as a vessel filling up: the water level rises as the level advances, and the surface line is
    // the cursor. Empty at the seabed, full at the surface.
    const travelled = Math.min(Math.max(scrolled / DEPTH_TOTAL, 0), 1);
    const rise = travelled;
    const s = this.hudScale;

    const g = this.gauge;
    g.clear();
    g.roundRect(barX, barTop, barW, barBottom - barTop, barW / 2).fill({ color: 0x0a1c2e, alpha: 0.72 });
    g.roundRect(barX, barTop, barW, barBottom - barTop, barW / 2).stroke({ color: 0x3d7fa8, alpha: 0.5, width: 1 });

    const fillHeight = rise * (barBottom - barTop);
    if (fillHeight > 1) {
      g.roundRect(barX, barBottom - fillHeight, barW, fillHeight, barW / 2).fill({ color: 0x6fe3ff, alpha: 0.9 });
    }

    for (const mark of this.landmarks) {
      const t = mark.depth / DEPTH_TOTAL;
      const y = barBottom - t * (barBottom - barTop);
      g.rect(barX - 3 * s, y - s, barW + 6 * s, 2 * s).fill({ color: 0xffd479, alpha: 0.85 });
    }

    const cursorY = barBottom - rise * (barBottom - barTop);
    g.circle(barX + barW / 2, cursorY, 5 * s).fill({ color: 0xffffff, alpha: 0.95 });

    if (++this.debugTimer % 10 === 0) {
      this.debug.text = [
        `fps     ${fps.toFixed(0)}`,
        `depth   ${player.depth.toFixed(1)} m`,
        `vy      ${player.vy.toFixed(2)} m/s`,
        `vx      ${player.vx.toFixed(3)} lane/s`,
        `x       ${(player.x * 100).toFixed(1)}% of lane`,
        `time    ${elapsed.toFixed(1)}s   eta ${nominalSeconds.toFixed(0)}s`,
        `lane    ${this.laneWidthMeters.toFixed(1)} m   depth view ${this.visibleDepthMeters.toFixed(0)} m`,
        `accel   ${lateral.accel.toFixed(0)}  damp ${LATERAL_DAMPING}`,
        `cross   ${lateral.crossingSeconds}s cruise / ${lateral.boostCrossingSeconds}s boost (steer ${lateral.boostSteerFactor})`,
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
