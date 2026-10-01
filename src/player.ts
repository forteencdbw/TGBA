import { SPAWN_X_RATIO, tuning } from './config';
import { DEPTH_TOTAL } from './levels';
import { ascentSpeedAtDepth } from './depth';
import type { LateralAuthority } from './lateral';
import type { Input } from './input';

/**
 * The bubble.
 *
 * Vertical position is owned by the game (the bubble is always rising); the player only shapes
 * *how fast* it rises. Horizontal position is fully player-driven and is where all the skill lives.
 *
 * `x` is a FRACTION of the play area width, not metres, and `vx` is in lane-widths per second.
 * The play area is as wide as the display needs, so metre-based position and speed would mean
 * different handling on every screen. Fractions keep the feel identical everywhere and make the
 * lane bounds a constant 0..1. Convert with `Camera.toScreenX` when drawing.
 */
export class Player {
  /** Metres above the seabed. */
  y = 0;
  /** Horizontal position as a fraction of the play area width, 0..1. */
  x = SPAWN_X_RATIO;

  /** Horizontal speed in play-area widths per second. */
  vx = 0;
  /** Vertical velocity, m/s. Always >= 0: the bubble never sinks. */
  vy = 0;

  /** Bubble volume, 0..1. Becomes HP on D2; present from D1 so the physics can be felt early. */
  volume = 1;

  /**
   * Current ascent speed multiplier, eased toward the input target.
   *
   * Carried across frames so acceleration has a state; starts at 1 (cruising).
   */
  speedMultiplier = 1;

  /**
   * Instrumentation, read by `scripts/smoke.mjs`. Needed because a frozen bubble is
   * indistinguishable by eye from broken input: these prove `update` ran, and with what dt.
   */
  debugUpdates = 0;
  debugLastDt: number = 0;

  readonly tuning = tuning;

  reset(): void {
    this.y = 0;
    this.x = SPAWN_X_RATIO;
    this.vx = 0;
    this.vy = 0;
    this.volume = 1;
    this.speedMultiplier = 1;
  }

  get depth(): number {
    return DEPTH_TOTAL - this.y;
  }

  /** Metres left to the surface. */
  get remaining(): number {
    return this.y;
  }

  /** Transient state for the HUD and probes. */
  debugSteerMultiplier = 1;

  /** @param lateral calibrated control authority for the current play-area width. */
  update(input: Input, dt: number, lateral: LateralAuthority): void {
    const t = tuning;
    this.debugUpdates++;
    this.debugLastDt = dt;

    // --- Vertical ---------------------------------------------------------
    // Ease toward the target multiplier instead of snapping to it. A hard jump made the accelerate
    // control a binary teleport; easing it makes the ascent something the bubble ACCELERATES INTO,
    // which is also what lets the world's apparent speed ramp rather than jump.
    const baseSpeed = ascentSpeedAtDepth(this.depth);
    const targetMultiplier = input.axisY > 0 ? t.boostMultiplier : input.axisY < 0 ? t.brakeMultiplier : 1;

    // Exponential approach with a TIME constant, not a constant acceleration: the ascent speed
    // varies with depth, so a fixed m/s^2 would take a different time to reach the ceiling at every
    // depth. `boostAccelSeconds` is the time to cover ~63% of the change.
    if (t.boostAccelSeconds <= 0) {
      this.speedMultiplier = targetMultiplier;
    } else {
      const alpha = Math.min(1, dt / t.boostAccelSeconds);
      this.speedMultiplier += (targetMultiplier - this.speedMultiplier) * alpha;
    }

    this.vy = baseSpeed * this.speedMultiplier;
    this.y = Math.min(this.y + this.vy * dt, DEPTH_TOTAL);

    // --- Horizontal -------------------------------------------------------
    if (input.dragTargetX !== null) {
      // Touch steering: ease directly toward where the finger is. Uses the same time constant as
      // the velocity model, so a dragged bubble and a keyboard-driven one feel like one object.
      // Speed is therefore proportional to how far you drag, which is easier to control on glass
      // than a constant-acceleration axis.
      const alpha = Math.min(1, lateral.damping * dt);
      this.x += (input.dragTargetX - this.x) * alpha;
      this.vx = 0;
      this.debugSteerMultiplier = 1;
    } else {
      // Keyboard steering: a CONSTANT speed while a key is held, then a decay to rest.
      //
      // No acceleration ramp. A binary axis through an acceleration model saturates almost
      // immediately and overshoots, which reads as twitchy no matter how the ramp is scaled -- and
      // scaling the ramp is what an earlier attempt got wrong, ending up at 8 lane-widths per
      // second even at 5% of the calibrated acceleration.
      //
      // Boosting still slows steering, because the speed is scaled by the boost factor rather than
      // the thrust. The drag on release is kept, so letting go coasts briefly instead of stopping
      // dead, which matches how the rest of the movement behaves.
      const boostScale = input.axisY > 0 ? lateral.boostSteerFactor : 1;
      const target = input.axisX * lateral.keyboardSpeed * boostScale;

      if (input.axisX === 0) {
        this.vx -= this.vx * Math.min(lateral.damping * dt, 1);
        if (Math.abs(this.vx) < lateral.stopSpeed) this.vx = 0;
      } else {
        this.vx = target;
      }

      // Keep the velocity sane even if the tuning is changed at runtime from the console.
      const cap = lateral.speedCap;
      if (this.vx > cap) this.vx = cap;
      else if (this.vx < -cap) this.vx = -cap;

      this.debugSteerMultiplier = boostScale;
      this.x += this.vx * dt;
    }

    // Keep the bubble inside the play area.
    const margin = 0.006;
    this.x = Math.min(Math.max(this.x, margin), 1 - margin);
  }
}
