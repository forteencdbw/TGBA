import { Player } from './player';
import { Progression } from './progress';
import { EntityField } from './entities';
import { HazardField, type HazardKind } from './hazards';
import { ObstacleField } from './obstacles';
import { BulletField } from './bullets';
import { EnemyBulletField } from './enemyBullets';
import type { SpawnRecord } from './placement';
import { Score } from './score';
import { Xp } from './xp';
import { initialStageState, type StageState } from './stages';
import { defaultBubbleType, findRoute, formForRoute, hasVerb, type BubbleType, type RouteId } from './bubbleTypes';
import { calibrateLateral, type LateralAuthority } from './lateral';
import { initialRageState, type RageState } from './rage';
import { pickTalent, resolveTalent, type TalentEffects } from './talents';
import type { EntrySide } from './levels';
import type { Input } from './input';
import { chainTargets } from './conductive';
import { tuning } from './config';
import { massFromEating } from './consumption';
import { hazardSizeFraction, hazardTuning, markVulnerable, shoveCreature, vulnerableDamage, type Hazard, type SpawnOptions } from './hazards';
import { healthAfterHit, healthMaxFor } from './health';
import { canEatHazard } from './consumption';
import { LEVEL, type LevelEntry } from './levels';
import { mech } from './mechanisms';
import { rageFraction } from './rage';
import { placeEntry } from './placement';
import { gainRage, hitRage, spendRage, tickRage } from './rage';
import { OBSTACLE_BLOCK_SOUND, OBSTACLE_BREAK_SOUNDS } from './soundIds';
import { sayBlast, sayCallout, sayGraze } from './runEvents';
import { recordAbsorb, stageName, stageRadiusFraction } from './stages';
import { fartBaitCount, fartPushFor } from './talents';
import { bubbleVolumeFromRadius, volumeForHealthRatio } from './volume';
import type { Phase } from './snapshot';
import { sayBanner, sayDamage, sayScore, saySound, type RunEvent } from './runEvents';
import type { SoundEvent } from './audio';

/**
 * What the run needs to know about the world outside it, per frame.
 *
 * Passed rather than read, because the camera is the GAME's: it is a viewport, a zoom and a follow behaviour, and a run
 * that could ask the camera where it was would be a run that needs a renderer after all. These numbers are the whole of
 * what the simulation uses, and taking them as data is what lets a probe drive a run headlessly.
 */
export interface WorldView {
  laneWidth: number;
  /** How much water fits on the screen, which is what turns an impulse into a speed. */
  visibleDepthMeters: number;
  min: number;
  max: number;
}

/**
 * One run: the water, the bubble, the ledger, and the rules that move them.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS CLASS EXISTS
 * ---------------------------------------------------------------------------------------------
 * The architecture review came down to one thing: a rule that lives in the class that owns the canvas can only be run
 * by playing the game. The output seam finished that argument -- the rules say what happened through `RunEvent`
 * instead of touching a label or a synth -- and this is the state those rules were about, with the rules themselves.
 *
 * The split is by what a thing IS:
 *
 *   - a RUN is the simulation: the player, the water, the ledger, the timers, the level's progress. It can be built and
 *     stepped with no canvas in sight.
 *   - the GAME is the application: the canvas, the camera, the menus, the codex, the touch layer, the input devices, the
 *     frame clock, the labels and the particles. It drives the run and draws it.
 *
 * The state is public because the presentation READS it -- `render`, the HUD and the report are readers of a run --
 * and the rules are public because the game's `step` still drives them one by one. When the phase machine moves in as
 * well (a smaller job than this one), they become private and the interface becomes `step` plus the events.
 */
/** Slow-motion pop after the bubble is destroyed, before the next run starts. */
export const BURST_SECONDS = 1.5;

export class Run {
  /**
   * Whether a contact is a SLAM right now: the volatile bubble, with a plate to spend.
   *
   * One question, asked in two places -- the obstacle field (is this bump a ram?) and the hazard field (is this touch
   * a hit, or a shove?) -- and answered here so the two can never disagree about what "I have armour" means.
   */
  get hasArmour(): boolean {
    return this.bubbleType.look === 'rage' && this.armourPlates > 0;
  }
  /**
   * Whether the suction field is actually up.
   *
   * ONE place, because the field's radius, its pull, its drawing and the diagnostic readout all ask this,
   * and any of them reading `input.sucking` directly would leave a field that is visibly up but not
   * pulling, or pulling without being drawn.
   */
  suctionUp(input: Input): boolean {
    /**
     * The type gate is the first thing checked, and it exists because the keyboard does not go through the buttons:
     * a player who has just switched to the volatile bubble and presses the old keys must not get a suction field
     * the type does not have. See `hasVerb`.
     */
    if (!hasVerb(this.bubbleType, 'suction')) return false;
    return input.sucking;
  }
  /** The burst radius for the current rage: linear from the base at zero to the maximum at full. */
  burstRadiusRatio(): number {
    const cfg = mech.angry.burst;
    const t = rageFraction(this.rage.rage);
    return (cfg.radiusBaseRatio + (cfg.radiusMaxRatio - cfg.radiusBaseRatio) * t) * this.burstRadiusMultiplier;
  }
  /**
   * Whether this bubble can eat this kind of hazard, which is TWO questions and only one of them is about size.
   *
   * The type's own answer comes first: a bubble with no mouth cannot eat a creature however big it is, so the
   * answer for the volatile bubble is `false` for every kind. This is the single place that decides it, and the
   * callers -- the collision, the outline marker and the test hook -- all come through here, so the marker
   * cannot promise food that the collision then refuses to deliver.
   */
  canSwallow(kind: HazardKind): boolean {
    return this.bubbleType.swallowsHazards && canEatHazard(kind, this.player.volume, this.eatTierBonus);
  }

  /**
   * Put the form back to the base bubble. Called once per FRESH run, before `pickRoute`.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS HAS TO EXIST
   * ---------------------------------------------------------------------------------------------
   * `pickRoute` is idempotent -- a carried run calls it again with the same id, and it must not re-grant the barrage
   * route's extra gun row -- so it returns early whenever `route` is already set. That guard is right, and on its own it
   * makes the picker's answer stick to the FIRST run of the session: run two would be boiled or devoured exactly as run
   * one was, and the screen would look like it worked while doing nothing. A page reload would hide it.
   *
   * So the form is the run's, and a new run starts with none.
   */
  forgetForm(): void {
    this.route = null;
    this.bubbleType = defaultBubbleType();
  }

  /**
   * Adopt a form. Called with what the picker returned, at the start of a fresh run.
   *
   * It used to be the FIRST LEVEL-UP's whole question; the identity moved to a screen between 开始游戏 and the load,
   * because it is the first decision of a run rather than a reward inside one. What the call does is unchanged: the
   * form swap is the grant, and the instant extras beyond it live below, because they are the route's business (the
   * barrage route's promise is a gun that is bigger RIGHT NOW).
   *
   * Idempotent, and that is load-bearing: a carried run keeps its form, so the walk into the next level calls this
   * again with the same id and gets the same answer.
   */
  pickRoute(id: string): RouteId | null {
    const route = findRoute(id);
    if (!route || this.route !== null) return this.route;
    this.route = route.id;
    this.bubbleType = formForRoute(route);
    if (route.id === 'barrage') {
      // The route's promise, on the spot: a wider gun before the panel has even closed.
      this.gunStreams = Math.min(mech.bullets.maxStreams, this.gunStreams + 1);
    }
    /**
     * A route that grows takes its size from its health NOW, not at the next level boundary.
     *
     * This is one of the two moments `applyHealthBand` exists for, and it is the one the player will notice: the
     * whole point of picking devour is that the bubble becomes a different animal, and arriving at that as a
     * still-tiny bubble that only grows next level would make the pick feel like a promissory note.
     */
    this.applyHealthBand();
    return this.route;
  }
  /**
   * How much the suction field is widened right now.
   *
   * Over capacity it runs away with itself, pulling in MORE than the player can eat -- the punishment mixed with
   * temptation that the design's over-eating state is for. A getter passed to BOTH the drawing and the physics,
   * so the field the player sees is the field that is actually pulling. Computing it in two places would let them
   * drift, and a visible promise would become a lie.
   */
  get suctionRadiusFactor(): number {
    return this.suctionBonus;
  }

  /**
   * What this frame's rules have to say. The game drains it right after each step -- see `Game.applyRunEvents`.
   */
  readonly events: RunEvent[] = [];

  /** Which part of the flow this is. The run SETS it too: a fatal hit starts the burst. */
  phase: Phase = 'menu';
  /** Seconds left in the current phase, when the phase has one. */
  phaseTimer = 0;

  private banner(text: string): void {
    sayBanner(this.events, text);
  }

  /**
   * Whether the run is protected because a mutation pick is on its way.
   *
   * Not `invulnerable` with a long number in it: that is a COUNTDOWN in world time, and this is a state with no length of
   * its own -- the game knows when the cards are coming and when they have been dealt, and a duration guessed from the
   * outside would be a second thing to keep in step with the first. It is also deliberately not a general "safe" flag:
   * there is exactly one reason the player cannot be hurt right now, and this says which.
   */
  pickProtected = false;

  /**
   * The lane's width in metres, kept here so a cue can be panned to where it happened.
   *
   * Set by the game each frame (it is the camera's number, not the run's), and only read by `panAt`.
   */
  laneWidth = 0;

  /** -1 (left edge of the lane) .. 1 (right), for a cue at world x. 0 when the lane is not known yet. */
  panAt(x: number): number {
    if (this.laneWidth <= 0) return 0;
    return Math.max(-1, Math.min(1, (x / this.laneWidth) * 2 - 1));
  }

  private sound(event: SoundEvent, intensity = 0.5, pan = 0): void {
    saySound(this.events, event, intensity, pan);
  }

  private scorePopup(x: number, y: number, points: number): void {
    sayScore(this.events, x, y, points);
  }

  private damagePopup(x: number, y: number, amount: number): void {
    sayDamage(this.events, x, y, amount);
  }

  player = new Player();
  elapsedTotal = 0;
  progress = new Progression();
  field = new EntityField();
  scrolled = 0;
  /**
   * How far the camera rose THIS frame, in metres. The game writes it where it advances `scrolled`; it is 0 whenever the
   * camera is still (the intro, the ending, a probe that never sets it).
   *
   * Creatures and rounds are on the SCREEN, so each of them needs to be given this much back or the camera's climb would
   * drag them down the glass: see `carryFor` in hazards.ts. Kept here, next to `scrolled`, because it is the same fact
   * differentiated, and passed down to the three simulations that need it.
   */
  cameraRise = 0;
  /**
   * The pace the level is running at RIGHT NOW, in metres per second.
   *
   * A field rather than a call to `speedAt` at each reader, because one frame must hand the SAME number to the scroll and
   * to the collectable field: the diagnostics carry a contract that those two agree (see `scrollSpeedMps` /
   * `fieldScrollSpeedMps`), and with a pace CURVE there is no single constant left to compare them against. Read from here
   * by anything that needs "how fast is the water going", so a level with no curve answers with its constant and a level
   * with one answers with the speed at the depth it has reached.
   */
  paceMps = 0;
  timelineEmitted = 0;
  spawnLog: SpawnRecord[] = [];
  spawnedBySide: Record<EntrySide, number> = { top: 0, left: 0, right: 0, bottom: 0 };
  elapsed = 0;
  nominalSeconds = 0;
  lateral: LateralAuthority = calibrateLateral(1);
  bubbleType: BubbleType = defaultBubbleType();
  /**
   * The route this run has committed to, or null until its card is picked.
   *
   * The run's identity used to be chosen on the menu; now it is the FIRST level-up's question, and `null` means
   * "still the base bubble". Everything that gated on the type -- the pool's route cards, the HUD's prefix, the
   * verbs -- reads this or the form it produced.
   */
  route: RouteId | null = null;
  rage: RageState = initialRageState();
  /**
   * The armour: the volatile bubble's melee ammunition.
   *
   * Kept apart from `rage` on purpose. Rage is the fuse (earned by being hit, spent by the burst at the top of the
   * gauge); armour is the ammunition (a metronome, spent by touching something). Tying the two together would make
   * "may I slam right now" a second table to read for no gain -- see `angry.armour`.
   */
  armourPlates = 0;
  armourSeconds = 0;
  /**
   * The armour's dials, and the burn's, as the RUN has them after its cards.
   *
   * Derived in `applyMutationPassives` from `angry.armour` / `angry.aura` plus the volatile form's deck, so the
   * tuning numbers stay in the config and a card never hard-codes a value that the config would then go stale on.
   * Read here rather than at each use, so there is one answer to "how fast is my armour".
   */
  armourSecondsPerPlate: number = mech.angry.armour.secondsPerPlate;
  armourMax: number = mech.angry.armour.max;
  armourVulnerableMultiplier: number = mech.angry.armour.vulnerableMultiplier;
  auraDamagePerTick: number = mech.angry.aura.damagePerTick;
  /** Seconds toward the next burn tick of the attached aura. */
  auraSeconds = 0;
  /** Slams landed this run, for the results panel. */
  slams = 0;
  burst: { radius: number; seconds: number; kills: number; pushes: number } | null = null;
  bursts = 0;
  stage: StageState = initialStageState();
  invulnerable = 0;
  stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: 0, newRecord: false };
  lastEaten = 0;
  obstacles = new ObstacleField();
  bullets = new BulletField();
  enemyBullets = new EnemyBulletField();
  gunStreams = 1;
  rateTier = 1;
  /** The run's mutation ladder: what pays, how full the bar is, and what is waiting to be picked. */
  xp = new Xp();
  /**
   * Mutation picks taken this run, by card id.
   *
   * The one source of truth for every mutation-driven number: `applyMutationPassives` re-derives the
   * multipliers from these counts after every talent re-roll, so a carried mutation can never be wiped by
   * the level transition's fresh talent. See `src/mutations.ts`.
   */
  mutations: Record<string, number> = {};
  /**
   * Every card the run has taken, by card id, in the order they were taken -- the history `mutations` cannot give.
   *
   * `mutations` is the counts the passives are derived from, and it only holds the stacking cards: the gun row, the rate
   * tier, a route and a heal each change some other field and are not in it. This is the one list that has every
   * pick, so the pause panel's growth section can say what the run has become. It has the SAME lifecycle as `mutations`
   * (a walk into the next level keeps it, only a death clears it), and it is written in one place only:
   * `pickMutationCard` in `src/mutations.ts`.
   */
  picks: string[] = [];
  /** Bullet damage multiplier from stacked 突变 · 子弹伤害 picks. Re-derived, never edited directly. */
  bulletDamageMultiplier = 1;
  /** Rage gain multiplier from stacked 突变 · 怒气积攒 picks. Angry bubble only offers the card. */
  rageGainMultiplier = 1;
  /** Suction field width multiplier from stacked 突变 · 吸取范围 picks. Devour bubble only offers the card. */
  suctionBonus = 1;
  /** Extra swallow-invulnerability seconds from stacked 突变 · 吞噬无敌 picks. */
  eatInvulnBonusSeconds = 0;
  /** Extra eating tiers from stacked 突变 · 大胃口 picks: each one lets the form eat one tier above its volume. */
  eatTierBonus = 0;
  /** Bullet speed multiplier from stacked 弹幕路线 · 弹速 picks. */
  bulletSpeedMultiplier = 1;
  /** Bullet radius multiplier from stacked 弹幕路线 · 大弹丸 picks: hitbox AND drawing, one number. */
  bulletRadiusMultiplier = 1;
  /** Bullet life multiplier from stacked 弹幕路线 · 射程 picks, which is the gun's range. */
  bulletLifeMultiplier = 1;
  /**
   * The shotgun branch's four run-level numbers, all derived in `applyMutationPassives`.
   *
   * `gunPellets` is rounds per stream and `gunSpreadDegrees` is the whole cone, so the ordinary gun is "1 pellet, 0
   * degrees" and needs no special case anywhere downstream: a cone of zero puts every pellet on the same line, which
   * is the gun it already was. `gunRateScale` multiplies the rate TIER rather than replacing it, so the ladder still
   * says which gun you have and the HUD can still report the tier it is on.
   */
  gunPellets = 1;
  gunSpreadDegrees = 0;
  gunRateScale = 1;
  /** The close-range card: how near counts, in metres above the player, and the damage bonus inside it. 0 = no card. */
  bulletCloseRangeMeters = 0;
  bulletCloseDamageRate = 0;
  /** The shove card: a multiplier on every hit's knockback. */
  bulletKnockbackScale = 1;
  /**
   * The two 「伤害跟着子弹状态走」 cards, as RATES rather than multipliers.
   *
   * Neither resolves to one number for the run, which is why they are not multipliers like the three above:
   * `bulletSizeDamageRate` is multiplied by each round's own growth (a round gets harder-hitting as it swells), and
   * `bulletSpeedDamageRate` by the speed bonus above. See `damageOf` in `src/bullets.ts`.
   *
   * Both stay 0 until a card is picked, so the gun behaves for a run that ignores them.
   */
  bulletSizeDamageRate = 0;
  bulletSpeedDamageRate = 0;
  /**
   * The chance a round leaves the muzzle TRACKING, from the 弹幕路线 · 追踪弹 card. 0 is an ordinary gun.
   *
   * A number rather than a flag because the card is a probability, and the run is what owns it -- the bullet module
   * rolls it, but "how often do my rounds track" is a fact about the run's picks, like the rate tier above it.
   */
  bulletHomingChance = 0;
  /**
   * The gun's dice, replaceable.
   *
   * A field rather than `Math.random` called in `src/bullets.ts`, so a probe can hand the module a source of its
   * own and get the same rounds twice. That module had no randomness in it AT ALL until homing arrived, and
   * `scripts/probe-bullet-damage.mjs` compares its entire output against a golden run -- the seam is what keeps
   * that comparison meaningful instead of turning it into a distribution.
   */
  bulletRandom: () => number = Math.random;
  /** Burst radius multiplier from stacked 沸腾路线 · 爆破半径 picks. */
  burstRadiusMultiplier = 1;
  /** Rage decay multiplier from stacked 沸腾路线 · 余温 picks: below 1 means the heat lingers. */
  rageDecayMultiplier = 1;
  bossSpawned = false;
  infiniteHealth = false;
  pendingLevel: string | null = null;
  ascendMetres = 0;
  runComplete = false;
  levelsClearedInRun = 0;
  charge = 0;
  chargeBurst = 0;
  chargeBurstRadius = 0;
  trashDrain = 0;
  comedyBeats = 0;
  lastComedyBeat: { what: HazardKind; at: number } | null = null;
  hazards = new HazardField();
  talentEffects: TalentEffects = resolveTalent(pickTalent());
  fartReadyAt = 0;
  farts = 0;
  eventsFired = new Set<number>();
  eventsSeen = 0;
  lastEvent: { label: string; at: number } | null = null;
  bestClimbed = 0;
  bestVolume = 0;
  bestScore = 0;
  score = new Score();
  surfaced = false;
  /**
   * Health: one pool, for all three routes.
   *
   * It used to belong to the non-growing routes only, because the growing one kept its health in its volume. That
   * split is gone -- see `takeHit` -- so this is every route's pool, and `healthView` is what the HUD bar reads.
   */
  health = 0;
  /** The ceiling above: `mech.health.start` plus every 「血上限」 pick this run has taken. */
  healthMax = 0;
  /**
   * What every blow subtracts before it lands.
   *
   * Re-derived by `applyMutationPassives` from the card counts and the talent, like every other passive, so a
   * carried card survives the level transition's fresh talent. See `src/health.ts` for the formula this feeds.
   */
  defense = 0;

  /**
   * The health bar's numbers: hit points now, and the ceiling they are measured against.
   *
   * Two numbers rather than one proportion, because the bar shows both and they answer different questions -- the
   * track says "how much of me is left", the label says "out of how much". The ceiling moves (a 「血上限」 pick),
   * so a proportion alone cannot say it.
   */
  get healthView(): { current: number; max: number } {
    return { current: this.health, max: this.healthMax };
  }

  /**
   * Full health for a fresh level, re-derived from the picks this run is carrying.
   *
   * Called where the player is reset, so both health rules are restored at the same moment and every level starts
   * from the same bar whichever route is running. The 「血上限」 count is read here rather than remembered, which is
   * what lets a carried mutation survive the level transition the way every other passive does.
   */
  /**
   * @param carry true when this is the next level of a run in progress, rather than the start of a fresh one.
   */
  resetHealth(carry = false): void {
    this.healthMax = healthMaxFor(this.mutations['maxHp'] ?? 0);
    /**
     * HEALTH CARRIES ACROSS LEVELS, and that is what makes the size bands mean anything.
     *
     * If every level began at full, `applyHealthBand` would hand out the top band every time and "size comes from
     * your health" would be a sentence with no consequence. Carrying it is also what gives defence, the health
     * ceiling and the repair card a context -- they are answers to "should I go in with 40%".
     *
     * A ceiling that GREW (a 「血上限」 pick) does not top the current pool up: the card buys room, not blood.
     */
    this.health = carry ? Math.min(this.health, this.healthMax) : this.healthMax;
  }

  /**
   * Re-derive a growing route's volume from its health: the second half of "size is a readout of health".
   *
   * Called at exactly two moments -- the start of a level, and the pick of the route that makes the bubble grow --
   * and nowhere else. Between those, a hit changes the health bar and nothing about the hitbox: a bubble that
   * shrank mid-fight would invalidate the "how close can I get" judgement the player made a moment ago, and that
   * judgement is the entire skill of eating something dangerous.
   *
   * A non-growing route keeps whatever size it has: its volume is set by its talent and never moves.
   */
  applyHealthBand(): void {
    if (!this.bubbleType.growsByAbsorbing) return;
    const ratio = this.healthMax > 0 ? this.health / this.healthMax : 1;
    this.player.volume = volumeForHealthRatio(ratio);
  }

  /**
   * Land one hit on the bubble.
   *
   * The single place a hit is applied, which is what makes "digesting hurts more" a one-line rule rather than a
   * condition that has to be repeated at every source of damage. A hazard, an obstacle, a trash bag's drain and
   * the debug forge all arrive here.
   */
  /**
   * @param damage what the blow is worth before defence, from the source
   * @param defense what may be subtracted from it. Every source passes the player's own defence EXCEPT the three
   *   that are the player's own doing -- see `selfInflicted`, which is why this is a parameter rather than a read
   *   of `this.defense` inside here.
   */
  takeHit(damage: number, defense = this.defense): void {
    /**
     * The cheat: nothing happens at all.
     *
     * Not "the health is restored afterwards" -- that would still fire the hit sound, still flash, and still kill the
     * player for the frame in between. Returning here means an invulnerable bubble really is indistinguishable from one
     * that was never touched.
     */
    if (this.infiniteHealth) return;
    /**
     * And nothing happens while a mutation pick is on its way either.
     *
     * The card is the player's own -- they filled the bar -- and the slow motion is the game saying "this next moment does
     * not count". Losing a card to a round that happened to be crossing the screen would be a frustration about having no
     * control rather than about having played badly, and the whole ramp is only six tenths of a second.
     */
    if (this.pickProtected) return;
    this.stats.hits++;
    this.sound('player.hurt', 0.5);
    this.invulnerable = tuning.invulnerableSeconds;
    /**
     * ONE pool now, for all three routes.
     *
     * It used to depend on the route: the growing bubble's health WAS its volume, so a hit shrank it and the size
     * moved. That is what made the numbers stay small -- and it also meant two of the three routes had a health
     * bar while the third had a size. `volume` is no longer anyone's health.
     *
     * `hitsToPop` is the vestige of a form whose death was "a touch is fatal" whatever its pool said. No form
     * declares it, and it is honoured here by emptying the pool, which is what it always meant.
     */
    if (this.bubbleType.hitsToPop !== null) this.health = 0;
    else this.health = healthAfterHit(this.health, damage, defense);

    if (this.health <= 0) {
      this.startBurst();
      return;
    }
    /**
     * Rage, from a hit the bubble SURVIVED -- and only from one it survived.
     *
     * The design says "damage taken but not burst", and the early return above is what makes that literal: a fatal
     * hit ends the run, so there is no state left to carry rage in and no way to earn from dying. This one line is
     * the whole passive-rage rule; everything else about rage is either the clock or the spending.
     */
    if (this.bubbleType.look === 'rage') gainRage(this.rage, hitRage() * this.rageGainMultiplier);
  }
  /**
   * The gun: fire, fly, hit.
   *
   * All this does is supply the muzzle and the answer to "may I shoot"; where the rounds go and what they do to
   * what they touch is `src/bullets.ts`, which is also the only place that knows what a round is.
   */
  updateBullets(dt: number, laneWidth: number, min: number, max: number): void {
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    /**
     * Where the rounds come from: one rim point, or one per gun row once the upgrade has been taken.
     *
     * The rows are offset LATERALLY (across the lane), because the gun fires up the lane: two rows side by side read
     * as two streams, and the gap between them is a lane of its own the player can aim with. `gunStreams` is per-run
     * state, reset with everything else, so an upgrade never survives a death.
     */
    const muzzles: { x: number; y: number }[] = [];
    const rows = this.gunStreams;
    for (let i = 0; i < rows; i++) {
      const offset = (i - (rows - 1) / 2) * mech.bullets.upgradeSpreadRatio * laneWidth;
      muzzles.push({ x: this.player.x * laneWidth + offset, y: this.player.y + playerRadius });
    }
    const shots = this.bullets.update(dt, {
      min,
      max,
      laneWidth,
      cameraRise: this.cameraRise,
      muzzles,
      /**
       * Firing is a PLAYING-phase act, and one the bubble type can refuse.
       *
       * Not armed during the birth animation or while the bubble is popping: a stream of fire during either would
       * be the game acting while the player has no control. Rounds already in flight keep flying in those phases,
       * which is right -- they are in the water, not in the player's hands.
       */
      armed: this.phase === 'playing' && this.bubbleType.firesBullets,
      /**
       * The run's CURRENT rate tier.
       *
       * `rateTier` is 1-based and the ladder's first entry is what a run starts at, so the array's length IS the number
       * of tiers there are -- see `bullets.rateTiers`.
       */
      perSecond: (mech.bullets.rateTiers[Math.min(this.rateTier, mech.bullets.rateTiers.length) - 1] ?? 0) * this.gunRateScale,
      /**
       * The shotgun branch, in the same breath as the rate: a spread volley is a change to what one shot IS, so it
       * belongs where the shot is described rather than where the hits are resolved. `gunRateScale` multiplies the
       * tier above rather than replacing it, so "第 N 档" keeps meaning what it means and the shotgun is a modifier
       * on top -- which is also how the two compose for a player who upgrades the ladder after taking it.
       */
      pellets: this.gunPellets,
      spreadDegrees: this.gunSpreadDegrees,
      closeRangeMeters: this.bulletCloseRangeMeters,
      closeDamageRate: this.bulletCloseDamageRate,
      knockbackScale: this.bulletKnockbackScale,
      /**
       * What one round takes off, config price times the mutation ladder's stacked multiplier.
       *
       * Handed in rather than read by the bullet module, so the multiplier stays the RUN's -- the gun's
       * module is the behaviour of a round, not the player's upgrades.
       */
      damage: mech.bullets.damage * this.bulletDamageMultiplier,
      /** The barrage route's dials, handed in like damage: the run's picks, not the weapon's nature. */
      speedMultiplier: this.bulletSpeedMultiplier,
      radiusMultiplier: this.bulletRadiusMultiplier,
      lifeMultiplier: this.bulletLifeMultiplier,
      /**
       * The two state-driven damage cards, handed in as the RATES the round will apply to its own state.
       *
       * Rates rather than resolved multipliers for the same reason `damage` is handed in rather than read: the gun's
       * module owns the formula, and the run owns which cards it has taken.
       */
      sizeDamageRate: this.bulletSizeDamageRate,
      speedDamageRate: this.bulletSpeedDamageRate,
      /**
       * The tracking round's three inputs: where the bubble is, how often a round should track, and the dice.
       *
       * `playerY` is passed as the raw world metre the player is at -- the same number a hazard's `y` is measured
       * in -- because the homing rule is a plain comparison against it and any conversion here would be a second
       * place for that comparison to be got wrong.
       */
      playerY: this.player.y,
      homingChance: this.bulletHomingChance,
      random: this.bulletRandom,
      hazards: this.hazards,
      obstacles: this.obstacles,
    });

    /**
     * The gun's two sounds, and the order between them matters: the shot first, then the hit.
     *
     * A round is small and gone in a frame, so without a tick the player cannot tell "I am hitting it" from "I am
     * missing" at four rounds a second -- the counters say it, but nobody reads counters while dodging. Only hits
     * on a CREATURE count: `shots.hits` excludes the rounds a crate stopped, because scenery does not bleed.
     *
     * The hit that drives a creature off is played louder, which is the "that one is done" beat -- the same cue
     * rather than a second sound, so the gun keeps one voice.
     *
     * The fire cue is played ONCE per frame however many rounds the frame owed: a long frame can produce several,
     * and firing the cue per round would turn one stutter into a burst of clicks. Its volume is its own config key
     * because it is the rhythm rather than the information: the hit should be the one that stands out.
     */
    if (shots.fired > 0) this.sound('gun.fire', mech.audio.bulletFireVolume);
    if (shots.hits > 0) {
      const volume = mech.audio.bulletHitVolume;
      this.sound('gun.hit', shots.drivenOff > 0 ? Math.min(1, volume * 1.4) : volume);
    }
    /**
     * Points for the kill, told apart from the hit: the ledger is meant to show which act paid, not just that the
     * gun was busy. One floating number per creature, AT the creature -- a swarm driven off in one frame is several
     * events and reads as several numbers, which is the truth of what happened.
     */
    if (shots.drivenOff > 0) {
      const points = this.score.award('drivenOff', shots.drivenOff);
      // Divided by the count so the numbers on screen add up to what the ledger recorded, whatever the config says.
      for (const at of shots.driven) this.scorePopup(at.x, at.y, points / shots.drivenOff);
      // The mutation ladder pays the same event the score does -- one site, one event, two ledgers.
      this.xp.gain('drivenOff', shots.drivenOff);
      /**
       * THE RISK PRICING of a gun kill, per creature at the position it fell.
       *
       * 贴脸: inside contact × `pointBlankRadius` -- the shot was taken from where the creature could
       * still reach you, which is the gun's answer to the graze's question (one pays the dodge, the
       * other pays standing in). 拆弹: a bombfish finished from OUTSIDE its blast -- the whole trade
       * of shooting one is choosing where it goes off, and doing that from beyond the bang is the
       * clean version of it. Both pay IN ADDITION to the drivenOff they rode in on, and to any graze
       * the creature's charge paid: dodging a lunge and finishing the lunger point blank are two acts.
       */
      const playerX = this.player.x * laneWidth;
      const playerR = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
      for (const at of shots.driven) {
        const dist = Math.hypot(at.x - playerX, at.y - this.player.y);
        if (dist <= (playerR + at.r) * mech.mutation.pointBlankRadius) {
          this.xp.gain('pointBlank');
          sayCallout(this.events, at.x, at.y, '贴脸');
        }
        if (at.kind === 'bombfish') {
          const blast = laneWidth * mech.hazards.bombfish.blastRadiusRatio;
          if (dist > blast) {
            this.xp.gain('defuse');
            sayCallout(this.events, at.x, at.y, '拆弹');
          }
        }
      }
    }
    /**
     * And what each round TOOK OFF, at the creature it landed on.
     *
     * The third half of the hit feedback, and the only one that carries a quantity: the flash says a round connected
     * this frame and the knockback says it was pushed, but a creature's hit points are invisible, so until now "how
     * much is left" and "is this gun doing anything at all" had no answer anywhere on the screen.
     *
     * One number per landed round rather than one per creature per frame: a burst that lands three rounds is three
     * events, and the count is the thing the player is reading. Its own style makes it smaller and shorter-lived than a
     * score number, because this is a RATE and the score is an event.
     */
    for (const at of shots.struck) this.damagePopup(at.x, at.y, at.amount);
  }
  /**
   * The enemies' guns: their rounds fly, are stopped by scenery, and hurt the player.
   *
   * The creatures fire through `HazardEffect.shot` (see `HazardField`), which is why this method is a consumer and not
   * a poller: it is handed the orders that came out of this frame's hazard update and turns them into rounds. Damage
   * is applied by CALLING `takeHit`, so an enemy round is the same hit as a collision -- there is no second damage
   * path, and the invulnerability window protects against a whole fan landing at once.
   */
  updateEnemyBullets(dt: number, laneWidth: number, min: number, max: number, shots: readonly { kind: HazardKind; x: number; y: number }[]): void {
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    /**
     * Firing and being hit are PLAYING-phase acts, the same rule the player's own gun follows.
     *
     * Not during the birth animation (the player has no control yet) and not during the ending: a round that landed
     * while the bubble was already bursting would restart the burst timer, so the results card would sit there being
     * extended by a creature still shooting at a run that is over. Rounds already in the water keep flying -- they are
     * in the water, not in anyone's hands.
     */
    const live = this.phase === 'playing';
    if (live) {
      for (const shot of shots) {
        this.sound('enemy.fire', 0.25, this.panAt(shot.x));
        this.enemyBullets.fire(shot.kind, shot.x, shot.y, this.player.x * laneWidth, this.player.y, laneWidth);
      }
    }
    const { landed, grazedAt } = this.enemyBullets.update(dt, {
      min,
      max,
      laneWidth,
      cameraRise: this.cameraRise,
      playerX: this.player.x * laneWidth,
      playerY: this.player.y,
      playerRadius,
      invulnerable: this.invulnerable > 0,
      // Scenery is cover for both sides -- the same call the player's own rounds make.
      blocks: (x, y, hitRadius) => this.obstacles.blocks(x, y, hitRadius),
    });
    if (live && landed.length > 0) {
      for (const kind of landed) {
        /**
         * HOW HARD THIS ROUND HITS, from the shooter's own row.
         *
         * Looked up per round rather than carried on it, so a live console edit of the row changes the next round
         * that lands. The pistol shrimp's cavitation round is what makes the "elite" real: 40 against a fish's 20.
         */
        const damage = Math.max(0, mech.enemyBullets.shooters[kind]?.damage ?? 0);
        if (damage > 0) {
          this.takeHit(damage);
          // A hit can end the run; nothing after this may assume there is still a bubble.
          if (this.phase !== 'playing') return;
        }
        /**
         * AN ELECTRIC ROUND TAKES THE CONTROLS WITH IT.
         *
         * The eel is the creature whose cost is paid by the player's hands, and until now the only way to pay it was
         * to swallow one -- so the mechanic was invisible to anyone who left the eels alone, and invisible in the one
         * moment it should have been loudest, the moment the discharge leaves. Being shot by the discharge is being
         * shocked, so it reverses the steering for `boltShockSeconds`.
         *
         * The same `applyMisfire` the stomach uses, so the two combine the way two eels already do -- by EXTENDING
         * rather than replacing (see `Player.applyMisfire`) -- and the bubble wears the same jagged ring either way.
         * Only the eel's rounds do this, and the round's own `kind` is what says so: a second shooter that happens to
         * fire something electric would have to ask for it here rather than inherit it.
         */
        if (kind === 'eel') this.player.applyMisfire(mech.hazards.eel.boltShockSeconds);
      }
    }
    /**
     * The bullet grazes the frame paid: one small word each, where the round went by.
     *
     * The test (the pass-by dot) already ran inside the field; the PAYMENT is gated on `live`, the same
     * gate the hits use, because a graze during the ending is not a risk anyone took.
     */
    if (live) {
      for (const at of grazedAt) {
        this.xp.gain('bulletGraze');
        sayCallout(this.events, at.x, at.y, '擦');
      }
    }
  }
  /**
   * Rage: gain is event-driven (see `takeHit`), and this is the clock.
   *
   * Only the decay needs a frame. The devour bubble has no rage at all, and this returning immediately is what keeps
   * the second resource from costing the first type anything.
   */
  updateRage(dt: number, laneWidth: number): void {
    if (this.bubbleType.look !== 'rage') return;
    // The wave's animation, which is drawing only: its effects were applied on the frame it fired.
    if (this.burst) {
      this.burst.seconds += dt;
      if (this.burst.seconds >= mech.angry.burst.waveSeconds) this.burst = null;
    }

    const gripped = this.hazards.hazards.some((h) => h.gripping);
    /**
     * A FULL GAUGE IS THE VERB, and it is checked BEFORE the clock for one reason: a gauge that is full has to fire
     * even if it is also about to cool.
     *
     * The order is load-bearing for the carried-over case. A run that finished a level with a full gauge -- or one
     * the boss's own payout put near the top -- arrives here full AND safe, and if the decay ran first it would take
     * a sliver off every frame and `>= max` would never be true again: the burst would silently never fire.
     */
    if (this.rage.rage >= mech.angry.rage.max) {
      this.useBurst(laneWidth);
      return;
    }
    tickRage(this.rage, dt, this.invulnerable > 0 || gripped, this.rageDecayMultiplier);

    /**
     * The armour's metronome.
     *
     * Fixed, and deliberately NOT scaled by rage (see the config's note): a plate is a thing you have, rage is a
     * thing that is happening to you, and a player who wants more slams takes the card that shortens this.
     */
    if (this.armourPlates < this.armourMax) {
      this.armourSeconds += dt;
      if (this.armourSeconds >= this.armourSecondsPerPlate) {
        this.armourSeconds -= this.armourSecondsPerPlate;
        this.armourPlates++;
      }
    }

    /**
     * The attached burn.
     *
     * The tick carries its remainder rather than resetting to zero, so the rate is the configured one whatever the
     * frame rate did -- the same carried clock the gun's cadence uses.
     */
    if (this.auraDamagePerTick > 0 && mech.angry.aura.tickSeconds > 0) {
      this.auraSeconds += dt;
      if (this.auraSeconds >= mech.angry.aura.tickSeconds) {
        this.auraSeconds -= mech.angry.aura.tickSeconds;
        this.burnNearby(laneWidth);
      }
    }

    /**
     * A FULL GAUGE IS THE VERB.
     *
     * The gauge used to end in a countdown at the top ("失控") and that is gone -- it took the controls away, which
     * is the one thing a melee route cannot afford. Instead the ceiling is where the burst fires, by itself, and
     * spending the gauge is what makes it a one-shot trigger rather than a state: `useBurst` empties it, so the next
     * frame is looking at a gauge that is no longer full.
     */
    if (this.rage.rage >= mech.angry.rage.max) this.useBurst(laneWidth);
  }

  /**
   * The attached burn's tick: every creature inside the aura takes it.
   *
   * The radius is a multiple of the player's OWN radius, so it is always "on you" rather than a fixed zone that
   * stops mattering as the bubble grows. Damage goes through `hit` like everything else, with a knockback scale of
   * zero -- a fire that shoved things away would be a fire that could not keep burning them.
   */
  private burnNearby(laneWidth: number): void {
    const aura = mech.angry.aura;
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    const reach = playerRadius * aura.playerRadiusRadii;
    const px = this.player.x * laneWidth;
    const py = this.player.y;
    for (const h of this.hazards.hazards) {
      const r = reach + laneWidth * hazardSizeFraction(h.kind, h.scale);
      const dx = h.x - px;
      const dy = h.y - py;
      if (dx * dx + dy * dy > r * r) continue;
      this.hazards.hit(h, vulnerableDamage(h, this.auraDamagePerTick), { x: h.x, y: h.y, knockScale: 0 });
    }
  }

  /**
   * The boss fight: arrival, the health bar, and the win condition.
   *
   * Three jobs in one place because they are one fact -- "is there a boss, and how is it doing". The level says where
   * and how tough (`LEVEL.boss`), the config says how it behaves, and the FIELD owns its body: it is a hazard so that
   * the player's gun hits it with no new code, and so that the invulnerability window, the damage numbers and the
   * culling rules all apply to it exactly as they do to a fish.
   */
  /**
   * LEVEL 3's conductive chain: charging, decaying, and the discharge itself.
   *
   * A charged bubble ignites the nearest zapper the moment it comes within `chainRangeMeters`, and the discharge then
   * JUMPS between jellies (`chainJumpMeters`, up to `chainMaxTargets`), which is why the same mechanic is also a
   * weapon against a shoal and a key against a tentacle blocking a route: the damage is area damage that propagates
   * through the level's own creatures.
   *
   * The bubble is a capacitor and not a gun: charging is passive (be near the electric water), so the interesting
   * decision is where to STAND while charged, which is exactly the decision the level is built around.
   */
  updateConductiveCharge(dt: number, laneWidth: number): void {
    const cfg = mech.hazards.charge;
    if (this.phase !== 'playing') {
      this.chargeBurst = Math.max(0, this.chargeBurst - dt);
      return;
    }
    let near = false;
    for (const h of this.hazards.hazards) {
      if (h.kind !== 'zapper' || h.flee) continue;
      if (Math.hypot(h.x - this.player.x * laneWidth, h.y - this.player.y) <= cfg.nearMeters) {
        near = true;
        break;
      }
    }
    this.charge = near
      ? Math.min(cfg.max, this.charge + cfg.perSecondNearZapper * dt)
      : Math.max(0, this.charge - cfg.decayPerSecond * dt);
    this.chargeBurst = Math.max(0, this.chargeBurst - dt);

    if (this.charge < cfg.chainAt) return;
    /**
     * The discharge. The reach is a rule of its own -- see `src/conductive.ts`, which is where the breadth-first spread
     * lives now that it can be asked directly what a given arrangement of zappers does.
     */
    const px = this.player.x * laneWidth;
    const py = this.player.y;
    const reached = chainTargets(this.hazards.hazards, { x: px, y: py }, {
      rangeMeters: cfg.chainRangeMeters,
      jumpMeters: cfg.chainJumpMeters,
      maxTargets: cfg.chainMaxTargets,
    });
    if (reached.size === 0) return;

    this.chargeBurstRadius = cfg.chainJumpMeters * 0.5;
    this.chargeBurst = cfg.burstSeconds;
    this.charge = 0;
    this.sound('chain.zap');
    for (const h of this.hazards.hazards) {
      if (!reached.has(h.id)) continue;
      // Through `hit`, so the discharge is ordinary damage: health, the driven-off score, the popup and the knockback
      // all apply. The impact point is the BUBBLE, because that is where the discharge came from -- so a chained zapper
      // is pushed away from the player like everything else the player hits.
      this.hazards.hit(h, cfg.chainDamage, { x: px, y: py });
      this.scorePopup(h.x, h.y, this.score.award('drivenOff'));
      this.xp.gain('drivenOff');
    }
    // Self-inflicted, so defence does NOT apply (`takeHit`'s second argument): the chain is the player's own
    // doing, and a player who could armour their way out of it would be deleting the cost of the button.
    if (cfg.chainSelfDamage > 0) this.takeHit(cfg.chainSelfDamage, 0);
    this.banner(`连锁放电  ·  ${reached.size} 只`);
  }
  /**
   * Spawn, move and resolve the hazards, applying whatever they did to the player.
   *
   * The effects are applied here rather than inside `HazardField` so that the field stays a pure
   * simulation: it decides what happened, the game decides what that means. That split is what lets
   * a probe drive hazards without a player.
   */
  resolveHazards(dt: number, min: number, max: number, laneWidth: number, world: WorldView, input: Input): void {
    /**
     * The suction field, recomputed rather than passed down.
     *
     * Cheap (two multiplications) and it keeps this method callable on its own, which matters because probes
     * drive hazards through it. If the two disagreed about where the field is centred, the pull and the collision
     * would be pulling toward different points.
     */
    const suctionAt = this.suctionUp(input)
      ? { x: this.player.x * laneWidth, y: this.player.y, radiusFactor: this.suctionRadiusFactor }
      : null;

    // The bubble field is handed in so the emergence rules can act on it: fish eat collectables and
    // split, and the seeking hazards go after the biggest one. Anything eaten is removed here, by the
    // owner of the field, rather than by the hazard module reaching into it.
    const ctx = {
      min,
      max,
      laneWidth,
      playerX: this.player.x * laneWidth,
      playerY: this.player.y,
      playerRadiusFraction: stageRadiusFraction(this.stage.stage, this.player.volume),
      // The level's own number for how fast its creatures fall down the screen. Not the scroll speed: the camera's climb is
      // the level's progress and nothing a creature does depends on it (it is handed back through `cameraRise`).
      driftSpeed: LEVEL.driftSpeed,
      cameraRise: this.cameraRise,
      elapsed: this.elapsed,
      invulnerable: this.invulnerable > 0,
      // Struggling is "actively steering", which is the intuitive way to tear free of a trash bag. Was a speed
      // threshold when there was an accelerate control, and a raw pointer check when touch named a destination;
      // now it is one question with one answer, because every steering source ends up in the axes.
      struggling: input.steering,
      playerVolume: this.player.volume,
      canSlam: this.hasArmour,
      /**
       * The food-chain reversal, asked of the ONE module that owns the rule.
       *
       * Passed as a function rather than as a size so the hazard module cannot implement its own comparison, and
       * so the outline marker (which asks the same question while drawing) can never disagree with what happens
       * on contact.
       */
      canEat: (kind: HazardKind) => this.canSwallow(kind),
      /**
       * The suction field, or null when it is not held.
       *
       * The SAME player position is handed to both fields, so a hazard and a collectable at the same distance are
       * pulled identically. Two independently-derived centres would drift and the field would look off-centre.
       */
      suction: suctionAt,
      bubbles: this.field.bubbles,
      eatenBubbleIds: [] as number[],
      splitCount: 0,
    };

    const effects = this.hazards.update(dt, ctx);

    /**
     * Enemy fire, taken from the same effects list the damage comes out of.
     *
     * Called BEFORE the effect loop below, because the loop `continue`s on some branches and this is not one creature's
     * event -- it is the frame's. A shooter that was also, say, eaten this frame still gets its round away; the round
     * was fired before anything touched it, and dropping it would make being eaten a way to cancel an attack.
     */
    this.updateEnemyBullets(
      dt,
      laneWidth,
      min,
      max,
      effects.filter((e) => e.shot).map((e) => ({ kind: e.kind, x: e.shot!.x, y: e.shot!.y })),
    );

    /**
     * The FIXED-AIM volleys, fired beside the aimed shots they live next to.
     *
     * Directions, not target points, came across from the field -- the starfish's rosette and the puffer's
     * answer-ring do not care where the player is, and handing a target would be handing an aim. Each
     * direction becomes one round through the SAME `fire()` the aimed shooters use: a point 100m along the
     * direction is a pure direction carrier (`fire` only reads its angle), the speed, shape and size come
     * from the kind's own shooter row, and `fired` is counted per round exactly as before.
     *
     * Gated on the phase for the same reason the aimed shots are gated on `live`: a volley during the
     * ending is nobody's risk.
     */
    if (this.phase === 'playing') {
      for (const e of effects) {
        if (!e.volley) continue;
        for (const dir of e.volley.dirs) {
          this.enemyBullets.fire(e.kind, e.volley.x, e.volley.y, e.volley.x + dir.x * 100, e.volley.y + dir.y * 100, laneWidth);
        }
      }
    }

    /**
     * The boss's claw swing, turned into grit.
     *
     * The pieces are ordinary `mineral` creatures born at the claw and given a charge curve to the aim point, which
     * is what makes this one line instead of a second projectile system: they collide, they hurt, they can be eaten
     * by a big enough bubble and they finish their flight by rising like every other piece of vent grit. The curve's
     * flight time comes from `charges.chargers.mineral` with its telegraph set to ZERO -- the wind-up the player
     * reads is the claw swing itself, and a second drawn telegraph on top of it would be two warnings arguing.
     */
    for (const effect of effects) {
      if (!effect.spray) continue;
      const { fromX, fromY, targets, bow } = effect.spray;
      for (const [index, target] of targets.entries()) {
        const grit = this.makeHazard(world, 'mineral', fromX, fromY);
        grit.charge = {
          fromX,
          fromY,
          toX: target.x,
          toY: target.y,
          // Alternating, so the fan opens like a splash rather than sliding sideways as a block.
          bow: (index % 2 === 0 ? 1 : -1) * bow * Math.hypot(target.x - fromX, target.y - fromY),
          elapsed: 0,
          grazed: false,
          hitPlayer: false,
        };
        // `makeHazard` builds one; the caller adds it -- the same two steps the level's own spawner takes, because a
        // creature the field does not hold is a creature that never moves, never hurts anything and is never drawn.
        this.hazards.hazards.push(grit);
      }
    }

    // Remove whatever the swarm ate. Done with a Set so a large bubble field does not cost a linear
    // scan per eaten bubble.
    if (ctx.eatenBubbleIds.length) {
      const eaten = new Set(ctx.eatenBubbleIds);
      this.field.bubbles = this.field.bubbles.filter((b) => !eaten.has(b.id));
    }

    for (const e of effects) {
      /**
       * THE REVERSAL, handled before anything else.
       *
       * An `eaten` effect carries no damage, so this cannot conflict with the branches below -- but it is checked
       * first anyway, because "being eaten" and "hurting the player" are mutually exclusive outcomes of the same
       * overlap and the ordering should say so rather than depend on the fields happening not to overlap.
       *
       * The hazard contributes its mass and a brief invulnerability: eating is the moment the bubble becomes
       * bigger and slower, so going without it would mean the reward for a successful reversal is immediately
       * being hit by whatever was next to it.
       */
      /**
       * A DETONATION: the shockwave, the sound, and whatever the blast caught.
       *
       * Handled before the reversal below because a bomb that goes off is not a meal, and because the damage must go
       * through `takeHit` like every other hit -- the blast is a source, not a second damage system.
       */
      /**
       * An electric ring swept the bubble: it banks the charge rather than only hurting.
       *
       * LEVEL 3's mechanic passes through the same channel every other consequence does, so a probe can drive it and
       * the picture can read it without a second code path.
       */
      /**
       * LEVEL 6's rain: it presses the bubble back DOWN.
       *
       * Applied to the player's own position rather than as a knockback impulse, so it costs exactly the height it
       * says it does (`pushMeters`) whatever the frame rate did -- the same reasoning as the charge popups' rise.
       */
      if (e.graze) {
        /**
         * A NEAR-MISS paid out. The points land on the frame they were earned -- the design's "即时触发" -- and
         * the drain does the two things a rule must not: it writes a word into the water and stretches time,
         * both of which are the presentation's to do (see `applyRunEvents`' graze case).
         */
        this.xp.gain('graze');
        sayGraze(this.events, e.graze.x, e.graze.y);
        this.sound('graze', 0.5, this.panAt(e.graze.x));
        continue;
      }
      if (e.pushDown) {
        this.player.y = Math.max(0, this.player.y - e.pushDown);
      }
      if (e.charge) {
        this.charge = Math.min(mech.hazards.charge.max, this.charge + e.charge);
      }
      if (e.blast) {
        // The ring and the shake are the drain's to build: the shake is measured against the WINDOW, and a rule that
        // has to ask how big the window is cannot run without one. The blast says where and how wide.
        sayBlast(this.events, e.blast.x, e.blast.y, e.blast.radius);
        this.sound('bomb.blast', 0.6, this.panAt(e.blast.x));
        this.lastComedyBeat = { what: e.kind, at: this.elapsed };
        /**
         * The blast hurts the player, through the ordinary hit path.
         *
         * `e.damage` is 0 when the bubble was outside the radius: the field measures that (it has the player's
         * position), and reporting a zero rather than omitting the effect is what lets the shockwave still be drawn
         * for a blast that missed -- the player needs to see the thing that nearly got them.
         */
        if ((e.damage ?? 0) > 0) {
          this.takeHit(e.damage ?? 0);
          if (this.phase !== 'playing') return;
        }
      }
      if (e.slammed) {
        /**
         * The armour's hit: the same overlap that would have hurt is spent as a plate instead.
         *
         * Here rather than in the field, for the reason `e.eaten` is: the field reports what touched what, and the
         * RUN owns what a plate is. The order matters -- the slam's own damage lands BEFORE the mark, so the hit that
         * applies the opening is not itself multiplied by it.
         */
        this.armourPlates = Math.max(0, this.armourPlates - 1);
        this.slams++;
        const target = this.hazards.hazards.find((h) => h.id === e.slammed!.id);
        if (target) {
          this.hazards.hit(target, mech.angry.armour.damage, { x: target.x, y: target.y, knockScale: 1 });
          markVulnerable(target, mech.angry.armour.vulnerableSeconds, this.armourVulnerableMultiplier);
        }
        this.sound('rage.slam', 0.7);
        continue;
      }
      if (e.eaten) {
        // Health, like every other meal: size comes from the bands now, so what a swallow is worth has to be the
        // currency the bands read. See the absorb branch for the same swap.
        this.health = Math.min(this.healthMax, this.health + massFromEating(e.kind) * mech.volume.healthPerVolume);
        this.stats.absorbed++;
        // The reversal pays: it is the game's signature act and the one that costs the most (a bigger creature is
        // worth more health but took more risk to touch), so a score that ignored it would price the safe play above
        // the interesting one. The number appears at the BUBBLE, which is where the creature was when it was
        // swallowed -- a contact is a touching distance, so the difference is a radius.
        this.scorePopup(this.player.x * laneWidth, this.player.y, this.score.award('eaten'));
        this.xp.gain('eaten');
        this.invulnerable = Math.max(this.invulnerable, mech.consumption.eatInvulnerableSeconds + this.eatInvulnBonusSeconds);
        this.sound('player.eat');
        continue;
      }

      if (e.damage) {
        // ONE blow worth the creature's damage, rather than N blows of one point each: the defence is subtracted
        // once from the real number, which is what makes "defence 8 against a 20-damage fish" arithmetic a player
        // can do. See `src/health.ts`.
        this.takeHit(e.damage);
        // The fish-fart talent fires on the contact that would have hurt, which is what makes it a
        // reflex rather than an action. Its BACKLASH is the point: it shoves the fish off and then
        // leaves bait behind, so the escape is also what feeds the swarm. See src/talents.ts.
        if (this.talentEffects.talent.id === 'fish-fart') this.releaseFart(world);
      }
      if (e.slowSeconds && e.slowFactor) {
        this.player.applySlow(e.slowSeconds, e.slowFactor);
        this.sound('player.slow');
      }
      if (e.impulse) {
        /**
         * A crab launches the bubble UP THE SCREEN, not up the level.
         *
         * The hazard module deals in m/s because it works in world metres, so the impulse is converted here
         * through the visible height. The player moves in screen fractions, and passing the raw m/s figure
         * would fling them from one edge of the window to the other in a single frame.
         *
         * The bonus exists because the conversion alone is not enough to be visible: 30 m/s over a 454m view
         * is 0.066 of the screen per second, and the scroll drags the bubble back down at 25 m/s, so the two
         * nearly cancel and the launch reads as nothing happening at all. See the tuning note.
         */
        const asScreenFraction =
          (e.impulse / Math.max(1, world.visibleDepthMeters)) * mech.hazards.crab.launchScreenBonus;
        this.player.impulseVy = Math.max(this.player.impulseVy, asScreenFraction);
        this.lastComedyBeat = { what: 'crab', at: this.elapsed };
        // The crab is the one hazard that can HELP, so it gets an upward cue rather than a thud.
        this.sound('crab.launch');
      }
      /**
       * The water's own three, each by name: rain that presses the bubble down, foam that pops against it, and mineral
       * grit. They are `broke: true` contacts like the scenery, so this is the branch that already knows they happened.
       */
      if (e.kind === 'rain') this.sound('rain.press');
      else if (e.kind === 'foam') this.sound('foam.pop');
      else if (e.kind === 'mineral') this.sound('mineral.hit');
      if (e.drainPerSecond) {
        // Continuous, so it is applied as a fraction of a hit point per second rather than as whole
        // hits -- otherwise being grabbed would be instant death at any frame rate.
        const perHit = hazardTuning.trashDrainPerHit;
        this.trashDrain += hazardTuning.trashDrainPerSecond * dt;
        while (this.trashDrain >= perHit) {
          this.trashDrain -= perHit;
          // Self-inflicted (`takeHit`'s second argument): being grabbed is what swimming into the bag costs.
          this.takeHit(perHit, 0);
        }
      }
      if (e.broke) {
        this.comedyBeats++;
        this.lastComedyBeat = { what: e.kind, at: this.elapsed };
      }
    }
  }
  /**
   * Handling for every collectable contact, in one place so both outcomes (eat / bounce) are
   * visible side by side.
   *
   * `bigger eats smaller` is the whole rule. The player's radius is its hitbox, so growing makes
   * absorbing easier and being hit easier in the same motion -- that is the built-in cost.
   */
  resolveContacts(dt: number, world: WorldView): void {
    const laneWidth = world.laneWidth;
    const playerX = this.player.x * laneWidth;
    const playerR = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    let eaten = 0;

    /**
     * Obstacles first, so the bubble cannot eat through a crate.
     *
     * A crate is scenery: food behind it is behind it. Letting the collectable pass resolve while the player is
     * stuck on a crate would mean the scenery does not exist as far as the reward is concerned, which is worse
     * than not having scenery at all.
     *
     * Three outcomes now, and which one happens is the mechanic: big enough and the crate is smashed, too small and
     * the player is STOPPED by it and takes a hit, and against a NET they are stopped and take nothing -- it tears
     * instead, and pushing is the price. `dt` goes in because that tear is a rate.
     */
    const contact = this.obstacles.resolvePlayer(
      playerX,
      this.player.y,
      /**
       * The bubble's reach, and nothing else.
       *
       * It used to carry two bonuses: the slam's (which widened a committed attack so it connected on the frame it
       * was aimed at) and the overload's (which really did enlarge the bubble). Both lived with verbs that are gone
       * -- see `hasArmour`. The aura does NOT widen this: it is a damage field AROUND the bubble, not a bigger
       * bubble, and confusing the two would make the fire reach further than it looks.
       */
      playerR,
      this.player.volume,
      this.invulnerable > 0,
      dt,
      /**
       * The ram, while a plate is unspent.
       *
       * `breaksUnrammable` comes from the config rather than from the type descriptor because it is a balance
       * question about the WALL (does this bubble get to ignore masonry?), not about the bubble's identity -- and the
       * answer has to be yes, because this is the only way ANY form opens a wall. See `angry.armour`.
       */
      this.hasArmour
        ? { damage: mech.angry.armour.obstacleDamage, breaksUnrammable: mech.angry.armour.breaksUnrammable }
        : undefined,
    );
    if (contact.hit?.broke) {
      this.lastComedyBeat = { what: 'crab', at: this.elapsed };
      // By MATERIAL rather than one thud: a crate and a net come apart to their own cues and the three hard ones
      // (coral, wall, tube) share one. See `OBSTACLE_BREAK_SOUNDS`, which covers every kind now -- until it did, this
      // line's fallback was quietly playing `rage.slam` for walls and tubes.
      this.sound(OBSTACLE_BREAK_SOUNDS[contact.hit.kind] ?? 'rage.slam');
    }
    if (contact.hit) {
      /**
       * A ram costs a PLATE, not rage.
       *
       * The armour is the ammunition now, and the plate is spent whether the thing broke or was merely shoved: the
       * bubble was a hammer for that frame either way, and a hammer that could swing for ever would not be
       * ammunition. This is also what keeps "may I open this wall" a question with a cost, since walls are the one
       * thing no other form can open at all -- see `angry.armour.breaksUnrammable`.
       */
      if (this.hasArmour) {
        this.armourPlates--;
        this.slams++;
      }
    }
    if (contact.blocked) {
      /**
       * `hurt` rather than `blocked` decides the hit, and it exists for the obstacle that cannot hurt you. Charging
       * a hit point for the one kind a small player can get through would cost exactly what the kinds they cannot
       * get through cost, which would remove the reason it exists.
       */
      if (contact.hurt) this.takeHit(mech.obstacles.contactDamage);
      // The bump itself, whether or not it hurt: a net stops the bubble without costing anything, and the player still
      // needs to hear that they have been stopped.
      this.sound(OBSTACLE_BLOCK_SOUND);
      // Pushed back down the screen, out of the obstacle, so one crate cannot cost several hits.
      this.player.impulseVy = -Math.max(this.player.impulseVy, 0.25);
    }
    /**
     * A net does not stop the player and does not hurt them -- it DRAGS.
     *
     * The slow is applied fresh every frame it is in contact, with a short tail, so it lasts exactly as long as the
     * net does and lets go a fraction of a second later. That tail is not padding: applied as a single frame it
     * would flicker as the overlap test came and went. The slow is also what makes a net DISCOVERABLE, and it is
     * why the tear is affordable -- being dragged through the mesh is the time it takes to tear it.
     */
    if (contact.dragging) {
      this.player.applySlow(mech.obstacles.netDragSeconds, mech.obstacles.netDrag);
    }
    if (contact.hit || contact.blocked) {
      this.invulnerable = Math.max(this.invulnerable, mech.obstacles.collideInvulnerableSeconds);
    }

    for (let i = this.field.bubbles.length - 1; i >= 0; i--) {
      const b = this.field.bubbles[i];
      if (!b) continue;
      const bubbleR = laneWidth * b.radius;

      // Bubbles are near-elliptical in motion; a circle test on the combined radii is plenty and
      // never lets a visibly-overlapping bubble slip through.
      const reach = playerR + bubbleR;
      const dx = b.x - playerX;
      const dy = b.y - this.player.y;
      if (dx * dx + dy * dy > reach * reach) continue;

      if (playerR >= bubbleR * 0.92) {
        /**
         * Absorbed -- and what that PAYS depends on whether this form grows at all.
         *
         * For a form that grows (devour is the only one) growth IS the reward: bubbles are food, food is volume, and
         * volume is hit points as well as hitbox. For every other form the same act pays in POINTS and the bubble
         * stays exactly the size it was -- growing would buy it nothing, because its hit points are a count that
         * eating does not touch (`src/health.ts`), and it would cost it a bigger hitbox on top. So the bubble is
         * still removed and still pays; only the currency differs.
         *
         * The stage counter is deliberately not touched in that branch either: advancing it would apply the growth
         * stages' speed penalties to a bubble that never grew, which is a cost with no matching benefit.
         */
        const grows = this.bubbleType.growsByAbsorbing;
        if (grows) {
          /**
           * EATING BUYS HEALTH NOW, not size.
           *
           * Size comes from the health bands (`applyHealthBand`), chosen once per level, so the currency a bubble
           * collects has to be the one that feeds them. A big bubble is worth more per mouthful -- the value is its
           * volume -- which is what keeps "chase the big ones" true after the swap.
           */
          this.health = Math.min(this.healthMax, this.health + b.volume * mech.volume.healthPerVolume);
          /**
           * Count toward the next growth stage, and react if that promoted the bubble.
           *
           * The promotion is the caller's to handle: `recordAbsorb` only knows the numbers. The stage still moves
           * SIZE (its radius multiplier) and speed, so the same grace period applies -- without it, growing would
           * immediately mean taking a hit, which reads as the game punishing the player for doing well.
           */
          if (recordAbsorb(this.stage)) {
            this.player.stageSpeedMultiplier = this.stage.speedMultiplier;
            this.invulnerable = Math.max(this.invulnerable, mech.stages.growInvulnerableSeconds);
            this.banner(`${stageName(this.stage.stage)}  ·  ${this.stage.stage} 阶段  ·  速度 ×${this.stage.speedMultiplier.toFixed(2)}`);
            this.sound('stage.grow');
          }
        } else {
          const points = this.score.award('absorb');
          if (points > 0) this.scorePopup(b.x, b.y, points);
        }
        this.stats.absorbed++;
        /**
         * Every collectable pays mutation points, on BOTH routes.
         *
         * The score above does not: it goes to whoever cannot grow from absorbing, because for the growth route the
         * size IS the payment (see `score.absorb`). Mutation is not that kind of currency -- the pickup happened
         * either way, and the route that grows faster should not also be the one that mutates slower. `times` is 1,
         * so this is the config's `mutation.gain.absorb` and nothing else.
         */
        this.xp.gain('absorb');
        eaten++;
        this.sound('player.absorb', Math.min(1, bubbleR / Math.max(1e-6, playerR)));
        this.field.bubbles.splice(i, 1);
      } else if (this.invulnerable <= 0) {
        // Too big to eat: it hurts -- the standard price of running into something, same as a fish or a crate.
        this.takeHit(mech.consumption.bumpDamage);
        this.field.bubbles.splice(i, 1);
      }
    }

    if (this.player.volume > this.stats.maxVolume) this.stats.maxVolume = this.player.volume;
    this.lastEaten = eaten;
  }
    /** The bubble pops: slow-motion burst, then a brief result card, then a fresh run. */
  startBurst(): void {
    this.phase = 'burst';
    this.phaseTimer = BURST_SECONDS;
    this.stats.ended++;
    this.recordBest();
    this.sound('player.pop', 0.7);
    // And the ending's own music over it: a few bars that say the run is over, rather than a sound that says something
    // just happened. Both play -- the sting is deliberately longer than the pop.
    this.sound('defeat.sting');
    this.banner(`破裂  ·  深度 ${Math.round(this.player.depth(LEVEL.scrollLength))}m  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×`);
}
  /**
   * Spend the whole rage gauge on a shockwave.
   *
   * ---------------------------------------------------------------------------------------------
   * WHAT IT DOES, AND WHY THE TWO HALVES ARE SPLIT THE WAY THEY ARE
   * ---------------------------------------------------------------------------------------------
   * The design asks for three things in one press: clear the small enemies, push away the sharp ones it cannot
   * destroy, and shatter fragile scenery. Which of the two a CREATURE gets is a config table
   * (`angry.burst.hazardMode`), because "is this thing clearable" is a property of the creature rather than of the
   * wave -- and because a creature missing from that table is then a load error rather than a silent immunity.
   *
   * The scenery damage is deliberately SMALL (below coral and below a wall): opening a wall with rage is the SLAM's
   * answer, and a burst that did it too would make the aimed verb pointless. Two verbs, two answers.
   *
   * Everything is applied HERE, on the frame of the press. The ring that follows is the drawing of what already
   * happened -- see `burst`.
   */
  useBurst(laneWidthMeters: number): void {
    if (this.bubbleType.look !== 'rage') return;
    const cfg = mech.angry.burst;
    const laneWidth = laneWidthMeters;
    const radius = laneWidth * this.burstRadiusRatio();
    const px = this.player.x * laneWidth;
    const py = this.player.y;

    let kills = 0;
    let pushes = 0;
    const survivors: typeof this.hazards.hazards = [];
    for (const h of this.hazards.hazards) {
      const dx = h.x - px;
      const dy = h.y - py;
      if (dx * dx + dy * dy > radius * radius) {
        survivors.push(h);
        continue;
      }
      if (cfg.hazardMode[h.kind] === 'destroy') {
        kills++;
        continue;
      }
      // Not clearable: shoved away from the centre, metres scaled by the burst's own impact.
      shoveCreature(h, dx, dy, cfg.knockbackMeters * cfg.pushImpact);
      pushes++;
      survivors.push(h);
    }
    this.hazards.hazards = survivors;

    for (const o of this.obstacles.obstacles) {
      const dx = o.x - px;
      const dy = o.y - py;
      if (dx * dx + dy * dy <= radius * radius) this.obstacles.damage(o.id, cfg.obstacleDamage);
    }

    /**
     * The whole gauge, and nothing held back.
     *
     * `spendRage(rage.rage)` rather than assigning zero, so the one place that knows how rage is spent stays the
     * only place -- and the return value is ignored on purpose: the burst is not a purchase with a price, it is
     * everything the player has.
     */
    spendRage(this.rage, this.rage.rage);
    this.burst = { radius, seconds: 0, kills, pushes };
    this.bursts++;
    this.sound('rage.burst', 0.8);
  }
  /**
   * The 鱼屁泡 talent's reflex: shove nearby fish off, then leave bait behind.
   *
   * The two halves are inseparable -- that is the design principle ("your survival mechanism is the
   * enemy's breeding mechanism"). The push makes it worth having; the bait is what it costs. A version
   * that only pushed would be a free escape, and a version that only left bait would be a punishment
   * with no upside.
   */
  releaseFart(world: WorldView): void {
    if (this.elapsed < this.fartReadyAt) return;
    this.fartReadyAt = this.elapsed + mech.talents['fish-fart'].cooldownSeconds;
    this.farts++;

    const laneWidth = world.laneWidth;
    const playerX = this.player.x * laneWidth;
    const r = mech.talents['fish-fart'].radiusMeters;

    for (const h of this.hazards.hazards) {
      if (fartPushFor(h.kind) <= 0) continue;
      const dx = h.x - playerX;
      const dy = h.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > r) continue;
      if (dist < 1e-3) {
        h.y += r * 0.7;
        continue;
      }
      const push = (r - dist) / r;
      h.x += (dx / dist) * push * r * 0.8;
      h.y += (dy / dist) * push * r * 0.8;
    }

    // THE BACKLASH. Bait bubbles, which the emergence rules turn into fish food.
    const count = fartBaitCount();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.elapsed;
      const radiusFraction = 0.03;
      this.field.addTestBubble({
        x: playerX + Math.cos(angle) * r * 0.3,
        y: this.player.y + Math.sin(angle) * r * 0.3,
        vy: 0,
        radius: radiusFraction,
        // 饵是固定大小的，所以"它相对玩家多大"要现算——图的粗细读的就是这个（见 collectableArt）。
        sizeRatio: radiusFraction / Math.max(1e-6, stageRadiusFraction(this.stage.stage, this.player.volume)),
        volume: bubbleVolumeFromRadius(radiusFraction),
        phase: angle,
        wobble: tuning.bubbleWobbleMin,
      });
    }
    this.lastComedyBeat = { what: 'fish', at: this.elapsed };
    // Deliberately silly, because the talent is a joke and should sound like one.
    this.sound('talent.fart');
  }
  /**
   * Keep the best run, so the results card has something to beat.
   *
   * Best by DEPTH REACHED, not by survival time: the game is about climbing, and a run that got
   * further is strictly better regardless of how long it took. The design's headline score is max
   * volume, so both are kept and shown -- depth is the one that is comparable across talents.
   */
  recordBest(): void {
    /**
     * Metres climbed, which is the bubble's own world height.
     *
     * It used to be written as `DEPTH_TOTAL - player.depth`, and those are the same number twice over: `depth` is
     * `scrollLength - y`, so subtracting it from the length gives back `y`. Naming the height directly says what the
     * record is and cannot be wrong by a sign.
     */
    const depthReached = this.player.y;
    if (depthReached > this.bestClimbed) {
      this.bestClimbed = depthReached;
      this.bestVolume = Math.max(this.bestVolume, this.stats.maxVolume);
      this.stats.newRecord = true;
    } else {
      this.stats.newRecord = false;
    }
    this.bestVolume = Math.max(this.bestVolume, this.stats.maxVolume);
    // Kept beside the other bests, and NOT the thing `newRecord` is about: depth is the run's progress and the score
    // is what it was worth, so a run can beat one and not the other, and the card says both.
    this.bestScore = Math.max(this.bestScore, this.score.value);
  }
  /**
   * Roll this run's talent and apply it to the player.
   *
   * Applied through `resolveTalent` rather than by scattering conditionals: every talent's effect is
   * a small set of multipliers, so a new one is a row in `talents.ts` rather than a branch here.
   */
  rollTalent(): void {
    this.talentEffects = resolveTalent(pickTalent());
    // Volume is set AFTER `player.reset()` above, which zeroes it back to 1.
    this.player.volume = this.talentEffects.startVolume;
    this.stats.maxVolume = this.talentEffects.startVolume;
  }
  fireEvent(label: string): void {
    this.eventsSeen++;
    this.lastEvent = { label, at: this.elapsed };

    // A banner and a sound for each beat. No hazards: the level's timeline already placed them, and the
    // job here is to tell the player what they are swimming into.
    /**
     * The banner is the level's OWN label and nothing else.
     *
     * It used to be `label · <one of three hardcoded strings>`, appended by INDEX: `['鱼群来了', '气泡潮', '爆发']`. Those
     * three were written when the game had one stretch of water and three beats, and by the time there were six levels with
     * three landmarks each they were saying the same three things in all of them -- "管虫丛 · 鱼群来了" over a screenful
     * of tube worms. `label` is written by the level and already says what the beat IS.
     */
    this.banner(label);
    this.sound('level.banner');
  }
  /**
   * The level's scripted events, at the depths its landmarks announce.
   *
   * These are the "suddenly everything happens at once" beats the whole game is built around, and they
   * are now ANNOUNCEMENTS rather than spawners.
   *
   * They used to generate their own hazards -- a random swarm of 15-26 fish, a cloud of jellyfish --
   * which was the procedural model this refactor replaced. A level's timeline states exactly what
   * happens, so an event that also invented hazards would be content nobody authored, arriving on top of
   * the content somebody did. What is left is the part a timeline cannot express: telling the player
   * that the thing they are about to meet is about to happen.
   */
  fireDepthEvents(): void {
    const depth = this.player.depth(LEVEL.scrollLength);
    for (const [i, mark] of (LEVEL.landmarks ?? []).entries()) {
      if (this.eventsFired.has(i)) continue;
      if (depth > mark.depth) continue; // landmarks are measured from the surface, so depth DECREASES
      this.eventsFired.add(i);
      this.fireEvent(mark.label);
    }
  }
  /**
   * Build a hazard of a given kind at a given place.
   *
   * The scripted events need this: `HazardField.spawn` picks a random kind and position for ambient
   * pressure, which is the opposite of what a scripted beat wants.
   */
  makeHazard(
    world: WorldView,
    kind: HazardKind,
    x: number,
    y: number,
    entry: Hazard['entry'] = null,
    healthOverride?: number,
    path?: Hazard['path'],
  ): Hazard {
    const lane = world.laneWidth;
    /**
     * Clamped into the lane ONLY when it is not arriving.
     *
     * A side entry is placed outside the lane on purpose, so clamping it here would put it exactly on the edge --
     * which is the one place the player would see it appear. The entry motion is what brings it inside. The clamp is
     * here rather than in the factory because this is the only caller that knows how wide the lane is.
     */
    const spawnX = entry ? x : Math.max(0, Math.min(lane, x));
    /**
     * One factory for every creature, this one included.
     *
     * This method used to be a third field-by-field literal -- and the one that invented its own ids
     * (`-Math.floor(Math.random() * 1e9)`), which the field's id counter exists precisely to prevent: the field retires
     * eaten hazards by ID, so two creatures sharing one are two creatures eaten together.
     */
    const opts: SpawnOptions = {};
    if (healthOverride !== undefined) opts.health = healthOverride;
    if (entry !== null) opts.entry = entry;
    if (path !== undefined) opts.path = path;
    return this.hazards.spawnAt(kind, spawnX, y, opts);
  }
  /**
   * Place one timeline entry.
   *
   * The timeline is the level, so this is where a level's content becomes live objects. Entries appear at
   * the TOP of the visible range and travel down with the scroll, rather than materialising at the
   * player's distance.
   *
   * Collectables go into the shared field; hazards are owned by the game, so the field hands
   * them over rather than building them.
   */
  /**
   * Place one timeline entry, and record where it went.
   *
   * The RULE lives in `src/placement.ts`: it needs the water and one fact about the player, and nothing else about this
   * class -- which is what let it out. What stays here is the bookkeeping the DIAGNOSTICS read: the log of recent
   * placements (which is how "enemies spawning on screen" is caught as two numbers rather than by eye) and the count
   * per edge.
   */
  emitTimelineEntry(entry: LevelEntry, worldY: number, laneWidth: number, world: WorldView): void {
    const record = placeEntry(entry, worldY, { min: world.min, max: world.max }, laneWidth, {
      field: this.field,
      obstacles: this.obstacles,
      hazards: this.hazards,
      playerRadiusFraction: stageRadiusFraction(this.stage.stage, this.player.volume),
    });
    this.spawnLog.push(record);
    if (this.spawnLog.length > 12) this.spawnLog.shift();
    this.spawnedBySide[record.from]++;
  }
}