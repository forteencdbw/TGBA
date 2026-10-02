import { Container, Graphics } from 'pixi.js';
import type { Input } from './input';

/**
 * On-screen touch controls.
 *
 *   - Dragging ANYWHERE outside the skill button moves the bubble toward the finger, on BOTH axes. The
 *     finger indicates a destination and the bubble eases to it; a virtual stick would be a worse
 *     version of the same thing on a screen this size, and would need a second control to express
 *     "go there at once".
 *   - A round SKILL button, up and to the left of where the thumb rests. Hold is not needed: a skill
 *     is a discrete action, so it fires on press.
 *
 * There is no accelerate button any more. It existed because the ascent used to be forced and the
 * player could only shape it; with four-direction movement that is just the up key.
 *
 * Architecture note: there is ONE interactive graphic covering the whole screen, and the code decides
 * which control a touch belongs to. An earlier version used a separate interactive graphic per control
 * and relied on Pixi's display-list ordering and `eventMode` inheritance to route between them; the
 * corner control received no events at all, while `containsPoint` returned true, the bounds were
 * correct and every prune flag was normal. Routing by hand removes that whole class of problem.
 */
export class TouchControls {
  readonly root = new Container();

  /** One hit layer for the whole screen; the code decides what a touch means. */
  private readonly surface = new Graphics();
  private readonly buttonGfx = new Graphics();

  /** Horizontal drag state, as a lane fraction. */
  private steering = false;
  private targetX: number | null = null;
  /** Vertical drag state, in WORLD metres. Converted by the host, which knows the camera. */
  private targetY: number | null = null;

  /**
   * Which pointers are steering, most recent FIRST.
   *
   * A list rather than a single id. This is the whole fix for a real bug: "dragging to steer blocks
   * the skill button, and tapping it blocks steering". Two fingers are down, and the old code tracked
   * exactly one pointer and returned early when a second arrived, so whichever touch came second was
   * silently dropped.
   *
   * Ordering matters when fingers are lifted out of order: the most recently placed finger is the one
   * the player means, so it steers and the others are ignored until it goes away.
   */
  private waterIds: number[] = [];

  /** Screen geometry, recomputed by `layout`. */
  private skillButton = { x: 0, y: 0, radius: 0 };
  /**
   * The canvas height, so a finger position can be turned into a SCREEN fraction.
   *
   * The touch layer needs to know nothing about the world: the player moves within the window, so a
   * finger maps straight to a place on the glass. The screen-to-world mapper this replaced existed only
   * because the player used to live in world space.
   */
  private canvasHeight = 0;
  /** The play area in canvas pixels. Controls are positioned inside this, not inside the canvas. */
  private laneLeft = 0;
  private laneWidth = 0;
  /** Whether a skill is carried, so the button can hide when the slot is empty. */
  private hasSkill = false;
  /** Drives the press pulse on the skill button. Set on press, decays in `update`. */
  private skillFlash = 0;

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
   * MULTI-TOUCH: each pointer is routed independently, so steering and the skill button can be used at
   * the same time. Every handler is a no-op for an id it does not already know, so an unrelated pointer
   * cannot disturb an active control.
   */
  onPointerDown(pointerId: number, x: number, y: number): void {
    // The skill button fires on PRESS: it is a discrete action, and requiring a release would make it
    // feel unresponsive under a thumb that lingers.
    if (this.hasSkill && this.isInSkillButton(x, y)) {
      this.input.pressSkill();
      this.skillFlash = 1;
      return;
    }

    // Newest first: see `waterIds`.
    this.waterIds = [pointerId, ...this.waterIds.filter((id) => id !== pointerId)];
    this.steering = true;
    this.steerTo(x, y);
  }

  onPointerMove(pointerId: number, x: number, y: number): void {
    // Only the PRIMARY steering finger moves the bubble; a secondary finger's movement is ignored
    // rather than fighting it for control.
    if (this.waterIds[0] !== pointerId) return;
    this.steerTo(x, y);
  }

  onPointerUp(pointerId: number): void {
    const wasPrimary = this.waterIds[0] === pointerId;
    this.waterIds = this.waterIds.filter((id) => id !== pointerId);
    if (wasPrimary) {
      // Hand steering to the next finger still down, keeping the bubble where the last PRIMARY finger
      // left it. Re-using the stale target would make the bubble lurch toward wherever the lifted
      // finger had been aiming.
      this.targetX = null;
      this.targetY = null;
      this.steering = this.waterIds.length > 0;
    }
  }

  /** Forget every pointer, e.g. after a layout change. */
  releaseAll(): void {
    this.waterIds = [];
    this.steering = false;
    this.targetX = null;
    this.targetY = null;
    this.update();
  }

  /** Whether a skill is carried, so the button can appear and disappear with the slot. */
  setHasSkill(hasSkill: boolean): void {
    if (this.hasSkill === hasSkill) return;
    this.hasSkill = hasSkill;
    this.update();
  }

  /** Same generosity as the old controls had: hit with a thumb, and near-misses still register. */
  private isInSkillButton(x: number, y: number): boolean {
    const dx = x - this.skillButton.x;
    const dy = y - this.skillButton.y;
    const reach = this.skillButton.radius * 1.35;
    return dx * dx + dy * dy <= reach * reach;
  }

  private steerTo(canvasX: number, canvasY: number): void {
    if (this.laneWidth <= 0 || this.canvasHeight <= 0) return;
    // Measured against the LANE, not the canvas: a finger out in the water either side of the lane is
    // asking for the nearest edge, not for a position the bubble cannot reach.
    const withinLane = (canvasX - this.laneLeft) / this.laneWidth;
    this.targetX = Math.min(1, Math.max(0, withinLane));
    // Screen y grows DOWNWARDS and the player's screen fraction grows UPWARDS, so it is flipped. The
    // target is a place on the glass, which is exactly what the finger reports -- no camera involved.
    this.targetY = Math.min(1, Math.max(0, 1 - canvasY / this.canvasHeight));
  }

  /** Push touch state into the shared input each frame, before physics. */
  syncInput(): void {
    this.input.dragTargetX = this.steering ? this.targetX : null;
    this.input.dragTargetY = this.steering ? this.targetY : null;
  }

  /**
   * @param laneLeft,laneWidth the play area in canvas pixels.
   *
   *   The controls are laid out against the LANE, not the canvas. On a wide desktop window the lane is a
   *   centred portrait column with water either side, so placing the skill button at
   *   `canvasWidth - 76 * scale` put it 2021px across on a 2560px window -- off the screen entirely, which
   *   is a control the player simply does not have.
   */
  layout(laneLeft: number, laneWidth: number, canvasWidth: number, canvasHeight: number, scale: number): void {
    this.canvasHeight = canvasHeight;
    this.laneLeft = laneLeft;
    this.laneWidth = laneWidth;

    this.surface.clear();
    this.surface.rect(0, 0, canvasWidth, canvasHeight).fill({ color: 0xffffff, alpha: 0.001 });

    /**
     * The skill button sits low and to the right WITHIN THE LANE, where a thumb rests without covering
     * the bubble.
     *
     * It used to be tucked beside an accelerate button in the corner. With the whole lane now being the
     * steering surface, the button has to be somewhere a drag will not accidentally start, and the
     * bottom-right of the lane is the one region a player does not drag through -- the bubble is ahead of
     * them.
     */
    const buttonRadius = Math.min(38 * scale, laneWidth * 0.13);
    this.skillButton = {
      x: laneLeft + laneWidth - buttonRadius - 12 * scale,
      y: canvasHeight - buttonRadius - 22 * scale,
      radius: buttonRadius,
    };
    this.update();
  }

  /** Redraw the skill button. Cheap: two circles and a star. */
  update(): void {
    this.buttonGfx.clear();
    if (!this.hasSkill) return;

    const sb = this.skillButton;
    this.skillFlash = Math.max(0, this.skillFlash - 0.05);
    if (this.skillFlash > 0) {
      this.buttonGfx
        .circle(sb.x, sb.y, sb.radius * (1.2 + this.skillFlash * 0.3))
        .fill({ color: 0xc79bff, alpha: 0.3 * this.skillFlash });
    }
    this.buttonGfx.circle(sb.x, sb.y, sb.radius).fill({ color: 0x1d2a44, alpha: 0.7 });
    this.buttonGfx.circle(sb.x, sb.y, sb.radius).stroke({ color: 0xc79bff, alpha: 0.85, width: 2 });

    // A four-point star, so the button reads as "a thing you spend" rather than as a direction.
    const r = sb.radius;
    this.buttonGfx
      .moveTo(sb.x, sb.y - r * 0.5)
      .lineTo(sb.x + r * 0.16, sb.y - r * 0.16)
      .lineTo(sb.x + r * 0.5, sb.y)
      .lineTo(sb.x + r * 0.16, sb.y + r * 0.16)
      .lineTo(sb.x, sb.y + r * 0.5)
      .lineTo(sb.x - r * 0.16, sb.y + r * 0.16)
      .lineTo(sb.x - r * 0.5, sb.y)
      .lineTo(sb.x - r * 0.16, sb.y - r * 0.16)
      .closePath()
      .fill({ color: 0xe8d6ff, alpha: 0.95 });
  }

  /**
   * Exposed for probes.
   *
   * `zone` no longer exists: with steering on the whole screen there is only one drag zone, so a zone
   * name would always be the same string.
   */
  get debugState(): {
    steering: boolean;
    targetX: number | null;
    targetY: number | null;
    steeringPointers: number;
    hasSkill: boolean;
  } {
    return {
      steering: this.steering,
      targetX: this.targetX,
      targetY: this.targetY,
      steeringPointers: this.waterIds.length,
      hasSkill: this.hasSkill,
    };
  }

  /** Skill button geometry, so a probe can press the real control instead of guessing. */
  get skillGeometry(): { x: number; y: number; radius: number } {
    return { ...this.skillButton };
  }

  /** Named layers, exposed so a test can inspect them. */
  get layers(): { surface: Graphics; button: Graphics } {
    return { surface: this.surface, button: this.buttonGfx };
  }

  /** Test hook: force the press pulse, bypassing the event system. */
  debugSetBoosting(value: boolean): boolean {
    void value;
    return false;
  }
}
