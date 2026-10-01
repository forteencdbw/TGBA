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

  /** Which control the active touch started on. */
  private activeZone: 'boost' | 'water' | null = null;
  private activePointerId: number | null = null;

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
   */
  onPointerDown(pointerId: number, x: number, y: number): void {
    if (this.activePointerId !== null) return;
    this.activePointerId = pointerId;

    if (this.isInButton(x, y)) {
      this.activeZone = 'boost';
      this.boosting = true;
      return;
    }

    this.activeZone = 'water';
    this.steering = true;
    this.steerTo(x);
  }

  onPointerMove(pointerId: number, x: number, _y: number): void {
    if (pointerId !== this.activePointerId) return;
    // Dragging off the button keeps boosting: a thumb that slides slightly should not drop the
    // input mid-climb. Deliberate, and the opposite of a small tap target's usual behaviour.
    if (this.activeZone === 'water') this.steerTo(x);
  }

  onPointerUp(pointerId: number): void {
    if (pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.activeZone = null;
    this.boosting = false;
    this.steering = false;
    this.targetX = null;
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

  /** Exposed for probes. */
  get debugState(): { boosting: boolean; steering: boolean; targetX: number | null; zone: string | null } {
    return { boosting: this.boosting, steering: this.steering, targetX: this.targetX, zone: this.activeZone };
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
