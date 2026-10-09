import { Player } from './player';
import { Progression } from './progress';
import { EntityField } from './entities';
import { HazardField, type HazardKind } from './hazards';
import { ObstacleField } from './obstacles';
import { BulletField } from './bullets';
import { EnemyBulletField } from './enemyBullets';
import { Stomach, tierBonusFor, type SpitProjectile } from './spit';
import type { PickupDrop, SpawnRecord } from './placement';
import { Score } from './score';
import { initialStageState, type StageState } from './stages';
import { defaultBubbleType, type BubbleType } from './bubbleTypes';
import { calibrateLateral, type LateralAuthority } from './lateral';
import { initialRageState, type RageState } from './rage';
import { pickTalent, resolveTalent, type TalentEffects } from './talents';
import type { Skill, SkillId } from './skills';
import type { EntrySide } from './levels';
import type { Input } from './input';
import { hasVerb } from './bubbleTypes';
import { chainTargets } from './conductive';
import { tuning } from './config';
import { massFromEating } from './consumption';
import { hazardTuning, shoveCreature, stomachEffect, type Hazard, type SpawnOptions } from './hazards';
import { canEatHazard } from './consumption';
import { LEVEL, type LevelEntry } from './levels';
import { mech } from './mechanisms';
import { isOverloaded, rageFraction } from './rage';
import { updateProjectiles } from './spit';
import { obstacleHealth, obstacleName } from './obstacles';
import { updatePickups } from './pickups';
import { placeEntry } from './placement';
import { endOverload, gainRage, hitRage, slamDamage, spendRage, tickRage } from './rage';
import { sayBlast } from './runEvents';
import { findSkill } from './skills';
import { digestEnergy, spitDirection, spitRadiusFraction } from './spit';
import { recordAbsorb, stageName, stageRadiusFraction } from './stages';
import { fartBaitCount, fartPushFor } from './talents';
import { bubbleVolumeFromRadius, drainByDigesting, growByAbsorbing, hitsSurvived, isPopped, shrinkFromHit } from './volume';
import type { Phase } from './snapshot';
import { sayBanner, sayDamage, sayScore, saySkillSlot, saySound, type RunEvent } from './runEvents';
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
/**
 * What to call each of a level's beats.
 *
 * The beats are announced rather than generated: the timeline decides WHAT is there, and this decides what to call it.
 * Indexed by landmark, so a level states its own beats through `Level.landmarks`.
 */
const EVENT_CALLOUTS = ['鱼群来了', '气泡潮', '爆发'];

/** Slow-motion pop after the bubble is destroyed, before the next run starts. */
export const BURST_SECONDS = 1.5;

export class Run {
  /** Whether a slam is in its window right now: the charge has been released and the window has not run out. */
  get onSlam(): boolean {
    return this.slamSeconds > 0 && this.bubbleType.look === 'rage';
  }
  /** Whether the bubble is in overload: full rage, on the clock. See `angry.overload`. */
  get overloaded(): boolean {
    return this.bubbleType.look === 'rage' && isOverloaded(this.rage);
  }
  /**
   * The eating rank digestion has bought, in tiers.
   *
   * Added to `volumeTier(volume)` wherever the eat rule is asked, which is exactly two places plus the outline
   * marker -- all three through `canEatHazard`, so a marker that promised food while the collision delivered a
   * hit remains impossible.
   */
  get tierBonus(): number {
    return tierBonusFor(this.growthEnergy);
  }
  /**
   * Whether the suction field is actually up.
   *
   * ONE place, because "digesting disables suction" is a rule about the player rather than about the input: the
   * field's radius, its pull, its drawing and the diagnostic readout all ask this, and any of them reading
   * `input.sucking` directly would leave a field that is visibly up but not pulling, or pulling without being
   * drawn. Note the compression costs nothing while the stomach is empty -- there is nothing to squeeze, so
   * there is nothing to pay for.
   */
  suctionUp(input: Input): boolean {
    /**
     * The type gate is the first thing checked, and it exists because the keyboard does not go through the buttons:
     * a player who has just switched to the volatile bubble and presses the old keys must not get a suction field
     * the type does not have. See `hasVerb`.
     */
    if (!hasVerb(this.bubbleType, 'suction')) return false;
    return input.sucking && !this.compressing;
  }
  /** The burst radius for the current rage: linear from the base at zero to the maximum at full. */
  burstRadiusRatio(): number {
    const cfg = mech.angry.burst;
    const t = rageFraction(this.rage.rage);
    return cfg.radiusBaseRatio + (cfg.radiusMaxRatio - cfg.radiusBaseRatio) * t;
  }
  /**
   * Whether this bubble can eat this kind of hazard, which is TWO questions and only one of them is about size.
   *
   * The type's own answer comes first: a bubble with no stomach cannot eat a creature however big it is, so the
   * answer for the volatile bubble is `false` for every kind. This is the single place that decides it, and the
   * three callers -- the collision, the outline marker and the test hook -- all come through here, so the marker
   * cannot promise food that the collision then refuses to deliver.
   *
   * The failure this replaces: the volatile bubble swallowed enemies, and since it has neither spit nor digest, a
   * full stomach could only end one way. The fuse burned and the run ended from the inside, with nothing the player
   * could do about it.
   */
  canSwallow(kind: HazardKind): boolean {
    return this.bubbleType.swallowsHazards && canEatHazard(kind, this.player.volume, this.tierBonus);
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
    return this.stomach.overloaded ? mech.spit.overloadSuctionFactor : 1;
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

  private sound(event: SoundEvent, intensity = 0.5): void {
    saySound(this.events, event, intensity);
  }

  private scorePopup(x: number, y: number, points: number): void {
    sayScore(this.events, x, y, points);
  }

  private damagePopup(x: number, y: number, amount: number): void {
    sayDamage(this.events, x, y, amount);
  }

  private skillSlot(carried: boolean): void {
    saySkillSlot(this.events, carried);
  }  player = new Player();
  elapsedTotal = 0;
  progress = new Progression();
  field = new EntityField();
  scrolled = 0;
  timelineEmitted = 0;
  spawnLog: SpawnRecord[] = [];
  spawnedBySide: Record<EntrySide, number> = { top: 0, left: 0, right: 0, bottom: 0 };
  elapsed = 0;
  nominalSeconds = 0;
  lateral: LateralAuthority = calibrateLateral(1);
  bubbleType: BubbleType = defaultBubbleType();
  rage: RageState = initialRageState();
  chargeAim = { x: 0, y: 0 };
  charging = false;
  slamSeconds = 0;
  slams = 0;
  burst: { radius: number; seconds: number; kills: number; pushes: number } | null = null;
  bursts = 0;
  stage: StageState = initialStageState();
  invulnerable = 0;
  stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: 0, overloads: 0, newRecord: false };
  lastEaten = 0;
  stomach = new Stomach();
  obstacles = new ObstacleField();
  projectiles: SpitProjectile[] = [];
  bullets = new BulletField();
  enemyBullets = new EnemyBulletField();
  gunStreams = 1;
  rateTier = 1;
  bossSpawned = false;
  infiniteHealth = false;
  pendingLevel: string | null = null;
  ascendMetres = 0;
  runComplete = false;
  levelsClearedInRun = 0;
  charge = 0;
  chargeBurst = 0;
  chargeBurstRadius = 0;
  spitCooldown = 0;
  spitFlash = 0;
  spitHits = 0;
  growthEnergy = 0;
  compressing = false;
  digested = 0;
  digestedMass = 0;
  trashDrain = 0;
  stomachDrain = 0;
  internalHits = 0;
  destroyedMass = 0;
  spitClogs = 0;
  comedyBeats = 0;
  lastComedyBeat: { what: HazardKind; at: number } | null = null;
  hazards = new HazardField();
  talentEffects: TalentEffects = resolveTalent(pickTalent());
  skill: { id: SkillId; name: string; uses: number } | null = null;
  decoy: { x: number; y: number; until: number } | null = null;
  skillActivations = 0;
  pickupDrops: PickupDrop[] = [];
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
   * Land one hit on the bubble.
   *
   * The single place a hit is applied, which is what makes "digesting hurts more" a one-line rule rather than a
   * condition that has to be repeated at every source of damage. A hazard, an obstacle, a trash bag's drain and
   * the debug forge all arrive here.
   */
  takeHit(): void {
    /**
     * The cheat: nothing happens at all.
     *
     * Not "the health is restored afterwards" -- that would still fire the hit sound, still flash, and still kill the
     * player for the frame in between. Returning here means an invulnerable bubble really is indistinguishable from one
     * that was never touched.
     */
    if (this.infiniteHealth) return;
    this.stats.hits++;
    this.sound('hit');
    this.invulnerable = tuning.invulnerableSeconds;
    /**
     * Digestion's cost, paid here rather than at the sources.
     *
     * The design asks for "防御力下降 while digesting", and this game has no defence stat -- only a fixed number of
     * hit points -- so the honest translation is "a hit costs more hit points". Applied as EXTRA applications of
     * the same `shrinkFromHit` rather than by scaling the loss, so the volume economy keeps its one implementation
     * and the silt talent's resistance still applies to every point of it.
     */
    const hitPoints = 1 + (this.compressing ? mech.digest.extraHitPoints : 0);
    /**
     * A type whose hit points are a COUNT rather than a volume.
     *
     * The volumetric rule above is the devour bubble's reward for eating and the volatile bubble's consolation for
     * having no stomach; a type that declares `hitsToPop` has neither and takes that many hits at ANY size. The plain
     * bubble is the one that does, and its design is exactly that a touch is fatal and nothing it does changes that.
     *
     * Setting the volume to zero rather than branching to a second death: the pop check below is the same one every
     * other hit goes through, so only the AMOUNT of damage has a second rule, not the dying.
     */
    if (this.bubbleType.hitsToPop !== null) {
      this.player.volume = 0;
    } else {
      for (let i = 0; i < hitPoints; i++) {
        this.player.volume = shrinkFromHit(this.player.volume, this.player.shrinkResistance);
      }
    }

    // Decide from the POST-hit volume: asking whether the current volume can survive one more hit
    // is the right question, and asking it of the pre-hit volume let health reach zero without ever
    // popping the bubble.
    if (isPopped(this.player.volume) || this.player.volume <= 0) {
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
    if (this.bubbleType.look === 'rage') gainRage(this.rage, hitRage());
  }
  /**
   * Advance the projectiles and resolve what they hit.
   *
   * Runs after the hazards have moved, so a projectile hits where things actually are this frame rather than where
   * they were. The hit test reads the hazard list directly, which is the only part of the game with the authority
   * on where a hazard is.
   */
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
      perSecond: mech.bullets.rateTiers[Math.min(this.rateTier, mech.bullets.rateTiers.length) - 1] ?? 0,
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
    if (shots.fired > 0) this.sound('bulletFire', mech.audio.bulletFireVolume);
    if (shots.hits > 0) {
      const volume = mech.audio.bulletHitVolume;
      this.sound('bulletHit', shots.drivenOff > 0 ? Math.min(1, volume * 1.4) : volume);
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
        this.sound('hit', 0.25);
        this.enemyBullets.fire(shot.kind, shot.x, shot.y, this.player.x * laneWidth, this.player.y, laneWidth);
      }
    }
    const landed = this.enemyBullets.update(dt, {
      min,
      max,
      laneWidth,
      playerX: this.player.x * laneWidth,
      playerY: this.player.y,
      playerRadius,
      // Scenery is cover for both sides -- the same call the player's own rounds make.
      blocks: (x, y, hitRadius) => this.obstacles.blocks(x, y, hitRadius),
    });
    if (live && landed.length > 0) {
      for (const kind of landed) {
        this.takeHit();
        // A hit can end the run; nothing after this may assume there is still a bubble.
        if (this.phase !== 'playing') return;
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
  }
  /**
   * Rage: gain is event-driven (see `takeHit`), and this is the clock.
   *
   * Only the decay needs a frame. The devour bubble has no rage at all, and this returning immediately is what keeps
   * the second resource from costing the first type anything.
   */
  updateRage(dt: number): void {
    if (this.bubbleType.look !== 'rage') return;
    if (this.slamSeconds > 0) this.slamSeconds = Math.max(0, this.slamSeconds - dt);
    // The wave's animation, which is drawing only: its effects were applied on the frame it fired.
    if (this.burst) {
      this.burst.seconds += dt;
      if (this.burst.seconds >= mech.angry.burst.waveSeconds) this.burst = null;
    }

    /**
     * The overload's cost, applied every frame it lasts, and its end.
     *
     * The steering penalty rides the same slow the net drag uses, so "the bubble has gone sluggish" is one mechanic
     * with two causes rather than two mechanics that look alike. Re-applied per frame, so it expires the moment the
     * overload does.
     */
    if (this.overloaded) this.player.applySlow(dt * 2, mech.angry.overload.steerFactor);

    const gripped = this.hazards.hazards.some((h) => h.gripping);
    const wasOverloaded = isOverloaded(this.rage);
    const { overloadExpired } = tickRage(this.rage, dt, this.invulnerable > 0 || gripped);
    if (!wasOverloaded && isOverloaded(this.rage)) {
      // Announced once, on the frame it starts: a warning that repeats every frame is noise.
      this.banner(`失控  ·  ${mech.angry.overload.seconds.toFixed(1)} 秒内把怒气放掉`);
this.sound('slow');
    }
    if (overloadExpired) this.punishOverload();
  }
  /**
   * The volatile bubble's verb: wind up while the control is held, slam when it is released.
   *
   * ---------------------------------------------------------------------------------------------
   * THE AIM IS CAPTURED, NOT SAMPLED AT RELEASE
   * ---------------------------------------------------------------------------------------------
   * The design asks for the direction to LOCK while the bubble compresses. So the aim is written only while the
   * player is actually steering, and once they let go of the stick the last aim stays -- which makes "push toward the
   * thing, let the stick centre, release" the natural gesture, and makes a held stick mean "keep adjusting".
   *
   * What is deliberately NOT here: a minimum hold time, and a maximum. Letting go after a tenth of a second is a
   * legal slam, because the power comes from RAGE rather than from how long the button was down -- so there is
   * nothing to charge up and no reason to stand still. The verb is "aim, then commit", not "wait".
   */
  updateCharge(input: Input): void {
    if (!hasVerb(this.bubbleType, 'charge')) return;

    const held = input.charging;
    if (!input.consumeChargeRelease() && held) {
      /**
       * Winding up: the aim follows whichever hand is pointing, and freezes when nothing is.
       *
       * Two producers, one number, the same shape the movement axes had: the keyboard's axis while a direction
       * key is held, otherwise the touch drag's direction from where the finger landed. On a phone that gives the
       * whole verb -- drag to point, hold the button to wind up, let the finger off the drag so nothing overwrites
       * `chargeAim` any more, then release the button to slam.
       */
      if (input.axisX !== 0 || input.axisY !== 0) {
        this.chargeAim = { x: input.axisX, y: input.axisY };
      } else if (input.dragAimX !== 0 || input.dragAimY !== 0) {
        this.chargeAim = { x: input.dragAimX, y: input.dragAimY };
      } else if (!this.charging && this.chargeAim.x === 0 && this.chargeAim.y === 0) {
        // First press with no aim at all: go the configured way (up), so a player who taps cannot waste a slam.
        this.chargeAim = { x: mech.angry.charge.defaultAimX, y: mech.angry.charge.defaultAimY };
      }
      this.charging = true;
      return;
    }

    /**
     * Released: launch.
     *
     * `Math.max` rather than assignment on the vertical, so a slam cannot cancel a crab launch the player is already
     * riding -- the same rule the crab uses when it shoves them.
     */
    if (!this.charging) return;
    this.charging = false;
    const aim = this.chargeAim;
    const len = Math.hypot(aim.x, aim.y);
    const dir = len > 1e-6 ? { x: aim.x / len, y: aim.y / len } : { x: 0, y: 1 };
    this.player.impulseVy = Math.max(this.player.impulseVy, dir.y * mech.angry.charge.launchScreenSpeed);
    this.player.impulseVx += dir.x * mech.angry.charge.launchLateralSpeed;
    this.slamSeconds = Math.max(this.slamSeconds, mech.angry.charge.slamSeconds);
    /**
     * The launch cue is the crab's: a heavy, water-laden shove. There is no bespoke sound for the slam yet, and
     * reusing the closest existing one is honest -- a new sound is the owner's call, not something to invent here.
     */
    this.sound('crab');
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
    this.sound('surface');
    for (const h of this.hazards.hazards) {
      if (!reached.has(h.id)) continue;
      // Through `hit`, so the discharge is ordinary damage: health, the driven-off score, the popup and the knockback
      // all apply. The impact point is the BUBBLE, because that is where the discharge came from -- so a chained zapper
      // is pushed away from the player like everything else the player hits.
      this.hazards.hit(h, cfg.chainDamage, { x: px, y: py });
      this.scorePopup(h.x, h.y, this.score.award('drivenOff'));
    }
    if (cfg.chainSelfDamage > 0) this.takeHit();
    this.banner(`连锁放电  ·  ${reached.size} 只`);
  }
  /**
   * The stomach's frame: the fuse, the digestion, and the spit button.
   *
   * All three belong together because they are the same question -- what happens to what I swallowed -- and
   * because the ORDER between them is the mechanic. The fuse is ticked first so that an item finishing its
   * digestion this frame really does save the player, and the button is read last so a shot fired this frame
   * travels this frame instead of hanging at the bubble's position for one frame first.
   */
  updateStomach(dt: number, laneWidth: number, input: Input): void {
    this.spitCooldown = Math.max(0, this.spitCooldown - dt);
    this.spitFlash = Math.max(0, this.spitFlash - dt * 3);

    /**
     * Compression is the held control AND a non-empty stomach.
     *
     * The second half is not pedantry: holding the button with nothing inside would otherwise cost the player
     * their suction field and DOUBLE every hit they take, in exchange for nothing at all. A state that punishes
     * without a subject is just a bug the player cannot see.
     */
    this.compressing = hasVerb(this.bubbleType, 'compress') && input.compressing && this.stomach.size > 0;

    const rate = this.compressing ? mech.digest.compressPerSecond : mech.digest.passivePerSecond;
    const tick = this.stomach.tick(dt, rate);

    /**
     * A burst is the ONLY thing that can end a run through the stomach, and it is reachable only by ignoring the
     * warning for the whole fuse -- there are two escapes and both are a control away at all times.
     */
    if (tick.burst) {
      // The stomach is emptied by the burst: the contents are what is scattered.
      this.stomach.reset();
      this.projectiles.length = 0;
      this.startBurst();
      return;
    }

    /**
     * The mass comes back out, in proportion to how far along the item is, and the growth energy comes back with
     * it.
     *
     * This is the whole of "体积逐渐缩小": there is no digest shrink rate anywhere in the config, because the
     * amount that leaves is the amount that arrived.
     *
     * ---------------------------------------------------------------------------------------------
     * WHY THE PAYOFF FOLLOWS THE DRAIN, RATHER THAN THE COMPLETION
     * ---------------------------------------------------------------------------------------------
     * Energy is credited against what ACTUALLY left the bubble this frame, for two reasons that are really one.
     *
     * It closes the ledger: every unit of volume that leaves through digestion is paid for at the moment it
     * leaves, so interrupting a half-digested item by spitting it never means silently losing mass that bought
     * nothing. Spitting a partly digested item hands back only the part that is still there, and the part that
     * already left has already been paid for.
     *
     * And it cannot be farmed: `drainByDigesting` will not let digesting kill the player, so a bubble parked one
     * hit from death can be holding volume the drain refuses to take. Crediting energy for the REQUESTED drain
     * instead of the delivered one would let that bubble sit there and convert nothing into rank forever.
     */
    if (tick.drained > 0) {
      const tierBefore = this.tierBonus;
      const volumeBefore = this.player.volume;
      this.player.volume = drainByDigesting(this.player.volume, tick.drained);
      const removed = volumeBefore - this.player.volume;
      this.growthEnergy += digestEnergy(removed);
      this.digestedMass += removed;

      /**
       * The payoff is announced only when it changes the RANK.
       *
       * Announcing every item would be three banners for one full stomach and would teach the player to ignore
       * all of them. The rank going up is the beat worth looking up for -- the same choice the growth stages
       * make, and the same banner, so "something I did just made me stronger" reads identically in both systems.
       */
      if (this.tierBonus > tierBefore) {
        this.banner(`消化 · 可吞等级 +${this.tierBonus}  ·  体积仍 ${this.player.volume.toFixed(1)}`);
        this.sound('skill');
      }
    }

    // An item finishing is worth marking even when it did not buy a rank: the player just made room, which is
    // what puts an over-eating fuse out.
    if (tick.completed) {
      this.digested += tick.completed.length;
      this.sound('absorb', 0.5);
    }

    /**
     * What the contents did to the player from INSIDE.
     *
     * ---------------------------------------------------------------------------------------------
     * WHY THE MASS A BOMB DESTROYS BUYS NO RANK
     * ---------------------------------------------------------------------------------------------
     * `destroyed` is applied through the same non-lethal drain as digestion but WITHOUT any growth energy, and
     * that separation is the whole reason the stomach reports two figures instead of one. Digested mass pays; mass
     * blown up in your own stomach is simply gone. Folding them together would turn a bomb fish into a way to
     * convert food into rank without paying for it, which is exactly backwards from what the creature is for.
     */
    if (tick.destroyed > 0) {
      const before = this.player.volume;
      this.player.volume = drainByDigesting(this.player.volume, tick.destroyed);
      this.destroyedMass += before - this.player.volume;
    }

    /**
     * Internal harm, accumulated into whole hit points.
     *
     * Fractional per second, turned into hits by an accumulator, because that is the only way a continuous drain
     * can be frame-rate independent: applying it as whole hits per frame would make an urchin lethal at 120fps and
     * harmless at 30. The same shape as the trash bag's grip, which is the other continuous damage in the game.
     */
    if (tick.damage > 0) {
      this.stomachDrain += tick.damage;
      while (this.stomachDrain >= 1) {
        this.stomachDrain -= 1;
        this.internalHits++;
        this.takeHit();
        // A hit can end the run; nothing after this point may assume there is still a bubble.
        if (this.phase !== 'playing') return;
      }
    }

    if (tick.detonations) {
      this.lastComedyBeat = { what: tick.detonations[0]!.kind, at: this.elapsed };
      this.sound('hit');
      this.sound('pop');
      this.banner(`胃里炸了  ·  ${tick.detonations.length} 颗  ·  炸弹鱼不能留`);
    }

    /**
     * The eel: the controls stop obeying for a moment.
     *
     * `applyMisfire` EXTENDS rather than replaces, so two eels cannot cut each other short. Nothing else here needs
     * to know the eel exists -- the bubble carries the state, and `Player.update` reads it.
     */
    if (tick.shocks > 0) {
      this.player.applyMisfire(tick.shocks);
      this.sound('slow');
      this.lastComedyBeat = { what: 'eel', at: this.elapsed };
    }

    /**
     * The type gate comes BEFORE the consume, and that order is the point: the volatile bubble has no spit verb, so
     * a pending press must be dropped rather than banked. Consuming it and returning would leave nothing behind
     * either way -- but checking first means the flag cannot queue up a shot that fires the moment the player
     * switches bubble, which is the kind of ghost input that is invisible until it happens in a real run.
     */
    if (!hasVerb(this.bubbleType, 'spit')) return;
    if (!input.consumeSpit()) return;
    if (this.spitCooldown > 0) return;

    const attempt = this.stomach.attemptSpit();
    if (attempt.outcome !== 'fired') {
      /**
       * Nothing to fire, or nothing that WILL fire: a short cooldown either way, but a different message.
       *
       * A button that does nothing at all reads as broken, so the empty case gets a pulse. The CLOTTED case has to
       * be told apart from it, though, or the oil slick's entire verb is invisible: the player presses, nothing
       * flies, and the only honest reading of that is "the button is broken". Hence the banner and the different
       * sound -- the refusal is the mechanic.
       */
      this.spitCooldown = mech.spit.emptyCooldownSeconds;
      this.spitFlash = 1;
      if (attempt.outcome === 'clogged') {
        this.spitClogs++;
        this.banner('油污卡住了  ·  吐不出来，只能压下去');
this.sound('hit');
      }
      return;
    }
    const item = attempt.item;

    /**
     * Spitting hands the mass straight back, exactly as digesting hands it back by the slice.
     *
     * This is the fix for a promise the design made and the code did not keep: `spit.ts` claimed "empty the
     * stomach, drop a chunk of volume, squeeze through a gap", and nothing anywhere reduced the volume, so
     * 极限瘦身 did not exist. It works now, and it works through the same ledger digestion uses rather than
     * through a second opinion about what an item is worth.
     *
     * Only the UNDIGESTED part, because the rest already left and was already paid for in growth energy. Handing
     * back the full mass would make every slow tap a small mass-creation exploit.
     */
    this.player.volume = drainByDigesting(this.player.volume, item.mass * (1 - item.digest));

    /**
     * The aim: where the finger is relative to where it landed, or straight up when there is none.
     *
     * The keyboard has no aim of its own -- it is four directions and nothing else -- so `spitDirection` falls back
     * to up, which is "forward" in a vertical ascent. See the drag in `src/touch.ts`: keeping the aim on the
     * ANCHOR rather than on the last few pixels is what lets a player hold a direction while barely moving.
     */
    const dir = spitDirection(input.dragAimX, input.dragAimY);
    const speed = laneWidth * mech.spit.speedPerSecond;
    this.projectiles.push({
      kind: item.kind,
      x: this.player.x * laneWidth,
      y: this.player.y,
      vx: dir.x * speed,
      // World y grows upward and the direction's y is already in world terms (the drag's aim writes +1 for up).
      vy: dir.y * speed,
      screenY: this.player.screenY,
      radiusFraction: spitRadiusFraction(item.kind),
      age: 0,
    });
    this.spitFlash = 1;
    this.sound('pop');
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
      // The level's scroll, not the player's speed: hazards approach because the WORLD moves now.
      descentSpeed: LEVEL.scrollSpeed,
      elapsed: this.elapsed,
      invulnerable: this.invulnerable > 0,
      // Struggling is "actively steering", which is the intuitive way to tear free of a trash bag. Was a speed
      // threshold when there was an accelerate control, and a raw pointer check when touch named a destination;
      // now it is one question with one answer, because every steering source ends up in the axes.
      struggling: input.steering,
      playerVolume: this.player.volume,
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
      /**
       * Whether the stomach has room. Separate from `canEat`, because a big enough bubble can eat a crab it has
       * no room for -- and when that happens the hazard must fall through to its damage path rather than vanish.
       */
      canSwallow: () => !this.stomach.full,
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
        this.sound('pop');
        this.lastComedyBeat = { what: e.kind, at: this.elapsed };
        /**
         * The blast hurts the player, through the ordinary hit path.
         *
         * `e.damage` is 0 when the bubble was outside the radius: the field measures that (it has the player's
         * position), and reporting a zero rather than omitting the effect is what lets the shockwave still be drawn
         * for a blast that missed -- the player needs to see the thing that nearly got them.
         */
        if ((e.damage ?? 0) > 0) {
          this.takeHit();
          if (this.phase !== 'playing') return;
        }
      }
      if (e.eaten) {
        const beforeEating = this.player.volume;
        this.player.volume = growByAbsorbing(this.player.volume, massFromEating(e.kind));
        this.stats.absorbed++;
        // The reversal pays: it is the game's signature act and the one that costs the most (the bubble gets bigger
        // and slower for it), so a score that ignored it would price the safe play above the interesting one. The
        // number appears at the BUBBLE, which is where the creature was when it was swallowed -- a contact is a
        // touching distance, so the difference is a radius.
        this.scorePopup(this.player.x * laneWidth, this.player.y, this.score.award('eaten'));
        this.invulnerable = Math.max(this.invulnerable, mech.consumption.eatInvulnerableSeconds);
        /**
         * What was swallowed goes into the stomach, carrying THE VOLUME IT ACTUALLY ADDED.
         *
         * The measured delta rather than `massFromEating(kind)`, and the difference is not academic: at the
         * `volume.max` ceiling `growByAbsorbing` adds nothing, so an item that recorded its nominal mass would
         * hand the bubble volume it never received when it was later spat or digested. Measuring here makes the
         * ledger close by construction, whatever the config says.
         *
         * The hazard module already checked `canSwallow`, so this cannot fail -- but a `false` is handled rather
         * than ignored, because the two checks living in different files is exactly the kind of thing that drifts.
         */
        this.stomach.swallow(e.kind, this.player.volume - beforeEating, stomachEffect(e.kind));
        this.sound('pop');
        continue;
      }

      if (e.damage) {
        for (let i = 0; i < e.damage; i++) this.takeHit();
        // The fish-fart talent fires on the contact that would have hurt, which is what makes it a
        // reflex rather than an action. Its BACKLASH is the point: it shoves the fish off and then
        // leaves bait behind, so the escape is also what feeds the swarm. See src/talents.ts.
        if (this.talentEffects.talent.id === 'fish-fart') this.releaseFart(world);
      }
      if (e.slowSeconds && e.slowFactor) {
        this.player.applySlow(e.slowSeconds, e.slowFactor);
        this.sound('slow');
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
        this.sound('crab');
      }
      if (e.drainPerSecond) {
        // Continuous, so it is applied as a fraction of a hit point per second rather than as whole
        // hits -- otherwise being grabbed would be instant death at any frame rate.
        this.trashDrain += hazardTuning.trashDrainPerSecond * dt;
        while (this.trashDrain >= 1) {
          this.trashDrain -= 1;
          this.takeHit();
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
       * The bubble's reach, with the two bonuses that belong to it.
       *
       * `slamRadiusBonus` widens a committed attack so it connects on the frame it was aimed at; the overload's
       * `radiusBonus` is a real enlargement of the bubble (the document says "碰撞体积增大"), drawn and collided with
       * alike. The overload also widens the drawn radius in `drawBubble` -- the two must agree, which is why both
       * read the same number.
       */
      playerR *
        (this.onSlam ? 1 + mech.angry.slamRadiusBonus : 1) *
        (this.overloaded ? 1 + mech.angry.overload.radiusBonus : 1),
      this.player.volume,
      this.invulnerable > 0,
      dt,
      /**
       * The slam, while its window is open and only for the type that has the verb.
       *
       * `breaksUnrammable` comes from the config rather than from the type descriptor because it is a balance
       * question about the WALL (does this bubble get to ignore masonry?), not about the bubble's identity.
       *
       * The OVERLOAD smashes too, and with a bigger number, because the document lists "can destroy most ordinary
       * obstacles" as one of the things being overloaded DOES. It is a separate case rather than a bigger slam window
       * because the two differ in what they cost -- see below.
       */
      this.onSlam
        ? { damage: slamDamage(this.rage.rage), breaksUnrammable: mech.angry.charge.slamBreaksUnrammable }
        : this.overloaded
          ? { damage: mech.angry.overload.ramDamage, breaksUnrammable: mech.angry.charge.slamBreaksUnrammable }
          : undefined,
    );
    if (contact.hit?.broke) {
      this.lastComedyBeat = { what: 'crab', at: this.elapsed };
      this.sound('hit');
      /**
       * Breaking something LARGE is one of the document's ways to release the rage, and it is checked here because
       * this is the only place that knows what was broken.
       *
       * "Large" is a health threshold rather than a size: coral and a wall count, a crate and a net do not. Shoving a
       * crate aside is a side effect of being overloaded; taking a wall down is an achievement, and the document
       * treats it as one of the four ways out.
       */
      if (this.overloaded && obstacleHealth(contact.hit.kind) >= mech.angry.overload.releaseHealth) {
        endOverload(this.rage);
        this.banner(`怒气释放  ·  撞碎了${obstacleName(contact.hit.kind)}`);
}
    }
    if (contact.hit) {
      /**
       * A slam that connected costs rage, and costs MORE if it broke the thing.
       *
       * This is what makes the charge a resource rather than a cooldown: rage is the ammunition, so a player who
       * spends it all on one wall has nothing left for the next one, and the price of breaking something is the
       * reason to think about whether it was worth breaking.
       *
       * `this.onSlam` and NOT `this.overloaded`: while overloaded the smashing is FREE, and that is deliberate. If
       * the overload's own ram charged rage per hit, a player could smash their way down to an empty gauge and then
       * have nothing left to release the countdown with -- the state whose entire point is that you must release it
       * would have become the state that makes releasing impossible.
       */
      if (this.onSlam) {
        const cost = contact.hit.broke ? mech.angry.charge.rageCostPerBreak : mech.angry.charge.rageCostPerHit;
        if (this.bubbleType.look === 'rage') spendRage(this.rage, cost);
        this.slams++;
      }
    }
    if (contact.blocked) {
      /**
       * `hurt` rather than `blocked` decides the hit, and it exists for the obstacle that cannot hurt you. Charging
       * a hit point for the one kind a small player can get through would cost exactly what the kinds they cannot
       * get through cost, which would remove the reason it exists.
       */
      if (contact.hurt) this.takeHit();
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
         * Absorbed -- and what that PAYS depends on whether this type grows at all.
         *
         * For the devour and volatile bubbles, growth is the reward: bubbles are food, food is volume, and volume is
         * hit points as well as hitbox. For a type that declares `growsByAbsorbing: false` the same act pays in
         * POINTS and the bubble stays exactly the size it was -- growing would buy it nothing (its hit points are a
         * fixed count) and cost it a bigger hitbox, a slower bubble and the stage penalty on top. So the bubble is
         * still removed and still pays; only the currency differs.
         *
         * The stage counter is deliberately not touched in that branch either: advancing it would apply the growth
         * stages' speed penalties to a bubble that never grew, which is a cost with no matching benefit.
         */
        const grows = this.bubbleType.growsByAbsorbing;
        if (grows) {
          this.player.volume = growByAbsorbing(this.player.volume, b.volume);
          /**
           * Count toward the next growth stage, and react if that promoted the bubble.
           *
           * The promotion is the caller's to handle: `recordAbsorb` only knows the numbers. Growing is the moment
           * the player becomes slower, so it gets a brief invulnerability and a cue -- without the grace period,
           * getting bigger would immediately mean taking a hit, which reads as the game punishing the player for
           * doing well.
           */
          if (recordAbsorb(this.stage)) {
            this.player.stageSpeedMultiplier = this.stage.speedMultiplier;
            this.invulnerable = Math.max(this.invulnerable, mech.stages.growInvulnerableSeconds);
            this.banner(`${stageName(this.stage.stage)}  ·  ${this.stage.stage} 阶段  ·  速度 ×${this.stage.speedMultiplier.toFixed(2)}`);
            this.sound('skill');
          }
        } else {
          const points = this.score.award('absorb');
          if (points > 0) this.scorePopup(b.x, b.y, points);
        }
        this.stats.absorbed++;
        eaten++;
        this.sound('absorb', Math.min(1, bubbleR / Math.max(1e-6, playerR)));
        this.field.bubbles.splice(i, 1);
      } else if (this.invulnerable <= 0) {
        // Too big to eat: it hurts.
        this.takeHit();
        this.field.bubbles.splice(i, 1);
      }
    }

    if (this.player.volume > this.stats.maxVolume) this.stats.maxVolume = this.player.volume;
    this.lastEaten = eaten;
  }
  /**
   * The overload expired: a heavy wound, and the gauge is gone.
   *
   * ---------------------------------------------------------------------------------------------
   * IT CANNOT KILL, AND THAT IS THE DESIGN RATHER THAN A MERCY
   * ---------------------------------------------------------------------------------------------
   * The document is explicit: "the bubble does NOT simply end the game, it takes a heavy wound". So the loss is
   * applied one hit point at a time and STOPS while the bubble still has one left -- the same floor `drainByDigesting`
   * uses, for the same reason. The punishment is real (the volume and the rage are both gone, and volume is
   * everything in this game) without a player being executed for missing a button.
   */
  punishOverload(): void {
    // The cheat covers the overload too: it is a third way to lose the bubble, and a cheat that only blocks collisions
    // would still let the player kill themselves by overeating.
    if (this.infiniteHealth) return;
    const before = this.player.volume;
    let hits = 0;
    for (let i = 0; i < mech.angry.overload.punishHits; i++) {
      // Stop while one hit point remains: see the note above.
      if (hitsSurvived(this.player.volume) <= 1) break;
      this.player.volume = shrinkFromHit(this.player.volume, this.player.shrinkResistance);
      hits++;
    }
    this.stats.overloads++;
    this.banner(`怒气失控  ·  体积 ${before.toFixed(2)} → ${this.player.volume.toFixed(2)}`);
this.sound('pop');
  }
  /** The bubble pops: slow-motion burst, then a brief result card, then a fresh run. */
  startBurst(): void {
    this.phase = 'burst';
    this.phaseTimer = BURST_SECONDS;
    this.stats.ended++;
    this.recordBest();
    this.sound('pop');
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
  useBurst(world: WorldView): void {
    if (!hasVerb(this.bubbleType, 'burst')) return;
    const cfg = mech.angry.burst;
    const laneWidth = world.laneWidth;
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
      // Not clearable: shoved away from the centre, with the same arithmetic a grenade uses.
      shoveCreature(h, dx, dy, cfg.pushImpact);
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
    /**
     * The burst is the document's headline way to release the overload, and it is the one the player always has.
     *
     * `endOverload` after the spend: emptying the gauge is what releases it, and the overload's own timers and
     * penalties are done with either way.
     */
    endOverload(this.rage);
    this.burst = { radius, seconds: 0, kills, pushes };
    this.bursts++;
    this.sound('crab');
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
        volume: bubbleVolumeFromRadius(radiusFraction),
        phase: angle,
        wobble: tuning.bubbleWobbleMin,
      });
    }
    this.lastComedyBeat = { what: 'fish', at: this.elapsed };
    // Deliberately silly, because the talent is a joke and should sound like one.
    this.sound('fart');
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
   * Grant a skill. Single slot, so this replaces whatever is carried.
   *
   * Returns the skill that was displaced, which the caller may want for a "swapped" hint later.
   */
  /**
   * Grant a skill. Single slot, so this replaces whatever is carried.
   *
   * Returns the skill that was displaced, which the caller may want for a "swapped" hint later.
   */
  grantSkill(id: SkillId): Skill | null {
    const displaced = this.skill ? findSkill(this.skill.id) : null;
    const skill = findSkill(id);
    this.skill = { id, name: skill.name, uses: skill.uses };
    // The on-screen button appears only while a skill is carried, so the empty state is genuinely
    // empty rather than a greyed-out control competing for attention.
    this.skillSlot(true);
    return displaced;
  }
  /**
   * Roll this run's talent and apply it to the player.
   *
   * Applied through `resolveTalent` rather than by scattering conditionals: every talent's effect is
   * a small set of multipliers, so a new one is a row in `talents.ts` rather than a branch here.
   */
  rollTalent(): void {
    this.talentEffects = resolveTalent(pickTalent());
    this.player.ascentBonus = this.talentEffects.ascentMultiplier;
    this.player.steerScale = this.talentEffects.steerMultiplier;
    this.player.shrinkResistance = this.talentEffects.shrinkResistance;
    // Volume is set AFTER `player.reset()` above, which zeroes it back to 1.
    this.player.volume = this.talentEffects.startVolume;
    this.stats.maxVolume = this.talentEffects.startVolume;
  }
  fireEvent(index: number, label: string): void {
    this.eventsSeen++;
    this.lastEvent = { label, at: this.elapsed };

    // A banner and a sound for each beat. No hazards: the level's timeline already placed them, and the
    // job here is to tell the player what they are swimming into.
    this.banner(`${label}  ·  ${EVENT_CALLOUTS[index] ?? ''}`.trim());
this.sound('skill');
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
      this.fireEvent(i, mark.label);
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
   * Skills lie in the water as pickups, on their own timer.
   *
   * Deliberately NOT one per screen: a skill is a decision, and a decision every few seconds is just
   * Skills lie in the water as pickups, placed by the LEVEL'S TIMELINE.
   *
   * There used to be a timer here that dropped one every ~20 seconds regardless of the level. That is
   * gone: a level now says where its skills are, which is the difference between an authored level and a
   * difficulty curve. The level can put one where the player will need it, or deliberately withhold one.
   *
   * This method is left with only motion and collection, because that is all that is left to do.
   */
  updatePickup(dt: number, min: number, max: number, laneWidth: number): void {
    if (!this.pickupDrops.length) return;
    /**
     * The rule lives in `src/pickups.ts`; what stays here is APPLYING what it says was taken.
     *
     * The two numbers it raises are the run's -- the gun reads them and the HUD shows them -- and the words for a
     * pickup taken at the ceiling are Chinese UI strings, which is not a rule module's business. So the rule decides
     * and this applies, and a probe can read the decision instead of a banner.
     */
    for (const taken of updatePickups(dt, min, max, {
      drops: this.pickupDrops,
      playerX: this.player.x * laneWidth,
      playerY: this.player.y,
      reachMeters: laneWidth * (stageRadiusFraction(this.stage.stage, this.player.volume) + 0.05),
      gunStreams: this.gunStreams,
      rateTier: this.rateTier,
      score: this.score,
      events: this.events,
    })) {
      if (taken.kind === 'upgrade') {
        this.gunStreams = taken.streams;
        this.banner(
          taken.capped
            ? `火力升级  ·  已经是 ${taken.streams} 排（上限 ${mech.bullets.maxStreams}）`
            : `火力升级  ·  ${taken.streams} 排小泡泡同时发射`,
        );
      } else if (taken.kind === 'rate') {
        this.rateTier = taken.tier;
        this.banner(
          taken.capped
            ? `射速升级  ·  已经是最高档（第 ${mech.bullets.rateTiers.length} 档）`
            : `射速升级  ·  第 ${taken.tier} 档  ·  每秒 ${mech.bullets.rateTiers[taken.tier - 1]} 发`,
        );
      } else {
        this.grantSkill(taken.id);
      }
    }
  }
  updateProjectiles(dt: number, laneWidth: number, min: number, max: number): void {
    // The rule lives in `src/spit.ts` with the ammunition; what stays here is the run's counter of what it hit.
    this.spitHits += updateProjectiles(
      dt,
      laneWidth,
      min,
      max,
      { projectiles: this.projectiles, obstacles: this.obstacles, hazards: this.hazards },
      this.events,
    );
  }
  /**
   * Place one timeline entry.
   *
   * The timeline is the level, so this is where a level's content becomes live objects. Entries appear at
   * the TOP of the visible range and travel down with the scroll, rather than materialising at the
   * player's distance.
   *
   * Collectables go into the shared field; hazards and skills are owned by the game, so the field hands
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
      pickupDrops: this.pickupDrops,
      obstacles: this.obstacles,
      hazards: this.hazards,
      playerRadiusFraction: stageRadiusFraction(this.stage.stage, this.player.volume),
    });
    this.spawnLog.push(record);
    if (this.spawnLog.length > 12) this.spawnLog.shift();
    this.spawnedBySide[record.from]++;
  }
}