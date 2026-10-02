/**
 * Hazards (D3).
 *
 * The design rule this file follows: each hazard has a different VERB, meaning it changes the
 * player's state in a way the others do not. Four creatures that all just dealt damage would be one
 * mechanic drawn four times; the point is that being caught by each one feels different.
 *
 *   fish     CHASES and swarms  -> contact damage, and it follows you
 *   jelly    SLOWS              -> a movement penalty with a timer
 *   trash    GRABS and drags    -> an ongoing drain you have to struggle out of
 *   crab     LAUNCHES           -> fires you upward along a telegraphed arc
 *
 * Everything is procedurally drawn from geometry, so colours carry the information instead of any
 * tutorial text: purple is a jellyfish, brown is a trash bag, and so on.
 *
 * Coordinate convention, shared with the rest of the project: world metres, y measured UP from the
 * seabed. Hazards travel DOWN like collectables, but always lag the player's ascent (they never
 * outrun it), so the player closes on them and can see them coming.
 */

import { Graphics } from 'pixi.js';
import { mech, tuning } from './config';
import { hazardMass } from './consumption';
import { pullSpeedFraction, suctionRadiusFraction } from './suction';
export type HazardKind = 'fish' | 'jelly' | 'trash' | 'crab';

/** What a hazard did to the player this frame, so the caller can react (HUD, audio, comedy). */
export interface HazardEffect {
  kind: HazardKind;
  /** Contact damage in hit-points. */
  damage?: number;
  /** Seconds of movement penalty to apply. */
  slowSeconds?: number;
  slowFactor?: number;
  /** Downward/upward world velocity to impose, in m/s. */
  impulse?: number;
  /** Ongoing drain, applied per second while the flag stays set. */
  drainPerSecond?: boolean;
  /** The player broke free / was launched / bounced it, which is a comedy beat. */
  broke: boolean;
  /**
   * Set when the player ATE this hazard rather than being hurt by it, and the id to remove.
   *
   * The reversal beat: the same overlap that used to cost a hit now yields mass. The mass itself is applied by
   * the caller, which owns the player's volume.
   */
  eaten?: { id: number };
}

/**
 * One hazard instance.
 *
 * `x` is in world metres across the lane (NOT a fraction, unlike the player) because hazards are
 * spawned at an absolute position and then move under their own rules.
 */
export interface Hazard {
  id: number;
  kind: HazardKind;
  x: number;
  y: number;
  /** Radius in metres of the lane, matching how collectables are measured relative to the player. */
  radiusFraction: number;
  /** Per-instance randomness so a group does not move in lockstep. */
  phase: number;
  seed: number;
  /** Fish: the bait bubble it is currently fooled by, if any. */
  baitedUntil: number;
  /** Jellyfish: how much it has been squashed, 0..1, purely comic. */
  squashed: number;
  /** Trash: whether it is latched onto the player, and how long it has held on. */
  gripping: boolean;
  gripSeconds: number;
  /** Crab: seconds until it fires, and whether it has fired. */
  fuse: number;
  fired: boolean;
  /**
   * Crab: whether the player is inside its launch reach, which is what arms it.
   *
   * The fuse cannot simply run down from spawn. A hazard takes roughly twenty seconds to drift from
   * the top of the screen to the player, so a 1.2s fuse would burn out long before arrival and the
   * telegraph -- the whole reason the crab is fair -- would never be seen. It arms on proximity
   * instead.
   */
  armed: boolean;
  /**
   * Fish: how many collectables it has swallowed.
   *
   * THE emergence counter. A fish that eats enough SPLITS into two, which is the only rule in the
   * game capable of exponential growth -- and it is what turns a talent's backlash into a real
   * consequence. See `hazardTuning.fishFeedToSplit` and the spec's emergence section.
   */
  fed: number;
  /** Fish: seconds left before it can eat again, so a split is not instantaneous. */
  digest: number;
}

/** Tunables for D3. Kept together because they are only meaningful as a set. */
/**
 * Hazard behaviour.
 *
 * Values marked "(config)" come from `config/mechanics.json5` and are the ones worth hand-tuning. The rest are
 * internal shape constants -- how wide a fish's bite is, how fast it turns -- where a hand-edit would be
 * guesswork rather than tuning. They live here so the file that uses them is also the file that documents them.
 */
export const hazardTuning = {
  /** Hazards on a screenful at the start, and the ceiling as the run goes on. */
  minActive: 2,
  maxActive: 5,
  /** Seconds between spawn attempts. */
  spawnEverySeconds: 7,
  /** Fish are faster than the player's base speed so they actually catch up. */
  fishSpeedFactor: 0.34,
  fishTurnRate: 0.9,
  /**
   * Chance a fish gives up the chase for a bait bubble it crosses.
   *
   * Well under half: this is a comedy beat that shows up occasionally, not the usual outcome. If a chase
   * usually ends with the fish wandering off, the swarm stops being a threat and the joke has eaten the
   * mechanic.
   */
  fishBaitChance: 0.25,
  fishBaitSeconds: 1.6,
  /** Jellyfish drift and bob; they barely move horizontally. */
  jellyBobAmplitude: 0.012,
  /** Trash falls slower than the water and grabs on contact. */
  trashSpeedFactor: 0.12,
  /**
   * Drain while a trash bag is attached, in hit-points per second. (config)
   *
   * Set so a FULL grip (`trashMinGripSeconds`) deals exactly one hit. These two are a PAIR and must be tuned
   * together: an earlier combination of a 0.5s grip with 1/6 per second could only ever accumulate 0.08 of a
   * hit, so the drain was mathematically incapable of landing and the whole mechanic was inert.
   */
  trashDrainPerSecond: mech.hazards.trashDrainPerSecond,
  trashStruggleRelease: 0.55,
  /**
   * Minimum seconds a trash bag holds on before struggling can tear it free. (config)
   *
   * Doubles as the drain window, which is why it is relatively long. "Struggling" is any deliberate movement
   * input, and a player who is dodging qualifies most of the time, so the grip needs a floor or it lasts a
   * single frame and is never felt.
   */
  trashMinGripSeconds: mech.hazards.trashMinGripSeconds,
  /**
   * The crab's telegraph fires when the player comes within this many metres above it. (config)
   *
   * Generous on purpose: it has to be visible while the player still has time to decide, and the crab is the
   * one hazard whose effect is arguably GOOD, so the player wants enough warning to aim at it.
   */
  crabArmDistanceMeters: mech.hazards.crabArmDistanceMeters,
  crabFuseSeconds: mech.hazards.crabFuseSeconds,
  crabLaunchMps: mech.hazards.crabLaunchMps,
  crabApexSeconds: 1.1,

  // --- Emergence (D5) -----------------------------------------------------
  /**
   * Collectables a fish must swallow before it splits in two. (config)
   *
   * Three, not one. At one, any fish that crosses a bubble doubles, and the population explodes from ambient
   * food alone -- the swarm would grow whether or not the player did anything, which removes the causality the
   * whole design rests on ("I got bigger, so the world got worse"). At three, a split is a consequence of a LOT
   * of food appearing, which in practice means the player's own talent backlash or a bait bubble.
   */
  fishFeedToSplit: mech.emergence.fishFeedToSplit,
  /** Seconds a fish spends digesting between meals. */
  fishDigestSeconds: 0.9,
  /**
   * The fish's base perception radius in metres, before the player's size is factored in. (config)
   *
   * Rule 2 of the emergence engine: perception GROWS WITH THE PLAYER'S VOLUME. It is what gives "getting bigger
   * is dangerous" a number instead of a feeling.
   */
  fishPerceptionBaseMeters: mech.emergence.fishPerceptionBaseMeters,
  /** Extra perception per unit of player volume above 1. (config) */
  fishPerceptionPerVolume: mech.emergence.fishPerceptionPerVolume,
  /**
   * HARD CAP on fish. (config)
   *
   * Exponential growth will brick a phone, so the population is capped and, past the cap, behaviour changes
   * rather than more entities being created. The guard is not an optimisation: without it the design's own
   * centrepiece is a crash.
   */
  fishHardCap: mech.emergence.fishHardCap,
  /**
   * Radius in metres a fish will snap up a collectable from.
   *
   * Notably LARGER than the fish itself: this is meant to read as the swarm hoovering up the food the player
   * was going to eat, which is the pressure that makes a bait bubble backfire.
   */
  fishBiteMeters: 34,
  /** How far a jellyfish or trash bag will drift toward the biggest nearby collectable. (config) */
  seekBiggestRangeMeters: mech.emergence.seekBiggestRangeMeters,
  seekBiggestPullPerSecond: 0.35,
};

/**
 * Per-kind presentation and collision size, as a fraction of the lane width.
 *
 * EXPORTED because a spat projectile is drawn in the shape and colour of the hazard it was, and copying the four
 * colours into the projectile code would let the two drift -- a fish that changes colour when thrown is a bug
 * nobody would think to look for. One source for "what a fish looks like".
 */
export const KIND_TUNING: Record<HazardKind, { radius: number; colour: number; spin: number }> = {
  fish: { radius: 0.035, colour: 0x9ad7ff, spin: 0 },
  jelly: { radius: 0.062, colour: 0xc79bff, spin: 0 },
  trash: { radius: 0.05, colour: 0xb08a5a, spin: 0.6 },
  crab: { radius: 0.045, colour: 0xff9b6b, spin: 0 },
};

export interface HazardContext {
  /** Visible world y range, so spawns appear just above the top of the screen. */
  min: number;
  max: number;
  laneWidth: number;
  /** The player, for chasing and contact tests. */
  playerX: number;
  playerY: number;
  playerRadiusFraction: number;
  /**
   * How fast the WORLD is moving past the player, in m/s: the level's scroll speed.
   *
   * This replaced the player's ascent speed as the reference for hazard motion. With free movement the
   * player may be stationary, so "how fast is this thing approaching me" is a property of the level, not
   * of the player. Hazard speeds are still expressed as fractions of it, so the approach rate stays
   * proportional however the level's pace is retuned.
   */
  descentSpeed: number;
  /** Seconds since the run started, for the bait timers. */
  elapsed: number;
  /** Whether the player is currently invulnerable, in which case contact must not re-trigger. */
  invulnerable: boolean;
  /**
   * True while the player is actively steering, which can tear off trash.
   *
   * Was "accelerating" when there was an accelerate control. The intuitive reading is unchanged -- fight
   * the bag and you get free -- but the trigger is now any deliberate movement input, which is more
   * legible than a speed threshold the player cannot see.
   */
  struggling: boolean;
  /**
   * The player's volume, which drives the fish's perception radius.
   *
   * Emergence rule 2: the swarm notices you from further away the bigger you get. This is the
   * quantifiable carrier of "getting bigger is dangerous".
   */
  playerVolume: number;
  /**
   * Whether the player is currently big enough to EAT this kind of hazard.
   *
   * A function rather than a size comparison, so the rule lives in exactly one place (`src/consumption.ts`) and
   * the collision resolution cannot drift from the outline marker. If those two ever disagreed, the marker would
   * promise food and the collision would deliver a hit -- the worst bug this feature could have, because it
   * punishes the player for trusting what they were shown.
   */
  canEat: (kind: HazardKind) => boolean;
  /**
   * Whether there is ROOM to swallow this hazard.
   *
   * Asked separately from `canEat` because the two can disagree: a big enough bubble can eat a crab it has no
   * room left for. When that happens the hazard must fall through to its normal damage path rather than vanish --
   * a creature that disappears with no effect reads as the game having lost it.
   */
  canSwallow: () => boolean;
  /**
   * The suction field, or null when it is not up.
   *
   * Hazards are pulled by it exactly like collectables, and that is deliberate: a field that spared the dangerous
   * things would remove the entire risk of using it. Dragging a crab you cannot eat toward yourself has to be
   * possible, or "when do I hold this" is not a decision.
   */
  suction: { x: number; y: number } | null;
  /**
   * The collectables, so fish can eat them and jellies can seek the biggest one.
   *
   * Passed in rather than owned: hazards do not manage the bubble field, but two of the emergence
   * rules are about hazards INTERACTING with it.
   */
  bubbles: readonly { id: number; x: number; y: number; radius: number; volume: number }[];
  /** Collectables swallowed this frame, by id, so the caller can remove them. */
  eatenBubbleIds: number[];
  /** How many fish split this frame, so the caller can react. */
  splitCount: number;
}

/**
 * The hazard field: spawning, per-kind motion, and contact resolution.
 *
 * Kept separate from `EntityField` because the rules have almost nothing in common -- collectables
 * are passive and drift on their own, hazards are active, have state machines, and act on the player.
 * Merging them would have produced one class where half the methods apply to half the members.
 */
export class HazardField {
  hazards: Hazard[] = [];

  /**
   * Whether the fish bait reaction is active.
   *
   * Exposed so a probe can assert the CHASE deterministically: the bait beat is a chance by design,
   * and a test that has to roll the dice reads as a broken mechanic when it loses.
   */
  baitEnabled = true;

  /**
   * How many times a trash bag has latched on this run, and how many times a fish has been baited.
   *
   * Counted because both are transient: a grip can be torn off in the same frame it starts, so
   * sampling a boolean afterwards proves nothing. These are monotonic, so "did it ever happen" is
   * answerable.
   */
  grabs = 0;
  baits = 0;
  /**
   * Hazards EATEN, monotonic for the same reason as the others.
   *
   * The counter is how a test proves the reversal happened at all: the hazard is removed from the list on the
   * frame it is eaten, so sampling "is it still there" afterwards proves nothing.
   */
  eaten = 0;

  private nextId = 1;
  private spawnTimer = 0;

  reset(): void {
    this.hazards = [];
    this.spawnTimer = 0;
    this.grabs = 0;
    this.baits = 0;
    this.eaten = 0;
    this.splits = 0;
    this.bubblesEaten = 0;
  }

  /** Emergence counters, monotonic so "did it ever happen" is answerable. */
  splits = 0;
  bubblesEaten = 0;

  /**
   * The fish's perception radius in metres, which grows with the player's volume.
   *
   * Emergence rule 2, and the reason "getting bigger is dangerous" is a mechanic rather than a
   * feeling. Exposed as its own method so a probe can assert the growth directly instead of inferring
   * it from whether a fish happened to notice.
   */
  perceptionRadius(playerVolume: number): number {
    const over = Math.max(0, playerVolume - 1);
    return hazardTuning.fishPerceptionBaseMeters + over * hazardTuning.fishPerceptionPerVolume;
  }

  /**
   * Whether the field may generate hazards on its own.
   *
   * FALSE for a level, and that is the whole point of the refactor: content comes from the level's
   * timeline, so anything this spawner adds is content nobody authored. It was the old "keep a
   * population topped up" model, and leaving it on meant a level's carefully placed hazards were joined
   * by a steady stream of random ones -- which also made the level impossible to END, because the win
   * condition is "the scroll is done and the water is clear".
   *
   * Kept as a flag rather than deleted because a future endless mode is exactly the thing it does.
   */
  autoSpawn = false;

  update(dt: number, ctx: HazardContext): HazardEffect[] {
    const effects: HazardEffect[] = [];
    ctx.eatenBubbleIds = [];
    ctx.splitCount = 0;

    if (this.autoSpawn) {
      this.spawnTimer -= dt;
      const ceiling = Math.min(hazardTuning.maxActive, hazardTuning.minActive + Math.floor(ctx.elapsed / 25));
      if (this.spawnTimer <= 0) {
        this.spawnTimer = hazardTuning.spawnEverySeconds;
        if (this.hazards.length < ceiling) {
          this.hazards.push(this.spawn(ctx));
        }
      }
    }

    /**
     * The suction pull runs BEFORE the per-kind motion, so a hazard's own behaviour starts from where the field
     * moved it. A fish that is being dragged in still swims; it just swims from closer.
     */
    if (ctx.suction) this.applySuction(dt, ctx);

    for (const h of this.hazards) {
      this.advance(h, dt, ctx);
    }

    // Emergence, in order: fish eat (which may split them), then the seeking hazards pick a target.
    // Eating runs first so a split this frame produces a fish that seeks NEXT frame rather than
    // teleporting a fish that has not been born yet.
    this.resolveFishFeeding(ctx);
    this.resolveSeeking(dt, ctx);

    // Contact. Resolved after movement so a hazard that arrives this frame still lands.
    const playerR = ctx.laneWidth * ctx.playerRadiusFraction;
    for (const h of this.hazards) {
      const r = ctx.laneWidth * h.radiusFraction;
      const dx = h.x - ctx.playerX;
      const dy = h.y - ctx.playerY;
      const reach = playerR + r;
      const touching = dx * dx + dy * dy <= reach * reach;

      if (!touching) {
        if (h.kind === 'trash' && h.gripping) {
          // Sliding off the edge of a trash bag ends the grip, which is the forgiving case.
          h.gripping = false;
        }
        continue;
      }

      /**
       * THE REVERSAL, checked BEFORE any per-kind behaviour.
       *
       * This ordering is the mechanic. Every case below is "the hazard hurts you"; if the player is big enough and
       * has room, none of them happen and the same overlap yields mass instead. Putting the check first means
       * there is no way to add a new hazard whose damage path accidentally bypasses its edibility, and it means
       * the marker and the collision ask the identical question.
       *
       * `canSwallow` is the capacity half. A full stomach falls through to the damage path, because a creature
       * that silently disappears is worse than one that still bites.
       *
       * The hazard is removed rather than merely flagged: it is inside the bubble now.
       */
      if (ctx.canEat(h.kind) && ctx.canSwallow()) {
        this.eaten++;
        effects.push({ kind: h.kind, broke: true, eaten: { id: h.id } });
        continue;
      }

      switch (h.kind) {
        case 'fish': {
          // COMEDY: a fish that crosses a bait bubble gets distracted and loses the player. This is an
          // OCCASIONAL beat, not the default outcome -- if a chase usually ends in the fish wandering
          // off, the swarm stops being a threat and the joke replaces the mechanic.
          if (this.baitEnabled && h.baitedUntil <= ctx.elapsed && Math.random() < hazardTuning.fishBaitChance) {
            h.baitedUntil = ctx.elapsed + hazardTuning.fishBaitSeconds;
            this.baits++;
            effects.push({ kind: 'fish', broke: true });
            break;
          }
          if (ctx.invulnerable || h.baitedUntil > ctx.elapsed) break;
          effects.push({ kind: 'fish', damage: 1, broke: false });
          // Bounce it away so one fish cannot immediately re-hit.
          h.y -= r * 2;
          break;
        }
        case 'jelly': {
          if (ctx.invulnerable) break;
          effects.push({ kind: 'jelly', slowSeconds: tuning.hazardSlowSeconds, slowFactor: tuning.hazardSlowFactor, broke: false });
          // COMEDY: being bunted squashes it.
          h.squashed = 1;
          h.y -= r * 1.5;
          break;
        }
        case 'trash': {
          if (!h.gripping) {
            h.gripping = true;
            this.grabs++;
            effects.push({ kind: 'trash', broke: false });
          }
          break;
        }
        case 'crab': {
          if (h.fired) break;
          // Only fires once it has actually armed and the telegraph has run. Touching an UNARMED crab
          // does nothing, which is what keeps the arc meaningful.
          if (!h.armed || h.fuse > 0) break;
          effects.push({ kind: 'crab', impulse: hazardTuning.crabLaunchMps, broke: true });
          h.fired = true;
          break;
        }
      }
    }

    // A latched trash bag drains continuously, and struggling tears it off.
    for (const h of this.hazards) {
      if (h.kind !== 'trash' || !h.gripping) continue;
      // A minimum hold, because "struggling" is true for any player who is accelerating -- which at
      // this game's speed is most of the time. Without a floor the grip lasted a single frame and the
      // drain never landed a hit, so the trash bag's whole verb was invisible at 13 m/s even though
      // it worked at 1.7. The floor is what makes it a grab rather than a touch.
      h.gripSeconds += dt;
      effects.push({ kind: 'trash', drainPerSecond: true, broke: false });
      if (ctx.struggling && h.gripSeconds >= hazardTuning.trashMinGripSeconds) {
        h.gripping = false;
        h.gripSeconds = 0;
        h.fired = true; // reused as "it popped"
        effects.push({ kind: 'trash', broke: true });
      }
    }

    /**
     * Retire what has left the working area, plus a trash bag that has been torn open, plus anything EATEN.
     *
     * `eaten` is a set rather than a flag on the hazard because the effects list is the only channel back to the
     * caller, and a hazard inside the bubble must not exist next frame to hit the player again on the way past.
     */
    const eatenIds = new Set(effects.filter((e) => e.eaten).map((e) => e.eaten!.id));
    this.hazards = this.hazards.filter((h) => {
      if (eatenIds.has(h.id)) return false;
      const inside = h.y > ctx.min - 80 && h.y < ctx.max + 120;
      // `fired` is reused per kind: for trash it means "torn open", for a crab "already launched".
      // Neither should linger.
      const spent = h.fired && (h.kind === 'trash' || h.kind === 'crab');
      return inside && !spent;
    });

    return effects;
  }

  /**
   * Pull hazards toward the player.
   *
   * The same shape as the collectable pull, and for the same reason: `x`/`y` are this module's to move, and a
   * pull written into a velocity would be re-derived by the per-kind motion on the same frame.
   *
   * A hazard's mass comes from the consumption table, so "how hard is this to drag" is the same fact as "how
   * much is it worth" -- one number per creature rather than two that can disagree.
   */
  private applySuction(dt: number, ctx: HazardContext): void {
    const at = ctx.suction;
    if (!at) return;
    const radius = ctx.laneWidth * suctionRadiusFraction(ctx.playerVolume);
    if (radius <= 0) return;
    const radiusSq = radius * radius;

    for (const h of this.hazards) {
      const dx = at.x - h.x;
      const dy = at.y - h.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > radiusSq || distSq < 1e-6) continue;

      const dist = Math.sqrt(distSq);
      /**
       * A crab mid-telegraph and a trash bag that is already gripping are exempt.
       *
       * Both are in the middle of doing something the player has already committed to or been warned about;
       * dragging them around would make the crab's arm-and-fire sequence unreadable and could yank a bag off the
       * player it just latched onto, which is the one moment the bag's own mechanic is supposed to resolve.
       */
      if (h.kind === 'trash' && h.gripping) continue;
      if (h.kind === 'crab' && h.armed) continue;

      const speed = ctx.laneWidth * pullSpeedFraction(hazardMass(h.kind), ctx.playerVolume);
      const step = Math.min(speed * dt, dist);
      h.x += (dx / dist) * step;
      h.y += (dy / dist) * step;
    }
  }

  /**
   * Emergence rule 1: a fish that eats enough collectables SPLITS in two.
   *
   * The only rule in the game capable of exponential growth, and therefore the only one that can turn
   * a talent's backlash into an avalanche: the fart that saves you leaves bait, the bait feeds the
   * fish, the fish multiply, and the swarm you fled is twice the size.
   *
   * Splitting is capped. Past `fishHardCap` the population stops growing entirely -- the guard has to
   * be here, at the source, because this is the only place entities are created outside the spawn
   * timer.
   */
  private resolveFishFeeding(ctx: HazardContext): void {
    const bite = hazardTuning.fishBiteMeters;
    const newborns: Hazard[] = [];

    for (const h of this.hazards) {
      if (h.kind !== 'fish') continue;
      h.digest = Math.max(0, h.digest - 1 / 60);
      if (h.digest > 0) continue;

      for (const b of ctx.bubbles) {
        // Already claimed by another fish this frame.
        if (ctx.eatenBubbleIds.includes(b.id)) continue;
        if (Math.hypot(b.x - h.x, b.y - h.y) > bite) continue;

        ctx.eatenBubbleIds.push(b.id);
        h.fed++;
        h.digest = hazardTuning.fishDigestSeconds;
        this.bubblesEaten++;

        if (h.fed >= hazardTuning.fishFeedToSplit && this.hazards.length + newborns.length < hazardTuning.fishHardCap) {
          h.fed = 0;
          this.splits++;
          ctx.splitCount++;
          // The child appears alongside, slightly smaller, so a split reads as a swarm thickening
          // rather than as one fish becoming two identical fish in place.
          newborns.push({
            ...h,
            id: this.nextId++,
            x: Math.max(0, Math.min(ctx.laneWidth, h.x + (Math.random() - 0.5) * ctx.laneWidth * 0.2)),
            y: h.y + 14,
            radiusFraction: h.radiusFraction * 0.88,
            phase: Math.random() * Math.PI * 2,
            seed: Math.random() * 1000,
            baitedUntil: 0,
            fed: 0,
            digest: hazardTuning.fishDigestSeconds,
          });
        }
        break;
      }
    }

    this.hazards.push(...newborns);
  }

  /**
   * Emergence rule 3: jellyfish and trash bags drift toward the LARGEST nearby collectable.
   *
   * "The strong get targeted first." It makes growing a liability in a second, visible way: the two
   * hazards that take control away rather than health go after whoever is biggest, so the player who
   * has been eating well is the one the jellyfish comes for.
   */
  private resolveSeeking(dt: number, ctx: HazardContext): void {
    const range = hazardTuning.seekBiggestRangeMeters;
    const pull = hazardTuning.seekBiggestPullPerSecond;

    for (const h of this.hazards) {
      if (h.kind !== 'jelly' && h.kind !== 'trash') continue;
      if (h.kind === 'trash' && h.gripping) continue;

      let best: { x: number; y: number; volume: number } | null = null;
      for (const b of ctx.bubbles) {
        if (ctx.eatenBubbleIds.includes(b.id)) continue;
        const d = Math.hypot(b.x - h.x, b.y - h.y);
        if (d > range) continue;
        if (!best || b.volume > best.volume) best = { x: b.x, y: b.y, volume: b.volume };
      }
      if (!best) continue;

      const dx = best.x - h.x;
      const dy = best.y - h.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1e-3) continue;
      const step = Math.min(dist, pull * dt * ctx.laneWidth * 0.05);
      h.x += (dx / dist) * step;
      h.y += (dy / dist) * step;
    }
  }

  private spawn(ctx: HazardContext): Hazard {
    const kinds: HazardKind[] = ['fish', 'jelly', 'trash', 'crab'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)] ?? 'fish';
    const radiusFraction = KIND_TUNING[kind].radius;
    const margin = ctx.laneWidth * radiusFraction * 1.4;
    return {
      id: this.nextId++,
      kind,
      x: margin + Math.random() * Math.max(0.01, ctx.laneWidth - margin * 2),
      /**
       * Appear ABOVE the view so the player always watches it enter.
       *
       * Deliberately NOT clamped to DEPTH_TOTAL. Near the seabed the top of the view is already close
       * to the level's ceiling, so clamping made hazards materialise in the middle of the screen --
       * the same trap that once piled the collectable seeding into one band. Anything above the play
       * area simply arrives later.
       */
      y: ctx.max + 20 + Math.random() * 40,
      radiusFraction,
      phase: Math.random() * Math.PI * 2,
      seed: Math.random() * 1000,
      baitedUntil: 0,
      squashed: 0,
      gripping: false,
      fuse: hazardTuning.crabFuseSeconds,
      fired: false,
      armed: false,
      fed: 0,
      digest: 0,
      gripSeconds: 0,
    };
  }

  /**
   * Per-kind motion.
   *
   * All of them travel DOWN relative to the player, but none outruns the ascent: a hazard the player
   * cannot see coming is not a hazard, it is a coin flip.
   */
  private advance(h: Hazard, dt: number, ctx: HazardContext): void {
    h.phase += dt;
    const base = ctx.descentSpeed;

    switch (h.kind) {
      case 'fish': {
        // The bait timer is the only thing that breaks the chase.
        if (h.baitedUntil > ctx.elapsed) {
          // Wander: drift sideways away from the player.
          h.x += Math.sign(h.x - ctx.playerX) * 6 * dt;
          h.y -= base * 0.5 * dt;
          break;
        }

        /**
         * Emergence rule 2, made real: the fish only CHASES inside its perception radius.
         *
         * This is what gives "getting bigger is dangerous" a mechanism instead of a mood. A small
         * player is noticed from 150m; a big one from 240m and up, so growing visibly recruits more of
         * the swarm. Outside the radius the fish just drifts, which is also what keeps a distant
         * screenful of fish from all converging at once.
         */
        const perceive = this.perceptionRadius(ctx.playerVolume);
        const dist = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
        if (dist > perceive) {
          // Idle drift: keeps its own course, does not converge.
          h.x += Math.sin(h.phase * 1.3 + h.seed) * 5 * dt;
          h.y -= base * 0.42 * dt;
          break;
        }

        // Chase: steer toward the player horizontally, and close vertically.
        const dx = ctx.playerX - h.x;
        const steer = Math.max(-1, Math.min(1, dx / Math.max(1, ctx.laneWidth * 0.25)));
        h.x += steer * ctx.laneWidth * hazardTuning.fishSpeedFactor * dt;
        h.y -= base * 0.55 * dt;
        break;
      }
      case 'jelly': {
        // Drifts down slowly and bobs. It is an obstacle, not a pursuer.
        const bob = Math.sin(h.phase * 1.4 + h.seed) * hazardTuning.jellyBobAmplitude * ctx.laneWidth;
        h.x += (Math.cos(h.phase * 0.7) * 0.4 + bob * 0.02) * 6 * dt;
        h.y -= base * 0.3 * dt;
        h.squashed = Math.max(0, h.squashed - dt * 2.2);
        break;
      }
      case 'trash': {
        // Barely moves; it is debris. On contact it is dragged along by the player instead.
        if (h.gripping) {
          h.x = ctx.playerX;
          h.y = ctx.playerY;
        } else {
          h.y -= base * hazardTuning.trashSpeedFactor * dt;
          h.x += Math.sin(h.phase * 1.1 + h.seed) * 4 * dt;
        }
        break;
      }
      case 'crab': {
        // Two-phase: it drifts harmlessly until the player enters its reach, THEN telegraphs. See
        // `armed`. Firing on a fuse that ran from spawn would mean the visible arc never coincides
        // with the player being close enough to care.
        h.y -= base * 0.18 * dt;
        const proximity = h.y < ctx.playerY + hazardTuning.crabArmDistanceMeters;
        if (!h.armed && proximity) {
          h.armed = true;
          h.fuse = hazardTuning.crabFuseSeconds;
        }
        if (h.armed) h.fuse = Math.max(0, h.fuse - dt);
        break;
      }
    }

    h.x = Math.max(0, Math.min(ctx.laneWidth, h.x));
  }
}

/**
 * Draw the hazards.
 *
 * Procedural geometry only, and each kind is recognisable by SHAPE before colour: a fish is a
 * tapered blob with a tail, a jellyfish is a dome with trailing tentacles, a trash bag is an angular
 * sack, a crab is a wide body with legs. Colour then reinforces it.
 *
 * `canEat` adds the reversal's marker, described where it is drawn below.
 */
export function paintHazards(
  g: Graphics,
  field: HazardField,
  laneWidth: number,
  elapsed: number,
  canEat: (kind: HazardKind) => boolean,
): void {
  for (const h of field.hazards) {
    const r = laneWidth * h.radiusFraction;
    const x = h.x;
    const y = h.y;

    /**
     * THE EDIBILITY MARKER, drawn UNDER the hazard so it reads as a halo rather than as an outline bolted on.
     *
     * This is the piece that turns "can I eat this" from a memory test into a strategy decision, and it is
     * deliberately a separate visual language from the player's own stage colours: the stage colour says "which
     * tier am I", this says "which of these is food". Reusing the stage palette for it would make gold mean two
     * things at once.
     *
     * Only the EDIBLE case is drawn by default. Not being able to eat something is the situation the player
     * already assumes -- every hazard starts as a threat -- whereas being able to eat it is new information they
     * have to act on. `consumption.marker.showBlocked` turns on the red ring for the other half.
     */
    const edible = canEat(h.kind);
    if (edible) {
      g.circle(x, y, r * 1.5).fill({
        color: mech.consumption.marker.edibleColor,
        alpha: mech.consumption.marker.edibleAlpha * 0.28,
      });
      g.circle(x, y, r * 1.35).stroke({
        color: mech.consumption.marker.edibleColor,
        alpha: mech.consumption.marker.edibleAlpha,
        width: Math.max(1, r * mech.consumption.marker.widthRatio),
      });
    } else if (mech.consumption.marker.showBlocked) {
      g.circle(x, y, r * 1.35).stroke({
        color: 0xff6b6b,
        alpha: mech.consumption.marker.blockedAlpha,
        width: Math.max(1, r * mech.consumption.marker.widthRatio),
      });
    }

    switch (h.kind) {
      case 'fish': {
        // Facing its direction of travel; the tail trails behind.
        const dir = Math.sign(h.x - 0) || 1;
        g.ellipse(x, y, r * 1.5, r * 0.75).fill({ color: KIND_TUNING.fish.colour, alpha: 0.85 });
        g.moveTo(x - dir * r * 1.3, y)
          .lineTo(x - dir * r * 2.2, y - r * 0.6)
          .lineTo(x - dir * r * 2.2, y + r * 0.6)
          .closePath()
          .fill({ color: KIND_TUNING.fish.colour, alpha: 0.6 });
        // A baited fish gets a blank stare: no eye, just a dot.
        if (h.baitedUntil > elapsed) {
          g.circle(x + dir * r * 0.5, y - r * 0.15, r * 0.16).fill({ color: 0xffffff, alpha: 0.9 });
        } else {
          g.circle(x + dir * r * 0.7, y - r * 0.1, r * 0.2).fill({ color: 0x08131f, alpha: 0.9 });
        }
        break;
      }
      case 'jelly': {
        const squash = 1 + h.squashed * 0.5;
        g.ellipse(x, y, r * squash, r * (1 / squash)).fill({ color: KIND_TUNING.jelly.colour, alpha: 0.55 });
        g.ellipse(x, y, r * squash, r * (1 / squash)).stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.95, width: Math.max(1, r * 0.12) });
        // Tentacles trail DOWNWARD behind it.
        for (let i = -2; i <= 2; i++) {
          const tx = x + (i / 2) * r * 0.6;
          const wob = Math.sin(h.phase * 2.4 + i) * r * 0.35;
          g.moveTo(tx, y + r * 0.8)
            .lineTo(tx + wob, y + r * 2.3)
            .stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.5, width: Math.max(1, r * 0.1) });
        }
        break;
      }
      case 'trash': {
        const spin = Math.sin(h.phase * 0.9 + h.seed) * 0.25;
        g.moveTo(x - r, y + r * (0.6 + spin))
          .lineTo(x + r * 0.9, y + r * (0.8 - spin))
          .lineTo(x + r * 0.7, y - r * 0.9)
          .lineTo(x - r * 0.8, y - r * 0.7)
          .closePath()
          .fill({ color: KIND_TUNING.trash.colour, alpha: 0.7 });
        g.moveTo(x - r * 0.6, y - r * 0.6)
          .lineTo(x + r * 0.5, y - r * 0.5)
          .stroke({ color: 0x6d5232, alpha: 0.8, width: Math.max(1, r * 0.14) });
        break;
      }
      case 'crab': {
        // TELEGRAPH FIRST: a visible arc showing exactly where the player will be thrown.
        if (h.fuse > 0) {
          const progress = 1 - h.fuse / hazardTuning.crabFuseSeconds;
          const arcTop = y + hazardTuning.crabLaunchMps * hazardTuning.crabApexSeconds * progress;
          g.moveTo(x, y)
            .quadraticCurveTo(x, (y + arcTop) / 2 + r * 3, x, arcTop)
            .stroke({ color: 0xffd479, alpha: 0.15 + progress * 0.5, width: Math.max(1, r * 0.18) });
          // Sand puffs while it winds up.
          for (let i = 0; i < 3; i++) {
            const p = (h.phase * 1.8 + i * 0.33) % 1;
            g.circle(x + Math.sin(i * 2.1) * r * 1.4, y - r * 0.5 - p * r * 2.2, r * (0.16 + p * 0.2)).fill({
              color: 0xd9c39a,
              alpha: 0.3 * (1 - p),
            });
          }
        }
        g.ellipse(x, y, r * 1.35, r * 0.95).fill({ color: KIND_TUNING.crab.colour, alpha: 0.9 });
        // Claws, plus legs that flail after firing.
        const flail = h.fired ? Math.sin(elapsed * 14) * 0.6 : 0;
        for (const side of [-1, 1]) {
          g.circle(x + side * r * 1.35, y - r * 0.3, r * 0.4).stroke({ color: KIND_TUNING.crab.colour, alpha: 0.9, width: Math.max(1, r * 0.16) });
          for (let i = -1; i <= 1; i++) {
            g.moveTo(x + side * r * 0.9, y + r * 0.5)
              .lineTo(x + side * r * 1.7, y + r * (1.1 + i * 0.3) + flail * r * 0.6)
              .stroke({ color: KIND_TUNING.crab.colour, alpha: 0.75, width: Math.max(1, r * 0.13) });
          }
        }
        break;
      }
    }
  }
}

// NOTE: a slow effect has to be legible ON THE PLAYER, not in a status bar. Ringing the bubble while
// it lasts is the cheapest honest way to show "you are still slowed", so the caller draws that
// around the bubble rather than this function painting something at the origin.
