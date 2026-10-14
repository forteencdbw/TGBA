import { Graphics } from 'pixi.js';
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
 * The DRAWING is shared in the only sense that matters: both are circles filled from a config colour.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO FIELDS IN ONE FILE
 * ---------------------------------------------------------------------------------------------
 * They are here together because they are the same sentence twice -- something small, born at the bottom, rising,
 * fading in and out at the ends -- and separating them would put `edgeFade` in one file and its other caller in
 * another. What separates them is what they are made of: a speck is a dot whose brightness is a question about the
 * LIGHT, and a bubble is a drawn object whose brightness is not.
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
  r: number;
  speed: number;
  /** Its own age in seconds. It accelerates, so this is not `y / speed`. */
  age: number;
  /** Where in the wobble it starts, so a string does not sway as one object. */
  phase: number;
}

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
 */
export class BubbleField {
  readonly graphics = new Graphics();
  private readonly bubbles: Bubble[] = [];
  private readonly vents: Vent[] = [];
  private height = 0;

  seed(width: number, height: number): void {
    const cfg = mech.menu.water.bubbles;
    this.height = height;
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

  private born(x: number, y: number, width: number): Bubble {
    const cfg = mech.menu.water.bubbles;
    return {
      x0: x,
      x,
      y,
      r: Math.max(0.5, width * cfg.size * (1 - cfg.sizeVariance / 2 + Math.random() * cfg.sizeVariance)),
      speed: this.height * cfg.speed * (0.8 + Math.random() * 0.4),
      age: 0,
      phase: Math.random() * Math.PI * 2,
    };
  }

  update(dt: number, width: number): void {
    const cfg = mech.menu.water.bubbles;
    for (const vent of this.vents) {
      vent.nextAt -= dt;
      if (vent.nextAt > 0) continue;
      // `+=` rather than `=`: a slow frame carries its remainder into the next interval instead of dropping it.
      vent.nextAt += cfg.everySeconds * (1 - cfg.everyJitter / 2 + Math.random() * cfg.everyJitter);
      const per = Math.max(1, Math.round(cfg.perString));
      for (let i = 0; i < per; i++) this.bubbles.push(this.born(vent.x, -i * this.height * cfg.gap, width));
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
      if (b.y > this.height) this.bubbles.splice(i, 1);
    }
  }

  draw(): void {
    const cfg = mech.menu.water.bubbles;
    const g = this.graphics;
    g.clear();
    for (const b of this.bubbles) {
      const alpha = edgeFade(b.y, this.height, cfg.fadeEdge) * cfg.alpha;
      if (alpha <= 0.002) continue;
      g.circle(b.x, b.y, b.r).fill({ color: cfg.colour, alpha: alpha * cfg.bodyAlpha });
      g.circle(b.x, b.y, b.r).stroke({ color: cfg.colour, width: Math.max(0.5, b.r * cfg.rimWidth), alpha });
      /**
       * THE HIGHLIGHT, and it is offset UPWARD from the centre.
       *
       * Up is +y in this container, because the whole backdrop has its y inverted -- and the light comes from the
       * surface, which is off the top of the lane. The offsets are shape constants rather than dials: they are what
       * a highlight IS, and one that could be moved to the bottom left would just be wrong.
       */
      g.circle(b.x - b.r * 0.3, b.y + b.r * 0.35, b.r * cfg.highlightRadius).fill({
        color: 0xffffff,
        alpha: alpha * cfg.highlightAlpha,
      });
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
