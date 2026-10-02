import { Container, Graphics } from 'pixi.js';
import { mech } from './config';
import type { Input } from './input';
import type { ControlId } from './bubbleTypes';

/** The field's accent colour, read from the config each frame so a live edit is visible immediately. */
function suctionFieldColor(): number {
  return mech.suction.fieldColor;
}

/**
 * How much smaller the compress button is than the spit button.
 *
 * Sized by SHAPE rather than by position, because the two are the same kind of verb and sit in the same column:
 * the bigger one is the reflex (spit), the smaller one is the considered action (digest), and the sizes say which
 * a thumb should find without looking. Kept here rather than in the config for the same reason the other button
 * geometry is: it is one number describing a relationship between two controls, not a value anyone tunes alone.
 */
const COMPRESS_BUTTON_SCALE = 0.8;

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
  /**
   * The pointer holding the suction button, or null.
   *
   * The suction field is always available, unlike the skill, so this button is always drawn -- which also gives
   * the skill somewhere to live: tapping the same button fires it. One control rather than two, in a corner that
   * has room for one.
   */
  private suctionPointer: number | null = null;
  /**
   * The pointer holding the compress button, or null.
   *
   * A state rather than an edge, because digesting lasts as long as the thumb is down and costs the player both
   * their suction field and their hit points while it does. Tracked so that a second finger cannot release a
   * compression the first is still holding, the same reason the suction pointer exists.
   */
  private compressPointer: number | null = null;
  /**
   * The pointer holding the charge button, or null.
   *
   * A state, like the compress button -- the wind-up lasts as long as the thumb does -- and its release is what
   * fires the slam. Claimed so a second finger cannot let go of a charge the first is still winding.
   */
  private chargePointer: number | null = null;
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
  /** Whether a skill is carried, so the star can appear inside the suction button. */
  private hasSkill = false;
  /** Drives the press pulse on the suction button. Set on press, decays in `update`. */
  private skillFlash = 0;
  /** Drives the press pulse on the spit button. */
  private spitFlash = 0;

  /**
   * The compression pulse's phase, in radians.
   *
   * Read from the WALL CLOCK rather than from a game clock, and that is deliberate: this drives one decorative
   * ring around a button, it must keep moving even while the game is paused behind the settings panel, and
   * threading the game's own elapsed time through every call site of `update()` -- which the pointer handlers
   * also make -- would be plumbing for a sine wave. Nothing is asserted about it and nothing depends on it.
   */
  private get compressPulse(): number {
    return (performance.now() / 1000) * mech.digest.pulseHz * Math.PI * 2;
  }
  /**
   * The spit button's geometry, in the bottom-LEFT corner.
   *
   * The wheel takes the centre and suction the right, so this is the remaining thumb-reachable spot. Near enough
   * to the wheel for a right-handed player to reach across, and far enough that a wheel drag never starts on it.
   */
  private spitButton = { x: 0, y: 0, radius: 0 };
  /**
   * The compress button, stacked directly ABOVE the spit button.
   *
   * Above rather than beside, because the two are the same kind of verb -- both act on the stomach -- and because
   * the left column is the only place with room. Deliberately the smaller of the two: spitting is the reflex and
   * compressing is the considered action, so the sizes say which one a thumb should find without looking.
   *
   * They have to be SEPARATE controls, unlike suction and the skill, which share one because they are never
   * wanted at once. Spitting and digesting are a choice between two things the player wants for different
   * reasons, so a control where one happens on the way to the other is not a choice at all.
   */
  private compressButton = { x: 0, y: 0, radius: 0 };
  /**
   * The charge button: the volatile bubble's one deliberate verb.
   *
   * Bottom RIGHT, in the slot the suction/skill button uses for the devour bubble, and at the same size -- it is
   * that type's primary action, so it belongs under the thumb that is not steering. Hold to wind up, release to
   * slam, which is why nothing happens on the press.
   */
  private chargeButton = { x: 0, y: 0, radius: 0 };
  /** Drives the wind-up pulse on the charge button, 0..1. */
  private chargeHold = 0;

  /**
   * The burst button: the volatile bubble's second verb.
   *
   * Bottom LEFT, which is the spit button's slot for the devour bubble -- the same reasoning as the charge button
   * taking the right: a player who has learned "my two actions are under my two thumbs" keeps that map when they
   * switch bubbles, and only the shapes inside the buttons change.
   */
  private burstButton = { x: 0, y: 0, radius: 0 };
  /** Drives the burst's expanding flash on its button, 0..1. */
  private burstFlash = 0;

  /**
   * Which controls this type lays out.
   *
   * THE point of the abstraction: a type that does not name `spit` gets no spit button, and there is no rule
   * anywhere saying "the volatile bubble has no spit" -- the button it would have been simply is not in the list.
   * See `src/bubbleTypes.ts`.
   */
  private controls: readonly ControlId[] = ['wheel', 'skill', 'suction', 'spit', 'compress'];

  private has(control: ControlId): boolean {
    return this.controls.includes(control);
  }

  /** Lay out a different control set. Called when a run starts, before `layout`. */
  setControls(controls: readonly ControlId[]): void {
    this.controls = controls;
    this.update();
  }

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
    /**
     * The suction button fires the skill on PRESS and holds the field while down.
     *
     * Both, on one control. A skill is a discrete action so a press is enough; the field is a state, so the
     * button also sets `suctionHeld` and the release clears it. Splitting them into two buttons would put two
     * thumb targets in the same corner of a phone screen for no gain -- they are never wanted simultaneously.
     */
    if (this.has('skill') && this.isInSkillButton(x, y)) {
      this.input.pressSkill();
      this.skillFlash = 1;
      /**
       * The press is always the skill; the HOLD is whichever field this type has.
       *
       * Both meanings on one control, because they are never wanted at once -- and the hold is a property of the
       * type: the devour bubble gathers, the volatile one winds up. `suction` and `charge` are separate ids rather
       * than one "hold" id precisely so this branch cannot pick the wrong one; see `ControlId`.
       *
       * Only one pointer owns the hold. A second finger landing on the button must not be able to release something
       * the first is still holding, which it would if `onPointerUp` cleared the flag unconditionally.
       */
      if (this.has('suction') && this.suctionPointer === null) {
        this.suctionPointer = pointerId;
        this.input.suctionHeld = true;
      } else if (this.has('charge') && this.chargePointer === null) {
        /**
         * The volatile bubble's version of the same corner: holding it winds up instead of gathering.
         *
         * The skill still fires on the press, so the type keeps the devour bubble's "one control, two meanings"
         * economy rather than needing a fourth thumb target on a phone screen.
         */
        this.chargePointer = pointerId;
        this.input.setChargeHeld(true);
      }
      this.update();
      return;
    }

    /**
     * The spit button fires on PRESS, like the skill: it is a discrete action, and requiring a release would make
     * a rapid one-two (spit, spit) feel sluggish under a thumb that lingers.
     */
    if (this.has('spit') && this.isInSpitButton(x, y)) {
      this.input.pressSpit();
      this.spitFlash = 1;
      this.update();
      return;
    }

    /**
     * The burst fires on PRESS, like the spit and the skill: it is a discrete action with a one-shot cost, so a
     * release would only add a frame of doubt to a panic button.
     */
    if (this.has('burst') && this.isInBurstButton(x, y)) {
      this.input.pressBurst();
      this.burstFlash = 1;
      this.update();
      return;
    }

    /**
     * The compress button holds a STATE, so it is claimed and released like the suction button.
     *
     * Nothing fires on the press: compressing is not an event, it is a commitment, and the only thing the press
     * does is start the thumb's claim on it.
     */
    if (this.has('compress') && this.isInCompressButton(x, y)) {
      if (this.compressPointer === null) {
        this.compressPointer = pointerId;
        this.input.setCompressHeld(true);
      }
      this.update();
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
    // Releasing the suction button ends the field. Checked before the wheel so a stray release cannot leave the
    // field on, which would drain the player's speed with no way to stop it.
    if (this.suctionPointer === pointerId) {
      this.suctionPointer = null;
      this.input.suctionHeld = false;
      this.update();
    }
    // Lifting off the compress button ends the digestion. Same reasoning as the field: it costs the player both
    // suction and health, so it has to stop the instant the thumb does.
    if (this.compressPointer === pointerId) {
      this.compressPointer = null;
      this.input.setCompressHeld(false);
      this.update();
    }
    /**
     * Lifting off the charge button FIRES the slam.
     *
     * The one control in the game whose action is on the release. `setChargeHeld(false)` raises the release edge,
     * which the game consumes once -- so this handler does not need to know how to launch anything, and the launch
     * happens in the same place whichever device asked for it.
     */
    if (this.chargePointer === pointerId) {
      this.chargePointer = null;
      this.chargeHold = 0;
      this.input.setChargeHeld(false);
      this.update();
    }
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
    this.suctionPointer = null;
    this.compressPointer = null;
    this.chargePointer = null;
    this.chargeHold = 0;
    this.knobX = 0;
    this.knobY = 0;
    this.deflection = 0;
    this.input.wheelX = 0;
    this.input.wheelY = 0;
    this.input.wheelHeld = false;
    this.input.suctionHeld = false;
    this.input.setCompressHeld(false);
    this.input.setChargeHeld(false);
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

  private isInSpitButton(x: number, y: number): boolean {
    const dx = x - this.spitButton.x;
    const dy = y - this.spitButton.y;
    const reach = this.spitButton.radius * 1.35;
    return dx * dx + dy * dy <= reach * reach;
  }

  /** Slightly tighter than the other two: the compress button sits above the spit button, and a generous reach
   *  would let a thumb aiming for one land on the other. */
  private isInCompressButton(x: number, y: number): boolean {
    const dx = x - this.compressButton.x;
    const dy = y - this.compressButton.y;
    const reach = this.compressButton.radius * 1.2;
    return dx * dx + dy * dy <= reach * reach;
  }

  /** The same generosity the spit button gets: hit with a thumb, and near-misses still register. */
  private isInBurstButton(x: number, y: number): boolean {
    const dx = x - this.burstButton.x;
    const dy = y - this.burstButton.y;
    const reach = this.burstButton.radius * 1.35;
    return dx * dx + dy * dy <= reach * reach;
  }

  /**
   * The burst button: one tap spends the whole rage gauge as a shockwave.
   *
   * Drawn as a ring bursting OUTWARD from a small core, which is the third member of the family these buttons
   * belong to: inward ticks gather (the field), outward spikes wind up (the charge), and this one leaves. The
   * expanding flash after a press is the only acknowledgement the button can give -- the wave itself happens on the
   * bubble, in the water, where the player is looking.
   */
  private drawBurstButton(): void {
    const g = this.buttonGfx;
    const bb = this.burstButton;
    if (bb.radius <= 0) return;

    const look = mech.angry.appearance[mech.angry.appearance.length - 1]!;
    this.burstFlash = Math.max(0, this.burstFlash - 0.05);
    if (this.burstFlash > 0) {
      const grow = 1.15 + (1 - this.burstFlash) * 0.7;
      g.circle(bb.x, bb.y, bb.radius * grow).stroke({
        color: mech.angry.burst.waveColour,
        alpha: 0.5 * this.burstFlash,
        width: Math.max(1, 2.4 * this.scale),
      });
    }

    g.circle(bb.x, bb.y, bb.radius).fill({ color: 0x2a1418, alpha: 0.72 });
    g.circle(bb.x, bb.y, bb.radius).stroke({ color: look.rim, alpha: 0.85, width: 2 });

    // Three concentric rings, fading outward: the shape says "this leaves the centre" rather than "this pulls".
    for (let i = 0; i < 3; i++) {
      g.circle(bb.x, bb.y, bb.radius * (0.32 + i * 0.24)).stroke({
        color: mech.angry.burst.waveColour,
        alpha: 0.7 - i * 0.18,
        width: Math.max(1, 1.6 * this.scale),
      });
    }
    g.circle(bb.x, bb.y, bb.radius * 0.18).fill({ color: mech.angry.burst.waveColour, alpha: 0.9 });
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
    // The spit button mirrors it on the LEFT, at the same height, so the two are one gesture apart.
    this.spitButton = {
      x: laneLeft + buttonRadius + 12 * scale,
      y: canvasHeight - buttonRadius - 22 * scale,
      radius: buttonRadius,
    };
    /**
     * The compress button stacks above the spit button.
     *
     * `compressScale` shrinks it, so the left column reads as one reflex action (spit) with a second, more
     * deliberate one above it (compress). The gap is proportional to the button rather than fixed, so the two
     * cannot overlap on a narrow lane.
     */
    const compressRadius = buttonRadius * COMPRESS_BUTTON_SCALE;
    this.compressButton = {
      x: this.spitButton.x,
      y: this.spitButton.y - buttonRadius - compressRadius - 10 * scale,
      radius: compressRadius,
    };
    /**
     * The charge button takes the RIGHT slot, where the devour bubble's suction button sits.
     *
     * Same place and same size, deliberately: a player who has learned "my deliberate verb is under my left thumb"
     * should not have to relearn it because they picked the other bubble. What changes is the shape inside it --
     * outward spikes rather than inward ticks -- which says "this one pushes" instead of "this one pulls".
     */
    /**
     * The charge WIND-UP shares this button rather than getting its own.
     *
     * The devour bubble already puts two meanings on this control -- tap for the skill, hold for the field -- and
     * the volatile bubble does the same with the charge. Two separate buttons in one corner would be two thumb
     * targets a few pixels apart on a phone, for two verbs that are never wanted at once.
     */
    this.chargeButton = { ...this.skillButton };
    // The burst button mirrors the charge: the spit slot for the type that has no spit.
    this.burstButton = { ...this.spitButton };
    this.update();
  }

  /** Redraw the wheel and the buttons. Cheap: a few circles and paths per frame. */
  update(): void {
    // The wheel is drawn for every type: it is the one control none of them can do without.
    this.drawWheel();
    /**
     * `buttonGfx` is ONE layer for every button, so it is cleared once here and each draw adds its own shapes.
     * Clearing inside `drawSkillButton` (which is how this started) is only correct while that button is always
     * drawn -- with per-type controls it would erase whichever button was drawn before it.
     */
    this.buttonGfx.clear();
    if (this.has('skill')) this.drawSkillButton();
    if (this.has('spit')) this.drawSpitButton();
    if (this.has('burst')) this.drawBurstButton();
    if (this.has('compress')) this.drawCompressButton();
  }


  /**
   * The compress button: hold to digest.
   *
   * A separate control from the spit button rather than its hold half, and the reason is the design rather than
   * the ergonomics: spitting and digesting are the two things a player CHOOSES BETWEEN, and a control that spits
   * on the way into digesting is not a choice. It would also make a lone item impossible to digest, since the
   * press would have fired it before the hold began.
   *
   * Drawn with INWARD ticks around a shrinking core, which is the same language the bubble's own rim uses while
   * compressing -- so "I am squeezing the contents down" reads the same on the control and on the thing being
   * squeezed. Gold would have said "spit"; this says "press", and it is the smaller of the two because spitting
   * is the reflex and digesting is the considered action.
   */
  private drawCompressButton(): void {
    const g = this.buttonGfx;
    const cb = this.compressButton;
    if (cb.radius <= 0) return;

    const compressing = this.compressPointer !== null;
    const accent = mech.digest.rimColor;

    if (compressing) {
      const pulse = 0.5 + 0.5 * Math.sin(this.compressPulse);
      g.circle(cb.x, cb.y, cb.radius * (1.3 + 0.14 * pulse)).fill({ color: accent, alpha: 0.12 + 0.14 * pulse });
      g.circle(cb.x, cb.y, cb.radius * (1.3 + 0.14 * pulse)).stroke({
        color: accent,
        alpha: 0.8,
        width: Math.max(1, 2 * this.scale),
      });
    }

    g.circle(cb.x, cb.y, cb.radius).fill({ color: compressing ? 0x18342c : 0x1b2a24, alpha: 0.66 });
    g.circle(cb.x, cb.y, cb.radius).stroke({ color: accent, alpha: compressing ? 0.95 : 0.5, width: 2 });

    // Four inward ticks, so the shape reads as a squeeze rather than as a direction or a launch.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const outer = cb.radius * 0.8;
      const inner = cb.radius * (compressing ? 0.34 : 0.52);
      g.moveTo(cb.x + Math.cos(a) * outer, cb.y + Math.sin(a) * outer);
      g.lineTo(cb.x + Math.cos(a) * inner, cb.y + Math.sin(a) * inner);
    }
    g.stroke({ color: accent, alpha: compressing ? 0.95 : 0.6, width: Math.max(1, 1.8 * this.scale) });

    // The core shrinks while compressing, which is the whole verb in one shape.
    g.circle(cb.x, cb.y, cb.radius * (compressing ? 0.14 : 0.22)).fill({ color: 0xd8fff0, alpha: 0.85 });
  }

  /**
   * The spit button.
   *
   * Drawn with an OUTWARD-pointing motif, deliberately the opposite of the suction button's inward ticks. The two
   * sit at the same height on opposite sides and do opposite things, so their shapes have to differ at a glance
   * rather than requiring the player to remember which side is which.
   *
   * The count of items inside is not shown here: that belongs on the bubble, where the capacity it represents
   * actually is, and where the bulge already says it.
   */
  private drawSpitButton(): void {
    const g = this.buttonGfx;
    const sb = this.spitButton;
    if (sb.radius <= 0) return;

    this.spitFlash = Math.max(0, this.spitFlash - 0.06);
    if (this.spitFlash > 0) {
      g.circle(sb.x, sb.y, sb.radius * (1.25 + this.spitFlash * 0.35)).fill({ color: 0xffd479, alpha: 0.32 * this.spitFlash });
    }

    g.circle(sb.x, sb.y, sb.radius).fill({ color: 0x2a2418, alpha: 0.72 });
    g.circle(sb.x, sb.y, sb.radius).stroke({ color: 0xffd479, alpha: 0.85, width: 2 });

    // Three outward ticks, so the button reads as a launch rather than as a direction.
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const inner = sb.radius * 0.34;
      const outer = sb.radius * 0.74;
      g.moveTo(sb.x + Math.cos(a) * inner, sb.y + Math.sin(a) * inner);
      g.lineTo(sb.x + Math.cos(a) * outer, sb.y + Math.sin(a) * outer);
    }
    g.stroke({ color: 0xffd479, alpha: 0.9, width: Math.max(1, 2 * this.scale) });

    // A filled core, so the shape reads as "something comes out of here" rather than as a spinner.
    g.circle(sb.x, sb.y, sb.radius * 0.2).fill({ color: 0xfff0d0, alpha: 0.9 });
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

  /**
   * The right-hand button: the skill, plus whichever HOLD this type's bubble has.
   *
   * ALWAYS drawn, because the skill is always available -- and a control that appears and disappears is one the
   * player has to re-find.
   *
   * The two meanings are told apart by shape rather than by a label. A tap is the skill, and the star inside shows
   * whether there is one to spend. The hold is the FIELD for the devour bubble (inward ticks, a ring that lights up)
   * and the WIND-UP for the volatile one (outward spikes, a core that grows) -- the same opposition the spit and
   * suction buttons use, so "inward means gather, outward means launch" holds across the whole control set.
   */
  private drawSkillButton(): void {
    const g = this.buttonGfx;

    const sb = this.skillButton;
    /**
     * `has('suction')` is checked as well as the pointer, because the flag is owned by the input rather than by this
     * layer: a type without the field must not draw one even if a stray flag survived a type change.
     */
    const sucking = this.has('suction') && this.suctionPointer !== null;
    const winding = this.has('charge') && this.chargePointer !== null;
    const accent = winding ? mech.angry.appearance[mech.angry.appearance.length - 1]!.rim : suctionFieldColor();
    this.skillFlash = Math.max(0, this.skillFlash - 0.05);

    // The press pulse, for the skill's edge trigger.
    if (this.skillFlash > 0) {
      g.circle(sb.x, sb.y, sb.radius * (1.2 + this.skillFlash * 0.3)).fill({ color: 0xc79bff, alpha: 0.3 * this.skillFlash });
    }

    /**
     * The field ring: a second circle that appears only while gathering, growing slightly outward.
     *
     * The same visual language as the wave drawing -- a ring around the bubble means "the field is up" -- so the
     * button and the effect read as one thing rather than as two unrelated cues.
     */
    if (sucking) {
      g.circle(sb.x, sb.y, sb.radius * 1.45).fill({ color: suctionFieldColor(), alpha: 0.18 });
      g.circle(sb.x, sb.y, sb.radius * 1.45).stroke({ color: suctionFieldColor(), alpha: 0.8, width: Math.max(1, 2 * this.scale) });
    }
    if (winding) {
      // The wind-up's own pulse, growing with the hold: the bubble is being squeezed and is about to be let go.
      this.chargeHold = Math.min(1, this.chargeHold + 0.035);
      g.circle(sb.x, sb.y, sb.radius * (1.25 + 0.2 * this.chargeHold)).fill({
        color: accent,
        alpha: 0.14 + 0.2 * this.chargeHold,
      });
    } else {
      this.chargeHold = 0;
    }

    g.circle(sb.x, sb.y, sb.radius).fill({ color: sucking ? 0x1b3f57 : winding ? 0x3a1a14 : 0x1d2a44, alpha: 0.75 });
    g.circle(sb.x, sb.y, sb.radius).stroke({
      color: sucking || winding ? accent : this.has('charge') ? accent : 0xc79bff,
      alpha: this.hasSkill || sucking || winding ? 0.9 : 0.45,
      width: 2,
    });

    if (this.has('charge')) {
      /**
       * The wind-up motif: four OUTWARD spikes around a core that grows with the hold.
       *
       * The opposite of the field's inward ticks, and the reason it is drawn here rather than on a second button:
       * one control, two meanings, and the shape says which. A core that GROWS also says "this is not a timer" --
       * nothing is being waited for, the bubble is being wound.
       */
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const inner = sb.radius * 0.42;
        const outer = sb.radius * (winding ? 0.95 : 0.78);
        g.moveTo(sb.x + Math.cos(a) * inner, sb.y + Math.sin(a) * inner);
        g.lineTo(sb.x + Math.cos(a) * outer, sb.y + Math.sin(a) * outer);
      }
      g.stroke({ color: accent, alpha: winding ? 0.95 : 0.6, width: Math.max(1, 2 * this.scale) });
      g.circle(sb.x, sb.y, sb.radius * (0.16 + 0.2 * this.chargeHold)).fill({ color: 0xffe0d0, alpha: 0.9 });
    } else {
      // The gathered-field motif: three inward ticks, so the button reads as a pull rather than a direction.
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const outer = sb.radius * 0.86;
        const inner = sb.radius * 0.62;
        g.moveTo(sb.x + Math.cos(a) * outer, sb.y + Math.sin(a) * outer);
        g.lineTo(sb.x + Math.cos(a) * inner, sb.y + Math.sin(a) * inner);
      }
      g.stroke({ color: suctionFieldColor(), alpha: sucking ? 0.95 : 0.5, width: Math.max(1, 1.6 * this.scale) });
    }

    /**
     * The star, only when a skill is actually carried.
     *
     * Its absence is the information: the button is always there, so a player looking at it can tell whether they
     * have something to spend without checking a HUD line.
     */
    if (!this.hasSkill) return;
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
    /** Whether the suction field is being held. */
    sucking: boolean;
    /** Whether the stomach is being compressed, from either device. */
    compressing: boolean;
    /** The pointer holding the compress button, or null. Proves the hold is owned by one finger. */
    compressPointer: number | null;
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
      sucking: this.input.suctionHeld,
      compressing: this.input.compressing,
      compressPointer: this.compressPointer,
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

  /** Spit button geometry, so a probe can press the real control instead of guessing. */
  get spitGeometry(): { x: number; y: number; radius: number } {
    return { ...this.spitButton };
  }

  /** Compress button geometry, so a probe can hold the real control instead of guessing. */
  get compressGeometry(): { x: number; y: number; radius: number } {
    return { ...this.compressButton };
  }

  /** Charge button geometry, so a probe can hold and release the real control. */
  get chargeGeometry(): { x: number; y: number; radius: number } {
    return { ...this.chargeButton };
  }

  /** Burst button geometry, so a probe can press the real control. */
  get burstGeometry(): { x: number; y: number; radius: number } {
    return { ...this.burstButton };
  }

  /** Test hook: which controls this type laid out. */
  get controlIds(): readonly ControlId[] {
    return this.controls;
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
