import { Container, Graphics } from 'pixi.js';
import type { Input } from './input';

/**
 * On-screen touch controls (design round 5, Q22):
 *
 *   - The bottom-right corner is a vertical throttle slider: up = accelerate, down = brake.
 *     It is STICKY: it holds the value you left it at, so accelerating does not mean holding a
 *     finger down for the whole climb.
 *   - Everywhere else, dragging steers the bubble toward your finger horizontally. Vertical drag
 *     is ignored: the bubble always rises.
 *
 * Architecture note: there is ONE interactive graphic covering the whole screen, and the code
 * decides which control a touch belongs to. An earlier version used a separate interactive graphic
 * per control and relied on Pixi's display-list ordering and `eventMode` inheritance to route
 * between them; the throttle slider received no events at all, and every diagnostic
 * (`containsPoint` returned true, bounds correct, prune flags correct) said it should have.
 * Routing by hand removes that entire class of problem.
 */
export class TouchControls {
  readonly root = new Container();

  /** One hit layer for the whole screen; the code decides what a touch means. */
  private readonly surface = new Graphics();
  private readonly throttleGfx = new Graphics();
  private readonly knobGfx = new Graphics();

  /** Throttle value, -1 (brake) .. +1 (accelerate). Sticky between touches. */
  private throttleValue = 0;

  /** Horizontal drag state. */
  private steering = false;
  private targetX: number | null = null;

  /** Which control the active touch started on. */
  private activeZone: 'throttle' | 'water' | null = null;
  private activePointerId: number | null = null;

  /** Screen geometry, recomputed by `layout`. */
  private track = { x: 0, top: 0, bottom: 0 };
  private zoneLeft = 0;
  private knobRadius = 18;
  private canvasWidth = 0;
  private canvasHeight = 0;

  /**
   * Architecture note: this class owns NO event listeners. The host page routes pointer events
   * here from listeners on the Pixi stage, so the controls never depend on hit testing the display
   * list. Two earlier designs relied on Pixi routing (per-control interactive graphics, then a
   * single full-screen interactive graphic) and in both cases the throttle corner received
   * nothing, even though `containsPoint` returned true and every prune flag was correct.
   * Hit-test-free routing removes that entire class of problem.
   */
  constructor(private readonly input: Input) {
    this.root.eventMode = 'none';
    this.root.addChild(this.surface, this.throttleGfx, this.knobGfx);
    this.surface.eventMode = 'none';
    this.throttleGfx.eventMode = 'none';
    this.knobGfx.eventMode = 'none';
  }

  onPointerDown(pointerId: number, x: number, y: number): void {
    this.lastDown = { id: pointerId, x, y, zoneLeft: this.zoneLeft, top: this.track.top, bottom: this.track.bottom };
    if (this.activePointerId !== null) {
      this.lastDown.zone = `rejected:active=${this.activePointerId}`;
      return;
    }
    this.activePointerId = pointerId;

    if (this.isInThrottleZone(x, y)) {
      this.activeZone = 'throttle';
      this.lastDown.zone = 'throttle';
      this.setThrottleFromY(y);
      return;
    }

    this.activeZone = 'water';
    this.lastDown.zone = 'water';
    this.steering = true;
    this.steerTo(x);
  }

  onPointerMove(pointerId: number, x: number, y: number): void {
    if (pointerId !== this.activePointerId) return;
    if (this.activeZone === 'throttle') this.setThrottleFromY(y);
    else if (this.activeZone === 'water') this.steerTo(x);
  }

  onPointerUp(pointerId: number): void {
    if (pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.activeZone = null;
    this.steering = false;
    this.targetX = null;
  }

  /** Test hook: the last pointerdown, its coordinates and the zone decision made from them. */
  lastDown: { id: number; x: number; y: number; zoneLeft: number; top: number; bottom: number; zone?: string } | null = null;

  /** The throttle owns the bottom-right corner; everything else steers. */
  private isInThrottleZone(x: number, y: number): boolean {
    const { top, bottom } = this.track;
    return x >= this.zoneLeft && y >= top - 60 && y <= bottom + 60;
  }

  private steerTo(canvasX: number): void {
    if (this.canvasWidth <= 0) return;
    this.targetX = Math.min(1, Math.max(0, canvasX / this.canvasWidth));
  }

  private setThrottleFromY(canvasY: number): void {
    const { top, bottom } = this.track;
    if (bottom <= top) return;
    // Up is accelerate, so invert: the top of the track means +1.
    const t = (bottom - canvasY) / (bottom - top);
    this.throttleValue = Math.min(1, Math.max(-1, t * 2 - 1));
  }

  /** Push touch state into the shared input each frame, before physics. */
  syncInput(): void {
    this.input.dragTargetX = this.steering ? this.targetX : null;
    this.input.touchThrottle = this.throttleValue;
  }

  layout(canvasWidth: number, canvasHeight: number, scale: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // The single full-screen hit layer for the whole screen.
    this.surface.clear();
    this.surface.rect(0, 0, canvasWidth, canvasHeight).fill({ color: 0xffffff, alpha: 0.001 });

    const trackHeight = 200 * scale;
    const trackWidth = 10 * scale;
    // Placed inboard of the right edge so it does not sit on top of the depth gauge, which lives
    // hard against the edge. An earlier position put the slider right over the event landmarks.
    const cx = canvasWidth - 96 * scale;
    const bottom = canvasHeight - 34 * scale;
    const top = bottom - trackHeight;
    this.track = { x: cx, top, bottom };
    // Wide enough to be easy to grab, narrow enough that steering still has most of the screen.
    this.zoneLeft = canvasWidth - 150 * scale;
    this.knobRadius = 20 * scale;

    this.throttleGfx.clear();
    this.throttleGfx
      .roundRect(cx - trackWidth / 2, top, trackWidth, trackHeight, trackWidth / 2)
      .fill({ color: 0x0a1c2e, alpha: 0.55 });
    this.throttleGfx
      .roundRect(cx - trackWidth / 2, top, trackWidth, trackHeight, trackWidth / 2)
      .stroke({ color: 0x7fc4e8, alpha: 0.5, width: Math.max(1, 1.2 * scale) });

    // Neutral tick, so the centre is findable by feel.
    const mid = (top + bottom) / 2;
    this.throttleGfx
      .rect(cx - trackWidth * 1.4, mid - 0.75 * scale, trackWidth * 2.8, 1.5 * scale)
      .fill({ color: 0x7fc4e8, alpha: 0.45 });

    // Label the two ends so the control explains itself without text.
    this.throttleGfx
      .moveTo(cx - 9 * scale, top + 12 * scale)
      .lineTo(cx, top + 3 * scale)
      .lineTo(cx + 9 * scale, top + 12 * scale)
      .stroke({ color: 0xffd479, alpha: 0.75, width: Math.max(1, 1.6 * scale) });
    this.throttleGfx
      .moveTo(cx - 9 * scale, bottom - 12 * scale)
      .lineTo(cx, bottom - 3 * scale)
      .lineTo(cx + 9 * scale, bottom - 12 * scale)
      .stroke({ color: 0x8fe3ff, alpha: 0.75, width: Math.max(1, 1.6 * scale) });

    this.update();
  }

  /** Move the knob to match the throttle value. Cheap enough to call every frame. */
  update(): void {
    const { x, top, bottom } = this.track;
    const t = (this.throttleValue + 1) / 2;
    const y = bottom - t * (bottom - top);
    const accent = this.throttleValue > 0.01 ? 0xffd479 : this.throttleValue < -0.01 ? 0x8fe3ff : 0xcfe9f5;

    this.knobGfx.clear();
    this.knobGfx.circle(x, y, this.knobRadius).fill({ color: accent, alpha: 0.92 });
    this.knobGfx.circle(x, y, this.knobRadius * 0.52).fill({ color: 0x030a17, alpha: 0.6 });
  }

  /** Exposed for probes. */
  get debugState(): {
    throttle: number;
    steering: boolean;
    targetX: number | null;
    zone: string | null;
    lastDown: TouchControls['lastDown'];
  } {
    return {
      throttle: this.throttleValue,
      steering: this.steering,
      targetX: this.targetX,
      zone: this.activeZone,
      lastDown: this.lastDown,
    };
  }

  /** Screen geometry of the throttle, so tests can touch the real thing instead of guessing. */
  get geometry(): {
    x: number;
    top: number;
    bottom: number;
    zoneLeft: number;
    knobRadius: number;
    canvasWidth: number;
    canvasHeight: number;
  } {
    return {
      ...this.track,
      zoneLeft: this.zoneLeft,
      knobRadius: this.knobRadius,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    };
  }

  /** Named layers, exposed so a test can inspect them. */
  get layers(): { surface: Graphics; throttle: Graphics; knob: Graphics } {
    return { surface: this.surface, throttle: this.throttleGfx, knob: this.knobGfx };
  }

  /** Test hook: drive the throttle directly at a canvas y, bypassing the event system. */
  debugSetThrottleAtY(y: number): number {
    this.setThrottleFromY(y);
    return this.throttleValue;
  }
}
