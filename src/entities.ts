import { DEPTH_TOTAL } from './config';
import { ascentSpeedAtDepth } from './depth';
import { bubbleVolumeFromRadius } from './volume';

/**
 * A collectable bubble.
 *
 * Position is in WORLD METRES (x across the play area, y above the seabed). Bubbles rise too, but
 * slower than the player, so the player passes through a drifting cloud: that relative motion is
 * what makes absorbing feel like sweeping things up rather than chasing them.
 */
export interface Bubble {
  x: number;
  y: number;
  /** Rise speed in m/s. Always less than the player's, so the player overtakes. */
  vy: number;
  /** Drawn radius as a fraction of the play area width. */
  radius: number;
  /** Mechanical size, derived from the radius so bigger bubbles are worth more. */
  volume: number;
  /** 0..1 phase offset so they do not all wobble in unison. */
  phase: number;
}

/** A drifting speck, purely decorative. */
export interface Speck {
  x: number;
  y: number;
  r: number;
  phase: number;
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
   * @param laneWidth metres across the play area
   * @param min,max visible world y range
   * @param playerRadiusFraction the player's drawn radius as a fraction of the lane, so bubble
   *   sizes can be expressed relative to it. Ratios are far easier to reason about than absolute
   *   radii: >1 means "too big to eat", and the mix of ratios IS the difficulty curve.
   */
  update(dt: number, laneWidth: number, min: number, max: number, playerRadiusFraction: number): void {
    this.advance(dt);
    this.recycle(min, max);
    this.topUp(laneWidth, min, max, playerRadiusFraction);
  }

  private advance(dt: number): void {
    for (const b of this.bubbles) {
      b.y += b.vy * dt;
      b.phase += dt * 0.9;
    }
    // Specks do not move: the camera rises past them, which reads as water streaming down.
    for (const s of this.specks) s.phase += dt * 0.4;
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

  private spawnBubble(
    laneWidth: number,
    min: number,
    max: number,
    playerRadiusFraction: number,
    margin: number,
  ): Bubble {
    const y = Math.min(DEPTH_TOTAL, Math.max(1, min + Math.random() * (max - min + margin)));

    // Size relative to the PLAYER, so the mix stays meaningful as the player grows.
    //
    // The distribution is deliberately lopsided: mostly edible, with a minority that are too big.
    // The first version used `0.45 + roll^2 * 2.1`, whose mean factor was 1.15 -- i.e. the AVERAGE
    // bubble was bigger than the player, and the screen filled up with giant obstacles.
    const roll = Math.random();
    const ratio = roll < 0.72 ? 0.3 + Math.random() * 0.45 : 1.05 + Math.random() * 0.6;

    const radius = playerRadiusFraction * ratio;
    const relative = 0.2 + Math.random() * 0.7;

    return {
      x: radius + Math.random() * Math.max(0.01, laneWidth - radius * 2),
      y,
      vy: ascentSpeedAtDepth(DEPTH_TOTAL - y) * relative,
      radius,
      volume: bubbleVolumeFromRadius(radius),
      phase: Math.random() * Math.PI * 2,
    };
  }

  private spawnSpeck(laneWidth: number, min: number, max: number, margin: number): Speck {
    return {
      x: Math.random() * laneWidth,
      y: min + Math.random() * (max - min + margin),
      r: laneWidth * (0.0004 + Math.random() * 0.0014),
      phase: Math.random() * Math.PI * 2,
    };
  }
}
