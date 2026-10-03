/**
 * Enemy fire: the bullets creatures shoot at the player.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT `src/bullets.ts` WITH A FLAG
 * ---------------------------------------------------------------------------------------------
 * The player's gun and the enemies' guns look similar and share almost nothing. The player's rounds are harmless to
 * their owner, are fired from a muzzle the player carries, stop at scenery, damage creatures, and are the reason the
 * player has any reach at all. Enemy rounds hurt the ONE thing the player IS, are fired from wherever a creature
 * happens to be, and exist to make a piece of water the player must not be standing in. Merged, every method would
 * have to ask "whose bullet is this" -- which is the shape this project splits out rather than grows.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT MAKES A BULLET-HELL BULLET FAIR
 * ---------------------------------------------------------------------------------------------
 * Three things, and all three are config:
 *
 *   - it is AIMED at where the player was and never corrected, so it can be read and stepped out of;
 *   - it is SLOW ENOUGH that the player's own lateral speed beats it (see `speedPerSecond`), so the dodge is always
 *     physically available rather than theoretically possible;
 *   - it is BOUNDED: a shooter only fires from inside `rangeMeters`, and a round that leaves the visible band or the
 *     lane is recycled, so nothing ever arrives from off screen.
 *
 * The shooter's RHYTHM lives on the hazard (`shootTimer`, ticked by `src/hazards.ts`), not here. This module is handed
 * an order to fire; it does not decide whose turn it is. That keeps a creature's state on the creature, and keeps the
 * bullet field a field.
 */

import { Graphics } from 'pixi.js';
import { mech } from './config';

export interface EnemyBullet {
  x: number;
  y: number;
  /** Metres per second along the aim direction. */
  vx: number;
  vy: number;
  age: number;
  /** Which kind fired it, so a kind's rounds can be told apart and drawn after it. */
  kind: string;
}

/** What the field needs from the world to advance and resolve its rounds. */
export interface EnemyBulletContext {
  /** Visible world y range, so a round that leaves it is recycled rather than kept for ever. */
  min: number;
  max: number;
  laneWidth: number;
  /** The player, in world metres. */
  playerX: number;
  playerY: number;
  /** The player's hit radius this frame. */
  playerRadius: number;
  /**
   * Scenery stops them, exactly as it stops the player's own fire -- so a crate is cover for both sides.
   *
   * Passed as a function rather than the obstacle field, because the only thing this module may do with scenery is
   * ask whether it is in the way.
   */
  blocks: (x: number, y: number, hitRadius: number) => boolean;
}

export class EnemyBulletField {
  bullets: EnemyBullet[] = [];

  /**
   * Rounds fired and rounds that hit the player, this run.
   *
   * Monotonic, like the game's other counters: a round is in the water for a couple of seconds and gone, so sampling
   * the array afterwards cannot answer "did it happen".
   */
  fired = 0;
  hits = 0;

  reset(): void {
    this.bullets.length = 0;
    this.fired = 0;
    this.hits = 0;
  }

  /** How many rounds this field will make this frame, for a HUD or a probe. */
  get count(): number {
    return this.bullets.length;
  }

  /**
   * Fire from a creature at a point, and return how many rounds that produced.
   *
   * One round per `spread`, fanned around the aim direction by `spreadRadians`. A fan rather than a burst in one line,
   * because the point of a spread is that it closes one escape route and leaves another -- three rounds on one path is
   * just a bigger single bullet.
   *
   * Returns 0 for a kind with no row: a creature that is not in the shooters table does not shoot, and silently
   * giving it a default row would be a difficulty change nobody made.
   */
  fire(kind: string, x: number, y: number, aimX: number, aimY: number, laneWidth: number): number {
    const row = mech.enemyBullets.shooters[kind];
    if (!row) return 0;
    const dx = aimX - x;
    const dy = aimY - y;
    const length = Math.hypot(dx, dy);
    // Aimed at itself: there is no direction to fire in. Burning the shot is better than inventing an angle.
    if (length < 1e-6) return 0;
    const base = Math.atan2(dy, dx);
    const speed = row.speedPerSecond * laneWidth;
    const rounds = Math.max(1, Math.round(row.spread));
    for (let i = 0; i < rounds; i++) {
      const offset = (i - (rounds - 1) / 2) * row.spreadRadians;
      const angle = base + offset;
      this.bullets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        kind,
      });
      this.fired++;
    }
    return rounds;
  }

  /**
   * Advance, retire, and resolve against the player and the scenery.
   *
   * @return how many rounds landed on the player this frame. Counted rather than applied, because the field does not
   *   own the player: the caller takes the hit, and it is also the caller that knows whether the run is still going.
   */
  update(dt: number, ctx: EnemyBulletContext): number {
    const cfg = mech.enemyBullets;
    const radius = ctx.laneWidth * cfg.radiusRatio;
    let landed = 0;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      b.age += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      let spent = false;
      // Scenery first, so a round that would have hit the player through a crate stops at the crate.
      if (ctx.blocks(b.x, b.y, radius)) {
        spent = true;
      } else {
        const reach = radius + ctx.playerRadius;
        const dx = ctx.playerX - b.x;
        const dy = ctx.playerY - b.y;
        if (dx * dx + dy * dy <= reach * reach) {
          landed++;
          this.hits++;
          spent = true;
        }
      }

      if (spent || b.age >= cfg.lifeSeconds || b.y < ctx.min - 60 || b.y > ctx.max + 120 || b.x < -ctx.laneWidth * 0.2 || b.x > ctx.laneWidth * 1.2) {
        this.bullets.splice(i, 1);
      }
    }
    return landed;
  }
}

/**
 * Draw the rounds.
 *
 * A bright core inside a warmer rim, which is the opposite of the player's own fire (a pale bubble with a cold rim):
 * over a dark blue screen the two read as different KINDS of thing in peripheral vision, which is the only vision a
 * player has when a wall of them is arriving.
 */
export function paintEnemyBullets(g: Graphics, field: EnemyBulletField, laneWidth: number): void {
  const cfg = mech.enemyBullets;
  const r = laneWidth * cfg.radiusRatio;
  for (const b of field.bullets) {
    // A short tail along the direction of travel, so a slow round still reads as moving.
    const speed = Math.hypot(b.vx, b.vy) || 1;
    const tail = Math.min(r * 3.2, speed * 0.02);
    g.moveTo(b.x - (b.vx / speed) * tail, b.y - (b.vy / speed) * tail)
      .lineTo(b.x, b.y)
      .stroke({ color: cfg.rimColour, alpha: cfg.rimAlpha * 0.45, width: Math.max(1, r * 0.7) });
    g.circle(b.x, b.y, r * 1.35).fill({ color: cfg.rimColour, alpha: cfg.rimAlpha * 0.35 });
    g.circle(b.x, b.y, r).fill({ color: cfg.coreColour, alpha: 1 });
  }
}
