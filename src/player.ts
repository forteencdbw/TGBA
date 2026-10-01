import { DEPTH_TOTAL, SPAWN_X_RATIO, tuning } from './config';
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
    const baseSpeed = ascentSpeedAtDepth(this.depth);
    let speedMultiplier = 1;
    if (input.axisY > 0) speedMultiplier = t.boostMultiplier;
    else if (input.axisY < 0) speedMultiplier = t.brakeMultiplier;
    this.vy = baseSpeed * speedMultiplier;
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
      // Keyboard steering: thrust and drag, with reduced authority while boosting. Only the THRUST
      // is scaled, not the drag, so holding accelerate really is sluggish to steer while releasing
      // it still coasts on the speed already built up.
      const steerMultiplier = input.axisY > 0 ? lateral.boostSteerFactor : 1;
      this.debugSteerMultiplier = steerMultiplier;
      this.vx += input.axisX * lateral.accel * steerMultiplier * dt;

      this.vx -= this.vx * Math.min(lateral.damping * dt, 1);

      // Speed cap: a safety net. The asymptotic top speed is what is normally reached.
      const cap = lateral.speedCap;
      if (this.vx > cap) this.vx = cap;
      else if (this.vx < -cap) this.vx = -cap;

      // Come fully to rest instead of asymptotically creeping -- but only when the player has let
      // go, and only well below the per-frame thrust increment. See lateral.ts.
      if (input.axisX === 0 && Math.abs(this.vx) < lateral.stopSpeed) this.vx = 0;

      this.x += this.vx * dt;
    }

    // Keep the bubble inside the play area.
    const margin = 0.006;
    this.x = Math.min(Math.max(this.x, margin), 1 - margin);
  }
}
