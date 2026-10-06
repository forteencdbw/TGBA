/**
 * Hazards (D3).
 *
 * The design rule this file follows: each hazard has a different VERB, meaning it changes the
 * player's state in a way the others do not. Four creatures that all just dealt damage would be one
 * mechanic drawn four times; the point is that being caught by each one feels different.
 *
 *   fish      CHASES and swarms  -> contact damage, and it follows you
 *   jelly     SLOWS              -> a movement penalty with a timer
 *   trash     GRABS and drags    -> an ongoing drain you have to struggle out of
 *   crab      LAUNCHES           -> fires you upward along a telegraphed arc
 *
 * And five that are edible but keep acting once they are inside, each with a different way of making the player
 * regret it -- five creatures that all just drained health would be one mechanic drawn five times:
 *
 *   urchin    KEEPS HURTING      -> bleeds you for as long as you carry it
 *   bombfish  COUNTS DOWN        -> goes off inside, unless you spit it out as a grenade
 *   eel       MISBEHAVES         -> your steering stops obeying you, for a moment at a time
 *   rot       SLOWS YOUR EXITS   -> digestion crawls while it is in there
 *   oil       CLOGS THE EXIT     -> it will not come back out, and it is holding a slot
 *
 * Everything is procedurally drawn from geometry, so colours carry the information instead of any
 * tutorial text: purple is a jellyfish, brown is a trash bag, and so on.
 *
 * Coordinate convention, shared with the rest of the project: world metres, y measured UP from the
 * seabed. Hazards travel DOWN like collectables, but always lag the player's ascent (they never
 * outrun it), so the player closes on them and can see them coming.
 */

import { ColorMatrixFilter, Graphics, Sprite, Texture } from 'pixi.js';
import { assetUrl, isYFlipped } from './assets';
import { mech, tuning } from './config';
import { hazardMass } from './consumption';
import { pullSpeedFraction, suctionRadiusFraction } from './suction';
export type HazardKind =
  | 'fish'
  | 'jelly'
  | 'trash'
  | 'crab'
  | 'urchin'
  | 'bombfish'
  | 'eel'
  | 'rot'
  | 'oil'
  /**
   * The level's boss.
   *
   * A hazard kind like the rest, which is what makes the player's gun hit it with no new code at all -- and what makes
   * shooting the boss the same act as shooting a fish. What differs is stated where it matters: it does not drift with
   * the current, it does not flee when its health runs out (it DIES, and that is what ends the level), and it cannot be
   * eaten.
   */
  | 'boss'
  /**
   * LEVEL 1 -- 黑烟囱墓场.
   *
   * `vent`     a black smoker's plume: a lethal column of hot mineral water. The level's signature hazard, because it
   *            is the one thing the player must learn to move SIDEWAYS for.
   * `mineral`  mineral grit thrown up by the heat flow: the environment's own danmaku, slow and easy to read.
   * `shrimp`   a blind shrimp: drifts in from the side and probes at the bubble. Slow, and it never turns.
   */
  | 'vent'
  | 'mineral'
  | 'shrimp'
  /**
   * LEVEL 2 -- 沉船幽谷.
   *
   * `angler`   a lanternfish: hangs in the dark with a lit lure, then lunges. The lure is the whole design -- it is
   *            the one creature that advertises itself, and that is the trap.
   * `torpedo`  a rogue torpedo: runs straight out of a wreck, then turns and hunts. Its first leg is honest and its
   *            second leg is not, which is what makes the turn the event.
   */
  | 'angler'
  | 'torpedo'
  /**
   * LEVEL 3 -- 发光水母林.
   *
   * zapper discharges when it is touched OR shot, which makes it the one creature in the game that gets more
   * dangerous the harder the player fights it -- and the ignition source for the conductive chain.
   */
  | 'zapper'
  /**
   * LEVEL 6 -- 破晓海面.
   *
   * Foam looks like the player's own bubble and cannot be shot (0 health): the level's interference is
   * ABOUT not being able to tell where you are. Rain falls from above and presses the bubble back down, which is
   * the mechanic that makes approaching the surface a decision rather than a straight line.
   * the mechanic that makes approaching the surface a decision rather than a straight line.
   */
  | 'foam'
  | 'rain';

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
  /**
   * A creature's order to FIRE, from where it is.
   *
   * An effect rather than a direct call into the bullet field for the reason every other entry here is: this module
   * knows what a creature does, and the caller knows what worlds exist to do it into. The position is carried so the
   * caller never has to look the creature up again -- by the time it reads this, the creature may be gone.
   */
  shot?: { x: number; y: number };
  /**
   * A detonation in the water, at this position and this radius.
   *
   * Carried as an effect for the usual reason -- the field decides what happened and the caller decides what it looks
   * like -- and because the blast is the one thing in this module that is neither contact damage nor a state change.
   */
  blast?: { x: number; y: number; radius: number };
  /**
   * Charge handed to the bubble, for LEVEL 3's conductive chain.
   *
   * An effect like damage is: the field decides that an electric ring swept the player, and the game decides what
   * that means for the run's charge. See mechanisms.chargeConfig.
   */
  charge?: number;
  /**
   * Metres the player is pushed DOWN, for LEVEL 6's rain.
   *
   * A push rather than a stun: it must be recoverable, and it must cost the player the height they just earned.
   */
  pushDown?: number;
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
  /**
   * A LUNGE in progress, or null.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY IT IS A STATE RATHER THAN A VELOCITY
   * ---------------------------------------------------------------------------------------------
   * The same reason `entry` and `flee` are: a charge has to REPLACE the kind's own motion while it lasts, or a fish
   * would keep steering toward the player on top of the curve and the curve would stop being a curve. It is also what
   * makes the move readable -- the player is dodging ONE committed path, not an opponent that can correct mid-flight,
   * which is the difference between a bullet-hell pattern and an unfair homing attack.
   *
   * The path is a quadratic Bezier: `from` is where the creature was when it committed, `to` is where the PLAYER was
   * at that instant, and the control point is the midpoint pushed sideways by `bow`. Aiming at where the player WAS is
   * the whole dodge window -- see `mech.charges`.
   */
  charge: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    /** Perpendicular offset of the control point, in metres: signed, so two fish can bow opposite ways. */
    bow: number;
    /** Seconds since the commitment. The telegraph is the first `telegraphSeconds` of it. */
    elapsed: number;
  } | null;
  /** Seconds before this creature may lunge again. Counted down whether or not it is hunting. */
  chargeRest: number;
  /**
   * The bomb fish's EXTERNAL fuse, or null when it is not lit.
   *
   * A second fuse on purpose, and a separate field rather than a reuse of `fuse`: the bomb fish has three lives -- one
   * hunting in the water, one burning down inside a stomach, one flying as a grenade -- and they are three different
   * clocks. `fuse` is the crab's launch wind-up; the stomach's runs on the swallowed ITEM, in `src/spit.ts`.
   */
  blastFuse: number | null;
  /**
   * Seconds left of the hit flash, drawn by the boss.\n   *\n   * A BIG target needs the feedback more than a small one does: a fish's death is its own confirmation, while a boss
   * that absorbs ten rounds in a row has to say so every single time, or the player cannot tell hits from misses.
   */
  hitFlash: number;
  /**
   * Recoil from being shot, or null.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY IT IS A STATE RATHER THAN A SHOVE WRITTEN INTO x/y
   * ---------------------------------------------------------------------------------------------
   * A shove cannot be a one-off displacement, because a displacement applied in one frame reads as a teleport at 60fps
   * (the creature is simply somewhere else between two frames). It has to be spent over several frames, which means it
   * has to survive until the next frame -- and anything that survives a frame is state this module owns.
   *
   * It is also NOT the same thing as `flee` or `charge`: those REPLACE the kind's own motion, while this one is added
   * ON TOP of it. A fish that is knocked back is still swimming; it is just losing ground while it does. That is why it
   * is applied after the kind's own motion rather than instead of it -- see `advance`.
   *
   * `dirX`/`dirY` is a unit vector pointing AWAY FROM THE IMPACT, so what the player sees is the round pushing the
   * creature the way the round was going.
   */
  knock: {
    dirX: number;
    dirY: number;
    /** Metres still to be covered in total, and how long the whole recoil lasts. */
    meters: number;
    seconds: number;
    /** Seconds spent so far, which is what decays the speed. */
    elapsed: number;
  } | null;
  /**
   * A spline this creature is following, or null.
   *
   * The points are a REFERENCE to the level's own table, not a copy: a level with a hundred fish on one path still has
   * one spline in memory.
   */
  path: { points: readonly { x: number; y: number }[]; seconds: number; elapsed: number; startX: number; startY: number } | null;
  /** LEVEL 6's foam: how long it has left before it breaks up. */
  foamLife: number;
  /** Seconds left of a zapper's discharge ring, and its cooldown. Both per instance: a shoal does not fire in unison. */
  discharge: number;
  dischargeRest: number;
  /**
   * A per-INSTANCE colour, or null for the kind's own.\n   *\n   * Exists for the boss alone: a level picks its boss's colour (see BossSpec.colour), which is the one piece of a
   * creature's look that is level design rather than mechanics -- two levels should not look like the same monster.
   */
  tint: number | null;
  /**
   * Seconds until this creature may fire again, for the kinds that shoot.
   *
   * On the hazard rather than in the bullet field, because this is a creature's rhythm and not a property of the
   * water: two jellyfish should not fire in lockstep, and a colony that shared one timer would.
   */
  shootTimer: number;
  /**
   * Set while it is still ARRIVING from a screen edge, and null once it is in the water.
   *
   * ---------------------------------------------------------------------------------------------
   * WHAT THIS IS FOR, AND WHY IT IS NOT JUST A SPAWN POSITION
   * ---------------------------------------------------------------------------------------------
   * A level can say `from: 'left' | 'right' | 'bottom'` for a block, which is how content arrives from the sides and
   * from behind instead of only from above. Arriving is a STATE rather than a position because the arrival has to
   * replace the kind's own motion while it lasts: a fish spawned off the left edge must swim IN before it starts
   * chasing, or its chase logic would have it turn round and swim off the edge it came from.
   *
   * It ends the moment the creature is inside the play area, and then `advance` hands it to the switch below and it
   * behaves like everything else. What that means in practice, and it is worth knowing when authoring: only the kinds
   * that hunt will press an attack from behind. A bottom-entered fish chases; a bottom-entered jellyfish drifts back
   * down out of the level, because drifting away is what jellyfish do.
   */
  entry: { from: 'left' | 'right' | 'bottom'; speed: number } | null;
  /**
   * Hit points left, and the value it started with.
   *
   * In BULLET HITS, not in a general health system: this game has no damage-numbers for creatures, and the only
   * thing that reduces it is the player's own fire. `maxHealth` is kept because "untouched" and "nearly gone" are
   * different states worth being able to tell apart, and because a table lookup at draw time would be a second
   * answer to "how much does a fish have".
   *
   * Zero means the bullets pass straight through it -- the config's way of saying "this one is not shootable".
   */
  health: number;
  maxHealth: number;
  /**
   * Which way it is LEAVING, or null while it is still in the fight.
   *
   * One field rather than a flag plus a direction, because "is it leaving" and "which way" are the same fact and a
   * boolean beside a direction is a state that can disagree with itself. The shape is `entry`'s, for the same
   * reason: a state that REPLACES the kind's own motion rather than adding to it.
   *
   * Nothing in this game kills a creature. They are eaten or driven off, and this is the driven-off half: once its
   * hit points are gone a creature stops chasing, stops being fooled by bait, stops eating, stops being pulled by
   * the suction field, cannot hurt the player -- and leaves, in one of three directions picked when it decided.
   */
  flee: 'up' | 'left' | 'right' | 'down' | null;
  /**
   * The facing the creature has COMMITTED to, and how long before it may change: +1 keeps the picture as drawn, -1 mirrors it.
   *
   * Optional, and set on first use, because the alternative is teaching every spawn literal in three modules about a field only
   * the painter writes -- see the commit for why that trade is not worth it for state that has exactly one owner.
   */
  facing?: number;
  facingRest?: number;
}

/** Tunables for D3. Kept together because they are only meaningful as a set. */
/**
 * Hazard behaviour.
 *
 * Values marked "(config)" come from `config/mechanics.json5` and are the ones worth hand-tuning. The rest are
 * internal shape constants -- how wide a fish's bite is, how fast it turns -- where a hand-edit would be
 * guesswork rather than tuning. They live here so the file that uses them is also the file that documents them.
 *
 * Every "(config)" member is a GETTER rather than a value, and that is not a style choice: a copied number looks
 * exactly like a live one, so the eleven that used to be copied here were tunable in console appearance only.
 * `config.ts`'s `tuning` had the same fault. If you add a config-backed member, add it as a getter.
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
  /** How deep inside the lane a side-entering creature must get before its own AI takes over. */
  get insideMarginRatio() {
    return mech.spawning.insideMarginRatio;
  },

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
  get trashDrainPerSecond() {
    return mech.hazards.trash.drainPerSecond;
  },
  trashStruggleRelease: 0.55,
  /**
   * Minimum seconds a trash bag holds on before struggling can tear it free. (config)
   *
   * Doubles as the drain window, which is why it is relatively long. "Struggling" is any deliberate movement
   * input, and a player who is dodging qualifies most of the time, so the grip needs a floor or it lasts a
   * single frame and is never felt.
   */
  get trashMinGripSeconds() {
    return mech.hazards.trash.minGripSeconds;
  },
  /**
   * The crab, read live from its own block in the config.
   *
   * All five of the crab's numbers are `mech.hazards.crab.*` now, including `apexSeconds`, which used to be a literal
   * right here in the middle of this table. The call sites below did not change: they still say
   * `hazardTuning.crabLaunchMps`, so this table is a live view of the creature's block rather than a second home for
   * its numbers. See the config's note at `hazards.crab` for the pattern and why it is the pattern.
   */
  get crabArmDistanceMeters() {
    return mech.hazards.crab.armDistanceMeters;
  },
  get crabFuseSeconds() {
    return mech.hazards.crab.fuseSeconds;
  },
  get crabLaunchMps() {
    return mech.hazards.crab.launchMps;
  },
  get crabApexSeconds() {
    return mech.hazards.crab.apexSeconds;
  },

  // --- Emergence (D5) -----------------------------------------------------
  /**
   * Collectables a fish must swallow before it splits in two. (config)
   *
   * Three, not one. At one, any fish that crosses a bubble doubles, and the population explodes from ambient
   * food alone -- the swarm would grow whether or not the player did anything, which removes the causality the
   * whole design rests on ("I got bigger, so the world got worse"). At three, a split is a consequence of a LOT
   * of food appearing, which in practice means the player's own talent backlash or a bait bubble.
   */
  get fishFeedToSplit() {
    return mech.emergence.fishFeedToSplit;
  },
  /** Seconds a fish spends digesting between meals. */
  fishDigestSeconds: 0.9,
  /**
   * The fish's base perception radius in metres, before the player's size is factored in. (config)
   *
   * Rule 2 of the emergence engine: perception GROWS WITH THE PLAYER'S VOLUME. It is what gives "getting bigger
   * is dangerous" a number instead of a feeling.
   */
  get fishPerceptionBaseMeters() {
    return mech.emergence.fishPerceptionBaseMeters;
  },
  /** Extra perception per unit of player volume above 1. (config) */
  get fishPerceptionPerVolume() {
    return mech.emergence.fishPerceptionPerVolume;
  },
  /**
   * HARD CAP on fish. (config)
   *
   * Exponential growth will brick a phone, so the population is capped and, past the cap, behaviour changes
   * rather than more entities being created. The guard is not an optimisation: without it the design's own
   * centrepiece is a crash.
   */
  get fishHardCap() {
    return mech.emergence.fishHardCap;
  },
  /**
   * Radius in metres a fish will snap up a collectable from.
   *
   * Notably LARGER than the fish itself: this is meant to read as the swarm hoovering up the food the player
   * was going to eat, which is the pressure that makes a bait bubble backfire.
   */
  fishBiteMeters: 34,
  /** How far a jellyfish or trash bag will drift toward the biggest nearby collectable. (config) */
  get seekBiggestRangeMeters() {
    return mech.emergence.seekBiggestRangeMeters;
  },
  seekBiggestPullPerSecond: 0.35,
};

/**
 * What a swallowed hazard does from INSIDE, as data.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS DATA RATHER THAN CODE IN THE STOMACH
 * ---------------------------------------------------------------------------------------------
 * `src/spit.ts` owns the stomach, and it must not know that urchins exist -- the same split as everywhere else in
 * this project (the hazard field decides what happened, the game decides what it means). So the stomach applies
 * generic rules -- "this many hit points per second", "this many seconds until it goes off" -- and WHICH creature
 * does which is a property of the creature, declared here beside everything else about it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS CLASS OF HAZARD EXISTS AT ALL
 * ---------------------------------------------------------------------------------------------
 * Without it, swallowing is a pure gain: mass, plus ammunition. It is never a question. These two make it one, and
 * the question has a real answer either way -- spit it out fast (and get a weapon for it), or digest it before it
 * finishes what it is doing (which costs double damage taken while compressing, so against an urchin that is a
 * genuinely bad idea and against a bomb it is a race).
 *
 * Both are also ordinary hazards BELOW their tier, which is not a second rule: the reversal is a two-sided
 * judgement, so "it hurts you until you are big enough" is what every other creature already does.
 */
export interface StomachEffect {
  /** Hit points per second it costs while it is inside. Fractional, accumulated by the caller. */
  damagePerSecond: number;
  /** Seconds until it goes off inside, or 0 for something that does not. */
  fuseSeconds: number;
  /** Hit points its detonation costs. */
  detonationHitPoints: number;
  /** Seconds between shocks, and how long each lasts. A duration of 0 means it never does. */
  shockPeriodSeconds: number;
  shockSeconds: number;
  /**
   * What it multiplies the DIGESTION RATE by while it is inside. 1 is no effect; below 1 is slower.
   *
   * A multiplier rather than "seconds added", because what it does is make the answer that works for everything
   * else take longer -- and it therefore multiplies with the compress control, which is where it bites: the
   * over-eating fuse does not wait for a slower stomach.
   */
  digestScale: number;
  /**
   * The chance a spit attempt gets it back out, 0..1.
   *
   * The only exit in the game that can refuse, which is what "占据容量且难以排出" means in a game whose other four
   * hundred rules are deterministic. At 0 it is a permanent clog and digestion is the only way out; at 1 it is an
   * ordinary item. Note this is a PER-ATTEMPT roll, so a low value is not "it never comes out" -- it is "you will
   * spend presses, and the fuse is still burning".
   */
  spitChance: number;
}

/** Swallowing most things costs nothing after the fact. */
export const NO_STOMACH_EFFECT: StomachEffect = {
  damagePerSecond: 0,
  fuseSeconds: 0,
  detonationHitPoints: 0,
  shockPeriodSeconds: 0,
  shockSeconds: 0,
  digestScale: 1,
  spitChance: 1,
};

/**
 * What this kind does once it is inside.
 *
 * A `switch` rather than a table keyed by kind, deliberately: the values are read LIVE from the config, and a
 * table built at module load would freeze whatever the file said at boot -- which is exactly the bug the over-eating
 * fuse documents at length, and it would break the runtime editing that every tuning workflow here depends on.
 */
export function stomachEffect(kind: HazardKind): StomachEffect {
  switch (kind) {
    case 'urchin':
      return { ...NO_STOMACH_EFFECT, damagePerSecond: mech.hazards.urchin.drainPerSecond };
    case 'bombfish':
      return {
        ...NO_STOMACH_EFFECT,
        fuseSeconds: mech.hazards.bombfish.stomachFuseSeconds,
        detonationHitPoints: mech.hazards.bombfish.detonationHitPoints,
      };
    case 'eel':
      return {
        ...NO_STOMACH_EFFECT,
        shockPeriodSeconds: mech.hazards.eel.shockPeriodSeconds,
        shockSeconds: mech.hazards.eel.shockSeconds,
      };
    case 'rot':
      return { ...NO_STOMACH_EFFECT, digestScale: mech.hazards.rot.digestScale };
    case 'oil':
      return { ...NO_STOMACH_EFFECT, spitChance: mech.hazards.oil.spitChance };
    default:
      return NO_STOMACH_EFFECT;
  }
}

/**
 * How wide this kind's ammunition blasts when it lands, as a fraction of the lane width.
 *
 * Zero means "an ordinary pellet that shoves one thing". The bomb fish is the only explosive round, and that is the
 * whole reason to swallow one on purpose: you are trading a lit fuse for a grenade.
 */
export function blastRadiusFraction(kind: HazardKind): number {
  return kind === 'bombfish' ? mech.hazards.bombfish.grenadeBlastRadiusRatio : 0;
}

/**
 * Per-kind presentation and collision size, as a fraction of the lane width.
 *
 * EXPORTED because a spat projectile is drawn in the shape and colour of the hazard it was, and copying the four
 * colours into the projectile code would let the two drift -- a fish that changes colour when thrown is a bug
 * nobody would think to look for. One source for "what a fish looks like".
 *
 * It is also the radius the collision uses, so a creature is exactly as big as it is drawn -- and it is the ONE
 * place this lives: there used to be a second copy of these numbers in `main.ts` for the spawn hooks, which meant
 * a new creature could be edible at one size and painted at another.
 */
export const KIND_TUNING: Record<HazardKind, { radius: number; colour: number; spin: number }> = {  fish: { radius: 0.035, colour: 0x9ad7ff, spin: 0 },
  jelly: { radius: 0.062, colour: 0xc79bff, spin: 0 },
  trash: { radius: 0.05, colour: 0xb08a5a, spin: 0.6 },
  crab: { radius: 0.045, colour: 0xff9b6b, spin: 0 },
  /**
   * Dark and mineral, against the pale blue of a fish: the urchin is a hard thing, not a soft one.
   *
   * Its SIZE and its needles are what say "do not touch", because those read at a distance where colour does not.
   */
  urchin: { radius: 0.052, colour: 0x3d4a7a, spin: 0.2 },
  /** Deep red, well away from the crab's orange, with a stubby body: round and heavy rather than sleek. */
  bombfish: { radius: 0.048, colour: 0xd94a3f, spin: 0 },
  // The boss's size and colour come from `mech.hazards.boss` (a level may override the colour); this row exists because
  // every kind needs one, and it has to be BIG -- a boss the size of a fish is a fish.
  boss: { radius: mech.hazards.boss.radiusRatio, colour: mech.hazards.boss.colour, spin: 0 },
  vent: { radius: mech.hazards.vent.radiusRatio, colour: mech.hazards.vent.plumeColour, spin: 0 },
  mineral: { radius: 0.018, colour: 0xffb066, spin: 2.4 },
  shrimp: { radius: 0.033, colour: 0xffd9d0, spin: 0 },
  angler: { radius: 0.045, colour: 0x2f4a63, spin: 0 },
  torpedo: { radius: 0.036, colour: 0x9aa7b4, spin: 0 },
  zapper: { radius: 0.058, colour: mech.hazards.zapper.bellColour, spin: 0 },
  foam: { radius: mech.hazards.foam.radiusRatio, colour: mech.hazards.foam.colour, spin: 0 },
  rain: { radius: 0.014, colour: mech.hazards.rain.colour, spin: 0 },
  /**
   * Electric chartreuse, and nothing else in the game is that hue.
   *
   * The eel is the only creature whose effect is about the CONTROLS rather than about the bubble, so it gets the
   * one colour that appears nowhere else -- a player who has been shocked once will read that colour again from
   * across the screen, which is what makes it avoidable rather than random.
   */
  eel: { radius: 0.058, colour: 0xc8f24a, spin: 0.3 },
  /** Olive: unmistakably brown-ish rather than the trash bag's tan, and duller than anything else alive. */
  rot: { radius: 0.056, colour: 0x7d8a3c, spin: 0.5 },
  /** Dark slate teal, drawn as a flat slick rather than a body: it is a substance, not a creature. */
  oil: { radius: 0.066, colour: 0x2f4f4a, spin: 0.1 },
};
/**
 * The table above is the DEFAULT; the config's `hazards.radius` overrides it, kind by kind.
 *
 * Merged here rather than read at every call site because the radius is used in at least four places (collision, the water
 * painter, the codex card and the burst) and four reads of the same number is four chances for three of them to be updated.
 * One merge at load, and every reader gets the configured value without knowing there is a config.
 */
for (const kind of Object.keys(KIND_TUNING) as HazardKind[]) {
  const configured = mech.hazards.radius[kind];
  if (typeof configured === 'number' && configured > 0) KIND_TUNING[kind].radius = configured;
}


/**
 * How many bullet hits this kind takes before it leaves. From the config, one row per kind.
 *
 * A kind with no row is a load error rather than a silent zero: see the cross-check in `src/mechanisms.ts`. The
 * fallback here is for safety only, and it is deliberately the "not shootable" answer.
 */
export function hazardHealth(kind: HazardKind): number {
  return mech.hazards.health[kind] ?? 0;
}

/**
 * The three ways a driven-off creature can leave: up, or out of either side.
 *
 * Three rather than one so the exit is not a fixed animation the player learns in two minutes -- and rather than
 * "any angle" so an exit is always legible, since a creature leaving diagonally at speed reads as a glitch.
 */
const FLEE_DIRECTIONS = ['up', 'left', 'right'] as const;

/**
 * A point on a Catmull-Rom spline through `points`, at `t` in 0..1.
 *
 * Catmull-Rom rather than a Bézier chain because it INTERPOLATES: the curve passes exactly through every waypoint, which
 * is what "move along these points" means. A Bézier would only be pulled toward them, so an author asking for a fish to
 * pass the middle of the screen would get one that passed near it.
 */
function pathPoint(points: readonly { x: number; y: number }[], t: number): { x: number; y: number } {
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  if (n === 1) return points[0]!;
  const span = (n - 1) * Math.min(1, Math.max(0, t));
  const i = Math.min(n - 2, Math.floor(span));
  const u = span - i;
  // The four control points, clamped at the ends: a path that is not closed has to borrow its neighbours' reflections.
  const p0 = points[Math.max(0, i - 1)]!;
  const p1 = points[i]!;
  const p2 = points[i + 1]!;
  const p3 = points[Math.min(n - 1, i + 2)]!;
  const u2 = u * u;
  const u3 = u2 * u;
  const axis = (a: number, b: number, c: number, d: number): number =>
    0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return { x: axis(p0.x, p1.x, p2.x, p3.x), y: axis(p0.y, p1.y, p2.y, p3.y) };
}

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
  suction: { x: number; y: number; radiusFactor: number } | null;
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
/**
 * What a caller has to say about a creature it is placing; everything else is the factory's.
 *
 * See `HazardField.spawnAt` for why there is one factory rather than three field-by-field literals.
 */
export interface SpawnOptions {
  /** Hit points, for a creature whose health comes from the level rather than from the per-kind table (the boss). */
  health?: number;
  /** Set while it is still arriving from a screen edge. The caller places it outside the lane; the factory leaves it. */
  entry?: Hazard['entry'];
  /** The spline it follows, if a level put it on one. */
  path?: Hazard['path'];
  /**
   * A probe's creature: no random phase and no random head start on its timers, so "did it lunge" is not a coin flip.
   *
   * Everything the GAME places -- including a level's authored blocks -- gets the random head start, because its whole
   * purpose is that a group entered in one frame does not act in one frame.
   */
  deterministic?: boolean;
}

/**
 * One creature's own motion, in one place per creature.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT WAS HERE BEFORE, AND WHAT THE TABLE IS FOR
 * ---------------------------------------------------------------------------------------------
 * This was an eighteen-case `switch` inside `advanceKind`: a 547-line method where a creature's behaviour was a case
 * somewhere in the middle, next to the shared states (arriving, charging, fleeing, recoiling) that OVERRIDE it. Reading
 * one creature meant finding its case; adding one meant finding the right place in a switch and remembering which of
 * the shared states had already returned.
 *
 * Each kind is a named function now, and `CREATURES` is a TOTAL record -- so a new kind is a missing row and therefore
 * a compile error, which is the same guarantee `KIND_TUNING` and the config's per-creature blocks get. What stays
 * shared stays shared: `advanceKind` still handles entering, charging, following a spline, recoil, the hit flash and
 * the lane clamp, because those replace or wrap EVERY creature's motion rather than belonging to one.
 *
 * The field is passed rather than closed over because two of these need it: a fish asks the field for the perception
 * radius that grows with the player, and a zapper's discharge counts on the field's `charges`.
 */
type CreatureStep = (field: HazardField, h: Hazard, dt: number, ctx: HazardContext) => void;
function stepFish(field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  // The bait timer is the only thing that breaks the chase.
  if (h.baitedUntil > ctx.elapsed) {
    // Wander: drift sideways away from the player.
    h.x += Math.sign(h.x - ctx.playerX) * 6 * dt;
    h.y -= ctx.descentSpeed * 0.5 * dt;
    return;
  }

  /**
   * Emergence rule 2, made real: the fish only CHASES inside its perception radius.
   *
   * This is what gives "getting bigger is dangerous" a mechanism instead of a mood. A small
   * player is noticed from 150m; a big one from 240m and up, so growing visibly recruits more of
   * the swarm. Outside the radius the fish just drifts, which is also what keeps a distant
   * screenful of fish from all converging at once.
   */
  const perceive = field.perceptionRadius(ctx.playerVolume);
  const dist = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
  if (dist > perceive) {
    // Idle drift: keeps its own course, does not converge.
    h.x += Math.sin(h.phase * 1.3 + h.seed) * 5 * dt;
    h.y -= ctx.descentSpeed * 0.42 * dt;
    return;
  }

  // Chase: steer toward the player horizontally, and close vertically.
  const dx = ctx.playerX - h.x;
  const steer = Math.max(-1, Math.min(1, dx / Math.max(1, ctx.laneWidth * 0.25)));
  h.x += steer * ctx.laneWidth * hazardTuning.fishSpeedFactor * dt;
  h.y -= ctx.descentSpeed * 0.55 * dt;
  return;
}
function stepJelly(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  // Drifts down slowly and bobs. It is an obstacle, not a pursuer.
  const bob = Math.sin(h.phase * 1.4 + h.seed) * hazardTuning.jellyBobAmplitude * ctx.laneWidth;
  h.x += (Math.cos(h.phase * 0.7) * 0.4 + bob * 0.02) * 6 * dt;
  h.y -= ctx.descentSpeed * 0.3 * dt;
  h.squashed = Math.max(0, h.squashed - dt * 2.2);
  return;
}
function stepTrash(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  // Barely moves; it is debris. On contact it is dragged along by the player instead.
  if (h.gripping) {
    h.x = ctx.playerX;
    h.y = ctx.playerY;
  } else {
    h.y -= ctx.descentSpeed * hazardTuning.trashSpeedFactor * dt;
    h.x += Math.sin(h.phase * 1.1 + h.seed) * 4 * dt;
  }
  return;
}
function stepCrab(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  // Two-phase: it drifts harmlessly until the player enters its reach, THEN telegraphs. See
  // `armed`. Firing on a fuse that ran from spawn would mean the visible arc never coincides
  // with the player being close enough to care.
  h.y -= ctx.descentSpeed * 0.18 * dt;
  const proximity = h.y < ctx.playerY + hazardTuning.crabArmDistanceMeters;
  if (!h.armed && proximity) {
    h.armed = true;
    h.fuse = hazardTuning.crabFuseSeconds;
  }
  if (h.armed) h.fuse = Math.max(0, h.fuse - dt);
  return;
}
function stepUrchin(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Inert and heavy. It does not chase, does not flee and barely drifts, so it is a fixed hazard you have to
   * steer around or choose to run into -- which is the point: it is a DECISION, and a decision needs a
   * stationary option. A hunter would take the choice away and make it a reflex.
   *
   * It sinks faster than a crab, so it clears the water instead of accumulating into a wall of spines.
   */
  h.y -= ctx.descentSpeed * 0.26 * dt;
  h.x += Math.sin(h.phase * 0.8 + h.seed) * 2.5 * dt;
  return;
}
function stepBombfish(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * A HOMING time bomb, not a drifting temptation.
   *
   * It used to swim down with a lazy weave and pointedly not come for the player: a temptation has to be
   * avoidable, or the choice to swallow one is made for you. That reasoning still holds for the REVERSAL -- and
   * the reversal is still available -- but the creature's role in the water changed: it now closes on the
   * bubble, and the counterplay is to shoot it (which sets it off where it stands) or to outrun the fuse.
   *
   * It re-aims every frame, which is the opposite of the charge's committed curve and deliberate: a bomb that
   * cannot be out-turned, only out-run and out-shot.
   */
  const cfg = mech.hazards.bombfish;
  const dx = ctx.playerX - h.x;
  const dy = ctx.playerY - h.y;
  const gap = Math.hypot(dx, dy);
  const step = cfg.seekSpeedFactor * ctx.laneWidth;
  if (gap > 1e-3) {
    // Apportioned between the axes, so it arrives from wherever it is rather than sliding sideways first.
    h.x += (dx / gap) * step * dt;
    h.y += (dy / gap) * step * dt;
  }
  // The current still drags it down; the hunt is on top of that, not instead of it.
  h.y -= ctx.descentSpeed * 0.15 * dt;
  if (h.blastFuse === null && gap <= cfg.armMeters) h.blastFuse = cfg.fuseSeconds;
  return;
}
function stepBoss(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * The boss does NOT ride the current.
   *
   * Everything else in this file is carried down at the level's scroll speed, which is what makes the water feel
   * like water. The boss holds a position RELATIVE TO THE PLAYER instead -- `holdMeters` above the bubble -- which
   * is the whole reason it is a fight rather than an encounter the player can simply outrun. It patrols sideways
   * and tracks the player's lane slowly: slowly enough that being cornered is always something the player did.
   */
  const cfg = mech.hazards.boss;
  const targetX = ctx.playerX + Math.sin(ctx.elapsed * ((Math.PI * 2) / cfg.patrolPeriodSeconds)) * cfg.patrolAmplitude * ctx.laneWidth;
  const gapX = targetX - h.x;
  const step = cfg.seekSpeedFactor * ctx.laneWidth * dt;
  h.x += Math.abs(gapX) <= step ? gapX : Math.sign(gapX) * step;
  /**
   * Its height, derived from the VISIBLE BAND rather than fixed in metres.
   *
   * A fixed hold height is only correct for one window shape: the band shrinks as the window gets wider and
   * shorter (802m on a phone, 289m at 1280x720), and a boss hovering past its top edge is a boss that never
   * appears -- which is exactly the bug this replaced.
   */
  const band = Math.max(1, ctx.max - ctx.min);
  const hold = Math.max(cfg.holdMinMeters, Math.min(cfg.holdMeters, band * cfg.holdBandRatio));
  /**
   * And then it is CLAMPED INTO THE VISIBLE BAND, which is the second half of the same bug.
   *
   * The hold is measured from the player, so a player who has fallen behind the camera -- stuck behind a wall in
   * level 2's narrow passages, say -- would have their boss hovering wherever THEY are rather than where the
   * fight is. The clamp says: whatever the offset works out to, the boss stays inside the band with a small
   * margin. A boss that exists but is not on screen is indistinguishable from no boss, and a level only ends when
   * one dies.
   */
  const margin = band * 0.08;
  const targetY = Math.min(Math.max(ctx.playerY + hold, ctx.min + margin), ctx.max - margin);
  h.y += (targetY - h.y) * Math.min(1, dt * 1.4);
  return;
}
function stepVent(_field: HazardField, h: Hazard, dt: number, _ctx: HazardContext): void {
  /**
   * A black smoker does not move; its PLUME does, and the plume is the hazard.
   *
   * The cycle is the whole mechanic: a vent that was always lethal could only be avoided by never being in the
   * middle of the lane, and a level made of those is a corridor. `periodSeconds` with a shorter `activeSeconds`
   * makes it a rhythm the player can learn -- and the warning is drawn (the plume brightens while `warn` is
   * counting) so learning it is a matter of paying attention rather than of memorising.
   *
   * `h.phase` carries how far through the cycle it is, which is also what the painter reads, so the picture and
   * the hitbox cannot disagree.
   */
  const cfg = mech.hazards.vent;
  h.phase = (h.phase + dt) % Math.max(0.2, cfg.periodSeconds);
  return;
}
function stepMineral(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Grit on the heat flow: it RISES, which is the one direction nothing else in the game moves.
   *
   * That is why it is the teaching level's danmaku. Every other threat comes down or sideways and is dodged by
   * reaction; this one comes up out of the terrain and is dodged by knowing where the vents are.
   */
  const cfg = mech.hazards.mineral;
  h.y += ctx.laneWidth * cfg.riseSpeedFactor * dt;
  h.x += Math.sin((ctx.elapsed / Math.max(0.2, cfg.wobblePeriodSeconds)) * Math.PI * 2 + h.seed) * ctx.laneWidth * cfg.wobbleAmplitude * dt;
  // It expires on AGE rather than on distance left behind, so a slow one does not linger in the level's path.
  h.fed += dt;
  if (h.fed * ctx.laneWidth * cfg.riseSpeedFactor > cfg.lifeMeters) h.flee = 'up';
  return;
}
function stepShrimp(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * A blind shrimp: it walks a straight line and never turns.
   *
   * Deliberately the simplest possible pursuer -- it is the first thing the level introduces, and the lesson is
   * "the lane is not always yours" rather than "learn a pattern". Because it does not steer, walking around one
   * is always possible; because it comes from the SIDE, walking around it is not optional.
   */
  const cfg = mech.hazards.shrimp;
  h.x += h.seed % 2 < 1 ? -ctx.laneWidth * cfg.driftSpeedFactor * dt : ctx.laneWidth * cfg.driftSpeedFactor * dt;
  h.y -= ctx.descentSpeed * 0.25 * dt;
  return;
}
function stepAngler(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * A lanternfish: it hangs still with a lit lure, then lunges at whatever came to look.
   *
   * The lure is a promise -- the only light in a dark level -- and the lunge is the bill for believing it. The
   * lunge reuses the charge machinery (`h.charge`), so the telegraph, the curve and the recovery are the same
   * geometry the player already learned from the fish, and only the TRIGGER differs: proximity rather than a
   * distance along the level.
   */
  const cfg = mech.hazards.angler;
  if (h.chargeRest > 0) h.chargeRest -= dt;
  const gap = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
  if (h.chargeRest <= 0 && gap <= cfg.lureMeters) {
    h.chargeRest = cfg.cooldownSeconds;
    const span = gap;
    h.charge = {
      fromX: h.x,
      fromY: h.y,
      toX: ctx.playerX,
      toY: ctx.playerY,
      bow: (h.x < ctx.playerX ? 1 : -1) * cfg.bowRatio * span,
      elapsed: 0,
    };
  }
  h.y -= ctx.descentSpeed * cfg.driftFactor * dt;
  return;
}
function stepTorpedo(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * A rogue torpedo: it runs STRAIGHT first, then turns and hunts.
   *
   * Both halves matter. The straight leg is honest -- it can only be dodged sideways -- and the turn is the
   * event, because a round that has already been dodged once becomes a different problem. `fed` accumulates how
   * far it has run, which is the same trick the mineral countdown uses: a per-hazard number rather than a flag
   * somewhere else.
   */
  const cfg = mech.hazards.torpedo;
  const run = ctx.laneWidth * cfg.runSpeedFactor;
  const seek = ctx.laneWidth * cfg.seekSpeedFactor;
  if (h.fed < cfg.runMeters) {
    h.fed += run * dt;
    h.y += run * dt;
  } else if (h.digest < cfg.seekSeconds) {
    h.digest += dt;
    const dx = ctx.playerX - h.x;
    const dy = ctx.playerY - h.y;
    const len = Math.hypot(dx, dy) || 1;
    // It re-aims every frame, like the bomb fish: a homing round that overshoots is a round the player can beat
    // by moving, and one that does not is a round that has to be outrun.
    h.x += (dx / len) * seek * dt;
    h.y += (dy / len) * seek * dt;
  } else {
    h.y -= ctx.descentSpeed * 0.3 * dt;
  }
  return;
}
function stepZapper(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * A zapper drifts like a jellyfish and keeps its own discharge clock.
   *
   * The ring is attack AND warning at once: it is drawn for `ringSeconds` and only hurts while it is up, so a
   * player who watches can always be somewhere else. `dischargeRest` is per INSTANCE, so a row of them does not
   * pulse in lockstep -- that would be a wall rather than a pattern.
   */
  // The drift below is deliberately the jellyfish drift, so a shoal of them reads as jellyfish.
  if (h.dischargeRest > 0) h.dischargeRest -= dt;
  if (h.discharge > 0) h.discharge -= dt;
  h.y -= ctx.descentSpeed * 0.28 * dt;
  h.x += Math.sin(h.phase * 0.7 + h.seed) * 2.4 * dt;
  return;
}
function stepFoam(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Foam: it drifts with the water and breaks up on its own clock.
   *
   * It is the only hazard whose job is to make the picture WRONG -- it is drawn as a bubble much like the
   * player's own -- so it must also expire by itself. Interference that could persist forever would turn a level
   * about reading the water into a level about waiting.
   */
  h.foamLife -= dt;
  if (h.foamLife <= 0) h.flee = 'up';
  h.y -= ctx.descentSpeed * 0.6 * dt;
  h.x += Math.sin(h.phase * 0.9 + h.seed) * 3.2 * dt;
  return;
}
function stepRain(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Rain falls FASTER than the current, and that is its whole character.
   *
   * Everything else in the water moves at the level's scroll speed or slower; a drop that outruns the current
   * reads as coming from somewhere else -- which is the fiction, and also the mechanic, because the surface is
   * where the drops come from and the surface is what the player is trying to reach.
   */
  h.y -= ctx.laneWidth * mech.hazards.rain.fallSpeedFactor * dt;
  return;
}
function stepEel(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Swims in a wide S, and that is a fairness requirement rather than decoration.
   *
   * The eel is the one creature whose cost is paid by the PLAYER'S HANDS, so it has to be readable before it is
   * touched: a sine weave of this amplitude makes its heading obvious a second ahead, which is what turns
   * "my controls stopped working" from an ambush into something the player walked into.
   */
  h.y -= ctx.descentSpeed * 0.3 * dt;
  h.x += Math.sin(h.phase * 2.6 + h.seed) * ctx.laneWidth * 0.055 * dt;
  return;
}
function stepRot(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  // Barely moves and tumbles slowly: it is debris that has stopped being anything in particular.
  h.y -= ctx.descentSpeed * 0.2 * dt;
  h.x += Math.sin(h.phase * 0.6 + h.seed) * 3 * dt;
  return;
}
function stepOil(_field: HazardField, h: Hazard, dt: number, ctx: HazardContext): void {
  /**
   * Floats almost still, which is what makes it a decision rather than an obstacle.
   *
   * A slick that drifted would be something to avoid; a slick that hangs there is something the player has to
   * choose to touch. It also means a column of it can be left behind rather than chased.
   */
  h.y -= ctx.descentSpeed * 0.1 * dt;
  h.x += Math.sin(h.phase * 0.4 + h.seed) * 2 * dt;
  return;
}
/**
 * Which function moves which creature.
 *
 * A total record rather than a switch: the compiler is what enforces "every kind has a behaviour", exactly as it does
 * for the tables in `config/mechanics.json5`.
 */
const CREATURES: Record<HazardKind, CreatureStep> = {
  fish: stepFish,
  jelly: stepJelly,
  trash: stepTrash,
  crab: stepCrab,
  urchin: stepUrchin,
  bombfish: stepBombfish,
  boss: stepBoss,
  vent: stepVent,
  mineral: stepMineral,
  shrimp: stepShrimp,
  angler: stepAngler,
  torpedo: stepTorpedo,
  zapper: stepZapper,
  foam: stepFoam,
  rain: stepRain,
  eel: stepEel,
  rot: stepRot,
  oil: stepOil,
};

/**
 * What happens when the player TOUCHES a creature, one function per creature.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT WAS HERE BEFORE, AND WHAT THE TABLE IS FOR
 * ---------------------------------------------------------------------------------------------
 * This was a `switch (h.kind)` inside `update`, ten groups of cases (one of them eight kinds falling through to a single
 * body), each pushing effects and mutating the creature. It is a table now, for the same reason the motion became one:
 * a creature's behaviour is a named function rather than a case in the middle of a method, and `CONTACT_EFFECTS` being a
 * TOTAL record means a new kind with no contact rule is a compile error.
 *
 * These run only for a creature that is touching the player and past two shared gates, which is why they contain no
 * "is it close" test of their own:
 *
 *   - the REVERSAL, first: a creature the player can eat is swallowed instead, and its contact rule never runs;
 *   - a creature that is LEAVING cannot hurt anyone, which is the whole point of driving it off.
 *
 * `contactPlain` is shared by seven kinds on purpose and not by accident: being ordinary contact damage is the rule for
 * a negative food below its tier, and the consequence that makes it interesting is INSIDE (see `stomachEffect`).
 */
type ContactEffect = (field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]) => void;
function contactFish(field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  // COMEDY: a fish that crosses a bait bubble gets distracted and loses the player. This is an
  // OCCASIONAL beat, not the default outcome -- if a chase usually ends in the fish wandering
  // off, the swarm stops being a threat and the joke replaces the mechanic.
  if (field.baitEnabled && h.baitedUntil <= ctx.elapsed && Math.random() < hazardTuning.fishBaitChance) {
    h.baitedUntil = ctx.elapsed + hazardTuning.fishBaitSeconds;
    field.baits++;
    effects.push({ kind: 'fish', broke: true });
    return;
  }
  if (ctx.invulnerable || h.baitedUntil > ctx.elapsed) return;
  effects.push({ kind: 'fish', damage: 1, broke: false });
  // Bounce it away so one fish cannot immediately re-hit.
  h.y -= r * 2;
  return;
}

function contactJelly(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  if (ctx.invulnerable) return;
  /**
   * A sting: it SLOWS you AND costs a hit point.
   *
   * The slow is what the jellyfish is for -- it is the creature that punishes being in the wrong place at the
   * wrong time -- but on its own it made touching one strictly better than touching a fish, which is the one
   * thing a slow, unavoidable drifter must not be. It costs blood now, and the slow is what makes the cost
   * hurt: you are wounded AND clumsy in the second that follows.
   */
  effects.push({
    kind: 'jelly',
    damage: mech.hazards.jelly.contactDamage,
    slowSeconds: tuning.hazardSlowSeconds,
    slowFactor: tuning.hazardSlowFactor,
    broke: false,
  });
  // COMEDY: being bunted squashes it.
  h.squashed = 1;
  h.y -= r * 1.5;
  return;
}

function contactTrash(field: HazardField, h: Hazard, _ctx: HazardContext, effects: HazardEffect[]): void {
  if (!h.gripping) {
    h.gripping = true;
    field.grabs++;
    effects.push({ kind: 'trash', broke: false });
  }
  return;
}

function contactCrab(_field: HazardField, h: Hazard, _ctx: HazardContext, effects: HazardEffect[]): void {
  if (h.fired) return;
  // Only fires once it has actually armed and the telegraph has run. Touching an UNARMED crab
  // does nothing, which is what keeps the arc meaningful.
  if (!h.armed || h.fuse > 0) return;
  effects.push({ kind: 'crab', impulse: hazardTuning.crabLaunchMps, broke: true });
  h.fired = true;
  return;
}

function contactPlain(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  if (ctx.invulnerable) return;
  effects.push({ kind: h.kind, damage: 1, broke: false });
  // Bounce it away so one cannot immediately re-hit, as a fish does.
  h.y -= r * 2;
  return;
}

function contactShrimp(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  if (ctx.invulnerable) return;
  effects.push({ kind: 'shrimp', damage: mech.hazards.shrimp.contactDamage, broke: false });
  h.y -= r * 2;
  return;
}

function contactZapper(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  /**
   * The RING is the hitbox, not the bell.
   *
   * Touching a zapper is what makes it fire (below), and standing in a fired ring is what hurts -- so the two
   * are separate events and the player who keeps their distance is never hit. Reaching the ring requires being
   * within `ringRadiusRatio` of the bell rather than the usual body radius, which is the whole reason a ring
   * is drawable as a circle and readable as a range.
   */
  const zc = mech.hazards.zapper;
  const ring = ctx.laneWidth * zc.ringRadiusRatio;
  const gap = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
  if (gap <= r + ctx.laneWidth * ctx.playerRadiusFraction && h.discharge <= 0 && h.dischargeRest <= 0) {
    // Touched: it fires, whether or not the player is hurt by the contact itself.
    h.discharge = zc.ringSeconds;
    h.dischargeRest = zc.ringCooldownSeconds;
  }
  if (h.discharge <= 0 || gap > ring || ctx.invulnerable) return;
  effects.push({ kind: 'zapper', damage: zc.ringDamage, broke: false });
  // The bubble drinks the charge: this is where the level's whole mechanic starts.
  effects.push({ kind: 'zapper', charge: mech.hazards.charge.perRingHit, broke: false });
  return;
}

function contactFoam(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  /**
   * Foam does not hurt by default -- it exists to make the water unreadable.
   *
   * The effect is still reported because the caller needs to know it was TOUCHED: that is what tells the game
   * the player has just found out where they really are.
   */
  const fc = mech.hazards.foam;
  effects.push({ kind: 'foam', damage: ctx.invulnerable ? 0 : fc.contactDamage, broke: true });
  h.flee = 'up';
  return;
}

function contactRain(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  if (ctx.invulnerable) return;
  /**
   * A drop PRESSES the bubble back down, which is the mechanic rather than the damage.
   *
   * The push is what costs the player the height they just earned, so it is reported separately from the hit.
   */
  const rc = mech.hazards.rain;
  effects.push({ kind: 'rain', damage: rc.contactDamage, pushDown: rc.pushMeters, broke: true });
  h.flee = 'down';
  return;
}

function contactVent(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  /**
   * The plume: lethal while it is erupting, harmless while it is quiet.
   *
   * The gate is the same `phase` the painter reads, so the picture IS the hitbox -- there is no second timer
   * that could drift out of step with what the player can see.
   */
  const vent = mech.hazards.vent;
  if (h.phase >= vent.activeSeconds || ctx.invulnerable) return;
  effects.push({ kind: 'vent', damage: vent.contactDamage, broke: false });
  return;
}

function contactMineral(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  if (ctx.invulnerable) return;
  // Grit hurts, and it is SPENT by the hit rather than bouncing off: a particle is not a creature.
  effects.push({ kind: 'mineral', damage: 1, broke: true });
  h.flee = 'up';
  return;
}

function contactBoss(_field: HazardField, h: Hazard, ctx: HazardContext, effects: HazardEffect[]): void {
  const r = ctx.laneWidth * h.radiusFraction;
  if (ctx.invulnerable) return;
  effects.push({ kind: h.kind, damage: mech.hazards.boss.contactDamage, broke: false });
  // Bounce it away so one cannot immediately re-hit, as a fish does.
  h.y -= r * 2;
  return;
}

/**
 * Which function handles a touch from which creature.
 *
 * A total record, so the compiler is what enforces "every kind has a contact rule" -- the switch could not.
 */
const CONTACT_EFFECTS: Record<HazardKind, ContactEffect> = {
  fish: contactFish,
  jelly: contactJelly,
  trash: contactTrash,
  crab: contactCrab,
  urchin: contactPlain,
  bombfish: contactPlain,
  eel: contactPlain,
  rot: contactPlain,
  angler: contactPlain,
  torpedo: contactPlain,
  oil: contactPlain,
  boss: contactBoss,
  shrimp: contactShrimp,
  zapper: contactZapper,
  mineral: contactMineral,
  foam: contactFoam,
  rain: contactRain,
  vent: contactVent,
};

/**
 * Push a creature away from a point, scaled by its MASS.
 *
 * Heavy things shrug it off and light things are thrown, which keeps "the item keeps its own properties" true on the
 * receiving end as well as the sending end. It takes a position rather than a `Hazard` because one of its two callers
 * shoves creatures that are not in a field's list yet.
 *
 * A rule, not a mechanic of any one verb: the fart uses it (`pushImpact`) and so does a spent round
 * (`spitImpact`), and it was a private method on the game class until both callers moved out.
 */
export function shoveCreature(target: { kind: HazardKind; x: number; y: number }, dx: number, dy: number, impact: number): void {
  const mass = Math.max(0.05, hazardMass(target.kind));
  const shove = (mech.spit.knockbackMeters * impact) / mass;
  const length = Math.hypot(dx, dy);
  // Dead centre: pick a direction rather than dividing by zero, and up is the one that means something in a
  // vertical ascent.
  if (length < 1e-3) {
    target.y += shove;
    return;
  }
  target.x += (dx / length) * shove;
  target.y += (dy / length) * shove;
}

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
  /**
   * Lunges committed this run.
   *
   * Monotonic, like the other counters: a charge lasts well under a second, so sampling a boolean afterwards proves
   * nothing about whether it happened.
   */
  charges = 0;
  baits = 0;
  /**
   * Hazards EATEN, monotonic for the same reason as the others.
   *
   * The counter is how a test proves the reversal happened at all: the hazard is removed from the list on the
   * frame it is eaten, so sampling "is it still there" afterwards proves nothing.
   */
  eaten = 0;

  private nextId = 1;

  /**
   * Place one named hazard at a chosen spot, with a REAL id from the same counter the spawner uses.
   *
   * Exists for probes, and the id is the point rather than a detail. A probe that built the object itself would have
   * to invent an id, and "invent" in practice means reusing one -- which is not a cosmetic problem: the field
   * retires eaten hazards by collecting their IDS into a set, so two hazards sharing an id are two hazards that are
   * eaten together. A burst test that spawned four creatures and moved them apart reported that the wave had cleared
   * nothing, because the frame before it the player had swallowed one and the field had removed all four.
   */
  spawnForTest(kind: HazardKind, x: number, y: number): Hazard {
    const hazard = this.spawnAt(kind, x, y, { deterministic: true });
    this.hazards.push(hazard);
    return hazard;
  }
  private spawnTimer = 0;

  reset(): void {
    this.hazards = [];
    this.spawnTimer = 0;
    this.grabs = 0;
    this.charges = 0;
    this.baits = 0;
    this.eaten = 0;
    this.splits = 0;
    this.bubblesEaten = 0;
    this.fled = 0;
    this.killed = 0;
    this.damaged = 0;
  }

  /** Emergence counters, monotonic so "did it ever happen" is answerable. */
  splits = 0;
  bubblesEaten = 0;
  /**
   * Creatures driven off by the player's fire, and hits that landed without driving anything off.
   *
   * Both monotonic, for the same reason as the counters above: a creature that flees is gone from the list within a
   * second, so sampling afterwards proves nothing about whether it happened at all.
   */
  fled = 0;
  /** Bosses defeated this run. One number, because a level has one boss. */
  killed = 0;
  damaged = 0;

  /**
   * Everything `hit` has been told about since the last `takeHitEvents`.
   *
   * See `HazardHitEvent` for why this is the field's own list rather than a shared one.
   */
  private readonly hitEvents: HazardHitEvent[] = [];

  /** Hand over what has happened since the last call, and forget it. */
  takeHitEvents(): readonly HazardHitEvent[] {
    return this.hitEvents.splice(0, this.hitEvents.length);
  }

  /**
   * Take hit points off one creature, and let it go when they run out.
   *
   * Here rather than in the bullets' module because the STATE is this module's: `health` and `flee` belong to the
   * hazard, and a caller that reached in and set them would be a second place that knows what "driven off" means.
   * The return value is what happened, so the caller can count it and draw it without asking again.
   *
   * The direction is rolled HERE, once, at the moment it turns: deciding per frame would have it leave in a
   * direction that changes every frame, which reads as a glitch rather than as a decision.
   *
   * @param impact where the hit landed, in world metres, if the caller knows. It sets the DIRECTION of the recoil
   *   (away from where the round was), which is why it is worth passing: a round that lands slightly off-centre nudges
   *   the creature slightly sideways, and the same shot at the same creature reads differently twice. Omitted, the
   *   recoil is straight back up the screen.
   */
  hit(hazard: Hazard, damage: number, impact?: { x: number; y: number }): 'immune' | 'damaged' | 'fled' | 'killed' {
    // Immune covers both "this kind is not shootable" and "this one is already leaving": firing at something that
    // is on its way out should not keep re-triggering the same event, and it should certainly not re-roll its exit.
    if (hazard.maxHealth <= 0 || hazard.flee) return 'immune';
    hazard.health = Math.max(0, hazard.health - damage);
    /**
     * The flash is set for EVERY kind here, which is the only place that knows a bullet landed.
     *
     * It used to use the boss's own duration, so the boss flashed and nothing else did -- and since health is invisible,
     * "did I hit it?" had no answer for an ordinary fish. The duration now lives in `hazards.hitFlash`, where the rest of
     * the hit feedback does.
     */
    hazard.hitFlash = mech.hitFlash.seconds;
    /**
     * And so is the RECOIL, for the same reason: this is the one place that knows a round connected, so it is the one
     * place that can say "it got pushed". A new hit REPLACES whatever is left of the last one rather than adding to it,
     * which is what keeps a burst of fire from launching a fish across the lane.
     */
    this.applyKnock(hazard, impact);
    /**
     * A ZAPPER fires when it is shot.
     *
     * That is the whole reason it is interesting: every other creature rewards the player for shooting it, and this one
     * bills them. The shot still does its damage -- the ring is the consequence, not a replacement.
     */
    if (hazard.kind === 'zapper' && mech.hazards.zapper.dischargesWhenHit && hazard.dischargeRest <= 0) {
      hazard.discharge = mech.hazards.zapper.ringSeconds;
      hazard.dischargeRest = mech.hazards.zapper.ringCooldownSeconds;
    }
    if (hazard.health > 0) {
      this.damaged++;
      this.hitEvents.push({ x: impact?.x ?? hazard.x, y: impact?.y ?? hazard.y, radiusFraction: hazard.radiusFraction, kind: 'hit', colour: KIND_TUNING[hazard.kind].colour });
      return 'damaged';
    }
    /**
     * A BOMB does not run: it goes off.
     *
     * Zero hit points on a bomb fish means the fuse is lit where it floats, which is the trade the player is making
     * when they shoot one -- they cannot disarm it, only choose where it happens. Everything else is unchanged: the
     * blast is resolved by `update` on the next frame, through the same effect a lit fuse produces.
     */
    if (hazard.kind === 'bombfish') {
      hazard.blastFuse = 0;
      this.fled++;
      this.hitEvents.push({ x: impact?.x ?? hazard.x, y: impact?.y ?? hazard.y, radiusFraction: hazard.radiusFraction, kind: 'defeat', colour: KIND_TUNING[hazard.kind].colour });
      return 'fled';
    }
    /**
     * A BOSS dies, and that is a different event from anything else in this file.
     *
     * Every other creature leaves when its health runs out -- the whole point of the reversal is that nothing is
     * destroyed. A boss has nowhere to leave to: it is the level's win condition, so it is removed by the death, and
     * the outcome it reports is the one the game watches for to end the level. `killed` rather than `fled` is what
     * keeps "I survived that" and "I beat that" from being the same message.
     */
    if (hazard.kind === 'boss') {
      this.killed++;
      // The boss is the one thing that is KILLED rather than driven off, and it breaks like anything else.
      this.hitEvents.push({ x: impact?.x ?? hazard.x, y: impact?.y ?? hazard.y, radiusFraction: hazard.radiusFraction, kind: 'defeat', colour: KIND_TUNING[hazard.kind].colour });
      return 'killed';
    }
    /**
     * A creature that has been driven off DROPS ITS CHARGE.
     *
     * The charge branch runs first and returns early, and the field does not advance a creature that is leaving -- so a fish
     * that was lunging when it was driven off stayed frozen in its lunge for ever, faint in the leaving pass: invisible and
     * motionless, which is exactly what the owner reported as "it disappears after charging". Dropping the charge hands it back
     * to the leaving motion, which is the look that was designed.
     */
    hazard.charge = null;
    hazard.flee = FLEE_DIRECTIONS[Math.floor(Math.random() * FLEE_DIRECTIONS.length)]!;
    hazard.flee = FLEE_DIRECTIONS[Math.floor(Math.random() * FLEE_DIRECTIONS.length)]!;
    this.fled++;
    return 'fled';
  }

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
      /**
       * PER-FRAME STATE TICKS HERE, not inside `advance`.
       *
       * This loop runs for every live hazard whatever its behaviour is doing, and `advance` does not: it returns early for a
       * charge, for a path follower, and -- measured -- for a creature that is leaving, which is how the facing cooldown came
       * out as gaps of 0.61s and 6.64s instead of a flat 2s. Anything that must tick every frame belongs to the loop that
       * runs every frame.
       */
      if (h.hitFlash > 0) h.hitFlash = Math.max(0, h.hitFlash - dt);
      if (h.facingRest !== undefined && h.facingRest > 0) h.facingRest = Math.max(0, h.facingRest - dt);
      this.advance(h, dt, ctx);
      /**
       * A creature's trigger finger, kept out of `advance` on purpose.
       *
       * `advance` is the creature's MOVEMENT, and it already returns early for the flee, arrival and charge states;
       * putting the firing decision in there would mean repeating it on every one of those paths, and one of them
       * would eventually forget. Here it is one place, it can be suppressed by any state that means "busy", and the
       * caller gets an effect rather than a direct mutation of a field this module knows nothing about.
       */
      if (this.updateShooting(h, dt, ctx)) {
        effects.push({ kind: h.kind, broke: false, shot: { x: h.x, y: h.y } });
      }
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

      /**
       * A creature that is leaving cannot hurt the player, and that is the whole point of driving it off.
       *
       * Deliberately AFTER the reversal above: being edible is a rule about the player's size, not about the
       * creature's intentions, so a big enough bubble can still swallow a fish that is running away. What the flee
       * state buys is immunity from the damage half.
       */
      if (h.flee) continue;

      /**
       * One lookup instead of ten case groups: see `CONTACT_EFFECTS` for why, and for the two gates that already
       * ran by the time this is reached.
       */
      CONTACT_EFFECTS[h.kind](this, h, ctx, effects);
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
     * DETONATIONS, resolved before the cull so a bomb that went off this frame is retired as part of it.
     *
     * The fuse is ticked here rather than in `advance` because this is where the player's distance is already in hand
     * and where every other consequence of a creature's behaviour is turned into an effect. A blast that catches the
     * player pushes the same `damage` effect a collision would, so it goes through the one damage path the game has --
     * with the invulnerability window, the hit sound and the death all exactly as they are everywhere else.
     *
     * Shooting one dead counts: `hit` sets the fuse to zero, so a bomb killed at range explodes where it floats. That
     * is the whole trade of shooting it -- you do not disarm it, you choose WHERE it goes off.
     */
    const detonating = new Set<number>();
    for (const h of this.hazards) {
      if (h.blastFuse === null) continue;
      h.blastFuse -= dt;
      if (h.blastFuse > 0) continue;
      detonating.add(h.id);
      const cfg = mech.hazards.bombfish;
      const radius = ctx.laneWidth * cfg.blastRadiusRatio;
      const gap = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
      effects.push({
        kind: h.kind,
        broke: true,
        blast: { x: h.x, y: h.y, radius },
        // The radius is measured centre to centre, which at this scale is the honest reading: the bubble's own body is
        // a fifth of a lane at its largest, and a blast that spared it for standing at the edge would look wrong.
        damage: gap <= radius ? cfg.blastDamage : 0,
      });
    }

    /**
     * Retire what has left the working area, plus a trash bag that has been torn open, plus anything EATEN.
     *
     * `eaten` is a set rather than a flag on the hazard because the effects list is the only channel back to the
     * caller, and a hazard inside the bubble must not exist next frame to hit the player again on the way past.
     */
    const eatenIds = new Set(effects.filter((e) => e.eaten).map((e) => e.eaten!.id));
    this.hazards = this.hazards.filter((h) => {
      if (eatenIds.has(h.id) || detonating.has(h.id)) return false;
      const inside = h.y > ctx.min - 80 && h.y < ctx.max + 120;
      /**
       * A creature leaving through a SIDE needs retiring on the X axis, because the band above is a y test only.
       *
       * Without this a fish driven off to the left would sit outside the lane for ever -- invisible, but alive,
       * still counted as active and still in the water as far as everything else is concerned. Only a leaving
       * creature is tested this way: a side ENTRY starts outside the lane on purpose, and would be culled on the
       * frame it spawned.
       */
      if (h.flee && h.flee !== 'up') {
        const margin = ctx.laneWidth * h.radiusFraction * 2;
        if (h.x < -margin || h.x > ctx.laneWidth + margin) return false;
      }
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
    const radius = ctx.laneWidth * suctionRadiusFraction(ctx.playerVolume) * Math.max(0, at.radiusFactor);
    if (radius <= 0) return;
    const radiusSq = radius * radius;

    for (const h of this.hazards) {
      // A creature on its way out is not still hunting: it neither eats nor is distracted.
      if (h.flee) continue;
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
      // A fish that has been driven off stops feeding and cannot split: it is leaving, not hunting.
      if (h.flee) continue;
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
      // Leaving: it seeks nothing.
      if (h.flee) continue;

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

  /**
   * Build one creature.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THERE IS ONE OF THESE
   * ---------------------------------------------------------------------------------------------
   * Three places built a `Hazard` field by field: the random spawner, the probe hook, and `Game.makeHazard` for
   * everything a LEVEL places. Three lists of the same thirty fields, and they had drifted apart:
   *
   *   - only two of them used this field's id counter. The game's invented `-Math.floor(Math.random() * 1e9)` instead,
   *     which is precisely what the counter's own comment says it exists to prevent (two creatures sharing an id are two
   *     creatures eaten together);
   *   - only the random spawner gave a group a random head start on its charge and shot timers -- and that head start's
   *     comment says it is what stops a shoal volleying in unison, which is a statement about GROUPS, and the groups the
   *     player meets are the ones a level places;
   *   - one of them set a crab fuse on every creature regardless of kind.
   *
   * What the callers genuinely differ about is three things, so those are the options. Everything else about a creature
   * -- its size, its health, its per-kind initial state -- is decided here, once.
   */
  spawnAt(kind: HazardKind, x: number, y: number, opts: SpawnOptions = {}): Hazard {
    const radiusFraction = KIND_TUNING[kind].radius;
    /**
     * The boss's health comes from the LEVEL, so it can be overridden.
     *
     * The `hazards.health` row for it exists only so the per-kind tables stay complete, and it is 0, which every other
     * consumer reads as "not shootable" -- correct for a boss spawned by accident, wrong for the real one.
     */
    const health = opts.health ?? hazardHealth(kind);
    const headStart = opts.deterministic ? 0 : 1;
    return {
      id: this.nextId++,
      kind,
      x,
      y,
      radiusFraction,
      phase: opts.deterministic ? 0 : Math.random() * Math.PI * 2,
      seed: opts.deterministic ? 0 : Math.random() * 1000,
      baitedUntil: 0,
      squashed: 0,
      gripping: false,
      gripSeconds: 0,
      // The crab's launch fuse. The bomb fish's own fuses are elsewhere: one on this field's exterior timer, one on the
      // swallowed item in `src/spit.ts`. Per-kind, because only the crab lights one at birth.
      fuse: kind === 'crab' ? hazardTuning.crabFuseSeconds : 0,
      fired: false,
      armed: false,
      fed: 0,
      digest: 0,
      entry: opts.entry ?? null,
      health,
      maxHealth: health,
      flee: null,
      charge: null,
      blastFuse: null,
      hitFlash: 0,
      knock: null,
      discharge: 0,
      dischargeRest: 0,
      foamLife: kind === 'foam' ? mech.hazards.foam.lifeSeconds : 0,
      tint: null,
      // A random head start, so a group does not lunge in unison. Zero for a probe, where "did it lunge" must not be a
      // coin flip.
      chargeRest: headStart * Math.random() * (mech.charges.chargers[kind]?.cooldownSeconds ?? 0),
      // And a random offset on the trigger finger, so a colony does not volley.
      shootTimer: headStart * (Math.random() / Math.max(0.01, mech.enemyBullets.shooters[kind]?.perSecond ?? 1)),
      path: opts.path ?? null,
    };
  }

  private spawn(ctx: HazardContext): Hazard {
    const kinds: HazardKind[] = ['fish', 'jelly', 'trash', 'crab', 'urchin', 'bombfish', 'eel', 'rot', 'oil', 'boss', 'vent', 'mineral', 'shrimp', 'angler', 'torpedo', 'zapper', 'foam', 'rain'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)] ?? 'fish';
    const radiusFraction = KIND_TUNING[kind].radius;
    const margin = ctx.laneWidth * radiusFraction * 1.4;
    return this.spawnAt(kind, margin + Math.random() * Math.max(0.01, ctx.laneWidth - margin * 2), ctx.max + 20 + Math.random() * 40);
  }

  /**
   * Load a creature's recoil from one landed hit.
   *
   * The direction is BACK THE WAY THE ROUND CAME -- away from the impact point -- so what the player sees is the shot
   * pushing the creature the way the shot was going. Two things fall out of that for free: a round that lands
   * off-centre also nudges the creature sideways, and no config value is needed to say which way is "back", because
   * the impact itself says it.
   *
   * With no impact point (a chain discharge has no projectile) it is straight up the screen, which is where everything
   * the player fires comes from.
   */
  private applyKnock(h: Hazard, impact?: { x: number; y: number }): void {
    const cfg = mech.hitKnockback;
    /**
     * Per-creature multiplier, and there is exactly one creature that needs one: the boss holds station instead of
     * riding the current, so the same metres move a hovering giant rather than nudging something already drifting --
     * which reads as a shove. `hazards.boss.knockbackScale` is that judgement, and setting it to 0 makes the boss
     * immune to recoil (the flash is then the whole of its hit feedback).
     */
    const meters = cfg.meters * (h.kind === 'boss' ? Math.max(0, mech.hazards.boss.knockbackScale) : 1);
    if (meters <= 0 || cfg.seconds <= 0) return;
    let dirX = 0;
    let dirY = 1;
    if (impact) {
      const dx = h.x - impact.x;
      const dy = h.y - impact.y;
      const len = Math.hypot(dx, dy);
      // A round that landed exactly on the centre has no line to be pushed along, and normalising that would divide by
      // zero, so the default stands.
      if (len > 1e-3) {
        dirX = dx / len;
        dirY = dy / len;
      }
    }
    h.knock = { dirX, dirY, meters, seconds: cfg.seconds, elapsed: 0 };
  }

  /**
   * Spend some of a creature's recoil, and end it when the time is up.
   *
   * The speed DECAYS LINEARLY to zero across the configured seconds, which is what makes the configured `meters` the
   * distance actually travelled: with `v(t) = 2 * meters / seconds * (1 - t / seconds)`, the integral over the whole
   * window is exactly `meters`. Reading the speed off the ELAPSED time rather than scaling a stored velocity by a
   * per-frame factor is the same choice the lunge's curve makes -- the motion is a function of the time that has
   * passed, so it comes out identical whatever the frame rate did.
   *
   * A hit that lands on top of an unfinished recoil therefore moves the creature LESS than `meters`: a fresh recoil
   * replaces the old one and whatever distance it had left is lost. That is deliberate, and it is what keeps a burst of
   * fire from walking a fish backwards across the lane -- two hits nudge it twice.
   */
  private advanceKnock(h: Hazard, dt: number): void {
    const k = h.knock;
    if (!k) return;
    // Evaluated at the START of the step, so the frame the hit lands on moves at the full initial speed.
    const left = Math.max(0, 1 - k.elapsed / k.seconds);
    const speed = ((2 * k.meters) / k.seconds) * left;
    h.x += k.dirX * speed * dt;
    h.y += k.dirY * speed * dt;
    k.elapsed += dt;
    if (k.elapsed >= k.seconds) h.knock = null;
  }

  /**
   * A creature's frame: its own motion, and then the recoil it is carrying.
   *
   * The recoil is applied LAST and ON TOP rather than written into the kind's own movement, and that ordering is the
   * whole reason this is a wrapper. Two cases make it necessary:
   *
   *   - A creature on a PATH has its position SET from the spline every frame, so a shove added anywhere earlier in the
   *     frame would be overwritten by the path in the same frame -- the hit would be invisible on exactly the authored
   *     set pieces the level is built around.
   *   - `advanceKind` RETURNS EARLY for a lunge, an arrival and a creature that is leaving. Five early returns is five
   *     places that would each have to remember to move the recoil, and the fifth one would eventually be forgotten.
   */
  private advance(h: Hazard, dt: number, ctx: HazardContext): void {
    this.advanceKind(h, dt, ctx);
    this.advanceKnock(h, dt);
  }

  /**
   * Per-kind motion.
   *
   * All of them travel DOWN relative to the player, but none outruns the ascent: a hazard the player
   * cannot see coming is not a hazard, it is a coin flip.
   */
  private advanceKind(h: Hazard, dt: number, ctx: HazardContext): void {
    h.phase += dt;
    /**
     * The hit flash ticks HERE, before anything can return.
     *
     * It used to tick at the end, and the charge branch (and the path branch) return early -- so a creature that was hit and
     * then lunged stayed white for the whole lunge, which reads as "this one is permanently flashing" rather than as "I hit
     * it once". A flash is a property of the BODY, so it belongs with the body's clock, not with whichever behaviour happens
     * to be running this frame.
     */
    const base = ctx.descentSpeed;

    /**
     * DRIVEN OFF: out in one direction, and nothing else.
     *
     * Checked before the arrival state, because being shot is not something a creature should be able to ignore by
     * still swimming in, and checked before the kind's own motion for the reason `entry` is: this has to REPLACE the
     * chase rather than be added to it, or a fish would keep closing on the player while "fleeing".
     *
     * The speed is in SCREEN HEIGHTS per second rather than as a multiple of the current, and the band is where it
     * comes from. The current is only ~25 m/s while a screenful of water is ~800 m tall, so "twice the current"
     * -- which sounds fast -- is a creature that takes half a minute to get out of view. "0.9 screens per second"
     * says what the player actually sees.
     *
     * A sideways exit is a straight line, NOT a swim: it does not drift with the water, because it is out of the
     * fight and the only thing left to read is which way it went. Over the half second a crossing takes, the
     * current would move it a metre or two anyway.
     */
    if (h.flee) {
      const screen = Math.max(1, ctx.max - ctx.min);
      const step = screen * mech.hazards.fleeScreensPerSecond * dt;
      if (h.flee === 'up') h.y += step;
      else h.x += h.flee === 'right' ? step : -step;
      return;
    }

    /**
     * ---------------------------------------------------------------------------------------------
     * ARRIVING, which replaces the kind's own motion rather than adding to it
     * ---------------------------------------------------------------------------------------------
     * A creature entering from a side or from below moves straight in at its entry speed and does nothing else until
     * it is inside the play area. Adding its own motion on top would be the wrong shape twice over: a fish would
     * chase the player while still off-screen (so it would turn round and leave), and a `bottom` entry would be
     * fighting the kind's own descent -- the two together would leave it hanging below the screen for ever.
     *
     * The `bottom` case is the one that needs explaining. `base` is the current: everything in the water descends at
     * that rate relative to the player, so to rise into view from behind, a creature has to swim UP faster than the
     * scroll. That is why the entry speed is a speed rather than a distance, and why the config's default (45
     * against a scroll of 25) has to have real headroom.
     */
    if (h.entry) {
      const margin = ctx.laneWidth * hazardTuning.insideMarginRatio;
      let inside = false;
      switch (h.entry.from) {
        case 'left':
          h.x += h.entry.speed * dt;
          inside = h.x >= margin;
          break;
        case 'right':
          h.x -= h.entry.speed * dt;
          inside = h.x <= ctx.laneWidth - margin;
          break;
        case 'bottom':
          h.y += (base + h.entry.speed) * dt;
          /**
           * It rises until it is level with the PLAYER, not merely until it is on screen.
           *
           * The first version ended the arrival at the bottom edge of the view, and the result was a creature that
           * appeared for a moment and then sank away: everything in this game descends relative to the player (the
           * current carries the whole level down), so the instant a bottom-entered creature stops rising it starts
           * losing ground. Ending the arrival at the player's own depth is what makes "it came up from behind" true
           * rather than a flicker -- and after that it behaves like the kind it is, which for most kinds means it
           * falls behind again, and for a crab means it launches.
           */
          inside = h.y >= ctx.playerY;
          break;
      }
      if (!inside) return;
      h.entry = null;
    }

    /**
     * ---------------------------------------------------------------------------------------------
     * THE LUNGE: a committed curve, and the telegraph that makes it fair
     * ---------------------------------------------------------------------------------------------
     * Placed after the arrival state (a creature still swimming in has not committed to anything) and before the
     * kind's own motion, because a charge REPLACES that motion -- see the field's docblock for why.
     *
     * The wind-up is not decoration. A creature that instantly snapped onto the player would be a hit the player
     * could only have avoided by not being there, and this game's contract is that things are visible before they
     * matter. So the first `telegraphSeconds` of a charge is spent holding station with the curve drawn on screen,
     * and that IS the dodge window.
     */
    if (h.charge) {
      const row = mech.charges.chargers[h.kind];
      // A kind that stopped being a charger mid-run (the config changed under it) simply finishes the lunge it is on.
      const cfg = row ?? { telegraphSeconds: 0.75, travelSeconds: 0.55, cooldownSeconds: 2.2, bowRatio: 0.3, triggerMeters: 300 };
      h.charge.elapsed += dt;
      if (h.charge.elapsed < cfg.telegraphSeconds) {
        // Winding up: it holds station while the current carries it down with everything else. It does NOT reposition:
        // the lunge begins wherever it happens to be standing (see the commit below for why).
        h.y -= base * dt;
        return;
      }
      const t = Math.min(1, (h.charge.elapsed - cfg.telegraphSeconds) / Math.max(0.05, cfg.travelSeconds));
      const { fromX, fromY, toX, toY, bow } = h.charge;
      /**
       * A quadratic Bezier through a bowed control point.
       *
       * The control point is the midpoint pushed PERPENDICULAR to the path by `bow` metres, which is what turns a
       * straight lunge into something whose direction has to be read. Evaluated from `t` rather than accumulated per
       * frame, so the path is identical whatever the frame rate did -- the same reasoning as the score popups' rise.
       */
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const span = Math.hypot(toX - fromX, toY - fromY) || 1;
      const ctrlX = midX + (-(toY - fromY) / span) * bow;
      const ctrlY = midY + ((toX - fromX) / span) * bow;
      const u = 1 - t;
      h.x = u * u * fromX + 2 * u * t * ctrlX + t * t * toX;
      h.y = u * u * fromY + 2 * u * t * ctrlY + t * t * toY;
      if (t >= 1) {
        h.charge = null;
        h.chargeRest = cfg.cooldownSeconds;
      }
      return;
    }

    /**
     * Committing to a lunge.
     *
     * The rest timer runs whatever the creature is doing, so a fish that has just charged cannot commit again the
     * moment it drifts back into range.
     *
     * The aim point is the player's position AT THIS INSTANT and never updates: that is the difference between a
     * pattern to dodge and a homing attack, and it is why everything the player does during the wind-up counts.
     */
    /**
     * A creature on a PATH may SHOOT but never CHARGE.
     *
     * A charge is a committed curve aimed at the player, and a path is a committed curve the level author aimed: letting
     * both run at once means the authored shape is abandoned the moment the player comes near, so the string that was
     * supposed to sweep across the screen instead turns and dives. Guns stay on -- a fish that shoots while it weaves is
     * still the shape the level asked for, plus pressure.
     */
    const charger = h.path ? undefined : mech.charges.chargers[h.kind];
    if (charger) {
      h.chargeRest = Math.max(0, h.chargeRest - dt);
      const dist = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
      if (h.chargeRest <= 0 && dist <= charger.triggerMeters) {
        /**
         * The lunge starts WHERE THE CREATURE IS.
         *
         * An earlier version had the jellyfish slide out to a flank during its wind-up, so that it "came in from the
         * side". It read as a glitch, and the owner said so: the creature visibly travelled to a spot and only then
         * jumped, which looks like two moves rather than one attack. What makes a charge come in from the side is the
         * CURVE -- the bow below -- not a staging position.
         *
         * The bow is away from whichever side the creature is on, so two of them on opposite sides curve apart rather
         * than tracing the same line.
         */
        const onLeft = h.x < ctx.playerX;
        const span = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
        h.charge = {
          fromX: h.x,
          fromY: h.y,
          toX: ctx.playerX,
          toY: ctx.playerY,
          bow: (onLeft ? 1 : -1) * charger.bowRatio * span,
          elapsed: 0,
        };
        this.charges++;
        return;
      }
    }
    /**
     * A creature on a PATH is placed on it, and nothing else moves it.
     *
     * Handled before the per-kind switch rather than as a case inside it, because a path is not a kind of movement -- it
     * is an instruction that overrides whatever that kind would otherwise do. A fish told to swim a spline swims the
     * spline: it does not also chase the player, which is what keeps an authored shape the shape that was authored.
     *
     * The curve is a Catmull-Rom through the waypoints, which is the spline that PASSES THROUGH its control points --
     * the reason to author a path is to say "come through here", and a Bézier would only come near it.
     */
    if (h.path) {
      h.path.elapsed += dt;
      const t = Math.min(1, h.path.elapsed / Math.max(0.1, h.path.seconds));
      const at = pathPoint(h.path.points, t);
      const before = { x: h.x, y: h.y };
      /**
       * `x` is ABSOLUTE (a lane fraction from the lane's left edge), `y` is relative to the spawn.
       *
       * The asymmetry is deliberate. Where a thing IS on screen is what a path is for -- "come in at the right edge and
       * leave past the left one" is a statement about the screen -- while its height is a statement about the level,
       * where the only meaningful origin is the point it entered at. Adding the spawn's x to the path's x (as this
       * first did) put a fish authored at x=1.25 at 2.25 lanes, which is what "the string never arrives" looks like.
       */
      h.x = at.x * ctx.laneWidth;
      h.y = h.path.startY + at.y;
      // The facing follows the tangent, so a fish swimming left is drawn swimming left.
      if (Math.abs(h.x - before.x) > 0.001) h.seed = Math.sign(h.x - before.x) > 0 ? Math.abs(h.seed) : -Math.abs(h.seed);
      /**
       * The END of the path retires it, and only that: a path may start and finish outside the lane, so the usual cull
       * would delete the whole string on the frame it spawned.
       */
      if (t >= 1) h.flee = 'up';
      return;
    }

    /**
     * One lookup instead of eighteen cases: see `CREATURES` for why, and for what is deliberately still here.
     */
    CREATURES[h.kind](this, h, dt, ctx);

    /**
     * The clamp that keeps ordinary creatures in the lane, skipped for anything on a PATH.
     *
     * A path is placed on screen coordinates on purpose: entering past the right edge and leaving past the left one is
     * the effect being authored, and clamping x to the lane pinned both ends to the edges -- the string arrived at the
     * right-hand wall and stopped there instead of swimming in from outside it.
     */
    if (!h.path) h.x = Math.max(0, Math.min(ctx.laneWidth, h.x));
  }

  /**
   * Whether this creature fires this frame.
   *
   * ---------------------------------------------------------------------------------------------
   * WHAT MAKES ENEMY FIRE FAIR, IN ONE PLACE
   * ---------------------------------------------------------------------------------------------
   * The shots are AIMED at the player's current position and never corrected afterwards, so they can be read and
   * stepped out of; the speed is a fraction of a lane per second (see `enemyBullets.shooters`) and is slower than the
   * player's own lateral speed, so the dodge is always physically available; and a shooter only fires from inside
   * `enemyBullets.rangeMeters`, so a round can never arrive from a creature the player cannot see.
   *
   * A creature that is fleeing, still arriving or mid-lunge does not shoot: all three mean "busy", and a fish that
   * lunged AND fired from inside its own telegraph would be two threats wearing one warning.
   */
  private updateShooting(h: Hazard, dt: number, ctx: HazardContext): boolean {
    const row = mech.enemyBullets.shooters[h.kind];
    if (!row) return false;
    if (h.flee || h.entry || h.charge) return false;
    const gap = 1 / Math.max(0.01, row.perSecond);
    const dist = Math.hypot(ctx.playerX - h.x, ctx.playerY - h.y);
    // Out of range the timer HOLDS rather than banking: a creature that drifted off and came back should not open
    // with a burst of the shots it saved up.
    if (dist > mech.enemyBullets.rangeMeters) {
      h.shootTimer = Math.max(h.shootTimer, gap);
      return false;
    }
    h.shootTimer -= dt;
    if (h.shootTimer > 0) return false;
    // Carried rather than reset, so a slow frame does not turn a cadence into a stutter -- the same reasoning as the
    // player's gun.
    h.shootTimer += gap;
    if (h.shootTimer <= 0) h.shootTimer = gap;
    return true;
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
 *
 * `which` splits the two populations, and it is what lets a LEAVING creature be drawn dimmer: every alpha below is
 * written per shape, so there is no one number to scale -- the caller draws the in-play ones into one layer and the
 * leaving ones into another whose `alpha` is `hazards.fleeAlpha`. Same shapes, same colours, one pass each, and the
 * dimming cannot drift from the drawing because it is the drawing, faded. The codex passes `in-play` and gets what
 * the water shows.
 */

/**
 * The anglerfish's lure, drawn in code because the art does not carry it.
 *
 * A stem and a bulb with a soft halo, all sized as fractions of the creature's radius, and BRIGHTNESS that breathes. In
 * code rather than baked into the picture for the reason the owner gave: adding it to the art means re-exporting every
 * time the glow is tuned, and a glowing lure is the one part of this creature that has to move.
 */
function paintLure(
  g: Graphics,
  x: number,
  y: number,
  r: number,
  lure: NonNullable<NonNullable<typeof mech.hazardArt[string]>['lure']>,
  elapsed: number,
): void {
  const safe = (v: number, fallback: number): number => (Number.isFinite(v) ? v : fallback);
  const pulse =
    safe(lure.pulseMin, 0.6) +
    (safe(lure.pulseMax, 1.2) - safe(lure.pulseMin, 0.6)) * (0.5 + 0.5 * Math.sin(safe(elapsed, 0) * safe(lure.pulsePerSecond, 1) * Math.PI * 2));
  /**
   * The stem has an ANGLE, because the art already draws the rod.
   *
   * A picture of an anglerfish comes with its lure; what it does not come with is the light. So the code adds the glow and
   * the angle and length are there to point it at the tip of whatever rod the artist drew -- two numbers, no re-export.
   */
  const { tipX, tipY, baseX, baseY } = lureTip(x, y, r, lure, isYFlipped(g));
  if (LURE_PROBE.length >= LURE_PROBE_CAP) LURE_PROBE.shift();
  LURE_PROBE.push({ x, y, r, tipX, tipY, angle: lure.stemAngle, glowRadius: lure.glowRadius });
  if (lure.stemWidth > 0) {
    g.moveTo(baseX, baseY)
      .lineTo(tipX, tipY)
      .stroke({ color: lure.stemColour, width: Math.max(0.5, r * lure.stemWidth) });
  }
  // Halo first, then the bulb on top of it: the light is what the eye should land on.
  if (Number.isFinite(tipX) && Number.isFinite(tipY)) {
    g.circle(tipX, tipY, r * safe(lure.glowRadius, 0.8)).fill({ color: lure.glowColour, alpha: safe(lure.glowAlpha, 0.5) * pulse });
  }
  g.circle(tipX, tipY, r * safe(lure.bulbRadius, 0.2)).fill({ color: lure.bulbColour, alpha: Math.min(1, pulse) });
}

/**
 * The white matrix: every channel forced to 1, alpha untouched. "The whole picture turns white."
 *
 * The owner's suggestion, and it is the right shape for a SPRITE: a filter on the object itself needs no shared layer, so
 * there is no ordering question and no group alpha to compute wrong -- both of which is where the first attempt at this
 * failed when the objects were Graphics.
 *
 * Built on FIRST USE rather than at module load, and the difference is not tidiness: a `ColorMatrixFilter` compiles a GL
 * program when it is constructed, which needs a canvas, so constructing one at the top level made this whole module
 * unloadable outside a browser -- `import('./hazards')` under Node threw `document is not defined` before a single line of
 * the simulation could be reached. Nothing else in this file touches the GPU until something is drawn.
 */
let WHITE_OUT: ColorMatrixFilter | null = null;

function whiteOutFilter(): ColorMatrixFilter {
  if (!WHITE_OUT) {
    WHITE_OUT = new ColorMatrixFilter();
    WHITE_OUT.matrix = [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0];
  }
  return WHITE_OUT;
}

/**
 * One sprite per creature that has art, keyed by the hazard's id, plus the texture cache.
 *
 * Pooled rather than rebuilt: a creature lives for seconds and there can be a dozen on screen, so building a Sprite per
 * frame is the bug that has already cost this project two rounds.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS POOL IS MODULE-LEVEL WHILE THE HIT QUEUE IS THE FIELD'S
 * ---------------------------------------------------------------------------------------------
 * Because two DIFFERENT fields draw through `paintHazards`: the game's own, and the throwaway one `src/codexUi.ts`
 * builds for a card. A per-field pool would mean a card rebuilt its sprite on every redraw and left the previous one
 * behind, and it is the reason the sweep below is by TIME rather than by "is this hazard still in the field" -- an
 * id-based sweep deletes the card's sprite on the very next frame, which showed up as the anglerfish's glow blinking
 * out in the book. Moving this into `HazardField` looks tidier and breaks the codex.
 */
const ART_SPRITES = new Map<number, Sprite>();
/** When each pooled sprite was last asked for, for the time-based sweep. */
const ART_SEEN = new Map<number, number>();
/** A monotonic clock for the sweep, set by the painter on each pass. */
let ART_NOW = 0;
const ART_TEXTURES = new Map<string, Texture>();

function artTexture(name: string): Texture | null {
  const cached = ART_TEXTURES.get(name);
  if (cached) return cached;
  const url = assetUrl(name);
  if (!url) return null;
  const image = new Image();
  image.onload = () => {
    void image
      .decode()
      .then(() => {
        const texture = Texture.from(image);
        // Guarded: a zero-width texture makes every `width =` downstream divide by zero, which is how the player bubble
        // became enormous twice.
        if (texture.width > 0 && texture.height > 0) ART_TEXTURES.set(name, texture);
      })
      .catch(() => console.warn('[hazardArt] could not decode ' + name));
  };
  image.onerror = () => console.warn('[hazardArt] could not load ' + name);
  image.src = url;
  // Nothing yet: the caller falls back to the drawn body for as long as that lasts, so a picture is an upgrade to the
  // creature rather than a precondition for it.
  ART_TEXTURES.set(name, null as unknown as Texture);
  return null;
}

/**
 * Retire sprites that have not been used for a while, so the pool tracks the water rather than growing for ever.
 *
 * BY TIME, not by "is this hazard still in the field", and the difference matters: the codex draws its cards through this
 * same painter with a one-object field it builds fresh each redraw, so an id-based sweep deleted the card's sprite on the
 * very next frame -- the book would have shown the anglerfish's glow blinking out. A sprite that has not been asked for in a
 * second belongs to nothing.
 */
const ART_SPRITE_TTL_SECONDS = 1;

function pruneArtSprites(): void {
  if (ART_SPRITES.size === 0) return;
  const now = ART_NOW;
  for (const [id, sprite] of ART_SPRITES) {
    if (now - ART_SEEN.get(id)! > ART_SPRITE_TTL_SECONDS) {
      sprite.destroy();
      ART_SPRITES.delete(id);
      ART_SEEN.delete(id);
    }
  }
}

/**
 * Where a lure's stem starts and its bulb sits.
 *
 * Extracted so the geometry can be MEASURED. "The glow is not visible" was answered twice by adjusting brightness, which is
 * guessing; a function can be asked what it computed.
 */
export function lureTip(
  x: number,
  y: number,
  r: number,
  lure: { stemAngle: number; stemFrom: number; stemLength: number; glowRadius: number },
  layerFlipped: boolean,
): { baseX: number; baseY: number; tipX: number; tipY: number } {
  /**
   * Every number is defaulted before use, and that is the point of this function rather than a nicety.
   *
   * A missing key used to become NaN, and a Graphics asked to draw at NaN draws NOTHING -- no error, no warning, just an
   * absent glow that three rounds of brightness tuning could not explain. `num` here is the difference between "the config
   * is wrong" and "the feature is broken".
   */
  const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  const angle = (num(lure.stemAngle, 0) * Math.PI) / 180;
  const dirX = Math.sin(angle);
  /**
   * "Up" is not the same +y in both places the painter is used.
   *
   * The water draws into a Y-FLIPPED layer (world +y is up), so a positive y in the painter goes up the screen. The codex's
   * icon layer is NOT flipped, so the same positive y goes DOWN -- which put the anglerfish's lure through its own belly,
   * where it was invisible. Asking the layer rather than assuming is what the player bubble and the sprite both had to learn.
   */
  const dirY = Math.cos(angle) * (layerFlipped ? 1 : -1);
  const from = num(lure.stemFrom, 0.3);
  const length = num(lure.stemLength, 0.8);
  const baseX = x + dirX * r * from;
  const baseY = y + dirY * r * from;
  return { baseX, baseY, tipX: baseX + dirX * r * length, tipY: baseY + dirY * r * length };
}

/** Test hook: the art sprite for a creature, so a probe can check what is on it. */
export function hazardArtSpriteForTest(id: number): Sprite | null {
  return ART_SPRITES.get(id) ?? null;
}

/**
 * The last few lures drawn, for probes.
 *
 * A bounded ring rather than a log, and the bound is the point: this is written on every frame a lanternfish is on
 * screen, so an unbounded push retains every lure drawn for the life of the page. It is also the probe that answered "the
 * glow is not visible" -- it printed `tipX: null`, which is NaN, and that is how a config key that had landed inside a
 * comment was found. A probe that leaks is a probe that gets deleted rather than capped, and this one is worth keeping.
 */
const LURE_PROBE_CAP = 8;

export const LURE_PROBE: { x: number; y: number; r: number; tipX: number; tipY: number; angle: number; glowRadius: number }[] = [];

/**
 * What just happened to whom, for the presentation to turn into particles.
 *
 * A queue rather than a callback because damage arrives from several places and this is the one funnel they all share: the
 * simulation should not know what a spark is, and the renderer should not have to be told about bullets.
 *
 * It is the FIELD's queue rather than a module-level array, because that is whose ids and whose radius fractions these
 * are: the codex draws creatures through `paintHazards` with a throwaway field, and a shared queue meant the game was
 * draining events that a page turn had nothing to do with. The field hands them over on request, so each frame takes
 * exactly what the field produced.
 *
 * The radius is a LANE FRACTION, not metres: the field does not know the lane's width, and the caller (which does) is the
 * one that draws in world units. At the impact point when there is one, so a spark is where the bullet landed rather than
 * where the creature's centre happens to be.
 */
export interface HazardHitEvent {
  x: number;
  y: number;
  radiusFraction: number;
  kind: 'hit' | 'defeat';
  colour: number;
}

/**
 * How each creature is DRAWN, one function per creature.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A TABLE
 * ---------------------------------------------------------------------------------------------
 * The last of the per-kind switches. It was an eighteen-case `switch (h.kind)` in the middle of `paintHazards`, 464
 * lines of it, so "how does a crab look" was a case in the biggest function in the file and a new creature meant
 * finding the right place in it. The creature's own behaviour is a function (see `CREATURES`), what it does on contact
 * is a function (`CONTACT_EFFECTS`), and what it looks like is a function.
 *
 * These are called only for a creature with NO artwork: a picture, when one exists, is drawn instead and skips this
 * entirely -- so this is both the fallback while a sheet loads and the finished state for the kinds that have no sheet.
 * `x` and `y` are `h.x` and `h.y`; `r` is the body radius in metres, which the painter has already computed from the
 * lane width and the kind's radius fraction.
 */
type CreatureDraw = (g: Graphics, h: Hazard, r: number, laneWidth: number, elapsed: number) => void;
function drawFish(g: Graphics, h: Hazard, r: number, _laneWidth: number, elapsed: number): void {
  /**
   * Facing its direction of travel; the tail trails behind.
   *
   * A fish that is LEAVING faces the way it is going, which is the one case where the direction is a fact
   * rather than a guess: `flee` says 'left' or 'right' and the body has to agree with it, or the exit reads as
   * a fish sliding backwards out of frame.
   */
  const dir = h.flee ? (h.flee === 'left' ? -1 : 1) : Math.sign(h.x - 0) || 1;
  g.ellipse(h.x, h.y, r * 1.5, r * 0.75).fill({ color: KIND_TUNING.fish.colour, alpha: 0.85 });
  g.moveTo(h.x - dir * r * 1.3, h.y)
    .lineTo(h.x - dir * r * 2.2, h.y - r * 0.6)
    .lineTo(h.x - dir * r * 2.2, h.y + r * 0.6)
    .closePath()
    .fill({ color: KIND_TUNING.fish.colour, alpha: 0.6 });
  // A baited fish gets a blank stare: no eye, just a dot.
  if (h.baitedUntil > elapsed) {
    g.circle(h.x + dir * r * 0.5, h.y - r * 0.15, r * 0.16).fill({ color: 0xffffff, alpha: 0.9 });
  } else {
    g.circle(h.x + dir * r * 0.7, h.y - r * 0.1, r * 0.2).fill({ color: 0x08131f, alpha: 0.9 });
  }
  return;
}

function drawJelly(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  const squash = 1 + h.squashed * 0.5;
  g.ellipse(h.x, h.y, r * squash, r * (1 / squash)).fill({ color: KIND_TUNING.jelly.colour, alpha: 0.55 });
  g.ellipse(h.x, h.y, r * squash, r * (1 / squash)).stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.95, width: Math.max(1, r * 0.12) });
  /**
   * Tentacles trail DOWNWARD behind it -- which means SMALLER world y, not larger.
   *
   * `toScreenY` is `cy - (worldY - camera.y) * scale`, so up the screen is +y in world metres. The tentacles were
   * drawn at `y + r * 0.8 .. y + r * 2.3`, i.e. above the dome, and the jellyfish read as a creature standing on
   * its tentacles. They hang from the underside of the bell now.
   */
  for (let i = -2; i <= 2; i++) {
    const tx = h.x + (i / 2) * r * 0.6;
    const wob = Math.sin(h.phase * 2.4 + i) * r * 0.35;
    g.moveTo(tx, h.y - r * 0.8)
      .lineTo(tx + wob, h.y - r * 2.3)
      .stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.5, width: Math.max(1, r * 0.1) });
  }
  return;
}

function drawTrash(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  const spin = Math.sin(h.phase * 0.9 + h.seed) * 0.25;
  g.moveTo(h.x - r, h.y + r * (0.6 + spin))
    .lineTo(h.x + r * 0.9, h.y + r * (0.8 - spin))
    .lineTo(h.x + r * 0.7, h.y - r * 0.9)
    .lineTo(h.x - r * 0.8, h.y - r * 0.7)
    .closePath()
    .fill({ color: KIND_TUNING.trash.colour, alpha: 0.7 });
  g.moveTo(h.x - r * 0.6, h.y - r * 0.6)
    .lineTo(h.x + r * 0.5, h.y - r * 0.5)
    .stroke({ color: 0x6d5232, alpha: 0.8, width: Math.max(1, r * 0.14) });
  return;
}

function drawCrab(g: Graphics, h: Hazard, r: number, _laneWidth: number, elapsed: number): void {
  // TELEGRAPH FIRST: a visible arc showing exactly where the player will be thrown.
  if (h.fuse > 0) {
    const progress = 1 - h.fuse / hazardTuning.crabFuseSeconds;
    const arcTop = h.y + hazardTuning.crabLaunchMps * hazardTuning.crabApexSeconds * progress;
    g.moveTo(h.x, h.y)
      .quadraticCurveTo(h.x, (h.y + arcTop) / 2 + r * 3, h.x, arcTop)
      .stroke({ color: 0xffd479, alpha: 0.15 + progress * 0.5, width: Math.max(1, r * 0.18) });
    // Sand puffs while it winds up.
    for (let i = 0; i < 3; i++) {
      const p = (h.phase * 1.8 + i * 0.33) % 1;
      g.circle(h.x + Math.sin(i * 2.1) * r * 1.4, h.y - r * 0.5 - p * r * 2.2, r * (0.16 + p * 0.2)).fill({
        color: 0xd9c39a,
        alpha: 0.3 * (1 - p),
      });
    }
  }
  g.ellipse(h.x, h.y, r * 1.35, r * 0.95).fill({ color: KIND_TUNING.crab.colour, alpha: 0.9 });
  // Claws, plus legs that flail after firing.
  const flail = h.fired ? Math.sin(elapsed * 14) * 0.6 : 0;
  for (const side of [-1, 1]) {
    g.circle(h.x + side * r * 1.35, h.y - r * 0.3, r * 0.4).stroke({ color: KIND_TUNING.crab.colour, alpha: 0.9, width: Math.max(1, r * 0.16) });
    for (let i = -1; i <= 1; i++) {
      g.moveTo(h.x + side * r * 0.9, h.y + r * 0.5)
        .lineTo(h.x + side * r * 1.7, h.y + r * (1.1 + i * 0.3) + flail * r * 0.6)
        .stroke({ color: KIND_TUNING.crab.colour, alpha: 0.75, width: Math.max(1, r * 0.13) });
    }
  }
  return;
}

function drawUrchin(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * A dark ball of needles, rotating slowly.
   *
   * SHAPE is the whole message: at the size this reads on a phone, a ball with spikes is unmistakable against
   * every other silhouette in the game, and the eye picks it up before any colour does. Which is what a
   * hazard the player must DECIDE about needs -- being surprised by an urchin is not a decision.
   *
   * The needles are the same colour at full opacity over a dimmer body rather than a second colour, so the
   * one entry in KIND_TUNING still describes the whole creature.
   */
  const spin = h.phase * 0.35 + h.seed;
  g.circle(h.x, h.y, r * 0.92).fill({ color: KIND_TUNING.urchin.colour, alpha: 0.55 });
  const needles = 11;
  for (let i = 0; i < needles; i++) {
    const a = (i / needles) * Math.PI * 2 + spin;
    g.moveTo(h.x + Math.cos(a) * r * 0.7, h.y + Math.sin(a) * r * 0.7)
      .lineTo(h.x + Math.cos(a) * r * 1.55, h.y + Math.sin(a) * r * 1.55)
      .stroke({ color: KIND_TUNING.urchin.colour, alpha: 0.95, width: Math.max(1, r * 0.16) });
  }
  g.circle(h.x, h.y, r * 0.95).stroke({ color: KIND_TUNING.urchin.colour, alpha: 1, width: Math.max(1, r * 0.2) });
  return;
}

function drawVent(g: Graphics, h: Hazard, r: number, laneWidth: number, _elapsed: number): void {
  /**
   * A black smoker: a rock chimney with a plume, and the plume is the hazard.
   *
   * The reading order is deliberate. The CHIMNEY is always drawn (it is terrain, and terrain does not flicker).
   * The PLUME is drawn only while it is erupting, in a colour that brightens through the warning, so "is it
   * dangerous right now" is answered by whether the column is there at all -- the one question the player has to
   * be able to answer at a glance, since getting it wrong is death.
   */
  const cfg = mech.hazards.vent;
  const erupting = h.phase < cfg.activeSeconds;
  const warning = h.phase > cfg.periodSeconds - cfg.warnSeconds;
  // The chimney: a dark cone standing on the seabed.
  g.moveTo(h.x - r, h.y)
    .lineTo(h.x - r * 0.35, h.y + r * 2.2)
    .lineTo(h.x + r * 0.35, h.y + r * 2.2)
    .lineTo(h.x + r, h.y)
    .closePath()
    .fill({ color: cfg.plumeColour, alpha: 1 });
  const top = h.y + r * 2.2;
  const height = laneWidth * 1.5;
  if (erupting || warning) {
    const heat = erupting ? 1 : 0.35;
    // Smoke, widening as it rises, so the column reads as a column rather than as a bar.
    g.moveTo(h.x - r * 0.4, top)
      .lineTo(h.x - r * 1.25, top + height)
      .lineTo(h.x + r * 1.25, top + height)
      .lineTo(h.x + r * 0.4, top)
      .closePath()
      .fill({ color: cfg.plumeColour, alpha: 0.5 * heat });
    g.moveTo(h.x - r * 0.25, top)
      .lineTo(h.x - r * 0.9, top + height)
      .lineTo(h.x + r * 0.9, top + height)
      .lineTo(h.x + r * 0.25, top)
      .closePath()
      .fill({ color: cfg.glowColour, alpha: 0.35 * heat });
  }
  /**
   * The dangerous WIDTH, drawn as two edges while the plume is up.
   *
   * This is the line the player actually steers by: the smoke is decoration, and a lethal hitbox that is only
   * implied by decoration is the one kind of unfair this level cannot afford.
   */
  if (erupting) {
    for (const side of [-1, 1]) {
      g.moveTo(h.x + side * r, top)
        .lineTo(h.x + side * r * 1.25, top + height)
        .stroke({ color: cfg.edgeColour, alpha: cfg.edgeAlpha, width: Math.max(1, r * 0.12) });
    }
  }
  return;
}

function drawFoam(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * Foam, drawn as a bubble much like the player's own.
   *
   * That is the point of it: the level's interference is that the player cannot tell at a glance which bubble is
   * theirs. It is deliberately paler and softer-edged than the real one -- a fair version of the trick, because a
   * decoy that was pixel-identical would be a lie rather than a puzzle.
   */
  const fc = mech.hazards.foam;
  g.circle(h.x, h.y, r).fill({ color: fc.colour, alpha: fc.alpha });
  g.circle(h.x, h.y, r).stroke({ color: fc.rimColour, alpha: fc.rimAlpha, width: Math.max(1, r * 0.1) });
  // A few smaller bubbles clinging to it, which is what foam actually looks like.
  for (const [ox, oy, scale] of [[0.8, 0.6, 0.35], [-0.7, 0.5, 0.28], [0.2, -0.9, 0.24]]) {
    g.circle(h.x + r * ox, h.y + r * oy, r * scale).fill({ color: fc.colour, alpha: fc.alpha * 0.8 });
  }
  return;
}

function drawRain(g: Graphics, h: Hazard, r: number, laneWidth: number, _elapsed: number): void {
  // A drop: a short vertical streak, because the direction of the threat has to be readable in one frame.
  const rc = mech.hazards.rain;
  const len = laneWidth * rc.lengthRatio;
  g.moveTo(h.x, h.y + len).lineTo(h.x, h.y).stroke({ color: rc.colour, alpha: 0.75, width: Math.max(1, r * 1.2) });
  g.circle(h.x, h.y, r).fill({ color: rc.colour, alpha: 0.95 });
  return;
}

function drawZapper(g: Graphics, h: Hazard, r: number, laneWidth: number, elapsed: number): void {
  /**
   * An electric jellyfish: a violet bell, a few thick tentacles, and the discharge ring.
   *
   * The ring is drawn at exactly the radius the hitbox uses (`ringRadiusRatio`), which is the rule this project
   * keeps everywhere: what the player aims at and what the game tests are the same number, or the picture is a
   * lie. It fades as it expires, so "how much of it is left" is answerable from the picture alone.
   */
  const zc = mech.hazards.zapper;
  const ring = laneWidth * zc.ringRadiusRatio;
  g.ellipse(h.x, h.y, r, r * 0.85).fill({ color: zc.bellColour, alpha: 0.85 });
  g.ellipse(h.x, h.y, r, r * 0.85).stroke({ color: 0xffffff, alpha: 0.5, width: Math.max(1, r * 0.12) });
  for (const offset of [-0.5, 0, 0.5]) {
    g.moveTo(h.x + r * offset, h.y - r * 0.5)
      .lineTo(h.x + r * offset * 1.6 + Math.sin(elapsed * 1.5 + offset * 4) * r * 0.3, h.y - r * 2.4)
      .stroke({ color: zc.bellColour, alpha: 0.7, width: Math.max(1, r * 0.14) });
  }
  if (h.discharge > 0) {
    const left = Math.max(0, Math.min(1, h.discharge / Math.max(0.01, zc.ringSeconds)));
    g.circle(h.x, h.y, ring * (0.4 + 0.6 * (1 - left))).stroke({
      color: zc.ringColour,
      alpha: zc.ringAlpha * left,
      width: Math.max(1, r * 0.35 * (0.4 + left)),
    });
    g.circle(h.x, h.y, ring * 0.55).fill({ color: zc.ringColour, alpha: 0.12 * left });
  }
  return;
}

function drawMineral(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  // Grit: a hot speck with a short bright tail behind it, so its UPWARD direction is unmistakable.
  g.circle(h.x, h.y - r * 1.6, r * 1.6).fill({ color: mech.hazards.vent.edgeColour, alpha: 0.25 });
  g.circle(h.x, h.y, r).fill({ color: KIND_TUNING.mineral.colour, alpha: 1 });
  g.circle(h.x, h.y, r * 1.9).stroke({ color: mech.hazards.vent.edgeColour, alpha: 0.5, width: Math.max(1, r * 0.35) });
  return;
}

function drawShrimp(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  // A pale, blind drifter: a curved body, no eyes, and antennae that read as "feeling its way".
  g.ellipse(h.x, h.y, r * 1.5, r * 0.85).fill({ color: KIND_TUNING.shrimp.colour, alpha: 0.95 });
  g.moveTo(h.x - r * 1.4, h.y + r * 0.2)
    .lineTo(h.x - r * 2.3, h.y - r * 0.3)
    .lineTo(h.x - r * 2.4, h.y + r * 0.5)
    .closePath()
    .fill({ color: KIND_TUNING.shrimp.colour, alpha: 0.8 });
  for (const tilt of [-0.35, 0.35]) {
    g.moveTo(h.x + r * 1.2, h.y + r * tilt)
      .lineTo(h.x + r * 2.6, h.y + r * tilt * 2.4)
      .stroke({ color: KIND_TUNING.shrimp.colour, alpha: 0.7, width: Math.max(1, r * 0.16) });
  }
  return;
}

function drawAngler(g: Graphics, h: Hazard, r: number, laneWidth: number, elapsed: number): void {
  /**
   * A lanternfish: a dark body and a lit lure on a stalk in front of it.
   *
   * The lure is drawn LAST and brightest -- it is the thing the player's eye goes to, which is exactly the trap.
   * It hangs on the side the creature will lunge toward, so the bait already points the way it is going to come.
   */
  const cfg = mech.hazards.angler;
  const facing = h.x < laneWidth * 0.5 ? 1 : -1;
  g.ellipse(h.x, h.y, r * 1.4, r * 0.95).fill({ color: KIND_TUNING.angler.colour, alpha: 1 });
  g.moveTo(h.x - facing * r * 1.2, h.y)
    .lineTo(h.x - facing * r * 2.2, h.y - r * 0.6)
    .lineTo(h.x - facing * r * 2.2, h.y + r * 0.6)
    .closePath()
    .fill({ color: KIND_TUNING.angler.colour, alpha: 0.9 });
  // Teeth, because a lunge has to be advertised as a mouth and not as a nudge.
  for (const step of [-0.4, 0, 0.4]) {
    g.moveTo(h.x + facing * r * 1.3, h.y + r * step)
      .lineTo(h.x + facing * r * 1.7, h.y + r * step + r * 0.16)
      .stroke({ color: 0xffffff, alpha: 0.7, width: Math.max(1, r * 0.12) });
  }
  const lurePulse = 1 + 0.18 * Math.sin(elapsed * cfg.lurePulsePerSecond * Math.PI * 2);
  const lx = h.x + facing * r * cfg.lureOffsetRatio * 2.4;
  const ly = h.y - r * 1.5;
  g.moveTo(h.x + facing * r * 0.8, h.y - r * 0.7)
    .lineTo(lx, ly)
    .stroke({ color: cfg.lureColour, alpha: 0.55, width: Math.max(1, r * 0.1) });
  g.circle(lx, ly, laneWidth * cfg.lureRadiusRatio * 3 * lurePulse).fill({ color: cfg.lureColour, alpha: 0.16 });
  g.circle(lx, ly, laneWidth * cfg.lureRadiusRatio * lurePulse).fill({ color: cfg.lureColour, alpha: 0.95 });
  return;
}

function drawTorpedo(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * A torpedo: a metal cylinder with a lit nose, pointing the way it is going.
   *
   * `fed` tells the painter which half of its life it is in, so the LOOK changes when it turns -- the dive light
   * goes from white to red. That is the only warning the player gets that a dodged round is now a pursuer, and
   * without it the turn is invisible.
   */
  const cfg = mech.hazards.torpedo;
  const homing = h.fed >= cfg.runMeters;
  // No transform stack on a Graphics in this project: the body is drawn along the lane and the FIN carries the
  // tilt, which is enough to read a turn without a rotation.
  const droop = homing ? r * 0.5 : 0;
  g.roundRect(h.x - r * 1.7, h.y - r * 0.55, r * 3.4, r * 1.1, r * 0.5).fill({ color: KIND_TUNING.torpedo.colour, alpha: 1 });
  g.moveTo(h.x + r * 1.7, h.y - r * 0.55).lineTo(h.x + r * 2.4, h.y).lineTo(h.x + r * 1.7, h.y + r * 0.55).closePath().fill({ color: 0xc9d4de, alpha: 1 });
  g.circle(h.x + r * 1.9, h.y, r * 0.34).fill({ color: homing ? 0xff5a5a : 0xdff3ff, alpha: 1 });
  // A tail flame while it is running, which is the "it is coming" half of the warning.
  g.moveTo(h.x - r * 1.7, h.y)
    .lineTo(h.x - r * (homing ? 3.4 : 2.6), h.y + droop)
    .stroke({ color: homing ? 0xff8a5a : 0xa8d8ff, alpha: 0.6, width: Math.max(1, r * 0.4) });
  if (homing) {
    // The turn itself, drawn: two fins that were flat while it ran and are swept back once it is hunting.
    for (const side of [-1, 1]) {
      g.moveTo(h.x - r * 1.2, h.y + side * r * 0.5)
        .lineTo(h.x - r * 2.2, h.y + side * r * 1.4)
        .lineTo(h.x - r * 0.6, h.y + side * r * 0.6)
        .closePath()
        .fill({ color: KIND_TUNING.torpedo.colour, alpha: 0.9 });
    }
  }
  return;
}

function drawBoss(g: Graphics, h: Hazard, r: number, laneWidth: number, _elapsed: number): void {
  /**
   * The boss: a heavy armoured body with an eye, drawn BIG and unmistakable.
   *
   * It borrows the fish's silhouette on purpose -- it should read as "a creature, and much larger" rather than as
   * a different order of thing -- and adds two marks that only it has: a plated shell and a single lit eye. The
   * colour comes from the instance when the level set one (`tint`), so two levels do not look like the same
   * monster.
   */
  const cfg = mech.hazards.boss;
  const body = h.tint ?? cfg.colour;
  const flash = h.hitFlash > 0;
  g.ellipse(h.x, h.y, r * 1.35, r * 1.05).fill({ color: flash ? cfg.hitFlashColour : body, alpha: flash ? 0.85 : 1 });
  // Armour plates: three bands across the back, which is what makes it look like it can take a hit.
  for (const band of [-0.45, 0, 0.45]) {
    g.moveTo(h.x - r * 1.2, h.y + r * band * 0.8)
      .lineTo(h.x + r * 1.2, h.y + r * band * 0.8)
      .stroke({ color: cfg.armourColour, alpha: 0.75, width: Math.max(1, r * 0.16) });
  }
  // A jaw, so the front is not ambiguous.
  g.moveTo(h.x + r * 1.2, h.y - r * 0.5)
    .lineTo(h.x + r * 1.75, h.y)
    .lineTo(h.x + r * 1.2, h.y + r * 0.5)
    .closePath()
    .fill({ color: cfg.armourColour, alpha: 0.9 });
  g.circle(h.x + r * 0.55, h.y + r * 0.1, r * 0.24).fill({ color: cfg.eyeColour, alpha: 1 });
  // A weak-point ring: the game's way of saying "this is the thing to shoot".
  g.circle(h.x, h.y, r * 1.06).stroke({
    color: cfg.eyeColour,
    alpha: 0.5,
    width: Math.max(1, laneWidth * cfg.weakPointWidthRatio),
  });
  return;
}

function drawBombfish(g: Graphics, h: Hazard, r: number, _laneWidth: number, elapsed: number): void {
  /**
   * A round, heavy fish with a stub of fuse, which is the whole joke: it looks like a bomb.
   *
   * The stub is NOT drawn burning: it has no timer of its own. While it hunts, the timer is the ARMING ring
   * below; while it is inside the player, the countdown is drawn on the bubble (see `Game.drawStomach`).
   */
  /**
   * A LIT FUSE, drawn around the body: a ring that closes in as the clock runs out.
   *
   * The same language the crab's launch arc uses -- a threat states its own timing, so the player never has to
   * guess whether this one is about to go off. Inside the case rather than as a general overlay because only one
   * kind has an external fuse.
   */
  if (h.blastFuse !== null) {
    const total = Math.max(0.01, mech.hazards.bombfish.fuseSeconds);
    const left = Math.max(0, Math.min(1, h.blastFuse / total));
    const pulse = 0.75 + 0.25 * Math.sin(elapsed * 22);
    g.circle(h.x, h.y, r * (1.3 + 1.6 * (1 - left))).stroke({
      color: KIND_TUNING.bombfish.colour,
      alpha: (0.35 + 0.5 * (1 - left)) * pulse,
      width: Math.max(1, r * 0.22),
    });
  }
  g.ellipse(h.x, h.y, r * 1.25, r * 1.1).fill({ color: KIND_TUNING.bombfish.colour, alpha: 0.9 });
  // A stubby tail, so it still reads as a fish rather than as a ball.
  g.moveTo(h.x - r * 1.1, h.y)
    .lineTo(h.x - r * 2.1, h.y - r * 0.55)
    .lineTo(h.x - r * 2.1, h.y + r * 0.55)
    .closePath()
    .fill({ color: KIND_TUNING.bombfish.colour, alpha: 0.65 });
  // The fuse: a short stub off the top, in a dull cord colour, with the cap it will be lit from.
  g.moveTo(h.x, h.y + r * 1.0)
    .lineTo(h.x + r * 0.25, h.y + r * 1.75)
    .stroke({ color: 0x8a7a5c, alpha: 0.9, width: Math.max(1, r * 0.16) });
  g.circle(h.x + r * 0.25, h.y + r * 1.85, r * 0.16).fill({ color: 0xe8d9b0, alpha: 0.9 });
  g.circle(h.x + r * 0.75, h.y + r * 0.1, r * 0.18).fill({ color: 0x08131f, alpha: 0.9 });
  return;
}

function drawEel(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * A long thin body in an S, with a spark at the head.
   *
   * The only creature drawn as a LINE rather than a blob, which is the point: at a glance the silhouette has
   * to say "this is the one that does something to my hands", and a shape nothing else in the water shares is
   * how that gets said without a legend. The curve is sampled from the same phase its motion uses, so the
   * drawing and the weaving cannot disagree about which way it is going.
   *
   * A FULL SINE along the body, and only about three radii long. The first version bent the tail linearly and
   * ran to four and a half radii, which came out as a 90-metre wedge -- it read as an arrow, not a fish, and
   * it was drawn across a quarter of the lane. The head is taken from the same curve rather than placed, so
   * the eye cannot end up floating beside its own body.
   */
  const spark = 0.4 + 0.6 * Math.abs(Math.sin(h.phase * 6));
  const half = r * 1.6;
  const bendAt = (t: number): number => Math.sin(h.phase * 2.2 + h.seed + t * Math.PI * 2.2) * r * 0.55;
  const points: number[] = [];
  const segments = 10;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push(h.x - half + t * half * 2, h.y + bendAt(t));
  }
  g.poly(points);
  g.stroke({ color: KIND_TUNING.eel.colour, alpha: 0.9, width: Math.max(1, r * 0.32) });
  // The head, and the spark that says "electric".
  const headX = h.x + half;
  const headY = h.y + bendAt(1);
  g.circle(headX, headY, r * 0.42).fill({ color: KIND_TUNING.eel.colour, alpha: 0.95 });
  for (let i = 0; i < 3; i++) {
    const a = h.phase * 3 + (i / 3) * Math.PI * 2;
    g.moveTo(headX, headY)
      .lineTo(headX + Math.cos(a) * r * 0.85, headY + Math.sin(a) * r * 0.85)
      .stroke({ color: KIND_TUNING.eel.colour, alpha: 0.5 * spark, width: Math.max(1, r * 0.1) });
  }
  return;
}

function drawRot(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * A lumpy mass with bubbles coming off it.
   *
   * Drawn as a polygon whose radius wobbles rather than as a circle: it is decaying, so a clean edge would be
   * the wrong shape. The bubbles are the readable part -- they say "this is rotting" without a word, and they
   * are the only animated exhaust in the game.
   */
  const points: number[] = [];
  const lobes = 11;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const wob = 1 + Math.sin(a * 3 + h.phase * 0.7 + h.seed) * 0.16;
    points.push(h.x + Math.cos(a) * r * wob, h.y + Math.sin(a) * r * wob);
  }
  points.push(points[0]!, points[1]!);
  g.poly(points);
  g.fill({ color: KIND_TUNING.rot.colour, alpha: 0.72 });
  for (let i = 0; i < 3; i++) {
    const p = (h.phase * 0.5 + i * 0.33) % 1;
    g.circle(h.x + Math.sin(i * 2.3 + h.seed) * r * 0.7, h.y + r * 0.6 + p * r * 2.4, r * (0.1 + p * 0.16)).stroke({
      color: KIND_TUNING.rot.colour,
      alpha: 0.5 * (1 - p),
      width: Math.max(1, r * 0.1),
    });
  }
  return;
}

function drawOil(g: Graphics, h: Hazard, r: number, _laneWidth: number, _elapsed: number): void {
  /**
   * A flat slick, wider than it is tall, with a sheen across it.
   *
   * Wider than tall because that is what makes it read as a SUBSTANCE lying on the water rather than as a
   * creature swimming in it -- and the sheen line is what says "oil" rather than "rock". It is also the only
   * hazard that is easier to go around than through, so its silhouette wants to be wide.
   */
  const points: number[] = [];
  const lobes = 13;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const wob = 1 + Math.sin(a * 4 + h.phase * 0.35 + h.seed) * 0.14;
    points.push(h.x + Math.cos(a) * r * 1.15 * wob, h.y + Math.sin(a) * r * 0.72 * wob);
  }
  points.push(points[0]!, points[1]!);
  g.poly(points);
  g.fill({ color: KIND_TUNING.oil.colour, alpha: 0.85 });
  g.poly(points);
  g.stroke({ color: KIND_TUNING.oil.colour, alpha: 1, width: Math.max(1, r * 0.16) });
  // The sheen: one arc across the top, in the only place light would catch a film of oil.
  g.moveTo(h.x - r * 0.8, h.y + r * 0.25)
    .quadraticCurveTo(h.x, h.y + r * 0.62, h.x + r * 0.8, h.y + r * 0.25)
    .stroke({ color: 0xbfe8dd, alpha: 0.5, width: Math.max(1, r * 0.12) });
  return;
}

/**
 * Which function draws which creature.
 *
 * Total, like the other per-kind tables: a new kind with no drawing is a compile error rather than a creature that is
 * invisible and — worse — silently unmissable, since a hazard with no body still has a hitbox.
 */
const CREATURE_DRAWING: Record<HazardKind, CreatureDraw> = {
  fish: drawFish,
  jelly: drawJelly,
  trash: drawTrash,
  crab: drawCrab,
  urchin: drawUrchin,
  bombfish: drawBombfish,
  eel: drawEel,
  rot: drawRot,
  oil: drawOil,
  boss: drawBoss,
  vent: drawVent,
  mineral: drawMineral,
  shrimp: drawShrimp,
  angler: drawAngler,
  torpedo: drawTorpedo,
  zapper: drawZapper,
  foam: drawFoam,
  rain: drawRain,
};

export function paintHazards(
  g: Graphics,
  field: HazardField,
  laneWidth: number,
  elapsed: number,
  canEat: (kind: HazardKind) => boolean,
  which: 'in-play' | 'leaving' = 'in-play',
  /**
   * Where the player is, so a creature can face it.
   *
   * Trailing and optional because the codex draws the same creatures with no player in the room: a card shows the picture as
   * the artist drew it, unmirrored, which is what a reference page should do.
   */
  playerX = Number.NaN,
): void {
  ART_NOW += 1;
  if (which === 'in-play') pruneArtSprites();
  for (const h of field.hazards) {
    // A creature is in exactly one of the two passes, so nothing is drawn twice and nothing is missed.
    if (which === 'leaving' ? !h.flee : h.flee) continue;
    const r = laneWidth * h.radiusFraction;
    const x = h.x;
    const y = h.y;

    /**
     * THE WARNING FOR A LUNGE, drawn before anything else the creature is made of.
     *
     * It has to be ABOVE the art branch below, and that placement is the whole point of this block being here. A
     * creature with a picture is drawn from the picture and then `continue`s -- so anything below that branch is
     * silently not drawn for it. The warning is not part of the body: it is a statement about what the creature is
     * about to DO, and it must survive a creature getting art. It did not, and the lanternfish -- the one charger with
     * pictures -- lunged with no warning line at all while every drawn creature showed one. Measured: 24 frames of a
     * forced lunge drew the warning for the fish and the jellyfish, and the angler drew it exactly once, on the frame
     * before its artwork decoded.
     *
     * Drawn before the creature so the warning reads as something moving through the water rather than as a label
     * attached to the fish. The same curve the motion uses, sampled into a polyline (Pixi has no partial
     * `quadraticCurveTo`). While the creature is winding up, the WHOLE path plus a ring at the aim point is drawn: that
     * is the promise of where it will go, and it is what makes aiming at where the player was a fair thing to do. Once
     * it has committed, only the travelled part is drawn, as a trail -- the warning has been delivered and what is left
     * to show is the move.
     */
    if (h.charge) {
      const cfg = mech.charges;
      const row = cfg.chargers[h.kind];
      const window = row?.telegraphSeconds ?? 0.75;
      const { fromX, fromY, toX, toY, bow, elapsed: chargeAge } = h.charge;
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const span = Math.hypot(toX - fromX, toY - fromY) || 1;
      const ctrlX = midX + (-(toY - fromY) / span) * bow;
      const ctrlY = midY + ((toX - fromX) / span) * bow;
      const winding = chargeAge < window;
      const head = winding ? 1 : Math.min(1, (chargeAge - window) / Math.max(0.05, row?.travelSeconds ?? 0.55));
      const STEPS = 12;
      g.moveTo(fromX, fromY);
      for (let i = 1; i <= STEPS; i++) {
        const t = (i / STEPS) * head;
        const u = 1 - t;
        g.lineTo(u * u * fromX + 2 * u * t * ctrlX + t * t * toX, u * u * fromY + 2 * u * t * ctrlY + t * t * toY);
      }
      // A pulse while winding up, so a still line reads as a countdown rather than as scenery.
      const pulse = 0.7 + 0.3 * Math.sin(elapsed * 18);
      g.stroke({
        color: winding ? cfg.telegraphColour : cfg.trailColour,
        alpha: (winding ? cfg.telegraphAlpha : cfg.trailAlpha) * (winding ? pulse : 1),
        width: Math.max(1, r * 0.18),
      });
      if (winding) {
        g.circle(toX, toY, r * 0.7 * pulse).stroke({
          color: cfg.telegraphColour,
          alpha: cfg.telegraphAlpha * 0.8,
          width: Math.max(1, r * 0.14),
        });
      }
    }

    /**
     * A creature with a picture is drawn from it, and its kind's branch is skipped.
     *
     * The fallback matters as much as the picture: while a texture is still loading (or if the file is missing) the drawn
     * body is used, so art is an upgrade to a creature rather than a precondition for it. That is the same call the bullets
     * make, and it was learned the hard way there.
     */
    const art = mech.hazardArt[h.kind];
    if (art) {
      /**
       * The wind-up pose belongs to the WIND-UP, not to the whole charge.
       *
       * It used to be shown whenever `h.charge` was set, which meant a curled shrimp stayed curled through the lunge and the
       * recovery as well -- the pose said "I am about to spring" for the entire move, including the part where it has already
       * sprung. The telegraph duration is read from the same row the charge geometry uses, so "the pose ends when the wind-up
       * ends" is true by construction rather than by two numbers agreeing.
       */
      const chargeRow = mech.charges.chargers[h.kind];
      const telegraphSeconds = chargeRow?.telegraphSeconds ?? 0.75;
      const windingUp = h.charge !== null && h.charge.elapsed < telegraphSeconds;
      const name = windingUp && art.charge ? art.charge : art.move;
      const texture = artTexture(name);
      if (texture) {
        let sprite = ART_SPRITES.get(h.id);
        if (!sprite) {
          sprite = new Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.eventMode = 'none';
          /**
           * BEHIND the painter's own layer, so the lure the painter draws is over the picture rather than under it.
           *
           * Adding it after covered the glow with the fish: the light was drawn, and nobody could see it.
           */
          const parent = g.parent;
          if (parent) parent.addChildAt(sprite, Math.max(0, parent.getChildIndex(g)));
          ART_SPRITES.set(h.id, sprite);
        }
        ART_SEEN.set(h.id, ART_NOW);
        const size = r * 2 * art.scale;
        sprite.texture = texture;
        sprite.visible = true;
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = art.alpha * (h.flee ? mech.hazards.fleeAlpha : 1);
        // The world is Y-flipped, so the picture's own Y is negative to keep it upright -- see the player bubble.
        /**
         * Upright in BOTH places, because the flip is asked of the parent chain rather than assumed.
         *
         * Negative Y in the water (whose world container is flipped) and positive in the codex (whose is not) -- the same
         * call, the right answer in each, which is what the preview needs and what a hard-coded sign cannot give.
         */
        const unit = size / texture.width;
        /**
         * FACING: mirrored when the creature's front does not already point at the player.
         *
         * The picture's front is `front` (the kind's own, or the global default). If the player is on the side the front
         * already faces, nothing happens; otherwise the sprite is mirrored on X. X is a plain axis (unlike Y, which the world
         * flips), so a negative X scale IS the mirror and nothing has to be undone.
         */
        const front = art.front ?? mech.hazardFront;
        // No player (a codex card) means no turning: the picture is shown as drawn.
        // A missing player means no turning TOWARDS one -- but a creature leaving left still turns left (see below).
        /**
         * LEAVING beats LOOKING.
         *
         * A creature on its way out faces the way it is going: left if it exits left, right if it exits right. It stops
         * tracking the player the moment it has decided to leave, because the player is no longer what it is reacting to --
         * and a fish swimming off to the left while still staring right reads as a bug, not as a retreat.
         *
         * An exit UPWARDS keeps the facing it had: "up" says nothing about which way it is pointing, and flipping sideways
         * while rising away would be a twitch nobody asked for.
         */
        const exitSide = h.flee === 'left' ? 'left' : h.flee === 'right' ? 'right' : null;
        const playerIsLeft = playerX < h.x;
        const wantFrontLeft = exitSide ? exitSide === 'left' : playerIsLeft;
        /**
         * The turn is COMMITTED for `cooldownSeconds`, which is the whole point of this block.
         *
         * A creature with the player almost exactly above or below it would otherwise re-decide every frame as the player
         * drifts across its centre line, and the picture would strobe. The first decision is taken at once -- a creature
         * entering the water should look at the player immediately -- and later ones wait their turn.
         */
        const wantFacing = ((front === 'left') !== wantFrontLeft) ? -1 : 1;
        if (h.facing === undefined) {
          h.facing = wantFacing;
          h.facingRest = 0;
        } else if (wantFacing !== h.facing && (h.facingRest ?? 0) <= 0) {
          h.facing = wantFacing;
          h.facingRest = mech.hazardFacing.cooldownSeconds;
        }
        const facing = h.facing;
        sprite.scale.set(unit * facing, isYFlipped(sprite) ? -Math.abs(unit) : Math.abs(unit));
        /**
         * The white flash, as a filter ON THE SPRITE.
         *
         * This is the owner's suggestion and it is the right one: the earlier attempt whitened a shared Graphics layer,
         * which brought in layer ordering and a group alpha that could compute to zero -- and a transparent layer and an
         * absent one look identical in a screenshot. Per object, there is nothing to get wrong.
         */
        sprite.filters = h.hitFlash > 0 ? [whiteOutFilter()] : [];
        if (art.lure) paintLure(g, x, y, r, art.lure, elapsed);
        continue;
      }
    }

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

    /**
     * One lookup instead of eighteen cases: see `CREATURE_DRAWING`. Only reached when the creature has no picture.
     */
    CREATURE_DRAWING[h.kind](g, h, r, laneWidth, elapsed);
  }

  /**
   * No ellipse pass here any more.
   *
   * The flash for a creature is the SPRITE turning white (see the art branch above, which puts a colour matrix on the sprite
   * while it flashes). The ellipse was a stand-in for creatures drawn as shapes; every creature is heading for a picture, and
   * a white blob over a picture is not the picture turning white.
   */
}

// NOTE: a slow effect has to be legible ON THE PLAYER, not in a status bar. Ringing the bubble while
// it lasts is the cheapest honest way to show "you are still slowed", so the caller draws that
// around the bubble rather than this function painting something at the origin.













































































