import { Container, Graphics } from 'pixi.js';
import { mech } from './config';
import type { Input } from './input';

/**
 * The on-screen thumb wheel: a virtual analog stick at the bottom of the lane.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT IS
 * ---------------------------------------------------------------------------------------------
 * A fixed circular pad. Press anywhere on it, push in a direction, and the bubble moves that way. Push further
 * and it moves faster, up to full speed at the rim -- which is exactly the keyboard's speed, because both go
 * through the same axis and the same crossing-time constant. Release and the bubble coasts to a stop.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY NOT "THE BUBBLE FOLLOWS YOUR FINGER"
 * ---------------------------------------------------------------------------------------------
 * That was the previous model: the finger named an absolute destination and the bubble eased toward it. It has
 * two problems that a wheel does not.
 *
 * It wastes the information in the gesture. A destination says "end up there" and nothing else, so there is no
 * way to ask for a slow, careful correction -- which is exactly what dodging a fish that is already closing on
 * you needs. A wheel gives direction AND magnitude continuously.
 *
 * And the finger covers the bubble. The thumb has to be where the destination is, so the player's own hand
 * hides the thing they are steering, on a screen where seeing a hazard early is the whole skill.
 *
 * ---------------------------------------------------------------------------------------------
 * A FIXED PAD, NOT A FLOATING STICK
 * ---------------------------------------------------------------------------------------------
 * The pad does not appear where you first touch. A control that appears under the thumb is more comfortable for
 * one press, but it cannot be learned: a player who wants to push "up and slightly right" has no consistent
 * physical reference for where up is, so every touch is re-aimed by eye. A fixed pad is a place the thumb can
 * return to without looking, which is what makes it usable at speed.
 *
 * ---------------------------------------------------------------------------------------------
 * ARCHITECTURE NOTE, unchanged from before
 * ---------------------------------------------------------------------------------------------
 * There is ONE interactive graphic covering the whole screen and the code decides what a touch means. An earlier
 * version used a separate interactive graphic per control and relied on Pixi's display-list ordering and
 * `eventMode` inheritance to route between them; the corner control received no events at all, while
 * `containsPoint` returned true and every prune flag was normal. Routing by hand removes that whole class of
 * problem.
 */
export class TouchControls {
  readonly root = new Container();

  /** One hit layer for the whole screen; the code decides what a touch means. */
  private readonly surface = new Graphics();
  /** The wheel pad and its knob. */
  private readonly wheelGfx = new Graphics();
  private readonly buttonGfx = new Graphics();

  /** The pointer currently on the wheel, or null. Only one thumb drives it. */
  private wheelPointer: number | null = null;
  /** Knob offset from the pad centre, in canvas pixels, already clamped to the radius. */
  private knobX = 0;
  private knobY = 0;
  /** 0..1, how far the knob is pushed beyond the dead zone. Drives the pad's opacity. */
  private deflection = 0;

  /** Screen geometry, recomputed by `layout`. */
  private wheel = { x: 0, y: 0, radius: 0 };
  private skillButton = { x: 0, y: 0, radius: 0 };
  /** The HUD scale from the last layout, so a redraw needs no viewport. */
  private scale = 1;
  /** Whether a skill is carried, so the button can hide when the slot is empty. */
  private hasSkill = false;
  /** Drives the press pulse on the skill button. Set on press, decays in `update`. */
  private skillFlash = 0;

  constructor(private readonly input: Input) {
    this.root.eventMode = 'none';
    this.root.addChild(this.surface, this.wheelGfx, this.buttonGfx);
    this.surface.eventMode = 'none';
    this.wheelGfx.eventMode = 'none';
    this.buttonGfx.eventMode = 'none';
  }

  /**
   * Pointer entry points. Called by the host from stage-level listeners, so nothing here depends on Pixi's hit
   * testing. See the class comment.
   *
   * MULTI-TOUCH: the wheel and the skill button are routed independently, so a thumb can hold a direction while
   * the other hand fires a skill. Every handler is a no-op for an id it does not already know, so an unrelated
   * pointer cannot disturb an active control.
   */
  onPointerDown(pointerId: number, x: number, y: number): void {
    // The skill button fires on PRESS: it is a discrete action, and requiring a release would make it feel
    // unresponsive under a thumb that lingers.
    if (this.hasSkill && this.isInSkillButton(x, y)) {
      this.input.pressSkill();
      this.skillFlash = 1;
      return;
    }

    /**
     * The wheel claims a touch that starts ON the pad, and ignores one that starts elsewhere.
     *
     * Not "the whole screen is a stick": a touch in the water has to be free for the skill button and for the
     * settings panel, and a pad that grabbed every touch would steer the bubble whenever the player reached for
     * anything else. A player who presses outside the pad simply gets no steering, which is the same as not
     * touching the controls at all.
     *
     * A second finger on the pad while one is already there is ignored rather than taking over: swapping hands
     * mid-manoeuvre should not happen by accident.
     */
    if (this.wheelPointer === null && this.isInWheel(x, y)) {
      this.wheelPointer = pointerId;
      this.moveKnob(x, y);
      this.update();
      return;
    }
  }

  onPointerMove(pointerId: number, x: number, y: number): void {
    if (this.wheelPointer !== pointerId) return;
    this.moveKnob(x, y);
  }

  onPointerUp(pointerId: number): void {
    if (this.wheelPointer !== pointerId) return;
    // Recentre. The knob is a stick, not a place: unlike a drag, releasing must not leave the bubble heading
    // for wherever the thumb happened to stop.
    this.wheelPointer = null;
    this.knobX = 0;
    this.knobY = 0;
    this.deflection = 0;
    this.input.wheelX = 0;
    this.input.wheelY = 0;
    this.input.wheelHeld = false;
    this.update();
  }

  /** Forget every pointer, e.g. after a layout change or on leaving the level. */
  releaseAll(): void {
    this.wheelPointer = null;
    this.knobX = 0;
    this.knobY = 0;
    this.deflection = 0;
    this.input.wheelX = 0;
    this.input.wheelY = 0;
    this.input.wheelHeld = false;
    this.update();
  }

  /** Whether a skill is carried, so the button can appear and disappear with the slot. */
  setHasSkill(hasSkill: boolean): void {
    if (this.hasSkill === hasSkill) return;
    this.hasSkill = hasSkill;
    this.update();
  }

  /** Same generosity as the skill button has: hit with a thumb, and near-misses still register. */
  private isInWheel(x: number, y: number): boolean {
    const dx = x - this.wheel.x;
    const dy = y - this.wheel.y;
    // Slightly beyond the drawn rim, so a thumb landing on the edge does not have to be exact.
    const reach = this.wheel.radius * 1.15;
    return dx * dx + dy * dy <= reach * reach;
  }

  private isInSkillButton(x: number, y: number): boolean {
    const dx = x - this.skillButton.x;
    const dy = y - this.skillButton.y;
    const reach = this.skillButton.radius * 1.35;
    return dx * dx + dy * dy <= reach * reach;
  }

  /**
   * Turn a touch position into a deflection, and write it to the shared input.
   *
   * The knob is clamped to the rim, so pushing past the edge keeps full speed rather than losing the input --
   * a thumb that slides off a small pad is normal, and it should not read as "stop".
   */
  private moveKnob(canvasX: number, canvasY: number): void {
    const r = this.wheel.radius;
    if (r <= 0) return;

    let dx = canvasX - this.wheel.x;
    // Screen y grows DOWNWARDS and the vertical axis grows UPWARDS, so the y deflection is flipped.
    let dy = -(canvasY - this.wheel.y);
    const distance = Math.hypot(dx, dy);
    if (distance > r) {
      const k = r / distance;
      dx *= k;
      dy *= k;
    }
    this.knobX = dx;
    this.knobY = -dy;

    /**
     * The dead zone is RESCALED, not merely clipped.
     *
     * Clipping it would mean the axis jumps from 0 to `deadZone` the instant the thumb leaves the centre, so
     * the slowest speed available would be the dead zone's worth. Subtracting the dead zone and dividing by what
     * remains maps "just outside the centre" to just above zero, which is the fine control the wheel exists for.
     */
    const clampedDistance = Math.min(distance, r);
    const dead = r * mech.movement.wheel.deadZoneRatio;
    const live = Math.max(0, clampedDistance - dead);
    const span = Math.max(1e-6, r - dead);
    this.deflection = Math.min(1, live / span);

    if (this.deflection <= 0 || clampedDistance < 1e-6) {
      this.input.wheelX = 0;
      this.input.wheelY = 0;
    } else {
      // Normalised to a unit direction, then scaled by the deflection. Using the raw offset instead would let a
      // diagonal push reach 1.41 on both axes and move the bubble 41% faster than a cardinal one.
      const ux = dx / (clampedDistance || 1);
      const uy = dy / (clampedDistance || 1);
      this.input.wheelX = ux * this.deflection;
      this.input.wheelY = uy * this.deflection;
    }
    this.input.wheelHeld = true;
    this.update();
  }

  /**
   * @param laneLeft,laneWidth the play area in canvas pixels.
   *
   *   The controls are laid out against the LANE, not the canvas. On a wide desktop window the lane is a centred
   *   portrait column with water either side, so placing a control at `canvasWidth - 76 * scale` put it off the
   *   screen entirely -- a control the player simply does not have.
   */
  layout(laneLeft: number, laneWidth: number, canvasWidth: number, canvasHeight: number, scale: number): void {
    this.scale = scale;

    this.surface.clear();
    this.surface.rect(0, 0, canvasWidth, canvasHeight).fill({ color: 0xffffff, alpha: 0.001 });

    /**
     * The wheel: bottom CENTRE of the lane.
     *
     * Centre rather than a corner because it is the primary control and both thumbs can reach it, and because
     * the corners are then free for the skill button. Its radius is capped in pixels as well as derived from the
     * lane, or a 900px-wide desktop lane would grow it to 153px and swallow the bottom of the water.
     */
    const wheelRadius = Math.min(mech.movement.wheel.maxRadiusPx, laneWidth * mech.movement.wheel.radiusRatio);
    const inset = mech.movement.wheel.bottomInset * scale;
    this.wheel = {
      x: laneLeft + laneWidth / 2,
      y: canvasHeight - wheelRadius - inset,
      radius: wheelRadius,
    };

    /**
     * The skill button sits low and to the RIGHT within the lane, where a thumb rests without covering the
     * bubble, and clear of the wheel so a press cannot be ambiguous.
     */
    const buttonRadius = Math.min(38 * scale, laneWidth * 0.13);
    this.skillButton = {
      x: laneLeft + laneWidth - buttonRadius - 12 * scale,
      y: canvasHeight - buttonRadius - 22 * scale,
      radius: buttonRadius,
    };
    this.update();
  }

  /** Redraw the wheel and the skill button. Cheap: a few circles per frame. */
  update(): void {
    this.drawWheel();
    this.drawSkillButton();
  }

  private drawWheel(): void {
    const g = this.wheelGfx;
    const w = this.wheel;
    g.clear();
    if (w.radius <= 0) return;

    /**
     * The pad brightens with the thumb on it.
     *
     * Idle it is very faint -- it is permanent UI and must not compete with the water for attention -- but
     * faint is not invisible, because a control the player cannot find is a control they do not have. Pressing
     * it brightens immediately, which is the acknowledgement that the touch landed.
     */
    const held = this.wheelPointer !== null;
    const alpha = held ? mech.movement.wheel.activeAlpha : mech.movement.wheel.idleAlpha;
    const rim = held ? 0x9fe4ff : 0x6dc7e8;

    g.circle(w.x, w.y, w.radius).fill({ color: 0x08131f, alpha: alpha * 0.55 });
    g.circle(w.x, w.y, w.radius).stroke({ color: rim, alpha, width: 1.6 * this.scale });

    /**
     * A ring at the dead zone boundary.
     *
     * It shows the player where "centred enough to stop" begins, which is the one piece of the control's
     * internal state that is otherwise invisible -- and without it, a bubble that refuses to budge because the
     * thumb is 5px off centre looks like a bug.
     */
    const dead = w.radius * mech.movement.wheel.deadZoneRatio;
    g.circle(w.x, w.y, dead).stroke({ color: rim, alpha: alpha * 0.5, width: 1 });

    // Cardinal ticks, so the pad reads as a directional control rather than a button.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const inner = w.radius * 0.72;
      const outer = w.radius * 0.88;
      g.moveTo(w.x + Math.cos(a) * inner, w.y + Math.sin(a) * inner);
      g.lineTo(w.x + Math.cos(a) * outer, w.y + Math.sin(a) * outer);
    }
    g.stroke({ color: rim, alpha: alpha * 0.7, width: 1.4 * this.scale });

    // The knob: at the centre when released, and pushed to where the thumb is while held.
    const knobRadius = w.radius * 0.36;
    g.circle(w.x + this.knobX, w.y + this.knobY, knobRadius).fill({
      color: held ? 0x2f5f86 : 0x21344d,
      alpha: held ? 0.9 : 0.6,
    });
    g.circle(w.x + this.knobX, w.y + this.knobY, knobRadius).stroke({
      color: held ? 0xd8fbff : 0x7fb6d4,
      alpha: held ? 0.95 : 0.5,
      width: 1.6 * this.scale,
    });
  }

  private drawSkillButton(): void {
    const g = this.buttonGfx;
    g.clear();
    if (!this.hasSkill) return;

    const sb = this.skillButton;
    this.skillFlash = Math.max(0, this.skillFlash - 0.05);
    if (this.skillFlash > 0) {
      g.circle(sb.x, sb.y, sb.radius * (1.2 + this.skillFlash * 0.3)).fill({ color: 0xc79bff, alpha: 0.3 * this.skillFlash });
    }
    g.circle(sb.x, sb.y, sb.radius).fill({ color: 0x1d2a44, alpha: 0.7 });
    g.circle(sb.x, sb.y, sb.radius).stroke({ color: 0xc79bff, alpha: 0.85, width: 2 });

    // A four-point star, so the button reads as "a thing you spend" rather than as a direction.
    const r = sb.radius;
    g.moveTo(sb.x, sb.y - r * 0.5)
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
   * `targetX`/`targetY` are gone with the drag model. What replaces them is the axis the wheel feeds, plus the
   * deflection, which is the number a test actually wants: "the wheel is pushed 60% up" is the input, and the
   * movement that follows is a separate claim.
   */
  get debugState(): {
    held: boolean;
    wheelPointers: number;
    deflection: number;
    axisX: number;
    axisY: number;
    wheelX: number;
    wheelY: number;
    knobX: number;
    knobY: number;
    hasSkill: boolean;
  } {
    return {
      held: this.wheelPointer !== null,
      wheelPointers: this.wheelPointer === null ? 0 : 1,
      deflection: this.deflection,
      axisX: this.input.wheelX,
      axisY: this.input.wheelY,
      wheelX: this.input.wheelX,
      wheelY: this.input.wheelY,
      knobX: this.knobX,
      knobY: this.knobY,
      hasSkill: this.hasSkill,
    };
  }

  /** Wheel geometry, so a probe can push the real control instead of guessing where it is. */
  get wheelGeometry(): { x: number; y: number; radius: number; deadZone: number } {
    return { ...this.wheel, deadZone: this.wheel.radius * mech.movement.wheel.deadZoneRatio };
  }

  /** Skill button geometry, so a probe can press the real control instead of guessing. */
  get skillGeometry(): { x: number; y: number; radius: number } {
    return { ...this.skillButton };
  }

  /** Named layers, exposed so a test can inspect them. */
  get layers(): { surface: Graphics; wheel: Graphics; button: Graphics } {
    return { surface: this.surface, wheel: this.wheelGfx, button: this.buttonGfx };
  }

  /** Test hook: force the press pulse, bypassing the event system. */
  debugSetBoosting(value: boolean): boolean {
    void value;
    return false;
  }
}
