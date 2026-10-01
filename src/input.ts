/**
 * Input. Desktop is the development driver (keyboard); touch is the shipping target.
 *
 * Keyboard and touch are merged here rather than in the player, so the physics sees one pair of
 * axes regardless of device. Touch wins when it is active, because a player holding a finger on
 * the glass clearly means it.
 */

const KEYS = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  boost: ['Space', 'ShiftLeft', 'ShiftRight'],
  brake: ['KeyS', 'ArrowDown'],
  /**
   * The active skill.
   *
   * `KeyJ` sits under the right hand, next to the arrow keys and Space, so a reflex press does not
   * require the left hand to leave WASD. Enter is also accepted because it is what a player tries
   * first when a game has one obvious button.
   */
  skill: ['KeyJ', 'Enter'],
  /** Mute toggle. `KeyM` is the near-universal convention and costs nothing to honour. */
  mute: ['KeyM'],
} as const;

export class Input {
  private readonly down = new Set<string>();
  private disposers: Array<() => void> = [];

  /** Horizontal input axis, -1 (left) .. 1 (right). Keyboard only. */
  axisX = 0;
  /** Ascend/descend intent: +1 boost, -1 brake, 0 coast. */
  axisY = 0;

  /**
   * Touch: the lane fraction the bubble should ease toward while a finger is down.
   * `null` means nobody is dragging, so the keyboard owns the axis.
   */
  dragTargetX: number | null = null;
  /**
   * Touch: whether the on-screen accelerate button is held.
   *
   * A BUTTON, not a slider value. The ascent now accelerates toward its target, so holding is the
   * natural expression and there is nothing to leave "set" between touches. A sticky slider made
   * sense when the change was instantaneous; with a ramp it would just be a second accelerator.
   */
  touchBoosting = false;
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

    this.axisX = (held(KEYS.right) ? 1 : 0) - (held(KEYS.left) ? 1 : 0);

    const keyboardY = (held(KEYS.boost) ? 1 : 0) - (held(KEYS.brake) ? 1 : 0);
    // The on-screen button only ever boosts, so it contributes on the positive side. A keyboard
    // press takes precedence because it can also brake.
    this.axisY = keyboardY !== 0 ? keyboardY : this.touchBoosting ? 1 : 0;

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
