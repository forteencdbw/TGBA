import { mech } from './mechanisms';
import type { HazardKind } from './hazards';

/**
 * Spitting: what you swallowed is also your ammunition.
 *
 * ---------------------------------------------------------------------------------------------
 * THE IDEA
 * ---------------------------------------------------------------------------------------------
 * Swallowing a hazard does not destroy it. It goes into a stomach, and it can be fired back out -- which gives
 * eating a SECOND purpose beyond growth, and makes the design's "极限瘦身" possible: empty the stomach, drop a
 * chunk of volume, and squeeze through a gap that was previously too narrow.
 *
 * A spat item KEEPS ITS OWN PROPERTIES. That is the whole pleasure of it: a crab is a heavy impact, a jellyfish
 * carries its slow, a trash bag sticks. What you have swallowed decides what ammunition you are holding, so the
 * player's own history becomes their loadout. It also makes the reversal from milestone 1 pay off twice -- the
 * crab that used to launch you is now a missile.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE STOMACH ARRIVES BEFORE THE CAPACITY SYSTEM
 * ---------------------------------------------------------------------------------------------
 * The design's stomach chapter also covers over-eating: visible bulging, slower turning, and a burst if the
 * capacity stays over its limit. None of that is here yet. Capacity currently means only "you cannot swallow
 * another one", which is the smallest version that makes spitting coherent -- and it keeps this milestone
 * testable rather than half-implementing two systems at once.
 */

/** A swallowed hazard waiting to be spat back out. */
export interface StomachItem {
  kind: HazardKind;
  /** Seconds it has been inside, for a future digestion system and for a "freshest first" ordering. */
  age: number;
}

/** A projectile in flight. */
export interface SpitProjectile {
  kind: HazardKind;
  x: number;
  y: number;
  /** Velocity in metres per second, in world space. */
  vx: number;
  vy: number;
  /** Screen y of the projectile, tracking the player's own vertical, since the player lives in screen space. */
  screenY: number;
  /** Drawn radius as a fraction of the lane width. */
  radiusFraction: number;
  /** Seconds in flight, for the trail and for the recycle cutoff. */
  age: number;
}

/**
 * The stomach: a small bounded queue of swallowed hazards.
 *
 * A class rather than a bare array so the capacity rule and the ordering live together -- "oldest first" is the
 * ordering the player will expect from a queue, and putting it anywhere else invites a second implementation.
 */
export class Stomach {
  private readonly items: StomachItem[] = [];

  reset(): void {
    this.items.length = 0;
  }

  get size(): number {
    return this.items.length;
  }

  get full(): boolean {
    return this.items.length >= mech.spit.capacity;
  }

  /** The kinds currently inside, oldest first. For the HUD and for probes. */
  get contents(): readonly HazardKind[] {
    return this.items.map((i) => i.kind);
  }

  /**
   * Take a hazard inside, if there is room.
   *
   * @return false when the stomach is full, so the caller can leave the hazard in the world instead of silently
   *   destroying it. Swallowing something and having it vanish with no effect would be the worst possible
   *   response to a full stomach.
   */
  swallow(kind: HazardKind): boolean {
    if (this.full) return false;
    this.items.push({ kind, age: 0 });
    return true;
  }

  /** Remove and return the OLDEST item, or null when empty. */
  takeOldest(): StomachItem | null {
    return this.items.shift() ?? null;
  }

  /** Age everything, so a future digestion system has the clock it needs. */
  tick(dt: number): void {
    for (const item of this.items) item.age += dt;
  }
}

/**
 * Launch direction for a spit, as a unit vector.
 *
 * Given as the player's steering direction, or straight up when they are not steering. Up is the right default
 * rather than an arbitrary one: the level is a vertical ascent, so "forward" is up, and a projectile fired up
 * travels into the water the player is about to enter -- where the targets are.
 *
 * Normalising here rather than at the call site means a weak steering deflection fires at FULL speed in that
 * direction, which is what a player expects from a discrete shot: the wheel aims it, it does not throttle it.
 */
export function spitDirection(steerX: number, steerY: number): { x: number; y: number } {
  const length = Math.hypot(steerX, steerY);
  if (length < 1e-6) return { x: 0, y: 1 };
  return { x: steerX / length, y: steerY / length };
}

/** A projectile's drawn radius, as a fraction of the lane width. */
export function spitRadiusFraction(kind: HazardKind): number {
  // Sized like the hazard it came from, so a spat crab still looks like a crab rather than a generic pellet.
  const perKind: Record<string, number> = { fish: 0.035, jelly: 0.062, trash: 0.05, crab: 0.045 };
  return perKind[kind] ?? 0.045;
}

/**
 * How hard a projectile shoves what it hits, as a multiplier on the base knockback.
 *
 * Per kind, because "the item keeps its own properties" is the point: the same shot should feel different
 * depending on what was swallowed. A crab is a battering ram, a jellyfish is a wet slap.
 */
export function spitImpact(kind: HazardKind): number {
  const perKind: Record<string, number> = { fish: 0.8, jelly: 0.6, trash: 0.9, crab: 1.6 };
  return perKind[kind] ?? 1;
}

export const SPIT = mech.spit;
