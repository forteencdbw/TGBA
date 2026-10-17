import { Container, Graphics } from 'pixi.js';
import { mech } from './config';
import type { Input } from './input';
import { defaultBubbleType, type ControlId } from './bubbleTypes';
import { designScale } from './viewport';

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
   * The pointer holding the compress button, or null.
   *
   * A state rather than an edge, because digesting lasts as long as the thumb is down and costs the player both
   * their suction field and their hit points while it does. Tracked so that a second finger cannot release a
   * compression the first is still holding.
   */
  private compressPointer: number | null = null;

  /** The HUD scale from the last layout, so a redraw needs no viewport. */
  private scale = 1;
  /** Drives the press pulse on the spit button. */
  private spitFlash = 0;

  /**
   * The compression pulse's phase, in radians.
   *
   * Read from the WALL CLOCK rather than from a game clock, and that is deliberate: this drives one decorative
   * ring around a button, it must keep moving even while the game is paused behind the settings panel, and
   * threading the game's own elapsed time through every call site of `update()` -- which the pointer handlers
   * also make -- would be plumbing for a sine wave. Nothing is asserted about it and nothing depends on it.
   *
   * The frequency is a literal rather than a config read: the digest block it came from is gone, and this whole
   * button is a dormant path no type declares -- if a future type brings the verb back, the number belongs in the
   * config again.
   */
  private get compressPulse(): number {
    return (performance.now() / 1000) * 2.4 * Math.PI * 2;
  }
  /**
   * The spit button's geometry, in the bottom-LEFT corner.
   *
   * The bottom of the lane is where a thumb rests, and the corners take the deliberate verbs while the middle
   * stays free for the drag -- a drag that started on a button would be a press of that button instead.
   */
  private spitButton = { x: 0, y: 0, radius: 0 };
  /**
   * The compress button, stacked directly ABOVE the spit button.
   *
   * Above rather than beside, because the two are the same kind of verb -- both act on the stomach -- and because
   * the column is the only place with room. Deliberately the smaller of the two: spitting is the reflex and
   * compressing is the considered action, so the sizes say which one a thumb should find without looking.
   *
   * They have to be SEPARATE controls. Spitting and digesting are a choice between two things the player wants
   * for different reasons, so a control where one happens on the way to the other is not a choice at all.
   */
  private compressButton = { x: 0, y: 0, radius: 0 };

  /**
   * The burst button: the volatile bubble's spend-the-whole-gauge verb.
   *
   * It shares the spit button's slot, because no type has both -- a player who has learned "my action is under
   * that thumb" keeps the map when they switch bubbles, and only the shape inside the button changes.
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
  /**
   * The DEFAULT type's controls, so the layer agrees with the game before the first `setControls` lands -- a probe
   * that starts a run through the raw `startRun` hook (which skips `enterFromMenu`) reads this list, and it must not
   * name verbs no type has any more.
   */
  private controls: readonly ControlId[] = defaultBubbleType().controls;

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
   * other presses a control. Every handler is a no-op for an id it does not already know, so an unrelated pointer
   * cannot disturb an active control.
   */
  onPointerDown(pointerId: number, x: number, y: number): void {
    /**
     * The spit button fires on PRESS: it is a discrete action, and requiring a release would make a rapid one-two
     * (spit, spit) feel sluggish under a thumb that lingers.
     */
    if (this.has('spit') && this.isInSpitButton(x, y)) {
      this.input.pressSpit();
      this.spitFlash = 1;
      this.update();
      return;
    }

    /**
     * The burst fires on PRESS, like the spit: it is a discrete action with a one-shot cost, so a release would
     * only add a frame of doubt to a panic button.
     */
    if (this.has('burst') && this.isInBurstButton(x, y)) {
      this.input.pressBurst();
      this.burstFlash = 1;
      this.update();
      return;
    }

    /**
     * The compress button holds a STATE, so it is claimed on the press and released on the lift.
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
     * a control belongs to that control -- reaching for a button must not also shove the bubble sideways.
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
    // Lifting off the compress button ends the digestion. It costs the player both suction and health, so it has
    // to stop the instant the thumb does.
    if (this.compressPointer === pointerId) {
      this.compressPointer = null;
      this.input.setCompressHeld(false);
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
    this.compressPointer = null;
    this.input.releaseDrag();
    this.input.suctionHeld = false;
    this.input.setCompressHeld(false);
    this.update();
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
   * Drawn as a ring bursting OUTWARD from a small core, so the shape says "this leaves the centre". The expanding
   * flash after a press is the only acknowledgement the button can give -- the wave itself happens on the bubble, in
   * the water, where the player is looking.
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
   *
   * The size comes from `designScale` of the CANVAS, derived here rather than passed in.
   *
   * It used to be handed `viewport.scale`, which is how many pixels a WORLD METRE occupies -- and on a short window
   * that number is large for the opposite reason a wide one is: a 915x412 landscape phone gave 2.49 px per metre, so
   * the buttons came out at 95px radius and the column ran off the top of the screen (the compress button sat at
   * y = -147). The HUD had the same bug and the same fix. Deriving it here means there is no parameter to pass wrong.
   */
  layout(laneLeft: number, laneWidth: number, canvasWidth: number, canvasHeight: number): void {
    const scale = designScale(canvasWidth, canvasHeight);
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
     * EVERY action button, in one vertical column on the right edge of the lane.
     *
     * ---------------------------------------------------------------------------------------------
     * WHY A COLUMN RATHER THAN THE CORNERS
     * ---------------------------------------------------------------------------------------------
     * Movement is a drag from anywhere (see the class comment), so the left and the middle of the screen are the
     * steering area. Putting every button on ONE edge leaves that area whole: a thumb never has to dodge a control to
     * grab the water, the buttons never sit under the bubble, and their positions never change between runs of the
     * same type -- which is what makes them findable without looking.
     *
     * The two-corner layout this replaces had the same buttons, but it spent both bottom corners on them and left the
     * player steering in the gap between.
     *
     * ---------------------------------------------------------------------------------------------
     * THE ORDER IS FIXED, AND IT IS BOTTOM-UP BY HOW OFTEN A VERB IS WANTED
     * ---------------------------------------------------------------------------------------------
     * The reflex -- spit, or the burst that shares its slot -- is at the bottom, where a thumb rests; compress, the
     * considered one, sits above it. Both slots are laid out whether or not the type names their control, so a verb
     * is in the same place in every run that has it -- muscle memory survives a bubble swap.
     */
    const cfg = mech.touch;
    const buttonRadius = Math.min(cfg.buttonRadius * scale, laneWidth * cfg.buttonMaxRadiusRatio);
    const columnX = laneLeft + laneWidth - cfg.rightInset * scale - buttonRadius;
    const gap = cfg.buttonGap * scale;
    let cursorY = canvasHeight - cfg.bottomInset * scale;

    /** Place one button on the column and return its rect, advancing the cursor upward. */
    const stack = (radius: number): { x: number; y: number; radius: number } => {
      // Centred on the column's axis, so a smaller button (compress) reads as part of the same column rather than as
      // one shoved against the edge.
      const button = { x: columnX, y: cursorY - radius, radius };
      cursorY = button.y - radius - gap;
      return button;
    };

    // The spit and the burst share a slot, because no type has both: one is the devour bubble's reflex and the other
    // is the volatile bubble's.
    this.spitButton = stack(buttonRadius);
    this.burstButton = { ...this.spitButton };

    /**
     * The compress button on top, and smaller.
     *
     * `COMPRESS_BUTTON_SCALE` says "this one is the considered action": spitting is the reflex and digesting is a
     * decision, so the sizes tell a thumb which is which before it reads anything. The gap is proportional to the
     * buttons rather than fixed, so the column cannot fold onto itself on a narrow lane.
     */
    this.compressButton = stack(buttonRadius * COMPRESS_BUTTON_SCALE);
    this.update();
  }

  /** Redraw the buttons. Cheap: a few circles and paths. */
  update(): void {
    /**
     * `buttonGfx` is ONE layer for every button, so it is cleared once here and each draw adds its own shapes --
     * clearing inside a single draw would erase whichever button was drawn before it.
     */
    this.buttonGfx.clear();
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
    // A literal for the same reason as `compressPulse`: the digest config is gone and this button is dormant.
    const accent = 0x9dffd8;

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
   * Drawn with an OUTWARD-pointing motif, so its shape says "something comes out of here" rather than making the
   * player read a label.
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
      sucking: this.input.suctionHeld,
      compressing: this.input.compressing,
      compressPointer: this.compressPointer,
    };
  }

  /** Spit button geometry, so a probe can press the real control instead of guessing. */
  get spitGeometry(): { x: number; y: number; radius: number } {
    return { ...this.spitButton };
  }

  /** Compress button geometry, so a probe can hold the real control instead of guessing. */
  get compressGeometry(): { x: number; y: number; radius: number } {
    return { ...this.compressButton };
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
}
