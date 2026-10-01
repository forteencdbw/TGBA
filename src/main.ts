import { Application, Graphics } from 'pixi.js';
import { Camera, Hud, WorldLayer, computeViewport, createApp, makeLabel, type Landmark } from './background';
import { DEPTH_TOTAL, tuning } from './config';
import { ascentSpeedAtDepth, nominalAscentSeconds } from './depth';
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
const LANDMARKS: readonly Landmark[] = [
  { depth: 180, label: '鱼群' },
  { depth: 320, label: '气泡潮' },
  { depth: 420, label: '爆发' },
];

/** The three ways a bubble can be born (design round 5). Effects land in D4; here it is flavour. */
const SEEDS = ['鱼屁泡', '汽水泡', '深海淤泥泡'] as const;

const INTRO_SECONDS = 1.6;

/** Slow-motion pop after the bubble is destroyed, before the next run starts. */
const BURST_SECONDS = 1.5;

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

  /** Collectables and decoration, maintained by density within the visible range. */
  private readonly field = new EntityField();

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
  private stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: 0 };
  /** How many bubbles were absorbed in the last step, for probes. */
  private lastEaten = 0;
  private runBanner = makeLabel('', 0xd8fbff, 20);

  constructor(readonly app: Application) {
    this.nominalSeconds = nominalAscentSeconds();

    this.scene.world.addChild(this.pickups, this.bubble, this.particles);
    this.app.stage.addChild(this.scene.root, this.hud.root, this.touch.root);

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
    stage.on('pointerdown', (e) => this.touch.onPointerDown(e.pointerId, e.global.x, e.global.y));
    stage.on('globalpointermove', (e) => this.touch.onPointerMove(e.pointerId, e.global.x, e.global.y));
    stage.on('pointerup', (e) => this.touch.onPointerUp(e.pointerId));
    stage.on('pointerupoutside', (e) => this.touch.onPointerUp(e.pointerId));
    stage.on('pointercancel', (e) => this.touch.onPointerUp(e.pointerId));

    this.rollSeed();
    this.player.reset();
    this.camera.follow(this.player);
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

  /** Route a pointer event into the touch layer. Called from stage-level listeners. */
  handlePointerDown(pointerId: number, x: number, y: number): void {
    this.touch.onPointerDown(pointerId, x, y);
  }

  handlePointerMove(pointerId: number, x: number, y: number): void {
    this.touch.onPointerMove(pointerId, x, y);
  }

  handlePointerUp(pointerId: number): void {
    this.touch.onPointerUp(pointerId);
  }

  /** Canvas box on screen. Retained for hosts that offset the canvas element. */
  setCanvasRect(_rect: { left: number; top: number; width: number; height: number }): void {
    // The touch layer works in canvas coordinates and does not need this today; kept as the seam
    // for a host that letterboxes or scales the canvas element.
  }

  /** Throttle slider geometry in canvas coordinates, so tests touch the real thing. */
  get touchGeometry() {
    return this.touch.geometry;
  }

  /** Test hook: drive the throttle value directly, bypassing the event system. */
  debugSetThrottleAtY(y: number): number {
    return this.touch.debugSetThrottleAtY(y);
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
    this.touch.layout(screenW, screenH, viewport.scale);

    this.finishBanner.scale.set(viewport.scale);
    this.finishBanner.x = screenW / 2;
    this.finishBanner.y = screenH * 0.3;
  }

  private frame(deltaSeconds: number): void {
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
    this.field.update(
      dt,
      viewport.laneWidthMeters,
      min,
      max,
      visualRadiusFraction(this.player.volume),
      this.player.volume,
      // Drives every relative speed the player sees: a bubble's screen speed is
      // `ascentSpeed - its own rise speed`.
      this.player.vy > 0 ? this.player.vy : ascentSpeedAtDepth(this.player.depth),
    );

    switch (this.phase) {
      case 'intro': {
        this.phaseTimer -= dt;
        this.elapsed += dt;
        this.camera.follow(this.player);
        if (this.phaseTimer <= 0) this.phase = 'playing';
        return;
      }
      case 'burst': {
        // Slow motion: the pop plays out before the run resets, so death has some weight.
        this.phaseTimer -= dt;
        this.camera.follow(this.player);
        if (this.phaseTimer <= 0) this.startRun();
        return;
      }
      case 'playing':
        break;
    }

    this.elapsed += dt;
    this.player.update(this.input, dt, this.lateral);
    this.camera.follow(this.player);

    this.resolveContacts();

    if (this.player.y >= DEPTH_TOTAL) {
      this.reachSurface();
    }
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
        // Big enough: absorb it.
        this.player.volume = growByAbsorbing(this.player.volume, b.volume);
        this.stats.absorbed++;
        eaten++;
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
    this.invulnerable = tuning.invulnerableSeconds;
    // Decide from the POST-hit volume: asking whether the current volume can survive one more hit
    // is the right question, and asking it of the pre-hit volume let health reach zero without ever
    // popping the bubble.
    this.player.volume = shrinkFromHit(this.player.volume);

    if (isPopped(this.player.volume) || this.player.volume <= 0) {
      this.startBurst();
    }
  }

  /** The bubble pops: slow-motion burst, then a brief result card, then a fresh run. */
  private startBurst(): void {
    this.phase = 'burst';
    this.phaseTimer = BURST_SECONDS;
    this.stats.ended++;
    this.runBanner.text = `破裂  ·  深度 ${Math.round(this.player.depth)}m  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×`;
    this.runBanner.alpha = 1;
  }

  private startRun(): void {
    this.player.reset();
    this.field.reset();
    this.elapsed = 0;
    this.phase = 'intro';
    this.phaseTimer = INTRO_SECONDS;
    this.invulnerable = 0;
    this.stats = { absorbed: 0, hits: 0, maxVolume: 1, ended: this.stats.ended };
    this.rollSeed();
  }

  private reachSurface(): void {
    this.phase = 'burst';
    this.phaseTimer = BURST_SECONDS;
    this.runBanner.text = `浮出海面  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×`;
    this.runBanner.alpha = 1;
    this.finishBanner.alpha = 1;
    this.bannerSeen = true;
  }

  private render(dt: number): void {
    this.scene.update(this.camera, this.player, dt);
    this.hud.update(this.player, this.fps, this.nominalSeconds, this.elapsed, this.lateral);
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
    // Specks last, in one fill: they are the bulk of the draw calls otherwise. Near ones are drawn
    // brighter, which reinforces the depth ordering the parallax already implies.
    for (const s of this.field.specks) {
      if (s.drift > 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xeafcff, alpha: 0.34 });
    for (const s of this.field.specks) {
      if (s.drift <= 0) g.circle(s.x, s.y, s.r);
    }
    g.fill({ color: 0xdff6ff, alpha: 0.18 });
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
    ascentSpeed: number;
    bannerAlpha: number;
    bannerSeen: boolean;
    lateral: LateralAuthority;
    laneWidthMeters: number;
    visibleDepthMeters: number;
    phase: string;
    volume: number;
    hitsSurvived: number;
    invulnerable: number;
    bubbles: number;
    lastEaten: number;
    stats: { absorbed: number; hits: number; maxVolume: number; ended: number };
  } {
    return {
      frames: this.frameCount,
      elapsed: this.elapsed,
      intro: this.phaseTimer,
      lastDelta: this.lastDelta,
      nominalSeconds: this.nominalSeconds,
      ascentSpeed: ascentSpeedAtDepth(this.player.depth),
      bannerAlpha: this.finishBanner.alpha,
      bannerSeen: this.bannerSeen,
      lateral: this.lateral,
      laneWidthMeters: this.camera.viewport.laneWidthMeters,
      visibleDepthMeters: this.camera.viewport.visibleDepthMeters,
      phase: this.phase,
      volume: this.player.volume,
      hitsSurvived: hitsSurvived(this.player.volume),
      invulnerable: this.invulnerable,
      bubbles: this.field.bubbles.length,
      lastEaten: this.lastEaten,
      stats: { ...this.stats },
    };
  }

  /**
   * Test hook: park the bubble just under the surface so the finish-and-reset path can be
   * exercised in seconds instead of a three-minute run. The value is deliberately just under
   * DEPTH_TOTAL so the next simulation step crosses the line.
   */
  teleportToSurface(): void {
    this.player.y = DEPTH_TOTAL - 0.2;
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
    // vy 0 holds it on the player regardless of its size, so the collision is immediate.
    this.field.addTestBubble({
      x: this.player.x * laneWidth,
      y: this.player.y,
      vy: 0,
      radius,
      volume: bubbleVolumeFromRadius(radius),
      phase: 0,
      wobble: tuning.bubbleWobbleMin,
    });
  }

  /**
   * Test hook: spawn a bubble already overlapping the player, while it is genuinely moving.
   *
   * The `vy: 0` version above proves the collision RULE; this proves contact is not skipped while
   * the bubble is in motion. Spawned at zero distance on purpose: a bubble's relative speed is
   * `ascent - its own rise`, which for a small bubble is a fraction of a metre per second (they are
   * nearly matching the player), so waiting for one to close a real gap would take minutes. An
   * earlier version spawned it half a reach away and timed out for exactly that reason.
   */
  spawnFallingBubbleOnPlayer(sizeRatio: number): void {
    const laneWidth = this.camera.viewport.laneWidthMeters;
    const playerRadius = laneWidth * visualRadiusFraction(this.player.volume);
    const radius = (playerRadius * sizeRatio) / laneWidth;
    const volume = bubbleVolumeFromRadius(radius);
    const ascent = this.player.vy > 0 ? this.player.vy : 1.7;
    // Its real relative speed, solved the same way the field does. A small bubble drifts down.
    const relative = bubbleRelativeFallRatio(volume, this.player.volume) * ascent;
    this.field.addTestBubble({
      x: this.player.x * laneWidth,
      y: this.player.y,
      vy: relative,
      radius,
      volume,
      phase: 0,
      wobble: tuning.bubbleWobbleMin,
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
