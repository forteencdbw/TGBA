import { Container, Graphics } from 'pixi.js';
import type { Input } from './input';

/**
 * On-screen touch controls (design round 5, Q22).
 *
 *   - Dragging ANYWHERE outside the accelerate button steers the bubble toward your finger
 *     horizontally. Vertical drag is ignored: the bubble always rises.
 *   - A round ACCELERATE button in the bottom-right corner. Hold to accelerate, release to fall
 *     back to cruising speed. It is a button rather than a value because the ascent now eases
 *     toward its target: there is nothing to leave "set", and holding is the natural expression.
 *
 * Architecture note: there is ONE interactive graphic covering the whole screen and the code
 * decides which control a touch belongs to. An earlier version used a separate interactive graphic
 * per control and relied on Pixi's display-list ordering and `eventMode` inheritance to route
 * between them; the corner control received no events at all, while `containsPoint` returned true,
 * the bounds were correct and every prune flag was normal. Routing by hand removes that whole class
 * of problem.
 */
export class TouchControls {
  readonly root = new Container();

  /** One hit layer for the whole screen; the code decides what a touch means. */
  private readonly surface = new Graphics();
  private readonly buttonGfx = new Graphics();

  /** Whether the accelerate button is currently held. */
  private boosting = false;

  /** Horizontal drag state. */
  private steering = false;
  private targetX: number | null = null;

  /**
   * Which pointers are steering, most recent FIRST.
   *
   * A list rather than a single id. This is the whole fix for a real bug: "dragging to steer blocks
   * the accelerate button, and tapping accelerate blocks steering". Two fingers are down, and the
   * old code tracked exactly one pointer and returned early when a second arrived, so whichever
   * touch came second was silently dropped.
   *
   * Ordering matters when fingers are lifted out of order: the most recently placed finger is the
   * one the player means, so it steers and the others are ignored until it goes away.
   */
  private waterIds: number[] = [];
  /**
   * The pointer holding the accelerate button, if any.
   *
   * Deliberately separate from the steering list so the two controls are independent: releasing one
   * must never cancel the other.
   */
  private boostId: number | null = null;

  /** Screen geometry, recomputed by `layout`. */
  private button = { x: 0, y: 0, radius: 0 };
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor(private readonly input: Input) {
    this.root.eventMode = 'none';
    this.root.addChild(this.surface, this.buttonGfx);
    this.surface.eventMode = 'none';
    this.buttonGfx.eventMode = 'none';
  }

  /**
   * Pointer entry points. Called by the host from stage-level listeners, so nothing here depends on
   * Pixi's hit testing. See the class comment.
   *
   * MULTI-TOUCH: each pointer is routed independently, so steering and accelerating can be held at
   * the same time. Every handler is a no-op for an id it does not already know, so an unrelated
   * pointer (a second finger that landed somewhere harmless) cannot disturb an active control.
   */
  onPointerDown(pointerId: number, x: number, y: number): void {
    if (this.isInButton(x, y)) {
      // Last finger on the button wins, so a second tap does not leave the first one stuck on.
      this.boostId = pointerId;
      this.boosting = true;
      return;
    }

    // Newest first: see `waterIds`.
    this.waterIds = [pointerId, ...this.waterIds.filter((id) => id !== pointerId)];
    this.steering = true;
    this.steerTo(x);
  }

  onPointerMove(pointerId: number, x: number, _y: number): void {
    // Dragging off the button keeps boosting: a thumb that slides slightly should not drop the
    // input mid-climb. Deliberate, and the opposite of a small tap target's usual behaviour.
    if (pointerId === this.boostId) return;

    // Only the PRIMARY steering finger moves the bubble; a secondary finger's movement is ignored
    // rather than fighting it for control.
    if (this.waterIds[0] !== pointerId) return;
    if (this.waterIds.includes(pointerId)) this.steerTo(x);
  }

  onPointerUp(pointerId: number): void {
    if (pointerId === this.boostId) {
      this.boostId = null;
      this.boosting = false;
    }

    const wasPrimary = this.waterIds[0] === pointerId;
    this.waterIds = this.waterIds.filter((id) => id !== pointerId);
    if (wasPrimary) {
      // Hand steering to the next finger still down, keeping the bubble where the last PRIMARY
      // finger left it. Re-using the stale `targetX` would make the bubble lurch toward wherever the
      // lifted finger had been aiming.
      this.targetX = null;
      this.steering = this.waterIds.length > 0;
    }
  }

  /** Test hook: forget every pointer, e.g. after a layout change. */
  releaseAll(): void {
    this.waterIds = [];
    this.boostId = null;
    this.steering = false;
    this.boosting = false;
    this.targetX = null;
    this.update();
  }

  /** Generous circular target: it is hit with a thumb, and it overlaps the bottom-right corner. */
  private isInButton(x: number, y: number): boolean {
    const dx = x - this.button.x;
    const dy = y - this.button.y;
    // 1.35x the drawn radius, so near-misses still register.
    const reach = this.button.radius * 1.35;
    return dx * dx + dy * dy <= reach * reach;
  }

  private steerTo(canvasX: number): void {
    if (this.canvasWidth <= 0) return;
    this.targetX = Math.min(1, Math.max(0, canvasX / this.canvasWidth));
  }

  /** Push touch state into the shared input each frame, before physics. */
  syncInput(): void {
    this.input.dragTargetX = this.steering ? this.targetX : null;
    this.input.touchBoosting = this.boosting;
  }

  layout(canvasWidth: number, canvasHeight: number, scale: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.surface.clear();
    this.surface.rect(0, 0, canvasWidth, canvasHeight).fill({ color: 0xffffff, alpha: 0.001 });

    // Bottom-right, clear of the depth gauge which sits hard against the right edge.
    this.button = {
      x: canvasWidth - 74 * scale,
      y: canvasHeight - 86 * scale,
      radius: 40 * scale,
    };

    this.buttonGfx.clear();
    this.buttonGfx
      .circle(this.button.x, this.button.y, this.button.radius)
      .fill({ color: 0x0a1c2e, alpha: 0.5 });
    this.buttonGfx
      .circle(this.button.x, this.button.y, this.button.radius)
      .stroke({ color: 0x7fc4e8, alpha: 0.55, width: Math.max(1, 1.6 * scale) });

    // Upward chevron, so the control reads as "push up" without any text.
    const r = this.button.radius;
    const cx = this.button.x;
    const cy = this.button.y;
    this.buttonGfx
      .moveTo(cx - r * 0.4, cy + r * 0.24)
      .lineTo(cx, cy - r * 0.34)
      .lineTo(cx + r * 0.4, cy + r * 0.24)
      .stroke({ color: 0xffd479, alpha: 0.9, width: Math.max(2, 3.4 * scale) });

    this.update();
  }

  /** Redraw so the button reflects whether it is held. Cheap: two circles and a chevron. */
  update(): void {
    const { x, y, radius } = this.button;
    this.buttonGfx.clear();

    if (this.boosting) {
      this.buttonGfx.circle(x, y, radius * 1.16).fill({ color: 0xffd479, alpha: 0.22 });
    }
    this.buttonGfx.circle(x, y, radius).fill({ color: this.boosting ? 0x2a4a63 : 0x0a1c2e, alpha: 0.62 });
    this.buttonGfx
      .circle(x, y, radius)
      .stroke({ color: this.boosting ? 0xffd479 : 0x7fc4e8, alpha: this.boosting ? 0.95 : 0.55, width: 2 });

    const r = radius;
    this.buttonGfx
      .moveTo(x - r * 0.4, y + r * 0.24)
      .lineTo(x, y - r * 0.34)
      .lineTo(x + r * 0.4, y + r * 0.24)
      .stroke({ color: this.boosting ? 0xfff3d6 : 0xffd479, alpha: 0.95, width: 3 });
  }

  /**
   * Exposed for probes.
   *
   * `zone` is derived rather than stored now that both controls can be active at once: reporting a
   * single zone was only meaningful when one pointer could be down. `steeringPointers` and
   * `boostPointers` say what is actually held, which is what a multi-touch test needs to see.
   */
  get debugState(): {
    boosting: boolean;
    steering: boolean;
    targetX: number | null;
    zone: string | null;
    steeringPointers: number;
    boostPointers: number;
  } {
    const zone = this.boosting && this.steering ? 'both' : this.boosting ? 'boost' : this.steering ? 'water' : null;
    return {
      boosting: this.boosting,
      steering: this.steering,
      targetX: this.targetX,
      zone,
      steeringPointers: this.waterIds.length,
      boostPointers: this.boostId === null ? 0 : 1,
    };
  }

  /** Button geometry in canvas coordinates, so tests touch the real thing instead of guessing. */
  get geometry(): { x: number; y: number; radius: number; canvasWidth: number; canvasHeight: number } {
    return { ...this.button, canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight };
  }

  /** Named layers, exposed so a test can inspect them. */
  get layers(): { surface: Graphics; button: Graphics } {
    return { surface: this.surface, button: this.buttonGfx };
  }

  /** Test hook: force the boost state, bypassing the event system. */
  debugSetBoosting(value: boolean): boolean {
    this.boosting = value;
    this.update();
    return this.boosting;
  }
}
