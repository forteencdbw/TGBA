import { tuning } from './config';
import { bubbleVolumeFromRadius } from './volume';

/**
 * A collectable bubble.
 *
 * Position is in WORLD METRES (x across the play area, y above the seabed). Bubbles travel DOWN at
 * a fixed lane-relative speed, so the player flies up through a stream of them. The speed is
 * deliberately independent of the player's ascent rate and of depth -- see `fallSpeed`.
 */
export interface Bubble {
  /** Stable identity, so a probe can track one bubble across samples instead of a moving "nearest". */
  id: number;
  x: number;
  y: number;
  /** Downward travel speed in m/s, in WORLD terms (the y axis grows upward, so this is added). */
  vy: number;
  /** Drawn radius as a fraction of the play area width. */
  radius: number;
  /** Mechanical size, derived from the radius so bigger bubbles are worth more. */
  volume: number;
  /** 0..1 phase offset so they do not all wobble in unison. */
  phase: number;
}

/**
 * A drifting speck.
 *
 * `drift` is its extra downward screen speed, as a multiple of the player's own ascent. Specks with
 * a positive drift represent PARTICLES CLOSE TO THE CAMERA: they are not really falling, they just
 * sweep past much faster than the far background because they are nearer.
 *
 * This layer exists because of a hard constraint on perceived motion. At a 175-second run the whole
 * screen scrolls at only ~3.6 px/s on average (175s / 500m x 190m visible = 2.9 screen-heights of
 * total travel), so the far background can never read as moving. Depth layers moving at several
 * times the camera speed are what actually make the ascent feel fast -- the same trick 2D games
 * have always used for speed.
 */
export interface Speck {
  x: number;
  y: number;
  r: number;
  phase: number;
  /** Extra downward speed as a multiple of the player's ascent. Negative = far background. */
  drift: number;
}

/**
 * Keeps the visible world populated with bubbles and specks.
 *
 * Density is maintained by COUNT WITHIN THE VISIBLE RANGE, not by a spawn timer. A timer would
 * leave gaps when the ascent speeds up and clumps when it slows down, because the amount of world
 * scrolling past changes constantly over the 500m climb.
 */
export class EntityField {
  bubbles: Bubble[] = [];
  specks: Speck[] = [];

  /** How many bubbles to keep within one screenful of depth. */
  targetBubbles = 26;
  targetSpecks = 90;

  reset(): void {
    this.bubbles = [];
    this.specks = [];
  }

  /**
   * Insert a bubble provided by a test, assigning it an id.
   *
   * Exists so tests cannot construct a Bubble without an id, which the `Bubble` interface requires
   * and which probes rely on to track one object across samples.
   */
  addTestBubble(b: Omit<Bubble, 'id'>): Bubble {
    const bubble: Bubble = { ...b, id: this.nextId++ };
    this.bubbles.push(bubble);
    return bubble;
  }

  /**
   * @param laneWidth metres across the play area
   * @param min,max visible world y range
   * @param playerRadiusFraction the player's drawn radius as a fraction of the lane, so bubble
   *   sizes can be expressed relative to it. Ratios are far easier to reason about than absolute
   *   radii: >1 means "too big to eat", and the mix of ratios IS the difficulty curve.
   * @param ascentSpeed the player's current m/s. Collectable fall speed and the parallax layers are
   *   both proportional to it, so the whole water column accelerates with the ascent.
   */
  update(
    dt: number,
    laneWidth: number,
    min: number,
    max: number,
    playerRadiusFraction: number,
    ascentSpeed: number,
  ): void {
    this.ascentSpeed = Math.max(0.001, ascentSpeed);
    this.advance(dt);
    this.advanceParallax(dt, this.ascentSpeed);
    this.recycle(min, max);
    this.topUp(laneWidth, min, max, playerRadiusFraction);
  }

  /** The ascent speed the stream is currently scaled to. */
  private ascentSpeed = 1.7;

  private advance(dt: number): void {
    for (const b of this.bubbles) {
      // `vy` is DOWNWARD travel, and world y grows upward, so it is subtracted.
      b.y -= b.vy * dt;
      b.phase += dt * 0.9;
    }
    // Specks are static in the world; the camera rising past them is what moves them. Their extra
    // `drift` is added by the caller, which knows the player's current ascent speed.
    for (const s of this.specks) s.phase += dt * 0.4;
  }

  /**
   * Move the near-camera specks by their parallax speed.
   *
   * Separate from `advance` because it needs the player's ascent speed, which only the game knows.
   * Positive drift pushes a speck DOWN the world, which on screen means it sweeps past faster than
   * the background -- the depth cue that sells the ascent.
   */
  advanceParallax(dt: number, ascentSpeed: number): void {
    for (const s of this.specks) {
      if (s.drift !== 0) s.y -= s.drift * ascentSpeed * dt;
    }
  }

  /** Drop anything that has scrolled out of view. */
  private recycle(min: number, max: number): void {
    const margin = 12;
    this.bubbles = this.bubbles.filter((b) => b.y > min - margin && b.y < max + margin);
    this.specks = this.specks.filter((s) => s.y > min - margin && s.y < max + margin);
  }

  private topUp(laneWidth: number, min: number, max: number, playerRadiusFraction: number): void {
    const bubbleMargin = 8;
    while (this.bubbles.length < this.targetBubbles) {
      this.bubbles.push(this.spawnBubble(laneWidth, min, max, playerRadiusFraction, bubbleMargin));
    }
    const speckMargin = 4;
    while (this.specks.length < this.targetSpecks) {
      this.specks.push(this.spawnSpeck(laneWidth, min, max, speckMargin));
    }
  }

  private nextId = 1;

  /**
   * Spawn a collectable.
   *
   * Two distributions, which matters:
   *
   *   - SEEDING (the field is empty, i.e. the start of a run): spread across the visible range so
   *     the player is inside a populated world immediately. Seeding only above the range left the
   *     screen empty apart from a clump at the top.
   *   - STREAMING (topping up a populated field): spawn ABOVE the visible range so bubbles enter
   *     from the top of the screen and travel down. Spawning them inside the visible range would
   *     make them pop into existence mid-screen, which reads as spawning rather than as a current
   *     of water the player is climbing through.
   *
   * There is no upper clamp on y: anything above the play area simply streams in later. Clamping to
   * DEPTH_TOTAL here was what piled the initial fill into one band at the top.
   */
  private spawnBubble(
    laneWidth: number,
    min: number,
    max: number,
    playerRadiusFraction: number,
    margin: number,
  ): Bubble {
    const span = max - min;
    const y = this.bubbles.length === 0 ? min + Math.random() * span : max + margin + Math.random() * span;

    // Size relative to the PLAYER, so the mix stays meaningful as the player grows.
    //
    // The distribution is deliberately lopsided: mostly edible, with a minority that are too big.
    // The first version used `0.45 + roll^2 * 2.1`, whose mean factor was 1.15 -- i.e. the AVERAGE
    // bubble was bigger than the player, and the screen filled up with giant obstacles.
    const roll = Math.random();
    const ratio = roll < 0.72 ? 0.3 + Math.random() * 0.45 : 1.05 + Math.random() * 0.6;

    const radius = playerRadiusFraction * ratio;

    return {
      id: this.nextId++,
      x: radius + Math.random() * Math.max(0.01, laneWidth - radius * 2),
      y,
      vy: this.fallSpeed(),
      radius,
      volume: bubbleVolumeFromRadius(radius),
      phase: Math.random() * Math.PI * 2,
    };
  }

  /**
   * How fast a bubble travels DOWN, in world m/s.
   *
   * Proportional to the player's current ascent speed. See `tuning.bubbleFallMin/Max` for why, and
   * for the two alternatives that were measured and rejected.
   */
  private fallSpeed(): number {
    return this.ascentSpeed * (tuning.bubbleFallMin + Math.random() * (tuning.bubbleFallMax - tuning.bubbleFallMin));
  }

  /**
   * Specks come in two depth classes. Far ones barely move and give the water body; near ones sweep
   * past several times faster and are the actual speed cue. Roughly one in three is near.
   */
  private spawnSpeck(laneWidth: number, min: number, max: number, margin: number): Speck {
    const near = Math.random() < 0.36;
    return {
      x: Math.random() * laneWidth,
      y: min + Math.random() * (max - min + margin),
      r: near
        ? laneWidth * (0.0022 + Math.random() * 0.0036)
        : laneWidth * (0.0004 + Math.random() * 0.0011),
      phase: Math.random() * Math.PI * 2,
      // Near specks run 3-9x the camera speed. Deliberately slower than the collectable stream
      // (10-40x), so the bubbles read as the fast thing the player is interacting with while the
      // specks stay background texture.
      drift: near ? 3 + Math.random() * 6 : -0.15 - Math.random() * 0.2,
    };
  }
}
