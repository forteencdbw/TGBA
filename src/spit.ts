import { mech } from './mechanisms';
import { KIND_TUNING, NO_STOMACH_EFFECT, type HazardKind, type StomachEffect } from './hazards';

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
  /**
   * What it does from inside, captured when it was swallowed.
   *
   * Stored as DATA rather than looked up per frame, so this class never has to know that urchins or bomb fish
   * exist: it applies the generic rules ("this many hit points per second", "this long until it goes off") and
   * `src/hazards.ts` decides which creature those numbers belong to. See `StomachEffect`.
   */
  effect: StomachEffect;
  /**
   * Seconds left on its internal fuse, or 0 for something that does not have one.
   *
   * Per ITEM, which is the whole reason the stomach grew per-item state: two bomb fish swallowed a second apart
   * are two separate countdowns, and a single stomach-wide timer could not say when the first one goes off.
   */
  fuse: number;
  /**
   * Seconds until this item shocks the player again, or 0 for something that never does.
   *
   * Counts DOWN from the period and resets when it fires, so the first shock arrives one period after swallowing
   * rather than instantly -- which is what makes the eel something the player can feel coming and act on.
   */
  shockTimer: number;
}

/**
 * What came of trying to spit.
 *
 * A union rather than `StomachItem | null`, because "there was nothing in there" and "there is something in there
 * and it will not come out" are completely different things to tell the player, and a nullable return cannot say
 * which one happened. The second is the oil slick's entire verb, and collapsing it into a null would make it
 * indistinguishable from an empty stomach -- the one case where a player would conclude the button is broken.
 */
export type SpitAttempt =
  | { outcome: 'fired'; item: StomachItem }
  | { outcome: 'empty' }
  | { outcome: 'clogged' };

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
  /**
   * Volume destroyed inside by a detonation this frame.
   *
   * Kept apart from `drained` because it buys NOTHING: digested mass pays for eating rank, and mass blown up in
   * your own stomach is simply gone. Folding the two together would quietly turn a bomb fish into a way to convert
   * food into rank without paying for it.
   */
  destroyed: number;
  /**
   * Internal harm this frame, in hit points, as a fraction.
   *
   * Fractional because both sources are continuous: an urchin bleeds you per second. A detonation adds whole hit
   * points to the same figure, which the caller's accumulator turns into hits the same way -- one channel rather
   * than two, so a frame that both bleeds and explodes cannot apply one and drop the other.
   */
  damage: number;
  /** Items that finished digesting this frame, or null when none did. Allocated only on the interesting frame. */
  completed: StomachItem[] | null;
  /** Items that went off inside this frame, so the caller can make it loud. */
  detonations: StomachItem[] | null;
  /**
   * Seconds of LOST CONTROL the contents asked for this frame.
   *
   * The eel's whole verb, and the only thing in this game that takes the controls away. Reported as a duration
   * rather than a flag so the caller can extend an effect that is already running rather than restarting it, and so
   * two eels shocking at once cannot cut each other short.
   */
  shocks: number;
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

  /** Everything inside, with its mass, progress, fuse and shock timer, for probes and for the rim markers. */
  get detail(): readonly { kind: HazardKind; mass: number; digest: number; fuse: number; shockTimer: number }[] {
    return this.items.map((i) => ({ kind: i.kind, mass: i.mass, digest: i.digest, fuse: i.fuse, shockTimer: i.shockTimer }));
  }

  /**
   * What the contents multiply the digestion rate by: the WORST item in there, not the product of all of them.
   *
   * The minimum rather than a product, because a product compounds: two rotting things at 0.35 would give 0.12,
   * which is not "twice as bad" in any sense a player could predict, and three would be indistinguishable from a
   * stopped stomach. "The worst thing in your stomach sets the pace" is a sentence someone can act on.
   */
  get digestScale(): number {
    let scale = 1;
    for (const item of this.items) scale = Math.min(scale, item.effect.digestScale);
    return scale;
  }

  /**
   * The shortest internal fuse, or null when nothing inside is counting down.
   *
   * Exposed because it is what the player has to act on, and because a probe asserting "the fuse is burning" should
   * read the fact rather than infer it from a drawing.
   */
  get shortestFuse(): number | null {
    let best: number | null = null;
    for (const item of this.items) {
      if (item.effect.fuseSeconds <= 0) continue;
      best = best === null ? item.fuse : Math.min(best, item.fuse);
    }
    return best;
  }

  /**
   * Take a hazard inside, if there is room.
   *
   * @param mass the volume this swallow ADDED to the bubble. Passed in rather than looked up, because only the
   *   caller knows the real figure: `growByAbsorbing` clamps at the volume ceiling, so an item swallowed at the
   *   cap added nothing and must give nothing back.
   * @param effect what it will do from inside. Defaults to nothing, which is right for most of the food chain.
   * @return false when the stomach is full, so the caller can leave the hazard in the world instead of silently
   *   destroying it. Swallowing something and having it vanish with no effect would be the worst possible
   *   response to a full stomach.
   */
  swallow(kind: HazardKind, mass: number, effect: StomachEffect = NO_STOMACH_EFFECT): boolean {
    if (this.full) return false;
    /**
     * The fuse starts NOW, not when the creature spawned.
     *
     * It is a fuse on being EATEN -- the thing is thrashing around inside you -- so a bomb fish that has been
     * drifting down the screen for twenty seconds arrives with its full time, exactly as a crab's launch fuse
     * arms on proximity rather than on spawn. Starting it earlier would make the countdown depend on how long the
     * player took to reach the creature, which is not something they can see or plan around.
     *
     * The eel's shock timer starts at a FULL period for the same reason, so the first shock is one period after the
     * bite rather than on it: a side effect that fires on the frame you swallow is not something you can react to.
     */
    this.items.push({
      kind,
      age: 0,
      mass: Math.max(0, mass),
      digest: 0,
      effect,
      fuse: effect.fuseSeconds,
      shockTimer: effect.shockPeriodSeconds,
    });
    if (this.full && this.fuseTotal > 0) this.fuse = this.fuseTotal;
    return true;
  }

  /**
   * Try to spit the oldest thing out.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS CAN REFUSE
   * ---------------------------------------------------------------------------------------------
   * Every other exit in this game is deterministic, and this one is not, on purpose: "占据容量且难以排出" cannot be
   * said by a mechanic that always works. The roll is PER ATTEMPT, so a low `spitChance` is not "it never comes
   * out" -- it is "you will spend presses, and the over-eating fuse does not care".
   *
   * Only the OLDEST item is ever attempted, which is what makes a clog a real problem: something stuck at the
   * front of the queue blocks everything behind it, so the answer is not "spit the others instead" but "get this
   * one loose, or digest it away".
   */
  attemptSpit(): SpitAttempt {
    const item = this.items[0];
    if (!item) return { outcome: 'empty' };
    if (Math.random() >= Math.max(0, Math.min(1, item.effect.spitChance))) return { outcome: 'clogged' };

    this.items.shift();
    // Making room puts the fuse out. See the class comment: the escape has to be real.
    this.releaseFuseIfThereIsRoom();
    return { outcome: 'fired', item };
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
    let destroyed = 0;
    let damage = 0;
    let shocks = 0;
    let completed: StomachItem[] | null = null;
    let detonations: StomachItem[] | null = null;

    /**
     * EVERYTHING inside acts, not just the oldest item -- and it acts BEFORE the digestion below.
     *
     * That ordering matters for one frame's worth of honesty: an item that goes off must not also be digested on
     * the same tick, or the player would be paid for the mouthful that just exploded. Iterated backwards because
     * detonating items are removed here.
     */
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]!;
      damage += item.effect.damagePerSecond * dt;

      /**
       * The eel: a shock every period, counted per item.
       *
       * Reset to the period rather than to zero, so the shocks keep coming at a steady rate for as long as the eel
       * is inside. The reported duration is the shock LENGTH, and the caller is expected to extend rather than
       * replace an effect that is already running -- two eels must not be able to shorten each other.
       */
      if (item.effect.shockSeconds > 0 && item.effect.shockPeriodSeconds > 0) {
        item.shockTimer -= dt;
        if (item.shockTimer <= 0) {
          item.shockTimer += item.effect.shockPeriodSeconds;
          shocks = Math.max(shocks, item.effect.shockSeconds);
        }
      }

      if (item.effect.fuseSeconds <= 0) continue;
      item.fuse -= dt;
      if (item.fuse > 0) continue;

      this.items.splice(i, 1);
      (detonations ??= []).push(item);
      /**
       * The blast destroys what is left of it, and that mass buys NOTHING.
       *
       * The alternative -- leaving the volume in the bubble because "it was already eaten" -- would make the bomb's
       * cost purely the hit, and it would leave the ledger saying a bubble contains mass that was just blown up.
       * Reported as `destroyed` rather than `drained` precisely so the caller cannot pay growth energy for it.
       */
      destroyed += item.mass * (1 - item.digest);
      damage += item.effect.detonationHitPoints;
      this.releaseFuseIfThereIsRoom();
    }

    /**
     * A BUDGET of item-fractions, not a rate applied to each item.
     *
     * It is what lets the frame that finishes an item carry the leftover into the next one, so the throughput is
     * the configured rate exactly rather than "one item per frame at most". At the shipped numbers a frame never
     * has budget for more than one item, but a config with a fast `compressPerSecond` and a capacity of ten would
     * otherwise digest at the frame rate instead of at the rate the owner typed.
     *
     * Reading `items[0]` fresh each pass is what makes this correct after a detonation removed the very item that
     * was being digested: the budget simply continues on whatever is now at the front.
     */
    let budget = Math.max(0, digestPerSecond) * this.digestScale * dt;
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
    if (this.fuse === null) return { burst: false, drained, destroyed, damage, shocks, completed, detonations };
    this.fuse -= dt;
    return { burst: this.fuse <= 0, drained, destroyed, damage, shocks, completed, detonations };
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
 * Normalising here rather than at the call site means a weak aim fires at FULL speed in that direction, which is
 * what a player expects from a discrete shot: the drag aims it, it does not throttle it.
 */
export function spitDirection(steerX: number, steerY: number): { x: number; y: number } {
  const length = Math.hypot(steerX, steerY);
  if (length < 1e-6) return { x: 0, y: 1 };
  return { x: steerX / length, y: steerY / length };
}

/**
 * A projectile's drawn radius, as a fraction of the lane width.
 *
 * Read from `KIND_TUNING` rather than kept as its own list: a spat item is drawn in the shape and size of the
 * hazard it was, so a second table here is a second answer to "how big is a crab" -- and the two would drift the
 * first time a creature was resized, which is a bug nobody would think to look for.
 */
export function spitRadiusFraction(kind: HazardKind): number {
  return KIND_TUNING[kind].radius;
}

/**
 * How hard a projectile shoves what it hits, as a multiplier on the base knockback.
 *
 * Per kind, because "the item keeps its own properties" is the point: the same shot should feel different
 * depending on what was swallowed. A crab is a battering ram, a jellyfish is a wet slap, an urchin is a spike.
 *
 * A TOTAL record rather than a lookup with a fallback, so adding a creature without deciding what it hits like is
 * a compile error instead of a silent default -- the same shape as `KIND_TUNING`.
 */
export function spitImpact(kind: HazardKind): number {
  const perKind: Record<HazardKind, number> = {
    fish: 0.8,
    jelly: 0.6,
    trash: 0.9,
    crab: 1.6,
    // Spiny: hard for its weight, and the reason an urchin is worth the bleeding.
    urchin: 1.2,
    // Heavy and blunt, on top of the blast it carries when it lands.
    bombfish: 1.3,
    // Still live, and it does not care that it is no longer in the water.
    eel: 1.1,
    // Wet and soft: the one round in the game that is worse than nothing much.
    rot: 0.5,
    // Heavy and smothering: a slick of oil is a good thing to throw at something.
    oil: 1.35,
    // Spitting a boss is not a thing that happens (it cannot be swallowed at all), but the table has every kind,
    // and a neutral number is the honest filler for an unreachable row.
    boss: 1,
    vent: 1,
    // 矿物颗粒轻得像沙子：扔出去几乎没有分量。
    mineral: 0.7,
    shrimp: 0.9,
    angler: 1.1,
    torpedo: 1.3,
    // 电击水母的弹药带着电：扔出去就是一颗会放电的手雷。
    zapper: 0.55,
  };
  return perKind[kind];
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



