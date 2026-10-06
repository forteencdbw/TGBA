import { Application, Graphics } from 'pixi.js';
import { Camera, Hud, WorldLayer, computeViewport, createApp, designScale, makeLabel, waterColourForTest } from './background';
import { tuning } from './config';
import { LEVEL, LEVELS, TIMELINE, installSpawnBlocks, levelIndex, selectLevel, type Level } from './levels';
import { HazardField, hazardAnimationProbe, hazardArtSpriteForTest, hazardHitFeedbackProbe, KIND_TUNING, LURE_PROBE, paintHazards, setReducedFlash, stomachEffect, type HazardKind } from './hazards';
import { paintBullets } from './bullets';
import { EnemyBulletField, paintEnemyBullets } from './enemyBullets';
import { diagnosticsOf } from './diagnostics';
import { BURST_SECONDS, Run, type WorldView } from './run';
import type { Phase } from './snapshot';
import { ObstacleField, paintObstacles, type ObstacleKind } from './obstacles';
import { resolveTalent, TALENTS } from './talents';
import { SKILLS, useSkill } from './skills';
import { audio, type SoundEvent } from './audio';
import { NumberPopups } from './numberPopups';
import { massFromEating } from './consumption';
import { MainMenu } from './menu';
import { CodexUi } from './codexUi';
import { BUBBLE_TYPES, defaultBubbleType, findBubbleType, hasVerb } from './bubbleTypes';
import { sayBanner, sayResults, sayScore, saySkillSlot, saySound, saySplash } from './runEvents';
import { bubbleLook, bubbleShake, bubbleSwell } from './bubbleLook';
import { gainRage, initialRageState, isOverloaded, rageColor, rageFraction, rageStageName } from './rage';
import { mech } from './mechanisms';
import { suctionRadiusFraction } from './suction';
import { Stomach, stomachBulge, tierBonusFor, type SpitProjectile } from './spit';
import { SettingsUi } from './settings';
import { Music, type MusicTrack } from './music';
import { Assets, Sprite, Texture } from 'pixi.js';
import { allAssetNames, assetTextureNow, assetUrl, preloadAssets } from './assets';
import { ParticleField } from './particles';
import { ChargeTrail } from './chargeTrail';
import { LoadingScreen } from './loading';

/**
 * Whether the chain of parents above `node` flips the Y axis.
 *
 * The world is drawn with world +y UP and screen +y down, so somewhere above every sprite there is a negative Y scale --
 * but not necessarily on the sprite's own parent, which is why checking one level (as this first did) reported "not
 * flipped" for a sprite that plainly was. The product of the chain is the honest answer.
 */
function worldYIsFlipped(node: import('pixi.js').Container): boolean {
  let scaleY = 1;
  for (let at: import('pixi.js').Container | null = node.parent; at; at = at.parent) scaleY *= at.scale.y;
  return scaleY < 0;
}
import { RunSummary } from './summary';
import { demote, initialStageState, stageName, stageRadiusFraction } from './stages';
import { nominalScrollSeconds } from './levels';
import { EntityField, type Bubble } from './entities';
import { Input } from './input';
import { calibrateLateral, type LateralAuthority } from './lateral';
import { TouchControls } from './touch';
import { bubbleRelativeFallRatio, bubbleRiseRatio, bubbleVolumeFromRadius, growByAbsorbing } from './volume';

/**
 * Depths where the emergence events fire (design round 4). On D1 they only prove the depth scale
 * reads correctly, but they are the real trigger points.
 */
// The HUD's signposts come from the level, so a new level states its own pacing instead of
// inheriting another level's depths. See `src/levels.ts`.

/** The three ways a bubble can be born (design round 5). Effects land in D4; here it is flavour. */
const SEEDS = ['鱼屁泡', '汽水泡', '深海淤泥泡'] as const;


const INTRO_SECONDS = 1.6;
/**
 * Where the bubble comes from, and where it settles, as fractions of the visible window.
 *
 * Below the bottom edge and level with the middle, so the entrance reads as swimming up into the level -- the same
 * gesture the level's END makes in reverse, when the bubble flies off the top and the next level begins with it
 * arriving from underneath.
 */
const INTRO_START_SCREEN_Y = -0.18;
const INTRO_END_SCREEN_Y = 0.25;
/**
 * The surface finish: slow-motion splash, a held beat, then the pop.
 *
 * Longer than the death burst (1.5s). Death is a mistake and should get out of the way; reaching the
 * surface is the thing the whole run was for, so it gets a moment to land.
 */
// (The win no longer uses a held burst: `defeatBoss` holds the bubble while the flourish plays, then flies it out.)



class Game {
  /** The simulation this game is driving. See `src/run.ts` for where the line is drawn. */
  private readonly run = new Run();
  private readonly input = new Input();
  private readonly camera = new Camera();
  private readonly scene = new WorldLayer();
  private readonly hud = new Hud();
  private readonly touch = new TouchControls(this.input);
  private readonly finishBanner = makeLabel('击败 BOSS  ·  通关', 0xeaf9ff, mech.hud.resultsCard.size);
  /** The gear button and the pause panel it opens. */
  private readonly settings = new SettingsUi();
  /**
   * The level's music.
   *
   * Starts and stops with the RUN rather than with the page: the menu is silent, each level has its own recipe (see
   * config/mechanics.json5's music.tracks), and the settings volume applies to it through the same master bus as
   * every effect.
   */
  private readonly music = new Music();
  /** The end-of-run panel, shown once the last level's bubble has left the water. */
  private readonly summary = new RunSummary();
  /** Seconds of play across the whole RUN, which is what the summary reports -- lapsed is per level. */
  /** The main menu, shown before a run and after exiting to it. */
  private readonly menu = new MainMenu();
  /**
   * The save: which levels are cleared, and which one is selected.
   *
   * Constructed before the menu is wired, because its constructor is what SELECTS the stored level -- and the menu's
   * first layout reads the level's name and length off the row it is handed.
   */
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
  /** The loading page: the backdrop, the bar and the numbers, over everything. See `src/loading.ts`. */
  private readonly loading = new LoadingScreen();
  /** Sparks and debris from hits, in world space. See `src/particles.ts`. */
  private readonly hitParticles = new ParticleField();
  /** The bubble animation that rides behind every charge. See `src/chargeTrail.ts`. */
  private readonly chargeTrail = new ChargeTrail();
  /** The bubble type chosen on the menu, held while the pictures arrive. */
  private pendingType: string | null = null;
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

  /**
   * Metres the level has scrolled. The level's own progress, independent of where the player is.
   *
   * Separate from the player's y on purpose: the player moves freely, so "how far through the level are
   * we" and "how high is the bubble" are now two different questions. The scroll decides what content
   * exists and when the level ends; the player's y decides what they run into.
   */
  /** Entries emitted from the timeline so far, for diagnostics. */
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

  /**
   * How many entries have arrived from each edge this run.
   *
   * Counted rather than sampled, for the same reason the bait and grip counters are: an arrival is over in a frame or
   * two, so "was anything ever placed outside the lane" is unanswerable from a boolean read afterwards.
   */

  private seedLabel: string = SEEDS[0];
  private fps = 60;
  private accumulator = 0;
  private frameCount = 0;
  private lastDelta = 0;
  /**
   * Lateral control authority, calibrated for this display's play-area width. Rebuilt on resize,
   * because a wider canvas is literally a wider play area.
   */
  /** Sticky edge detector: the surface banner is transient, so probes cannot catch it by sampling. */
  private bannerSeen = false;

  /**
   * Which bubble the current run is: chosen on the main menu, fixed for the run.
   *
   * One type per run is the design's answer to the two palettes wanting the same canvas, and it is also what makes
   * the control layout belong to the type: `touch.setControls` is called once, when the run starts, and nothing
   * downstream has to ask which buttons exist. See `src/bubbleTypes.ts`.
   */
  /** Rage, for the volatile bubble. Unused (and always zero) for the devour bubble. */
  /**
   * The charge verb's state.
   *
   * `chargeAim` is the direction the slam will go, captured while the button is held and FROZEN once the player stops
   * steering -- which is the design's "compress and lock the direction": point, release the stick, let go. A player
   * who never aims at all still gets a slam, straight up, because a verb that can silently do nothing is worse than
   * one that goes the obvious way.
   */
  /** Seconds left of the "this contact is a slam" window. Zero means ordinary contact rules. */
  /** How many slams have connected, so a probe can prove the verb did something rather than merely fired. */

  /**
   * The rage burst, and its wave.
   *
   * The wave is stored as the radius it reached and how long ago it fired, rather than as an animated object: the
   * EFFECTS are all applied at the instant of the press, so what is left to draw is an expanding ring that means
   * "this is how far it reached". Keeping the effects instantaneous and the drawing animated is what makes the verb
   * testable -- "what did the burst do" has one answer, at one moment, instead of depending on which frame the ring
   * happened to be passing something.
   */
  /** Monotonic count of bursts fired, so a probe can prove the press reached the verb. */
  /**
   * Detonations still being drawn: where, how big, and how long ago.
   *
   * A short-lived list rather than a single slot, because two bombs can go off in the same frame (a fuse and a
   * shot-dead one), and because the effect's whole job is to outlive the creature that made it.
   */
  private explosions: { x: number; y: number; radius: number; age: number }[] = [];
  /**
   * Screen shake, in seconds remaining and pixels of amplitude.
   *
   * Applied to the STAGE rather than to the water or the world, because it is not "the sea is moving" -- it is "that
   * one landed on you", and the HUD shaking with everything else is what makes it read as the screen rather than as a
   * camera. Small on purpose: it has to feel like weight, not like a reason to lose track of where you are. The player
   * is still dodging while it runs.
   */
  private shake = { seconds: 0, total: 0, pixels: 0 };

  /** Whether a slam is in its window right now: the charge has been released and the window has not run out. */
  private get onSlam(): boolean {
    return this.run.slamSeconds > 0 && this.run.bubbleType.look === 'rage';
  }

  /** Whether the bubble is in overload: full rage, on the clock. See `angry.overload`. */
  private get overloaded(): boolean {
    return this.run.bubbleType.look === 'rage' && isOverloaded(this.run.rage);
  }


  /** The phase to restore when the settings panel closes. */
  private phaseBeforePause: Phase = 'playing';
  /**
   * The bubble's growth stage: which speed tier it is in, and how far into the next one.
   *
   * Per-run state, reset with everything else in `startRun`. Its `speedMultiplier` is pushed into the player
   * whenever it changes, rather than the player reading it, so `Player` stays unaware of the stage system.
   */
  /** Seconds of invulnerability remaining after a hit. */
  /** Sticky counters for probes and for the result card. */
  /**
   * Run counters.
   *
   * `newRecord` is set by `recordBest` at the moment a run ends and is read by the results card. It
   * lives here rather than being recomputed at draw time because "did this run beat the previous
   * best" is only answerable BEFORE the best is updated.
   */
  /** overloads counts overloads that EXPIRED -- the ones the player failed to release. */
  /** How many bubbles were absorbed in the last step, for probes. */
  private runBanner = makeLabel('', 0xd8fbff, 20);

  constructor(readonly app: Application) {
    this.run.nominalSeconds = nominalScrollSeconds(LEVEL);

    this.scene.world.addChild(this.pickups, this.leaving, this.burstWave, this.bubble, this.particles);
    // Over the water and under the HUD: a spark is part of the scene, not a readout.
    this.scene.world.addChild(this.hitParticles.graphics);
    this.scene.world.addChild(this.chargeTrail.root);
    // The flash sits directly over the water but UNDER the HUD, so the depth readout stays legible
    // through it -- the player should still be able to see where they got to during the white-out.
    this.flash.visible = false;
    // The score popups sit over the water and under the flash and the HUD: they belong to the event they mark, not
    // to the interface, but they are readouts and nothing the player steers by may be drawn over them.
    this.app.stage.addChild(this.scene.root, this.popups.root, this.damagePopups.root, this.flash, this.hud.root, this.touch.root);

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
     * and the menu has to cover the settings gear while it is showing. The loading page joins them at the front --
     * it is a full screen in its own right, so nothing of the level or its controls may be drawn over it.
     */
    this.app.stage.addChild(this.loading.root, this.settings.root, this.menu.root, this.codex.root, this.summary.root);
    this.summary.onMenu = () => this.exitToMenu();
    this.settings.setVolume(audio.getVolume());
    this.settings.setOpen(false);
    // The game opens on the menu, so the gear must not be showing behind it.
    this.settings.root.visible = false;
    this.settings.onVolume = (v) => audio.setVolume(v);
    this.settings.onOpen = () => this.openSettings();
    this.settings.onClose = () => this.closeSettings();
    this.settings.onRestart = () => this.restartLevel();
    this.settings.onInfiniteHealth = (on) => {
      this.run.infiniteHealth = on;
    };
    /**
     * The accessibility switch, applied where the drawing is.
     *
     * It reaches the hazard module directly rather than through the run, because it is a property of how creatures are
     * PAINTED and the painter is the only thing that reads it -- the codex draws through the same painter, so a card shows
     * the same setting the water does.
     */
    this.settings.onReducedFlash = (on) => {
      setReducedFlash(on);
    };
    this.settings.onExit = () => this.exitToMenu();
    /**
     * Starting a run now goes through the loader.
     *
     * The level is set up first -- so the loading screen can name it -- and the run proper begins when the art is in. The
     * phase is \`loading\`, which the frame loop treats like any other non-playing phase: no input, no hazards, no timers, so
     * nothing can happen to the player while the pictures arrive.
     */
    this.menu.onStart = (typeId) => {
      void this.beginWithLoading(typeId);
    };
    this.menu.onCodex = () => this.enterCodex();
    /**
     * Picking a level, which the menu only offers for levels that are reachable.
     *
     * The menu does not know the unlock rule -- it is handed the list and reports a press -- so the decision is made
     * here, by the store, and the menu is handed the result. `refreshLevelMenu` is what puts the new selection and the
     * note back on screen.
     */
    this.menu.onPickLevel = (levelId) => {
      if (this.run.progress.select(levelId)) {
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
    this.run.player.reset();
    this.run.scrolled = 0;
    this.camera.setScroll(0);
    this.run.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
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
      player: this.run.player,
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
    return this.run.lateral;
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
    this.pointerLog.push({ t: +(this.run.elapsed).toFixed(2), kind, id: pointerId, x: Math.round(x), y: Math.round(y) });
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
    if (this.run.phase === 'menu') {
      this.menu.handlePointerDown(x, y);
      return;
    }
    // The codex swallows every press while it is open: it is a full screen, and a tap in its margin landing in the
    // water would steer a bubble nobody can see.
    if (this.run.phase === 'codex') {
      this.codex.handlePointerDown(x, y);
      return;
    }
    /**
     * And so does the loading page, which is the one that was missing.
     *
     * It is a full screen, so a press on it means nothing -- but the touch layer is a coordinate test rather than a
     * display-list hit test, so it went on accepting drags through a page covering the whole canvas: the bubble could
     * be steered while the pictures were still arriving, and the drag armed there was handed to the run the instant it
     * began. Refusing the stream is the fix; hiding the controls underneath is only the appearance of one.
     */
    if (this.run.phase === 'loading') return;
    if (this.summary.handlePointerDown(x, y)) return;
    if (this.settings.handlePointerDown(pointerId, x, y)) return;
    if (this.run.phase === 'paused') return;
    this.touch.onPointerDown(pointerId, x, y);
  }

  handlePointerMove(pointerId: number, x: number, y: number): void {
    this.logPointer('move', pointerId, x, y);
    this.pointerPositions.set(pointerId, { x, y });
    if (this.run.phase === 'menu') {
      this.menu.handlePointerMove(x, y);
      return;
    }
    if (this.run.phase === 'codex') {
      // Nothing on the codex page tracks a drag, so a move is simply not the water's business either.
      return;
    }
    // The loading page has no controls at all: see `handlePointerDown`. A move must not steer through it.
    if (this.run.phase === 'loading') return;
    if (this.settings.handlePointerMove(pointerId, x, y)) return;
    if (this.run.phase === 'paused') return;
    this.touch.onPointerMove(pointerId, x, y);
  }

  handlePointerUp(pointerId: number): void {
    this.logPointer('up', pointerId, -1, -1);
    const at = this.pointerPositions.get(pointerId) ?? { x: -1, y: -1 };
    this.pointerPositions.delete(pointerId);

    if (this.run.phase === 'menu') {
      this.menu.handlePointerUp(at.x, at.y);
      return;
    }
    // The codex fires on press, so a release has nothing left to do -- but it must still not reach the water.
    if (this.run.phase === 'codex') return;
    // Same for the loading page: the presses it swallowed have no releases to match, and this one is not the water's.
    if (this.run.phase === 'loading') return;
    // The summary panel owns the screen while it is up: its one button is the only thing a release can mean.
    if (this.summary.handlePointerUp(at.x, at.y)) return;
    if (this.settings.handlePointerUp(pointerId, at.x, at.y)) return;
    if (this.run.phase === 'paused') return;
    this.touch.onPointerUp(pointerId);
  }

  /** Test hook: the raw pointer stream, for diagnosing multi-touch routing. */
  get pointerTrace(): readonly { t: number; kind: string; id: number; x: number; y: number }[] {
    return this.pointerLog;
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

  /**
   * Test hook: the floating score numbers.
   *
   * Exposed for the same reason as the rest: "where did the number appear" is the whole of this feature, and a probe
   * that could only count them could not tell a popup at the pickup from a popup in the corner.
   */
  /**
   * Test hook: the gun's row count.
   *
   * Exposed because "the upgrade changed the rate of fire" is only measurable against the number of rows: the cadence
   * is unchanged by design, so a probe counting rounds needs to know how many muzzles each tick had.
   */
  /**
   * Test hook: the run's fire-rate tier.
   *
   * Exposed next to `gunStreamsRef` because the two upgrades multiply: a probe checking the rate has to know both the
   * tier and the number of rows to know what the stream it is counting was supposed to be.
   */
  /** Test hook: the enemies' rounds, so a probe can read the shape and speed of what a creature fires. */
  get enemyBulletsRef(): EnemyBulletField {
    return this.run.enemyBullets;
  }

  get rateTierRef(): number {
    return this.run.rateTier;
  }

  /** Test hook: the run banner's current text, so a probe can read the feedback the player got. */
  get bannerTextRef(): string {
    return this.runBanner.text;
  }

  /** Test hook: open the codex, for probing its pages. */
  /** Test hook: the art sprite for a creature id, if it has one. */
  hazardArtSpriteRef(id: number): { filters: readonly unknown[] } | null {
    return hazardArtSpriteForTest(id);
  }

  /** Test hook: the last lure geometries the painter computed, newest last. */
  codexLureProbeRef(): unknown {
    return LURE_PROBE.slice(-3);
  }

  /** Test hooks for the codex's preview: its state, a card's rect, and its own pointer path. */
  get codexStateRef(): { visible: readonly string[] } {
    return this.codex.state;
  }

  codexCardRectRef(id: string): { x: number; y: number; w: number; h: number } | null {
    return this.codex.cardRectForTest(id);
  }

  get codexPreviewRef(): boolean {
    return this.codex.previewForTest;
  }

  handlePointerDownRef(id: number, x: number, y: number): void {
    this.handlePointerDown(id, x, y);
  }

  /** Test hook: turn the codex page. */
  codexNextPageRef(): void {
    this.codex.nextPageForTest();
  }

  openCodexRef(): void {
    this.debugOpenCodexForTest();
  }

  /**
   * Test hook: what Pixi's asset manager makes of one of the Chinese-named pictures.
   *
   * Kept because it is what settled the question the whole loading path now rests on -- that the loader reads these files
   * fine and reports their real size -- so the next "is the loader or the file at fault" starts from a measurement rather
   * than a rewrite.
   */
  async probeAssetsLoad(name: string): Promise<string> {
    const url = assetUrl(name);
    if (!url) return 'no url for ' + name;
    try {
      const texture = await Assets.load<Texture>(url);
      return 'loaded ' + texture.width + 'x' + texture.height;
    } catch (error) {
      return 'failed: ' + (error instanceof Error ? error.message : String(error));
    }
  }

  /** Test hook: one creature's trail sprite, for measuring where it sits. */
  chargeTrailRiderRef(id: number): { x: number; y: number; width: number } | null {
    return this.chargeTrail.riderForTest(id);
  }

  /** Test hook: the charge trail's live bubbles and cut frames. */
  get chargeTrailRef(): { live: number; frames: number } {
    return this.chargeTrail.state;
  }

  /** Test hook: how many particles are alive. */
  get hitParticlesRef(): number {
    return this.hitParticles.count;
  }

  /** Test hook: the bullet sprite pool. */
  get bulletSpritesRef(): Sprite[] {
    return this.bulletSprites;
  }

  /** Test hook: the raw bubble sprite, for measuring. */
  get bubbleSpriteRef2(): Sprite | null {
    return this.bubbleSprite;
  }

  /** Test hook: the drawn bubble graphics. */
  get bubbleRef(): Sprite | null {
    return this.bubble as unknown as Sprite;
  }

  /** Test hook: whether the player's bubble art is on screen. */
  get bubbleSpriteRef(): boolean {
    return Boolean(this.bubbleSprite?.visible);
  }

  /** Test hook: whether a level's backdrop image actually loaded. */
  get backdropLoadedRef(): boolean {
    return this.scene.backdropLoaded;
  }

  /** Test hook: the backdrop's load failure, if any. */
  get backdropErrorRef(): string {
    return this.scene.backdropError;
  }

  /** Test hook: the parallax field, so a probe can read each layer's offset. */
  get parallaxRef(): { layerOffsetsRef: number[] } {
    return this.scene.parallax;
  }

  /** Test hook: the end-of-run summary panel. */
  get summaryRef(): RunSummary {
    return this.summary;
  }

  /** Test hook: the level music, so a probe can read whether a track is running and which. */
  get musicRef(): Music {
    return this.music;
  }

  /** Test hook: the run's conductive charge (LEVEL 3), 0 to `hazards.charge.max`. */
  get chargeRef(): number {
    return this.run.charge;
  }

  get gunStreamsRef(): number {
    return this.run.gunStreams;
  }

  /**
   * Test hook: the floating numbers, score and damage alike.
   *
   * The NAME is historical -- it was the score popups before damage numbers existed, and the probes that read it (and
   * `count`/`lastText` on it) are not worth churning for a rename.
   */
  get scorePopupsRef(): NumberPopups {
    return this.popups;
  }

  /** Test hook: the damage numbers, which are their own field with their own count and style. */
  get damagePopupsRef(): NumberPopups {
    return this.damagePopups;
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
   * Test hook: whether the player could currently EAT this kind of hazard.
   *
   * Exposes the same function the collision and the outline marker use, so a test asserts the real rule rather
   * than reimplementing the tier ladder and disagreeing with it at the edges.
   */
  canEatHazardForTest(kind: HazardKind): boolean {
    return this.run.canSwallow(kind);
  }

  /**
   * The stomach, and the projectiles currently in flight.
   *
   * Per-run state: reset with everything else in `startRun`, because a new run must not begin holding the previous
   * run's ammunition.
   */
  /** Crates to smash and coral to squeeze past: the target for spitting and for being small. */
  /**
   * The gun: the small bubbles the player's bubble fires on its own.
   *
   * Its own field rather than more entries in `projectiles` above, because the two are different KINDS of thing: a
   * spit projectile is a swallowed hazard thrown back (it carries a `kind`, knocks things around, and costs a
   * stomach slot), while these are plain rounds that take hit points off a creature. See `src/bullets.ts`.
   */
  /** The enemies' rounds. Their own field, because they are a different thing entirely -- see the module. */
  /**
   * How many rows of small bubbles the gun fires, once the ability upgrade has been taken.
   *
   * Per RUN state, like the score: an upgrade that survived a death would make dying a way to keep a permanent
   * advantage, and the run before it would have been a different game from the one after.
   */
  /**
   * The run's fire-rate tier, 1-based. One pickup per step, and the ladder's length is the ceiling.
   *
   * Per RUN, like the gun's rows: a permanent upgrade that survived a death would make dying a way to keep an
   * advantage, and the run after it would be a different game from the one before.
   */
  /** Whether this run's boss has arrived. Per run, like everything else about a run. */
  /**
   * The infinite-health cheat, as set in the settings panel.
   *
   * Applied in TWO places rather than one, because the bubble can be killed in two ways: a HIT (`takeHit`, which is
   * every collision, bullet and blast) and a DRAIN (an urchin or a trash bag bleeding the volume away). Guarding only
   * the first would leave a cheat that works until the player swallows the wrong thing.
   */
  /**
   * The level the run walks into when the ending beat finishes, and whether the run has reached its own end.
   *
   * The transition is a HANDOFF rather than an immediate switch: the boss's death plays out (the same held beat and
   * white-out a finished level always had), and only when that timer expires does the next level start. Doing it
   * instantly would throw the player into a new level mid-flash with the victory banner still on screen.
   */
  /** Metres the bubble has risen since the level was cleared, for the departure sequence. */
  /**
   * How many levels this RUN has cleared, which is what the progress chart draws.
   *
   * Separate from the save's `cleared` list on purpose: the save is the lifetime ladder (what the player has ever
   * unlocked, across every attempt), and this is one descent. A chart that showed the save would be full before the
   * player had ever reached level three.
   */
  /**
   * LEVEL 3's conductive charge, and the bubble is the capacitor.
   *
   * The whole mechanic lives in these two numbers plus `resolveCharge` below: the field reports that an electric ring
   * swept the bubble (an effect), this accumulates it, and once it is over `chainAt` the next zapper the bubble comes
   * near is ignited -- which kills that one and jumps to others, and is therefore also how a blocked route is opened.
   * Danger, weapon and key, from one number.
   */
  /** Seconds left of the chain-discharge visual, and the last burst's radius in metres. */
  /** Seconds until the next spit is allowed. */
  /** 1 -> 0 pulse on the spit button, for the refusal when the stomach is empty. */
  /** Projectiles that have hit something this run, so a hit is observable rather than inferred from motion. */

  /**
   * Growth energy banked by digestion, and the rank it has bought.
   *
   * This is the ONE thing digestion produces that is not a subtraction, and it is the reason digesting is worth
   * its cost: mass leaves the bubble while the rank it bought stays. `tierBonus` is derived rather than stored,
   * so the config's `energyPerTier` can be edited at runtime -- which is how the tests make a digest payoff
   * happen in a second rather than in twenty -- without the two getting out of step.
   */
  /** Whether the player is compressing right now: held control AND something to compress. */
  /** Items digested this run, and the total volume digestion has taken out of the bubble. */

  /**
   * The eating rank digestion has bought, in tiers.
   *
   * Added to `volumeTier(volume)` wherever the eat rule is asked, which is exactly two places plus the outline
   * marker -- all three through `canEatHazard`, so a marker that promised food while the collision delivered a
   * hit remains impossible.
   */
  private get tierBonus(): number {
    return tierBonusFor(this.run.growthEnergy);
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
    if (!hasVerb(this.run.bubbleType, 'suction')) return false;
    return this.input.sucking && !this.run.compressing;
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



  /**
   * Test hook: the suction field's reach in metres, as the physics actually uses it.
   *
   * Exposed because the field's radius has two multipliers (the player's size and, when over-full, the runaway
   * bonus) and a test asserting only the config value would pass while a bonus that never reached the physics did
   * nothing.
   */
  suctionReachForTest(): number {
    return this.camera.viewport.laneWidthMeters * suctionRadiusFraction(this.run.player.volume) * this.run.suctionRadiusFactor;
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
    this.run.obstacles.spawn(kind, this.run.player.x * laneWidth, this.run.player.y + ahead);
  }

  /**
   * Test hook: drop one growth stage.
   *
   * Nothing in the game demotes the player -- the design has not decided whether damage should cost a stage --
   * so this exists purely so a probe can measure each stage's handling without absorbing its way up and back
   * down. It goes through `demote`, the same function real demotion would use, so the state stays consistent.
   */
  demoteStageForTest(): number {
    demote(this.run.stage);
    this.run.player.stageSpeedMultiplier = this.run.stage.speedMultiplier;
    return this.run.stage.stage;
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
    this.run.useBurst(this.worldView());
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
    return { cleared: [...this.run.progress.cleared], selected: this.run.progress.selected, ladder: this.run.progress.entries() };
  }

  /** Test hook: pretend a level was cleared, exactly as reaching its surface does. */
  debugClearLevel(id: string): string | null {
    const unlocked = this.run.progress.clear(id);
    this.refreshLevelMenu();
    return unlocked;
  }

  /** Test hook: select a level if it is reachable. */
  debugSelectLevel(id: string): boolean {
    if (!this.run.progress.select(id)) return false;
    this.refreshLevelMenu();
    return true;
  }

  /** Test hook: forget the save, as a player clearing their progress would. */
  debugResetProgress(): void {
    this.run.progress.reset();
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
    gainRage(this.run.rage, amount);
    return this.run.rage.rage;
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
    const radius = viewport.laneWidthMeters * stageRadiusFraction(this.run.stage.stage, this.run.player.volume);
    return {
      x: band.x + (this.run.player.x * viewport.laneWidthMeters * band.scale.x),
      y: band.y + this.run.player.y * band.scale.y,
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
    return this.run.spawnLog;
  }

  /**
   * Test hook: the REAL water-colour function.
   *
   * Exposed so a probe does not re-derive the arithmetic. A probe that copies the implementation keeps
   * reporting the old bug after the bug is fixed, which is worse than having no probe.
   */
  waterColourAt(worldY: number, depth: number): number {
    return waterColourForTest(worldY, depth, LEVEL);
  }

  /**
   * Test hook: jump the scroll to the end of the level and clear the water.
   *
   * The win condition is "the scroll finished AND the water is clear", which would otherwise take a
   * full minute of real time to reach. Two things have to be forced, so they are forced together --
   * setting only the scroll would leave the player waiting on a screen full of hazards.
   */
  debugSkipToLevelEnd(): void {
    this.run.scrolled = LEVEL.scrollLength;
    this.run.timelineEmitted = TIMELINE.length;
    this.run.field.placeTimeline(TIMELINE, this.run.scrolled, this.camera.visibleWorldRange(0).max);
    this.run.field.takePending();
    this.run.hazards.hazards = [];
    // Move the CAMERA, not the player: the scroll is the level's position, and the player's world
    // position is derived from it. Writing player.y directly would be overwritten on the next frame.
    this.camera.setScroll(this.run.scrolled);
    this.run.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
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
  /**
   * Fractional internal damage accumulated from what is in the stomach.
   *
   * Its own accumulator rather than sharing the trash bag's, because the two are different sources that can be
   * live at once and a shared one would let a 0.6 from an urchin and a 0.6 from a bag add up to a hit neither of
   * them earned.
   */
  /**
   * Hit points the stomach's contents have taken from the player this run.
   *
   * Monotonic, like the other counters, because the evidence that an urchin is doing anything is a volume that
   * fell over a window in which nothing else was touching the player -- and "the volume is lower than before" is
   * also what eating, digesting and being shot at all look like.
   */
  /** Volume destroyed inside by detonations this run, which buys no rank. Monotonic, for probes. */
  /** Spit attempts refused by a clog this run. Monotonic, because a refusal is invisible in any sampled state. */
  /** Count of comedy beats this run, and the most recent one, for the HUD and probes. */
  /** The hazard field: spawning, motion and contact. See src/hazards.ts. */

  /** This run's talent and its resolved multipliers. */
  /**
   * The single skill slot. `uses` reaching zero empties it.
   *
   * One slot on purpose: it forces a decision at the pickup instead of accumulating a toolkit, and it
   * keeps the HUD to one button.
   */
  /**
   * The skill in the slot, with its name for the HUD's line.
   *
   * The name is stored rather than looked up per frame: `findSkill` is a search, and the HUD is rebuilt sixty times a
   * second for a value that changes once a pickup.
   */

  /**
   * The run's talent, for the HUD's line, and the boss fight as the HUD should show it.
   *
   * Both are the HUD's INPUT rather than something pushed into it: the boss bar used to be written straight into the
   * HUD from `updateBoss`, which meant the sim owned a display object. They are game state now, read by the frame like
   * everything else -- see `HudState`.
   */
  private talentLabel = '';
  private bossView: { name: string; fraction: number } | null = null;
  /** The run's progress chart, or null off a run. Read by the HUD, written where the run's progress changes. */
  private progressView: { total: number; cleared: number; current: number } | null = null;
  /** The bait bubble a decoy left behind, so it can be drawn and then expire. */
  /** How many skills have been used this run, for the results card. */
  /** The skill lying in the water, if any, and the countdown to the next one. */
  /**
   * The pickups lying in the water, waiting to be taken.
   *
   * A LIST, and that is a fix rather than a tidy-up: this used to be a single slot, so a level that placed two pickups
   * near each other silently lost the first one -- the second overwrote it, and what the player saw was a pickup
   * vanishing with no explanation. Level 1 had exactly that (a rate upgrade at 520m and a skill at 540m, twenty metres
   * apart), which is how it was found.
   *
   * `kind` says WHAT each one gives: a skill (rolled at pickup time, because deciding at spawn would commit the
   * player's next twenty seconds before they had even seen the thing), the gun upgrade, or the rate upgrade.
   */
  /** When the fish-fart talent can fire again, and how many times it has. */
  /** Which scripted depth events have fired, and the count, so a run does not repeat a beat. */
  /** Mirrors the audio module's mute state, so the HUD can show it. */
  private audioMuted = false;
  /** Best run so far, kept across restarts. */
  /**
   * The best score of this SESSION.
   *
   * Per session rather than saved, which is `progress.ts`'s deliberate line: the save holds which levels are open,
   * and a best score is a per-run fact that would need a migration the day a value in the config changes. `bestClimbed`
   * and `bestVolume` are kept the same way, for the same reason.
   */
  /**
   * The score of the run in progress.
   *
   * The RULES live in `src/score.ts` and the VALUES in the config's `score` group; this object is the total and the
   * ledger of what paid it.
   */
  /** The numbers that float where something happened: points earned, and damage dealt. See src/numberPopups.ts. */
  private readonly popups = new NumberPopups(mech.score.popups);
  /**
   * The damage numbers, in their own field.
   *
   * The same class and the same mechanism, a different style: a score number is an event and a damage number is a
   * rate, so they get their own cap, their own life, and -- the reason it is an instance rather than a flag -- their
   * own count, so "the score numbers are gone" stays answerable in the debug readout and in the probes.
   */
  private readonly damagePopups = new NumberPopups(mech.damagePopups);
  /** White-out flash driven by the surface breach, 1 -> 0. */
  private splash = 0;
  /** Whether the current burst is a SURFACE finish rather than a death. */

  /**
   * Test hook: drop a named hazard on the player, so each verb can be exercised deterministically.
   *
   * The four hazards have completely different effects, and waiting for the right one to spawn and
   * find the player would make each check a race. This also lets a probe assert the DIFFERENCE
   * between them, which is the actual design claim.
   */
  debugSpawnHazardOnPlayer(kind: HazardKind): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const hazard = this.run.hazards.spawnForTest(kind, this.run.player.x * laneWidth, this.run.player.y);
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
    return this.run.hazards;
  }

  /**
   * Test hook: the boss's death as it happens -- which animations loaded, and which frame the body is on.
   *
   * Added because "the death animation did not play" has two very different causes (the frames never arrived, or the body is
   * not being drawn) and the two look identical on screen; this tells them apart, and it is also how "the level waits for the
   * explosion" is observable rather than inferable from the clock.
   */
  bossAnimationRef(): ReturnType<typeof hazardAnimationProbe> {
    return hazardAnimationProbe(this.run.hazards);
  }

  /** Test hook: the hit feedback (flash intensity, heavy outline) as the painter would compute it, per creature. */
  hitFeedbackRef(): ReturnType<typeof hazardHitFeedbackProbe> {
    return hazardHitFeedbackProbe(this.run.hazards);
  }

  /**
   * Test hook: zero the run's counters and top the player back up.
   *
   * Lets a probe measure each hazard in isolation without restarting the run. It deliberately does
   * NOT reset volume to a fixed value -- it raises it to full, because a probe measuring "did this
   * cost health" needs headroom rather than a precise starting number.
   */
  debugResetStats(): void {
    this.run.stats = { absorbed: 0, hits: 0, maxVolume: this.run.stats.maxVolume, ended: this.run.stats.ended, overloads: this.run.stats.overloads, newRecord: false };
    this.run.player.volume = tuning.volumeMax;
    this.run.player.slowRemaining = 0;
    this.run.player.slowFactor = 1;
    this.run.player.impulseVy = 0;
    this.run.invulnerable = 0;
    this.run.trashDrain = 0;
    this.run.stomachDrain = 0;
    this.run.internalHits = 0;
    this.run.destroyedMass = 0;
    this.run.spitClogs = 0;
    this.run.comedyBeats = 0;
    this.run.lastComedyBeat = null;
    this.run.hazards.reset();
    // Skill state too, or a probe that ran a skill leaks its effect into the next one -- which showed
    // up as a CONTROL run reporting the dash's ascent bonus, making two assertions fail for a reason
    // that had nothing to do with the skills.
    this.run.player.skillRemaining = 0;
    this.run.player.skillId = null;
    this.run.player.skillAscentBonus = 1;
    this.run.skillActivations = 0;
    this.run.decoy = null;
  }

  /**
   * Test hook: suspend the fish's bait reaction.
   *
   * The bait beat is explicitly a chance, so a test that needs to observe the CHASE would otherwise
   * fail 25% of the time and look like a broken mechanic. Both behaviours are worth asserting, but
   * not in the same run.
   */
  debugSetBaitEnabled(enabled: boolean): boolean {
    this.run.hazards.baitEnabled = enabled;
    return this.run.hazards.baitEnabled;
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
    this.run.talentEffects = resolveTalent(talent);
    this.run.player.ascentBonus = this.run.talentEffects.ascentMultiplier;
    this.run.player.steerScale = this.run.talentEffects.steerMultiplier;
    this.run.player.shrinkResistance = this.run.talentEffects.shrinkResistance;
    this.run.player.volume = this.run.talentEffects.startVolume;
    this.talentLabel = talent.name;
    return talent.id;
  }

  /** Test hook: put a skill in the slot without waiting for a pickup to drift past. */
  debugGrantSkill(id: string): boolean {
    const skill = SKILLS.find((s) => s.id === id);
    if (!skill) throw new Error(`unknown skill: ${id}`);
    this.run.grantSkill(skill.id);
    return true;
  }

  /** Test hook: fire the fish-fart reflex, bypassing the contact that normally triggers it. */
  debugReleaseFart(): number {
    this.run.fartReadyAt = 0;
    this.run.releaseFart(this.worldView());
    return this.run.farts;
  }

  private rollSeed(): void {
    this.seedLabel = SEEDS[Math.floor(Math.random() * SEEDS.length)] ?? SEEDS[0];
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
    this.run.lateral = calibrateLateral(viewport.laneWidthMeters);

    this.scene.layout(viewport, LEVEL);
    this.hud.layout(viewport);
    this.popups.layout(viewport);
    this.damagePopups.layout(viewport);
    this.touch.layout(viewport.left, viewport.laneWidthPx, screenW, screenH);
    this.settings.layout(viewport);
    this.menu.layout(viewport);
    this.codex.layout(viewport);
    // The loading page is sized in the canvas's own pixels rather than in the play area's: it is a page, not a HUD.
    this.loading.layout(screenW, screenH);

    /**
     * The results card, scaled by the world zoom -- and WRAPPED to the screen.
     *
     * The scale is the water's (it has always been: the card floats in the level, not in a fixed HUD), but a line of
     * text has nothing to do with how many pixels a metre occupies. With three facts on a line the card ran off both
     * edges and the player saw the middle of their own result. The wrap width is in the label's own units, so the text
     * folds instead of being clipped, whatever the line ends up saying; the ratio is the config's.
     */
    this.finishBanner.scale.set(viewport.scale);
    this.finishBanner.x = screenW / 2;
    this.finishBanner.y = screenH * mech.hud.resultsCard.yRatio;
    this.summary.layout(screenW, screenH);
    this.finishBanner.style.wordWrap = true;
    // CJK lines have few spaces to break at, so a break has to be allowed inside a run of characters.
    this.finishBanner.style.breakWords = true;
    this.finishBanner.style.wordWrapWidth = (screenW * mech.hud.resultsCard.widthRatio) / viewport.scale;

    /**
     * The run banner is CENTRED and wrapped.
     *
     * It was never positioned at all: an anchor of 0.5 with no x or y puts it at the canvas origin, so half of every
     * message hung off the left edge of the screen. The owner's screenshot of a clipped line is what that looks like --
     * the banner has always been drawn there, and it took a run with a lot of banners for it to be obvious.
     *
     * Just under the stage line, not floating over the canvas: these are messages ABOUT the run (an event announced,
     * an upgrade taken), and the state they explain is the HUD block directly above them.
     */
    const bannerScale = designScale(screenW, screenH);
    this.runBanner.scale.set(bannerScale);
    this.runBanner.x = screenW / 2;
    // Just under the stage line, inside the HUD block rather than floating over the debug readout below it.
    this.runBanner.y = 56 * bannerScale;
    this.runBanner.style.align = 'center';
    this.runBanner.style.wordWrap = true;
    this.runBanner.style.breakWords = true;
    this.runBanner.style.wordWrapWidth = (screenW * 0.92) / bannerScale;

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
      this.applyRunEvents();
      this.accumulator -= step;
      steps++;
    }

    this.render(dt);
  }

  /**
   * The four numbers about the world a run is allowed to know. See `WorldView`.
   *
   * Built from the CAMERA rather than handed to it: the camera is the game's -- a viewport, a zoom, a follow behaviour
   * -- and the run gets the reading, not the thing that reads.
   */
  private worldView(): WorldView {
    const view = this.camera.visibleWorldRange(0);
    return {
      laneWidth: this.camera.viewport.laneWidthMeters,
      visibleDepthMeters: this.camera.viewport.visibleDepthMeters,
      min: view.min,
      max: view.max,
    };
  }
  private step(dt: number): void {
    const world = this.worldView();
    /**
     * Shared input runs in EVERY phase, including paused and menu.
     *
     * `input.update` derives the axes from the raw key set rather than integrating anything, so it is
     * stateless -- but skipping it leaves the axes frozen at their last value, and a player who pauses while
     * holding a direction key then resumes still holding it would find the bubble unresponsive. The mute key
     * is handled here too, and muting while the settings panel is open is exactly when someone would want it.
     */
    this.input.update();
    if (this.run.phase !== 'menu' && this.input.consumeMute()) this.audioMuted = audio.toggleMute();

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
    if (this.run.phase === 'paused' || this.run.phase === 'menu' || this.run.phase === 'codex') return;

    if (this.run.invulnerable > 0) this.run.invulnerable = Math.max(0, this.run.invulnerable - dt);
    /**
     * The overlays' clocks, ticked here rather than in the draw pass -- and BEFORE the phase switch, because the shake
     * and the flash belong to the ending sequence, whose phases all return early from that switch.
     *
     * A pause freezes them with everything else. That is new, and it is the honest reading of a pause: the alternative
     * was a white-out that finished fading while the game was stopped.
     */
    this.updateTransientOverlays(dt);
    /**
     * And a death, for the same reason and with the same placement.
     *
     * `resolveHazards` is where a hazard's clock normally ticks, and the ending does not reach it: once the boss is dead the
     * phase holds the level open so that nothing moves, nothing spawns and nothing deals damage -- and a death's animation
     * was inside that freeze. Measured: the body's clock pinned at 0.008s while the ticker ran on. So the explosion is
     * advanced HERE, where the phase cannot skip it, and it is the only part of the hazard simulation that runs during the
     * hold. See `HazardField.tickDeaths`.
     */
    this.run.hazards.tickDeaths(dt);

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
    if (this.run.phase === 'playing' || this.run.phase === 'burst') {
      this.run.scrolled = Math.min(LEVEL.scrollLength, this.run.scrolled + LEVEL.scrollSpeed * dt);
      this.camera.setScroll(this.run.scrolled);
      this.run.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
      if (this.run.phase === 'playing') {
        /**
         * Spawn at the TOP of the visible range, so content descends into view.
         *
         * Not at `this.run.scrolled`, which is the MIDDLE of the screen. Placing there made every enemy and
         * bubble materialise in the centre, which reads as spawning rather than as a current the player
         * is swimming against -- and gave the player no time to react, since the thing appeared at the
         * distance they were about to occupy.
         */
        this.run.field.placeTimeline(TIMELINE, this.run.scrolled, this.camera.visibleWorldRange(0).max);
        for (const placed of this.run.field.takePending()) {
          this.run.emitTimelineEntry(placed.entry, placed.worldY, world.laneWidth, world);
          this.run.timelineEmitted++;
        }
      }
    } else {
      // The intro holds the camera still but still positions the bubble, so it is visible on screen
      // rather than at the world origin.
      this.camera.setScroll(this.run.scrolled);
      this.run.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
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
    const suctionAt = this.suctionUp ? { x: this.run.player.x * viewport.laneWidthMeters, y: this.run.player.y } : null;
    /**
     * The gathering cost, pushed into the player each frame because it lasts exactly as long as the input does.
     *
     * MULTIPLIED with the over-eating slow rather than replacing it, so a player who is both gathering and
     * over-full is genuinely nearly immobile -- which is the intended worst case and not a number to protect them
     * from.
     */
    this.run.player.suctionMoveFactor =
      (suctionAt ? mech.suction.moveSpeedFactor : 1) * (this.run.stomach.overloaded ? mech.spit.overloadMoveSpeedFactor : 1);

    this.run.field.update(
      dt,
      viewport.laneWidthMeters,
      min,
      max,
      this.run.player.volume,
      LEVEL.scrollSpeed,
      suctionAt,
      this.run.suctionRadiusFactor,
    );

    switch (this.run.phase) {
      case 'intro': {
        /**
         * Rising into the level from below the screen.
         *
         * Driven by the phase timer rather than by a velocity, so the arrival takes exactly `INTRO_SECONDS` whatever the
         * frame rate did -- and eased, so it decelerates into position instead of stopping dead at the bottom edge. The
         * controls are off (this is not `playing`), which is what makes it an entrance rather than a movement.
         */
        this.run.phaseTimer -= dt;
        this.run.elapsed += dt;
        const t = Math.min(1, Math.max(0, 1 - this.run.phaseTimer / INTRO_SECONDS));
        const eased = 1 - (1 - t) * (1 - t);
        this.run.player.screenY = INTRO_START_SCREEN_Y + (INTRO_END_SCREEN_Y - INTRO_START_SCREEN_Y) * eased;
        if (this.run.phaseTimer <= 0) {
          this.run.player.screenY = INTRO_END_SCREEN_Y;
          this.run.phase = 'playing';
        }
        return;
      }
      case 'cleared': {
        /**
         * Holding still while the flourish plays.
         *
         * Nothing happens here on purpose: no input (this is not `playing`), no damage, and the bubble does not drift --
         * the current keeps moving the world, which is enough to show that time is passing. The player is meant to have
         * a moment to notice they won.
         */
        this.run.phaseTimer -= dt;
        /**
         * AND THE LEVEL DOES NOT END UNTIL THE BOSS HAS FINISHED DYING.
         *
         * This is the whole shape of the beat, and it was wrong: the boss is killed, the phase turns over on the same
         * frame, and the hold was then only as long as the music -- so a death animation longer than the flourish was cut
         * off mid-explosion, and the player watched a frozen crab while the bubble flew away. The order the fight EARNS is
         * the shot, then the explosion, then the departure.
         *
         * The condition is read from the field rather than counted here (see `HazardField.dying`), so "the explosion has
         * finished" cannot drift away from the animation that defines it. The timer is a MINIMUM hold, not the length of
         * the beat: it keeps the flourish from being clipped by a boss that exploded quickly.
         */
        if (this.run.phaseTimer > 0 || this.run.hazards.dying) return;
        this.run.phase = 'ascend';
        this.run.ascendMetres = 0;
        return;
      }
      case 'ascend': {
        const band = this.camera.viewport.visibleDepthMeters;
        /**
         * Off the top of the screen, and then out of the level.
         *
         * Driven by distance travelled rather than by time, so the departure looks the same on any canvas: it rises
         * `ascendScreensPerSecond` screens' worth per second until it has cleared the top of the view by its own
         * radius, then the level is handed over.
         */
        /**
         * The rise is driven through the player's SCREEN fraction, not through its world y.
         *
         * `player.y` is derived from the camera every frame -- the bubble is held at a screen position and the world
         * moves under it -- so writing to `y` was overwritten before it could be drawn, and the departure was invisible
         * (measured: 11m of a 600m climb). `screenY` is the thing the frame actually reads, so that is what goes up.
         * 1.0 is the top edge; the sequence ends once it is a fifth of a screen past it.
         */
        this.run.player.screenY = Math.min(1.4, this.run.player.screenY + (mech.audio.ascendScreensPerSecond * dt));
        this.run.ascendMetres += band * mech.audio.ascendScreensPerSecond * dt;
        if (this.run.player.screenY < 1.15) return;
        this.finishLevelAndContinue();
        return;
      }
      case 'summary':
      case 'burst': {
        // Slow motion: the pop plays out before the run resets, so death has some weight.
        this.run.phaseTimer -= dt;
        if (this.run.phaseTimer > 0) return;
        /**
         * Where the ending beat leads.
         *
         * Three destinations, and they are the whole of the run's shape: the next level (carrying the score), the same
         * level again (a death, or a restart asked for from the settings panel), or -- on the final level -- the run's
         * own end, which is what the results card shows.
         */
        if (this.run.phase === 'summary') return;
        if (this.run.pendingLevel) {
          const nextId = this.run.pendingLevel;
          this.run.pendingLevel = null;
          this.enterLevel(nextId, true);
          return;
        }
        this.startRun();
        return;
      }
      case 'playing':
        this.run.elapsedTotal += dt;
        /**
         * The particles are drained and ticked HERE, where `dt` is in scope.
         *
         * A hit only happens while playing, so the phase is the honest place for it -- and the alternative was threading a
         * delta into a draw call that does not otherwise need one. The radii arrive as lane fractions and become metres here,
         * which is the only place that knows how wide the lane is.
         */
        for (const event of this.run.hazards.takeHitEvents()) {
          this.hitParticles.emit({
            x: event.x,
            y: event.y,
            radius: event.radiusFraction * this.camera.viewport.laneWidthMeters,
            kind: event.kind,
            colour: event.colour,
          });
        }
        /**
         * A heavy hit moves the SCREEN, and that is the game's to do rather than the field's.
         *
         * The ring round the body is the painter's (see `paintHazards`); this is the other half of "that one was big", and
         * it is a property of the camera. A light hit deliberately does not shake: the screen is the loudest thing here, so
         * using it for every round would make it noise -- the same reasoning the bomb fish already records for being the
         * only blast that moves it.
         */
        for (const heavy of this.run.hazards.takeHeavyHits()) {
          const cfg = mech.hitFeedback;
          if (cfg.heavyShakePixels <= 0 || cfg.heavyShakeSeconds <= 0) continue;
          const pixels = cfg.heavyShakePixels * heavy.strength * designScale(this.app.screen.width, this.app.screen.height);
          /**
           * A LONGER shake already playing is not cut short by a lighter hit.
           *
           * The same call the flash makes: a smaller event must not overwrite a bigger one's feedback, or a burst of fire
           * makes the screen flicker between the two.
           */
          if (this.shake.seconds > cfg.heavyShakeSeconds && this.shake.pixels > pixels) continue;
          this.shake = { seconds: cfg.heavyShakeSeconds, total: cfg.heavyShakeSeconds, pixels };
        }
        this.hitParticles.update(dt);
        /**
         * The charge trail RIDES the creature.
         *
         * Driven from here rather than from the charge's own code: the simulation should not know what a bubble sprite is, and
         * everything needed is public already -- the charge, its elapsed time, and the telegraph duration that says whether it
         * is winding up or already flying. No trail during the wind-up: a bubble while it is still standing there would say "it
         * has gone", which is the one thing the telegraph must not say.
         */
        for (const h of this.run.hazards.hazards) {
          if (!h.charge) continue;
          const row = mech.charges.chargers[h.kind];
          const telegraph = row?.telegraphSeconds ?? (h.kind === 'angler' ? mech.hazards.angler.telegraphSeconds : 0.75);
          if (h.charge.elapsed < telegraph) continue;
          // The dash's own direction, not the creature's velocity: the bubble should trail the geometry the player sees.
          const dx = h.charge.toX - h.charge.fromX;
          const dy = h.charge.toY - h.charge.fromY;
          const len = Math.hypot(dx, dy) || 1;
          this.chargeTrail.ride(h.id, h.x, h.y, dt, this.camera.viewport.laneWidthMeters, dx / len, dy / len);
        }
        // Anything that did not ask for its bubble this frame has stopped charging: it loses it rather than leaving a ghost.
        this.chargeTrail.sweep();
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
    this.run.updateStomach(dt, world.laneWidth, this.input);
    this.run.updateProjectiles(dt, viewport.laneWidthMeters, min, max);
    /**
     * The gun, beside the spit and for the same two reasons.
     *
     * It resolves before `resolveHazards` below, so a creature driven off by a round this frame is already leaving
     * by the time the hazards move -- otherwise the player would watch a fish they had just finished off take one
     * more bite on its way out. And it fires from the bubble's position as of NOW rather than after the player
     * moves, so the stream comes out of the bubble the player is looking at.
     */
    this.run.updateBullets(dt, viewport.laneWidthMeters, min, max);
    this.run.obstacles.update(dt, min, max);

    this.run.elapsed += dt;
    // The ambience follows the depth every frame: it IS the progress readout. See src/audio.ts.
    //
    // Silenced during the ending. `depth` alone cannot express this -- at the surface it is pinned at
    // 0, which is the LOUDEST setting, so the bed kept playing through the whole results sequence.
    // One-shots (the pop, the splash) still fire; only the continuous bed stops.
    audio.tick(dt);
    /**
     * The depth-reactive ambient bed is GONE, by request.
     *
     * It was a synthesised noise bed that rose with depth, and the owner's note is that it is exactly what it looked
     * like on paper: a background sound that gets LOUDER the deeper the run goes, with no way to turn it down except the
     * master volume (which takes the effects with it).
     *
     * The owner asked for the texture back at a FIXED level, and that is the right shape for it: the bed is a property of
     * being underwater, not of how far up the bubble has got, so it is set once from `audio.ambientVolume` instead of
     * being re-sent every frame with new numbers. `setDepth`, the rejected version, stays in `src/audio.ts` unused.
     */
    audio.setAmbient(mech.audio.ambientVolume);

    /**
     * The charge verb, immediately BEFORE the player moves.
     *
     * Order matters here and only here: the launch sets an impulse, and `player.update` is what turns an impulse
     * into movement. Firing it after would spend a frame with the bubble wound up and going nowhere.
     */
    this.run.updateCharge(this.input);
    this.run.updateRage(dt);
    /**
     * The burst, read after the charge and before the movement: it is an instant, so where it lands is where the
     * bubble is on the frame of the press, and reading it here keeps that frame the same one the player saw.
     */
    if (this.input.consumeBurst()) this.run.useBurst(world);

    this.run.player.update(this.input, dt, this.run.lateral);
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
    this.run.player.syncToCamera(this.camera.y, viewport.visibleDepthMeters);
    this.run.player.clampToScreen(this.camera.y, viewport.visibleDepthMeters);

    // Hazards move AFTER the player, so a hazard's contact test uses the position the player is
    // actually at this frame rather than the one it started from.
    this.run.resolveHazards(dt, min, max, world.laneWidth, world, this.input);

    this.run.updatePickup(dt, min, max, viewport.laneWidthMeters);

    this.run.fireDepthEvents();

    this.run.resolveContacts(dt, world);

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
    /**
     * THE LEVEL ENDS WHEN ITS BOSS DOES.
     *
     * The distance no longer ends anything: a level's length is now just how much level there is before the boss
     * arrives, and the scroll simply stops at the end of it (which is what turns the last stretch into an arena the
     * player cannot leave). Everything the old rule needed -- a length, a finish line, a countdown to it -- is gone
     * with it.
     */
    this.music.update(dt);
    this.updateBoss();
    /**
     * The chart is redrawn from the run's own numbers every frame rather than being pushed on change.
     *
     * It is six circles and one string: rebuilding it is cheaper than the bookkeeping a change-detector would need, and
     * it cannot fall out of step with the run -- which for a chart whose whole job is "where am I" is the property that
     * matters.
     */
    this.progressView = { total: LEVELS.length, cleared: this.run.levelsClearedInRun, current: levelIndex(LEVEL.id) };
    this.run.updateConductiveCharge(dt, viewport.laneWidthMeters);

    // Trace the end condition, so a probe can see WHY a level failed to end rather than only that it
    // did. A win condition with five clauses is exactly the kind of thing that reports "still playing"
    // for several possible reasons.
    this.endTrace.push({
      scrolled: +this.run.scrolled.toFixed(1),
      hazards: this.run.hazards.hazards.length,
      bubbles: this.run.field.bubbles.length,
      pickup: this.run.pickupDrops.length,
      emitted: this.run.timelineEmitted,
      total: TIMELINE.length,
      phase: this.run.phase,
    });
    if (this.endTrace.length > 8) this.endTrace.shift();
  }





  /**
   * Use the carried skill, if there is one with uses left.
   *
   * The effects are applied HERE rather than inside the skill definition, for the same reason hazard
   * effects are applied by the game: the skill module stays a description of what a skill IS, and the
   * game owns how that lands on the world.
   */
  private useSkill(): boolean {
    const used = useSkill({
      player: this.run.player,
      hazards: this.run.hazards,
      bubbles: this.run.field.bubbles,
      carried: this.run.skill,
      laneWidth: this.camera.viewport.laneWidthMeters,
      elapsed: this.run.elapsed,
      events: this.run.events,
    });
    if (!used) return false;
    // Two scalars come back rather than being written through: the invulnerability window is the run's (it takes the
    // MAX of this and whatever is left), and the decoy's bubble is something the run draws and expires.
    this.run.invulnerable = Math.max(this.run.invulnerable, used.invulnerableSeconds);
    if (used.decoy) this.run.decoy = used.decoy;
    if (used.usesLeft <= 0) {
      this.run.skill = null;
      this.skillSlot(false);
    }
    this.run.skillActivations++;
    return true;
  }











  /**
   * Start (or restart) the current level.
   *
   * `carryScore` is the level TRANSITION: clearing a level walks the player straight into the next one, and the run's
   * score goes with them -- that is the whole point of judging a run by its total rather than by one level's best. A
   * death, by contrast, starts the same level with nothing, which is the same flag left at its default.
   */
  /**
   * Show the loading page, fetch the level's pictures, then start the run.
   *
   * EVERY picture rather than only this level's, deliberately: the whole set is a few megabytes of authored art, and
   * fetching it once means no later level -- including the automatic hand-off from one to the next -- ever shows a loading
   * page again. Per-level fetching would add a page between every pair of levels to save nothing.
   *
   * The page is a FULL SCREEN, and one that refuses the pointer stream for as long as it is up (see
   * `handlePointerDown`): before that it was a bar drawn under the water with the touch controls still live over it, so
   * the player could steer a bubble through a level that had not started.
   */
  private async beginWithLoading(typeId: string): Promise<void> {
    this.pendingType = typeId;
    this.run.phase = 'loading';
    this.menu.root.visible = false;
    // The page takes the screen, so any finger the game thought it had is forgotten -- a drag armed on the way in
    // would otherwise be handed to the run the moment it starts.
    this.touch.releaseAll();
    this.loading.begin();
    await preloadAssets(allAssetNames(), (progress) => this.loading.update(progress));
    if (this.pendingType) {
      const type = this.pendingType;
      this.pendingType = null;
      // The SAME entry point the menu used before this screen existed: the loader wraps it rather than replacing it, so a run
      // starts exactly as it always did once the art is in.
      this.enterFromMenu(type);
    }
  }

  private startRun(carryScore = false): void {
    this.run.player.reset();
    // The arrival begins below the screen; the intro walks it up. Set here rather than inside the intro so that where a
    // run starts lives in one place with everything else that resets.
    this.run.player.screenY = INTRO_START_SCREEN_Y;
    /**
     * Back to stage 1, and push its speed into the player.
     *
     * `player.reset()` clears `stageSpeedMultiplier` to 1, which happens to match stage 1 -- but relying on
     * that coincidence would break the moment the config's first multiplier is not 1.
     */
    this.run.stage = initialStageState();
    this.run.player.stageSpeedMultiplier = this.run.stage.speedMultiplier;
    // A new run must not begin holding the previous run's ammunition, nor its projectiles in flight.
    this.run.stomach.reset();
    this.run.projectiles.length = 0;
    // Nor with the previous run's rounds in the air, which would be free shots nobody asked for.
    this.run.bullets.reset();
    // The enemies' rounds go with them: a new bubble that starts inside a wall of the last run's fire would be a
    // death the player cannot connect to anything they did.
    this.run.enemyBullets.reset();
    /**
     * The gun's rows and rate tier are the RUN's, like the score.
     *
     * They used to reset on every `startRun`, which was right while a run was one level. Walking into the next level is
     * the same run continuing, so the upgrades the player earned come with them -- otherwise clearing a level would
     * punish the player by taking away the thing that let them clear it. A death still starts from nothing.
     */
    if (!carryScore) {
      this.run.gunStreams = 1;
      this.run.rateTier = 1;
    }
    // The boss bar goes with the run it belonged to. Without this it hangs there through the next birth animation,
    // showing the previous level's boss at whatever health it died at -- a bar for a fight that is not happening.
    this.summary.hide();
    // A new level starts with no results card: it belongs to the run that ended, not to this one.
    this.finishBanner.alpha = 0;
    this.finishBanner.text = '';
    // The bar goes with the run it belonged to. `updateBoss` would clear it on the next step anyway, but a new level
    // must not show the previous boss's bar for even one frame.
    this.bossView = null;
    /**
     * The level's music.
     *
     * Set HERE rather than in the level-select code so every route into a level gets it: the menu, the level pills, a
     * restart from the settings panel and the automatic handoff from the level before. A track that only started from
     * one of those would be a level that is silent depending on how the player got there.
     */
    this.startLevelMusic();
    // The chart follows the run, not the save: see `levelsClearedInRun`. `startRun` without a carry is a fresh run, so
    // the chart goes back to zero with it; the transition path sets the count itself before calling in.
    if (!carryScore) this.run.levelsClearedInRun = levelIndex(LEVEL.id);
    this.progressView = this.run.runComplete ? null : { total: LEVELS.length, cleared: this.run.levelsClearedInRun, current: levelIndex(LEVEL.id) };
    this.run.bossSpawned = false;
    /**
     * A fresh run has no level queued to walk into.
     *
     * `pendingLevel` is set the moment a level is cleared and read when the ending beat is over, which is the same
     * run. Quitting from the pause panel during that hold left it set -- the menu is not a run, so nothing consumed it
     * -- and the NEXT run then inherited it: dying on level 1 teleported the player into level 2 with the score
     * carried over. A carry keeps it, because a carry IS the walk into that level; anything else starts from nothing.
     */
    if (!carryScore) this.run.pendingLevel = null;
    /**
     * The score is the RUN's number.
     *
     * It starts at zero with everything else that belongs to a run -- including the numbers still floating on screen
     * from the previous one -- EXCEPT on a level transition, where it is the one thing that is explicitly inherited.
     * The popups still clear either way: a `+25` left over from the last level, floating over this one, would be a
     * number with no event behind it.
     */
    if (!carryScore) {
      this.run.score.reset();
      this.run.runComplete = false;
    }
    this.popups.clear();
    this.damagePopups.clear();
    this.run.spitCooldown = 0;
    this.run.spitHits = 0;
    /**
     * Digestion state is per-run, and `growthEnergy` especially so.
     *
     * The eating rank it buys is the run's own progress; carrying it across a death would make the restart
     * strictly easier than the run that ended, which is the same reason skills and talents reset here.
     */
    this.run.growthEnergy = 0;
    this.run.compressing = false;
    this.run.digested = 0;
    this.run.digestedMass = 0;
    this.run.internalHits = 0;
    this.run.destroyedMass = 0;
    this.run.spitClogs = 0;
    /**
     * The volatile bubble's run state, reset with everything else.
     *
     * `chargeAim` deliberately keeps its old value: a player who died mid-wind-up and restarts should not have to
     * re-aim before their first slam, and there is nothing a stale direction can be wrong about -- it is overwritten
     * the moment they push the stick.
     */
    this.run.rage = initialRageState();
    this.run.charging = false;
    this.run.slamSeconds = 0;
    this.run.slams = 0;
    this.run.obstacles.reset();
    this.run.field.reset();
    this.run.hazards.reset();
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
    this.run.scrolled = 0;
    this.run.timelineEmitted = 0;
    this.endTrace.length = 0;
    this.run.spawnLog.length = 0;
    this.run.spawnedBySide = { top: 0, left: 0, right: 0, bottom: 0 };
    this.run.trashDrain = 0;
    this.run.stomachDrain = 0;
    this.run.comedyBeats = 0;
    this.run.lastComedyBeat = null;
    // Skills and talents are per-run state: carrying a skill across a death would make the restart
    // strictly easier than the run that just ended.
    this.run.skill = null;
    this.run.pickupDrops.length = 0;
    this.run.skillActivations = 0;
    this.run.decoy = null;
    this.run.fartReadyAt = 0;
    this.run.farts = 0;
    this.run.eventsFired = new Set();
    this.run.eventsSeen = 0;
    this.run.lastEvent = null;
    this.splash = 0;
    this.run.surfaced = false;
    this.skillSlot(false);
    this.run.elapsed = 0;
    this.run.phase = 'intro';
    this.run.phaseTimer = INTRO_SECONDS;
    this.run.invulnerable = 0;
    this.run.stats = { absorbed: 0, hits: 0, maxVolume: this.run.talentEffects.startVolume, ended: this.run.stats.ended, overloads: this.run.stats.overloads, newRecord: false };
    this.rollSeed();
    this.run.rollTalent();
    this.talentLabel = this.run.talentEffects.talent.name;;
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
    if (this.run.phase === 'paused' || this.run.phase === 'menu' || this.run.phase === 'codex') return;
    this.phaseBeforePause = this.run.phase;
    this.run.phase = 'paused';
    // Any finger that was steering is forgotten, or releasing it later would resume a drag the player has
    // already mentally abandoned.
    this.touch.releaseAll();
    this.settings.setVolume(audio.getVolume());
    this.settings.setOpen(true);
  }

  /** Close the panel and resume whichever phase it interrupted. */
  private closeSettings(): void {
    if (this.run.phase !== 'paused') return;
    this.settings.setOpen(false);
    this.run.phase = this.phaseBeforePause;
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

  /**
   * Walk into a level as part of a run: switch the level, then start it with the score carried across.
   *
   * The level itself is switched through `selectLevel`, the same call the menu makes, so a level reached by clearing
   * the one before it is identical to the same level reached by picking it -- one implementation of "be in this level",
   * which is the only way the two can be trusted to agree.
   */
  private enterLevel(id: string, carryScore: boolean): void {
    if (!selectLevel(id)) return;
    const index = levelIndex(id);
    this.run.levelsClearedInRun = Math.max(this.run.levelsClearedInRun, index);
    this.startRun(carryScore);
    this.banner(`第 ${index + 1} 关  ·  ${LEVEL.name}  ·  分数继承 ${this.run.score.value}`);
  }

  /** Leave the level and show the main menu. */
  private exitToMenu(): void {
    this.music.stop();
    /**
     * Point the game back at the level the ROW is showing, not the one the run had walked on to.
     *
     * Found by a bug report: clear level 1, walk into level 2, quit, press start -- and the run began on level 2 while
     * the level pills still had level 1 selected. Two different facts were being read as one. `LEVEL` is the level
     * being PLAYED, and the automatic handoff at the end of a level moves it (see `enterLevel`); the menu's pointer is
     * the save's own `selected`, and only a press on a pill moves that. `enterFromMenu` starts a run on `LEVEL`, so
     * leaving the menu with the game pointed at the other level is the contradiction the player saw. Re-applying the
     * pointer here -- the same call `Progression` makes for the same reason at construction -- is what keeps "start"
     * meaning "the level on screen", however far the last run had travelled.
     */
    selectLevel(this.run.progress.selected);
    /**
     * The summary panel goes with the run.
     *
     * Without this, its own button "did nothing": the menu was shown BEHIND the panel, so the press worked and the
     * screen looked identical. A panel with one button has to leave when that button is pressed.
     */
    this.summary.hide();
    this.settings.setOpen(false);
    this.run.phase = 'menu';
    this.touch.releaseAll();
    /**
     * Stop the ambience explicitly.
     *
     * `step` returns before it reaches `audio.setDepth` while on the menu, so nothing else would ever tell the
     * bed to stop -- it kept playing over the menu at the level it had when the player quit.
     */
    audio.silenceAmbience();
    /**
     * The transient overlays go with the level.
     *
     * They are no longer decayed while the menu is up -- `step` returns before it reaches them, the same way it does
     * for the ambience above -- so anything mid-fade at the moment the player quits would freeze on screen instead of
     * finishing. A half-faded results card stuck over the menu is exactly the stale-overlay bug this file has already
     * fixed once.
     */
    this.shake = { seconds: 0, total: 0, pixels: 0 };
    this.splash = 0;
    this.flash.alpha = 0;
    this.flash.visible = false;
    this.finishBanner.alpha = 0;
    this.finishBanner.text = '';
    this.runBanner.alpha = 0;
    this.explosions = [];
    this.app.stage.position.set(0, 0);
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
    this.menu.setLevels(this.run.progress.entries());
    const locked = this.run.progress.entries().find((l) => l.locked);
    if (locked) {
      const index = levelIndex(locked.id);
      const previous = LEVELS[index - 1];
      this.menu.setLevelNote(previous ? `通关「${previous.name}」后解锁「${locked.name}」` : '', false);
    } else {
      this.menu.setLevelNote('');
    }
  }

  /**
   * Point the music at the current level's recipe, and make sure the context exists to play it.
   *
   * `musicBus()` is null until the first user gesture, so this is also where the music is told "not yet" -- it holds
   * the track and starts the moment the context appears, which is what `update` checks.
   */
  private startLevelMusic(): void {
    const bus = audio.musicBus();
    if (bus) this.music.attach(bus.ctx, bus.destination);
    const track = (mech.audio.music.tracks as Record<string, MusicTrack | undefined>)[LEVEL.id];
    this.music.setVolume(audio.getVolume() * mech.audio.music.volume);
    this.music.setTrack(track ?? null);
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
    this.run.bubbleType = findBubbleType(typeId) ?? defaultBubbleType();
    this.touch.setControls(this.run.bubbleType.controls);
    this.touch.layout(
      this.camera.viewport.left,
      this.camera.viewport.laneWidthPx,
      this.app.renderer.screen.width,
      this.app.renderer.screen.height,
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
    this.run.phase = 'codex';
    this.codex.show();
  }

  /** Leave the codex, back to the menu. */
  private exitCodex(): void {
    this.run.phase = 'menu';
    this.menu.root.visible = true;
  }


  private updateBoss(): void {
    const spec = LEVEL.boss;
    if (!this.run.bossSpawned && this.run.scrolled >= spec.at) {
      this.run.bossSpawned = true;
      const lane = this.camera.viewport.laneWidthMeters;
      // It arrives just above the visible band and swims down into the fight, so the arrival is something the player
      // watches rather than a creature that pops into existence beside them.
      /**
       * It arrives from just above the VISIBLE BAND, not from above the player.
       *
       * The two are the same thing only while the player is near the camera. In level 2 the passages are narrow enough
       * that a player can be held up behind a wall while the current carries the camera on -- and a boss spawned
       * relative to that player would appear far below the screen and be culled before anyone saw it.
       */
      const band = this.camera.viewport.visibleDepthMeters;
      const boss = this.run.makeHazard(this.worldView(), 'boss', this.run.player.x * lane, this.camera.y + band * 0.42, null, spec.health);
      boss.tint = spec.colour ?? null;
      this.run.hazards.hazards.push(boss);
      this.sound('surface');
      this.banner(`${spec.name}  ·  击败它才能离开这一关`);
    }
    const boss = this.run.hazards.hazards.find((h) => h.kind === 'boss');
    this.bossView = boss && !boss.flee ? { name: spec.name, fraction: boss.health / Math.max(1, boss.maxHealth) } : null;
    if (this.run.phase === 'playing' && this.run.hazards.killed > 0) this.defeatBoss();
  }

  /**
   * The level is WON: its boss is dead.
   *
   * This used to be `reachSurface`, fired by the scroll running out. The ending itself is unchanged -- the same held
   * beat, the same white-out, the same results card -- because the reward for finishing a level was never about the
   * surface; it was about having finished it. What changed is what finishes it.
   */
  private defeatBoss(): void {
    /**
     * WINNING NO LONGER LOOKS LIKE DYING.
     *
     * This used to set the same `burst` phase a death uses -- the pop, the white-out, the results card -- which meant
     * the game's biggest moment was rendered as its worst one. Now the bubble simply HOLDS: control is off (no phase
     * but `playing` accepts input), a flourish plays over the music, and when it finishes the bubble rises and leaves
     * the level the way it came in.
     *
     * The flourish's length is read from the same numbers the synth plays, so "the music finished" and "the bubble
     * goes" cannot disagree.
     *
     * The HOLD here is a MINIMUM and not the length of the beat: the phase also waits for the boss's death animation to
     * finish (see the `cleared` case in `step`). The music and the explosion are two different lengths and the longer one
     * wins -- otherwise the ending interrupts the very explosion it is celebrating, which is what it used to do.
     */
    this.run.phase = 'cleared';
    /**
     * The flourish plays HERE and its length is the hold, which is the point of it returning a number. The synth and this
     * sequence agree about how long the music lasts because they read the same value.
     */
    const sting = this.music.playSting(mech.audio.clearSting.notes, mech.audio.clearSting.gapSeconds);
    this.run.phaseTimer = sting + mech.audio.clearHoldSeconds;
    this.run.stats.ended++;
    // Before `recordBest`, so the best this run leaves behind includes the bonus it just earned.
    this.scorePopup(this.run.player.x * this.camera.viewport.laneWidthMeters, this.run.player.y, this.run.score.award('boss'));
    this.run.recordBest();
    this.sound('surface');
    saySplash(this.run.events);
    // The results card is not a banner: it stays up until the run moves on, so it is shown here and faded by
    // `updateTransientOverlays` -- which is also what writes its TEXT, because the layout is its business.
    sayResults(this.run.events);
    /**
     * Clearing the level, which is what unlocks the next one.
     *
     * Recorded HERE rather than where the results are shown, because this is the moment the player earned it -- and so
     * that a level reached by any route unlocks the next one the same way. `clear` returns the level it opened, if
     * any, and the banner NAMES it: an unlock that only shows up as a pill changing colour on a menu the player is not
     * looking at is an unlock nobody notices.
     */
    const clearText = `击败了 ${LEVEL.boss.name}  ·  吸收 ${this.run.stats.absorbed}  ·  最大体积 ${this.run.stats.maxVolume.toFixed(1)}×  ·  ${this.run.elapsed.toFixed(1)}s`;
    const unlocked = this.run.progress.clear(LEVEL.id);
    if (unlocked) {
      const opened = LEVELS.find((l) => l.id === unlocked);
      // ONE message, composed once: the unlock is part of the same moment, and appending it to the label on screen
      // would be a read-modify-write of a display object from inside a rule.
      this.banner(`${clearText}\n新关卡解锁：${opened?.name ?? unlocked}`);
      this.refreshLevelMenu();
    } else {
      this.banner(clearText);
    }
    /**
     * And then the run WALKS ON.
     *
     * A cleared level no longer ends the run at a results card: if there is a next one, the player is taken to it with
     * their score, their lives and their momentum intact. Two reasons, and they are the same reason: the ladder is six
     * levels long, so a results card after each one is five interruptions between the player and the ending; and a score
     * that restarts at zero can never express "how did the whole descent go", which is what a score is for.
     *
     * The final level is the exception, and it is the only place the run actually ends: `surfaced` is what the results
     * card reads, so leaving it set means the last level gets the ending it has always had.
     */
    const index = levelIndex(LEVEL.id);
    const next = LEVELS[index + 1];
    this.run.levelsClearedInRun = index + 1;
    if (next) this.run.pendingLevel = next.id;
    else this.run.runComplete = true;
  }

  /**
   * The bubble has left the top of the screen: hand over to the next level, or to the end of the run.
   *
   * This is the ONLY place a win moves the run on, which is what makes the sequence reliable: hold, flourish, rise,
   * leave -- and then one of two destinations, decided by whether there is a level after this one.
   */
  private finishLevelAndContinue(): void {
    if (this.run.pendingLevel) {
      const nextId = this.run.pendingLevel;
      this.run.pendingLevel = null;
      this.enterLevel(nextId, true);
      return;
    }
    // The last level: the run is over, and the summary is what says so.
    this.run.runComplete = true;
    this.run.phase = 'summary';
    this.music.stop();
    this.summary.show({
      score: this.run.score.value,
      levels: this.run.levelsClearedInRun,
      total: LEVELS.length,
      seconds: this.run.elapsedTotal,
      best: this.run.bestScore,
    });
  }


  /**
   * The overlays that are not the level: the screen shake, the surface flash, the two banners, the detonation rings.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS IS ADVANCED FROM `step` AND NOT FROM `render`
   * ---------------------------------------------------------------------------------------------
   * All of it used to tick inside the draw pass. Two things were wrong with that, and the second is the one that
   * matters: "how long is left" depended on how OFTEN the page was drawn rather than on how much time had passed, and
   * the detonation ring aged by a hardcoded 1/60 per frame while the rest of the world aged by the fixed 120 Hz step.
   * A frame runs between zero and eight steps, so the draw pass was a second, quieter clock for game state.
   *
   * State advances here; `render` reads it and nothing else. That is the rule this method exists to keep: a draw call
   * that can change what the next draw shows is a draw call whose result depends on how many times it ran.
   */
  private updateTransientOverlays(dt: number): void {
    if (this.shake.seconds > 0) this.shake.seconds = Math.max(0, this.shake.seconds - dt);
    if (this.splash > 0) this.splash = Math.max(0, this.splash - dt * 1.5);

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const boom = this.explosions[i]!;
      boom.age += dt;
      if (boom.age >= mech.explosions.seconds) this.explosions.splice(i, 1);
    }

    /**
     * The results card fades out, and is DROPPED the moment the run moves on.
     *
     * It used to fade only while the phase was `burst`, which meant a card left over from a death stayed on screen for
     * the whole of the next level if that level began from a phase it did not recognise -- and with the transition flow
     * there now are such phases. Anything that is not a run-ending burst clears it outright: a stale score floating over
     * a live level is worse than no card at all.
     */
    const cardBelongs = this.run.phase === 'burst' && this.run.runComplete === false && this.run.pendingLevel === null;
    if (cardBelongs) {
      this.finishBanner.alpha = Math.min(1, this.finishBanner.alpha);
      /**
       * Rewritten every step rather than set once, because the RECORD comparison is against a best that `recordBest`
       * has already updated -- so the card has to say "new record" from a flag captured at the moment the run ended,
       * not by re-comparing against a best that now includes this run.
       *
       * A cleared level mid-run gets the banner (which names the level it is walking into next) and no card: the card
       * is a full stop, and the ladder has five more levels to go. `surfaced` alone could not say this -- it is set by
       * every boss death, including the ones that lead onward.
       */
      this.finishBanner.text = this.run.surfaced
        ? `击败 ${LEVEL.boss.name}  ·  通关\n得分 ${this.run.score.value}  ·  吸收 ${this.run.stats.absorbed}  ·  最大 ${this.run.stats.maxVolume.toFixed(1)}×  ·  ${this.run.elapsed.toFixed(1)}s\n${this.run.stats.newRecord ? '★ 新纪录' : `最好 ${Math.round(this.run.bestClimbed)}m`}  ·  最佳得分 ${this.run.bestScore}`
        : `破裂  ·  深度 ${Math.round(this.run.player.depth(LEVEL.scrollLength))}m\n得分 ${this.run.score.value}  ·  吸收 ${this.run.stats.absorbed}  ·  爬升 ${Math.round(this.run.player.y)}m\n${this.run.stats.newRecord ? '★ 新纪录' : `最好 ${Math.round(this.run.bestClimbed)}m`}  ·  最佳得分 ${this.run.bestScore}`;
    } else if (this.finishBanner.alpha > 0) {
      this.finishBanner.alpha = Math.max(0, this.finishBanner.alpha - dt * 1.8);
      if (this.finishBanner.alpha <= 0.01) {
        this.finishBanner.alpha = 0;
        this.finishBanner.text = '';
      }
    }

    this.runBanner.alpha = Math.max(0, this.runBanner.alpha - dt * 0.28);
  }


  /**
   * Show a transient message across the middle of the screen.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS IS A METHOD AND NOT FIFTEEN COPIES OF TWO STATEMENTS
   * ---------------------------------------------------------------------------------------------
   * Every message in the game was written as `runBanner.text = …; runBanner.alpha = 1;`, which is three facts the
   * caller had to remember: the text, that showing it means resetting the alpha (a banner that was mid-fade would
   * otherwise appear at half opacity), and that a banner has been shown this run -- which is what `bannerSeen` records,
   * because a transient message cannot be caught by a probe that samples once a frame.
   *
   * Nine of the fifteen sites remembered all three; the rest remembered two. That is the shape of a rule that lives in
   * its callers.
   *
   * It queues an event now rather than writing the label, because a rule that holds a `Text` is a rule that needs a
   * renderer -- see `RunEvent` for the whole of that argument. The three statements live in `applyRunEvents`, which is
   * the only code left in this file that touches the banner's text, its alpha or `bannerSeen`.
   */
  private banner(text: string): void {
    sayBanner(this.run.events, text);
  }

  /** A cue for the synth. Same signature as `audio.play`, because the drain is a forward to it. */
  private sound(event: SoundEvent, intensity = 0.5): void {
    saySound(this.run.events, event, intensity);
  }

  /** A number rising off a place in the water, in WORLD metres: the drain hands the camera to the popup layer. */
  private scorePopup(x: number, y: number, points: number): void {
    sayScore(this.run.events, x, y, points);
  }


  /** Whether the carried skill's button exists. Input surface, so it is an OUTPUT of the run rather than a rule. */
  private skillSlot(carried: boolean): void {
    saySkillSlot(this.run.events, carried);
  }

  /**
   * Give the run's output to the display, in the order it was produced.
   *
   * ---------------------------------------------------------------------------------------------
   * THE ONLY PLACE THAT TOUCHES THE SCREEN FOR A RULE'S SAKE
   * ---------------------------------------------------------------------------------------------
   * Called immediately after each `step`, so a hit still sounds on the frame it happened rather than at the end of a
   * frame that ran eight sub-steps. Everything here is a forward to what the rule used to call directly, which is what
   * makes this a move rather than a rewrite -- and it is why the banner's three statements are here now: text, the alpha
   * reset, and `bannerSeen`, the flag that says a message has been raised this run.
   */
  private applyRunEvents(): void {
    for (const e of this.run.events) {
      switch (e.kind) {
        case 'banner':
          this.runBanner.text = e.text;
          this.runBanner.alpha = 1;
          this.bannerSeen = true;
          break;
        case 'sound':
          audio.play(e.event, e.intensity);
          break;
        case 'scorePopup':
          this.popups.add(e.x, e.y, e.points, this.camera);
          break;
        case 'damagePopup':
          this.damagePopups.add(e.x, e.y, e.amount, this.camera);
          break;
        case 'skillSlot':
          this.touch.setHasSkill(e.carried);
          break;
        case 'blast': {
          this.explosions.push({ x: e.x, y: e.y, radius: e.radius, age: 0 });
          /**
           * The shake is the loudness of the thing: a blast is the only event in the game that moves the SCREEN.
           *
           * Its size is measured against the window, which is the reason the rule does not do this itself -- and the
           * reason the numbers it uses are the bomb fish's: the blast is that creature's, and a second creature with a
           * blast will bring its own row when it has one.
           */
          const blastCfg = mech.hazards.bombfish;
          if (blastCfg.blastShakePixels > 0 && blastCfg.blastShakeSeconds > 0) {
            const screen = this.app.renderer.screen;
            this.shake = {
              seconds: blastCfg.blastShakeSeconds,
              total: blastCfg.blastShakeSeconds,
              pixels: blastCfg.blastShakePixels * designScale(screen.width, screen.height),
            };
          }
          break;
        }
        case 'splash':
          this.splash = 1;
          break;
        case 'results':
          this.finishBanner.alpha = 1;
          break;
      }
    }
    // Emptied rather than reallocated: this runs up to eight times a frame and the array is small but not free.
    this.run.events.length = 0;
  }

  private render(dt: number): void {
    /**
     * The screen shake, applied before anything is drawn.
     *
     * Read from the state `step` keeps, not decayed here: see `updateTransientOverlays`. Two offsets that do not divide
     * each other, so it reads as a rattle rather than as a sway, scaled by what is left of the duration so it ends where
     * it started -- at zero. Snapping back to centre at the end would be the one part of a shake the eye notices.
     */
    if (this.shake.seconds > 0) {
      const fade = this.shake.seconds / Math.max(0.001, this.shake.total);
      const amp = this.shake.pixels * fade;
      this.app.stage.position.set(Math.sin(this.run.elapsed * 61) * amp, Math.cos(this.run.elapsed * 47) * amp);
    } else if (this.app.stage.x !== 0 || this.app.stage.y !== 0) {
      this.app.stage.position.set(0, 0);
    }
    this.scene.update(this.camera, this.run.player, dt, this.run.scrolled, LEVEL);

    /**
     * The HUD and the water are hidden on the menu, on the codex page AND behind the loading page.
     *
     * All three draw an opaque backdrop, so leaving them visible underneath would only cost fill rate -- but the HUD
     * also reports a live depth for a level that is not running, which is worse than wasteful. The loading page is the
     * same argument with a control in it: everything it covers is something the player would otherwise be able to
     * touch while the pictures arrive, and a bubble that answers the finger on a page that has not started is exactly
     * the bug this list is here to prevent.
     */
    const fullScreenPage = this.run.phase === 'menu' || this.run.phase === 'codex' || this.run.phase === 'loading';
    const inMenu = this.run.phase === 'menu';
    this.hud.root.visible = !fullScreenPage;
    this.scene.root.visible = !fullScreenPage;
    // The water controls hide on those pages and behind the settings panel. The touch layer decides for itself
    // whether the skill button is drawn; this only decides whether the layer exists at all.
    this.touch.root.visible = !fullScreenPage && !this.settings.isOpen;
    this.flash.visible = this.flash.visible && !fullScreenPage;

    if (!fullScreenPage) {
      // The numbers floating where the points were earned. Cleared rather than frozen while a page is up: a popup
      // that resumes its three seconds after the menu closes would be a number with no event left to explain it.
      this.popups.update(dt);
      this.damagePopups.update(dt);
      this.hud.update({
        score: this.run.score.value,
        boss: this.bossView,
        progress: this.progressView,
        seed: this.seedLabel,
        talent: this.talentLabel,
        skill: this.run.skill ? { name: this.run.skill.name, uses: this.run.skill.uses } : null,
        player: this.run.player,
        fps: this.fps,
        nominalSeconds: this.run.nominalSeconds,
        elapsed: this.run.elapsed,
        lateral: this.run.lateral,
        scrolled: this.run.scrolled,
        level: LEVEL,
        world: {
          laneWidthMeters: this.camera.viewport.laneWidthMeters,
          visibleDepthMeters: this.camera.viewport.visibleDepthMeters,
        },
        stage: {
          stage: this.run.stage.stage,
          name: stageName(this.run.stage.stage),
        absorbedInStage: this.run.stage.absorbedInStage,
        /**
         * Whether this type grows at all, which the HUD needs to read the counter honestly.
         *
         * Without it the subline would show "幼泡 1阶 0/12" for a whole plain-bubble run: a countdown to something
         * that cannot happen, since that type does not grow.
         */
        grows: this.run.bubbleType.growsByAbsorbing,
        neededForNext: this.run.stage.neededForNext,
        tierBonus: this.tierBonus,
        /**
         * The second resource's readout, for the type that has one.
         *
         * The line AND the bar. It started as the line alone, on the argument that a bar is worth building when there
         * is something to spend rage on -- and the burst is exactly that: "how much have I got" becomes a question
         * with a threshold in it ("is that enough to clear this screen?"), which a number answers slowly and a bar
         * answers at a glance.
         */
        resource: this.run.bubbleType.resource
          ? {
              label: this.run.bubbleType.resource.label,
              /**
               * The countdown rides on the resource line while it runs.
               *
               * "失控 3.2" rather than a separate warning: the number that matters during overload is how long is
               * left, and it belongs beside the gauge it is counting down. The bar underneath empties or not
               * independently -- it shows the rage, this shows the clock.
               */
              text: this.overloaded
                ? `${Math.round(this.run.rage.rage)}  ${rageStageName(this.run.rage.rage)}  ${this.run.rage.overloadLeft.toFixed(1)}s`
                : `${Math.round(this.run.rage.rage)}  ${rageStageName(this.run.rage.rage)}`,
              colour: rageColor(this.run.rage.rage),
              fraction: rageFraction(this.run.rage.rage),
            }
          : null,
        },
      });
      this.touch.update();
      this.drawPickups();
      this.drawBubble();
    }

    // The gear must not be reachable while a full-screen page is up, and the panel goes with it.
    this.settings.root.visible = !fullScreenPage;
    this.settings.update();
    /**
     * Nothing of the run is on screen under a full-screen page, and the floating numbers go with it.
     *
     * Cleared rather than hidden: a popup that resumed its three seconds after the menu closed would be a number with
     * no event left on screen to explain it, three seconds stale.
     */
    this.popups.root.visible = !fullScreenPage;
    this.damagePopups.root.visible = !fullScreenPage;
    if (fullScreenPage) {
      this.popups.clear();
      this.damagePopups.clear();
    }
    this.menu.root.visible = inMenu;
    if (inMenu) this.menu.update(dt);
    // The codex draws nothing per frame: a tab press, a page turn and a resize each schedule their own redraw.
    this.codex.root.visible = this.run.phase === 'codex';
    /**
     * The loading page shows for exactly as long as the phase says, rather than being turned on and off by the loader.
     *
     * One owner for `visible` means the page cannot be left up by a path that forgot to hide it, and it goes away on
     * the frame the run's first phase begins. Its DRAWING is still the loader's business: this only says when it may
     * be seen.
     */
    this.loading.root.visible = this.run.phase === 'loading';
    /**
     * The banners and the results card are NOT touched here.
     *
     * Their alpha, their text and the card's record line are all advanced by `updateTransientOverlays`, from `step`:
     * this pass reads state and draws it. See that method for why.
     */

    /**
     * The surface white-out: a short, hard flash that fades.
     *
     * Deliberately fast and short. The design asks for a "short white screen" as a beat between
     * breaking through and reading the results -- long enough to feel like a transition, short enough
     * that it never reads as a loading screen. A death gets no flash at all, which is what makes the
     * two endings feel different in the hands.
     *
     * The countdown is `step`'s; this only shows what is left of it.
     */
    if (this.splash > 0) {
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

    for (const b of this.run.field.bubbles) {
      const r = laneWidth * b.radius;
      // Lateral wobble: small bubbles shimmy, large ones hold their shape. Cosmetic, and small
      // enough that it never changes when a bubble passes the player.
      const drift = Math.sin(b.phase) * r * b.wobble;
      const x = b.x + drift;
      // Bigger bubbles are brighter; anything bigger than the player reads as a threat.
      const playerR = laneWidth * stageRadiusFraction(this.run.stage.stage, this.run.player.volume);
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
    for (const s of this.run.field.specks) {
      if (s.drift > 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xeafcff, alpha: 0.34 });
    for (const s of this.run.field.specks) {
      if (s.drift <= 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xdff6ff, alpha: 0.18 });

    // Hazards last in this layer, so they sit on top of the water and the collectables. They are the
    // things the player must READ, so nothing should be drawn over them.
    //
    // `canEat` is the same function the collision uses, asked again here to draw the edibility marker. One
    // source of truth on purpose: a marker that promised food while the collision delivered a hit would be the
    // worst bug this feature could have, because it would punish the player for trusting what they saw.
    paintHazards(g, this.run.hazards, laneWidth, this.run.elapsed, (kind) => this.run.canSwallow(kind), 'in-play', this.run.player.x * laneWidth);

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
    paintHazards(leavingG, this.run.hazards, laneWidth, this.run.elapsed, (kind) => this.run.canSwallow(kind), 'leaving', this.run.player.x * laneWidth);

    /**
     * Obstacles, UNDER the hazards.
     *
     * They are scenery: a fish swimming in front of a crate has to stay visible, because the fish is what will
     * hurt you. The crate only matters when you are about to hit it.
     */
    paintObstacles(g, this.run.obstacles, laneWidth);

    /**
     * The suction field, drawn UNDER everything else in the water.
     *
     * Under, because it is an area rather than an object: drawing it over the collectables would obscure the
     * things it is about to drag in, which is the opposite of what a gathering mechanic needs. Two rings that
     * contract toward the bubble, animated rather than static, so the direction of the pull is legible even when
     * nothing is currently in range to demonstrate it.
     */
    if (this.suctionUp) {
      const cx = this.run.player.x * laneWidth;
      const cy = this.run.player.y;
      /**
       * Over capacity, the field runs away with itself: a bigger radius that drags in MORE than the player can
       * eat. That is the punishment mixed with temptation -- you cannot help pulling things toward a mouth that is
       * already full, which is exactly the pressure the design's over-eating state is supposed to create.
       */
      const overloadBonus = this.run.stomach.overloaded ? mech.spit.overloadSuctionFactor : 1;
      const reach = laneWidth * suctionRadiusFraction(this.run.player.volume) * overloadBonus;
      g.circle(cx, cy, reach).fill({ color: mech.suction.fieldColor, alpha: mech.suction.fieldAlpha * 0.35 });
      g.circle(cx, cy, reach).stroke({
        color: mech.suction.fieldColor,
        alpha: mech.suction.fieldAlpha,
        width: Math.max(1, laneWidth * mech.suction.fieldWidthRatio),
      });
      // Inward-travelling rings: each one starts at the rim and converges, which reads as flow.
      for (let i = 0; i < 2; i++) {
        const t = ((this.run.elapsed * 0.9 + i * 0.5) % 1 + 1) % 1;
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
    /**
     * The player's rounds: either the drawn dots or the supplied picture, never both.
     *
     * They go through the same "one name, one sprite" discipline as the bubble, but by POOL: a bullet is on screen for a
     * fraction of a second and there are dozens of them, so a sprite is created the first time an id is seen and then kept
     * for reuse. Creating one per frame is what made the bubble enormous twice over, and with bullets it would be that
     * every frame.
     */
    const bulletArt = this.syncBulletSprites(g, laneWidth);
    this.hitParticles.draw();

    if (!bulletArt) paintBullets(g, this.run.bullets, laneWidth);

    /**
     * The enemies' rounds, drawn after the scenery so cover never hides what can kill you.
     *
     * Scenery BLOCKS them (so a crate is real cover), but drawing them behind it would make a round about to emerge
     * from the far side of a crate invisible until it did -- and this whole feature's contract is that everything
     * lethal is visible before it lands.
     */
    paintEnemyBullets(g, this.run.enemyBullets, laneWidth);
    /**
     * Projectiles, drawn IN FLIGHT from the stomach.
     *
     * Each keeps the silhouette of the hazard it was, tinted with a hot rim so a flying crab is legible as
     * *something the player threw* rather than as a crab that happens to be moving fast. That distinction matters:
     * one is a threat and the other is the player's own ammunition, and they can be on screen together.
     */
    for (const p of this.run.projectiles) {      const r = laneWidth * p.radiusFraction;
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
    if (this.run.decoy && this.run.decoy.until > this.run.elapsed) {
      const r = laneWidth * 0.052;
      g.circle(this.run.decoy.x, this.run.decoy.y, r).fill({ color: 0xc9ffe8, alpha: 0.4 });
      g.circle(this.run.decoy.x, this.run.decoy.y, r).stroke({ color: 0x9dffd8, alpha: 0.95, width: r * 0.16 });
      g.circle(this.run.decoy.x, this.run.decoy.y, r * 1.5).stroke({ color: 0x9dffd8, alpha: 0.3, width: r * 0.08 });
    } else if (this.run.decoy) {
      this.run.decoy = null;
    }

    // A skill lying in the water: a diamond, distinct from every collectable, with a halo so it
    // reads as "pick me up" rather than as another bubble.
    /**
     * Detonations, drawn as an expanding ring that fades.
     *
     * Drawn in the world with everything else, from a list that `step` ages: the creature is gone by now, so this is
     * the only thing left to say "that was a bomb, and it was that big".
     *
     * Every number here is the config's, including the two that used to be literals on these lines: what a blast LOOKS
     * like is a thing to tune, and a number written into a draw call is not tunable from the file.
     */
    const boomCfg = mech.explosions;
    for (const boom of this.explosions) {
      const t = Math.min(1, boom.age / boomCfg.seconds);
      const fade = 1 - t;
      const from = (a: number, b: number): number => a + (b - a) * t;
      g.circle(boom.x, boom.y, boom.radius * from(boomCfg.strokeStartRatio, boomCfg.strokeEndRatio)).stroke({
        color: boomCfg.strokeColour,
        alpha: boomCfg.strokeAlpha * fade,
        width: Math.max(1, boom.radius * boomCfg.strokeWidthRatio * fade),
      });
      g.circle(boom.x, boom.y, boom.radius * from(boomCfg.coreStartRatio, boomCfg.coreEndRatio)).fill({
        color: boomCfg.coreColour,
        alpha: boomCfg.coreAlpha * fade,
      });
    }

    /**
     * LEVEL 3's two readings, drawn on the BUBBLE rather than in a corner.
     *
     * The charge is a property of the bubble -- it is the bubble that is dangerous to approach -- so it is shown where
     * the bubble is, the same argument the rage ring and the stomach contents follow. The ring's thickness is the
     * charge, so "am I about to ignite" is answered without reading a number, and the burst ring is the discharge
     * itself, at the radius the chain actually reached.
     */
    const chargeCfg = mech.hazards.charge;
    if (this.run.charge > 0 && this.run.phase === 'playing') {
      const bubbleR = laneWidth * stageRadiusFraction(this.run.stage.stage, this.run.player.volume);
      const fraction = Math.min(1, this.run.charge / Math.max(1, chargeCfg.max));
      const armed = this.run.charge >= chargeCfg.chainAt;
      const flicker = armed ? 0.7 + 0.3 * Math.sin(this.run.elapsed * 26) : 1;
      g.circle(this.run.player.x * laneWidth, this.run.player.y, bubbleR * 1.16).stroke({
        color: chargeCfg.bubbleRingColour,
        alpha: (armed ? 0.85 : 0.4) * fraction * flicker,
        width: Math.max(1, laneWidth * chargeCfg.bubbleRingWidthRatio * (armed ? 1.6 : 1)),
      });
    }
    if (this.run.chargeBurst > 0) {
      const left = Math.max(0, this.run.chargeBurst / Math.max(0.01, chargeCfg.burstSeconds));
      g.circle(this.run.player.x * laneWidth, this.run.player.y, this.run.chargeBurstRadius * (1.6 - 0.6 * left)).stroke({
        color: chargeCfg.burstColour,
        alpha: chargeCfg.burstAlpha * left,
        width: Math.max(1, laneWidth * 0.03 * left),
      });
    }

    for (const p of this.run.pickupDrops) {
      const look = mech.pickups[p.kind];
      const r = laneWidth * look.radiusRatio;
      const pulse = 1 + Math.sin(this.run.elapsed * mech.pickups.pulsePerSecond) * 0.12;
      g.circle(p.x, p.y, r * 2.1 * pulse).fill({ color: look.haloColour, alpha: look.haloAlpha });
      if (p.kind === 'rate') {
        /**
         * A single chevron with speed dashes either side: "faster", where the rows upgrade is "more".
         *
         * Shape before colour, the same rule as the other two -- a player reading the water in peripheral vision has to
         * tell "my gun shoots quicker" from "my gun shoots wider" before they can read a word.
         */
        g.moveTo(p.x - r * pulse, p.y - r * 0.3)
          .lineTo(p.x, p.y + r * 0.42)
          .lineTo(p.x + r * pulse, p.y - r * 0.3)
          .stroke({ color: look.coreColour, alpha: look.coreAlpha, width: Math.max(1, r * 0.3) });
        for (const side of [-1, 1]) {
          g.moveTo(p.x + side * r * 1.15, p.y - r * 0.34)
            .lineTo(p.x + side * r * 1.75, p.y - r * 0.34)
            .stroke({ color: look.coreColour, alpha: look.coreAlpha * 0.6, width: Math.max(1, r * 0.22) });
          g.moveTo(p.x + side * r * 1.15, p.y + r * 0.16)
            .lineTo(p.x + side * r * 1.6, p.y + r * 0.16)
            .stroke({ color: look.coreColour, alpha: look.coreAlpha * 0.6, width: Math.max(1, r * 0.22) });
        }
        g.circle(p.x, p.y, r * 1.05 * pulse).stroke({ color: look.rimColour, alpha: look.rimAlpha * 0.5, width: Math.max(1, r * 0.12) });
      } else if (p.kind === 'upgrade') {
        /**
         * Stacked chevrons, pointing up the lane.
         *
         * Shape is the first thing peripheral vision resolves, and the two pickups do completely different things --
         * one swaps the skill slot, one permanently widens the gun -- so they must not be the same silhouette. Two
         * arrows also say "more rows" without a word of text, which is what the pickup actually does.
         */
        for (const band of [-1, 1]) {
          const y = p.y + band * r * 0.52 * pulse;
          g.moveTo(p.x - r * pulse, y - r * 0.34)
            .lineTo(p.x, y + r * 0.34)
            .lineTo(p.x + r * pulse, y - r * 0.34)
            .stroke({ color: look.coreColour, alpha: look.coreAlpha, width: Math.max(1, r * 0.3) });
        }
        g.circle(p.x, p.y, r * 1.05 * pulse).stroke({ color: look.rimColour, alpha: look.rimAlpha * 0.5, width: Math.max(1, r * 0.12) });
      } else {
        g.moveTo(p.x, p.y - r * pulse)
          .lineTo(p.x + r * pulse, p.y)
          .lineTo(p.x, p.y + r * pulse)
          .lineTo(p.x - r * pulse, p.y)
          .closePath()
          .fill({ color: look.coreColour, alpha: look.coreAlpha });
        g.moveTo(p.x, p.y - r * pulse)
          .lineTo(p.x + r * pulse, p.y)
          .lineTo(p.x, p.y + r * pulse)
          .lineTo(p.x - r * pulse, p.y)
          .closePath()
          .stroke({ color: look.rimColour, alpha: look.rimAlpha, width: r * 0.14 });
      }
    }
  }

  /** The player's bubble, in world metres. */
  private drawBubble(): void {
    const viewport = this.camera.viewport;
    // Intro: the bubble is born at the seabed and inflates.
    /**
     * The intro is an ARRIVAL, not an inflation.
     *
     * It used to scale the bubble up from a quarter of its size, which said "a new bubble is being born". The run now
     * ENDS each level by flying the bubble off the top of the screen, so the matching entrance is the same gesture the
     * other way round: it comes up from below the bottom edge and settles into place. `growth` stays at 1 -- the bubble
     * is already the size it is -- and the motion comes from `screenY` in `stepIntro`.
     */
    const growth = 1;
    const eased = growth * growth * (3 - 2 * growth); // smoothstep

    // Burst: the bubble expands and fades instead of vanishing.
    const burstT = this.run.phase === 'burst' ? 1 - Math.max(0, this.run.phaseTimer) / BURST_SECONDS : 0;
    const burstScale = 1 + burstT * 1.8;
    const burstAlpha = this.run.phase === 'burst' ? Math.max(0, 1 - burstT * 1.15) : 1;

    const radius =
      viewport.laneWidthMeters * stageRadiusFraction(this.run.stage.stage, this.run.player.volume) * (0.25 + 0.75 * eased) * burstScale *
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
    const look = bubbleLook(this.run.bubbleType, this.run.stage.stage, this.run.rage.rage);
    const drawnX = this.run.player.x * viewport.laneWidthMeters + bubbleShake(look, this.run.elapsed) * viewport.laneWidthMeters;
    const drawnRadius = radius * bubbleSwell(look, this.run.elapsed);

    /**
     * The burst's wave: an expanding ring that means "this is how far it reached".
     *
     * Drawn from where the bubble was when it fired -- which is where it still is, since the wave lasts a third of a
     * second and the ring is measured from the player's own position -- and drawn under the bubble, on its own
     * layer. The effects all landed on the frame of the press; this is the receipt.
     */
    this.drawBurstWave(drawnX, this.run.player.y, look.rim);

    // Blink while invulnerable: the single cross-type rule that stops a swarm chain-killing.
    const blink = this.run.invulnerable > 0 ? 0.45 + 0.55 * Math.abs(Math.sin(this.run.invulnerable * 22)) : 1;

    this.paintBubble(
      drawnX,
      this.run.player.y,
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
      stomachBulge(this.run.stomach.swell),
      this.run.stomach.overloaded ? this.overloadPulse() : { phase: 0, strength: 0 },
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
    const items = this.run.stomach.detail;
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
      const blink = panic ? 0.35 + 0.65 * Math.abs(Math.sin(this.run.elapsed * look.fuseBlinkHz * Math.PI)) : 1;

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
    const fraction = this.run.stomach.fuseFraction;
    const panic = fraction <= mech.spit.panicBelowFraction;
    const hz = mech.spit.pulseHz * (panic ? mech.spit.panicPulseFactor : 1);
    return { phase: this.run.elapsed * hz * Math.PI * 2, strength: panic ? 1 : 0.5 };
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
    if (!this.run.burst) return;
    const cfg = mech.angry.burst;
    const t = Math.min(1, this.run.burst.seconds / cfg.waveSeconds);
    const waveR = this.run.burst.radius * (0.35 + 0.65 * t);
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

  /**
   * The player bubble's picture, if `playerBubble.image` names one.
   *
   * Built once and reused: the bubble is on screen every frame, and rebuilding a Sprite per frame is how a game drops to
   * single-digit frames. It is added to the SAME parent as the drawn bubble, so it inherits the camera transform and can
   * be positioned in world coordinates like everything else in the water.
   */
  private bubbleSprite: Sprite | null = null;
  /**
   * One sprite per live bullet SLOT, reused.
   *
   * By index rather than by id, because a bullet has no id: they are interchangeable, so slot 3 being a different round
   * this frame than last frame is invisible. What matters is that the pool never grows past the number of rounds on
   * screen, which is what keeps this from being the "one sprite per frame" bug with bullets.
   */
  private readonly bulletSprites: Sprite[] = [];
  private bubbleSpriteFor = '';

  /**
   * Place one sprite per live bullet, and report whether the picture is being drawn at all.
   *
   * The texture is shared by every bullet and asked for by name, not built: Pixi's asset manager already holds it (the
   * loading screen fetched every picture before the run began), so this is a cache lookup and a sprite scale. Bullets are
   * pooled because they are created and destroyed constantly.
   */
  private syncBulletSprites(g: Graphics, laneWidth: number): boolean {
    const cfg = mech.bullets;
    if (!cfg.image) {
      for (const sprite of this.bulletSprites) sprite.visible = false;
      return false;
    }
    /**
     * Until the picture is ready, the DOTS are drawn.
     *
     * Returning "handled" while the texture was still loading left the player firing nothing at all -- invisible rounds
     * for as long as the load took, and for ever if it failed. The art is an upgrade to the rounds, not a precondition
     * for them.
     */
    const texture = assetTextureNow(cfg.image);
    if (!texture) return false;
    const size = laneWidth * mech.bullets.radiusRatio * 2 * cfg.imageScale;
    // The world is Y-flipped, so the sprite's own Y is negative to keep the picture upright; see the bubble.
    const scale = size / texture.width;
    if (!Number.isFinite(scale) || scale <= 0) return true;
    const list = this.run.bullets.bullets;
    for (const [index, bullet] of list.entries()) {
      let sprite = this.bulletSprites[index];
      if (!sprite) {
        sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.eventMode = 'none';
        // The same container the drawn round goes into, so it inherits exactly the transform the dots had.
        g.parent?.addChildAt(sprite, g.parent.getChildIndex(g));
        this.bulletSprites[index] = sprite;
      }
      sprite.visible = true;
      sprite.x = bullet.x;
      sprite.y = bullet.y;
      sprite.alpha = cfg.imageAlpha;
      sprite.tint = cfg.imageTint;
      sprite.scale.set(scale, -Math.abs(scale));
    }
    for (let i = list.length; i < this.bulletSprites.length; i++) this.bulletSprites[i]!.visible = false;
    return true;
  }

  /**
   * Load (once) and place the player's picture for this frame. See `playerBubble` in the config.
   *
   * Three things are worth naming. It asks PIXI for the texture by name rather than building one, which is what keeps the
   * bubble and every other picture of the same file on one GPU texture -- and the whole `decode`-before-you-measure dance
   * that once made the bubble enormous is gone with it, because the asset manager never hands out a zero-width texture. It is
   * built ONCE per image name, because the bubble is drawn every frame. And the size is `radius * imageScale`, so art with
   * padding around the ball can be corrected without touching code.
   */
  private syncBubbleSprite(worldX: number, worldY: number, radius: number, alpha: number): boolean {
    const cfg = mech.playerBubble;
    if (!cfg.image) {
      if (this.bubbleSprite) this.bubbleSprite.visible = false;
      return false;
    }
    /**
     * ONE sprite per image name, and the name is what is remembered -- not the sprite.
     *
     * The first version keyed on the sprite itself, which is null until the picture finishes loading, so every frame in
     * between added ANOTHER sprite. They all eventually arrived at the correct size except the ones that had already been
     * positioned while the camera was still being set up, and those stayed on screen for ever as the giant bubble at the
     * left edge the owner photographed.
     */
    if (this.bubbleSpriteFor !== cfg.image) {
      this.bubbleSpriteFor = cfg.image;
      this.bubbleSprite?.destroy();
      this.bubbleSprite = null;
      const texture = assetTextureNow(cfg.image);
      if (texture) {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.eventMode = 'none';
        // The same parent as the drawn bubble, so it lives in world coordinates like everything else in the water.
        this.bubble.parent?.addChildAt(sprite, this.bubble.parent.getChildIndex(this.bubble));
        this.bubbleSprite = sprite;
      }
    }
    const sprite = this.bubbleSprite;
    if (!sprite) return false;
    sprite.visible = alpha > 0.01;
    sprite.x = worldX;
    sprite.y = worldY;
    sprite.alpha = cfg.imageAlpha * alpha;
    sprite.tint = cfg.imageTint;
    const size = radius * 2 * cfg.imageScale;
    if (sprite.texture.width <= 0) return false;
    const scale = size / sprite.texture.width;
    if (!Number.isFinite(scale) || scale <= 0) return false;
    /**
     * The world container is Y-FLIPPED (world +y is up, screen +y is down), so a picture placed in it comes out mirrored.
     * The drawn bubble is symmetric top to bottom, so nothing ever showed it; a picture with a highlight does, and the
     * owner saw it as "the rotation is wrong". Counter-flipping the sprite's own Y makes the art upright, and
     * `imageRotation` is then free to be exactly what it says -- the picture's own angle.
     */
    const flip = worldYIsFlipped(sprite) ? -1 : 1;
    sprite.scale.set(scale, scale * flip);
    sprite.rotation = (cfg.imageRotation * Math.PI) / 180;
    // Scale rather than width/height: width divides by the texture's own size, which is how a zero-width texture
    // became an enormous sprite in the first place.
    return true;
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
    /**
     * The picture, if there is one.
     *
     * Positioned and scaled here and returned from: with art configured, the procedural pass is not "also drawn", it is
     * not drawn at all (unless `keepDetails`). Every stage's colour still reaches the picture through the tint, so the
     * skin does not cost the game the thing that says which stage the player is in.
     */
    const art = this.syncBubbleSprite(worldX, worldY, radius, alpha);
    if (art && !mech.playerBubble.keepDetails) return;
    // Graphics retains its path between `clear()` calls, so both must be cleared every frame.
    // Leaving them dirty is what drew a stray line from the bubble to the finish banner.
    g.clear();
    p.clear();

    if (alpha <= 0.01) return;

    const speed = Math.hypot(this.run.player.vx * 100, this.run.player.vy);
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
    const look = bubbleLook(this.run.bubbleType, this.run.stage.stage, this.run.rage.rage);

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
    if (this.run.player.slowRemaining > 0) {
      const fade = Math.min(1, this.run.player.slowRemaining / 0.4);
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
    if (this.run.player.misfiring) {
      const colour = mech.hazards.eel.shockColor;
      const strobe = 0.45 + 0.55 * Math.abs(Math.sin(this.run.elapsed * 34));
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
      g.stroke({ color: colour, alpha: strobe * alpha, width: radius * mech.hazards.eel.shockWidthRatio });
      // A few bolts off the rim, so it reads as discharge rather than as a decorative outline.
      for (let i = 0; i < 3; i++) {
        const a = this.run.elapsed * 5 + (i / 3) * Math.PI * 2;
        g.moveTo(worldX + Math.cos(a) * radius * 1.3, worldY + Math.sin(a) * radius * 1.3)
          .lineTo(worldX + Math.cos(a + 0.35) * radius * 1.75, worldY + Math.sin(a + 0.35) * radius * 1.75)
          .stroke({ color: colour, alpha: 0.7 * strobe * alpha, width: radius * mech.hazards.eel.shockWidthRatio * 0.6 });
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
    const digesting = this.run.compressing && !this.run.stomach.overloaded;
    const bodyRim = this.run.stomach.overloaded ? mech.spit.rimColor : digesting ? mech.digest.rimColor : look.rim;
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
    const digestPulse = digesting ? 0.5 + 0.5 * Math.sin(this.run.elapsed * mech.digest.pulseHz * Math.PI * 2) : 0;
    const rimAlpha = look.rimAlpha * alpha * (digesting ? 1 - mech.digest.pulseDepth * (1 - digestPulse) : 1);
    const bulgeAt = (angle: number): number => {
      if (bulge <= 0) return 1;
      const wobble = pulse.strength > 0 ? pulse.phase : this.run.elapsed * 2;
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
      const phase = this.run.elapsed * (0.9 + i * 0.23) + i * 2.1;
      const wobble = Math.sin(phase) * radius * 0.9;
      const rise = ((phase * 14) % (radius * 3.4)) + radius * 0.9;
      p.circle(worldX + wobble, worldY - radius - rise, Math.max(0.06, radius * (0.06 + i * 0.02)));
    }
    p.fill({ color: 0xe8feff, alpha: 0.24 * alpha });
  }

  /** Diagnostics for automated smoke checks. */
  /**
   * The frame, for a probe. The report itself is a function of a snapshot -- see `src/diagnostics.ts`.
   *
   * The snapshot is built here rather than inside the module because this is the only place that can: the state is
   * private, and the five derived members are asked of the getters that own them rather than recomputed.
   */
  get diagnostics() {
    return diagnosticsOf({
      player: this.run.player,
      field: this.run.field,
      hazards: this.run.hazards,
      obstacles: this.run.obstacles,
      bullets: this.run.bullets,
      enemyBullets: this.run.enemyBullets,
      projectiles: this.run.projectiles,
      pickupDrops: this.run.pickupDrops,
      stomach: this.run.stomach,
      score: this.run.score,
      progress: this.run.progress,
      stats: this.run.stats,
      stage: this.run.stage,
      bubbleType: this.run.bubbleType,
      lateral: this.run.lateral,
      rage: this.run.rage,
      talentEffects: this.run.talentEffects,
      phase: this.run.phase,
      phaseTimer: this.run.phaseTimer,
      scrolled: this.run.scrolled,
      elapsed: this.run.elapsed,
      timelineEmitted: this.run.timelineEmitted,
      spawnedBySide: this.run.spawnedBySide,
      skill: this.run.skill,
      skillActivations: this.run.skillActivations,
      invulnerable: this.run.invulnerable,
      burst: this.run.burst,
      bursts: this.run.bursts,
      chargeAim: this.run.chargeAim,
      charging: this.run.charging,
      compressing: this.run.compressing,
      comedyBeats: this.run.comedyBeats,
      lastComedyBeat: this.run.lastComedyBeat,
      lastEaten: this.run.lastEaten,
      lastEvent: this.run.lastEvent,
      destroyedMass: this.run.destroyedMass,
      digested: this.run.digested,
      digestedMass: this.run.digestedMass,
      growthEnergy: this.run.growthEnergy,
      internalHits: this.run.internalHits,
      farts: this.run.farts,
      slams: this.run.slams,
      slamSeconds: this.run.slamSeconds,
      spitClogs: this.run.spitClogs,
      spitHits: this.run.spitHits,
      stomachDrain: this.run.stomachDrain,
      trashDrain: this.run.trashDrain,
      eventsSeen: this.run.eventsSeen,
      eventsFired: this.run.eventsFired,
      bannerSeen: this.bannerSeen,
      surfaced: this.run.surfaced,
      bestClimbed: this.run.bestClimbed,
      bestScore: this.run.bestScore,
      bestVolume: this.run.bestVolume,
      nominalSeconds: this.run.nominalSeconds,
      overloaded: this.overloaded,
      onSlam: this.onSlam,
      suctionUp: this.suctionUp,
      tierBonus: this.tierBonus,
      burstRadiusRatio: this.run.burstRadiusRatio(),
      camera: this.camera,
      popups: this.popups,
      damagePopups: this.damagePopups,
      finishBanner: this.finishBanner,
      codex: this.codex,
      splash: this.splash,
      audioMuted: this.audioMuted,
      fps: this.fps,
      frameCount: this.frameCount,
      lastDelta: this.lastDelta,
    });
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
    this.teleportToDistance(LEVEL.scrollLength - 0.2);
  }

  /**
   * Test hook: jump the level to a given DISTANCE travelled.
   *
   * This is what `teleportToSurface` means now that the surface is not the finish line: the level's length is where the
   * boss waits, so a probe wants "put me in front of the boss", not "put me at the top". Moves the SCROLL rather than
   * the player, for the same reason as before -- the level's progress is not the bubble's position.
   */
  teleportToDistance(meters: number): void {
    this.run.scrolled = Math.max(0, Math.min(LEVEL.scrollLength, meters));
    this.camera.setScroll(this.run.scrolled);
    this.run.player.syncToCamera(this.camera.y, this.camera.viewport.visibleDepthMeters);
    this.run.player.vy = 0;
  }

  /**
   * Test hook: place a bubble of a given size exactly on the player, so absorption and damage can
   * be exercised deterministically instead of waiting for a random collision.
   *
   * @param sizeRatio bubble radius as a multiple of the player's radius. <1 is edible, >1 hurts.
   */
  spawnBubbleOnPlayer(sizeRatio: number): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerRadius = laneWidth * stageRadiusFraction(this.run.stage.stage, this.run.player.volume);
    const radius = (playerRadius * sizeRatio) / laneWidth;
    this.run.field.addTestBubble({
      x: this.run.player.x * laneWidth,
      y: this.run.player.y,
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
    const playerRadius = laneWidth * stageRadiusFraction(this.run.stage.stage, this.run.player.volume);
    const radius = (playerRadius * sizeRatio) / laneWidth;
    const volume = bubbleVolumeFromRadius(radius);
    const ascent = this.run.player.vy > 0 ? this.run.player.vy : 1.7;
    // Its real relative speed, solved the same way the field does: positive drifts down-screen.
    const relative = bubbleRelativeFallRatio(volume, this.run.player.volume) * ascent;
    this.run.field.addTestBubble({
      x: this.run.player.x * laneWidth,
      y: this.run.player.y,
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
    this.run.invulnerable = 0;
    this.run.takeHit();
  }

  /** Test hook: the obstacle field, so a probe can inspect or place individual obstacles. */
  get obstaclesRef(): ObstacleField {
    return this.run.obstacles;
  }

  /** Test hook: the collectable field, so a probe can inspect individual bubbles. */
  get fieldRef(): EntityField {
    return this.run.field;
  }

  /**
   * Test hook: the projectiles in flight.
   *
   * Read-only so a probe can watch one travel without being able to move it -- a test that repositioned a
   * projectile would be testing its own arithmetic rather than the game's.
   */
  get projectilesRef(): readonly SpitProjectile[] {
    return this.run.projectiles;
  }

  /** Test hook: the stomach, so a probe can read the queue and its capacity. */
  get stomachRef(): Stomach {
    return this.run.stomach;
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
    const before = this.run.player.volume;
    this.run.player.volume = growByAbsorbing(this.run.player.volume, massFromEating(kind));
    const gained = this.run.player.volume - before;
    this.run.stomach.swallow(kind, gained, stomachEffect(kind));
    this.run.stats.absorbed++;
    /**
     * The score is awarded here too, because this hook stands in for the collision path above and has to leave the run
     * in the state that path would have: a probe that swallowed something and then found the score unmoved would be
     * right to call it a bug, and the ledger is meant to be checkable for each event.
     */
    this.scorePopup(this.run.player.x * this.camera.viewport.laneWidthMeters, this.run.player.y, this.run.score.award('eaten'));
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
    return this.run.field.solveBubbleVelocity(bubbleVolume, playerVolume);
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
    const b = this.run.field.bubbles.find((c) => this.camera.toScreenY(c.y) > 0 && this.camera.toScreenY(c.y) < this.camera.viewport.height);
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
    const nearest = this.run.field.bubbles.reduce<Bubble | null>(
      (best, b) => (!best || Math.abs(b.y - this.run.player.y) < Math.abs(best.y - this.run.player.y) ? b : best),
      null,
    );
    const far = this.run.field.specks.find((s) => s.drift <= 0) ?? null;
    const near = this.run.field.specks.find((s) => s.drift > 0) ?? null;
    // Track by id: "the nearest bubble" changes identity as bubbles stream past, so measuring it
    // twice compares two different objects and reports nonsense.
    const tracked =
      this.trackedBubbleId !== null ? this.run.field.bubbles.find((b) => b.id === this.trackedBubbleId) ?? null : null;
    return {
      playerScreenY: +cam.toScreenY(this.run.player.y).toFixed(2),
      playerScreenYRatio: +(cam.toScreenY(this.run.player.y) / cam.viewport.height).toFixed(4),
      cameraY: +cam.y.toFixed(2),
      depth: +this.run.player.depth(LEVEL.scrollLength).toFixed(2),
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
        ? +(tracked.radius / Math.max(1e-6, stageRadiusFraction(this.run.stage.stage, this.run.player.volume))).toFixed(3)
        : null,
      trackedBubbleRiseRatio: tracked ? +bubbleRiseRatio(tracked.volume, this.run.player.volume).toFixed(3) : null,
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
      fieldScrollSpeedMps: +this.run.field.cruiseAscentSpeed.toFixed(3),
      /**
       * Every visible collectable with its size and relative motion, sorted smallest first.
       *
       * Provided by the game rather than recomputed in the probe: an earlier probe version mixed
       * metre-scaled lane width with lane-relative radii and produced a column of zeros, which read
       * like a game bug instead of a probe bug.
       */
      collectables: this.run.field.bubbles
        .map((b) => ({
          sizeRatio: +(b.radius / Math.max(1e-6, stageRadiusFraction(this.run.stage.stage, this.run.player.volume))).toFixed(3),
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
      ascentSpeed: +this.run.player.vy.toFixed(3),
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































































































































