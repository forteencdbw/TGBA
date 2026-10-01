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
  /** Touch: sticky throttle from the on-screen slider, -1..+1. */
  touchThrottle = 0;

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

    // Touch throttle is sticky, so it applies even with no finger down. A keyboard press overrides
    // it for as long as it is held.
    const keyboardY = (held(KEYS.boost) ? 1 : 0) - (held(KEYS.brake) ? 1 : 0);
    this.axisY = keyboardY !== 0 ? keyboardY : this.touchThrottle;
  }

  detach(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers = [];
    this.down.clear();
  }
}
