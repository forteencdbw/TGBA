import { tuning } from './config';
import type { LevelEntry } from './levels';
import { pullSpeedFraction, suctionRadiusFraction } from './suction';
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
  /**
   * Total background specks.
   *
   * Raised from 90: with `NEAR_SPECK_FRACTION` at 0.36 that left only about 6 near-camera specks on
   * screen, and the near layer is the ONLY speed cue that works over a run this long (the far
   * background can never scroll faster than about 2 px/s). Six flickering dots is not a depth cue.
   */
  targetSpecks = 130;

  reset(): void {
    this.bubbles = [];
    this.specks = [];
    this.timelineCursor = 0;
    this.pending = [];
    this.emittedCount = 0;
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
   * Place whatever the level's timeline calls for as the camera passes it.
   *
   * This replaces the old "keep a population topped up" model. A level is now AUTHORED: the entries say
   * what exists and where, so nothing appears that the designer did not ask for. The cursor only moves
   * forwards, so an entry is emitted exactly once however the frame rate behaves.
   *
   * @param scrollMetres how far the camera has travelled from the seabed
   * @param spawnWorldY the world y a new entry appears at. Pass the TOP of the visible range, not the
   *   camera's own position.
   *
   *   The distinction is the whole difference between content descending into view and content appearing
   *   mid-screen. `entry.at` says WHEN an entry happens, and the camera's position is the middle of the
   *   screen, so placing at the camera's y made everything materialise in the centre -- which reads as
   *   spawning rather than as a current the player is swimming against. The caller owns this because only
   *   the camera knows how tall the window is.
   */
  placeTimeline(timeline: readonly LevelEntry[], scrollMetres: number, spawnWorldY: number): void {
    while (this.timelineCursor < timeline.length) {
      const entry = timeline[this.timelineCursor];
      if (!entry || entry.at > scrollMetres) break;
      this.timelineCursor++;
      this.pending.push({ entry, worldY: spawnWorldY });
    }
  }

  /** The timeline cursor, and entries emitted but not yet handed to the game. */
  private timelineCursor = 0;
  private pending: { entry: LevelEntry; worldY: number }[] = [];

  /**
   * Collect the entries placed since the last call, and clear the queue.
   *
   * The game owns hazards and skill pickups, so the field cannot build them; it hands over what the
   * timeline asked for and lets the caller decide what each kind means.
   */
  takePending(): { entry: LevelEntry; worldY: number }[] {
    const out = this.pending;
    this.pending = [];
    this.emittedCount += out.length;
    return out;
  }

  /** True once every timeline entry has been emitted. */
  get timelineExhausted(): boolean {
    return this.timelineCursor > 0 && this.pending.length === 0;
  }

  /** Cursor position and queue depth, for probes. A level that will not end needs these. */
  get debugTimeline(): { cursor: number; pending: number; emitted: number } {
    return { cursor: this.timelineCursor, pending: this.pending.length, emitted: this.emittedCount };
  }

  /** Total entries handed out so far, which is what proves nothing is placed twice. */
  private emittedCount = 0;

  /**
   * @param laneWidth metres across the play area
   * @param min,max visible world y range
   * @param playerVolume the player's current volume, used to solve each bubble's rise speed.
   * @param scrollSpeed the camera's travel in m/s. Collectables are measured against this, because it
   *   is what makes the world move now that the player no longer rises on their own.
   * @param suction where the player is and whether the field is up, or null when it is not. Applied BEFORE the
   *   motion solve so a pulled bubble covers the whole frame's distance, and so the solve's own velocity stays
   *   the bubble's own -- a pull written into `vy` would be re-derived away on the next frame.
   * @param suctionRadiusFactor a multiplier on the field's reach, so an over-full stomach's runaway suction pulls
   *   as wide as it is drawn. Passed in rather than read from the config again, so the drawing and the physics
   *   cannot disagree about how big the field is.
   */
  update(
    dt: number,
    laneWidth: number,
    min: number,
    max: number,
    playerVolume: number,
    scrollSpeed: number,
    suction: { x: number; y: number } | null = null,
    suctionRadiusFactor = 1,
  ): void {
    this.scrollSpeed = Math.max(0.001, scrollSpeed);
    this.playerVolume = playerVolume;
    if (suction) this.applySuction(dt, laneWidth, suction.x, suction.y, playerVolume, suctionRadiusFactor);
    this.advance(dt);
    this.advanceParallax(dt, this.scrollSpeed);
    this.recycle(min, max);
    this.topUpSpecks(laneWidth, min, max);
  }

  /**
   * Pull collectables toward the player.
   *
   * Displacement rather than force: `x`/`y` are owned by this module, and writing a pull into a velocity would be
   * overwritten by `advance`'s per-frame solve. Moving the position directly also means the pull is exactly
   * "metres per second toward the player", which is a number the config can state and a test can measure.
   *
   * The radius is in LANE WIDTHS, matching how every other spawn and size is expressed, so the field does not
   * need to know about the camera.
   */
  private applySuction(
    dt: number,
    laneWidth: number,
    playerX: number,
    playerY: number,
    playerVolume: number,
    radiusFactor: number,
  ): void {
    const radius = laneWidth * suctionRadiusFraction(playerVolume) * Math.max(0, radiusFactor);
    if (radius <= 0) return;
    const radiusSq = radius * radius;

    for (const b of this.bubbles) {
      const dx = playerX - b.x;
      const dy = playerY - b.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > radiusSq) continue;
      // Skip the one the player is already touching: the absorb path owns that, and pulling it would fight it.
      if (distSq < 1e-6) continue;

      const dist = Math.sqrt(distSq);
      // A collectable's mechanical size IS its mass, which is what makes big ones harder to drag.
      const speed = laneWidth * pullSpeedFraction(b.volume, playerVolume);
      // Never overshoot the player in one step: a bubble dragged past them and out the other side reads as the
      // field pushing rather than pulling.
      const step = Math.min(speed * dt, dist);
      b.x += (dx / dist) * step;
      b.y += (dy / dist) * step;
    }
  }

  /** Player volume the bubble speeds are currently solved against. */
  private playerVolume = 1;

  /**
   * The camera's scroll speed: what collectable motion is measured against.
   *
   * This is the world's motion. It replaced the player's ascent speed as the reference, because with
   * free movement the player may be stationary while the world still visibly moves.
   */
  private scrollSpeed = 25;

  /**
   * A collectable's signed relative speed in m/s: positive travels down-screen, negative up.
   *
   * Pulled out as its own function so a test can compare it directly: it is a pure function of the
   * bubble's size, the player's size, and the camera's scroll speed.
   */
  solveBubbleVelocity(bubbleVolume: number, playerVolume: number): number {
    return bubbleRelativeFallRatio(bubbleVolume, playerVolume) * this.scrollSpeed;
  }

  /** The scroll speed collectables are currently solved against. */
  get cruiseAscentSpeed(): number {
    return this.scrollSpeed;
  }

  private advance(dt: number): void {
    for (const b of this.bubbles) {
      if (b.held) continue;
      // Re-solve every frame rather than at spawn: the relationship depends on the player's CURRENT
      // size, so a bubble the player has grown past must start drifting down without being respawned.
      // Measured against the CRUISING ascent, not the boosted one: accelerating must move the player
      // and leave the collectables alone. (World scenery is the exception -- see `advanceParallax`.)
      b.vy = this.solveBubbleVelocity(b.volume, this.playerVolume);
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

  private topUpSpecks(laneWidth: number, min: number, max: number): void {
    const speckMargin = 4;
    while (this.specks.length < this.targetSpecks) {
      this.specks.push(this.spawnSpeck(laneWidth, min, max, speckMargin));
    }
  }

  /**
   * Build a collectable for a timeline entry.
   *
   * A level says how big something is relative to the player, so the food in a level scales with the
   * player rather than being a fixed size that stops mattering once they grow.
   */
  bubbleFromEntry(entry: LevelEntry, laneWidth: number, playerRadiusFraction: number): Bubble {
    const ratio = entry.size ?? 0.5;
    const radius = playerRadiusFraction * ratio;
    const volume = bubbleVolumeFromRadius(radius);
    return {
      id: this.nextId++,
      x: radius + entry.x * Math.max(0.01, laneWidth - radius * 2),
      y: entry.at,
      vy: bubbleRelativeFallRatio(volume, this.playerVolume) * this.scrollSpeed,
      radius,
      volume,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.max(tuning.bubbleWobbleMin, Math.min(tuning.bubbleWobbleMax, 0.3 / Math.max(0.2, ratio))),
    };
  }

  /**
   * How far above the view a collectable survives, as a fraction of the visible height.
   *
   * Only a cull margin now, not a spawn distance: with a timeline deciding what exists and where,
   * nothing is placed "just off screen" any more, so the SPAWN/CULL pairing that used to be a
   * hard constraint here no longer applies.
   */
  private static readonly CULL_ABOVE_FRACTION = 0.3;
  /**
   * How far BELOW the view a collectable survives, again as a fraction of the visible height.
   *
   * Generous, because a large bubble rises faster than the scroll and so travels UP the screen: it ends
   * up below the view while still being part of the level. Culling it there would keep deleting exactly
   * the big bubbles, which are the ones that matter most.
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
   * the level's length here once piled the whole initial fill into a single band at the top.
   */
  /**
   * Specks come in two depth classes. Far ones barely move and give the water body; near ones sweep
   * past several times faster and are the actual speed cue.
   *
   * The near fraction is a named constant because it decides whether the depth cue reads at all: at
   * 90 total specks and one in three near, only about six near specks were ever on screen, which is
   * a few dots rather than a layer.
   */
  private static readonly NEAR_SPECK_FRACTION = 0.4;

  private spawnSpeck(laneWidth: number, min: number, max: number, margin: number): Speck {
    const near = Math.random() < EntityField.NEAR_SPECK_FRACTION;
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
