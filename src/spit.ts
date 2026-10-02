import { mech } from './mechanisms';
import type { HazardKind } from './hazards';

/**
 * The stomach: what you swallowed is your ammunition, and your next rank.
 *
 * ---------------------------------------------------------------------------------------------
 * THE IDEA
 * ---------------------------------------------------------------------------------------------
 * Swallowing a hazard does not destroy it. It goes into a stomach, and it can leave again in one of two ways --
 * which gives eating a SECOND purpose beyond growth, and makes the design's "极限瘦身" possible: empty the
 * stomach, drop a chunk of volume, and squeeze through a gap that was previously too narrow.
 *
 *   SPIT     instant, and the item becomes AMMUNITION. It keeps its own properties: a crab is a heavy impact, a
 *            jellyfish carries its slow, a trash bag sticks. What you have swallowed decides what you are holding,
 *            so the player's own history becomes their loadout -- and the reversal pays off twice, because the
 *            crab that used to launch you is now a missile.
 *
 *   DIGEST   slow, and the item becomes RANK. The mass comes back out of the bubble a slice at a time and turns
 *            into "I can eat bigger things than my size says I can". This is the only exit that turns the
 *            inventory into a GAIN rather than into a different kind of stock, and it is deliberately the one
 *            that costs: while compressing, suction is unavailable and hits hurt more.
 *
 * Leaving it alone is the third answer, and the over-eating fuse is what makes it a losing one.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT ALL THREE EXITS SHARE
 * ---------------------------------------------------------------------------------------------
 * One ledger. An item records the volume it ADDED when it was swallowed, and every exit subtracts exactly that,
 * in whole (spitting) or in proportion to progress (digesting). That is why there is no "digest shrink" number in
 * the config and no way to gain mass by eating and spitting in a loop. See `StomachItem`.
 */

/**
 * A swallowed hazard waiting to be spat back out or digested.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY AN ITEM REMEMBERS ITS OWN MASS
 * ---------------------------------------------------------------------------------------------
 * Swallowing something adds its mass to the bubble's volume, so getting rid of it has to take that mass back.
 * Recording it HERE, at the moment of swallowing, rather than recomputing `massFromEating(kind)` on the way out,
 * is what makes the two exits agree: the number that leaves is the number that arrived, even if the config's
 * `consumption.mass` is edited mid-run, and even when eating was CLAMPED by `volume.max` and the item therefore
 * added less than its nominal mass.
 *
 * The alternative -- each exit computing what it thinks it should remove -- is how a bubble ends up gaining mass
 * by eating and spitting in a loop.
 */
export interface StomachItem {
  kind: HazardKind;
  /** Seconds it has been inside, for a "freshest first" ordering and for probes. */
  age: number;
  /**
   * The volume this item ADDED to the bubble when it was swallowed.
   *
   * Zero is a legitimate value (swallowing at the volume ceiling adds nothing) and is not an error.
   */
  mass: number;
  /** How far through digestion, 0..1. The volume drain and the growth energy both follow this one number. */
  digest: number;
}

/**
 * What one tick of the stomach did.
 *
 * Returned rather than acted on, because bursting belongs to the game and so does the volume: the stomach knows
 * what left it, the game knows what that means for a bubble.
 */
export interface StomachTick {
  /** The over-eating fuse burned out: the bubble should burst. */
  burst: boolean;
  /**
   * Volume the digestion has released this frame, for the caller to subtract.
   *
   * A FRACTION of an item's mass, not a whole one, because digestion is continuous -- and it is the only number
   * the caller needs for the shrink, since there is no separate "digest shrink rate" anywhere in the config.
   *
   * The caller applies it, and applies its own floor, because the volume belongs to the bubble: `drainByDigesting`
   * refuses to let digesting kill the player, which can mean less leaves than this figure asked for. The caller
   * must therefore credit growth energy against what ACTUALLY left, or a bubble parked one hit from death could
   * farm rank for free.
   */
  drained: number;
  /** Items that finished digesting this frame, or null when none did. Allocated only on the interesting frame. */
  completed: StomachItem[] | null;
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
 * The only way to put the fuse out is to make room, and swallowing is already blocked at capacity, so the player
 * cannot eat their way out of having eaten too much. That closure is what makes over-eating a CRISIS rather than
 * a death sentence: there is a real thing to do, and a limited time to do it in.
 *
 * There are now TWO ways to make room, and they are the two halves of the stomach's design:
 *
 *   SPIT     instant, hands you ammunition, and gives the mass straight back
 *   DIGEST   slower, hands you eating RANK, and gives the mass back a slice at a time
 *
 * Deliberately not a hard failure: a penalty with no answer is just death. A penalty with an answer is a
 * decision -- and with two answers that cost different things, it is a decision worth making.
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
   * How far through digesting the OLDEST item is, 0..1, or 0 when the stomach is empty.
   *
   * Only the oldest, because digestion is SEQUENTIAL: one item at a time, oldest first, the same order spitting
   * uses. Two orderings for two exits would mean the player could not predict which thing they are about to
   * spend, and "linear time to clear the stomach" is what makes the fuse arithmetic (capacity / rate) legible.
   */
  get digestProgress(): number {
    return this.items[0]?.digest ?? 0;
  }

  /**
   * The stomach's contribution to the bubble's bulge, in ITEM EQUIVALENTS.
   *
   * `size` with the item currently being digested counted only for what is left of it. That is what makes
   * digestion visible without a single new piece of UI: the bubble visibly DEFLATES as the mass leaves it, so
   * "my stomach is emptying" and "I am getting smaller" are the same picture. The drawing code and the capacity
   * rule therefore cannot disagree about how full the bubble looks.
   */
  get swell(): number {
    const oldest = this.items[0];
    return Math.max(0, this.items.length - (oldest ? oldest.digest : 0));
  }

  /** Everything inside, with its mass and progress, for probes. */
  get detail(): readonly { kind: HazardKind; mass: number; digest: number }[] {
    return this.items.map((i) => ({ kind: i.kind, mass: i.mass, digest: i.digest }));
  }

  /**
   * Take a hazard inside, if there is room.
   *
   * @param mass the volume this swallow ADDED to the bubble. Passed in rather than looked up, because only the
   *   caller knows the real figure: `growByAbsorbing` clamps at the volume ceiling, so an item swallowed at the
   *   cap added nothing and must give nothing back.
   * @return false when the stomach is full, so the caller can leave the hazard in the world instead of silently
   *   destroying it. Swallowing something and having it vanish with no effect would be the worst possible
   *   response to a full stomach.
   */
  swallow(kind: HazardKind, mass: number): boolean {
    if (this.full) return false;
    this.items.push({ kind, age: 0, mass: Math.max(0, mass), digest: 0 });
    if (this.full && this.fuseTotal > 0) this.fuse = this.fuseTotal;
    return true;
  }

  /** Remove and return the OLDEST item, or null when empty. */
  takeOldest(): StomachItem | null {
    const item = this.items.shift() ?? null;
    // Making room puts the fuse out. See the class comment: the escape has to be real.
    this.releaseFuseIfThereIsRoom();
    return item;
  }

  /**
   * Age everything, run the fuse, and digest the oldest item.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THE DIGEST RATE IS A PARAMETER
   * ---------------------------------------------------------------------------------------------
   * Holding the compress control and letting go are the same simulation with two rates, and the difference is a
   * decision the PLAYER makes -- so the stomach is told which one applies rather than reading the input. That
   * also keeps this class testable with no player and no input at all.
   *
   * @param dt seconds
   * @param digestPerSecond fraction of the oldest item digested per second (passive or compressed)
   */
  tick(dt: number, digestPerSecond: number): StomachTick {
    for (const item of this.items) item.age += dt;

    let drained = 0;
    let completed: StomachItem[] | null = null;
    /**
     * A BUDGET of item-fractions, not a rate applied to each item.
     *
     * It is what lets the frame that finishes an item carry the leftover into the next one, so the throughput is
     * the configured rate exactly rather than "one item per frame at most". At the shipped numbers a frame never
     * has budget for more than one item, but a config with a fast `compressPerSecond` and a capacity of ten would
     * otherwise digest at the frame rate instead of at the rate the owner typed.
     */
    let budget = Math.max(0, digestPerSecond) * dt;
    let guard = 0;
    while (budget > 1e-9 && this.items.length > 0 && guard++ < 64) {
      const item = this.items[0]!;
      const step = Math.min(1 - item.digest, budget);
      item.digest += step;
      budget -= step;
      // The mass leaves in proportion to the progress, so completing an item drains exactly what it added.
      drained += item.mass * step;
      if (item.digest >= 1 - 1e-9) {
        this.items.shift();
        (completed ??= []).push(item);
        this.releaseFuseIfThereIsRoom();
      }
    }

    // A stomach that became full without going through `swallow` -- a capacity reduction in the config, say --
    // still lights the fuse, so the rule cannot be bypassed by an edit. Checked AFTER digestion, so an item that
    // finished this frame really does buy the player the whole window back instead of one frame of it.
    if (this.full && this.fuse === null && this.fuseTotal > 0) this.fuse = this.fuseTotal;
    if (this.fuse === null) return { burst: false, drained, completed };
    this.fuse -= dt;
    return { burst: this.fuse <= 0, drained, completed };
  }

  /**
   * Put the fuse out when there is room again, for either exit.
   *
   * One place rather than one per exit: spitting and digesting make room for the same reason, and a second copy
   * of this rule is how a player who digested their way out of over-eating would keep burning anyway.
   */
  private releaseFuseIfThereIsRoom(): void {
    if (!this.full) this.fuse = null;
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
 * The bulge a stomach puts on the bubble, as a fraction of its radius.
 *
 * The drawing code uses this to deform the silhouette, which is how the player knows they are over capacity
 * without reading a number: the bubble visibly strains. Returned rather than drawn so the size and the shape
 * cannot disagree about how full the stomach is.
 *
 * @param itemCount item EQUIVALENTS, i.e. `Stomach.swell` rather than `Stomach.size` -- so the same function
 *   describes a full stomach and one that is halfway through emptying itself.
 */
export function stomachBulge(itemCount: number): number {
  const raw = Math.max(0, itemCount) * mech.spit.bulgePerItem;
  return Math.min(mech.spit.bulgeMax, raw);
}

/**
 * Growth energy a digested item of a given mass is worth.
 *
 * The single conversion from "how much stuff" to "how much rank", kept here beside the stomach so the drain and
 * the payout are visibly the two halves of one ledger.
 */
export function digestEnergy(mass: number): number {
  return Math.max(0, mass) * mech.digest.energyPerMass;
}

/**
 * The eating rank a pile of growth energy has bought, capped by the config.
 *
 * Capped rather than open-ended on purpose: without a ceiling, digesting enough would let a bubble of volume 1
 * eat the whole food chain, and "get big enough to eat that" would stop being the gate the ladder exists to be.
 */
export function tierBonusFor(energy: number): number {
  const perTier = Math.max(1e-6, mech.digest.energyPerTier);
  return Math.max(0, Math.min(mech.digest.maxTierBonus, Math.floor(energy / perTier)));
}

export const SPIT = mech.spit;
