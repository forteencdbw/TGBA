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
 * The touch controls: a drag to move, and a few buttons for the verbs.
 *
 * ---------------------------------------------------------------------------------------------
 * MOVEMENT IS A DRAG, ANYWHERE ON THE SCREEN
 * ---------------------------------------------------------------------------------------------
 * Press anywhere that is not a button and move your finger: the bubble travels the SAME DISTANCE the finger did,
 * in the same direction, measured on the glass. It is a displacement, not a stick -- there is no pad to find, no
 * dead zone to leave, no ramp to spin up and no coast when you let go. Lift the finger and the bubble stays
 * exactly where it is, because it only ever moved while the finger was moving.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IF NOT "THE BUBBLE FOLLOWS YOUR FINGER", WHICH IS ALSO A POSITION
 * ---------------------------------------------------------------------------------------------
 * Because that version moves the bubble TO the finger. The bubble lands under the thumb, the player's own hand
 * covers the thing they are steering, and on a screen where seeing a hazard early is the whole skill that is the
 * wrong half of the gesture to give up. A RELATIVE drag keeps the finger free to sit on empty water: the bubble
 * moves the way the thumb moved and never has to be under it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT COSTS, STATED PLAINLY
 * ---------------------------------------------------------------------------------------------
 * "The bubble always moves exactly as far as the finger" cannot also mean "a big bubble moves less", so the stage
 * and suction speed multipliers do NOT apply to touch while this is the scheme. `movement.drag.penaltiesApply` in
 * the config puts them back for anyone who prefers that tension to the 1:1 promise; the eel's inversion still
 * applies either way, because losing control is not a speed penalty.
 *
 * ---------------------------------------------------------------------------------------------
 * ARCHITECTURE NOTE, unchanged
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
  private readonly buttonGfx = new Graphics();

  /**
   * The pointer steering the bubble, or null. Only one finger drives it.
   *
   * Anywhere off the buttons, which is why it is the LAST branch of `onPointerDown`: a touch that lands on a
   * control belongs to that control, and everything else is the player putting their hand on the bubble.
   */
  private dragPointer: number | null = null;
  /** Where the steering finger currently is, in canvas pixels. */
  private dragX = 0;
  private dragY = 0;
  /**
   * Where the steering finger LANDED, in canvas pixels.
   *
   * Kept only for the AIM. The movement is the movement -- what the finger did since the last event -- but a
   * direction read from the last few pixels of a slow drag is noise, whereas the offset from where the thumb went
   * down is a direction the player chose and can hold.
   */
  private dragAnchorX = 0;
  private dragAnchorY = 0;
  /** The play area's size from the last layout: what turns a finger's pixels into a fraction of the screen. */
  private laneWidthPx = 0;
  private canvasHeightPx = 0;
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

  /** Button geometry, recomputed by `layout`. */
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
   * The bottom of the lane is where a thumb rests, and the two corners take the two deliberate verbs while the
   * middle stays free for the drag -- a drag that started on a button would be a press of that button instead.
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
  private controls: readonly ControlId[] = ['skill', 'suction', 'spit', 'compress'];

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
    this.root.addChild(this.surface, this.buttonGfx);
    this.surface.eventMode = 'none';
    this.buttonGfx.eventMode = 'none';
  }

  /**
   * Pointer entry points. Called by the host from stage-level listeners, so nothing here depends on Pixi's hit
   * testing. See the class comment.
   *
   * MULTI-TOUCH: the steering finger and the buttons are routed independently, so one hand can steer while the
   * other fires a skill. Every handler is a no-op for an id it does not already know, so an unrelated pointer
   * cannot disturb an active control.
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
     * Everything else is the player putting a hand on the bubble.
     *
     * ANYWHERE on the screen, which is the whole point of the scheme: there is no pad to find, and the finger is
     * free to sit on empty water where it covers nothing. It is the LAST branch here because a touch that lands on
     * a control belongs to that control -- reaching for the spit button must not also shove the bubble sideways.
     *
     * A second finger while one is already steering is ignored rather than taking over: swapping hands
     * mid-manoeuvre should not happen by accident.
     */
    if (this.dragPointer === null) {
      this.dragPointer = pointerId;
      this.dragX = x;
      this.dragY = y;
      this.dragAnchorX = x;
      this.dragAnchorY = y;
      this.input.dragHeld = true;
      this.input.setDragAim(0, 0);
    }
  }

  /**
   * A finger moved: move the bubble by the same distance, in the same direction.
   *
   * The displacement is handed over in the two fractions the player stores its position in -- lane widths across,
   * window heights up -- because that is what makes the bubble travel exactly as far as the finger: the lane is
   * `laneWidthPx` wide on screen and the window `canvasHeightPx` tall, so a pixel delta divided by those is the
   * same distance measured on the glass.
   *
   * The sign of the vertical is flipped here, once: screen y grows DOWNWARDS and `screenY` grows UPWARDS.
   */
  onPointerMove(pointerId: number, x: number, y: number): void {
    if (this.dragPointer !== pointerId) return;

    const dx = x - this.dragX;
    // Negated: a finger moving down the screen must move the bubble down, and `screenY` counts upwards.
    const dy = -(y - this.dragY);
    this.dragX = x;
    this.dragY = y;

    if (this.laneWidthPx > 0 && this.canvasHeightPx > 0) {
      this.input.addDrag(dx / this.laneWidthPx, dy / this.canvasHeightPx);
    }

    // The aim, from where the thumb went down rather than from the last few pixels of movement: a slow drag has
    // almost no direction in it frame to frame, but "up and to the right of my thumb's landing spot" is a
    // direction the player chose and is holding.
    this.input.setDragAim(x - this.dragAnchorX, -(y - this.dragAnchorY));
  }

  onPointerUp(pointerId: number): void {
    // Releasing the suction button ends the field. Checked before the drag so a stray release cannot leave the
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
    if (this.dragPointer !== pointerId) return;
    /**
     * Letting go simply stops the bubble, and there is nothing to recentre.
     *
     * A stick has to be re-zeroed on release or it would keep asking to move; a drag has already delivered
     * everything it was going to. Wherever the bubble is when the finger lifts is where it stays -- including
     * mid-screen and including after the drag ran into a wall, since nothing is stored to spring back from.
     */
    this.dragPointer = null;
    this.input.releaseDrag();
  }

  /** Forget every pointer, e.g. after a layout change or on leaving the level. */
  releaseAll(): void {
    this.dragPointer = null;
    this.suctionPointer = null;
    this.compressPointer = null;
    this.chargePointer = null;
    this.chargeHold = 0;
    this.input.releaseDrag();
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
   * @param laneLeft,laneWidth the play area in canvas pixels.
   *
   *   The controls are laid out against the LANE, not the canvas. On a wide desktop window the lane is a centred
   *   portrait column with water either side, so placing a control at `canvasWidth - 76 * scale` put it off the
   *   screen entirely -- a control the player simply does not have.
   */
  layout(laneLeft: number, laneWidth: number, canvasWidth: number, canvasHeight: number, scale: number): void {
    this.scale = scale;
    /**
     * Remembered for the drag, which is the one control with no geometry of its own.
     *
     * A finger's movement arrives in canvas pixels and the bubble's position is stored as fractions of exactly
     * these two lengths, so this is where "the bubble moves as far as the finger" is made true: 30px across a
     * 390px lane is 30/390 of the lane, whether that lane is on a phone or letterboxed into a desktop window.
     */
    this.laneWidthPx = laneWidth;
    this.canvasHeightPx = canvasHeight;

    this.surface.clear();
    this.surface.rect(0, 0, canvasWidth, canvasHeight).fill({ color: 0xffffff, alpha: 0.001 });

    /**
     * The skill button sits low and to the RIGHT within the lane, where a thumb rests without covering the
     * bubble, and clear of the middle so a drag never starts on it.
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

  /** Redraw the buttons. Cheap: a few circles and paths. */
  update(): void {
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
   * The drag's own numbers are what a test wants -- "the finger is down", "this much displacement is queued", "the
   * aim points this way" -- because the movement that follows is a separate claim. `pendingX`/`pendingY` are the
   * displacement still waiting to be consumed, so a probe can assert that a gesture produced it without depending
   * on which frame the physics got to.
   */
  get debugState(): {
    /** Whether a finger is steering the bubble. */
    steering: boolean;
    /** How many pointers are steering. Never more than one, by design. */
    dragPointers: number;
    /** The displacement queued for the physics, in lane widths and window heights. */
    pendingX: number;
    pendingY: number;
    /** Where the drag points, from the point the finger landed. */
    aimX: number;
    aimY: number;
    /** The finger's live position in canvas pixels, or null when nothing is steering. */
    pointerAt: { x: number; y: number } | null;
    hasSkill: boolean;
    /** Whether the suction field is being held. */
    sucking: boolean;
    /** Whether the stomach is being compressed, from either device. */
    compressing: boolean;
    /** The pointer holding the compress button, or null. Proves the hold is owned by one finger. */
    compressPointer: number | null;
  } {
    return {
      steering: this.dragPointer !== null,
      dragPointers: this.dragPointer === null ? 0 : 1,
      pendingX: this.input.debugPendingDrag.x,
      pendingY: this.input.debugPendingDrag.y,
      aimX: this.input.dragAimX,
      aimY: this.input.dragAimY,
      pointerAt: this.dragPointer === null ? null : { x: this.dragX, y: this.dragY },
      hasSkill: this.hasSkill,
      sucking: this.input.suctionHeld,
      compressing: this.input.compressing,
      compressPointer: this.compressPointer,
    };
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
  get layers(): { surface: Graphics; button: Graphics } {
    return { surface: this.surface, button: this.buttonGfx };
  }

  /** Test hook: force the press pulse, bypassing the event system. */
  debugSetBoosting(value: boolean): boolean {
    void value;
    return false;
  }
}
