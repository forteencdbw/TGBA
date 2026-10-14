import { Container, Graphics, Sprite } from 'pixi.js';
import type { Texture } from 'pixi.js';
import { assetSizeNow, loadAssetTexture } from './assets';
import { mech } from './config';

/**
 * What drifts UPWARD through the menu's water: suspended specks, and bubbles off the seabed.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT THE GAME'S MARINE SNOW
 * ---------------------------------------------------------------------------------------------
 * `WorldLayer` in `src/background.ts` already has a snow field, and the two look alike from a distance. They are not
 * the same thing, and the difference is not cosmetic: that one lives in WORLD METRES and recycles as the LEVEL
 * scrolls past it, so its whole lifetime model is "the camera moved". The menu never scrolls. Everything here rises
 * on its own, is born below the lane and dies above it, and fades at both ends so the recycle is invisible.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO FIELDS IN ONE FILE
 * ---------------------------------------------------------------------------------------------
 * They are here together because they are the same sentence twice -- something small, born at the bottom, rising,
 * fading in and out at the ends -- and separating them would put `edgeFade` in one file and its other caller in
 * another.
 *
 * What separates them is what they are MADE of, and that is not shared at all: a speck is a dot whose brightness is a
 * question about the LIGHT, and a bubble is a PICTURE -- twelve of them, each drawn at the size it was drawn at.
 */

/** How much of the shafts' light lands on a point: 0 between them, about 1 inside one. */
export type BeamLight = (x: number, y: number) => number;

/**
 * How visible something at `y` is, given that it appears and disappears over a band at each end of the lane.
 *
 * Popping into existence at the edge of the screen is the oldest tell that something is being recycled. A band at
 * each end is nearly free and removes it, which is worth the top and bottom of the lane being a little thin.
 *
 * Exported for a probe, which is the only way to ask about it without a canvas.
 */
export function edgeFade(y: number, height: number, band: number): number {
  const b = Math.max(0.001, band) * height;
  return Math.max(0, Math.min(1, y / b, (height - y) / b));
}

/** One speck of suspended matter. */
interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  /** How much of the shafts' light was on it at the last update, 0..1. */
  lit: number;
}

/**
 * The specks in the water -- and the light they are standing in.
 *
 * They are drawn UNDER the shafts, so the shafts' own additive pass lands on top of them. Their opacity is asked of
 * the light as well, and two layers of one fact sounds like one too many. It is not: the additive pass gives a speck
 * the COLOUR of the light, and this gives it the BRIGHTNESS. A beam may pass over a speck without making it visible
 * at all if the speck itself is nearly transparent, and a dust mote in a sunbeam is exactly that difference.
 */
export class MoteField {
  readonly graphics = new Graphics();
  private readonly motes: Mote[] = [];
  private width = 0;
  private height = 0;

  /**
   * Scatter them across the whole lane once.
   *
   * The even spread is a property that looks after itself: every speck rises at its own speed but travels the SAME
   * distance before it is reborn at the bottom, so a field that starts even stays even and nothing has to top it up.
   */
  seed(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.motes.length = 0;
    const count = Math.max(0, Math.round(mech.menu.water.motes.count));
    for (let i = 0; i < count; i++) this.motes.push(this.born(Math.random() * height));
  }

  private born(y: number): Mote {
    const cfg = mech.menu.water.motes;
    const spread = (variance: number): number => 1 - variance / 2 + Math.random() * variance;
    return {
      x: Math.random() * this.width,
      y,
      // A floor on the radius: a speck smaller than a pixel is a flickering pixel, not a speck.
      r: Math.max(0.4, this.width * cfg.size * spread(cfg.sizeVariance)),
      vy: this.height * cfg.speed * spread(cfg.speedVariance),
      vx: (Math.random() - 0.5) * this.width * cfg.drift,
      lit: 0,
    };
  }

  update(dt: number, light: BeamLight): void {
    for (const m of this.motes) {
      m.y += m.vy * dt;
      m.x += m.vx * dt;
      if (m.y > this.height) {
        Object.assign(m, this.born(0));
        continue;
      }
      m.lit = light(m.x, m.y);
    }
  }

  draw(): void {
    const cfg = mech.menu.water.motes;
    const g = this.graphics;
    g.clear();
    for (const m of this.motes) {
      const alpha = edgeFade(m.y, this.height, cfg.fadeEdge) * (cfg.baseAlpha + cfg.litAlpha * m.lit);
      if (alpha <= 0.002) continue;
      g.circle(m.x, m.y, m.r).fill({ color: cfg.colour, alpha });
    }
  }

  /** Test hook: how much light is on each speck, so a probe can ask whether a beam lands where it should. */
  get lighting(): number[] {
    return this.motes.map((m) => m.lit);
  }

  /** Test hook: where they are, so a probe can ask whether the field is even. */
  get heights(): number[] {
    return this.motes.map((m) => m.y);
  }
}

/** One bubble, on its way up. */
interface Bubble {
  /** Its vent. The wobble swings around this, so `x` is derived rather than accumulated. */
  x0: number;
  x: number;
  y: number;
  readonly sprite: Sprite;
  /** The picture, once one has been picked for it. See `draw`, which assigns it. */
  picture: Texture | null;
  speed: number;
  /** Its own age in seconds. It accelerates, so this is not `y / speed`. */
  age: number;
  /** Where in the wobble it starts, so a string does not sway as one object. */
  phase: number;
}

/**
 * The bubble pictures, as a SET.
 *
 * TWELVE DRAWINGS RATHER THAN ONE THAT IS SCALED, and the difference is not detail -- it is line weight. One picture
 * scaled up and down goes from a hairline at the bottom of its range to a slab at the top, which is exactly what a
 * pixel-art rim cannot survive. The artist drew a range of about 2.5x, so the code carries the range instead of
 * inventing one: each bubble is drawn at the size its own drawing is, and the variety in the water is the artwork's
 * rather than a random number's. That is also why `sizeVariance` is gone -- two mechanisms would be saying the same
 * thing, and the code one would be saying it worse.
 *
 * The twelve SIZES are not written down anywhere: the pictures were imported so that their texel sizes are
 * proportional to their drawn sizes, so a single scale factor for all twelve produces the right twelve sizes. See
 * `MAX_BUBBLE_TEXELS`, which is what the config's `size` is measured against.
 */
const BUBBLE_PICTURES = [
  '气泡-1', '气泡-2', '气泡-3', '气泡-4', '气泡-5', '气泡-6',
  '气泡-7', '气泡-8', '气泡-9', '气泡-10', '气泡-11', '气泡-12',
] as const;

/**
 * The widest of those drawings, in texels.
 *
 * Read off the atlas manifest rather than stated: the manifest is eager, so this is known before anything is decoded,
 * and a number written here would be a second copy of what the importing already decided. It is the denominator of the
 * one scale factor every bubble shares -- `size` is the LARGEST bubble's diameter, and this is the largest bubble's
 * width in texels, so their ratio IS the screen pixels per texel.
 *
 * The `1` floor is for the case where the atlas has none of them: `Math.max` of nothing is `-Infinity`, which would
 * make every scale `NaN` and every sprite vanish silently.
 */
const MAX_BUBBLE_TEXELS = Math.max(1, ...BUBBLE_PICTURES.map((name) => assetSizeNow(name)?.width ?? 0));

/** One place on the seabed that lets bubbles go. */
interface Vent {
  x: number;
  /** Seconds until it next lets a string go. */
  nextAt: number;
}

/**
 * Bubbles off the seabed, in strings.
 *
 * A VENT RATHER THAN A RAIN OF BUBBLES, because a seabed leaks from particular places: a string arriving from one spot
 * reads as gas coming out of the ground, and the same bubbles scattered at random read as noise. Each vent lets go of
 * `perString` bubbles at once, strung out BELOW the lane so they enter one after another -- the gap is what makes a
 * string a string.
 *
 * IT USED TO DRAW CIRCLES. Fill, stroke and a highlight dot, all from the config -- and the reason it does not any
 * more is the stroke: its width was `r * 0.22`, which on a bubble three pixels across is 0.77 pixels, i.e. a
 * sub-pixel stroke that renders as a blurred grey ring. A picture at the same size is pixel-aligned, and the highlight
 * is drawn by someone who could see it rather than computed from a radius.
 */
export class BubbleField {
  /** A container of sprites rather than one `Graphics` of circles: the drawing is the picture now. */
  readonly root = new Container();
  /**
   * The pictures, once they arrive.
   *
   * Empty until then, which does NOT stop the field: a bubble rises without one and is given a picture the moment
   * there is one to give it. See `draw`.
   */
  private readonly textures: Texture[] = [];
  private readonly bubbles: Bubble[] = [];
  private readonly vents: Vent[] = [];
  private height = 0;
  /** The lane width from the last update, so the shared sprite scale can be worked out without another parameter. */
  private width = 0;

  constructor() {
    this.root.eventMode = 'none';
    for (const name of BUBBLE_PICTURES) {
      void loadAssetTexture(name).then((texture) => {
        if (texture) this.textures.push(texture);
      });
    }
  }

  seed(width: number, height: number): void {
    const cfg = mech.menu.water.bubbles;
    this.height = height;
    this.width = width;
    for (const b of this.bubbles) this.discard(b);
    this.bubbles.length = 0;
    this.vents.length = 0;
    const count = Math.max(1, Math.round(cfg.vents));
    for (let i = 0; i < count; i++) {
      const slot = width / count;
      this.vents.push({
        x: (i + 0.5) * slot + (Math.random() - 0.5) * slot * 0.7,
        // Staggered starts, or every vent in the lane would fire on the same frame for ever.
        nextAt: Math.random() * Math.max(0.001, cfg.everySeconds),
      });
    }
  }

  private born(x: number, y: number): Bubble {
    const cfg = mech.menu.water.bubbles;
    const sprite = new Sprite();
    sprite.anchor.set(0.5, 0.5);
    sprite.tint = cfg.tint;
    // Hidden until it has a picture: a sprite with no texture draws as a white square, and a screen of white squares
    // is a worse failure than an empty first second.
    sprite.visible = false;
    this.root.addChild(sprite);
    return {
      x0: x,
      x,
      y,
      sprite,
      picture: null,
      speed: this.height * cfg.speed * (0.8 + Math.random() * 0.4),
      age: 0,
      phase: Math.random() * Math.PI * 2,
    };
  }

  /** Take a bubble's picture off the display list for good. */
  private discard(b: Bubble): void {
    this.root.removeChild(b.sprite);
    b.sprite.destroy();
  }

  /**
   * How many screen pixels one texel of a bubble is.
   *
   * ONE number for all twelve, which is the point of importing them proportionally: a sprite's own texel width times
   * this is its drawn width, so the twelve come out at twelve sizes without twelve numbers.
   */
  private get texelScale(): number {
    return (mech.menu.water.bubbles.size * this.width) / MAX_BUBBLE_TEXELS;
  }

  update(dt: number, width: number): void {
    const cfg = mech.menu.water.bubbles;
    this.width = width;
    for (const vent of this.vents) {
      vent.nextAt -= dt;
      if (vent.nextAt > 0) continue;
      // `+=` rather than `=`: a slow frame carries its remainder into the next interval instead of dropping it.
      vent.nextAt += cfg.everySeconds * (1 - cfg.everyJitter / 2 + Math.random() * cfg.everyJitter);
      const per = Math.max(1, Math.round(cfg.perString));
      for (let i = 0; i < per; i++) this.bubbles.push(this.born(vent.x, -i * this.height * cfg.gap));
    }
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i]!;
      b.age += dt;
      /**
       * IT SPEEDS UP, and that is the whole of the bubble rather than a detail: water pressure falls with depth, so
       * a bubble rises faster the higher it gets. It is also what spreads a string out as it climbs, which is what a
       * string of real bubbles does.
       */
      b.y += b.speed * (1 + cfg.accel * b.age) * dt;
      b.x = b.x0 + Math.sin((b.age / Math.max(0.001, cfg.swaySeconds)) * Math.PI * 2 + b.phase) * cfg.sway * width;
      if (b.y > this.height) {
        this.discard(b);
        this.bubbles.splice(i, 1);
      }
    }
  }

  /**
   * Put every sprite where its bubble is, and give it a picture if it has not got one yet.
   *
   * A sync rather than a draw, because a sprite draws itself -- there is nothing to clear and nothing to paint.
   *
   * THE PICTURE IS ASSIGNED HERE RATHER THAN AT BIRTH, and that is the difference between a field you can test and
   * one you cannot: a bubble exists and rises whether or not the atlas has landed, and only its PICTURE waits. The
   * first version refused to let a vent fire until a texture existed, which read as harmless -- the atlas arrives in a
   * second -- but it made the whole mechanism depend on a download, and the probe that checks strings come out of
   * vents went red in an environment with no canvas to decode a page on. The behaviour was fine and the coupling was
   * not.
   *
   * The scale is applied here for the same kind of reason: `update` is what knows the lane's width, and a lane that
   * changes width changes what "the largest bubble is this wide" means.
   */
  draw(): void {
    const cfg = mech.menu.water.bubbles;
    const scale = this.texelScale;
    for (const b of this.bubbles) {
      if (!b.picture) {
        if (!this.textures.length) continue;
        const texture = this.textures[Math.floor(Math.random() * this.textures.length)]!;
        b.picture = texture;
        b.sprite.texture = texture;
      }
      const alpha = edgeFade(b.y, this.height, cfg.fadeEdge) * cfg.alpha;
      b.sprite.visible = alpha > 0.002;
      if (!b.sprite.visible) continue;
      b.sprite.position.set(b.x, b.y);
      b.sprite.scale.set(scale);
      b.sprite.alpha = alpha;
    }
  }

  /** Test hook: how many are alive. */
  get count(): number {
    return this.bubbles.length;
  }

  /** Test hook: where each vent is, so a probe can ask whether the vents are spread out. */
  get ventXs(): number[] {
    return this.vents.map((v) => v.x);
  }
}
