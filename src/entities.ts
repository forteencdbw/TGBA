import { tuning } from './config';
import { bubbleRelativeFallRatio, bubbleVolumeFromRadius } from './volume';

/**
 * A collectable bubble.
 *
 * Position is in WORLD METRES (x across the play area, y above the seabed).
 *
 * Motion follows the real relationship between size and rise speed: bigger bubbles rise faster, and
 * what the player sees is `playerAscent - theBubble'sOwnRiseSpeed`. So `vy` is SIGNED -- positive
 * means the bubble drifts down the screen because the player overtakes it, negative means it rises
 * faster than the player and climbs up the screen. See `volume.ts`.
 */
export interface Bubble {
  /** Stable identity, so a probe can track one bubble across samples instead of a moving "nearest". */
  id: number;
  x: number;
  y: number;
  /**
   * Signed relative screen motion in m/s: positive travels down (player overtakes), negative
   * travels up (the bubble outruns the player). Re-solved every frame from the current ascent.
   */
  vy: number;
  /** Drawn radius as a fraction of the play area width. */
  radius: number;
  /** Mechanical size, derived from the radius so bigger bubbles are worth more. */
  volume: number;
  /** 0..1 phase offset so they do not all wobble in unison. */
  phase: number;
  /**
   * Lateral wobble amplitude as a fraction of this bubble's own radius. Small bubbles shimmy,
   * large ones hold their shape. Cosmetic only.
   */
  wobble: number;
  /**
   * Pin the bubble in place: `advance` will not re-solve or apply its velocity.
   *
   * Set only by test hooks, so a probe bubble cannot drift away from the player before contact is
   * resolved. Without it the per-frame velocity solve overwrites whatever the test set, and for a
   * small bubble that means closing a gap at a fraction of a metre per second.
   */
  held?: boolean;
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

  /**
   * How many collectables to keep within the working area (one screenful plus the buffers).
   *
   * Sized so that the count ON SCREEN stays near 20, which is the density the field was tuned
   * against. It is deliberately above the on-screen target because the player consumes collectables
   * continuously, so the live count sits below this mostly. A value that produced ~17 on screen left
   * too little margin and made distribution probes flap around their threshold.
   */
  targetBubbles = 32;
  targetSpecks = 90;

  reset(): void {
    this.bubbles = [];
    this.specks = [];
    this.spawnedThisRun = 0;
  }

  /** Collectables created since the last reset, used to distinguish seeding from streaming. */
  private spawnedThisRun = 0;

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
   * @param playerVolume the player's current volume, used to solve each bubble's rise speed.
   * @param ascentSpeed the player's current m/s. Everything the player sees move is measured
   *   relative to this: a bubble's screen speed is `ascentSpeed - itsOwnRiseSpeed`.
   */
  update(
    dt: number,
    laneWidth: number,
    min: number,
    max: number,
    playerRadiusFraction: number,
    playerVolume: number,
    ascentSpeed: number,
  ): void {
    this.ascentSpeed = Math.max(0.001, ascentSpeed);
    this.playerVolume = playerVolume;
    this.advance(dt);
    this.advanceParallax(dt, this.ascentSpeed);
    this.recycle(min, max);
    this.topUp(laneWidth, min, max, playerRadiusFraction);
  }

  /** Player volume the bubble speeds are currently solved against. */
  private playerVolume = 1;

  /** The ascent speed the stream is currently scaled to. */
  private ascentSpeed = 1.7;

  private advance(dt: number): void {
    for (const b of this.bubbles) {
      if (b.held) continue;
      // Re-solve every frame rather than at spawn: the relationship depends on the player's CURRENT
      // size, so a bubble the player has grown past must start drifting down without being respawned.
      b.vy = bubbleRelativeFallRatio(b.volume, this.playerVolume) * this.ascentSpeed;
      // `vy` is signed: positive is down-screen (the player overtakes), negative is up-screen (the
      // bubble outruns the player). World y grows upward, so it is subtracted either way.
      b.y -= b.vy * dt;
      // Small bubbles shimmy; large ones hold their shape.
      b.phase += dt * (1.6 - b.wobble) * 2;
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

  /** Drop anything that has left the working area. */
  private recycle(min: number, max: number): void {
    const span = max - min;
    this.bubbles = this.bubbles.filter(
      (b) =>
        b.y > min - span * EntityField.CULL_BELOW_FRACTION &&
        b.y < max + span * EntityField.CULL_ABOVE_FRACTION,
    );
    this.specks = this.specks.filter((s) => s.y > min - span * 0.05 && s.y < max + span * 0.05);
  }

  private topUp(laneWidth: number, min: number, max: number, playerRadiusFraction: number): void {
    while (this.bubbles.length < this.targetBubbles) {
      this.bubbles.push(this.spawnBubble(laneWidth, min, max, playerRadiusFraction));
    }
    const speckMargin = 4;
    while (this.specks.length < this.targetSpecks) {
      this.specks.push(this.spawnSpeck(laneWidth, min, max, speckMargin));
    }
  }

  /**
   * How far above the visible range a new collectable appears, as a fraction of the VISIBLE HEIGHT.
   *
   * Expressed as a fraction rather than in metres, which is the fix for a bug that took three
   * attempts: the visible height changes as the camera moves and the old absolute values (a full
   * span, then 55m, then 60m) meant completely different things. 60m against a 454m view is 13%, so
   * new bubbles appeared barely off-screen and took over half a minute to arrive at 1.5 px/s.
   *
   * THE CONSTRAINT: `CULL_ABOVE` must be strictly GREATER, or a bubble is destroyed on the step it
   * is created and immediately replaced. In that state the field holds a full complement of bubbles
   * while almost none are ever visible.
   */
  private static readonly SPAWN_ABOVE_FRACTION = 0.15;
  /** How far above the view a collectable survives. MUST exceed SPAWN_ABOVE_FRACTION. */
  private static readonly CULL_ABOVE_FRACTION = 0.3;
  /**
   * How far BELOW the view a collectable survives, again as a fraction of the visible height.
   *
   * Generous, because a large bubble rises faster than the player and so travels UP the screen: it
   * ends up below the view while still being part of the field. Culling it there would keep deleting
   * exactly the big bubbles, which are the ones that matter most.
   */
  private static readonly CULL_BELOW_FRACTION = 0.35;

  private nextId = 1;

  /**
   * Spawn a collectable.
   *
   * Two distributions, and the difference matters:
   *
   *   - SEEDING (the field is empty, i.e. the start of a run): spread across the visible range, so
   *     the player starts inside a populated world rather than an empty one.
   *   - STREAMING (topping up a populated field): just above the visible range, so bubbles enter
   *     from the top of the screen and travel down. Spawning inside the visible range would make
   *     them pop into existence mid-screen, which reads as spawning rather than as a current of
   *     water the player is climbing through.
   *
   * There is no clamp on y: anything above the play area simply streams in later. Clamping to
   * DEPTH_TOTAL here once piled the whole initial fill into a single band at the top.
   */
  private spawnBubble(laneWidth: number, min: number, max: number, playerRadiusFraction: number): Bubble {
    const span = max - min;
    const cullAbove = span * EntityField.CULL_ABOVE_FRACTION;
    // SEEDING vs STREAMING, distinguished by how many have been created this run rather than by the
    // live count (which drops whenever the player eats one).
    //
    //   seeding: spread uniformly from the bottom of the view up to the highest position that will
    //            survive the cull, so the player starts inside a populated world AND has a reserve
    //            above the view to stream down. Bounded by the cull margin on purpose -- seeding
    //            beyond it meant the bubbles were destroyed the moment they were created.
    //   streaming: just above the view, so they enter from the top of the screen.
    const seeding = this.spawnedThisRun < this.targetBubbles;
    const y = seeding
      ? min + Math.random() * (span + cullAbove)
      : max + Math.random() * span * EntityField.SPAWN_ABOVE_FRACTION;
    this.spawnedThisRun++;

    // Size relative to the PLAYER, so the mix stays meaningful as the player grows.
    //
    // The distribution is deliberately lopsided: mostly edible, with a minority that are too big.
    // The first version used `0.45 + roll^2 * 2.1`, whose mean factor was 1.15 -- i.e. the AVERAGE
    // bubble was bigger than the player, and the screen filled up with giant obstacles.
    const roll = Math.random();
    const ratio = roll < 0.72 ? 0.3 + Math.random() * 0.45 : 1.05 + Math.random() * 0.6;

    const radius = playerRadiusFraction * ratio;
    const volume = bubbleVolumeFromRadius(radius);

    return {
      id: this.nextId++,
      x: radius + Math.random() * Math.max(0.01, laneWidth - radius * 2),
      y,
      // Signed and re-solved every frame; see `advance`.
      vy: bubbleRelativeFallRatio(volume, this.playerVolume) * this.ascentSpeed,
      radius,
      volume,
      phase: Math.random() * Math.PI * 2,
      // Larger bubbles are steadier: surface tension holds them together against the churn.
      wobble: Math.max(
        tuning.bubbleWobbleMin,
        Math.min(tuning.bubbleWobbleMax, tuning.bubbleWobbleMax * (playerRadiusFraction / Math.max(1e-4, radius)) * 0.5),
      ),
    };
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
      // Near specks run 1.5-4x the camera speed: faster than the water, but comparable to the
      // collectable stream rather than wildly outrunning it.
      drift: near ? 1.5 + Math.random() * 2.5 : -0.15 - Math.random() * 0.2,
    };
  }
}
