import { Application, Graphics } from 'pixi.js';
import { Camera, Hud, WorldLayer, computeViewport, createApp, designScale, makeLabel, waterColourForTest, type Landmark } from './background';
import { tuning } from './config';
import { DEPTH_TOTAL, LEVEL, TIMELINE, type Level, type LevelEntry } from './levels';
import { HazardField, hazardTuning, paintHazards, type HazardKind } from './hazards';
import { pickTalent, resolveTalent, talentTuning, fartPushFor, fartBaitCount, TALENTS, type TalentEffects } from './talents';
import { activationFor, findSkill, skillTuning, SKILLS, type Skill, type SkillId } from './skills';
import { audio } from './audio';
import { nominalAscentSeconds, secondsPerScreenSeries } from './depth';
import { EntityField, type Bubble } from './entities';
import { Input } from './input';
import { calibrateLateral, type LateralAuthority } from './lateral';
import { Player } from './player';
import { TouchControls } from './touch';
import { bubbleRelativeFallRatio, bubbleRiseRatio, bubbleVolumeFromRadius, growByAbsorbing, hitsSurvived, isPopped, shrinkFromHit, visualRadiusFraction } from './volume';

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

class Game {
  private readonly player = new Player();
  private readonly input = new Input();
  private readonly camera = new Camera();
  private readonly scene = new WorldLayer();
  private readonly hud = new Hud(LANDMARKS);
  private readonly touch = new TouchControls(this.input);
  private readonly finishBanner = makeLabel('海面 / SURFACE', 0xeaf9ff, 26);

  /** Everything drawn in world metres: collectables, the bubble, and its trailing micro-bubbles. */
  private readonly pickups = new Graphics();
  private readonly bubble = new Graphics();
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
  private readonly spawnLog: { kind: string; worldY: number; visibleTop: number; visibleBottom: number }[] = [];

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
   * Run phase. `burst` is the slow-motion pop after the bubble is destroyed; the run cannot be
   * controlled during it, which is what gives the death some weight before the restart.
   */
  private phase: 'intro' | 'playing' | 'burst' = 'intro';
  private phaseTimer = INTRO_SECONDS;
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
  private stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: 0, newRecord: false };
  /** How many bubbles were absorbed in the last step, for probes. */
  private lastEaten = 0;
  private runBanner = makeLabel('', 0xd8fbff, 20);

  constructor(readonly app: Application) {
    this.nominalSeconds = nominalAscentSeconds();

    this.scene.world.addChild(this.pickups, this.bubble, this.particles);
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

  handlePointerDown(pointerId: number, x: number, y: number): void {
    // The first real gesture is the only moment a browser lets audio start. Doing it here rather than
    // at boot is why the game is not silently muted on a phone.
    audio.unlock();
    this.logPointer('down', pointerId, x, y);
    this.touch.onPointerDown(pointerId, x, y);
  }

  handlePointerMove(pointerId: number, x: number, y: number): void {
    this.logPointer('move', pointerId, x, y);
    this.touch.onPointerMove(pointerId, x, y);
  }

  handlePointerUp(pointerId: number): void {
    this.logPointer('up', pointerId, -1, -1);
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
  get spawnLogRef(): readonly { kind: string; worldY: number; visibleTop: number; visibleBottom: number }[] {
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
    this.touch.syncInput();
  }

  onPointerUpForTest(): void {
    this.touch.onPointerUp(1);
    this.touch.syncInput();
  }

  /** Fractional damage accumulated from a trash bag's drain, so it costs whole hits over time. */
  private trashDrain = 0;
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
    this.hazards.hazards.push({
      id: -1,
      kind,
      x: this.player.x * laneWidth,
      y: this.player.y,
      radiusFraction: { fish: 0.035, jelly: 0.062, trash: 0.05, crab: 0.045 }[kind],
      phase: 0,
      seed: 0,
      baitedUntil: 0,
      squashed: 0,
      gripping: false,
      // Already armed with its telegraph spent, so a test exercises the LAUNCH rather than the
      // arming. The arming itself is asserted by watching a naturally spawned crab.
      fuse: 0,
      fired: false,
      armed: true,
      fed: 0,
      digest: 0,
      gripSeconds: 0,
    });
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
    this.stats = { absorbed: 0, hits: 0, maxVolume: this.stats.maxVolume, ended: this.stats.ended, newRecord: false };
    this.player.volume = tuning.volumeMax;
    this.player.slowRemaining = 0;
    this.player.slowFactor = 1;
    this.player.impulseVy = 0;
    this.invulnerable = 0;
    this.trashDrain = 0;
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
    this.input.axisX = 0;
    this.input.axisY = 0;
    this.input.dragTargetX = null;
    this.input.dragTargetY = null;
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
    this.touch.syncInput();
    this.input.update();

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

    this.field.update(dt, viewport.laneWidthMeters, min, max, this.player.volume, LEVEL.scrollSpeed);

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

    this.elapsed += dt;
    // The ambience follows the depth every frame: it IS the progress readout. See src/audio.ts.
    //
    // Silenced during the ending. `depth` alone cannot express this -- at the surface it is pinned at
    // 0, which is the LOUDEST setting, so the bed kept playing through the whole results sequence.
    // One-shots (the pop, the splash) still fire; only the continuous bed stops.
    audio.tick(dt);
    audio.setDepth(this.player.depth, DEPTH_TOTAL, this.phase === 'playing');
    if (this.input.consumeMute()) this.audioMuted = audio.toggleMute();

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

    this.resolveContacts();

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
    // Recorded so a probe can prove content ENTERS from above the view rather than appearing on screen.
    // A "spawns in the middle" bug is invisible in a screenshot and obvious in these two numbers.
    this.spawnLog.push({
      kind: entry.kind,
      worldY: +worldY.toFixed(1),
      visibleTop: +this.camera.visibleWorldRange(0).max.toFixed(1),
      visibleBottom: +this.camera.visibleWorldRange(0).min.toFixed(1),
    });
    if (this.spawnLog.length > 12) this.spawnLog.shift();
    if (entry.kind === 'bubble') {
      this.field.bubbles.push(this.field.bubbleFromEntry({ ...entry, at: worldY }, laneWidth, visualRadiusFraction(this.player.volume)));
      return;
    }
    if (entry.kind === 'skill') {
      // A skill sits where the level put it and drifts down with the water, waiting to be taken.
      this.skillPickup = {
        x: entry.x * laneWidth,
        y: worldY,
        // The skill is rolled when it is COLLECTED, not when it is created: granting it here would
        // decide the player's next twenty seconds before they had even seen the pickup.
        id: null,
      };
      return;
    }
    const hazard = this.makeHazard(entry.kind, entry.x * laneWidth, worldY);
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
    const reach = laneWidth * (visualRadiusFraction(this.player.volume) + 0.05);
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
    // The bubble field is handed in so the emergence rules can act on it: fish eat collectables and
    // split, and the seeking hazards go after the biggest one. Anything eaten is removed here, by the
    // owner of the field, rather than by the hazard module reaching into it.
    const ctx = {
      min,
      max,
      laneWidth,
      playerX: this.player.x * laneWidth,
      playerY: this.player.y,
      playerRadiusFraction: visualRadiusFraction(this.player.volume),
      // The level's scroll, not the player's speed: hazards approach because the WORLD moves now.
      descentSpeed: LEVEL.scrollSpeed,
      elapsed: this.elapsed,
      invulnerable: this.invulnerable > 0,
      // Struggling is "actively steering", which is the intuitive way to tear free of a trash bag.
      // Was a speed threshold when there was an accelerate control; with four-direction movement any
      // deliberate input is the same idea, and it is legible to the player without a hidden number.
      struggling:
        this.input.axisX !== 0 ||
        this.input.axisY !== 0 ||
        this.input.dragTargetX !== null ||
        this.input.dragTargetY !== null,
      playerVolume: this.player.volume,
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
  private makeHazard(kind: HazardKind, x: number, y: number) {
    const radiusFraction = { fish: 0.035, jelly: 0.062, trash: 0.05, crab: 0.045 }[kind];
    return {
      id: -Math.floor(Math.random() * 1e9),
      kind,
      x: Math.max(0, Math.min(this.camera.viewport.laneWidthMeters, x)),
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
    };
  }

  /**
   * Handling for every collectable contact, in one place so both outcomes (eat / bounce) are
   * visible side by side.
   *
   * `bigger eats smaller` is the whole rule. The player's radius is its hitbox, so growing makes
   * absorbing easier and being hit easier in the same motion -- that is the built-in cost.
   */
  private resolveContacts(): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerX = this.player.x * laneWidth;
    const playerR = laneWidth * visualRadiusFraction(this.player.volume);
    let eaten = 0;

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

  private takeHit(): void {
    this.stats.hits++;
    audio.play('hit');
    this.invulnerable = tuning.invulnerableSeconds;
    // Decide from the POST-hit volume: asking whether the current volume can survive one more hit
    // is the right question, and asking it of the pre-hit volume let health reach zero without ever
    // popping the bubble.
    //
    // `shrinkResistance` is the silt talent's backlash discount, applied through the volume module
    // rather than here so the "one hit is worth the same at every size" invariant keeps a single
    // implementation.
    this.player.volume = shrinkFromHit(this.player.volume, this.player.shrinkResistance);

    if (isPopped(this.player.volume) || this.player.volume <= 0) {
      this.startBurst();
    }
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

  private startRun(): void {
    this.player.reset();
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
    this.trashDrain = 0;
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
    this.stats = { absorbed: 0, hits: 0, maxVolume: this.talentEffects.startVolume, ended: this.stats.ended, newRecord: false };
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
    this.hud.update(this.player, this.fps, this.nominalSeconds, this.elapsed, this.lateral, this.scrolled);
    this.touch.update();

    this.drawPickups();
    this.drawBubble();

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
      const playerR = laneWidth * visualRadiusFraction(this.player.volume);
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
    paintHazards(g, this.hazards, laneWidth, this.elapsed);

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
      viewport.laneWidthMeters * visualRadiusFraction(this.player.volume) * (0.25 + 0.75 * eased) * burstScale;

    // Blink while invulnerable: the single cross-type rule that stops a swarm chain-killing.
    const blink = this.invulnerable > 0 ? 0.45 + 0.55 * Math.abs(Math.sin(this.invulnerable * 22)) : 1;

    this.paintBubble(this.player.x * viewport.laneWidthMeters, this.player.y, radius, burstAlpha * blink);
  }

  /**
   * The bubble is pure procedural geometry -- no art assets (design round 6). Chosen because the
   * colour and silhouette have to carry gameplay information later (hazard type, threat level).
   *
   * Drawn in WORLD METRES. `radius` is already in metres, derived from the lane width.
   * `alpha` carries the invulnerability blink and the pop fade.
   */
  private paintBubble(worldX: number, worldY: number, radius: number, alpha: number): void {
    const g = this.bubble;
    const p = this.particles;
    // Graphics retains its path between `clear()` calls, so both must be cleared every frame.
    // Leaving them dirty is what drew a stray line from the bubble to the finish banner.
    g.clear();
    p.clear();

    if (alpha <= 0.01) return;

    const speed = Math.hypot(this.player.vx * 100, this.player.vy);
    const squash = 1 + Math.min(speed / 600, 0.16);

    // Outer soft halo.
    g.circle(worldX, worldY, radius * 1.55).fill({ color: 0x7fe6ff, alpha: 0.1 * alpha });
    g.circle(worldX, worldY, radius * 1.18).fill({ color: 0xaef2ff, alpha: 0.16 * alpha });

    // Slowed by a jellyfish: a purple rind around the bubble. Shown ON the player rather than in a
    // status bar, because the penalty is about where the bubble IS -- the player needs to see it
    // without moving their eyes off the thing they are steering.
    if (this.player.slowRemaining > 0) {
      const fade = Math.min(1, this.player.slowRemaining / 0.4);
      g.circle(worldX, worldY, radius * 1.75).stroke({ color: 0xc79bff, alpha: 0.75 * alpha * fade, width: radius * 0.16 });
      g.circle(worldX, worldY, radius * 1.75).fill({ color: 0xc79bff, alpha: 0.07 * alpha * fade });
    }

    // Body: an ellipse stretched along the direction of travel.
    g.ellipse(worldX, worldY, radius / squash, radius * squash).fill({ color: 0xcdf6ff, alpha: 0.22 * alpha });
    g.ellipse(worldX, worldY, radius / squash, radius * squash).stroke({
      color: 0xd8fbff,
      alpha: 0.85 * alpha,
      width: radius * 0.085,
    });

    // Inner sheen, offset toward the light (up and to the left). Deliberately built from plain
    // circles: an earlier version used Graphics.arc for the rim highlight and left a stray line
    // from the bubble to the edge of the water column.
    g.circle(worldX - radius * 0.16, worldY + radius * 0.14, radius * 0.72).fill({
      color: 0xeafcff,
      alpha: 0.13 * alpha,
    });

    // Specular highlights. World y grows upward, so +y is up on screen.
    g.circle(worldX - radius * 0.36, worldY + radius * 0.38, radius * 0.21).fill({
      color: 0xffffff,
      alpha: 0.8 * alpha,
    });
    g.circle(worldX + radius * 0.24, worldY - radius * 0.3, radius * 0.1).fill({
      color: 0xffffff,
      alpha: 0.4 * alpha,
    });

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
      byKind: Record<string, number>;
      comedyBeats: number;
      lastBeat: { what: HazardKind; at: number } | null;
      grabs: number;
      baits: number;
    };
    slow: { remaining: number; factor: number; impulseVy: number };
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
        byKind: this.hazards.hazards.reduce<Record<string, number>>((acc, h) => {
          acc[h.kind] = (acc[h.kind] ?? 0) + 1;
          return acc;
        }, {}),
        comedyBeats: this.comedyBeats,
        lastBeat: this.lastComedyBeat,
        /** Monotonic counters, for transient things a boolean sample would miss. */
        grabs: this.hazards.grabs,
        baits: this.hazards.baits,
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
    const playerRadius = laneWidth * visualRadiusFraction(this.player.volume);
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
    const playerRadius = laneWidth * visualRadiusFraction(this.player.volume);
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

  /** Test hook: the collectable field, so a probe can inspect individual bubbles. */
  get fieldRef(): EntityField {
    return this.field;
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
        ? +(tracked.radius / Math.max(1e-6, visualRadiusFraction(this.player.volume))).toFixed(3)
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
          sizeRatio: +(b.radius / Math.max(1e-6, visualRadiusFraction(this.player.volume))).toFixed(3),
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
