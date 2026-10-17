import { Graphics } from 'pixi.js';
import { mech } from './config';
import { boxDistance, hazardBoxFractions, hazardSizeFraction, type Hazard, type HazardField, type HazardKind } from './hazards';
import type { ObstacleField, ObstacleKind } from './obstacles';

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
  /**
   * Seconds in flight. The only state a round has beyond where it is, until it is a homing round.
   *
   * It decides everything else about the round: how fast it is going, how big it is, and when it expires. That is
   * deliberate -- speed and radius used to be fields set at birth, and a round cannot both remember its own speed
   * and be accelerating.
   */
  age: number;
  /**
   * Set only on a round that left the muzzle TRACKING, and absent on every other round -- including every round in
   * a run that never took the card, which is what keeps the ordinary gun exactly as cheap as it was.
   *
   * Optional rather than always-present because a round that is not homing has no target, no sideways speed and no
   * arc, and three fields of nothing on every round would be the ordinary case paying for the special one. It is
   * also what lets the two bullet probes keep building rounds as bare `{ x, y, age }` literals.
   */
  homing?: HomingState;
  /**
   * Set only on a round from a shotgun's volley: how far off straight-up it flies, in RADIANS, signed.
   *
   * An angle rather than a sideways speed, and that is the whole mechanic. The round's SPEED is a function of its
   * age (`speedOf`), so a fixed `vx` would make the pellet's flight curve as it accelerated; holding the angle means
   * a straight diagonal whose sideways rate grows with its forward rate, which is what a barrel does.
   *
   * Absent on every round of the ordinary gun, so the cost of the shotgun's geometry is paid only by shotguns -- the
   * same bargain `homing` makes on the line above.
   */
  angle?: number;
}

/**
 * What a round is doing when it is NOT flying straight: what it is chasing, and how fast it is sliding sideways.
 *
 * This is genuinely accumulated state rather than a function of `age`, unlike speed and radius -- a sideways speed
 * cannot be derived from how long the round has been alive, only from where the target has been. See `steerHoming`.
 */
export interface HomingState {
  /**
   * The creature this round is chasing, held BY ID rather than by reference.
   *
   * A reference would be a round pointing at an object the hazard field has already dropped from its list, and
   * "is this still alive" would then be unanswerable -- eaten, driven off and quietly retired all look the same
   * from a dangling pointer. The id is re-resolved against the live list every frame, so a round whose target is
   * gone finds that out on the next frame and acts on it.
   *
   * `null` means the round is in the ARC: it had nothing to chase when it was born, or it lost what it had and
   * could not find another. It stays there -- the arc is not a wait, it is the rest of the round's flight.
   */
  targetId: number | null;
  /** Sideways speed, metres per second. Positive is right. */
  vx: number;
  /**
   * Which way the round curves while it is in the arc: -1 left, +1 right.
   *
   * Decided on ENTERING the arc rather than at birth, so it is random at the moment it stops chasing -- which is
   * the moment it is visible. Rolling at birth would have meant the direction was chosen before the player could
   * see anything, and re-rolled later anyway for every round that lost its target.
   */
  side: 1 | -1;
}

/**
 * How fast this round is travelling right now, in metres per second.
 *
 * A function of its AGE rather than a stored number, so there is nothing to keep in step: it leaves the muzzle at
 * `speedStartPerSecond`, gains `accelerationPerSecond`, and stops gaining at `speedMaxPerSecond`.
 *
 * `multiplier` scales all THREE of those at once, which is what "弹速 +25%" means for a curve: everything about it
 * is faster, rather than the same curve reached sooner. One number, because a card that moved only part of the
 * shape would be a different card with a different name.
 */
function speedOf(b: Bullet, laneWidth: number, multiplier: number): number {
  const cfg = mech.bullets;
  const start = cfg.speedStartPerSecond * multiplier;
  const top = cfg.speedMaxPerSecond * multiplier;
  return Math.min(top, start + cfg.accelerationPerSecond * multiplier * b.age) * laneWidth;
}

/**
 * How big this round is right now, in metres.
 *
 * Grows with AGE and nothing else -- not with distance travelled, not with speed. That is the whole mechanic: a
 * slow round is in the water longer and therefore gets bigger, and a fast one is gone before it has swollen. The
 * same function feeds the hitbox and the drawing, so a round is exactly as big as it looks.
 *
 * There is no ceiling here on purpose. See the config: the only real limit is `lifeSeconds`, and a second one would
 * mean the range card stopped paying at some point.
 *
 * EXPORTED because there are TWO drawings. `paintBullets` below draws the dots, and `main.ts` draws the picture
 * when `bullets.image` names one -- and the sprite path used to size every sprite from `radiusRatio` once, which
 * is the LAUNCH size. The growth reached the hitbox and the dots but not the picture, so a run with art on had
 * rounds that got bigger only in the collision maths. Anyone drawing a round asks this function, so there is one
 * size in the game rather than two.
 */
export function radiusOf(b: Bullet, laneWidth: number, multiplier: number): number {
  const cfg = mech.bullets;
  return (cfg.radiusRatio + cfg.radiusGrowthPerSecond * b.age) * multiplier * laneWidth;
}

/**
 * How much bigger this round is than the one that left the muzzle: 1 at birth, above 1 once it has swollen.
 *
 * The radius MULTIPLIER cancels -- it scales `radiusRatio` and the growth alike -- so this measures TIME IN FLIGHT
 * and nothing else. That is deliberate and it is the whole reason 「越大伤害越高」 is a RANGE card rather than a
 * second copy of 「大弹丸」: stacking size does not make this number grow, only keeping the round in the water does.
 *
 * Returns 1 when there is nothing to divide by: a config with `radiusRatio` at 0 has no launch size to compare
 * against, and the honest answer there is "it did not grow" rather than an infinity that turns into infinite damage.
 */
function growthOf(b: Bullet): number {
  const cfg = mech.bullets;
  if (!(cfg.radiusRatio > 0)) return 1;
  return (cfg.radiusRatio + cfg.radiusGrowthPerSecond * b.age) / cfg.radiusRatio;
}

/**
 * A card must never make a run hit softer, and it must never make it hit for less than NOTHING.
 *
 * Applied to both halves of each bonus -- the RATE and the quantity that rate is paid against -- because the config
 * is no longer range-checked, so `sizeDamagePerPick: -1` and `radiusGrowthPerSecond: -0.2` are both legal files. They
 * are bad tuning, but the failure has to be "this card does nothing" rather than "this card heals the fish". A
 * negative damage reaching the creature would be read as damage, subtracted, and make it healthier.
 */
const aboveZero = (n: number): number => (n > 0 ? n : 0);

/**
 * What this round takes off if it lands right now.
 *
 * The two cards multiply, and each reads a different thing:
 *
 *   - `sizeDamageRate` reads THIS ROUND's growth (`growthOf`), so it pays for flight time -- the round that is
 *     still in the water is the round that hits hardest.
 *   - `speedDamageRate` reads the RUN's stacked speed bonus, so it pays for the 「弹速」 cards themselves rather
 *     than for how fast any particular round happens to be going.
 *
 * They are separate for a reason worth keeping: if BOTH read flight time they would be satisfied by the same
 * build, and the choice between them would collapse into "take both, always". Reading different things is what
 * makes a long-range build and a speed build two builds.
 *
 * With both rates at 0 -- the default, and every run that never takes either card -- each bracket is 1 and this
 * returns exactly `ctx.damage`, so a round's damage is a constant again and the gun is unchanged for a player who
 * never picks either card up.
 */
function damageOf(b: Bullet, ctx: BulletContext): number {
  const size = aboveZero(ctx.sizeDamageRate) * aboveZero(growthOf(b) - 1);
  const speed = aboveZero(ctx.speedDamageRate) * aboveZero(ctx.speedMultiplier - 1);
  return ctx.damage * (1 + size) * (1 + speed);
}

export interface BulletContext {
  /** Visible world y range, so a round that leaves it is recycled rather than kept for ever. */
  min: number;
  max: number;
  laneWidth: number;
  /**
   * How far the camera rose this frame, in metres. A round flies in SCREEN terms -- its speed is what the player sees it
   * do -- so each frame it is moved this much with the camera before its own travel is added. Without it a round's
   * on-screen speed would be its speed minus the level's scroll, and would change when the scroll was retuned.
   */
  cameraRise: number;
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
  /**
   * The shotgun branch, handed in like every other run-level number: rounds per stream, the whole cone in degrees,
   * the close-range bonus and its distance, and the knockback multiplier.
   *
   * All five are the RUN's picks rather than the weapon's nature, which is why the module is told them instead of
   * reading them -- and all five are inert at their defaults (1 pellet, 0 degrees, no bonus, 1x knock), so a run
   * that never took a shotgun card behaves exactly as it did before the branch existed.
   */
  pellets: number;
  spreadDegrees: number;
  closeRangeMeters: number;
  closeDamageRate: number;
  knockbackScale: number;
  /**
   * Hit points one round takes off.
   *
   * Supplied rather than read from the config, for the same reason `perSecond` is: the mutation ladder
   * can stack the damage a run's rounds deal, and "how hard may I shoot right now" is a question about
   * the RUN, not about the weapon in general.
   */
  damage: number;
  /**
   * The two 「伤害跟着子弹状态走」 cards, as rates rather than as resolved multipliers -- because neither one
   * resolves to a single number for the run. `sizeDamageRate` is multiplied by each ROUND's own growth, which
   * changes over its flight; `speedDamageRate` by the run's speed bonus. See `damageOf`.
   *
   * Both are 0 for a run that has taken neither card, which is what makes them cost nothing when unused.
   */
  sizeDamageRate: number;
  speedDamageRate: number;
  /**
   * The gun's three dials, handed in for the same reason `damage` is: they are the RUN's picks, not properties of
   * a round. Each defaults to 1 and only the 弹速 / 大弹丸 / 射程 cards move it -- speed and radius and range are
   * one number each for the hitbox and the drawing, so the round a player sees is the round that collides.
   */
  speedMultiplier: number;
  radiusMultiplier: number;
  lifeMultiplier: number;
  /**
   * Where the bubble is, in world metres up the lane. `+y` is up, the same metres a hazard's `y` is in.
   *
   * Only the vertical half is needed, which is the whole shape of the homing rule: a target qualifies by being
   * ABOVE the player, and how far off to the side it is does not enter the decision at all. See `pickTarget`.
   *
   * Handed in rather than read from a player this module does not have -- this field has never known where the
   * bubble is, and the one rule that needs to is better served by being told than by being given the player.
   */
  playerY: number;
  /**
   * The chance a round is born tracking, from the run's own picks. 0 for every run that never took the card, which
   * is what makes the roll below cost nothing and the ordinary gun unchanged.
   */
  homingChance: number;
  /**
   * The dice this field rolls: the birth roll, the target draw, and which way an arc curves.
   *
   * Injected rather than `Math.random` called in place, because a bullet module with a hidden random source cannot
   * be asked what it did. This file was the one place in the game with NO randomness in it at all, and
   * `scripts/probe-bullet-damage.mjs` compares its whole output against a golden run -- a probe can only keep doing
   * that if it can hand in a source of its own.
   */
  random: () => number;
  hazards: HazardField;
  obstacles: ObstacleField;
}

/**
 * Whether the gun may aim at this creature at all: the same one-line test the collision loop below uses.
 *
 * Kept as a named function because it is now asked in two places -- "may this round hit it" and "may this round
 * CHASE it" -- and those two must never disagree. A round that chased something it then flew through would be the
 * most visible bug this feature could have.
 */
function targetable(h: Hazard): boolean {
  // The falling crate's warning is a marker, not a body: rounds pass through until the crate is released.
  if (h.kind === 'fallcrate' && h.phase < mech.hazards.fallcrate.warnSeconds) return false;
  // Not shootable, or already leaving: a creature driven off is on its way out and must not be re-engaged.
  return h.maxHealth > 0 && !h.flee;
}

/**
 * Pick a creature for a round to chase, or null when there is nothing a round is allowed to want.
 *
 * ---------------------------------------------------------------------------------------------
 * THE THREE QUESTIONS, AND WHY EACH ONE IS THERE
 * ---------------------------------------------------------------------------------------------
 *   - ABOVE THE PLAYER. `h.y > ctx.playerY`, a strict half-plane: `+y` is up, so "above" is simply a larger `y`,
 *     and how far to the left or right the creature is does not matter. This is the design's rule written the only
 *     way it can be written -- a creature the bubble has already swum past is not something the gun reaches back
 *     for, and that is what makes taking a shot worth waiting for.
 *   - ON THE SCREEN. Between the visible bounds the caller passes in, which already carry the spawn margin the
 *     hazard field uses, plus this feature's own offset. A round sent at something the player cannot see would
 *     curve for no reason the player can read.
 *   - AIMABLE. `targetable` above.
 *
 * Then UNIFORMLY at random among what is left. Not the nearest, and not weighted by distance: the card's promise is
 * "追踪弹", and a round that always took the closest thing would be an aiming assist rather than a different
 * weapon. Which one it picks is also per ROUND rather than per volley, so two rounds born together may chase two
 * different creatures or the same one -- both are the roll being honest.
 */
function pickTarget(ctx: BulletContext): number | null {
  const margin = mech.bullets.homing.rangeMarginMeters;
  const min = ctx.min - margin;
  const max = ctx.max + margin;
  const eligible: Hazard[] = [];
  for (const h of ctx.hazards.hazards) {
    if (h.y <= ctx.playerY) continue;
    if (h.y < min || h.y > max) continue;
    if (!targetable(h)) continue;
    eligible.push(h);
  }
  if (eligible.length === 0) return null;
  return eligible[Math.floor(ctx.random() * eligible.length)]!.id;
}

/** Which way an arc curves. See `HomingState.side` for why this is decided on entering the arc and not at birth. */
function arcSide(ctx: BulletContext): 1 | -1 {
  return ctx.random() < 0.5 ? -1 : 1;
}

/**
 * Move a tracking round sideways, toward whatever it is chasing.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT DOES NOT DO, WHICH IS THE DESIGN
 * ---------------------------------------------------------------------------------------------
 * It never touches `y`. The round's climb is `speedOf` and nothing else, so a tracking round does not slow down,
 * does not speed up and cannot turn around and come back down -- it slides toward its target WHILE it climbs, and
 * the curve the player sees is the two added together. That is also why nothing about range, lifetime or recycling
 * had to change to add this: those are all questions about `y`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE TWO REGIMES, AND WHY THEY ARE ONE RULE
 * ---------------------------------------------------------------------------------------------
 * With a target: aim the sideways speed at a value proportional to how far off to the side the target is, capped,
 * and get there no faster than the turn rate allows. Far away it saturates and slides at full speed; close in it
 * eases off by itself. The proportion is what stops a round wobbling back and forth across a target it has already
 * reached -- a bang-bang "always accelerate toward it" has no way to stop.
 *
 * Without one: a constant sideways acceleration in the arc's own direction, which from a standing start is an arc
 * and from an existing sideways speed is a wider one. Same integration, one term swapped, so "it lost its target"
 * needs no separate state and no separate motion.
 */
function steerHoming(b: Bullet, dt: number, ctx: BulletContext): void {
  const h = b.homing!;
  const cfg = mech.bullets.homing;
  /**
   * The three lateral numbers are in LANE WIDTHS, like every other speed in this config, so they are converted here
   * the same way `speedOf` converts its own -- one multiplication by the lane width, at the point of use. Getting
   * this wrong is invisible to the compiler and shows up only as a round that slides at 0.55 metres per second.
   */
  const lateralMax = cfg.lateralMaxPerSecond * ctx.laneWidth;
  const steerMax = cfg.steerPerSecond * ctx.laneWidth;
  const arcAccel = cfg.arcPerSecond * ctx.laneWidth;

  let target: Hazard | undefined;
  if (h.targetId !== null) {
    const found = ctx.hazards.hazards.find((x) => x.id === h.targetId);
    if (found && targetable(found)) {
      target = found;
    } else {
      /**
       * THE TARGET IS GONE -- shot away, swallowed, driven off, or retired off the screen.
       *
       * One re-draw, using the bubble's position NOW rather than the one it had when the round was fired, because
       * the question is still "what is above me", and the player has climbed since. Failing that, the round drops
       * into the arc for the rest of its life: there is nothing to wait for, and a round that kept re-checking
       * would be one the player watches fly straight and cannot explain.
       */
      h.targetId = pickTarget(ctx);
      if (h.targetId === null) h.side = arcSide(ctx);
      else target = ctx.hazards.hazards.find((x) => x.id === h.targetId);
    }
  }

  /**
   * The lateral speed the round is aiming for, then the fastest legal way to it.
   *
   * `approachPerSecond` is a rate against DISTANCE, not against time: the further off to the side the target is, the
   * harder the round slides, up to `lateralMaxPerSecond`. `steerPerSecond` is the ceiling on how fast that sideways
   * speed may CHANGE, and it is the turn rate -- the one number that decides whether this looks like something
   * tracking or something that simply hits.
   *
   * With no target the aim point is simply the arc's own direction at full sideways speed, so the same two lines
   * carry the round out of the screen. `Math.max(dt, ...)` rather than a bare divide: a zero step is a legal thing
   * for a probe to hand in, and it must not arrive here as a NaN that outlives the frame.
   */
  const want = target
    ? Math.max(-lateralMax, Math.min(lateralMax, (target.x - b.x) * cfg.approachPerSecond))
    : h.side * lateralMax;
  const accel = target ? (want - h.vx) / Math.max(dt, 1e-6) : h.side * arcAccel;
  const capped = Math.max(-steerMax, Math.min(steerMax, accel));
  h.vx = Math.max(-lateralMax, Math.min(lateralMax, h.vx + capped * dt));
  b.x += h.vx * dt;
}

/**
 * One landed hit, with the shape needed to price the risk it was taken at.
 *
 * `halfW` / `halfH` are the collision box the round itself hit -- `hazardBoxFractions`, in LANE FRACTIONS -- or null
 * when the kind has no art and collisions fall back to the circle. `r` is that circle's nominal radius in metres.
 * Both are carried because 贴脸 has to ask the same shape the collision asked: a centre-distance test against the
 * nominal radius is too small for creatures whose picture is much bigger than it, and the bosses are exactly that.
 */
interface HitMark {
  x: number;
  y: number;
  kind: HazardKind;
  r: number;
  halfW: number | null;
  halfH: number | null;
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
   * than merely hit.
   *
   * `hits` counts CREATURES only -- a round a crate stopped is in none of these, deliberately: scenery does not bleed
   * and it is not worth points, so the hit sound would be the gun claiming a connection it did not make. (It IS in
   * this field's own lifetime counter, `BulletField.hits`, which counts both, because that one exists to answer "did
   * the gun do anything at all".) The comment here used to say a stopped round was in `hits`, which is the opposite
   * of what the field returns, and it cost a probe a wrong assertion before it was caught.
   *
   * `struck` is the per-hit detail that `hits` cannot carry: WHERE each round landed on a creature and how much it took
   * off. Scenery hits are deliberately not in it -- this is the list a damage number is drawn from, and a crate does not
   * show one.
   */
  update(
    dt: number,
    ctx: BulletContext,
  ): {
    hits: number;
    drivenOff: number;
    fired: number;
    driven: readonly HitMark[];
    struck: readonly (HitMark & { amount: number })[];
    /** Crates the rounds hit (and possibly broke); the run turns a break into the crate's sound. */
    obstacleHits: readonly { x: number; y: number; kind: ObstacleKind; broke: boolean }[];
  } {
    const cfg = mech.bullets;
    let landed = 0;
    let drivenOff = 0;
    let fired = 0;
  /** Positions of creatures finished this frame, with what they were: the caller prices risk by proximity. */
  const driven: HitMark[] = [];
    /** Every round that landed on a creature this frame, with the damage it dealt. */
    const struck: (HitMark & { amount: number })[] = [];
    /** Rounds that were stopped by a destructible crate. */
    const obstacleHits: { x: number; y: number; kind: ObstacleKind; broke: boolean }[] = [];

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

    const life = cfg.lifeSeconds * ctx.lifeMultiplier;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      /**
       * AGE FIRST, then move by the speed that age implies.
       *
       * The order matters for one frame's worth of accuracy and for a subtler reason: a round born this frame has
       * age 0, so it moves at exactly the launch speed rather than at the speed it will have after one step.
       */
      b.age += dt;
      // `cameraRise` first: a round is on the screen, so the camera's climb must not be added to how fast it flies.
      b.y += ctx.cameraRise + speedOf(b, ctx.laneWidth, ctx.speedMultiplier) * dt;
      /**
       * A shotgun pellet also slides, in proportion to how fast it is going -- that IS the cone.
       *
       * `tan` of the round's own angle, times the same speed the climb above used, so the pellet holds a straight
       * diagonal however its speed changes: at launch it barely diverges and by the top of its flight it is well off
       * the line. That is the geometry the archetype runs on -- a target at arm's length is inside every pellet's
       * path and a target across the lane is inside one or two of them -- and it needs no falloff curve to say so.
       *
       * Here rather than folded into the climb, because the climb is what every round does and this is what a
       * shotgun's rounds do on top of it. Skipped entirely for a round with no angle, which is every round of every
       * other gun.
       */
      if (b.angle !== undefined) {
        b.x += Math.tan(b.angle) * speedOf(b, ctx.laneWidth, ctx.speedMultiplier) * dt;
      }
      /**
       * Sideways, AFTER the climb, and only for a round that is tracking.
       *
       * After, because the climb is what a round always does and the slide is what this one does on top of it --
       * and because a round that has just been recycled by the climb below should not also be moved sideways first.
       * `steerHoming` re-resolves the target against the live list, so a creature that died this frame is already
       * gone by the time this runs.
       */
      if (b.homing) steerHoming(b, dt, ctx);
      // Recomputed per round per frame: the hitbox and the drawing read the same value, so a round that has grown
      // is a round that hits from further away, which is the mechanic rather than a side effect.
      const radius = radiusOf(b, ctx.laneWidth, ctx.radiusMultiplier);

      /**
       * Scenery first, then creatures.
       *
       * A bullet is stopped by the scenery in front of a fish. The CRATE is the one destructible piece: a round that
       * hits it takes the BASE config damage off its 50 hit points, and a break is reported for the crate's sound.
       * The other kinds stop the round without taking damage -- the charge and the burst are their answers. The net
       * is not here at all: it is soft, and `blockerAt` lets rounds pass through it.
       */
      const blocker = ctx.obstacles.blockerAt(b.x, b.y, radius, ctx.laneWidth);
      let spent = blocker !== null;
      if (blocker) {
        this.hits++;
        if (blocker.kind === 'crate') {
          const hit = ctx.obstacles.damage(blocker.id, cfg.damage);
          if (hit) obstacleHits.push({ x: b.x, y: b.y, kind: hit.kind, broke: hit.broke });
        }
      }

      if (!spent) {
        for (const h of ctx.hazards.hazards) {
          // Not shootable, or already leaving: the round passes through rather than being eaten by it. The same test
          // `pickTarget` uses to decide what a round is allowed to chase -- see the note on `targetable`.
          if (!targetable(h)) continue;
          const reach = radius + ctx.laneWidth * hazardSizeFraction(h.kind, h.scale);
          const dx = h.x - b.x;
          const dy = h.y - b.y;
          /**
           * THE SAME SHAPE THE CONTACT TEST USES, asked of the same function.
           *
           * A round lands on a creature the way the bubble does -- against the box its picture occupies -- because a
           * gun that used a different hitbox from the one that kills you would be two games, and the one the player
           * can see would be the wrong one. See `hazardBoxFractions`.
           */
          const box = hazardBoxFractions(h.kind, h.variety, h.scale);
          const inReach = box
            ? boxDistance(b.x, b.y, h.x, h.y, box.halfW * ctx.laneWidth, box.halfH * ctx.laneWidth) <= radius
            : dx * dx + dy * dy <= reach * reach;
          if (!inReach) continue;
          // The hit is applied through the hazard field, which owns what it means to be driven off -- and where the
          // round was, so the recoil is along the line of the shot rather than along a fixed axis.
          //
          // Damage is asked for HERE rather than read off the context, because it depends on the round: by the time a
          // slow one arrives it has swollen, and 「越大伤害越高」 pays for exactly that. The same number goes to the
          // floating digit, so what the player reads over the creature is what came off it.
          /**
           * Damage is asked for HERE rather than read off the context, because it depends on the round: by the time a
           * slow one arrives it has swollen, and 「越大伤害越高」 pays for exactly that. The same number goes to the
           * floating digit, so what the player reads over the creature is what came off it.
           *
           * The close-range card is applied on top, and it is the only card whose factor is about the TARGET rather
           * than the round: the gun fires up the lane, so the range to a creature is the vertical gap between it and
           * the player, and "close" is that gap being inside the card's distance.
           */
          const close =
            ctx.closeDamageRate > 0 && h.y - ctx.playerY <= ctx.closeRangeMeters ? 1 + ctx.closeDamageRate : 1;
          const damage = damageOf(b, ctx) * close;
          const outcome = ctx.hazards.hit(h, damage, { x: b.x, y: b.y, knockScale: ctx.knockbackScale });
          this.hits++;
          landed++;
          // Reported at the CREATURE, not at the round: the round is a few pixels wide and has already been removed by
          // the time the caller draws anything, while the creature is the thing the number is about.
          const mark: HitMark = {
            x: h.x,
            y: h.y,
            kind: h.kind,
            r: ctx.laneWidth * h.radiusFraction,
            halfW: box ? box.halfW : null,
            halfH: box ? box.halfH : null,
          };
          struck.push({ ...mark, amount: damage });
          if (outcome === 'fled') {
            drivenOff++;
            // Kind and shape travel with the position: the caller's risk pricing (贴脸 / 拆弹) needs WHAT it was and
            // how big it was, not just where it stood.
            driven.push(mark);
          }
          spent = true;
          break;
        }
      }

      // Recycle: it hit something, ran out of range, or left the working band.
      if (spent || b.age >= life || b.y < ctx.min - 60 || b.y > ctx.max + 120) {
        this.bullets.splice(i, 1);
      }
    }

    return { hits: landed, drivenOff, fired, driven, struck, obstacleHits };
  }

  private spawn(ctx: BulletContext): void {
    /**
     * One round per muzzle, every tick.
     *
     * Simultaneous rather than alternating: an upgrade that fired the same number of rounds from two places would be
     * a WIDER gun, and this is meant to be a stronger one. The caller decides how many muzzles there are.
     *
     * A round is born with a position and an age of zero: its speed and its size are both functions of that age
     * (`speedOf`, `radiusOf`), so there is no launch state to get wrong here except its ANGLE, which is the one
     * thing about a round that no function of its age could recover.
     *
     * ---------------------------------------------------------------------------------------------
     * THE SHOTGUN IS A FAN OF THE SAME ROUNDS, NOT A DIFFERENT ROUND
     * ---------------------------------------------------------------------------------------------
     * A volley is `pellets` rounds leaving ONE muzzle at angles spread evenly across `spreadDegrees`, and each of
     * them is an ordinary round in every other respect: same damage, same speed curve, same roll for tracking. That
     * is what makes the archetype work without a distance falloff written anywhere -- the pellets diverge as they
     * fly, so a target at arm's length eats all of them and one across the lane eats whichever its own width catches.
     */
    const pellets = Math.max(1, Math.round(ctx.pellets));
    // Half the cone, in radians: the pellets sit at the CENTRES of `pellets` slices, so `pellets / 2` of it is where
    // the outermost ones go. A single pellet divides by zero, which is why the count is guarded rather than the sum.
    const half = (ctx.spreadDegrees * Math.PI) / 360;
    for (const muzzle of ctx.muzzles) {
      for (let i = 0; i < pellets; i++) {
        const along = pellets <= 1 ? 0 : (i / (pellets - 1)) * 2 - 1;
        const bullet: Bullet = {
          x: muzzle.x,
          y: muzzle.y,
          age: 0,
        };
        if (pellets > 1) bullet.angle = half * along;
        if (ctx.homingChance > 0 && ctx.random() < ctx.homingChance) {
          const targetId = pickTarget(ctx);
          bullet.homing = {
            targetId,
            vx: 0,
            side: targetId === null ? arcSide(ctx) : 1,
          };
        }
        this.bullets.push(bullet);
        this.fired++;
      }
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
export function paintBullets(g: Graphics, field: BulletField, laneWidth: number, radiusMultiplier = 1, lifeMultiplier = 1): void {
  const cfg = mech.bullets;
  const life = cfg.lifeSeconds * lifeMultiplier;
  for (const b of field.bullets) {
    // Per round, because the round is still growing: the size on screen and the size that collides come from the
    // same function, so a bullet that looks fat is a bullet that hits from further away.
    const r = radiusOf(b, laneWidth, radiusMultiplier);
    const fade = Math.max(0.18, 1 - b.age / life);
    /**
     * A tracking round is drawn in its own colours, from the muzzle.
     *
     * This is the one thing about homing that is visible BEFORE the round does anything: until it curves, a tracking
     * round and a straight one are the same dot doing the same thing, and at a third of the rounds that is most of
     * the screen. The colour is the tell; the curve and the arc are the confirmation.
     */
    const look = b.homing ? cfg.homing : cfg;
    g.circle(b.x, b.y, r).fill({ color: look.colour, alpha: cfg.alpha * fade });
    g.circle(b.x, b.y, r).stroke({ color: look.rimColour, alpha: cfg.rimAlpha * fade, width: Math.max(1, r * 0.45) });
  }
}

