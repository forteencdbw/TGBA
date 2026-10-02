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
 * A class rather than a bare array so the capacity rule, the ordering and the over-eating fuse live together --
 * "oldest first" is the ordering the player will expect from a queue, and a second implementation elsewhere would
 * eventually disagree with this one.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FUSE, AND WHY THE ESCAPE ROUTE IS FREE
 * ---------------------------------------------------------------------------------------------
 * A full stomach lights a fuse. If it runs out, the bubble bursts.
 *
 * The only way to put the fuse out is to make room, and the only way to make room is to SPIT -- swallowing is
 * already blocked at capacity, so the player cannot eat their way out of having eaten too much. That closure is
 * what makes over-eating a CRISIS rather than a death sentence: there is a real thing to do, and a limited time
 * to do it in.
 *
 * Deliberately not a hard failure: a penalty with no answer is just death. A penalty with an answer is a
 * decision.
 */
export class Stomach {
  private readonly items: StomachItem[] = [];
  /**
   * Seconds left on the fuse while full, or null when the stomach is not full.
   *
   * Reset the moment there is room again, so spitting a single item buys the whole window back rather than
   * leaving the player on a nearly-expired fuse for the rest of the run.
   */
  private fuse: number | null = null;
  /**
   * The fuse's full duration, read LIVE from the config.
   *
   * A getter, not a cached field. Caching it in a field initialiser looks harmless and is a real bug: the value is
   * captured once when the object is constructed, so editing `overloadFuseSeconds` at runtime -- which is the
   * entire point of a hand-editable config, and how a test shortens the fuse without sleeping for five seconds --
   * would silently keep using the old number. Every other tuning value in this project is a live read; this one
   * has to be too.
   */
  private get fuseTotal(): number {
    return mech.spit.overloadFuseSeconds;
  }

  reset(): void {
    this.items.length = 0;
    this.fuse = null;
  }

  get size(): number {
    return this.items.length;
  }

  get full(): boolean {
    return this.items.length >= mech.spit.capacity;
  }

  /** Whether the fuse is lit. */
  get overloaded(): boolean {
    return this.fuse !== null;
  }

  /** Seconds left before a burst, or null when not overloaded. */
  get fuseRemaining(): number | null {
    return this.fuse;
  }

  /** 0..1, how far through the fuse: 1 at the instant it lights, 0 as it runs out. */
  get fuseFraction(): number {
    if (this.fuse === null || this.fuseTotal <= 0) return 0;
    return Math.max(0, Math.min(1, this.fuse / this.fuseTotal));
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
    if (this.full && this.fuseTotal > 0) this.fuse = this.fuseTotal;
    return true;
  }

  /** Remove and return the OLDEST item, or null when empty. */
  takeOldest(): StomachItem | null {
    const item = this.items.shift() ?? null;
    // Making room puts the fuse out. See the class comment: the escape has to be real.
    if (!this.full) this.fuse = null;
    return item;
  }

  /**
   * Age everything and run the fuse.
   *
   * @return true when the fuse has burned out and the bubble should burst. Returned rather than acted on here
   *   because bursting belongs to the game, not to a stomach.
   */
  tick(dt: number): boolean {
    for (const item of this.items) item.age += dt;
    // A stomach that became full without going through `swallow` -- a capacity reduction in the config, say --
    // still lights the fuse, so the rule cannot be bypassed by an edit.
    if (this.full && this.fuse === null && this.fuseTotal > 0) this.fuse = this.fuseTotal;
    if (this.fuse === null) return false;
    this.fuse -= dt;
    return this.fuse <= 0;
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

/**
 * The bulge an over-full stomach puts on the bubble, as a fraction of its radius.
 *
 * The drawing code uses this to deform the silhouette, which is how the player knows they are over capacity
 * without reading a number: the bubble visibly strains. Returned rather than drawn so the size and the shape
 * cannot disagree about how full the stomach is.
 */
export function stomachBulge(itemCount: number): number {
  const raw = itemCount * mech.spit.bulgePerItem;
  return Math.min(mech.spit.bulgeMax, raw);
}

export const SPIT = mech.spit;
