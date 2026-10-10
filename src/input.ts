/**
 * Input. Desktop is the development driver (keyboard); touch is the shipping target.
 *
 * The two devices do NOT produce the same kind of thing, and pretending they did cost the phone its feel. The
 * keyboard asks for a SPEED (an axis, with a ramp and a coast); a finger on a phone asks for a DISTANCE -- drag
 * 30px and the bubble moves 30px, from wherever it is. So the input carries both: `axisX`/`axisY` for the keyboard,
 * and a displacement (`consumeDrag`) for touch. See `src/player.ts` for where each one is applied.
 *
 * The bubble moves FREELY in the plane, so the keyboard drives four directions and there is no boost
 * or brake key: with the player in control of the vertical, both would just be second ways to do what
 * the direction keys already do.
 */

const KEYS = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  /**
   * The active skill.
   *
   * `KeyJ` sits under the right hand, next to the arrow keys, so a reflex press does not require the
   * left hand to leave WASD. Enter is also accepted because it is what a player tries first when a
   * game has one obvious button.
   */
  skill: ['KeyJ', 'Enter'],
  /**
   * Spit: TAP to fire the oldest thing in the stomach. One press, one projectile.
   *
   * `KeyK` continues the J/K/L cluster under the right hand, so the three verbs sit together and none of them
   * needs the left hand to leave WASD.
   */
  spit: ['KeyK'],
  /**
   * Compress: HOLD to digest. Deliberately its OWN key rather than the hold half of the spit key.
   *
   * The two verbs are a CHOICE -- spit for ammunition, digest for rank -- and a control where spitting happens on
   * the way in to digesting is not a choice, it is a tax on one of the options. It would also make a lone item
   * impossible to digest at all, since the press would have fired it before the hold began. Two verbs that are
   * never wanted at once can share a control (which is why suction and the skill do); two verbs the player picks
   * BETWEEN cannot.
   */
  compress: ['KeyL'],
  /**
   * Charge: HOLD to wind up, RELEASE to slam. The volatile bubble's verb.
   *
   * Space is the one key a player tries without being told, and it sits under the thumb on the left hand -- so a
   * player steering with WASD can wind up and let go without moving either hand. The release matters as much as the
   * press here: this is the only verb in the game whose ACTION happens on the way up, which is why the input has to
   * carry a release edge rather than only a held flag.
   */
  charge: ['Space'],
  /**
   * Burst: TAP to spend the whole rage gauge as a shockwave. The volatile bubble's other verb.
   *
   * `KeyK` is the spit key for the devour bubble, and the two share it on purpose. The types are mutually exclusive,
   * the key occupies the same physical slot (the second action under the right hand), and the touch layer already
   * gives one button two meanings depending on the type -- so a keyboard that did otherwise would be the odd one out.
   * Which verb a press means is decided by the TYPE, not by the key: see `hasVerb`.
   */
  burst: ['KeyK'],
  /** Mute toggle. `KeyM` is the near-universal convention and costs nothing to honour. */
  mute: ['KeyM'],
} as const;

/** The mutation pick's keys, in card order: 1, 2, 3. The badges on the cards say which is which. */
const LEVELUP_KEYS = ['Digit1', 'Digit2', 'Digit3'] as const;

export class Input {
  private readonly down = new Set<string>();
  private disposers: Array<() => void> = [];

  /** Horizontal axis, -1 (left) .. 1 (right). */
  axisX = 0;
  /** Vertical axis, +1 (up) .. -1 (down). */
  axisY = 0;

  /**
   * The touch drag: a DISPLACEMENT, not a throttle.
   *
   * The phone steers by dragging a finger anywhere on the screen, and what that produces is a distance rather
   * than a speed -- the bubble moves by exactly the distance the finger moved, from wherever it already is. So it
   * cannot be folded into the axes above, which are speeds with a ramp and a coast; it is its own channel, and
   * `Player.update` applies it as a position.
   *
   * `dragFracX` is in LANE WIDTHS and `dragFracY` in WINDOW HEIGHTS, the two fractions the player already stores
   * its position in, so nothing here has to know the viewport -- the touch layer, which does, converts.
   */
  private dragFracX = 0;
  private dragFracY = 0;

  /**
   * True while a finger is on the screen steering.
   *
   * Not the same as "the finger has moved": a thumb resting still is still a hand on the controls, and the trash
   * bag's grip, which tears off a STRUGGLING player, has to read it that way. See `steering`.
   */
  dragHeld = false;

  /**
   * Where the drag is pointing, -1..1 on each axis, +Y up.
   *
   * From the finger's offset from the point it first landed on, so it is a direction the player chose rather than
   * a leftover of the last few pixels of movement. Read by the two aiming verbs (spit and the charge slam), and
   * zero while the finger sits on its own anchor -- which is what makes "not aiming" expressible.
   */
  dragAimX = 0;
  dragAimY = 0;

  /**
   * Add a finger's movement to the pending displacement.
   *
   * ACCUMULATED rather than assigned: pointer events arrive between frames, the physics runs in fixed sub-steps,
   * and the first sub-step consumes the whole lot. Assigning would keep only the last event of the frame and lose
   * the rest of the gesture.
   */
  addDrag(fracX: number, fracY: number): void {
    this.dragFracX += fracX;
    this.dragFracY += fracY;
  }

  /** Point the aim, from the finger's offset from the point it landed on. */
  setDragAim(x: number, y: number): void {
    this.dragAimX = x;
    this.dragAimY = y;
  }

  /**
   * Take the pending displacement, once.
   *
   * Consuming rather than reading is what keeps the 1:1 promise: the physics runs up to eight sub-steps per frame,
   * and a displacement read eight times would move the bubble eight times as far as the finger.
   */
  consumeDrag(): { x: number; y: number } {
    const drag = { x: this.dragFracX, y: this.dragFracY };
    this.dragFracX = 0;
    this.dragFracY = 0;
    return drag;
  }

  /** Let go of the drag, and forget anything it had queued. */
  releaseDrag(): void {
    this.dragFracX = 0;
    this.dragFracY = 0;
    this.dragHeld = false;
    this.dragAimX = 0;
    this.dragAimY = 0;
  }

  /** The queued displacement, for probes. READING it does not consume it; only `consumeDrag` does. */
  get debugPendingDrag(): { x: number; y: number } {
    return { x: this.dragFracX, y: this.dragFracY };
  }

  /**
   * True while the suction button is held.
   *
   * HELD rather than edge-triggered, unlike the skill. A skill is a discrete action, so one press is one use; the
   * suction field is a STATE that exists while the thumb is down, and `moveSpeedFactor` is the price of it. An
   * edge trigger would make it a toggle, which is a different mechanic: it would remove the commitment, and the
   * commitment is what makes choosing when to gather interesting.
   */
  suctionHeld = false;

  /**
   * The spit button was pressed this frame.
   *
   * Edge-triggered and CONSUMED, like the skill: one press is one projectile, and a plain flag read every frame
   * would empty the whole stomach in three frames.
   */
  private spitPressed = false;

  /**
   * HOLDING the compress control makes the stomach digest fast, and the bubble pay for it.
   *
   * HELD rather than edge-triggered, for the same reason as suction: it is a STATE with a price
   * (`moveSpeedFactor` for one, no suction and double damage for the other), and making it a toggle would remove
   * the commitment that makes choosing when to do it interesting.
   *
   * Two producers, one answer, the same shape as the movement axes. They are kept apart rather than sharing one
   * field because both are written from different places -- the keyboard once per `update`, the touch layer
   * whenever a finger lands or lifts -- and a shared field would let whichever ran last win. A player holding the
   * key while a thumb is on the button is compressing, and nothing should be able to say otherwise.
   */
  private compressKeyHeld = false;
  private compressTouchHeld = false;

  /** Whether the player is asking to compress the stomach right now. */
  get compressing(): boolean {
    return this.compressKeyHeld || this.compressTouchHeld;
  }

  /**
   * Wind-up: true while the charge control is held, from either device.
   *
   * A HELD state, like suction and compression, because the wind-up is a commitment -- the bubble is slower and its
   * aim is being fixed while it lasts. The LAUNCH is a separate edge (see `consumeChargeRelease`), so this verb has
   * one of each within a single control, which is what makes it feel like winding a spring rather than pressing a
   * button.
   */
  private chargeKeyHeld = false;
  private chargeTouchHeld = false;
  /** The release edge, consumed by the game exactly like a spit or a skill press. */
  private chargeReleased = false;

  get charging(): boolean {
    return this.chargeKeyHeld || this.chargeTouchHeld;
  }

  /** Signal a burst press from a touch control. */
  pressBurst(): void {
    this.burstPressed = true;
  }

  /** The burst press, consumed once like the skill and the spit. */
  private burstPressed = false;

  consumeBurst(): boolean {
    if (!this.burstPressed) return false;
    this.burstPressed = false;
    return true;
  }

  /** Signal a charge release from a touch control. */
  pressChargeRelease(): void {
    this.chargeReleased = true;
  }

  /**
   * Take the pending charge release, if any.
   *
   * Consuming rather than reading, for the same reason as the skill and the spit: the launch must happen exactly
   * once. A plain flag would fire the slam on every frame the release was pending, which at 60fps would be a
   * continuous barrage out of a single let-go.
   */
  consumeChargeRelease(): boolean {
    if (!this.chargeReleased) return false;
    this.chargeReleased = false;
    return true;
  }

  /** Signal the charge hold from a touch control. See `setCompressHeld` for why this is a setter. */
  setChargeHeld(held: boolean): void {
    if (this.chargeTouchHeld && !held) this.chargeReleased = true;
    this.chargeTouchHeld = held;
  }

  /**
   * Whether any deliberate movement input is present: a key held, or a finger steering.
   *
   * Exposed because several systems ask "is the player actively steering" rather than "where are they going" --
   * a trash bag is torn off by a struggling player, and a measurement wants a player who is not struggling.
   *
   * A finger that is down counts even if it is not moving, because a thumb on the screen IS the player's hands on
   * the controls; with the drag there is no axis left over to be off-centre, and reading only the displacement
   * would make "hold still and struggle" unexpressible.
   */
  get steering(): boolean {
    return this.axisX !== 0 || this.axisY !== 0 || this.dragHeld;
  }

  /**
   * Whether the player is gathering.
   *
   * Separate from `steering` on purpose: holding the suction button IS a deliberate action, and the trash bag
   * tears off when the player struggles, so counting suction as a struggle would let a player escape a grab by
   * gathering. That is a real interaction, but it belongs in the design rather than in the meaning of a shared
   * flag.
   */
  get sucking(): boolean {
    return this.suctionHeld;
  }
  /**
   * Touch: the on-screen skill button was pressed this frame.
   *
   * Edge-triggered rather than held, because a skill is a discrete action. `consumeSkill()` clears it
   * so one tap cannot fire the skill on several consecutive frames -- which with a 3-use skill would
   * drain the whole slot from a single press.
   */
  private skillPressed = false;

  attach(target: HTMLElement | Window): void {
    const onKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.repeat) return;
      this.down.add(e.code);
      // Stop the page from scrolling on space / arrows.
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    };
    const onKeyUp = (event: Event) => {
      this.down.delete((event as KeyboardEvent).code);
    };
    const onBlur = () => this.down.clear();

    target.addEventListener('keydown', onKeyDown);
    target.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    this.disposers = [
      () => target.removeEventListener('keydown', onKeyDown),
      () => target.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('blur', onBlur),
    ];
  }

  /** Recompute the axes from raw state. Call once per frame, before physics. */
  update(): void {
    const held = (codes: readonly string[]) => codes.some((code) => this.down.has(code));

    const keyX = (held(KEYS.right) ? 1 : 0) - (held(KEYS.left) ? 1 : 0);
    const keyY = (held(KEYS.up) ? 1 : 0) - (held(KEYS.down) ? 1 : 0);

    /**
     * The axes are the keyboard's alone now.
     *
     * Touch used to share them, feeding the wheel's deflection in when no key was down. It cannot any more, and
     * that is the point of the drag: a displacement is not a speed, so it travels on its own channel and the
     * physics applies it as a position. Nothing is summed, so a key and a finger cannot add up to a bubble that
     * moves faster than either device was tuned for.
     */
    this.axisX = keyX;
    this.axisY = keyY;

    // Keyboard is edge-detected here rather than in the event handler, so the key repeat rate and a
    // held key cannot fire the skill more than once.
    const skillDown = held(KEYS.skill);
    if (skillDown && !this.skillKeyWasDown) this.skillPressed = true;
    this.skillKeyWasDown = skillDown;

    const muteDown = held(KEYS.mute);
    if (muteDown && !this.muteKeyWasDown) this.mutePressed = true;
    this.muteKeyWasDown = muteDown;

    /**
     * Spit and compress: one is edge-triggered, the other is a state, and they are separate keys because they are
     * separate CHOICES. See `KEYS.compress`.
     *
     * Edge-detected here rather than in the event handler, for the same reason as the skill: the key repeat rate
     * must not turn a held key into a stream of shots. The hold is written unconditionally, so releasing the key
     * stops the compression on the very next frame.
     */
    const spitDown = held(KEYS.spit);
    if (spitDown && !this.spitKeyWasDown) this.spitPressed = true;
    this.spitKeyWasDown = spitDown;

    this.compressKeyHeld = held(KEYS.compress);

    /**
     * The charge: the hold is written unconditionally, and the RELEASE raises an edge.
     *
     * The edge is what the launch reads, and it is raised here rather than in the keyup handler so that keyboard and
     * touch produce the same single event -- the game consumes one release, not one per device.
     */
    const chargeDown = held(KEYS.charge);
    if (this.chargeKeyHeld && !chargeDown) this.chargeReleased = true;
    this.chargeKeyHeld = chargeDown;

    /**
     * The burst is edge-triggered like the spit, and for the same reason: one press is one shockwave, and a held key
     * must not turn into a stream of them. It is read by the game only for a type that HAS the verb, so the devour
     * bubble pressing K gets its spit and nothing else.
     */
    const burstDown = held(KEYS.burst);
    if (burstDown && !this.burstKeyWasDown) this.burstPressed = true;
    this.burstKeyWasDown = burstDown;

    /**
     * The mutation pick's number keys, edge-detected like every other single-shot verb.
     *
     * `0` means "nothing was pressed", so the three legal answers and "no answer" are four values of one
     * number rather than three booleans the game would have to rank. Only read while the pick is open --
     * a 1/2/3 pressed during play is left unconsumed and evaporates on the next frame.
     */
    for (const [index, code] of LEVELUP_KEYS.entries()) {
      if (this.down.has(code) && !this.levelupKeyWasDown[index]) this.levelupChoice = index;
    }
    this.levelupKeyWasDown = LEVELUP_KEYS.map((code) => this.down.has(code));
  }

  private skillKeyWasDown = false;
  private muteKeyWasDown = false;
  private spitKeyWasDown = false;
  private burstKeyWasDown = false;
  /** Which of the three pick keys was down last update, so one press is one pick. */
  private levelupKeyWasDown: boolean[] = [false, false, false];
  /**
   * A mutation card picked by number key since the last consume: 0, 1 or 2, or null for none.
   *
   * Edge-detected in `update` and consumed once, like the skill -- the pick must cost exactly one press
   * however many frames the modal spans.
   */
  private levelupChoice: number | null = null;
  /** Mute toggle pressed since the last consume. */
  private mutePressed = false;

  /** Take the pending mutation pick, if any. */
  consumeLevelUpChoice(): number | null {
    const choice = this.levelupChoice;
    this.levelupChoice = null;
    return choice;
  }

  /** Take the pending mute toggle, if any. Edge-triggered like the skill. */
  consumeMute(): boolean {
    if (!this.mutePressed) return false;
    this.mutePressed = false;
    return true;
  }

  /** Signal a skill press from a touch control. */
  pressSkill(): void {
    this.skillPressed = true;
  }

  /** Signal a spit press from a touch control. */
  pressSpit(): void {
    this.spitPressed = true;
  }

  /**
   * Signal the compress state from a touch control: the on-screen compress button held down.
   *
   * A setter rather than a public field so the touch layer cannot accidentally clear the keyboard's half of the
   * answer -- `compressing` is a property of the player, not of one device.
   */
  setCompressHeld(held: boolean): void {
    this.compressTouchHeld = held;
  }

  /**
   * Take the pending spit press, if any.
   *
   * Consuming rather than reading is what makes one press cost exactly one projectile.
   */
  consumeSpit(): boolean {
    if (!this.spitPressed) return false;
    this.spitPressed = false;
    return true;
  }

  /**
   * Drop every steering input at once.
   *
   * Used by the measurement hook that needs a player who is deliberately NOT steering -- a trash bag's grip is
   * torn off by a struggling player, so a measurement taken while struggling is measuring something else. With
   * the axes as the single source of truth this is one place rather than one per input device.
   */
  clearSteering(): void {
    this.releaseDrag();
    this.axisX = 0;
    this.axisY = 0;
    // The suction field goes too: it is a deliberate input, and a measurement that wanted a passive player would
    // otherwise still have hazards being dragged around.
    this.suctionHeld = false;
    // ...and so does the compression, which is the other deliberate input that changes what a measurement means:
    // a digesting bubble takes double damage and cannot gather, so a probe that left it on would be measuring a
    // bubble in a state it did not ask for.
    this.compressTouchHeld = false;
    this.compressKeyHeld = false;
    // The charge goes with them, and notably WITHOUT raising a release edge: dropping every input is how the game
    // says "forget what the player was doing", and launching a slam out of that would be the opposite.
    this.chargeTouchHeld = false;
    this.chargeKeyHeld = false;
  }

  /**
   * Take the pending skill press, if any.
   *
   * Consuming rather than reading is what makes a single press cost exactly one use. A plain flag
   * checked every frame would spend the entire slot in three frames.
   */
  consumeSkill(): boolean {
    if (!this.skillPressed) return false;
    this.skillPressed = false;
    return true;
  }

  detach(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers = [];
    this.down.clear();
  }
}
