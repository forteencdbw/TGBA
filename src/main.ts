import { Application, Graphics } from 'pixi.js';
import { Camera, Hud, WorldLayer, computeViewport, createApp, designScale, makeLabel, waterColourForTest, type Landmark } from './background';
import { tuning } from './config';
import { DEPTH_TOTAL, LEVEL, LEVELS, TIMELINE, currentSpawnBlocks, installSpawnBlocks, levelIndex, type EntrySide, type Level, type LevelEntry } from './levels';
import { Progression } from './progress';
import { blastRadiusFraction, HazardField, hazardHealth, KIND_TUNING, hazardTuning, paintHazards, stomachEffect, type Hazard, type HazardKind } from './hazards';
import { BulletField, paintBullets } from './bullets';
import { ObstacleField, obstacleHealth, obstacleName, paintObstacles, type ObstacleKind } from './obstacles';
import { pickTalent, resolveTalent, talentTuning, fartPushFor, fartBaitCount, TALENTS, type TalentEffects } from './talents';
import { activationFor, findSkill, skillTuning, SKILLS, type Skill, type SkillId } from './skills';
import { audio } from './audio';
import { canEatHazard, hazardMass, massFromEating, volumeTier } from './consumption';
import { MainMenu } from './menu';
import { CodexUi } from './codexUi';
import { CODEX_CATEGORIES, codexEntries, entriesFor } from './codex';
import { BUBBLE_TYPES, defaultBubbleType, findBubbleType, hasControl, hasVerb, type BubbleType } from './bubbleTypes';
import { bubbleLook, bubbleShake, bubbleSwell } from './bubbleLook';
import { endOverload, gainRage, hitRage, initialRageState, isOverloaded, rageColor, rageFraction, rageStageName, slamDamage, spendRage, tickRage, type RageState } from './rage';
import { OBSTACLE_KINDS, mech } from './mechanisms';
import { suctionMoveFactor, suctionRadiusFraction } from './suction';
import { digestEnergy, Stomach, spitDirection, spitImpact, spitRadiusFraction, stomachBulge, tierBonusFor, type SpitProjectile } from './spit';
import { SettingsUi } from './settings';
import { APP_VERSION, buildLabel, GIT_DIRTY, GIT_HASH } from './version';
import { demote, initialStageState, recordAbsorb, stageName, stageRadiusFraction, type StageAppearance, type StageState } from './stages';
import { nominalAscentSeconds, secondsPerScreenSeries } from './depth';
import { EntityField, type Bubble } from './entities';
import { Input } from './input';
import { calibrateLateral, type LateralAuthority } from './lateral';
import { Player } from './player';
import { TouchControls } from './touch';
import { bubbleRelativeFallRatio, bubbleRiseRatio, bubbleVolumeFromRadius, drainByDigesting, growByAbsorbing, hitsSurvived, isPopped, shrinkFromHit } from './volume';

/**
 * Depths where the emergence events fire (design round 4). On D1 they only prove the depth scale
 * reads correctly, but they are the real trigger points.
 */
// The HUD's signposts come from the level, so a new level states its own pacing instead of
// inheriting another level's depths. See `src/levels.ts`.
const LANDMARKS: readonly Landmark[] = LEVEL.landmarks ?? [];

/** The three ways a bubble can be born (design round 5). Effects land in D4; here it is flavour. */
const SEEDS = ['鱼屁泡', '汽水泡', '深海淤泥泡'] as const;

const INTRO_SECONDS = 1.6;
/**
 * The surface finish: slow-motion splash, a held beat, then the pop.
 *
 * Longer than the death burst (1.5s). Death is a mistake and should get out of the way; reaching the
 * surface is the thing the whole run was for, so it gets a moment to land.
 */
const SURFACE_SECONDS = 2.6;

/** Slow-motion pop after the bubble is destroyed, before the next run starts. */
const BURST_SECONDS = 1.5;

/**
 * What to shout when a level's landmark is reached.
 *
 * The beats are announced rather than generated: the timeline decides WHAT is there, and this decides
 * what to call it. Indexed by landmark, so a level states its own beats through `Level.landmarks`.
 */
const EVENT_CALLOUTS = ['鱼群来了', '气泡潮', '爆发'];

/**
 * Whether a level entry names an obstacle.
 *
 * A type PREDICATE rather than an `includes` check with a cast, and the difference is not style: the predicate is
 * what lets the remaining branch narrow to "a hazard kind", so `makeHazard` cannot be handed an obstacle. The
 * enumerated version of this check (`crate` || `coral`) was one new kind away from quietly building a CREATURE out of
 * scenery -- it would have placed, drifted and collided as a hazard while looking like a crate -- and the narrowing
 * is the half of the fix that turns that into a compile error.
 */
function isObstacleKind(kind: LevelEntry['kind']): kind is ObstacleKind {
  return (OBSTACLE_KINDS as readonly string[]).includes(kind);
}

class Game {
  private readonly player = new Player();
  private readonly input = new Input();
  private readonly camera = new Camera();
  private readonly scene = new WorldLayer();
  private readonly hud = new Hud(LANDMARKS);
  private readonly touch = new TouchControls(this.input);
  private readonly finishBanner = makeLabel('海面 / SURFACE', 0xeaf9ff, 26);
  /** The gear button and the pause panel it opens. */
  private readonly settings = new SettingsUi();
  /** The main menu, shown before a run and after exiting to it. */
  private readonly menu = new MainMenu();
  /**
   * The save: which levels are cleared, and which one is selected.
   *
   * Constructed before the menu is wired, because its constructor is what SELECTS the stored level -- and the menu's
   * first layout reads the level's name and length off the row it is handed.
   */
  private readonly progress = new Progression();
  /**
   * The codex page.
   *
   * Its own screen rather than a panel over the menu, for the same reason the menu is its own screen: it is a place
   * the player goes, not an interruption of the water. Its layout is re-run by `layout()` on resize and it draws
   * nothing per frame -- see `CodexUi`.
   */
  private readonly codex = new CodexUi();

  /** Everything drawn in world metres: collectables, the bubble, and its trailing micro-bubbles. */
  private readonly pickups = new Graphics();
  /**
   * Creatures that are LEAVING, on their own layer so the whole pass can be dimmed at once.
   *
   * Every alpha in `paintHazards` is written per shape, so there is no single number on the shared layer to scale;
   * a separate `Graphics` with its own `alpha` is what makes `hazards.fleeAlpha` a config value rather than forty
   * edited fills. Drawn just above `pickups`, so a fish on its way out is still over the water and under the
   * bubble.
   */
  private readonly leaving = new Graphics();
  private readonly bubble = new Graphics();
  /**
   * The rage burst's wave, on its own layer UNDER the bubble.
   *
   * Its own layer because `paintBubble` clears the bubble's Graphics every frame -- anything drawn into that one
   * before the call is wiped -- and under the bubble because a shockwave that covered the player would hide the
   * thing they are steering at the exact moment they are surrounded.
   */
  private readonly burstWave = new Graphics();
  private readonly particles = new Graphics();

  /**
   * Full-screen white, used only for the surface breach.
   *
   * A plain block rather than a shader: the flash is on screen for a fraction of a second and only
   * has to be white.
   */
  private readonly flash = new Graphics();

  /** Collectables and decoration. Collectables now come from the level's timeline, not from a density. */
  private readonly field = new EntityField();

  /**
   * Metres the level has scrolled. The level's own progress, independent of where the player is.
   *
   * Separate from the player's y on purpose: the player moves freely, so "how far through the level are
   * we" and "how high is the bubble" are now two different questions. The scroll decides what content
   * exists and when the level ends; the player's y decides what they run into.
   */
  private scrolled = 0;
  /** Entries emitted from the timeline so far, for diagnostics. */
  private timelineEmitted = 0;
  /** Last few evaluations of the end condition, for probes. See `step`. */
  private readonly endTrace: {
    scrolled: number;
    hazards: number;
    bubbles: number;
    pickup: number;
    emitted: number;
    total: number;
    phase: string;
  }[] = [];
  /**
   * Where recent timeline entries appeared, and where the view was at the time.
   *
   * Exists because "enemies spawn in the middle of the screen" cannot be checked from a screenshot and
   * is a single comparison between two numbers.
   */
  private readonly spawnLog: {
    kind: string;
    /** Which edge it arrived from, so a probe can prove a block's rom reached the game. */
    from: string;
    /** Where it actually spawned, which for a side or bottom entry is deliberately OFF the screen. */
    x: number;
    worldY: number;
    visibleTop: number;
    visibleBottom: number;
  }[] = [];

  /**
   * How many entries have arrived from each edge this run.
   *
   * Counted rather than sampled, for the same reason the bait and grip counters are: an arrival is over in a frame or
   * two, so "was anything ever placed outside the lane" is unanswerable from a boolean read afterwards.
   */
  private spawnedBySide: Record<EntrySide, number> = { top: 0, left: 0, right: 0, bottom: 0 };

  private seedLabel: string = SEEDS[0];
  private elapsed = 0;
  private fps = 60;
  private nominalSeconds = 0;
  private accumulator = 0;
  private frameCount = 0;
  private lastDelta = 0;
  /**
   * Lateral control authority, calibrated for this display's play-area width. Rebuilt on resize,
   * because a wider canvas is literally a wider play area.
   */
  private lateral: LateralAuthority = calibrateLateral(1);
  /** Sticky edge detector: the surface banner is transient, so probes cannot catch it by sampling. */
  private bannerSeen = false;

  /**
   * Run phase.
   *
   *   menu     the main menu; no level is running
   *   intro    the birth animation, before control is handed over
   *   playing  the level
   *   burst    the slow-motion pop after the bubble is destroyed, or the held beat at the surface
   *   paused   the settings panel is open; the whole simulation is frozen
   *   codex    the bestiary page is open, reached from the menu
   */
  private phase: 'menu' | 'intro' | 'playing' | 'burst' | 'paused' | 'codex' = 'menu';
  /**
   * Which bubble the current run is: chosen on the main menu, fixed for the run.
   *
   * One type per run is the design's answer to the two palettes wanting the same canvas, and it is also what makes
   * the control layout belong to the type: `touch.setControls` is called once, when the run starts, and nothing
   * downstream has to ask which buttons exist. See `src/bubbleTypes.ts`.
   */
  private bubbleType: BubbleType = defaultBubbleType();
  /** Rage, for the volatile bubble. Unused (and always zero) for the devour bubble. */
  private rage: RageState = initialRageState();
  /**
   * The charge verb's state.
   *
   * `chargeAim` is the direction the slam will go, captured while the button is held and FROZEN once the player stops
   * steering -- which is the design's "compress and lock the direction": point, release the stick, let go. A player
   * who never aims at all still gets a slam, straight up, because a verb that can silently do nothing is worse than
   * one that goes the obvious way.
   */
  private chargeAim = { x: 0, y: 0 };
  private charging = false;
  /** Seconds left of the "this contact is a slam" window. Zero means ordinary contact rules. */
  private slamSeconds = 0;
  /** How many slams have connected, so a probe can prove the verb did something rather than merely fired. */
  private slams = 0;

  /**
   * The rage burst, and its wave.
   *
   * The wave is stored as the radius it reached and how long ago it fired, rather than as an animated object: the
   * EFFECTS are all applied at the instant of the press, so what is left to draw is an expanding ring that means
   * "this is how far it reached". Keeping the effects instantaneous and the drawing animated is what makes the verb
   * testable -- "what did the burst do" has one answer, at one moment, instead of depending on which frame the ring
   * happened to be passing something.
   */
  private burst: { radius: number; seconds: number; kills: number; pushes: number } | null = null;
  /** Monotonic count of bursts fired, so a probe can prove the press reached the verb. */
  private bursts = 0;

  /** Whether a slam is in its window right now: the charge has been released and the window has not run out. */
  private get onSlam(): boolean {
    return this.slamSeconds > 0 && this.bubbleType.look === 'rage';
  }

  /** Whether the bubble is in overload: full rage, on the clock. See `angry.overload`. */
  private get overloaded(): boolean {
    return this.bubbleType.look === 'rage' && isOverloaded(this.rage);
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
  private useBurst(): void {
    if (!hasVerb(this.bubbleType, 'burst')) return;
    const cfg = mech.angry.burst;
    const laneWidth = this.camera.viewport.laneWidthMeters;
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
      this.shoveHazard(h, dx, dy, cfg.pushImpact);
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
    audio.play('crab');
  }

  /** The burst radius for the current rage: linear from the base at zero to the maximum at full. */
  private burstRadiusRatio(): number {
    const cfg = mech.angry.burst;
    const t = rageFraction(this.rage.rage);
    return cfg.radiusBaseRatio + (cfg.radiusMaxRatio - cfg.radiusBaseRatio) * t;
  }
  private phaseTimer = INTRO_SECONDS;
  /** The phase to restore when the settings panel closes. */
  private phaseBeforePause: 'intro' | 'playing' | 'burst' = 'playing';
  /**
   * The bubble's growth stage: which speed tier it is in, and how far into the next one.
   *
   * Per-run state, reset with everything else in `startRun`. Its `speedMultiplier` is pushed into the player
   * whenever it changes, rather than the player reading it, so `Player` stays unaware of the stage system.
   */
  private stage: StageState = initialStageState();
  /** Seconds of invulnerability remaining after a hit. */
  private invulnerable = 0;
  /** Sticky counters for probes and for the result card. */
  /**
   * Run counters.
   *
   * `newRecord` is set by `recordBest` at the moment a run ends and is read by the results card. It
   * lives here rather than being recomputed at draw time because "did this run beat the previous
   * best" is only answerable BEFORE the best is updated.
   */
  /** overloads counts overloads that EXPIRED -- the ones the player failed to release. */
  private stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: 0, overloads: 0, newRecord: false };
  /** How many bubbles were absorbed in the last step, for probes. */
  private lastEaten = 0;
  private runBanner = makeLabel('', 0xd8fbff, 20);

  constructor(readonly app: Application) {
    this.nominalSeconds = nominalAscentSeconds();

    this.scene.world.addChild(this.pickups, this.leaving, this.burstWave, this.bubble, this.particles);
    // The flash sits directly over the water but UNDER the HUD, so the depth readout stays legible
    // through it -- the player should still be able to see where they got to during the white-out.
    this.flash.visible = false;
    this.app.stage.addChild(this.scene.root, this.flash, this.hud.root, this.touch.root);

    this.finishBanner.anchor.set(0.5);
    this.finishBanner.alpha = 0;
    this.app.stage.addChild(this.finishBanner);

    this.runBanner.anchor.set(0.5);
    this.runBanner.alpha = 0;
    this.app.stage.addChild(this.runBanner);

    /**
     * The UI goes on top of everything, and the MENU on top of the UI.
     *
     * Order matters here rather than being incidental: the settings panel has to cover the HUD and the water,
     * and the menu has to cover the settings gear while it is showing.
     */
    this.app.stage.addChild(this.settings.root, this.menu.root, this.codex.root);
    this.settings.setVolume(audio.getVolume());
    this.settings.setOpen(false);
    // The game opens on the menu, so the gear must not be showing behind it.
    this.settings.root.visible = false;
    this.settings.onVolume = (v) => audio.setVolume(v);
    this.settings.onOpen = () => this.openSettings();
    this.settings.onClose = () => this.closeSettings();
    this.settings.onRestart = () => this.restartLevel();
    this.settings.onExit = () => this.exitToMenu();
    this.menu.onStart = (typeId) => this.enterFromMenu(typeId);
    this.menu.onCodex = () => this.enterCodex();
    /**
     * Picking a level, which the menu only offers for levels that are reachable.
     *
     * The menu does not know the unlock rule -- it is handed the list and reports a press -- so the decision is made
     * here, by the store, and the menu is handed the result. `refreshLevelMenu` is what puts the new selection and the
     * note back on screen.
     */
    this.menu.onPickLevel = (levelId) => {
      if (this.progress.select(levelId)) {
        this.refreshLevelMenu();
        // The type selector's start button begins a NEW run on whatever is selected, so a level change while a run is
        // on screen is only meaningful at the menu. Picking one there is the only path, and this is it.
      } else {
        this.menu.setLevelNote('这一关还没解锁', false);
      }
    };
    this.codex.onBack = () => this.exitCodex();
    /**
     * The menu is handed the types rather than importing them, so "which bubbles exist" has one owner.
     *
     * Done at boot and before the first `layout`, because the NUMBER of buttons is part of the layout: a menu that
     * learned about a third type after laying out would draw two.
     */
    this.menu.setTypes(BUBBLE_TYPES);
    /**
     * The levels, from the progress store rather than from `LEVELS`.
     *
     * Also before the first layout, and for the same reason: the number of pills is part of the geometry.
     */
    this.refreshLevelMenu();

    this.input.attach(window);

    // Route pointer events from the STAGE rather than from interactive children. Stage listeners
    // fire with the pointer's screen position regardless of what the display list contains, so the
    // controls cannot be broken by another object overlapping them or by hit-test subtleties.
    const stage = this.app.stage;
    stage.eventMode = 'static';
    stage.hitArea = { contains: () => true };
    // Routed through the handle* methods rather than straight into the touch layer, so there is ONE
    // path every pointer event takes. Two paths meant the diagnostic log could not see what the real
    // handlers received, which is exactly what is needed to debug multi-touch routing.
    stage.on('pointerdown', (e) => this.handlePointerDown(e.pointerId, e.global.x, e.global.y));
    stage.on('globalpointermove', (e) => this.handlePointerMove(e.pointerId, e.global.x, e.global.y));
    stage.on('pointerup', (e) => this.handlePointerUp(e.pointerId));
    stage.on('pointerupoutside', (e) => this.handlePointerUp(e.pointerId));
    stage.on('pointercancel', (e) => this.handlePointerUp(e.pointerId));

    this.rollSeed();
    this.player.reset();
    this.scrolled = 0;
    this.camera.setScroll(0);
    this.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
    /**
     * The game starts on the MENU, where `step` returns before it reaches `audio.setDepth` -- so the ambience
     * would never be told to stay quiet. A no-op on a cold boot because there is no AudioContext yet, but it
     * is the state this phase requires, and it stops the menu depending on that accident.
     */
    audio.silenceAmbience();
    this.layout();

    // Expose the tuning object so feel can be dialled in live from the browser console.
    (window as unknown as { __GB: unknown }).__GB = {
      tuning,
      player: this.player,
      camera: this.camera,
      input: this.input,
      scene: this.scene,
      hud: this.hud,
      game: this,
      /**
       * The mechanics config, so a probe can compare what the game loaded against the file it came from.
       *
       * Exposed rather than imported by the probe: the probe runs in the page, and the point of the check is
       * that the RUNNING build's values match the hand-edited file.
       */
      mechRef: mech,
      /**
       * The layout functions, so a probe can check how the game is framed at any canvas size without
       * resizing anything. A compatibility bug across screen sizes is exactly the kind that only shows
       * up on the one display nobody tested.
       */
      layout: { computeViewport, designScale },
    };

    this.app.ticker.add((ticker) => this.frame(ticker.deltaMS / 1000));
  }

  /** Lateral values this display resolved to, for the console and for probes. */
  get lateralSnapshot(): LateralAuthority {
    return this.lateral;
  }

  /** Called by the host page whenever the canvas size actually changed. */
  handleResize(): void {
    this.layout();
  }

  /** Touch control state, for probes and the remote console. */
  get touchState() {
    return this.touch.debugState;
  }

  /**
   * Route a pointer event into the touch layer. Called from stage-level listeners.
   *
   * Every event is recorded, because multi-touch bugs are invisible from the outside: the layer only
   * knows the ids it is handed, and if the host passes a different id for the same finger's down and
   * up, the layer will see a phantom second finger and release the wrong control. That is not
   * something a screenshot or a state dump can distinguish from a logic error.
   */
  private readonly pointerLog: { t: number; kind: string; id: number; x: number; y: number }[] = [];

  private logPointer(kind: string, pointerId: number, x: number, y: number): void {
    this.pointerLog.push({ t: +(this.elapsed).toFixed(2), kind, id: pointerId, x: Math.round(x), y: Math.round(y) });
    if (this.pointerLog.length > 60) this.pointerLog.shift();
  }

  /**
   * The last known position of each pointer, so an `up` can be hit-tested.
   *
   * Pixi's `pointerup` carries global coordinates, but the host calls `handlePointerUp(pointerId)` without
   * them -- and a press must only fire if the release is still over the same control. Remembering the last
   * position is what lets a drag off a button cancel it, which is the behaviour a player expects.
   */
  private readonly pointerPositions = new Map<number, { x: number; y: number }>();

  handlePointerDown(pointerId: number, x: number, y: number): void {
    // The first real gesture is the only moment a browser lets audio start. Doing it here rather than
    // at boot is why the game is not silently muted on a phone.
    audio.unlock();
    this.logPointer('down', pointerId, x, y);
    this.pointerPositions.set(pointerId, { x, y });

    /**
     * The UI gets first refusal, and consumes the event if it takes it.
     *
     * Order: menu, then the settings panel, then the water. Without this a tap meant for a button would also
     * start steering the bubble, and a tap on the panel's scrim would move the player mid-decision.
     */
    if (this.phase === 'menu') {
      this.menu.handlePointerDown(x, y);
      return;
    }
    // The codex swallows every press while it is open: it is a full screen, and a tap in its margin landing in the
    // water would steer a bubble nobody can see.
    if (this.phase === 'codex') {
      this.codex.handlePointerDown(x, y);
      return;
    }
    if (this.settings.handlePointerDown(pointerId, x, y)) return;
    if (this.phase === 'paused') return;
    this.touch.onPointerDown(pointerId, x, y);
  }

  handlePointerMove(pointerId: number, x: number, y: number): void {
    this.logPointer('move', pointerId, x, y);
    this.pointerPositions.set(pointerId, { x, y });
    if (this.phase === 'menu') {
      this.menu.handlePointerMove(x, y);
      return;
    }
    if (this.phase === 'codex') {
      // Nothing on the codex page tracks a drag, so a move is simply not the water's business either.
      return;
    }
    if (this.settings.handlePointerMove(pointerId, x, y)) return;
    if (this.phase === 'paused') return;
    this.touch.onPointerMove(pointerId, x, y);
  }

  handlePointerUp(pointerId: number): void {
    this.logPointer('up', pointerId, -1, -1);
    const at = this.pointerPositions.get(pointerId) ?? { x: -1, y: -1 };
    this.pointerPositions.delete(pointerId);

    if (this.phase === 'menu') {
      this.menu.handlePointerUp(at.x, at.y);
      return;
    }
    // The codex fires on press, so a release has nothing left to do -- but it must still not reach the water.
    if (this.phase === 'codex') return;
    if (this.settings.handlePointerUp(pointerId, at.x, at.y)) return;
    if (this.phase === 'paused') return;
    this.touch.onPointerUp(pointerId);
  }

  /** Test hook: the raw pointer stream, for diagnosing multi-touch routing. */
  get pointerTrace(): readonly { t: number; kind: string; id: number; x: number; y: number }[] {
    return this.pointerLog;
  }

  /** Canvas box on screen. Retained for hosts that offset the canvas element. */
  setCanvasRect(_rect: { left: number; top: number; width: number; height: number }): void {
    // The touch layer works in canvas coordinates and does not need this today; kept as the seam
    // for a host that letterboxes or scales the canvas element.
  }

  /** Skill button geometry in canvas coordinates, so tests touch the real control. */
  get touchGeometry() {
    return this.touch.skillGeometry;
  }

  /** Canvas size in CSS pixels, so a probe can aim a drag at a real screen position. */
  get canvasSize(): { width: number; height: number } {
    return { width: this.app.renderer.screen.width, height: this.app.renderer.screen.height };
  }

  /** Test hook: the touch layer, so a probe can read where a drag is aiming. */
  get touchRef(): TouchControls {
    return this.touch;
  }

  /** Test hook: the HUD, so a probe can read the number the player actually sees. */
  get hudRef(): Hud {
    return this.hud;
  }

  /** Test hook: the level, so a probe can read properties like the lead limit. */
  get levelRef(): Level {
    return LEVEL;
  }

  /** Test hook: the settings panel, so a probe can read its geometry and drive its real controls. */
  get settingsRef(): SettingsUi {
    return this.settings;
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
  private canSwallow(kind: HazardKind): boolean {
    return this.bubbleType.swallowsHazards && canEatHazard(kind, this.player.volume, this.tierBonus);
  }

  /**
   * Test hook: whether the player could currently EAT this kind of hazard.
   *
   * Exposes the same function the collision and the outline marker use, so a test asserts the real rule rather
   * than reimplementing the tier ladder and disagreeing with it at the edges.
   */
  canEatHazardForTest(kind: HazardKind): boolean {
    return this.canSwallow(kind);
  }

  /**
   * The stomach, and the projectiles currently in flight.
   *
   * Per-run state: reset with everything else in `startRun`, because a new run must not begin holding the previous
   * run's ammunition.
   */
  private readonly stomach = new Stomach();
  /** Crates to smash and coral to squeeze past: the target for spitting and for being small. */
  private readonly obstacles = new ObstacleField();
  private readonly projectiles: SpitProjectile[] = [];
  /**
   * The gun: the small bubbles the player's bubble fires on its own.
   *
   * Its own field rather than more entries in `projectiles` above, because the two are different KINDS of thing: a
   * spit projectile is a swallowed hazard thrown back (it carries a `kind`, knocks things around, and costs a
   * stomach slot), while these are plain rounds that take hit points off a creature. See `src/bullets.ts`.
   */
  private readonly bullets = new BulletField();
  /** Seconds until the next spit is allowed. */
  private spitCooldown = 0;
  /** 1 -> 0 pulse on the spit button, for the refusal when the stomach is empty. */
  private spitFlash = 0;
  /** Projectiles that have hit something this run, so a hit is observable rather than inferred from motion. */
  private spitHits = 0;

  /**
   * Growth energy banked by digestion, and the rank it has bought.
   *
   * This is the ONE thing digestion produces that is not a subtraction, and it is the reason digesting is worth
   * its cost: mass leaves the bubble while the rank it bought stays. `tierBonus` is derived rather than stored,
   * so the config's `energyPerTier` can be edited at runtime -- which is how the tests make a digest payoff
   * happen in a second rather than in twenty -- without the two getting out of step.
   */
  private growthEnergy = 0;
  /** Whether the player is compressing right now: held control AND something to compress. */
  private compressing = false;
  /** Items digested this run, and the total volume digestion has taken out of the bubble. */
  private digested = 0;
  private digestedMass = 0;

  /**
   * The eating rank digestion has bought, in tiers.
   *
   * Added to `volumeTier(volume)` wherever the eat rule is asked, which is exactly two places plus the outline
   * marker -- all three through `canEatHazard`, so a marker that promised food while the collision delivered a
   * hit remains impossible.
   */
  private get tierBonus(): number {
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
  private get suctionUp(): boolean {
    /**
     * The type gate is the first thing checked, and it exists because the keyboard does not go through the buttons:
     * a player who has just switched to the volatile bubble and presses the old keys must not get a suction field
     * the type does not have. See `hasVerb`.
     */
    if (!hasVerb(this.bubbleType, 'suction')) return false;
    return this.input.sucking && !this.compressing;
  }

  /**
   * The stomach's frame: the fuse, the digestion, and the spit button.
   *
   * All three belong together because they are the same question -- what happens to what I swallowed -- and
   * because the ORDER between them is the mechanic. The fuse is ticked first so that an item finishing its
   * digestion this frame really does save the player, and the button is read last so a shot fired this frame
   * travels this frame instead of hanging at the bubble's position for one frame first.
   */
  private updateStomach(dt: number, laneWidth: number): void {
    this.spitCooldown = Math.max(0, this.spitCooldown - dt);
    this.spitFlash = Math.max(0, this.spitFlash - dt * 3);

    /**
     * Compression is the held control AND a non-empty stomach.
     *
     * The second half is not pedantry: holding the button with nothing inside would otherwise cost the player
     * their suction field and DOUBLE every hit they take, in exchange for nothing at all. A state that punishes
     * without a subject is just a bug the player cannot see.
     */
    this.compressing = hasVerb(this.bubbleType, 'compress') && this.input.compressing && this.stomach.size > 0;

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
        this.runBanner.text = `消化 · 可吞等级 +${this.tierBonus}  ·  体积仍 ${this.player.volume.toFixed(1)}`;
        this.runBanner.alpha = 1;
        this.bannerSeen = true;
        audio.play('skill');
      }
    }

    // An item finishing is worth marking even when it did not buy a rank: the player just made room, which is
    // what puts an over-eating fuse out.
    if (tick.completed) {
      this.digested += tick.completed.length;
      audio.play('absorb', 0.5);
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
      audio.play('hit');
      audio.play('pop');
      this.runBanner.text = `胃里炸了  ·  ${tick.detonations.length} 颗  ·  炸弹鱼不能留`;
      this.runBanner.alpha = 1;
      this.bannerSeen = true;
    }

    /**
     * The eel: the controls stop obeying for a moment.
     *
     * `applyMisfire` EXTENDS rather than replaces, so two eels cannot cut each other short. Nothing else here needs
     * to know the eel exists -- the bubble carries the state, and `Player.update` reads it.
     */
    if (tick.shocks > 0) {
      this.player.applyMisfire(tick.shocks);
      audio.play('slow');
      this.lastComedyBeat = { what: 'eel', at: this.elapsed };
    }

    /**
     * The type gate comes BEFORE the consume, and that order is the point: the volatile bubble has no spit verb, so
     * a pending press must be dropped rather than banked. Consuming it and returning would leave nothing behind
     * either way -- but checking first means the flag cannot queue up a shot that fires the moment the player
     * switches bubble, which is the kind of ghost input that is invisible until it happens in a real run.
     */
    if (!hasVerb(this.bubbleType, 'spit')) return;
    if (!this.input.consumeSpit()) return;
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
        this.runBanner.text = '油污卡住了  ·  吐不出来，只能压下去';
        this.runBanner.alpha = 1;
        audio.play('hit');
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
    const dir = spitDirection(this.input.dragAimX, this.input.dragAimY);
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
    audio.play('pop');
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
  private updateBullets(dt: number, laneWidth: number, min: number, max: number): void {
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    const shots = this.bullets.update(dt, {
      min,
      max,
      laneWidth,
      muzzleX: this.player.x * laneWidth,
      // The bubble's rim, so the stream reads as leaving the bubble rather than appearing inside it.
      muzzleY: this.player.y + playerRadius,
      /**
       * Firing is a PLAYING-phase act, and one the bubble type can refuse.
       *
       * Not armed during the birth animation or while the bubble is popping: a stream of fire during either would
       * be the game acting while the player has no control. Rounds already in flight keep flying in those phases,
       * which is right -- they are in the water, not in the player's hands.
       */
      armed: this.phase === 'playing' && this.bubbleType.firesBullets,
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
    if (shots.fired > 0) audio.play('bulletFire', mech.audio.bulletFireVolume);
    if (shots.hits > 0) {
      const volume = mech.audio.bulletHitVolume;
      audio.play('bulletHit', shots.drivenOff > 0 ? Math.min(1, volume * 1.4) : volume);
    }
  }

  private updateProjectiles(dt: number, laneWidth: number, min: number, max: number): void {
    if (!this.projectiles.length) return;
    const hitRadius = laneWidth * mech.spit.hitRadiusRatio;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!;
      p.age += dt;
      // Exponential decay, expressed as a time constant so the range does not change with the frame rate.
      const decay = Math.exp(-dt / Math.max(0.02, mech.spit.decaySeconds));
      p.vx *= decay;
      p.vy *= decay;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      let spent = false;

      /**
       * Obstacles first, then hazards.
       *
       * Order matters and is not arbitrary: an obstacle is the thing a projectile is FOR, so a crate in front of
       * a fish should stop the shot. Hitting the fish through the crate would make the scenery a lie.
       */
      const obstacleHit = this.obstacles.hitByProjectile(p.x, p.y, hitRadius, spitImpact(p.kind));
      if (obstacleHit) {
        this.spitHits++;
        if (obstacleHit.broke) audio.play('hit');
        spent = true;
      }

      for (const h of this.hazards.hazards) {
        if (spent) break;
        const hr = laneWidth * h.radiusFraction;
        const dx = h.x - p.x;
        const dy = h.y - p.y;
        const reach = hitRadius + hr;
        if (dx * dx + dy * dy > reach * reach) continue;

        /**
         * A hit knocks the target back along the projectile's path, scaled by the target's mass.
         *
         * Heavy things shrug it off and light things are thrown, which keeps "the item keeps its own properties"
         * true on the receiving end as well as the sending end. DAMAGE would be the obvious alternative, but these
         * hazards have no health to take -- nothing else in this game kills them with numbers, and inventing hit
         * points for them inside one mechanic would be a new system hiding in this one.
         */
        this.shoveFromProjectile(p, h, dx, dy);
        this.spitHits++;
        audio.play('hit');

        /**
         * An explosive round keeps going off after the first thing it touches.
         *
         * That is the whole reason to swallow a bomb fish, so this is the payoff half of the creature rather than
         * an extra: the fuse in your stomach buys you a grenade, and a grenade that only pushed one thing would be
         * an ordinary pellet with a countdown attached to it.
         */
        const blast = laneWidth * blastRadiusFraction(p.kind);
        if (blast > 0) {
          for (const other of this.hazards.hazards) {
            if (other === h) continue;
            const ox = other.x - p.x;
            const oy = other.y - p.y;
            if (ox * ox + oy * oy > blast * blast) continue;
            // Pushed AWAY from the blast centre, which is what makes it read as an explosion rather than as a
            // second projectile arriving.
            this.shoveFromProjectile(p, other, ox, oy);
          }
          audio.play('crab');
        }
        spent = true;
        break;
      }

      // Recycle: it hit something, it slowed to a stop, or it left the level's band.
      const outside = p.y < min - 60 || p.y > max + 60;
      if (spent || outside || Math.hypot(p.vx, p.vy) < laneWidth * 0.05) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Shove one hazard away from a point.
   *
   * Extracted so the direct hit, the grenade's blast and the rage burst push things by the SAME arithmetic -- an
   * explosion is not a different kind of impact, it is the same one applied to everything in range. Two copies of
   * this would let the grenade's centre shove differently from its fringe, which is not a thing a player could
   * describe but is exactly the sort of inconsistency that reads as "that felt wrong".
   *
   * @param dx,dy direction from the impact to the target; only the direction is used.
   * @param impact the impact factor, in the same units as `spitImpact` (a crab is 1.6, a jellyfish 0.6).
   */
  private shoveHazard(target: { kind: HazardKind; x: number; y: number }, dx: number, dy: number, impact: number): void {
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

  /** Shove one hazard away from a projectile's position. See `shoveHazard`. */
  private shoveFromProjectile(
    p: SpitProjectile,
    target: { kind: HazardKind; x: number; y: number },
    dx: number,
    dy: number,
  ): void {
    this.shoveHazard(target, dx, dy, spitImpact(p.kind));
  }

  /**
   * How much the suction field is widened right now.
   *
   * Over capacity it runs away with itself, pulling in MORE than the player can eat -- the punishment mixed with
   * temptation that the design's over-eating state is for. A getter passed to BOTH the drawing and the physics,
   * so the field the player sees is the field that is actually pulling. Computing it in two places would let them
   * drift, and a visible promise would become a lie.
   */
  private get suctionRadiusFactor(): number {
    return this.stomach.overloaded ? mech.spit.overloadSuctionFactor : 1;
  }

  /**
   * Test hook: the suction field's reach in metres, as the physics actually uses it.
   *
   * Exposed because the field's radius has two multipliers (the player's size and, when over-full, the runaway
   * bonus) and a test asserting only the config value would pass while a bonus that never reached the physics did
   * nothing.
   */
  suctionReachForTest(): number {
    return this.camera.viewport.laneWidthMeters * suctionRadiusFraction(this.player.volume) * this.suctionRadiusFactor;
  }

  /**
   * Test hook: the codex page, so a probe can read its state and press its real controls.
   *
   * The page is opened through `enterCodex`, the same path the menu button takes, rather than by setting the phase
   * from outside: a probe that forced the phase would not notice a menu button that was never wired up, which is the
   * one way this feature can fail to be reachable.
   */
  get codexRef(): CodexUi {
    return this.codex;
  }

  /** Test hook: open the codex as the menu button does. */
  debugOpenCodexForTest(): void {
    this.enterCodex();
  }

  /**
   * Test hook: drop an obstacle on the player, or `ahead` metres above them.
   *
   * An offset rather than always-at-the-player because the two interactions need different setups: a ram test
   * wants the collision to resolve immediately, and a projectile test needs something to shoot AT.
   */
  debugSpawnObstacleOnPlayer(kind: ObstacleKind, ahead = 0): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    this.obstacles.spawn(kind, this.player.x * laneWidth, this.player.y + ahead);
  }

  /**
   * Test hook: drop one growth stage.
   *
   * Nothing in the game demotes the player -- the design has not decided whether damage should cost a stage --
   * so this exists purely so a probe can measure each stage's handling without absorbing its way up and back
   * down. It goes through `demote`, the same function real demotion would use, so the state stays consistent.
   */
  demoteStageForTest(): number {
    demote(this.stage);
    this.player.stageSpeedMultiplier = this.stage.speedMultiplier;
    return this.stage.stage;
  }

  /** Test hook: the main menu. */
  get menuRef(): MainMenu {
    return this.menu;
  }

  /**
   * Test hook: begin a run with a named bubble, the same way the menu does.
   *
   * Goes through `enterFromMenu`, so it exercises the real path including `setBubbleType` -- a probe that set the
   * type directly would not notice a control list that never reached the touch layer, which is the one way this
   * feature can half-work.
   */
  debugStartRunWithType(typeId: string): void {
    this.enterFromMenu(typeId);
  }

  /**
   * Test hook: fire the burst directly, bypassing the button.
   *
   * The button is the real path and the spec uses it for the verb's behaviour; this exists for the one measurement
   * that needs several bursts in a row at chosen rage levels, where reaching for a button each time would be three
   * presses of ceremony around one number.
   */
  useBurstForTest(): void {
    this.useBurst();
  }

  /**
   * Test hook: every bubble type the game offers, in menu order.
   *
   * Exposed so a probe can assert the menu is offering exactly these, in this order -- the alternative is a list
   * written into the test, which would agree with a menu that had stopped agreeing with the game.
   */
  debugBubbleTypeIds(): string[] {
    return BUBBLE_TYPES.map((type) => type.id);
  }

  /**
   * Test hook: the progress store, so a spec can drive the ladder without playing two levels to the surface.
   *
   * Three things, because they are what a test needs and nothing more: read it, set it, and forget it. Setting goes
   * through the SAME `select` the menu uses, so a spec cannot put the game into a state the menu could not.
   */
  debugProgress(): { cleared: string[]; selected: string; ladder: { id: string; name: string; locked: boolean; selected: boolean }[] } {
    return { cleared: [...this.progress.cleared], selected: this.progress.selected, ladder: this.progress.entries() };
  }

  /** Test hook: pretend a level was cleared, exactly as reaching its surface does. */
  debugClearLevel(id: string): string | null {
    const unlocked = this.progress.clear(id);
    this.refreshLevelMenu();
    return unlocked;
  }

  /** Test hook: select a level if it is reachable. */
  debugSelectLevel(id: string): boolean {
    if (!this.progress.select(id)) return false;
    this.refreshLevelMenu();
    return true;
  }

  /** Test hook: forget the save, as a player clearing their progress would. */
  debugResetProgress(): void {
    this.progress.reset();
    this.refreshLevelMenu();
  }

  /**
   * Test hook: install a hand-written spawn table and restart, so "the config drives the level" is measurable.
   *
   * The blocks go through the same reader and the same expansion the level file's do -- including its refusals, so a
   * bad block here throws exactly as it would in the file. Without this a spec would have to edit
   * `config/levels.json5` on disk, which would make the test about the file system rather than about the game.
   *
   * @return how many entries the blocks expanded to.
   */
  debugInstallSpawnBlocks(blocks: readonly unknown[]): number {
    const count = installSpawnBlocks(blocks);
    this.startRun();
    return count;
  }

  /**
   * Test hook: grant rage, so a probe can reach a stage without arranging four hits.
   *
   * `gainRage` rather than assigning, so the safe-time clock is reset exactly as a real hit would reset it.
   */
  debugGrantRageForTest(amount: number): number {
    gainRage(this.rage, amount);
    return this.rage.rage;
  }

  /**
   * Test hook: where the player's bubble is drawn, in CANVAS pixels.
   *
   * Exists because reading a screenshot means having to find the bubble in it, and guessing the mapping from
   * `screenY` to a pixel row gets it wrong -- the first attempt sampled the water and reported its colour as
   * the bubble's. The drawing code already knows this conversion, so it reports it rather than a test
   * reproducing it and disagreeing.
   */
  get playerScreenPx(): { x: number; y: number; radiusPx: number } {
    const band = this.scene.world;
    const viewport = this.camera.viewport;
    const radius = viewport.laneWidthMeters * stageRadiusFraction(this.stage.stage, this.player.volume);
    return {
      x: band.x + (this.player.x * viewport.laneWidthMeters * band.scale.x),
      y: band.y + this.player.y * band.scale.y,
      radiusPx: radius * band.scale.x,
    };
  }

  /** Test hook: the last few evaluations of the end condition, so a failure is diagnosable. */
  get endTraceRef(): readonly {
    scrolled: number;
    hazards: number;
    bubbles: number;
    pickup: number;
    emitted: number;
    total: number;
    phase: string;
  }[] {
    return this.endTrace;
  }

  /** Test hook: where recent timeline entries appeared relative to the view. */
  get spawnLogRef(): readonly { kind: string; from: string; x: number; worldY: number; visibleTop: number; visibleBottom: number }[] {
    return this.spawnLog;
  }

  /**
   * Test hook: the REAL water-colour function.
   *
   * Exposed so a probe does not re-derive the arithmetic. A probe that copies the implementation keeps
   * reporting the old bug after the bug is fixed, which is worse than having no probe.
   */
  waterColourAt(worldY: number, depth: number): number {
    return waterColourForTest(worldY, depth);
  }

  /**
   * Test hook: jump the scroll to the end of the level and clear the water.
   *
   * The win condition is "the scroll finished AND the water is clear", which would otherwise take a
   * full minute of real time to reach. Two things have to be forced, so they are forced together --
   * setting only the scroll would leave the player waiting on a screen full of hazards.
   */
  debugSkipToLevelEnd(): void {
    this.scrolled = LEVEL.scrollLength;
    this.timelineEmitted = TIMELINE.length;
    this.field.placeTimeline(TIMELINE, this.scrolled, this.camera.visibleWorldRange(0).max);
    this.field.takePending();
    this.hazards.hazards = [];
    // Move the CAMERA, not the player: the scroll is the level's position, and the player's world
    // position is derived from it. Writing player.y directly would be overwritten on the next frame.
    this.camera.setScroll(this.scrolled);
    this.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
  }

  /** Test hook: force the boost state, bypassing the event system. Gone with the accelerate control. */
  debugSetBoosting(value: boolean): boolean {
    return this.touch.debugSetBoosting(value);
  }

  /**
   * Test hooks that drive the touch controls through their real pointer path.
   *
   * Used instead of dispatching synthetic pointer events when the measurement is about TIMING: a
   * round-trip per sample inflates the interval and makes a correct ramp look slow.
   */
  onPointerDownForTest(x: number, y: number): void {
    this.touch.onPointerDown(1, x, y);
  }

  onPointerUpForTest(): void {
    this.touch.onPointerUp(1);
  }

  /** Fractional damage accumulated from a trash bag's drain, so it costs whole hits over time. */
  private trashDrain = 0;
  /**
   * Fractional internal damage accumulated from what is in the stomach.
   *
   * Its own accumulator rather than sharing the trash bag's, because the two are different sources that can be
   * live at once and a shared one would let a 0.6 from an urchin and a 0.6 from a bag add up to a hit neither of
   * them earned.
   */
  private stomachDrain = 0;
  /**
   * Hit points the stomach's contents have taken from the player this run.
   *
   * Monotonic, like the other counters, because the evidence that an urchin is doing anything is a volume that
   * fell over a window in which nothing else was touching the player -- and "the volume is lower than before" is
   * also what eating, digesting and being shot at all look like.
   */
  private internalHits = 0;
  /** Volume destroyed inside by detonations this run, which buys no rank. Monotonic, for probes. */
  private destroyedMass = 0;
  /** Spit attempts refused by a clog this run. Monotonic, because a refusal is invisible in any sampled state. */
  private spitClogs = 0;
  /** Count of comedy beats this run, and the most recent one, for the HUD and probes. */
  private comedyBeats = 0;
  private lastComedyBeat: { what: HazardKind; at: number } | null = null;
  /** The hazard field: spawning, motion and contact. See src/hazards.ts. */
  private readonly hazards = new HazardField();

  /** This run's talent and its resolved multipliers. */
  private talentEffects: TalentEffects = resolveTalent(pickTalent());
  /**
   * The single skill slot. `uses` reaching zero empties it.
   *
   * One slot on purpose: it forces a decision at the pickup instead of accumulating a toolkit, and it
   * keeps the HUD to one button.
   */
  private skill: { id: SkillId; uses: number } | null = null;
  /** The bait bubble a decoy left behind, so it can be drawn and then expire. */
  private decoy: { x: number; y: number; until: number } | null = null;
  /** How many skills have been used this run, for the results card. */
  private skillActivations = 0;
  /** The skill lying in the water, if any, and the countdown to the next one. */
  /**
   * A skill lying in the water, waiting to be taken.
   *
   * `id` is null until it is collected, because WHICH skill it is gets rolled at pickup time. It used to
   * be decided on creation, which committed the player's next twenty seconds before they had even seen
   * the thing.
   */
  private skillPickup: { id: SkillId | null; x: number; y: number } | null = null;
  /** When the fish-fart talent can fire again, and how many times it has. */
  private fartReadyAt = 0;
  private farts = 0;
  /** Which scripted depth events have fired, and the count, so a run does not repeat a beat. */
  private eventsFired = new Set<number>();
  private eventsSeen = 0;
  private lastEvent: { label: string; at: number } | null = null;
  /** Mirrors the audio module's mute state, so the HUD can show it. */
  private audioMuted = false;
  /** Best run so far, kept across restarts. */
  private bestClimbed = 0;
  private bestVolume = 0;
  /** White-out flash driven by the surface breach, 1 -> 0. */
  private splash = 0;
  /** Whether the current burst is a SURFACE finish rather than a death. */
  private surfaced = false;

  /**
   * Test hook: drop a named hazard on the player, so each verb can be exercised deterministically.
   *
   * The four hazards have completely different effects, and waiting for the right one to spawn and
   * find the player would make each check a race. This also lets a probe assert the DIFFERENCE
   * between them, which is the actual design claim.
   */
  debugSpawnHazardOnPlayer(kind: HazardKind): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const hazard = this.hazards.spawnForTest(kind, this.player.x * laneWidth, this.player.y);
    /**
     * Already armed with its telegraph spent, so a test exercises the LAUNCH rather than the arming. The arming
     * itself is asserted by watching a naturally spawned crab.
     *
     * `fuse: 0` for EVERY kind, including a bomb fish, because that is what this hook has always done and probes are
     * built on it -- a spawned bomb fish is here to be swallowed, and its countdown starts in the stomach. Changing
     * it to the configured fuse would have been a silent behaviour change to every test that uses this.
     */
    hazard.fuse = 0;
    hazard.armed = true;
  }

  /** Test hook: the audio module, so a probe can check that the ambience tracks depth. */
  get audioRef(): typeof audio {
    return audio;
  }

  /** Test hook: the hazard list, so a probe can inspect positions and states. */
  get hazardsRef(): HazardField {
    return this.hazards;
  }

  /**
   * Test hook: zero the run's counters and top the player back up.
   *
   * Lets a probe measure each hazard in isolation without restarting the run. It deliberately does
   * NOT reset volume to a fixed value -- it raises it to full, because a probe measuring "did this
   * cost health" needs headroom rather than a precise starting number.
   */
  debugResetStats(): void {
    this.stats = { absorbed: 0, hits: 0, maxVolume: this.stats.maxVolume, ended: this.stats.ended, overloads: this.stats.overloads, newRecord: false };
    this.player.volume = tuning.volumeMax;
    this.player.slowRemaining = 0;
    this.player.slowFactor = 1;
    this.player.impulseVy = 0;
    this.invulnerable = 0;
    this.trashDrain = 0;
    this.stomachDrain = 0;
    this.internalHits = 0;
    this.destroyedMass = 0;
    this.spitClogs = 0;
    this.comedyBeats = 0;
    this.lastComedyBeat = null;
    this.hazards.reset();
    // Skill state too, or a probe that ran a skill leaks its effect into the next one -- which showed
    // up as a CONTROL run reporting the dash's ascent bonus, making two assertions fail for a reason
    // that had nothing to do with the skills.
    this.player.skillRemaining = 0;
    this.player.skillId = null;
    this.player.skillAscentBonus = 1;
    this.skillActivations = 0;
    this.decoy = null;
  }

  /**
   * Test hook: suspend the fish's bait reaction.
   *
   * The bait beat is explicitly a chance, so a test that needs to observe the CHASE would otherwise
   * fail 25% of the time and look like a broken mechanic. Both behaviours are worth asserting, but
   * not in the same run.
   */
  debugSetBaitEnabled(enabled: boolean): boolean {
    this.hazards.baitEnabled = enabled;
    return this.hazards.baitEnabled;
  }

  /**
   * Test hook: clear any input so a probe measures the hazard, not the player's own movement.
   *
   * Used to force a steady cruise, back when "cruising" was a thing a player could be in. With free
   * movement there is no cruise to force -- the equivalent is to stop steering, so a trash bag's grip is
   * not torn off by a struggling player during a measurement.
   */
  debugSetSteadyCruise(): void {
    this.touch.releaseAll();
    this.input.clearSteering();
  }

  /**
   * Test hook: force a specific talent and skill.
   *
   * Talents are rolled, so a probe that needs to assert a particular upside AND its backlash would
   * otherwise pass or fail on a dice roll.
   */
  debugSetTalent(id: string): string {
    const talent = TALENTS.find((t) => t.id === id);
    if (!talent) throw new Error(`unknown talent: ${id}`);
    this.talentEffects = resolveTalent(talent);
    this.player.ascentBonus = this.talentEffects.ascentMultiplier;
    this.player.steerScale = this.talentEffects.steerMultiplier;
    this.player.shrinkResistance = this.talentEffects.shrinkResistance;
    this.player.volume = this.talentEffects.startVolume;
    this.hud.setTalentLabel(talent.name);
    return talent.id;
  }

  /** Test hook: put a skill in the slot without waiting for a pickup to drift past. */
  debugGrantSkill(id: string): boolean {
    const skill = SKILLS.find((s) => s.id === id);
    if (!skill) throw new Error(`unknown skill: ${id}`);
    this.grantSkill(skill.id);
    return true;
  }

  /** Test hook: fire the fish-fart reflex, bypassing the contact that normally triggers it. */
  debugReleaseFart(): number {
    this.fartReadyAt = 0;
    this.releaseFart();
    return this.farts;
  }

  private rollSeed(): void {
    this.seedLabel = SEEDS[Math.floor(Math.random() * SEEDS.length)] ?? SEEDS[0];
    this.hud.setSeedLabel(this.seedLabel);
  }

  /** Fit the world play area to the real canvas and recompute dependent geometry. */
  private layout(): void {
    // `renderer.screen` is already in CSS/logical pixels (it is the backing store divided by the
    // resolution). Dividing again was the bug that made the renderer and, critically, Pixi's
    // hit-testing think the screen was a quarter of its real size -- which is exactly where the
    // touch controls ended up on a phone.
    const screenW = this.app.renderer.screen.width;
    const screenH = this.app.renderer.screen.height;

    this.camera.viewport = computeViewport(screenW, screenH);
    const viewport = this.camera.viewport;

    // The play area's width changed, so the lateral controls must be re-calibrated to keep the
    // same crossing times. Without this, a desktop window would need a different feel by hand.
    this.lateral = calibrateLateral(viewport.laneWidthMeters);

    this.scene.layout(viewport);
    this.hud.layout(viewport);
    this.hud.setWorldMetrics(viewport.laneWidthMeters, viewport.visibleDepthMeters);
    this.touch.layout(viewport.left, viewport.laneWidthPx, screenW, screenH, viewport.scale);
    this.settings.layout(viewport);
    this.menu.layout(viewport);
    this.codex.layout(viewport);

    this.finishBanner.scale.set(viewport.scale);
    this.finishBanner.x = screenW / 2;
    this.finishBanner.y = screenH * 0.3;

    // The flash covers the canvas in SCREEN space, so it must be rebuilt whenever the canvas changes.
    this.flash.clear();
    this.flash.rect(0, 0, screenW, screenH).fill({ color: 0xffffff, alpha: 1 });
  }

  private frame(deltaSeconds: number): void {
    /**
     * A frame is capped at 50ms of simulated time, so below 20fps the game advances game time SLOWER
     * than wall clock. That is deliberate -- an uncapped step lets a fast-moving collectable tunnel
     * through the player, since contact is a position test rather than a swept one.
     *
     * The consequence to remember when writing a probe: "sleep 500ms and look" measures fewer
     * simulation steps under load than it does on an idle machine. A parallel test run gives each
     * browser a fraction of the CPU, which is enough to fall under 20fps and stretch every
     * wall-clock-based assertion. Poll for the CONDITION you actually care about instead.
     */
    const dt = Math.min(deltaSeconds, 0.05);
    this.frameCount++;
    this.lastDelta = deltaSeconds;
    this.fps += ((deltaSeconds > 0 ? 1 / deltaSeconds : 60) - this.fps) * 0.1;

    this.accumulator += dt;
    const step = 1 / 120;
    let steps = 0;
    while (this.accumulator >= step && steps < 8) {
      this.step(step);
      this.accumulator -= step;
      steps++;
    }

    this.render(dt);
  }

  private step(dt: number): void {
    /**
     * Shared input runs in EVERY phase, including paused and menu.
     *
     * `input.update` derives the axes from the raw key set rather than integrating anything, so it is
     * stateless -- but skipping it leaves the axes frozen at their last value, and a player who pauses while
     * holding a direction key then resumes still holding it would find the bubble unresponsive. The mute key
     * is handled here too, and muting while the settings panel is open is exactly when someone would want it.
     */
    this.input.update();
    if (this.phase !== 'menu' && this.input.consumeMute()) this.audioMuted = audio.toggleMute();

    /**
     * PAUSED: freeze the rest of the simulation.
     *
     * Checked before anything else moves, so nothing accumulates while the panel is open -- not the scroll,
     * not the hazard timers, not the invulnerability window. A pause that only stopped the drawing would let a
     * trash bag finish draining the player while they read the menu.
     *
     * The menu is the same idea for the opposite reason: there is no level to simulate yet. The codex joins them:
     * it is reached from the menu, so the level behind it is either not started or already over.
     */
    if (this.phase === 'paused' || this.phase === 'menu' || this.phase === 'codex') return;

    if (this.invulnerable > 0) this.invulnerable = Math.max(0, this.invulnerable - dt);

    // Collectables are maintained in EVERY phase, not just 'playing'. During the birth intro and
    // the death burst the world should already be populated, otherwise a restart begins in an
    // empty ocean and only fills in once control returns.
    const viewport = this.camera.viewport;
    const { min, max } = this.camera.visibleWorldRange(20);

    /**
     * Advance the scroll, and place whatever the level's timeline calls for.
     *
     * The scroll is the level's own motion, and it is INDEPENDENT of the player: it runs at the level's
     * configured speed whether the player pushes up, holds still, or sinks. That independence is the
     * point -- an earlier version had the camera follow the player, so holding up advanced the level.
     *
     * Placed during 'playing' only. During the intro the level has not begun, and during the ending it
     * is over -- emitting content in either would drop hazards onto a player with no control.
     */
    if (this.phase === 'playing' || this.phase === 'burst') {
      this.scrolled = Math.min(LEVEL.scrollLength, this.scrolled + LEVEL.scrollSpeed * dt);
      this.camera.setScroll(this.scrolled);
      this.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
      if (this.phase === 'playing') {
        /**
         * Spawn at the TOP of the visible range, so content descends into view.
         *
         * Not at `this.scrolled`, which is the MIDDLE of the screen. Placing there made every enemy and
         * bubble materialise in the centre, which reads as spawning rather than as a current the player
         * is swimming against -- and gave the player no time to react, since the thing appeared at the
         * distance they were about to occupy.
         */
        this.field.placeTimeline(TIMELINE, this.scrolled, this.camera.visibleWorldRange(0).max);
        for (const placed of this.field.takePending()) {
          this.emitTimelineEntry(placed.entry, placed.worldY, viewport.laneWidthMeters);
          this.timelineEmitted++;
        }
      }
    } else {
      // The intro holds the camera still but still positions the bubble, so it is visible on screen
      // rather than at the world origin.
      this.camera.setScroll(this.scrolled);
      this.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
    }

    /**
     * Where the suction field is centred, or null when it is not held.
     *
     * Computed once here and passed to BOTH fields, so a hazard and a collectable at the same distance are pulled
     * identically. Two independently-derived centres would drift and the field would look off-centre.
     *
     * `x * laneWidth` and `player.y` are the same two numbers the hazard context already uses for contact, so the
     * pull and the collision agree on where the bubble is by construction.
     */
    const suctionAt = this.suctionUp ? { x: this.player.x * viewport.laneWidthMeters, y: this.player.y } : null;
    /**
     * The gathering cost, pushed into the player each frame because it lasts exactly as long as the input does.
     *
     * MULTIPLIED with the over-eating slow rather than replacing it, so a player who is both gathering and
     * over-full is genuinely nearly immobile -- which is the intended worst case and not a number to protect them
     * from.
     */
    this.player.suctionMoveFactor =
      (suctionAt ? suctionMoveFactor() : 1) * (this.stomach.overloaded ? mech.spit.overloadMoveSpeedFactor : 1);

    this.field.update(
      dt,
      viewport.laneWidthMeters,
      min,
      max,
      this.player.volume,
      LEVEL.scrollSpeed,
      suctionAt,
      this.suctionRadiusFactor,
    );

    switch (this.phase) {
      case 'intro': {
        this.phaseTimer -= dt;
        this.elapsed += dt;
        if (this.phaseTimer <= 0) this.phase = 'playing';
        return;
      }
      case 'burst': {
        // Slow motion: the pop plays out before the run resets, so death has some weight.
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) this.startRun();
        return;
      }
      case 'playing':
        break;
    }

    /**
     * Spit, then projectiles, then the hazards' effects.
     *
     * The order matters: the spit button is consumed before the projectiles move, so a shot fired this frame
     * travels this frame and does not appear to hang at the bubble's position for one frame first. And the
     * projectiles resolve BEFORE `resolveHazards` below, so a knockback this frame is visible in the same frame's
     * collision test rather than a frame late.
     */
    this.updateStomach(dt, viewport.laneWidthMeters);
    this.updateProjectiles(dt, viewport.laneWidthMeters, min, max);
    /**
     * The gun, beside the spit and for the same two reasons.
     *
     * It resolves before `resolveHazards` below, so a creature driven off by a round this frame is already leaving
     * by the time the hazards move -- otherwise the player would watch a fish they had just finished off take one
     * more bite on its way out. And it fires from the bubble's position as of NOW rather than after the player
     * moves, so the stream comes out of the bubble the player is looking at.
     */
    this.updateBullets(dt, viewport.laneWidthMeters, min, max);
    this.obstacles.update(dt, min, max);

    this.elapsed += dt;
    // The ambience follows the depth every frame: it IS the progress readout. See src/audio.ts.
    //
    // Silenced during the ending. `depth` alone cannot express this -- at the surface it is pinned at
    // 0, which is the LOUDEST setting, so the bed kept playing through the whole results sequence.
    // One-shots (the pop, the splash) still fire; only the continuous bed stops.
    audio.tick(dt);
    audio.setDepth(this.player.depth, DEPTH_TOTAL, this.phase === 'playing');

    /**
     * The charge verb, immediately BEFORE the player moves.
     *
     * Order matters here and only here: the launch sets an impulse, and `player.update` is what turns an impulse
     * into movement. Firing it after would spend a frame with the bubble wound up and going nowhere.
     */
    this.updateCharge();
    this.updateRage(dt);
    /**
     * The burst, read after the charge and before the movement: it is an instant, so where it lands is where the
     * bubble is on the frame of the press, and reading it here keeps that frame the same one the player saw.
     */
    if (this.input.consumeBurst()) this.useBurst();

    this.player.update(this.input, dt, this.lateral);
    /**
     * Convert this frame's screen movement into a world position, then clamp back into the screen band.
     *
     * The clamp is separate from the sync, and that matters: a sync that also re-read `screenY` would undo
     * this frame's movement, which it did -- the bubble refused to move on screen at all.
     *
     * The lead-limit clamp that used to live here is gone, and its absence is the point. It existed to stop
     * a player outrunning the current by holding up, which was only possible because the camera followed
     * them. The camera now ignores the player entirely.
     */
    this.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
    this.player.clampToScreen(this.camera.y, viewport.visibleDepthMeters);

    // Hazards move AFTER the player, so a hazard's contact test uses the position the player is
    // actually at this frame rather than the one it started from.
    this.resolveHazards(dt, min, max, viewport.laneWidthMeters);

    this.updateSkillPickup(dt, min, max, viewport.laneWidthMeters);

    this.fireDepthEvents();

    this.resolveContacts(dt);

    // Skills are edge-triggered and consumed, so a single press costs exactly one use however many
    // frames it spans.
    if (this.input.consumeSkill()) this.useSkill();

    /**
     * The level ends when the SCROLL is done. That is the whole condition.
     *
     * It used to also require every hazard, collectable and skill pickup to be gone, and that was a
     * mistake on two counts. It was slow -- measured, a run reached the end of its scroll at 61.6s and then
     * sat for another 3.8 seconds waiting for the last stragglers to drain out of the water, which reads as
     * the game having frozen at 0. And it was fragile: any entity that could not leave the water would hold
     * the level open forever, which needed a second rule to discard stranded items, which needed a third to
     * keep it honest.
     *
     * The scroll is a level's own progress, so when it finishes the level is over. Nothing else needs to be
     * true.
     */
    if (this.scrolled >= LEVEL.scrollLength) {
      this.reachSurface();
    }

    // Trace the end condition, so a probe can see WHY a level failed to end rather than only that it
    // did. A win condition with five clauses is exactly the kind of thing that reports "still playing"
    // for several possible reasons.
    this.endTrace.push({
      scrolled: +this.scrolled.toFixed(1),
      hazards: this.hazards.hazards.length,
      bubbles: this.field.bubbles.length,
      pickup: this.skillPickup ? 1 : 0,
      emitted: this.timelineEmitted,
      total: TIMELINE.length,
      phase: this.phase,
    });
    if (this.endTrace.length > 8) this.endTrace.shift();
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
  private emitTimelineEntry(entry: LevelEntry, worldY: number, laneWidth: number): void {
    /**
     * ---------------------------------------------------------------------------------------------
     * WHERE IT ARRIVES FROM, which decides the spawn position before anything else
     * ---------------------------------------------------------------------------------------------
     * `top` -- the classic case -- is placed at the top of the view and the current carries it down, so `worldY` is
     * the whole story.
     *
     * The other three need a position that is deliberately OFF the screen, because a creature that appears inside the
     * view has spawned rather than swum in. So: sides are placed outside the lane at a chosen screen height, and
     * `bottom` is placed below the view (and moves up -- see `advance` in src/hazards.ts). The visible range is read
     * HERE rather than being computed by the field, because this is the only place that knows the entry moment.
     */
    const side = entry.from ?? 'top';
    const view = this.camera.visibleWorldRange(0);
    let spawnX = entry.x * laneWidth;
    let spawnY = worldY;
    if (side === 'left' || side === 'right') {
      const off = laneWidth * mech.spawning.offscreenMarginRatio;
      spawnX = side === 'left' ? -off : laneWidth + off;
      spawnY = view.min + (entry.depth ?? mech.spawning.entryDepth) * (view.max - view.min);
    } else if (side === 'bottom') {
      spawnY = view.min - laneWidth * mech.spawning.bottomMarginRatio;
    }
    const entering = side === 'top' ? null : { from: side, speed: entry.enterSpeed ?? mech.spawning.enterSpeedMps };

    // Recorded so a probe can prove content ENTERS from off-screen rather than appearing on screen.
    // A "spawns in the middle" bug is invisible in a screenshot and obvious in these numbers.
    this.spawnLog.push({
      kind: entry.kind,
      from: side,
      x: +spawnX.toFixed(1),
      worldY: +spawnY.toFixed(1),
      visibleTop: +view.max.toFixed(1),
      visibleBottom: +view.min.toFixed(1),
    });
    if (this.spawnLog.length > 12) this.spawnLog.shift();
    this.spawnedBySide[side]++;
    if (entry.kind === 'bubble') {
      this.field.bubbles.push(this.field.bubbleFromEntry({ ...entry, at: spawnY }, laneWidth, stageRadiusFraction(this.stage.stage, this.player.volume)));
      return;
    }
    if (entry.kind === 'skill') {
      // A skill sits where the level put it and drifts down with the water, waiting to be taken.
      this.skillPickup = {
        x: spawnX,
        y: spawnY,
        // The skill is rolled when it is COLLECTED, not when it is created: granting it here would
        // decide the player's next twenty seconds before they had even seen the pickup.
        id: null,
      };
      return;
    }
    /**
     * Anything in the obstacle list IS an obstacle, asked of the list rather than enumerated.
     *
     * The two-kind version of this was kind === 'crate' || kind === 'coral', which is the kind of check that fails
     * quietly: a new obstacle kind would fall through to makeHazard and become a creature with an obstacle's name,
     * which would place, move and collide as a hazard while looking like scenery. Asking OBSTACLE_KINDS means the
     * fall-through cannot happen, because there is nothing left for it to fall through to.
     */
    if (isObstacleKind(entry.kind)) {
      // Scenery only ever drifts in from a side; the loader refuses a `bottom` obstacle, so `entering` here is
      // either null or a horizontal drift whose target is the entry's authored x.
      this.obstacles.spawn(
        entry.kind,
        spawnX,
        spawnY,
        side === 'left' || side === 'right' ? { speed: entry.enterSpeed ?? mech.spawning.enterSpeedMps, targetX: entry.x * laneWidth } : undefined,
      );
      return;
    }
    const hazard = this.makeHazard(entry.kind, spawnX, spawnY, entering);
    this.hazards.hazards.push(hazard);
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
  private updateSkillPickup(dt: number, min: number, max: number, laneWidth: number): void {
    // Held in a local so TypeScript can see it cannot become null between the checks: assigning
    // `this.skillPickup = null` inside the block below widens it back to nullable.
    const pickup = this.skillPickup;
    if (!pickup) return;

    // The pickup is stationary in the water, so the SCROLL is what carries it down past the player.
    // It used to be offset by the player's ascent, which was the same relative motion expressed the
    // other way round; with the player able to hold still, the world has to do the moving.
    pickup.y -= LEVEL.scrollSpeed * dt;
    if (pickup.y < min - 40 || pickup.y > max + 160) {
      this.skillPickup = null;
      return;
    }

    const dx = pickup.x - this.player.x * laneWidth;
    const dy = pickup.y - this.player.y;
    const reach = laneWidth * (stageRadiusFraction(this.stage.stage, this.player.volume) + 0.05);
    if (dx * dx + dy * dy <= reach * reach) {
      // Rolled on COLLECTION. Deciding at placement would commit the player's next twenty seconds
      // before they had even seen the pickup, and would make the level author's choice of WHERE into a
      // choice of WHAT.
      const skill = pickup.id ?? (SKILLS[Math.floor(Math.random() * SKILLS.length)] ?? SKILLS[0]).id;
      this.grantSkill(skill);
      this.skillPickup = null;
    }
  }

  /**
   * Spawn, move and resolve the hazards, applying whatever they did to the player.
   *
   * The effects are applied here rather than inside `HazardField` so that the field stays a pure
   * simulation: it decides what happened, the game decides what that means. That split is what lets
   * a probe drive hazards without a player.
   */
  private resolveHazards(dt: number, min: number, max: number, laneWidth: number): void {
    /**
     * The suction field, recomputed rather than passed down.
     *
     * Cheap (two multiplications) and it keeps this method callable on its own, which matters because probes
     * drive hazards through it. If the two disagreed about where the field is centred, the pull and the collision
     * would be pulling toward different points.
     */
    const suctionAt = this.suctionUp
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
      struggling: this.input.steering,
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
      if (e.eaten) {
        const beforeEating = this.player.volume;
        this.player.volume = growByAbsorbing(this.player.volume, massFromEating(e.kind));
        this.stats.absorbed++;
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
        audio.play('pop');
        continue;
      }

      if (e.damage) {
        for (let i = 0; i < e.damage; i++) this.takeHit();
        // The fish-fart talent fires on the contact that would have hurt, which is what makes it a
        // reflex rather than an action. Its BACKLASH is the point: it shoves the fish off and then
        // leaves bait behind, so the escape is also what feeds the swarm. See src/talents.ts.
        if (this.talentEffects.talent.id === 'fish-fart') this.releaseFart();
      }
      if (e.slowSeconds && e.slowFactor) {
        this.player.applySlow(e.slowSeconds, e.slowFactor);
        audio.play('slow');
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
          (e.impulse / Math.max(1, this.camera.viewport.visibleDepthMeters)) * tuning.hazardCrabLaunchScreenBonus;
        this.player.impulseVy = Math.max(this.player.impulseVy, asScreenFraction);
        this.lastComedyBeat = { what: 'crab', at: this.elapsed };
        // The crab is the one hazard that can HELP, so it gets an upward cue rather than a thud.
        audio.play('crab');
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
   * Grant a skill. Single slot, so this replaces whatever is carried.
   *
   * Returns the skill that was displaced, which the caller may want for a "swapped" hint later.
   */
  /**
   * Grant a skill. Single slot, so this replaces whatever is carried.
   *
   * Returns the skill that was displaced, which the caller may want for a "swapped" hint later.
   */
  private grantSkill(id: SkillId): Skill | null {
    const displaced = this.skill ? findSkill(this.skill.id) : null;
    const skill = findSkill(id);
    this.skill = { id, uses: skill.uses };
    this.hud.setSkillLabel(skill.name, skill.uses);
    // The on-screen button appears only while a skill is carried, so the empty state is genuinely
    // empty rather than a greyed-out control competing for attention.
    this.touch.setHasSkill(true);
    return displaced;
  }

  /**
   * Use the carried skill, if there is one with uses left.
   *
   * The effects are applied HERE rather than inside the skill definition, for the same reason hazard
   * effects are applied by the game: the skill module stays a description of what a skill IS, and the
   * game owns how that lands on the world.
   */
  private useSkill(): boolean {
    if (!this.skill || this.skill.uses <= 0) return false;
    const skill = findSkill(this.skill.id);
    const activation = activationFor(skill.id);
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerX = this.player.x * laneWidth;

    // Lasts of zero mean an instant effect; the player-side timer only takes non-zero ones.
    if (skill.durationSeconds > 0) {
      this.player.skillRemaining = skill.durationSeconds;
      this.player.skillId = skill.id;
    }
    if (activation.ascentMultiplier) {
      this.player.skillAscentBonus = activation.ascentMultiplier;
    }
    if (activation.invulnerableSeconds) {
      this.invulnerable = Math.max(this.invulnerable, activation.invulnerableSeconds);
    }
    if (activation.clearsSlow) {
      this.player.slowRemaining = 0;
      this.player.slowFactor = 1;
      // A trash bag holding on is a "penalty" too, so the stink cloud breaks the grip.
      for (const h of this.hazards.hazards) h.gripping = false;
    }

    // Push hazards out of a radius.
    if (activation.pushRadius && activation.pushKinds) {
      const r = activation.pushRadius;
      for (const h of this.hazards.hazards) {
        if (!activation.pushKinds.includes(h.kind)) continue;
        const dx = h.x - playerX;
        const dy = h.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > r) continue;
        if (dist < 1e-3) {
          // Dead centre: push it somewhere deterministic rather than dividing by zero.
          h.y += r;
          continue;
        }
        const push = (r - dist) / r;
        h.x += (dx / dist) * push * r * 0.6;
        h.y += (dy / dist) * push * r * 0.6;
      }
    }

    // Draw collectables in, which is the vortex's whole job.
    if (activation.vortexRadius && activation.vortexSeconds) {
      const r = activation.vortexRadius;
      for (const b of this.field.bubbles) {
        const dx = playerX - b.x;
        const dy = this.player.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > r || dist < 1e-3) continue;
        const pull = Math.min(1, (skillTuning.vortexPullPerSecond * activation.vortexSeconds) / Math.max(1, dist / r));
        b.x += dx * pull * 0.35;
        b.y += dy * pull * 0.35;
      }
    }

    // Divert fish to a bait bubble. This is the decoy's entire effect: it does not kill anything, it
    // redirects.
    if (activation.decoyRadius && activation.decoySeconds) {
      const r = activation.decoyRadius;
      const baitY = this.player.y + r * 0.35;
      for (const h of this.hazards.hazards) {
        if (h.kind !== 'fish') continue;
        if (Math.hypot(h.x - playerX, h.y - this.player.y) > r) continue;
        // Baited for the whole duration, and pointed at the bait rather than at the player. Re-using
        // the existing bait timer means the fish's own chase logic does the work.
        h.baitedUntil = this.elapsed + activation.decoySeconds;
        h.y = Math.min(h.y, baitY);
      }
      this.decoy = { x: playerX, y: baitY, until: this.elapsed + activation.decoySeconds };
    }

    this.skill.uses -= 1;
    if (this.skill.uses <= 0) {
      this.skill = null;
      this.hud.setSkillLabel(null, 0);
      this.touch.setHasSkill(false);
    } else {
      this.hud.setSkillLabel(skill.name, this.skill.uses);
    }
    this.skillActivations++;
    audio.play('skill');
    return true;
  }

  /**
   * The 鱼屁泡 talent's reflex: shove nearby fish off, then leave bait behind.
   *
   * The two halves are inseparable -- that is the design principle ("your survival mechanism is the
   * enemy's breeding mechanism"). The push makes it worth having; the bait is what it costs. A version
   * that only pushed would be a free escape, and a version that only left bait would be a punishment
   * with no upside.
   */
  private releaseFart(): void {
    if (this.elapsed < this.fartReadyAt) return;
    this.fartReadyAt = this.elapsed + talentTuning.fartCooldownSeconds;
    this.farts++;

    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerX = this.player.x * laneWidth;
    const r = talentTuning.fartRadiusMeters;

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
    audio.play('fart');
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
  private fireDepthEvents(): void {
    const depth = this.player.depth;
    for (const [i, mark] of (LEVEL.landmarks ?? []).entries()) {
      if (this.eventsFired.has(i)) continue;
      if (depth > mark.depth) continue; // landmarks are measured from the surface, so depth DECREASES
      this.eventsFired.add(i);
      this.fireEvent(i, mark.label);
    }
  }

  private fireEvent(index: number, label: string): void {
    this.eventsSeen++;
    this.lastEvent = { label, at: this.elapsed };

    // A banner and a sound for each beat. No hazards: the level's timeline already placed them, and the
    // job here is to tell the player what they are swimming into.
    this.runBanner.text = `${label}  ·  ${EVENT_CALLOUTS[index] ?? ''}`.trim();
    this.runBanner.alpha = 1;
    audio.play('skill');
  }

  /**
   * Build a hazard of a given kind at a given place.
   *
   * The scripted events need this: `HazardField.spawn` picks a random kind and position for ambient
   * pressure, which is the opposite of what a scripted beat wants.
   */
  private makeHazard(kind: HazardKind, x: number, y: number, entry: Hazard['entry'] = null) {
    const radiusFraction = KIND_TUNING[kind].radius;
    const health = hazardHealth(kind);
    return {
      id: -Math.floor(Math.random() * 1e9),
      kind,
      /**
       * Clamped into the lane ONLY when it is not arriving.
       *
       * A side entry is placed outside the lane on purpose, so clamping it here would put it exactly on the edge --
       * which is the one place the player would see it appear. The entry motion is what brings it inside.
       */
      x: entry ? x : Math.max(0, Math.min(this.camera.viewport.laneWidthMeters, x)),
      y,
      radiusFraction,
      phase: Math.random() * Math.PI * 2,
      seed: Math.random() * 1000,
      baitedUntil: 0,
      squashed: 0,
      gripping: false,
      gripSeconds: 0,
      fuse: kind === 'crab' ? hazardTuning.crabFuseSeconds : 0,
      fired: false,
      armed: false,
      fed: 0,
      digest: 0,
      entry,
      health,
      maxHealth: health,
      flee: null,
    };
  }

  /**
   * Handling for every collectable contact, in one place so both outcomes (eat / bounce) are
   * visible side by side.
   *
   * `bigger eats smaller` is the whole rule. The player's radius is its hitbox, so growing makes
   * absorbing easier and being hit easier in the same motion -- that is the built-in cost.
   */
  private resolveContacts(dt: number): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
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
      audio.play('hit');
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
        this.runBanner.text = `怒气释放  ·  撞碎了${obstacleName(contact.hit.kind)}`;
        this.runBanner.alpha = 1;
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
        // Big enough: absorb it. The cue's pitch rises with the bubble's size, so a big one announces
        // itself without any UI.
        this.player.volume = growByAbsorbing(this.player.volume, b.volume);
        this.stats.absorbed++;
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
          this.runBanner.text = `${stageName(this.stage.stage)}  ·  ${this.stage.stage} 阶段  ·  速度 ×${this.stage.speedMultiplier.toFixed(2)}`;
          this.runBanner.alpha = 1;
          this.bannerSeen = true;
          audio.play('skill');
        }
        eaten++;
        audio.play('absorb', Math.min(1, bubbleR / Math.max(1e-6, playerR)));
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
   * Land one hit on the bubble.
   *
   * The single place a hit is applied, which is what makes "digesting hurts more" a one-line rule rather than a
   * condition that has to be repeated at every source of damage. A hazard, an obstacle, a trash bag's drain and
   * the debug forge all arrive here.
   */
  private takeHit(): void {
    this.stats.hits++;
    audio.play('hit');
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
    for (let i = 0; i < hitPoints; i++) {
      this.player.volume = shrinkFromHit(this.player.volume, this.player.shrinkResistance);
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

  /** The bubble pops: slow-motion burst, then a brief result card, then a fresh run. */
  private startBurst(): void {
    this.phase = 'burst';
    this.phaseTimer = BURST_SECONDS;
    this.stats.ended++;
    this.recordBest();
    audio.play('pop');
    this.runBanner.text = `破裂  ·  深度 ${Math.round(this.player.depth)}m  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×`;
    this.runBanner.alpha = 1;
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
  private updateCharge(): void {
    if (!hasVerb(this.bubbleType, 'charge')) return;

    const held = this.input.charging;
    if (!this.input.consumeChargeRelease() && held) {
      /**
       * Winding up: the aim follows whichever hand is pointing, and freezes when nothing is.
       *
       * Two producers, one number, the same shape the movement axes had: the keyboard's axis while a direction
       * key is held, otherwise the touch drag's direction from where the finger landed. On a phone that gives the
       * whole verb -- drag to point, hold the button to wind up, let the finger off the drag so nothing overwrites
       * `chargeAim` any more, then release the button to slam.
       */
      if (this.input.axisX !== 0 || this.input.axisY !== 0) {
        this.chargeAim = { x: this.input.axisX, y: this.input.axisY };
      } else if (this.input.dragAimX !== 0 || this.input.dragAimY !== 0) {
        this.chargeAim = { x: this.input.dragAimX, y: this.input.dragAimY };
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
    audio.play('crab');
  }

  /**
   * Rage: gain is event-driven (see `takeHit`), and this is the clock.
   *
   * Only the decay needs a frame. The devour bubble has no rage at all, and this returning immediately is what keeps
   * the second resource from costing the first type anything.
   */
  private updateRage(dt: number): void {
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
      this.runBanner.text = `失控  ·  ${mech.angry.overload.seconds.toFixed(1)} 秒内把怒气放掉`;
      this.runBanner.alpha = 1;
      audio.play('slow');
    }
    if (overloadExpired) this.punishOverload();
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
  private punishOverload(): void {
    const before = this.player.volume;
    let hits = 0;
    for (let i = 0; i < mech.angry.overload.punishHits; i++) {
      // Stop while one hit point remains: see the note above.
      if (hitsSurvived(this.player.volume) <= 1) break;
      this.player.volume = shrinkFromHit(this.player.volume, this.player.shrinkResistance);
      hits++;
    }
    this.stats.overloads++;
    this.runBanner.text = `怒气失控  ·  体积 ${before.toFixed(2)} → ${this.player.volume.toFixed(2)}`;
    this.runBanner.alpha = 1;
    audio.play('pop');
  }

  private startRun(): void {
    this.player.reset();
    /**
     * Back to stage 1, and push its speed into the player.
     *
     * `player.reset()` clears `stageSpeedMultiplier` to 1, which happens to match stage 1 -- but relying on
     * that coincidence would break the moment the config's first multiplier is not 1.
     */
    this.stage = initialStageState();
    this.player.stageSpeedMultiplier = this.stage.speedMultiplier;
    // A new run must not begin holding the previous run's ammunition, nor its projectiles in flight.
    this.stomach.reset();
    this.projectiles.length = 0;
    // Nor with the previous run's rounds in the air, which would be free shots nobody asked for.
    this.bullets.reset();
    this.spitCooldown = 0;
    this.spitHits = 0;
    /**
     * Digestion state is per-run, and `growthEnergy` especially so.
     *
     * The eating rank it buys is the run's own progress; carrying it across a death would make the restart
     * strictly easier than the run that ended, which is the same reason skills and talents reset here.
     */
    this.growthEnergy = 0;
    this.compressing = false;
    this.digested = 0;
    this.digestedMass = 0;
    this.internalHits = 0;
    this.destroyedMass = 0;
    this.spitClogs = 0;
    /**
     * The volatile bubble's run state, reset with everything else.
     *
     * `chargeAim` deliberately keeps its old value: a player who died mid-wind-up and restarts should not have to
     * re-aim before their first slam, and there is nothing a stale direction can be wrong about -- it is overwritten
     * the moment they push the stick.
     */
    this.rage = initialRageState();
    this.charging = false;
    this.slamSeconds = 0;
    this.slams = 0;
    this.obstacles.reset();
    this.field.reset();
    this.hazards.reset();
    /**
     * Reset the SCROLL, which is the level's own progress and is not owned by anything else.
     *
     * Found by a bug report: "start the game and it suddenly becomes 130m, then ends." Both symptoms
     * came from this one omission. `scrolled` kept the finished run's value of 1500, so on the next
     * run the camera ceiling was already at 1630; that pinned the player there, which made the headline
     * (`length - y`) read -130, and the win condition (`scrolled >= length`) was true on the first frame
     * of play. It only appeared after a restart, because a fresh page has `scrolled` at 0 -- which is
     * exactly why the boot path looked fine.
     */
    this.scrolled = 0;
    this.timelineEmitted = 0;
    this.endTrace.length = 0;
    this.spawnLog.length = 0;
    this.spawnedBySide = { top: 0, left: 0, right: 0, bottom: 0 };
    this.trashDrain = 0;
    this.stomachDrain = 0;
    this.comedyBeats = 0;
    this.lastComedyBeat = null;
    // Skills and talents are per-run state: carrying a skill across a death would make the restart
    // strictly easier than the run that just ended.
    this.skill = null;
    this.skillPickup = null;
    this.skillActivations = 0;
    this.decoy = null;
    this.fartReadyAt = 0;
    this.farts = 0;
    this.eventsFired = new Set();
    this.eventsSeen = 0;
    this.lastEvent = null;
    this.splash = 0;
    this.surfaced = false;
    this.touch.setHasSkill(false);
    this.hud.setSkillLabel(null, 0);
    this.elapsed = 0;
    this.phase = 'intro';
    this.phaseTimer = INTRO_SECONDS;
    this.invulnerable = 0;
    this.stats = { absorbed: 0, hits: 0, maxVolume: this.talentEffects.startVolume, ended: this.stats.ended, overloads: this.stats.overloads, newRecord: false };
    this.rollSeed();
    this.rollTalent();
  }

  /**
   * Roll this run's talent and apply it to the player.
   *
   * Applied through `resolveTalent` rather than by scattering conditionals: every talent's effect is
   * a small set of multipliers, so a new one is a row in `talents.ts` rather than a branch here.
   */
  private rollTalent(): void {
    this.talentEffects = resolveTalent(pickTalent());
    this.player.ascentBonus = this.talentEffects.ascentMultiplier;
    this.player.steerScale = this.talentEffects.steerMultiplier;
    this.player.shrinkResistance = this.talentEffects.shrinkResistance;
    // Volume is set AFTER `player.reset()` above, which zeroes it back to 1.
    this.player.volume = this.talentEffects.startVolume;
    this.stats.maxVolume = this.talentEffects.startVolume;
    this.hud.setTalentLabel(this.talentEffects.talent.name);
  }

  /**
   * Open the settings panel and freeze the level.
   *
   * The phase is REMEMBERED rather than assumed to be `playing`: opening the panel during the birth intro or
   * during the ending is legitimate, and restoring to `playing` would skip the rest of whichever animation was
   * interrupted.
   *
   * Called BY the settings module when its gear is tapped -- `SettingsUi.handlePointerDown` returns true and
   * this runs from the tap -- so it is not called from the pointer handler directly.
   */
  private openSettings(): void {
    // The codex is excluded with the menu: it is a full-screen page reached FROM the menu, so there is no run to
    // pause behind it and its gear would be a button onto itself.
    if (this.phase === 'paused' || this.phase === 'menu' || this.phase === 'codex') return;
    this.phaseBeforePause = this.phase;
    this.phase = 'paused';
    // Any finger that was steering is forgotten, or releasing it later would resume a drag the player has
    // already mentally abandoned.
    this.touch.releaseAll();
    this.settings.setVolume(audio.getVolume());
    this.settings.setOpen(true);
  }

  /** Close the panel and resume whichever phase it interrupted. */
  private closeSettings(): void {
    if (this.phase !== 'paused') return;
    this.settings.setOpen(false);
    this.phase = this.phaseBeforePause;
  }

  /**
   * Restart the current level from the beginning.
   *
   * Goes through `startRun`, the same path a death or a surface finish takes, so there is one definition of
   * "a fresh run" rather than a second one that drifts.
   */
  private restartLevel(): void {
    this.closeSettings();
    this.startRun();
  }

  /** Leave the level and show the main menu. */
  private exitToMenu(): void {
    this.settings.setOpen(false);
    this.phase = 'menu';
    this.touch.releaseAll();
    /**
     * Stop the ambience explicitly.
     *
     * `step` returns before it reaches `audio.setDepth` while on the menu, so nothing else would ever tell the
     * bed to stop -- it kept playing over the menu at the level it had when the player quit.
     */
    audio.silenceAmbience();
    this.menu.root.visible = true;
  }

  /** Leave the menu and begin a run, as the chosen bubble. */
  /**
   * Put the level ladder on the menu: the pills, the selection, and the note under them.
   *
   * One function because the three have to agree. The note says what the row cannot: why a level is locked ("通关 X
   * 之后解锁") or that one has just opened, and the two cases are mutually exclusive -- an unlock message that was left
   * on screen while the row showed a locked level would be a menu contradicting itself.
   */
  private refreshLevelMenu(): void {
    this.menu.setLevels(this.progress.entries());
    const locked = this.progress.entries().find((l) => l.locked);
    if (locked) {
      const index = levelIndex(locked.id);
      const previous = LEVELS[index - 1];
      this.menu.setLevelNote(previous ? `通关「${previous.name}」后解锁「${locked.name}」` : '', false);
    } else {
      this.menu.setLevelNote('');
    }
  }

  private enterFromMenu(typeId: string): void {
    this.menu.root.visible = false;
    this.setBubbleType(typeId);
    this.startRun();
  }

  /**
   * Choose the bubble for the run.
   *
   * Two things happen, and both have to happen before the first frame: the type is recorded, and the touch layer is
   * told which controls to lay out. Doing the second here rather than every frame is the point of the abstraction --
   * the control set is fixed for a run, so nothing downstream ever asks which buttons exist.
   */
  private setBubbleType(typeId: string): void {
    this.bubbleType = findBubbleType(typeId) ?? defaultBubbleType();
    this.touch.setControls(this.bubbleType.controls);
    this.touch.layout(
      this.camera.viewport.left,
      this.camera.viewport.laneWidthPx,
      this.app.renderer.screen.width,
      this.app.renderer.screen.height,
      this.camera.viewport.scale,
    );
  }

  /**
   * Open the codex from the menu.
   *
   * Deliberately NOT reachable mid-run: the codex is reference, and a page of reading is not something a player
   * should be able to open while a fuse is burning. The pause panel is where "I need to look something up" belongs,
   * and it already freezes the simulation.
   */
  private enterCodex(): void {
    this.phase = 'codex';
    this.codex.show();
  }

  /** Leave the codex, back to the menu. */
  private exitCodex(): void {
    this.phase = 'menu';
    this.menu.root.visible = true;
  }

  private reachSurface(): void {
    this.phase = 'burst';
    // Longer than a death: the surface is a reward, not a failure, and the design asks for a beat of
    // held breath before the pop. See the spec's 终点 section.
    this.phaseTimer = SURFACE_SECONDS;
    this.surfaced = true;
    this.stats.ended++;
    this.recordBest();
    audio.play('surface');
    this.splash = 1;
    this.runBanner.text = `你变成了海面上的一朵浪花  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×  ·  ${this.elapsed.toFixed(1)}s`;
    this.runBanner.alpha = 1;
    this.finishBanner.alpha = 1;
    this.bannerSeen = true;
    /**
     * Clearing the level, which is what unlocks the next one.
     *
     * Recorded HERE rather than where the results are shown, because this is the moment the player earned it -- and so
     * that a level reached by any route unlocks the next one the same way. `clear` returns the level it opened, if
     * any, and the banner NAMES it: an unlock that only shows up as a pill changing colour on a menu the player is not
     * looking at is an unlock nobody notices.
     */
    const unlocked = this.progress.clear(LEVEL.id);
    if (unlocked) {
      const opened = LEVELS.find((l) => l.id === unlocked);
      this.runBanner.text += `\n新关卡解锁：${opened?.name ?? unlocked}`;
      this.refreshLevelMenu();
    }
  }

  /**
   * Keep the best run, so the results card has something to beat.
   *
   * Best by DEPTH REACHED, not by survival time: the game is about climbing, and a run that got
   * further is strictly better regardless of how long it took. The design's headline score is max
   * volume, so both are kept and shown -- depth is the one that is comparable across talents.
   */
  private recordBest(): void {
    const depthReached = DEPTH_TOTAL - this.player.depth; // metres climbed
    if (depthReached > this.bestClimbed) {
      this.bestClimbed = depthReached;
      this.bestVolume = Math.max(this.bestVolume, this.stats.maxVolume);
      this.stats.newRecord = true;
    } else {
      this.stats.newRecord = false;
    }
    this.bestVolume = Math.max(this.bestVolume, this.stats.maxVolume);
  }

  private render(dt: number): void {
    this.scene.update(this.camera, this.player, dt, this.scrolled);

    /**
     * The HUD and the water are hidden on the menu AND on the codex page.
     *
     * Both draw an opaque backdrop, so leaving them visible underneath would only cost fill rate -- but the HUD also
     * reports a live depth for a level that is not running, which is worse than wasteful.
     */
    const fullScreenPage = this.phase === 'menu' || this.phase === 'codex';
    const inMenu = this.phase === 'menu';
    this.hud.root.visible = !fullScreenPage;
    this.scene.root.visible = !fullScreenPage;
    // The water controls hide on those pages and behind the settings panel. The touch layer decides for itself
    // whether the skill button is drawn; this only decides whether the layer exists at all.
    this.touch.root.visible = !fullScreenPage && !this.settings.isOpen;
    this.flash.visible = this.flash.visible && !fullScreenPage;

    if (!fullScreenPage) {
      this.hud.update(this.player, this.fps, this.nominalSeconds, this.elapsed, this.lateral, this.scrolled, {
        stage: this.stage.stage,
        name: stageName(this.stage.stage),
        absorbedInStage: this.stage.absorbedInStage,
        neededForNext: this.stage.neededForNext,
        tierBonus: this.tierBonus,
        /**
         * The second resource's readout, for the type that has one.
         *
         * The line AND the bar. It started as the line alone, on the argument that a bar is worth building when there
         * is something to spend rage on -- and the burst is exactly that: "how much have I got" becomes a question
         * with a threshold in it ("is that enough to clear this screen?"), which a number answers slowly and a bar
         * answers at a glance.
         */
        resource: this.bubbleType.resource
          ? {
              label: this.bubbleType.resource.label,
              /**
               * The countdown rides on the resource line while it runs.
               *
               * "失控 3.2" rather than a separate warning: the number that matters during overload is how long is
               * left, and it belongs beside the gauge it is counting down. The bar underneath empties or not
               * independently -- it shows the rage, this shows the clock.
               */
              text: this.overloaded
                ? `${Math.round(this.rage.rage)}  ${rageStageName(this.rage.rage)}  ${this.rage.overloadLeft.toFixed(1)}s`
                : `${Math.round(this.rage.rage)}  ${rageStageName(this.rage.rage)}`,
              colour: rageColor(this.rage.rage),
              fraction: rageFraction(this.rage.rage),
            }
          : null,
      });
      this.touch.update();
      this.drawPickups();
      this.drawBubble();
    }

    // The gear must not be reachable while a full-screen page is up, and the panel goes with it.
    this.settings.root.visible = !fullScreenPage;
    this.settings.update();
    this.menu.root.visible = inMenu;
    if (inMenu) this.menu.update(dt);
    // The codex draws nothing per frame: a tab press, a page turn and a resize each schedule their own redraw.
    this.codex.root.visible = this.phase === 'codex';
    // Both banners decay in render; `step` only seeds their alpha, because a transient message
    // that is set and faded in the same frame would never be visible.
    const decay = dt * 0.6;
    this.finishBanner.alpha = this.phase === 'burst' && this.finishBanner.alpha > 0
      ? Math.max(0, this.finishBanner.alpha - decay)
      : this.finishBanner.alpha;
    this.runBanner.alpha = Math.max(0, this.runBanner.alpha - dt * 0.28);
    if (this.finishBanner.alpha <= 0.01 && this.phase !== 'burst') this.finishBanner.alpha = 0;

    /**
     * The results card, rebuilt continuously while the run is ending.
     *
     * Rewritten every frame rather than set once, because the RECORD comparison is against a best that
     * `recordBest` has already updated -- so the card has to say "new record" from a flag captured at
     * the moment the run ended, not by re-comparing against a best that now includes this run.
     */
    if (this.phase === 'burst') {
      this.finishBanner.text = this.surfaced
        ? `冲破海面  ·  爬升 ${Math.round(DEPTH_TOTAL - this.player.depth)}m\n吸收 ${this.stats.absorbed}  ·  最大 ${this.stats.maxVolume.toFixed(1)}×  ·  ${this.elapsed.toFixed(1)}s\n${this.stats.newRecord ? '★ 新纪录' : `最好 ${Math.round(this.bestClimbed)}m`}`
        : `破裂  ·  深度 ${Math.round(this.player.depth)}m\n吸收 ${this.stats.absorbed}  ·  爬升 ${Math.round(DEPTH_TOTAL - this.player.depth)}m\n${this.stats.newRecord ? '★ 新纪录' : `最好 ${Math.round(this.bestClimbed)}m`}`;
    }

    /**
     * The surface white-out: a short, hard flash that fades.
     *
     * Deliberately fast and short. The design asks for a "short white screen" as a beat between
     * breaking through and reading the results -- long enough to feel like a transition, short enough
     * that it never reads as a loading screen. A death gets no flash at all, which is what makes the
     * two endings feel different in the hands.
     */
    if (this.splash > 0) {
      this.splash = Math.max(0, this.splash - dt * 1.5);
      this.flash.alpha = Math.min(1, this.splash * 1.6);
      this.flash.visible = this.flash.alpha > 0.01;
    } else if (this.flash.visible) {
      this.flash.visible = false;
    }
  }

  /** Collectables and decoration, drawn in world metres. */
  private drawPickups(): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const g = this.pickups;
    g.clear();

    for (const b of this.field.bubbles) {
      const r = laneWidth * b.radius;
      // Lateral wobble: small bubbles shimmy, large ones hold their shape. Cosmetic, and small
      // enough that it never changes when a bubble passes the player.
      const drift = Math.sin(b.phase) * r * b.wobble;
      const x = b.x + drift;
      // Bigger bubbles are brighter; anything bigger than the player reads as a threat.
      const playerR = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
      const edible = playerR >= r * 0.92;
      const tint = edible ? 0xaef2ff : 0xffd479;
      // Edible ones read as soft watery beads; the inedible minority gets a hard rim and a warmer
      // tint so "do not touch" is legible at a glance in a busy screen.
      g.circle(x, b.y, r).fill({ color: tint, alpha: edible ? 0.3 : 0.34 });
      g.circle(x - r * 0.3, b.y + r * 0.3, r * 0.68).fill({ color: 0xeafcff, alpha: 0.16 });
      g.circle(x, b.y, r).stroke({ color: tint, alpha: edible ? 0.6 : 0.95, width: r * (edible ? 0.09 : 0.16) });
    }
    // Specks, one shape each, in two fills.
    //
    // NOT batched into a single `poly()`. That was tried and it is wrong: `poly()` builds ONE path, so
    // listing every speck's vertices joined the specks together and drew slabs across the whole
    // screen. Pixi 8 has no multi-circle call, and the geometry here is not the bottleneck anyway --
    // the frame cost is rasterisation, so trading correctness for fewer path segments bought nothing.
    for (const s of this.field.specks) {
      if (s.drift > 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xeafcff, alpha: 0.34 });
    for (const s of this.field.specks) {
      if (s.drift <= 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xdff6ff, alpha: 0.18 });

    // Hazards last in this layer, so they sit on top of the water and the collectables. They are the
    // things the player must READ, so nothing should be drawn over them.
    //
    // `canEat` is the same function the collision uses, asked again here to draw the edibility marker. One
    // source of truth on purpose: a marker that promised food while the collision delivered a hit would be the
    // worst bug this feature could have, because it would punish the player for trusting what they saw.
    paintHazards(g, this.hazards, laneWidth, this.elapsed, (kind) => this.canSwallow(kind), 'in-play');

    /**
     * The ones on their way out, in their own pass so they can be dimmed as a whole.
     *
     * `hazards.fleeAlpha` on the layer rather than a faded copy of every fill: a creature that has been driven off
     * is the SAME creature, and "the same drawing, at 42%" is a rule that cannot drift as the creatures are
     * redrawn. It is also what makes the difference legible at a glance in a busy screen -- which of these is still
     * a threat, and which is already leaving.
     */
    this.leaving.alpha = mech.hazards.fleeAlpha;
    const leavingG = this.leaving;
    leavingG.clear();
    paintHazards(leavingG, this.hazards, laneWidth, this.elapsed, (kind) => this.canSwallow(kind), 'leaving');

    /**
     * Obstacles, UNDER the hazards.
     *
     * They are scenery: a fish swimming in front of a crate has to stay visible, because the fish is what will
     * hurt you. The crate only matters when you are about to hit it.
     */
    paintObstacles(g, this.obstacles, laneWidth);

    /**
     * The suction field, drawn UNDER everything else in the water.
     *
     * Under, because it is an area rather than an object: drawing it over the collectables would obscure the
     * things it is about to drag in, which is the opposite of what a gathering mechanic needs. Two rings that
     * contract toward the bubble, animated rather than static, so the direction of the pull is legible even when
     * nothing is currently in range to demonstrate it.
     */
    if (this.suctionUp) {
      const cx = this.player.x * laneWidth;
      const cy = this.player.y;
      /**
       * Over capacity, the field runs away with itself: a bigger radius that drags in MORE than the player can
       * eat. That is the punishment mixed with temptation -- you cannot help pulling things toward a mouth that is
       * already full, which is exactly the pressure the design's over-eating state is supposed to create.
       */
      const overloadBonus = this.stomach.overloaded ? mech.spit.overloadSuctionFactor : 1;
      const reach = laneWidth * suctionRadiusFraction(this.player.volume) * overloadBonus;
      g.circle(cx, cy, reach).fill({ color: mech.suction.fieldColor, alpha: mech.suction.fieldAlpha * 0.35 });
      g.circle(cx, cy, reach).stroke({
        color: mech.suction.fieldColor,
        alpha: mech.suction.fieldAlpha,
        width: Math.max(1, laneWidth * mech.suction.fieldWidthRatio),
      });
      // Inward-travelling rings: each one starts at the rim and converges, which reads as flow.
      for (let i = 0; i < 2; i++) {
        const t = ((this.elapsed * 0.9 + i * 0.5) % 1 + 1) % 1;
        const r = reach * (1 - t * 0.75);
        g.circle(cx, cy, r).stroke({
          color: mech.suction.fieldColor,
          alpha: mech.suction.fieldAlpha * 0.8 * t,
          width: Math.max(1, laneWidth * mech.suction.fieldWidthRatio * 0.6),
        });
      }
    }

    /**
     * The gun's rounds, drawn UNDER the thrown hazards.
     *
     * Under, because a spat crab is a bigger, more important thing than a stream of small bubbles and the player
     * needs to read it; the two are on screen together constantly, so the order has to be decided rather than left
     * to whichever loop ran last.
     */
    paintBullets(g, this.bullets, laneWidth);

    /**
     * Projectiles, drawn IN FLIGHT from the stomach.
     *
     * Each keeps the silhouette of the hazard it was, tinted with a hot rim so a flying crab is legible as
     * *something the player threw* rather than as a crab that happens to be moving fast. That distinction matters:
     * one is a threat and the other is the player's own ammunition, and they can be on screen together.
     */
    for (const p of this.projectiles) {      const r = laneWidth * p.radiusFraction;
      const fade = Math.max(0, 1 - p.age / (mech.spit.decaySeconds * 4));
      g.circle(p.x, p.y, r * mech.spit.glowRadiusRatio).fill({ color: 0xffd479, alpha: mech.spit.glowAlpha * 0.25 * fade });
      // A short trail behind it, back along its own velocity, so the direction of travel is unmistakable.
      const trail = r * mech.spit.trailWidthRatio * 3;
      const speed = Math.hypot(p.vx, p.vy) || 1;
      g.moveTo(p.x, p.y)
        .lineTo(p.x - (p.vx / speed) * trail, p.y - (p.vy / speed) * trail)
        .stroke({ color: 0xffd479, alpha: mech.spit.trailAlpha * fade, width: r * mech.spit.trailWidthRatio });
      // The body, in the kind's own shape so it still reads as what it was.
      if (p.kind === 'jelly') {
        g.ellipse(p.x, p.y, r, r * 0.8).fill({ color: KIND_TUNING.jelly.colour, alpha: 0.75 });
      } else if (p.kind === 'trash') {
        g.rect(p.x - r, p.y - r, r * 2, r * 2).fill({ color: 0x6d5232, alpha: 0.8 });
      } else if (p.kind === 'crab') {
        g.ellipse(p.x, p.y, r * 1.2, r * 0.8).fill({ color: KIND_TUNING.crab.colour, alpha: 0.85 });
      } else if (p.kind === 'urchin') {
        // A spinning spiked ball: the same silhouette it had in the water, so a thrown urchin is legible as the
        // thing that was bleeding you a moment ago.
        const spin = p.age * 9;
        g.circle(p.x, p.y, r * 0.9).fill({ color: KIND_TUNING.urchin.colour, alpha: 0.6 });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + spin;
          g.moveTo(p.x + Math.cos(a) * r * 0.7, p.y + Math.sin(a) * r * 0.7)
            .lineTo(p.x + Math.cos(a) * r * 1.5, p.y + Math.sin(a) * r * 1.5);
        }
        g.stroke({ color: KIND_TUNING.urchin.colour, alpha: 0.95, width: r * 0.18 });
      } else if (p.kind === 'bombfish') {
        /**
         * A round body with a burning fuse, and here the fuse IS drawn lit.
         *
         * Deliberately the opposite of the loose creature, which shows no spark: while it is inside you the
         * countdown is the danger, and once it is in the air the countdown no longer matters -- what matters is
         * that the thing in flight is a bomb about to go off, so it reads as one.
         */
        g.ellipse(p.x, p.y, r * 1.25, r * 1.1).fill({ color: KIND_TUNING.bombfish.colour, alpha: 0.9 });
        const spark = 0.5 + 0.5 * Math.sin(p.age * 26);
        g.moveTo(p.x, p.y + r * 1.0)
          .lineTo(p.x + r * 0.25, p.y + r * 1.7)
          .stroke({ color: 0x8a7a5c, alpha: 0.9, width: r * 0.16 });
        g.circle(p.x + r * 0.25, p.y + r * 1.8, r * (0.18 + 0.12 * spark)).fill({ color: 0xffe066, alpha: 0.9 });
      } else {
        g.ellipse(p.x, p.y, r * 1.5, r * 0.75).fill({ color: KIND_TUNING.fish.colour, alpha: 0.85 });
      }
      g.circle(p.x, p.y, r * 1.15).stroke({ color: 0xffd479, alpha: 0.9 * fade, width: r * 0.22 });
    }

    // The decoy bait bubble, while it lasts. Drawn like a bright collectable, because that is what it
    // is imitating -- the fish are supposed to fall for it.
    if (this.decoy && this.decoy.until > this.elapsed) {
      const r = laneWidth * 0.052;
      g.circle(this.decoy.x, this.decoy.y, r).fill({ color: 0xc9ffe8, alpha: 0.4 });
      g.circle(this.decoy.x, this.decoy.y, r).stroke({ color: 0x9dffd8, alpha: 0.95, width: r * 0.16 });
      g.circle(this.decoy.x, this.decoy.y, r * 1.5).stroke({ color: 0x9dffd8, alpha: 0.3, width: r * 0.08 });
    } else if (this.decoy) {
      this.decoy = null;
    }

    // A skill lying in the water: a diamond, distinct from every collectable, with a halo so it
    // reads as "pick me up" rather than as another bubble.
    if (this.skillPickup) {
      const p = this.skillPickup;
      const r = laneWidth * 0.045;
      const pulse = 1 + Math.sin(this.elapsed * 3.4) * 0.12;
      g.circle(p.x, p.y, r * 2.1 * pulse).fill({ color: 0xc79bff, alpha: 0.13 });
      g.moveTo(p.x, p.y - r * pulse)
        .lineTo(p.x + r * pulse, p.y)
        .lineTo(p.x, p.y + r * pulse)
        .lineTo(p.x - r * pulse, p.y)
        .closePath()
        .fill({ color: 0xe8d6ff, alpha: 0.9 });
      g.moveTo(p.x, p.y - r * pulse)
        .lineTo(p.x + r * pulse, p.y)
        .lineTo(p.x, p.y + r * pulse)
        .lineTo(p.x - r * pulse, p.y)
        .closePath()
        .stroke({ color: 0xffffff, alpha: 0.75, width: r * 0.14 });
    }
  }

  /** The player's bubble, in world metres. */
  private drawBubble(): void {
    const viewport = this.camera.viewport;
    // Intro: the bubble is born at the seabed and inflates.
    const growth = this.phase === 'intro' ? 1 - Math.max(0, this.phaseTimer) / INTRO_SECONDS : 1;
    const eased = growth * growth * (3 - 2 * growth); // smoothstep

    // Burst: the bubble expands and fades instead of vanishing.
    const burstT = this.phase === 'burst' ? 1 - Math.max(0, this.phaseTimer) / BURST_SECONDS : 0;
    const burstScale = 1 + burstT * 1.8;
    const burstAlpha = this.phase === 'burst' ? Math.max(0, 1 - burstT * 1.15) : 1;

    const radius =
      viewport.laneWidthMeters * stageRadiusFraction(this.stage.stage, this.player.volume) * (0.25 + 0.75 * eased) * burstScale *
      /**
       * The overload's enlargement, applied to the DRAWN radius because it is applied to the hitbox.
       *
       * The project's rule is that the bubble is exactly as big as it looks, and the overload is the one state where
       * the envelope itself grows -- so this is not a decoration beside the collision number, it IS the collision
       * number, read from the same config key. `bubbleSwell` below is the other kind of change: a breathing that is
       * deliberately drawing-only.
       */
      (this.overloaded ? 1 + mech.angry.overload.radiusBonus : 1);

    /**
     * The volatile bubble's two drawing-only cues: a tremor and a breath.
     *
     * Applied to the PAINTED position and radius, never to the collision radius -- see `bubbleSwell` for why that
     * distinction is the honest one rather than a shortcut. Both are zero for the devour bubble, so this costs that
     * type one multiplication by one.
     */
    const look = bubbleLook(this.bubbleType, this.stage.stage, this.rage.rage);
    const drawnX = this.player.x * viewport.laneWidthMeters + bubbleShake(look, this.elapsed) * viewport.laneWidthMeters;
    const drawnRadius = radius * bubbleSwell(look, this.elapsed);

    /**
     * The burst's wave: an expanding ring that means "this is how far it reached".
     *
     * Drawn from where the bubble was when it fired -- which is where it still is, since the wave lasts a third of a
     * second and the ring is measured from the player's own position -- and drawn under the bubble, on its own
     * layer. The effects all landed on the frame of the press; this is the receipt.
     */
    this.drawBurstWave(drawnX, this.player.y, look.rim);

    // Blink while invulnerable: the single cross-type rule that stops a swarm chain-killing.
    const blink = this.invulnerable > 0 ? 0.45 + 0.55 * Math.abs(Math.sin(this.invulnerable * 22)) : 1;

    this.paintBubble(
      drawnX,
      this.player.y,
      drawnRadius,
      burstAlpha * blink,
      /**
       * The bulge, and how hard it is pulsing.
       *
       * The bubble STRAINS as it fills, which is how the player knows they are near capacity without reading
       * anything. The pulse speed rises as the fuse burns down, so "I am about to burst" is legible in the
       * silhouette itself rather than only on a HUD line -- and it speeds up hardest in the last stretch, which is
       * when the player needs to look up from the water.
       *
       * `swell` rather than `size`, so an item being digested counts only for what is left of it: the bubble
       * visibly DEFLATES as the mass comes back out, which is the entire visual feedback for digestion and costs
       * nothing to draw.
       */
      stomachBulge(this.stomach.swell),
      this.stomach.overloaded ? this.overloadPulse() : { phase: 0, strength: 0 },
    );
  }

  /**
   * What is in the stomach, as a ring of dots on the bubble's rim.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS EXISTS NOW, WHEN IT WAS DELIBERATELY DEFERRED BEFORE
   * ---------------------------------------------------------------------------------------------
   * `plan.md` lists "气泡内部显示具体物品" as a thing chosen NOT to do, on the grounds that per-item state did not
   * exist yet so there was nothing meaningful to draw. It exists now, and the reason has changed from decoration
   * to necessity: from this milestone the contents keep ACTING from inside. An urchin bleeds the player and a bomb
   * fish is counting down, and a countdown the player cannot see is not a decision, it is an ambush.
   *
   * On the RIM rather than inside the bubble: the interior already stacks four translucent layers (two glow
   * passes, the sheen, the speculars) and anything drawn in there is averaged into mush -- the lesson the stage
   * colours were fixed by. The rim is clean, and it is where the player is already looking.
   *
   * And on the BUBBLE rather than in a HUD list, for the reason the over-eating chapter settled: a penalty about
   * the bubble has to be visible without moving your eyes off the thing you are steering.
   */
  private drawStomach(g: Graphics, worldX: number, worldY: number, radius: number, alpha: number): void {
    const items = this.stomach.detail;
    if (!items.length) return;

    const look = mech.stomach;
    const markerR = radius * look.markerRadiusRatio;
    /**
     * Spread so a full stomach does not read as a smudge.
     *
     * The floor matters for a config with a larger capacity than this one: without it, twenty items would be
     * placed 0.31 radians apart and merge into a continuous bright ring, which says "something is in there" and
     * not "there are twenty things in there".
     */
    const spread = Math.max(look.markerMinSpreadRadians, (Math.PI * 2) / items.length);

    for (const [i, item] of items.entries()) {
      // Starting at the top and going clockwise, so the OLDEST item is always in the same place -- it is the one
      // that gets spat or digested first, so it is the one worth being able to find without counting.
      const angle = -Math.PI / 2 + i * spread;
      const x = worldX + Math.cos(angle) * radius * look.markerOrbitRatio;
      const y = worldY + Math.sin(angle) * radius * look.markerOrbitRatio;

      /**
       * A fuse about to run out blinks, and only that one does.
       *
       * This is the bomb fish's entire warning. Blinking the marker rather than adding a bar or a number is what
       * makes it answerable at a glance WHICH one is about to go off, which is the only question the player has
       * time to ask.
       */
      const panic = item.fuse > 0 && item.fuse <= look.fusePanicSeconds;
      const blink = panic ? 0.35 + 0.65 * Math.abs(Math.sin(this.elapsed * look.fuseBlinkHz * Math.PI)) : 1;

      g.circle(x, y, markerR).fill({
        color: KIND_TUNING[item.kind].colour,
        alpha: look.markerAlpha * alpha * blink,
      });
      // A dark hairline so a pale marker is still legible against a pale bubble interior.
      g.circle(x, y, markerR).stroke({ color: 0x08131f, alpha: 0.45 * alpha * blink, width: Math.max(1, markerR * 0.3) });
    }
  }

  /**
   * The bulge's pulse rate, in radians per second, rising as the over-eating fuse burns down.
   */
  private overloadPulse(): { phase: number; strength: number } {
    const fraction = this.stomach.fuseFraction;
    const panic = fraction <= mech.spit.panicBelowFraction;
    const hz = mech.spit.pulseHz * (panic ? mech.spit.panicPulseFactor : 1);
    return { phase: this.elapsed * hz * Math.PI * 2, strength: panic ? 1 : 0.5 };
  }

  /**
   * Build an irregular closed outline: an ellipse whose radius is modulated around its circumference.
   *
   * A polygon rather than a Pixi ellipse because the whole point is that it is NOT an ellipse -- an over-full
   * bubble has to look like it is straining, and a scaled circle cannot do that. Sampled densely enough (48
   * points) that the facets are invisible at phone sizes, and left as an open path so the caller can fill it,
   * stroke it, or both.
   */
  private bulgedEllipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    radiusAt: (angle: number) => number,
  ): Graphics {
    const g = this.bubble;
    const steps = 48;
    const points: number[] = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const k = radiusAt(angle);
      points.push(cx + Math.cos(angle) * rx * k, cy + Math.sin(angle) * ry * k);
    }
    // Closed by repeating the first point, because `poly` does not imply a closing edge.
    points.push(points[0]!, points[1]!);
    g.poly(points);
    return g;
  }

  /**
   * The bubble is pure procedural geometry -- no art assets (design round 6). Chosen because the
   * colour and silhouette have to carry gameplay information later (hazard type, threat level).
   *
   * Drawn in WORLD METRES. `radius` is already in metres, derived from the lane width.
   * `alpha` carries the invulnerability blink and the pop fade.
   */
  /** The rage burst's expanding ring. Cleared every frame, drawn only while a wave is alive. */
  private drawBurstWave(worldX: number, worldY: number, rimColour: number): void {
    const g = this.burstWave;
    g.clear();
    if (!this.burst) return;
    const cfg = mech.angry.burst;
    const t = Math.min(1, this.burst.seconds / cfg.waveSeconds);
    const waveR = this.burst.radius * (0.35 + 0.65 * t);
    const fade = 1 - t;
    g.circle(worldX, worldY, waveR).stroke({
      color: cfg.waveColour,
      alpha: 0.85 * fade,
      width: Math.max(1, waveR * cfg.waveWidthRatio),
    });
    // A second, thinner ring just behind it, so the wave reads as a wave rather than as a growing circle.
    g.circle(worldX, worldY, waveR * 0.82).stroke({
      color: rimColour,
      alpha: 0.5 * fade,
      width: Math.max(1, waveR * cfg.waveWidthRatio * 0.5),
    });
  }

  private paintBubble(
    worldX: number,
    worldY: number,
    radius: number,
    alpha: number,
    /**
     * How far the stomach is stretching the silhouette, as a fraction of the radius, and the pulse driving it.
     *
     * Passed in rather than read from the stomach here, so the drawing stays a function of its arguments and the
     * bulge cannot silently disagree with the capacity that produced it.
     */
    bulge = 0,
    pulse: { phase: number; strength: number } = { phase: 0, strength: 0 },
  ): void {
    const g = this.bubble;
    const p = this.particles;
    // Graphics retains its path between `clear()` calls, so both must be cleared every frame.
    // Leaving them dirty is what drew a stray line from the bubble to the finish banner.
    g.clear();
    p.clear();

    if (alpha <= 0.01) return;

    const speed = Math.hypot(this.player.vx * 100, this.player.vy);
    const squash = 1 + Math.min(speed / 600, 0.16);

    /**
     * The stage's whole appearance: size multiplier, colours, opacities and stroke widths.
     *
     * EVERY number below comes from here, including the alphas and the ratios. That is the point -- a constant
     * left in this function is not configurable, it only looks that way from outside, and the owner tunes the
     * look rather than the agent. See `config/mechanics.json5`, `stages.appearance`.
     *
     * Size alone cannot say which stage the player is in: volume grows the bubble every time it eats, so a big
     * stage-1 bubble and a small stage-2 bubble would look similar. Colour is discrete, so it can.
     */
    const look = bubbleLook(this.bubbleType, this.stage.stage, this.rage.rage);

    /**
     * The bubble's interior is deliberately MOSTLY TRANSPARENT, and the STAGE COLOUR is carried by the rim and
     * the glow instead.
     *
     * Measured reason: five translucent layers of light colour stack over the interior (two glow passes, the
     * inner wash, the sheen and the speculars), and stacked past roughly half opacity they average toward white
     * -- which over dark water is a NEUTRAL GREY. The stage hue was being averaged away exactly where the player
     * looks most, and the bubble read as a grey disc with a coloured ring rather than as a coloured bubble.
     *
     * So the interior keeps the water's darkness and the hue lives in the parts that are opaque by nature: the
     * rim, which is a silhouette, and the glow, which is a glow.
     */
    g.circle(worldX, worldY, radius * look.glowOuterRadiusRatio).fill({ color: look.glow, alpha: look.glowOuterAlpha * alpha });
    g.circle(worldX, worldY, radius * look.glowInnerRadiusRatio).fill({ color: look.glow, alpha: look.glowInnerAlpha * alpha });

    // Slowed by a jellyfish: a purple rind around the bubble. Shown ON the player rather than in a
    // status bar, because the penalty is about where the bubble IS -- the player needs to see it
    // without moving their eyes off the thing they are steering.
    if (this.player.slowRemaining > 0) {
      const fade = Math.min(1, this.player.slowRemaining / 0.4);
      g.circle(worldX, worldY, radius * 1.75).stroke({ color: 0xc79bff, alpha: 0.75 * alpha * fade, width: radius * 0.16 });
      g.circle(worldX, worldY, radius * 1.75).fill({ color: 0xc79bff, alpha: 0.07 * alpha * fade });
    }

    /**
     * Shocked by an eel: a jagged ring flickering around the bubble.
     *
     * ---------------------------------------------------------------------------------------------
     * WHY THIS ONE MATTERS MORE THAN THE OTHER CUES
     * ---------------------------------------------------------------------------------------------
     * Every other penalty in this game changes what the bubble does; this one changes what the CONTROLS do, and
     * that is the only failure a player will read as the game being broken. So it has to be unmistakable and
     * instant: a spiky ring that strobes while the inversion lasts, drawn on the bubble rather than anywhere else,
     * because the player's hands are already being told the wrong thing and this is the only other source of truth.
     *
     * Drawn as a polygon rather than a circle because a smooth ring reads as a status effect and a JAGGED one reads
     * as electricity -- the same reason the urchin is drawn as needles: silhouette first, colour second.
     */
    if (this.player.misfiring) {
      const colour = mech.hazards.eelShockColor;
      const strobe = 0.45 + 0.55 * Math.abs(Math.sin(this.elapsed * 34));
      const points: number[] = [];
      const steps = 22;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        // Alternating in and out, so the ring is a sawtooth rather than a circle with a wobble.
        const jag = i % 2 === 0 ? 1.34 : 1.2;
        points.push(worldX + Math.cos(a) * radius * jag, worldY + Math.sin(a) * radius * jag);
      }
      points.push(points[0]!, points[1]!);
      g.poly(points);
      g.stroke({ color: colour, alpha: strobe * alpha, width: radius * mech.hazards.eelShockWidthRatio });
      // A few bolts off the rim, so it reads as discharge rather than as a decorative outline.
      for (let i = 0; i < 3; i++) {
        const a = this.elapsed * 5 + (i / 3) * Math.PI * 2;
        g.moveTo(worldX + Math.cos(a) * radius * 1.3, worldY + Math.sin(a) * radius * 1.3)
          .lineTo(worldX + Math.cos(a + 0.35) * radius * 1.75, worldY + Math.sin(a + 0.35) * radius * 1.75)
          .stroke({ color: colour, alpha: 0.7 * strobe * alpha, width: radius * mech.hazards.eelShockWidthRatio * 0.6 });
      }
    }

    /**
     * The over-full silhouette.
     *
     * The bubble becomes a wobbling blob rather than a circle: a low-frequency deformation with a few lobes, its
     * amplitude set by how much is inside and its speed by the fuse. It is the piece that says "there is something
     * straining to get out of here" without a word of UI -- and because the lobes travel around the rim rather than
     * pulsing uniformly, it reads as contents shifting rather than as the whole bubble breathing.
     *
     * The rim also swaps colour, so the state survives being glanced at out of the corner of an eye while the
     * player is watching a fish: the over-eating warning takes priority, and compression is the other state that
     * changes what the bubble can do -- no suction, double damage -- and therefore has to be visible rather than
     * remembered. Over-eating wins when both are true, because that is the one with a fuse on it.
     */
    const digesting = this.compressing && !this.stomach.overloaded;
    const bodyRim = this.stomach.overloaded ? mech.spit.rimColor : digesting ? mech.digest.rimColor : look.rim;
    /**
     * The compression pulse, on the rim's OPACITY rather than on its shape.
     *
     * Opacity because the state has to be tellable apart from the over-eating wobble at a glance: over-eating
     * deforms the silhouette (something is straining to get out), while compressing breathes in place (something
     * is being pushed down on purpose). Two states, two visual languages, so neither can be mistaken for the
     * other in peripheral vision.
     *
     * The depth comes from the config, so the two can be told apart at any tuning; see `digest.pulseDepth`.
     */
    const digestPulse = digesting ? 0.5 + 0.5 * Math.sin(this.elapsed * mech.digest.pulseHz * Math.PI * 2) : 0;
    const rimAlpha = look.rimAlpha * alpha * (digesting ? 1 - mech.digest.pulseDepth * (1 - digestPulse) : 1);
    const bulgeAt = (angle: number): number => {
      if (bulge <= 0) return 1;
      const wobble = pulse.strength > 0 ? pulse.phase : this.elapsed * 2;
      // Three lobes, so the outline never looks like a clean ellipse of a different size.
      const lobes = Math.sin(angle * 3 + wobble) * 0.6 + Math.sin(angle * 5 - wobble * 0.7) * 0.4;
      return 1 + bulge * lobes * (0.5 + 0.5 * pulse.strength);
    };

    // The body: a very translucent wash of the stage colour, then the rim. The wash hints at the hue inside; the
    // RIM is what states it.
    const outline = this.bulgedEllipse(worldX, worldY, radius / squash, radius * squash, bulgeAt);
    outline.fill({ color: look.inner, alpha: look.innerAlpha * alpha });
    outline.stroke({ color: bodyRim, alpha: rimAlpha, width: radius * look.rimWidthRatio });

    /**
     * A second rim just inside the first, when the stage asks for one.
     *
     * A SHAPE cue, not a hue cue: at phone size in daylight a warm gold and a warm pink are close enough to
     * confuse, but one ring versus two is unmistakable, and it reads in peripheral vision while the player is
     * watching a fish rather than the bubble.
     */
    if (look.innerRing) {
      g.ellipse(worldX, worldY, radius / squash, radius * squash).stroke({
        color: bodyRim,
        alpha: look.innerRingAlpha * alpha,
        width: radius * look.innerRingWidthRatio,
      });
    }

    // Inner sheen, offset toward the light (up and to the left). Deliberately built from plain
    // circles: an earlier version used Graphics.arc for the rim highlight and left a stray line
    // from the bubble to the edge of the water column.
    g.circle(worldX - radius * 0.16, worldY + radius * 0.14, radius * 0.72).fill({
      color: look.sheen,
      alpha: look.sheenAlpha * alpha,
    });

    // Specular highlights. World y grows upward, so +y is up on screen.
    g.circle(worldX - radius * 0.36, worldY + radius * 0.38, radius * 0.21).fill({
      color: look.specular,
      alpha: look.specularAlpha * alpha,
    });
    g.circle(worldX + radius * 0.24, worldY - radius * 0.3, radius * 0.1).fill({
      color: look.specular,
      alpha: look.specularAlpha * 0.5 * alpha,
    });

    this.drawStomach(g, worldX, worldY, radius, alpha);

    // Trailing micro-bubbles below the bubble, so it reads as always moving.
    for (let i = 0; i < 3; i++) {
      const phase = this.elapsed * (0.9 + i * 0.23) + i * 2.1;
      const wobble = Math.sin(phase) * radius * 0.9;
      const rise = ((phase * 14) % (radius * 3.4)) + radius * 0.9;
      p.circle(worldX + wobble, worldY - radius - rise, Math.max(0.06, radius * (0.06 + i * 0.02)));
    }
    p.fill({ color: 0xe8feff, alpha: 0.24 * alpha });
  }

  /** Diagnostics for automated smoke checks. */
  get diagnostics(): {
    /**
     * The build this page is running.
     *
     * Reported here as well as drawn on the menu and in the debug readout, so a probe can assert that what is on
     * screen is what was compiled in -- rather than reading the version module, which would pass while the drawing
     * showed nothing.
     */
    build: { version: string; hash: string; dirty: boolean; label: string };
    /**
     * The codex page: whether it is open, and what it is showing.
     *
     * `entries` is the count PER CATEGORY as the game's own data reports it, which is what a probe needs to assert
     * that every creature, skill and talent has somewhere to be read about.
     */
    codex: {
      open: boolean;
      category: string;
      page: number;
      pages: number;
      total: number;
      visible: readonly string[];
      entries: Record<string, number>;
      /** Every entry id the page has, so a probe can check coverage against the game's own lists below. */
      entryIds: readonly string[];
      /**
       * What the GAME actually has, from the modules that define it.
       *
       * Read from `KIND_TUNING`, `SKILLS` and `TALENTS` rather than from the codex, which is the whole point: a
       * creature added to the game but not to the codex shows up as a difference between these and `entryIds`, and
       * that is a failing test rather than a page nobody notices is out of date.
       */
      gameHazards: readonly string[];
      gameSkills: readonly string[];
      gameTalents: readonly string[];
      /** The bubble types the game offers, so the codex's coverage of them is checkable. */
      gameBubbleTypes: readonly string[];
    };
    frames: number;
    elapsed: number;
    intro: number;
    lastDelta: number;
    nominalSeconds: number;
    level: {
      id: string;
      name: string;
      scrollLength: number;
      scrollSpeed: number;
      scrolled: number;
      entriesEmitted: number;
      entriesTotal: number;
      /** Blocks in the level file, against the entries they expanded to. */
      blocks: number;
      /** Arrivals this run, counted by the edge they came from. */
      arrivals: { top: number; left: number; right: number; bottom: number };
      /** Whether the timeline in use came from a spec rather than from the level file. */
      installed: boolean;
      /** The ladder, in file order, with the save's state against each one. */
      ladder: { id: string; name: string; locked: boolean; selected: boolean }[];
      /** The save: which levels are cleared, and which is selected. */
      cleared: string[];
      selected: string;
      secondsPerScreen: number[];
    };
    playerVx: number;
    playerVy: number;
    bannerAlpha: number;
    bannerSeen: boolean;
    lateral: LateralAuthority;
    laneWidthMeters: number;
    visibleDepthMeters: number;
    gameSeconds: number;
    hazards: {
      active: number;
      /** How many are leaving because the gun finished them, rather than being eaten or having drifted off. */
      leaving: number;
      byKind: Record<string, number>;
      comedyBeats: number;
      lastBeat: { what: HazardKind; at: number } | null;
      grabs: number;
      baits: number;
      /** Hazards eaten this run: the food-chain reversal. */
      eaten: number;
      /** Creatures driven off by the gun, and hits that landed without finishing one. */
      fled: number;
      damaged: number;
    };
    slow: { remaining: number; factor: number; impulseVy: number };
    /** The suction field: whether it is held, how far it reaches, and what it costs in speed. */
    suction: { held: boolean; radiusFraction: number; moveFactor: number };
    /**
     * The obstacles: crates to smash and coral to squeeze past.
     *
     * `rows` is the authored structure, not the live one, so a test can assert the passability guarantee against
     * the level rather than against whatever happens to be on screen.
     */
    obstacles: {
      active: number;
      byKind: Record<string, number>;
      broken: number;
      ramThreshold: number;
      minGap: number;
    };
    /**
     * The stomach and what is in flight.
     *
     * `contents` is the ORDER, not just the count: spitting takes the oldest, so a test asserting "it fires what it
     * swallowed first" needs the sequence rather than the size.
     */
    spit: {
      contents: readonly HazardKind[];
      capacity: number;
      full: boolean;
      inFlight: number;
      hits: number;
      /** Whether the over-eating fuse is lit, how much is left, and the bulge it produces. */
      overloaded: boolean;
      fuseRemaining: number | null;
      fuseFraction: number;
      /** The bulge in item EQUIVALENTS: `swell`, so a half-digested item counts for the half that is left. */
      bulge: number;
    };
    /**
     * The gun: the small bubbles fired on their own.
     *
     * `armed` is here because "nothing is happening" has two very different causes -- the type has no gun, or it has
     * one and has not fired yet -- and a probe that could not tell them apart would report a broken weapon whenever
     * it looked a frame too early.
     */
    bullets: {
      inFlight: number;
      fired: number;
      hits: number;
      armed: boolean;
    };
    /**
     * Digestion: the third way out of the stomach, and the only one that pays.
     *
     * `energy` and `tierBonus` are stated separately rather than only reporting the rank, because "how far into
     * the next rank am I" is the thing a player watches and the thing a probe needs in order to assert that the
     * conversion is going at the configured rate rather than at some plausible-looking one.
     */
    digest: {
      energy: number;
      tierBonus: number;
      /** The rank the eat rule is actually using: what `volumeTier(volume)` gives, plus the bonus. */
      tier: number;
      /** Whether the holder is compressing: the state that costs suction and doubles damage. */
      compressing: boolean;
      /** How far through the oldest item, 0..1. */
      progress: number;
      /** Items digested this run, and the volume digestion has taken out of the bubble. Monotonic, for probes. */
      completed: number;
      drained: number;
    };
    /**
     * What is in the stomach and what it is doing from inside.
     *
     * The per-item list lives HERE rather than under `digest`, because it stopped being only about digesting the
     * moment the contents started acting on their own: the same list answers "what is in there", "how far along is
     * the oldest one" and "which fuse is about to run out". Two copies of it would be two answers to one question.
     *
     * `internalHits` is the counter that makes "the urchin is hurting me" assertable: a volume that fell over a
     * window in which nothing else touched the player is also what eating, digesting and being shot at look like,
     * so the fact is reported rather than inferred.
     */
    stomach: {
      contents: readonly { kind: HazardKind; mass: number; digest: number; fuse: number }[];
      shortestFuse: number | null;
      /** Internal damage accumulated but not yet charged as a whole hit point. */
      partialDamage: number;
      /** Hit points the contents have taken this run. Monotonic. */
      internalHits: number;
      /** Volume destroyed inside by a detonation this run, which buys no rank. Monotonic. */
      destroyed: number;
      /** What the contents multiply the digestion rate by: the worst thing in there. 1 is no effect. */
      digestScale: number;
      /** Spit attempts refused by a clog this run. Monotonic, because a refusal leaves no other trace. */
      clogs: number;
    };
    /**
     * Lost control, from an electric eel.
     *
     * Reported as its own top-level fact rather than under `stomach`, because what it describes is a property of
     * the PLAYER: the steering is inverted right now, whatever the reason was.
     */
    misfire: { remaining: number; inverted: boolean };
    trashDrain: number;
    maxGripSeconds: number;
    talent: {
      id: string;
      name: string;
      ascentMultiplier: number;
      steerMultiplier: number;
      startVolume: number;
      shrinkResistance: number;
    };
    skill: { id: string; uses: number } | null;
    skillActivations: number;
    farts: number;
    emergence: {
      fishSplits: number;
      bubblesEatenByFish: number;
      fishCount: number;
      perceptionRadiusMeters: number;
    };
    events: { seen: number; fired: number[]; last: { label: string; at: number } | null };
    audio: { muted: boolean; running: boolean };
    ending: { surfaced: boolean; splash: number; bestClimbed: number; bestVolume: number };
    /** A skill lying in the water. `id` is null until collected, since it is rolled at pickup. */
    skillPickup: { id: string | null; y: number } | null;
    activeSkill: { id: string; remaining: number } | null;
    stage: {
      stage: number;
      name: string;
      absorbedInStage: number;
      neededForNext: number | null;
      speedMultiplier: number;
      appearance: StageAppearance;
      radiusFraction: number;
    };
    /** Which bubble the run is, and therefore which controls and palette are live. */
    bubbleType: {
      id: string;
      name: string;
      controls: string[];
      hasSpit: boolean;
      hasCompress: boolean;
      hasCharge: boolean;
      /** Whether it can swallow a creature at all. False means contact is damage, never a meal. */
      swallowsHazards: boolean;
    };
    /** The volatile bubble's resource. Always present; always zero for the devour bubble. */
    rage: {
      value: number;
      fraction: number;
      safeSeconds: number;
      charging: boolean;
      aiming: { x: number; y: number };
      stageName: string;
      slamSeconds: number;
      onSlam: boolean;
      slams: number;
      /** The burst: how many have fired, and what the last one did. */
      bursts: number;
      burstRadiusMeters: number;
      waveAlive: boolean;
      lastBurstKills: number;
      lastBurstPushes: number;
      /** Overload: full gauge, on the clock. `left` is what the HUD counts down. */
      overloaded: boolean;
      overloadLeft: number;
    };
    phase: string;
    volume: number;
    hitsSurvived: number;
    invulnerable: number;
    bubbles: number;
    lastEaten: number;
    stats: { absorbed: number; hits: number; maxVolume: number; ended: number; newRecord: boolean };
    report: { fps: number; lastDeltaMs: number; frames: number; bubbles: number; specks: number; hazards: number };
  } {
    return {
      build: { version: APP_VERSION, hash: GIT_HASH, dirty: GIT_DIRTY, label: buildLabel() },
      codex: {
        open: this.phase === 'codex',
        category: this.codex.state.category,
        page: this.codex.state.page,
        pages: this.codex.state.pages,
        total: this.codex.state.total,
        visible: this.codex.state.visible,
        entries: Object.fromEntries(CODEX_CATEGORIES.map((c) => [c.id, entriesFor(c.id).length])),
        entryIds: codexEntries().map((e) => e.id),
        gameHazards: Object.keys(KIND_TUNING),
        gameSkills: SKILLS.map((s) => s.id),
        gameTalents: TALENTS.map((t) => t.id),
        /**
         * The bubble types, so the codex's coverage can be checked the same way the creatures' is.
         *
         * From `BUBBLE_TYPES` -- the list the main menu itself is built from -- rather than from the codex, which is
         * the whole point: a third type added to the game but not to the codex shows up as a difference between this
         * and `entryIds`, and that is a failing test rather than a page nobody notices is out of date.
         */
        gameBubbleTypes: BUBBLE_TYPES.map((t) => t.id),
      },
      frames: this.frameCount,
      elapsed: this.elapsed,
      intro: this.phaseTimer,
      lastDelta: this.lastDelta,
      nominalSeconds: this.nominalSeconds,
      /**
       * The level's own declared properties, so a probe can reason about pacing without hardcoding
       * a depth or a duration. A run length is an OUTPUT of these, not a target.
       */
      level: {
        id: LEVEL.id,
        name: LEVEL.name,
        scrollLength: LEVEL.scrollLength,
        scrollSpeed: LEVEL.scrollSpeed,
        /** How far the level has scrolled, and so how far through it the camera is. */
        scrolled: +this.scrolled.toFixed(2),
        /** Entries emitted so far, and the total, so progress through the TIMELINE is observable. */
        entriesEmitted: this.timelineEmitted,
        entriesTotal: TIMELINE.length,
        /**
         * How many BLOCKS the level file holds, next to how many entries they expanded to.
         *
         * Both numbers, because they answer different questions and a test needs both: `entriesTotal` is what the
         * level contains, `blocks` is what the file says. The pair is what makes "the file drives the level"
         * checkable from outside -- change a block's `count` and one number moves while the other does not.
         */
        blocks: currentSpawnBlocks().length,
        /** Arrivals this run, counted by the edge they came from. */
        arrivals: { ...this.spawnedBySide },
        /** Whether the timeline in use is the level FILE's or one a spec installed. */
        installed: TIMELINE !== LEVEL.entries,
        /** The ladder, in file order, with the save's state against each one. */
        ladder: this.progress.entries(),
        /** The save itself, so a test can assert what was written rather than only what is drawn. */
        cleared: [...this.progress.cleared],
        selected: this.progress.selected,
        /**
         * Seconds per screenful, in order from the seabed up.
         *
         * Reported as a SERIES, not an average. A mean of a curve describes no part of the actual
         * experience and was actively misleading when it was used as the readout for "how fast does this
         * look". With a constant scroll speed the series is flat, and it will stop being flat the moment
         * a level varies its pace.
         */
        secondsPerScreen: secondsPerScreenSeries().map((v) => +v.toFixed(1)),
      },
      /** The player's own motion. Vertical and horizontal are symmetric now. */
      playerVx: +this.player.vx.toFixed(4),
      playerVy: +this.player.vy.toFixed(2),
      bannerAlpha: this.finishBanner.alpha,
      bannerSeen: this.bannerSeen,
      lateral: this.lateral,
      laneWidthMeters: this.camera.viewport.laneWidthMeters,
      visibleDepthMeters: this.camera.viewport.visibleDepthMeters,
      /**
       * Accumulated GAME time in seconds, which is not wall-clock time below 20fps.
       *
       * A frame is capped at 50ms of simulated time, so a browser under load runs the game slower
       * than real time. Any probe that measures a duration the game itself produces -- an
       * acceleration ramp, a cooldown, an animation -- must use this clock, not `performance.now()`,
       * or it will report the frame rate instead of the game.
       */
      gameSeconds: this.elapsed,
      /**
       * Hazard readout. The comedy beats are counted rather than merely triggered because the design
       * treats them as content: a hazard that never produces its reaction is a hazard that has not
       * been finished, and a probe can check they actually happen in a run.
       */
      hazards: {
        active: this.hazards.hazards.length,
        /** How many are on their way out because the gun finished them: `fleeing`, not dead. */
        leaving: this.hazards.hazards.filter((h) => h.flee).length,
        byKind: this.hazards.hazards.reduce<Record<string, number>>((acc, h) => {
          acc[h.kind] = (acc[h.kind] ?? 0) + 1;
          return acc;
        }, {}),
        comedyBeats: this.comedyBeats,
        lastBeat: this.lastComedyBeat,
        /** Monotonic counters, for transient things a boolean sample would miss. */
        grabs: this.hazards.grabs,
        baits: this.hazards.baits,
        /**
         * Hazards eaten this run: the food-chain reversal.
         *
         * Monotonic because the hazard is REMOVED on the frame it is eaten, so "is it still in the list" cannot
         * answer whether it was eaten or simply drifted off screen.
         */
        eaten: this.hazards.eaten,
        /**
         * Creatures driven off by the gun, and hits that landed without finishing one.
         *
         * Monotonic for the same reason as `eaten`: a creature that has been driven off is out of the list within a
         * second, so nothing sampled afterwards can prove it happened.
         */
        fled: this.hazards.fled,
        damaged: this.hazards.damaged,
      },      /**
       * The suction field, so a probe can assert the pull and the cost without inferring them from motion.
       *
       * `radiusFraction` is the config-derived reach, and `moveFactor` is what the player's speed is currently
       * multiplied by -- the two halves of the mechanic, each stated rather than implied.
       */
      suction: {
        held: this.suctionUp,
        radiusFraction: suctionRadiusFraction(this.player.volume),
        moveFactor: this.player.suctionMoveFactor,
      },
      /** What is in the stomach and what is in flight, so a probe reads the fact rather than inferring it. */
      spit: {
        contents: this.stomach.contents,
        capacity: mech.spit.capacity,
        full: this.stomach.full,
        inFlight: this.projectiles.length,
        hits: this.spitHits,
        overloaded: this.stomach.overloaded,
        fuseRemaining: this.stomach.fuseRemaining,
        fuseFraction: this.stomach.fuseFraction,
        bulge: stomachBulge(this.stomach.swell),
      },
      /**
       * The gun: how many rounds are in the air, and the two counters that make it answerable whether it fired and
       * whether it connected. Both monotonic, because a round lives for a couple of seconds at most.
       */
      bullets: {
        inFlight: this.bullets.bullets.length,
        fired: this.bullets.fired,
        hits: this.bullets.hits,
        /** Whether this run's bubble has the gun at all, so a probe can tell "off" from "not firing yet". */
        armed: this.bubbleType.firesBullets,
      },
      /** Digestion: the energy banked, the rank it bought, and the state that costs. */
      digest: {
        energy: this.growthEnergy,
        tierBonus: this.tierBonus,
        tier: volumeTier(this.player.volume) + this.tierBonus,
        compressing: this.compressing,
        progress: this.stomach.digestProgress,
        completed: this.digested,
        drained: this.digestedMass,
      },
      /** What is in the stomach, and what it is doing from inside. */
      stomach: {
        contents: this.stomach.detail,
        shortestFuse: this.stomach.shortestFuse,
        partialDamage: +this.stomachDrain.toFixed(4),
        internalHits: this.internalHits,
        destroyed: +this.destroyedMass.toFixed(4),
        digestScale: this.stomach.digestScale,
        clogs: this.spitClogs,
      },
      misfire: { remaining: +this.player.misfireSeconds.toFixed(3), inverted: this.player.misfiring },
      /** The obstacles, so a probe reads the state rather than inferring it from what is on screen. */
      obstacles: {
        active: this.obstacles.count,
        byKind: this.obstacles.obstacles.reduce<Record<string, number>>((acc, o) => {
          acc[o.kind] = (acc[o.kind] ?? 0) + 1;
          return acc;
        }, {}),
        broken: this.obstacles.broken,
        ramThreshold: mech.obstacles.ramVolumeThreshold,
        minGap: mech.obstacles.minGapFraction,
      },
      /** Fractional damage accumulated from a trash bag, so the drain can be observed directly. */
      trashDrain: +this.trashDrain.toFixed(3),
      /** Longest a trash bag has held on this run, so a grip's duration is observable. */
      maxGripSeconds: +this.hazards.hazards.reduce((m, h) => Math.max(m, h.gripSeconds), 0).toFixed(2),
      /** The player's movement penalty, so a slow can be observed rather than inferred. */
      slow: { remaining: +this.player.slowRemaining.toFixed(3), factor: this.player.slowFactor, impulseVy: +this.player.impulseVy.toFixed(2) },
      /**
       * This run's talent and the carried skill.
       *
       * Both are part of the run's identity, so a probe needs to see them to check that a talent's
       * upside AND its backlash are actually applied.
       */
      talent: {
        id: this.talentEffects.talent.id,
        name: this.talentEffects.talent.name,
        ascentMultiplier: this.talentEffects.ascentMultiplier,
        steerMultiplier: this.talentEffects.steerMultiplier,
        startVolume: this.talentEffects.startVolume,
        shrinkResistance: this.talentEffects.shrinkResistance,
      },
      skill: this.skill ? { id: this.skill.id, uses: this.skill.uses } : null,
      skillActivations: this.skillActivations,
      /** Fish-fart reflex count, so the talent's backlash can be observed rather than assumed. */
      farts: this.farts,
      /**
       * Emergence readout.
       *
       * The counters are the evidence that the design's centrepiece actually happens: a fish fed
       * enough to split, and collectables the swarm ate before the player could.
       */
      emergence: {
        fishSplits: this.hazards.splits,
        bubblesEatenByFish: this.hazards.bubblesEaten,
        fishCount: this.hazards.hazards.filter((h) => h.kind === 'fish').length,
        /** The perception radius the swarm is currently using, which grows with the player. */
        perceptionRadiusMeters: +this.hazards.perceptionRadius(this.player.volume).toFixed(1),
      },
      /** Scripted depth events, and which have fired. */
      events: { seen: this.eventsSeen, fired: [...this.eventsFired], last: this.lastEvent },
      /**
       * Audio and ending state.
       *
       * `audioRunning` is reported rather than assumed: browsers block audio until a real gesture, and
       * a game that claims to have sound while silently muted is worse than one that admits it.
       */
      audio: { muted: this.audioMuted, running: audio.isRunning },
      ending: { surfaced: this.surfaced, splash: +this.splash.toFixed(3), bestClimbed: Math.round(this.bestClimbed), bestVolume: +this.bestVolume.toFixed(2) },
      skillPickup: this.skillPickup ? { id: this.skillPickup.id, y: +this.skillPickup.y.toFixed(1) } : null,      /** Active effect timers, so a skill that lasts can be observed while it runs. */
      activeSkill: this.player.skillId ? { id: this.player.skillId, remaining: +this.player.skillRemaining.toFixed(2) } : null,
      /** The bubble's growth stage: its speed tier, and how far into the next one it is. */
      stage: {
        stage: this.stage.stage,
        /**
         * The name of the current STATE, which is the growth stage for one type and the rage stage for the other.
         *
         * `bubbleStateName` rather than `stageName` so the readout cannot disagree with what is drawn: a volatile
         * bubble at 90 rage reports 失控 even though its growth stage is still 1.
         */
        name: stageName(this.stage.stage),
        absorbedInStage: this.stage.absorbedInStage,
        neededForNext: this.stage.neededForNext,
        speedMultiplier: this.stage.speedMultiplier,
        /**
         * The whole appearance this frame paints with.
         *
         * The entire object rather than a couple of picked-out colours: a test that wants to check the stages are
         * distinguishable should read the same values the drawing code reads, so it cannot pass while the bubble
         * looks wrong. It is also what a tuner sees at a glance, in the console, for what actually loaded.
         */
        appearance: bubbleLook(this.bubbleType, this.stage.stage, this.rage.rage),
        /** The drawn radius as a fraction of the lane, which is also the radius the eating rules use. */
        radiusFraction: stageRadiusFraction(this.stage.stage, this.player.volume),
      },
      /**
       * Which bubble this run is, and the volatile one's resource.
       *
       * `controls` is reported so a probe can prove the LAYOUT changed with the type rather than assuming it: the
       * whole point of the per-type control list is that this array is different, and a test that read the type id
       * without reading this would pass while both types laid out the same buttons.
       */
      bubbleType: {
        id: this.bubbleType.id,
        name: this.bubbleType.name,
        controls: [...this.bubbleType.controls],
        hasSpit: hasControl(this.bubbleType, 'spit'),
        hasCompress: hasControl(this.bubbleType, 'compress'),
        hasCharge: hasControl(this.bubbleType, 'charge'),
        /** Whether it can swallow a creature at all. False means contact is damage, never a meal. */
        swallowsHazards: this.bubbleType.swallowsHazards,
      },
      rage: {
        value: +this.rage.rage.toFixed(2),
        fraction: +rageFraction(this.rage.rage).toFixed(3),
        safeSeconds: +this.rage.safeSeconds.toFixed(2),
        charging: this.charging,
        aiming: { x: +this.chargeAim.x.toFixed(2), y: +this.chargeAim.y.toFixed(2) },
        stageName: rageStageName(this.rage.rage),
        slamSeconds: +this.slamSeconds.toFixed(3),
        onSlam: this.onSlam,
        slams: this.slams,
        /** The burst: how many have fired, and what the last one did. */
        bursts: this.bursts,
        burstRadiusMeters: +(this.camera.viewport.laneWidthMeters * this.burstRadiusRatio()).toFixed(1),
        waveAlive: this.burst !== null,
        lastBurstKills: this.burst?.kills ?? 0,
        lastBurstPushes: this.burst?.pushes ?? 0,
        /** Overload: full gauge, on the clock. `left` is what the HUD counts down. */
        overloaded: this.overloaded,
        overloadLeft: +this.rage.overloadLeft.toFixed(2),
      },
      phase: this.phase,
      volume: this.player.volume,
      hitsSurvived: hitsSurvived(this.player.volume),
      invulnerable: this.invulnerable,
      bubbles: this.field.bubbles.length,
      lastEaten: this.lastEaten,
      stats: { ...this.stats },
      /**
       * Entity counts and the frame time, for the D7 performance pass.
       *
       * Reported from the game rather than recomputed by a probe, so a measurement always describes
       * the scene that actually exists.
       */
      report: {
        fps: +this.fps.toFixed(1),
        lastDeltaMs: +(this.lastDelta * 1000).toFixed(2),
        frames: this.frameCount,
        bubbles: this.field.bubbles.length,
        specks: this.field.specks.length,
        hazards: this.hazards.hazards.length,
      },
    };
  }

  /**
   * Test hook: jump the level to its last metre, so the finish-and-reset path can be exercised in
   * seconds instead of a minute.
   *
   * Moves the SCROLL rather than the player. "Reaching the surface" is now a property of the level's
   * progress, not of where the bubble happens to be on screen -- the player cannot get there by holding
   * up, which is the entire point of the current model.
   */
  teleportToSurface(): void {
    const justShort = Math.max(0, DEPTH_TOTAL - 0.2);
    this.scrolled = justShort;
    this.camera.setScroll(this.scrolled);
    this.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
    this.player.vy = 0;
  }

  /**
   * Test hook: place a bubble of a given size exactly on the player, so absorption and damage can
   * be exercised deterministically instead of waiting for a random collision.
   *
   * @param sizeRatio bubble radius as a multiple of the player's radius. <1 is edible, >1 hurts.
   */
  spawnBubbleOnPlayer(sizeRatio: number): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    const radius = (playerRadius * sizeRatio) / laneWidth;
    this.field.addTestBubble({
      x: this.player.x * laneWidth,
      y: this.player.y,
      vy: 0,
      radius,
      volume: bubbleVolumeFromRadius(radius),
      phase: 0,
      wobble: tuning.bubbleWobbleMin,
      /**
       * HELD, not merely `vy: 0`.
       *
       * `advance` re-solves every bubble's velocity from its size each frame, so a zero velocity is
       * overwritten immediately and the test bubble drifts away before contact resolves. With the world now
       * scrolling at 25 m/s that happens in a few frames, which is why this stopped working.
       */
      held: true,
    });
  }

  /**
   * Test hook: park a moving bubble on the player and hold it there.
   *
   * The `vy: 0` version above proves the collision RULE. This proves contact is not skipped for a
   * bubble that is genuinely in motion. It carries a real relative velocity AND is held in place, so
   * the per-frame velocity solve cannot carry it away before the collision is resolved -- a small
   * bubble closes a gap at well under a metre per second, so an earlier version of this test was
   * simply racing the clock.
   */
  spawnFallingBubbleOnPlayer(sizeRatio: number): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerRadius = laneWidth * stageRadiusFraction(this.stage.stage, this.player.volume);
    const radius = (playerRadius * sizeRatio) / laneWidth;
    const volume = bubbleVolumeFromRadius(radius);
    const ascent = this.player.vy > 0 ? this.player.vy : 1.7;
    // Its real relative speed, solved the same way the field does: positive drifts down-screen.
    const relative = bubbleRelativeFallRatio(volume, this.player.volume) * ascent;
    this.field.addTestBubble({
      x: this.player.x * laneWidth,
      y: this.player.y,
      vy: relative,
      radius,
      volume,
      phase: 0,
      wobble: tuning.bubbleWobbleMin,
      held: true,
    });
  }

  /**
   * Test hook: force a hit, to exercise the burst path without a collision.
   *
   * Bypasses invulnerability and applies the hit directly: a forced hit that could be silently
   * swallowed by the invulnerability window is useless for testing, and waiting 0.8s per hit makes
   * the test slower than the thing it checks.
   */
  debugForceHit(): void {
    this.invulnerable = 0;
    this.takeHit();
  }

  /** Test hook: the obstacle field, so a probe can inspect or place individual obstacles. */
  get obstaclesRef(): ObstacleField {
    return this.obstacles;
  }

  /** Test hook: the collectable field, so a probe can inspect individual bubbles. */
  get fieldRef(): EntityField {
    return this.field;
  }

  /**
   * Test hook: the projectiles in flight.
   *
   * Read-only so a probe can watch one travel without being able to move it -- a test that repositioned a
   * projectile would be testing its own arithmetic rather than the game's.
   */
  get projectilesRef(): readonly SpitProjectile[] {
    return this.projectiles;
  }

  /** Test hook: the stomach, so a probe can read the queue and its capacity. */
  get stomachRef(): Stomach {
    return this.stomach;
  }

  /**
   * Test hook: swallow a hazard the way being touched by one would, WITHOUT having to make contact.
   *
   * Goes through the same steps the collision path does -- grow by the mass, hand the item the volume it actually
   * added, and capture what it does from inside -- so a probe measuring the ledger or an internal effect is
   * measuring the real arithmetic rather than a hook that happens to agree with it today.
   *
   * Needed because the alternative is to park the player at volume 20 so that everything is edible, and eating at
   * the volume CEILING adds nothing: the item would then carry zero mass, and a test of "digesting gives the mass
   * back" would pass or fail depending on a clamp it was not asking about. The same clamp is why the volume is
   * raised only by what was actually gained.
   *
   * @return the volume actually gained, so a test can assert the round trip against the same number.
   */
  debugSwallowForTest(kind: HazardKind): number {
    const before = this.player.volume;
    this.player.volume = growByAbsorbing(this.player.volume, massFromEating(kind));
    const gained = this.player.volume - before;
    this.stomach.swallow(kind, gained, stomachEffect(kind));
    this.stats.absorbed++;
    return gained;
  }

  /** Id of the bubble a probe is following, or null to pick a fresh one. */
  trackedBubbleId: number | null = null;

  /**
   * Test hook: solve collectable motion directly, bypassing the live field.
   *
   * Lets a probe ask "does a bubble of this size move differently while boosting?" without the
   * player's own size changing under it during the sample, which tracking a live bubble cannot rule
   * out (the player eats things while climbing).
   */
  debugSolveCollectableVelocity(bubbleVolume: number, playerVolume: number): number {
    return this.field.solveBubbleVelocity(bubbleVolume, playerVolume);
  }

  /**
   * Test hook: solve collectable motion against an EXPLICIT cruising reference.
   *
   * The live reference cannot be pinned, because the game rewrites it from the depth curve every
   * frame. Solving at chosen references lets a probe check that the motion is exactly linear in the
   * reference, which is the property that guarantees the boost cannot influence it.
   */
  debugSolveCollectableVelocityAtRef(bubbleVolume: number, playerVolume: number, cruiseAscent: number): number {
    return bubbleRelativeFallRatio(bubbleVolume, playerVolume) * cruiseAscent;
  }

  /** Test hook: start following a currently visible bubble so its fall can be measured. */
  debugTrackBubble(): number | null {
    const b = this.field.bubbles.find((c) => this.camera.toScreenY(c.y) > 0 && this.camera.toScreenY(c.y) < this.camera.viewport.height);
    this.trackedBubbleId = b ? b.id : null;
    return this.trackedBubbleId;
  }

  /**
   * Test hook: how the world moves relative to the camera.
   *
   * Answers "is the player fixed on screen while everything else scrolls down?" with numbers
   * instead of by eye. Samples the nearest collectable and a speck so their motion can be tracked
   * across calls.
   */
  debugMotion(): {
    playerScreenY: number;
    playerScreenYRatio: number;
    cameraY: number;
    depth: number;
    nearestBubbleScreenY: number | null;
    nearestBubbleWorldY: number | null;
    nearestBubbleScreenSpeedPxPerS: number | null;
    nearestBubbleFallMps: number | null;
    trackedBubbleSizeRatio: number | null;
    trackedBubbleRiseRatio: number | null;
    trackedBubbleRelativeFallMps: number | null;
    trackedBubbleScreenSpeedPxPerS: number | null;
    scrollSpeedMps: number;
    fieldScrollSpeedMps: number;
    collectables: {
      sizeRatio: number;
      wobble: number;
      relativeFallMps: number;
      screenSpeedPxPerS: number;
    }[];
    trackedBubbleId: number | null;
    trackedBubbleScreenY: number | null;
    speckScreenY: number | null;
    speckWorldY: number | null;
    /** A near-camera speck: the layer that carries the speed cue. */
    nearSpeckScreenY: number | null;
    nearSpeckDrift: number | null;
    farSpeckDrift: number | null;
    ascentSpeed: number;
  } {
    const cam = this.camera;
    const nearest = this.field.bubbles.reduce<Bubble | null>(
      (best, b) => (!best || Math.abs(b.y - this.player.y) < Math.abs(best.y - this.player.y) ? b : best),
      null,
    );
    const far = this.field.specks.find((s) => s.drift <= 0) ?? null;
    const near = this.field.specks.find((s) => s.drift > 0) ?? null;
    // Track by id: "the nearest bubble" changes identity as bubbles stream past, so measuring it
    // twice compares two different objects and reports nonsense.
    const tracked =
      this.trackedBubbleId !== null ? this.field.bubbles.find((b) => b.id === this.trackedBubbleId) ?? null : null;
    return {
      playerScreenY: +cam.toScreenY(this.player.y).toFixed(2),
      playerScreenYRatio: +(cam.toScreenY(this.player.y) / cam.viewport.height).toFixed(4),
      cameraY: +cam.y.toFixed(2),
      depth: +this.player.depth.toFixed(2),
      nearestBubbleScreenY: nearest ? +cam.toScreenY(nearest.y).toFixed(2) : null,
      nearestBubbleWorldY: nearest ? +nearest.y.toFixed(2) : null,
      /**
       * Screen speed at which the nearest bubble is travelling DOWN, in px/s. This is the number
       * that decides whether the stream reads as moving; the world scroll rate says nothing about
       * it because a bubble's motion is dominated by its own fall speed.
       */
      nearestBubbleScreenSpeedPxPerS: nearest ? +(nearest.vy * cam.viewport.scale).toFixed(2) : null,
      nearestBubbleFallMps: nearest ? +nearest.vy.toFixed(3) : null,
      /** Tracked bubble diagnostics: size, its own rise rate, and the resulting screen motion. */
      trackedBubbleSizeRatio: tracked
        ? +(tracked.radius / Math.max(1e-6, stageRadiusFraction(this.stage.stage, this.player.volume))).toFixed(3)
        : null,
      trackedBubbleRiseRatio: tracked ? +bubbleRiseRatio(tracked.volume, this.player.volume).toFixed(3) : null,
      trackedBubbleRelativeFallMps: tracked ? +tracked.vy.toFixed(3) : null,
      /**
       * Instantaneous screen speed of the tracked bubble, in px/s.
       *
       * The INSTANTANEOUS counterpart to the averaged rate a probe measures over a window. Both are
       * needed: a bubble's direction can flip inside the window (the player grows and the bubble
       * goes from being overtaken to overtaking), so comparing an average against an instantaneous
       * value can disagree in sign even when the model is right.
       */
      trackedBubbleScreenSpeedPxPerS: tracked ? +(tracked.vy * cam.viewport.scale).toFixed(3) : null,
      /**
       * The scroll speed collectables are measured against, and what the live field is actually using.
       *
       * These used to be two different numbers -- the player's cruising ascent versus their boosted
       * ascent -- because accelerating had to move the player and leave the ocean alone. With the world
       * scrolling at a fixed rate and the player moving freely, there is only one number, and the check
       * that matters is that both agree.
       */
      scrollSpeedMps: LEVEL.scrollSpeed,
      /** What the live field is actually solving collectables against. Must match scrollSpeedMps. */
      fieldScrollSpeedMps: +this.field.cruiseAscentSpeed.toFixed(3),
      /**
       * Every visible collectable with its size and relative motion, sorted smallest first.
       *
       * Provided by the game rather than recomputed in the probe: an earlier probe version mixed
       * metre-scaled lane width with lane-relative radii and produced a column of zeros, which read
       * like a game bug instead of a probe bug.
       */
      collectables: this.field.bubbles
        .map((b) => ({
          sizeRatio: +(b.radius / Math.max(1e-6, stageRadiusFraction(this.stage.stage, this.player.volume))).toFixed(3),
          wobble: +b.wobble.toFixed(3),
          relativeFallMps: +b.vy.toFixed(3),
          screenSpeedPxPerS: +(b.vy * cam.viewport.scale).toFixed(1),
        }))
        .sort((a, b) => a.sizeRatio - b.sizeRatio),
      /** A tracked bubble: the first in the field, identified so successive samples mean one object. */
      trackedBubbleId: tracked ? tracked.id : null,
      trackedBubbleScreenY: tracked ? +cam.toScreenY(tracked.y).toFixed(2) : null,
      speckScreenY: far ? +cam.toScreenY(far.y).toFixed(2) : null,
      speckWorldY: far ? +far.y.toFixed(2) : null,
      nearSpeckScreenY: near ? +cam.toScreenY(near.y).toFixed(2) : null,
      nearSpeckDrift: near ? +near.drift.toFixed(2) : null,
      farSpeckDrift: far ? +far.drift.toFixed(2) : null,
      ascentSpeed: +this.player.vy.toFixed(3),
    };
  }
}

async function boot(): Promise<void> {
  const mount = document.getElementById('app') ?? document.body;

  // Size the canvas to the actual element before creating the renderer, so the first frame is
  // already the right size. `resizeTo: window` was not reliable here: on mobile the layout
  // viewport is still settling while the page loads.
  const initial = mount.getBoundingClientRect();
  const startWidth = Math.max(1, Math.round(initial.width || window.innerWidth));
  const startHeight = Math.max(1, Math.round(initial.height || window.innerHeight));

  const app = await createApp();
  app.renderer.resize(startWidth, startHeight);

  app.canvas.style.position = 'absolute';
  app.canvas.style.inset = '0';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  mount.appendChild(app.canvas);

  // The Game constructor installs `window.__GB`.
  const game = new Game(app);

  // Drive sizing from the element's measured box. ResizeObserver reports the real content size
  // after the browser has settled the layout, and fires on URL-bar collapse, orientation change
  // and keyboard appearance -- all of which `window.resize` misses or reports ambiguously.
  let lastW = 0;
  let lastH = 0;
  const applySize = () => {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || window.innerWidth));
    const height = Math.max(1, Math.round(rect.height || window.innerHeight));
    if (width === lastW && height === lastH) return;
    lastW = width;
    lastH = height;
    app.renderer.resize(width, height);
    game.handleResize();
  };

  const observer = new ResizeObserver(applySize);
  observer.observe(mount);
  window.addEventListener('orientationchange', () => window.setTimeout(applySize, 120));
  window.visualViewport?.addEventListener('resize', applySize);
  applySize();

  // Keep the touch layer's coordinate correction in sync with the canvas's real box on screen.
  const syncCanvasRect = () => {
    const r = app.canvas.getBoundingClientRect();
    game.setCanvasRect({ left: r.left, top: r.top, width: r.width, height: r.height });
  };
  new ResizeObserver(syncCanvasRect).observe(app.canvas);
  window.addEventListener('scroll', syncCanvasRect, { passive: true });
  syncCanvasRect();

  // Boot diagnostics: mobile sizing bugs are unreproducible without them. `window.__GB.frame()` in
  // a remote console prints the same thing.
  const frame = () => ({
    window: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    visualViewport: window.visualViewport
      ? `${Math.round(window.visualViewport.width)}x${Math.round(window.visualViewport.height)}`
      : 'n/a',
    mount: (() => {
      const r = mount.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    })(),
    canvasCss: `${app.canvas.clientWidth}x${app.canvas.clientHeight}`,
    canvasBuffer: `${app.canvas.width}x${app.canvas.height}`,
    // `screen` is what the game lays out from. `rendererRaw` is the renderer's own width/height,
    // which is in BACKING STORE pixels, so it is resolution times the logical size.
    screen: `${app.renderer.screen.width}x${app.renderer.screen.height}`,
    rendererRaw: `${app.renderer.width}x${app.renderer.height}`,
    resolution: app.renderer.resolution,
  });
  const gb = (window as unknown as { __GB: Record<string, unknown> }).__GB;
  gb.frame = frame;
  console.info('[bubble] boot', frame());
}

void boot();



