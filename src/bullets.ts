import { Graphics } from 'pixi.js';
import { mech } from './config';
import type { HazardField } from './hazards';
import type { ObstacleField } from './obstacles';

/**
 * The small bubbles the player's bubble fires on its own.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------------------------
 * A stream of little bubbles, straight up, on a fixed cadence and with no button involved: the arcade shooter's
 * basic gun. They take hit points off a creature, and a creature whose hit points run out does not die -- it turns
 * and leaves the screen (see `HazardField.hit` and the flee state in `src/hazards.ts`).
 *
 * It is NOT the spit verb, and the two are kept apart on purpose. Spitting throws back a hazard the player
 * swallowed, so it costs a stomach slot and hits hard; this costs nothing but time and is always on. One is
 * ammunition, the other is a rate of fire, and folding them into one system would have made "how much do I have"
 * and "how often do I shoot" the same knob.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT IS ITS OWN MODULE RATHER THAN MORE CODE IN `main.ts`
 * ---------------------------------------------------------------------------------------------
 * The same reason `src/hazards.ts` and `src/obstacles.ts` are: the field owns where its objects are, how they move,
 * what they do on contact, how they are painted, and what happened (the counters). `main.ts` decides only WHEN it
 * runs and where the muzzle is. A projectile system spread across the game loop is one where "did the round hit"
 * and "was the round drawn" can disagree.
 */
export interface Bullet {
  /** World position, in the same units hazards use: metres across the lane, metres up. */
  x: number;
  y: number;
  /** Upward speed in m/s. Rounds travel with the water, so this is what they gain on it. */
  vy: number;
  /** Seconds in flight, for the range and for the fade. */
  age: number;
}

export interface BulletContext {
  /** Visible world y range, so a round that leaves it is recycled rather than kept for ever. */
  min: number;
  max: number;
  laneWidth: number;
  /**
   * Where rounds appear, in world metres: one muzzle, or one per gun row.
   *
   * A rim point rather than the centre, so the player sees a round leave the bubble rather than appear inside it.
   *
   * A LIST rather than a single point because the gun upgrade adds ROWS: one cadence tick fires one round from every
   * muzzle at once, which is what "two rows of bubbles at the same time" means and what makes the upgrade worth
   * taking. Alternating rounds between two muzzles would look the same and hit half as hard.
   */
  muzzles: readonly { x: number; y: number }[];
  /**
   * Whether this run fires at all.
   *
   * False during the birth animation and the ending, and false for a bubble type that has no gun. Passed in rather
   * than asked here, because "may I shoot right now" is a question about the run and the type, and this module
   * knows nothing about either.
   */
  armed: boolean;
  /**
   * Rounds per second for THIS frame, from the run's current rate tier.
   *
   * Supplied rather than read from the config, for the same reason `armed` is: the cadence depends on what the run has
   * picked up, and "how fast may I shoot right now" is a question about the RUN, not about the weapon in general.
   */
  perSecond: number;
  hazards: HazardField;
  obstacles: ObstacleField;
}

export class BulletField {
  bullets: Bullet[] = [];

  /** Monotonic counters, so a probe can prove the gun fired and that a round connected. */
  fired = 0;
  hits = 0;

  private cooldown = 0;

  reset(): void {
    this.bullets = [];
    this.cooldown = 0;
    this.fired = 0;
    this.hits = 0;
  }

  /**
   * Fire on the cadence, advance what is in flight, and resolve what it hits.
   *
   * The order is the same one the spit's projectiles use, and for the same reason: rounds move first, so a hit is
   * resolved where the round actually is this frame rather than where it was last frame.
   *
   * The return value is what the CALLER needs to react to this frame, and it is split by kind rather than summed for
   * the same reason `HazardField` reports effects instead of applying them: a sound wants to know that something
   * connected, a floating number wants to know WHERE, and a score wants to know that a creature was finished rather
   * than merely hit. A round stopped by scenery is in `hits` and in none of the others -- a crate does not bleed, and
   * it is not worth points.
   */
  update(dt: number, ctx: BulletContext): { hits: number; drivenOff: number; fired: number; driven: readonly { x: number; y: number }[] } {
    const cfg = mech.bullets;
    let landed = 0;
    let drivenOff = 0;
    let fired = 0;
    /** Positions of creatures finished this frame, for whatever the caller wants to draw there. */
    const driven: { x: number; y: number }[] = [];

    if (ctx.armed && ctx.perSecond > 0) {
      /**
       * `while` rather than `if`, and the cooldown is CARRIED rather than reset.
       *
       * A frame that took longer than one round's interval owes more than one round, and swallowing the rest would
       * make the rate of fire depend on the frame rate -- which is exactly what a fixed cadence is for. Carrying
       * the remainder keeps the average honest, and dropping the cooldown to 0 when disarmed is what makes the
       * first round after a resume immediate rather than a fraction of a frame late.
       */
      this.cooldown -= dt;
      while (this.cooldown <= 0) {
        this.cooldown += 1 / ctx.perSecond;
        this.spawn(ctx);
        fired++;
      }
    } else {
      this.cooldown = 0;
    }

    const radius = ctx.laneWidth * cfg.radiusRatio;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      b.age += dt;
      b.y += b.vy * dt;

      /**
       * Scenery first, then creatures -- the same order the spit uses.
       *
       * A bullet is stopped by a crate because a crate you can see in front of a fish should stop what you shoot at
       * it; it does NOT damage the obstacle, because the bullets are not ordnance. The charge and the spit are what
       * open scenery up, and a gun that quietly chipped it away would make both of them pointless.
       */
      const blocked = ctx.obstacles.blocks(b.x, b.y, radius);
      let spent = blocked;
      if (blocked) this.hits++;

      if (!spent) {
        for (const h of ctx.hazards.hazards) {
          // Not shootable, or already leaving: the round passes through rather than being eaten by it.
          if (h.maxHealth <= 0 || h.flee) continue;
          const reach = radius + ctx.laneWidth * h.radiusFraction;
          const dx = h.x - b.x;
          const dy = h.y - b.y;
          if (dx * dx + dy * dy > reach * reach) continue;
          // The hit is applied through the hazard field, which owns what it means to be driven off.
          const outcome = ctx.hazards.hit(h, cfg.damage);
          this.hits++;
          landed++;
          if (outcome === 'fled') {
            drivenOff++;
            driven.push({ x: h.x, y: h.y });
          }
          spent = true;
          break;
        }
      }

      // Recycle: it hit something, ran out of range, or left the working band.
      if (spent || b.age >= cfg.lifeSeconds || b.y < ctx.min - 60 || b.y > ctx.max + 120) {
        this.bullets.splice(i, 1);
      }
    }

    return { hits: landed, drivenOff, fired, driven };
  }

  private spawn(ctx: BulletContext): void {
    const cfg = mech.bullets;
    /**
     * One round per muzzle, every tick.
     *
     * Simultaneous rather than alternating: an upgrade that fired the same number of rounds from two places would be
     * a WIDER gun, and this is meant to be a stronger one. The caller decides how many muzzles there are.
     */
    for (const muzzle of ctx.muzzles) {
      this.bullets.push({
        x: muzzle.x,
        y: muzzle.y,
        vy: ctx.laneWidth * cfg.speedPerSecond,
        age: 0,
      });
      this.fired++;
    }
  }
}

/**
 * Draw every round in flight.
 *
 * In world metres, like the hazards and the obstacles, so the camera transform does the rest. A round fades as it
 * ages, which says "this one is about to expire" without a HUD and stops a long burst from reading as a solid line
 * of water.
 */
export function paintBullets(g: Graphics, field: BulletField, laneWidth: number): void {
  const cfg = mech.bullets;
  const r = laneWidth * cfg.radiusRatio;
  for (const b of field.bullets) {
    const fade = Math.max(0.18, 1 - b.age / cfg.lifeSeconds);
    g.circle(b.x, b.y, r).fill({ color: cfg.colour, alpha: cfg.alpha * fade });
    g.circle(b.x, b.y, r).stroke({ color: cfg.rimColour, alpha: cfg.rimAlpha * fade, width: Math.max(1, r * 0.45) });
  }
}




