/**
 * Input. Desktop is the development driver (keyboard); touch is the shipping target.
 *
 * Both produce the same pair of axes, so the physics never learns which device is in use.
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
  /** Mute toggle. `KeyM` is the near-universal convention and costs nothing to honour. */
  mute: ['KeyM'],
} as const;

export class Input {
  private readonly down = new Set<string>();
  private disposers: Array<() => void> = [];

  /** Horizontal axis, -1 (left) .. 1 (right). */
  axisX = 0;
  /** Vertical axis, +1 (up) .. -1 (down). */
  axisY = 0;

  /**
   * The touch wheel's deflection, -1..1 on each axis. Written by `TouchControls` before `update()` runs.
   *
   * An AXIS rather than a target position. The wheel's whole point is that push distance maps to speed, and a
   * target position cannot express "move slowly" -- it only says where to end up.
   */
  wheelX = 0;
  wheelY = 0;
  /** True while a thumb is on the wheel, including inside the dead zone. */
  wheelHeld = false;

  /**
   * Whether any deliberate movement input is present: a key held, or the wheel pushed past its dead zone.
   *
   * Exposed because several systems ask "is the player actively steering" rather than "where are they going" --
   * a trash bag is torn off by a struggling player, and a measurement wants a player who is not struggling.
   * Deriving that from the axis magnitudes rather than from raw pointer state means it stays true for the wheel
   * exactly when it was true for a drag.
   */
  get steering(): boolean {
    return this.axisX !== 0 || this.axisY !== 0;
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
     * Keyboard wins when it is being used, otherwise the wheel does.
     *
     * A SUM would be worse: pressing a key while the thumb rests off-centre would move the bubble faster than
     * either input alone, and the wheel's own deflection is already a full 0..1 range. Taking the one that was
     * actually touched keeps each device's ceiling exactly where it was tuned.
     */
    this.axisX = keyX !== 0 ? keyX : this.wheelX;
    this.axisY = keyY !== 0 ? keyY : this.wheelY;

    // Keyboard is edge-detected here rather than in the event handler, so the key repeat rate and a
    // held key cannot fire the skill more than once.
    const skillDown = held(KEYS.skill);
    if (skillDown && !this.skillKeyWasDown) this.skillPressed = true;
    this.skillKeyWasDown = skillDown;

    const muteDown = held(KEYS.mute);
    if (muteDown && !this.muteKeyWasDown) this.mutePressed = true;
    this.muteKeyWasDown = muteDown;
  }

  private skillKeyWasDown = false;
  private muteKeyWasDown = false;
  /** Mute toggle pressed since the last consume. */
  private mutePressed = false;

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

  /**
   * Drop every steering input at once.
   *
   * Used by the measurement hook that needs a player who is deliberately NOT steering -- a trash bag's grip is
   * torn off by a struggling player, so a measurement taken while struggling is measuring something else. With
   * the axes as the single source of truth this is one place rather than one per input device.
   */
  clearSteering(): void {
    this.wheelX = 0;
    this.wheelY = 0;
    this.wheelHeld = false;
    this.axisX = 0;
    this.axisY = 0;
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
