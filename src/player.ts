import { SPAWN_X_RATIO, tuning } from './config';
import { DEPTH_TOTAL } from './levels';
import type { LateralAuthority } from './lateral';
import type { Input } from './input';

/**
 * The bubble.
 *
 * Moves FREELY in the plane: four directions, and holding nothing means hovering. There is no ascent
 * curve and no boost -- those existed to shape a forced climb, and with the player in control of both
 * axes they would only be second ways to do what the direction keys already do.
 *
 * `x` is a FRACTION of the play area width, not metres, and `vx` is in lane-widths per second. The play
 * area is as wide as the display needs, so metre-based position and speed would mean different handling
 * on every screen. Fractions keep the feel identical everywhere and make the lane bounds a constant
 * 0..1. `y` stays in world metres because the vertical axis is the level's own length, which is the same
 * on every display. Convert with `Camera.toScreenX/Y` when drawing.
 */
export class Player {
  /** Metres above the seabed. */
  y = 0;
  /** Horizontal position as a fraction of the play area width, 0..1. */
  x = SPAWN_X_RATIO;

  /** Horizontal speed in play-area widths per second. */
  vx = 0;
  /** Vertical speed in metres per second. Positive is up. */
  vy = 0;

  /** Bubble volume. Becomes HP; the volume economy is unchanged by free movement. */
  volume = 1;

  /**
   * Instrumentation, read by `scripts/smoke.mjs`. Needed because a frozen bubble is
   * indistinguishable by eye from broken input: these prove `update` ran, and with what dt.
   */
  debugUpdates = 0;
  debugLastDt: number = 0;
  /** The steering authority actually applied last frame, for probes. */
  debugSteerMultiplier = 1;

  readonly tuning = tuning;

  reset(): void {
    this.y = 0;
    this.x = SPAWN_X_RATIO;
    this.vx = 0;
    this.vy = 0;
    this.volume = 1;
    this.slowRemaining = 0;
    this.slowFactor = 1;
    this.impulseVy = 0;
    this.impulseVx = 0;
    this.ascentBonus = 1;
    this.steerScale = 1;
    this.shrinkResistance = 0;
    this.skillRemaining = 0;
    this.skillId = null;
    this.skillAscentBonus = 1;
  }

  /** Metres still to climb. */
  get remaining(): number {
    return this.y;
  }

  /** Metres below the surface, which is what the HUD shows. */
  get depth(): number {
    return DEPTH_TOTAL - this.y;
  }

  /**
   * Hazard and talent state.
   *
   * `slowFactor` multiplies BOTH axes now. A slow that only affected the ascent would be meaningless
   * with the player in control of the vertical.
   */
  slowRemaining = 0;
  slowFactor = 1;
  get slowMultiplier(): number {
    return this.slowRemaining > 0 ? this.slowFactor : 1;
  }

  /** A launch impulse from a crab, decaying on its own, in m/s on each axis. */
  impulseVy = 0;
  impulseVx = 0;

  /** Talents and skills, as plain multipliers. */
  ascentBonus = 1;
  steerScale = 1;
  /** Fraction of a hit's shrink ignored, 0..1. Set by the silt talent. */
  shrinkResistance = 0;

  /** Seconds left of an active skill effect, and which one. */
  skillRemaining = 0;
  skillId: string | null = null;
  /** Speed multiplier granted by the active skill. */
  skillAscentBonus = 1;

  /** Apply a slow, taking the stronger of the two if one is already running. */
  applySlow(seconds: number, factor: number): void {
    if (seconds <= 0) return;
    this.slowRemaining = Math.max(this.slowRemaining, seconds);
    // A weaker slow must not overwrite a stronger one that is still ticking.
    this.slowFactor = this.slowRemaining > 0 ? Math.min(this.slowFactor === 1 ? factor : this.slowFactor, factor) : factor;
  }

  /**
   * @param lateral calibrated control authority for the current play-area width
   * @param dt seconds
   *
   * Movement is a CONSTANT speed in the input direction, with no acceleration ramp. An acceleration
   * model on a binary axis saturates almost immediately and overshoots, which reads as twitchy however
   * the ramp is scaled -- the same conclusion the horizontal axis reached earlier, now applied to both.
   */
  update(input: Input, dt: number, lateral: LateralAuthority): void {
    this.debugUpdates++;
    this.debugLastDt = dt;

    if (this.slowRemaining > 0) {
      this.slowRemaining = Math.max(0, this.slowRemaining - dt);
      if (this.slowRemaining === 0) this.slowFactor = 1;
    }
    if (this.impulseVy !== 0 || this.impulseVx !== 0) {
      const decay = Math.exp(-dt / tuning.hazardLaunchDecaySeconds);
      this.impulseVy *= decay;
      this.impulseVx *= decay;
      if (Math.abs(this.impulseVy) < 0.05) this.impulseVy = 0;
      if (Math.abs(this.impulseVx) < 0.005) this.impulseVx = 0;
    }
    if (this.skillRemaining > 0) {
      this.skillRemaining = Math.max(0, this.skillRemaining - dt);
      if (this.skillRemaining === 0) {
        this.skillId = null;
        this.skillAscentBonus = 1;
      }
    }

    // --- Horizontal and vertical ------------------------------------------
    // Touch eases toward where the finger is, on BOTH axes. On glass, dragging something directly is
    // more legible than steering it with a virtual stick, and a stick would need a second control to
    // express "go there at once". Keyboard drives a constant speed on each axis.
    const steer = Math.max(0, this.steerScale);
    this.debugSteerMultiplier = steer;

    if (input.dragTargetX !== null) {
      const alpha = Math.min(1, lateral.damping * steer * dt);
      this.x += (input.dragTargetX - this.x) * alpha;
      this.vx = 0;
      if (input.dragTargetY !== null) {
        // The same ease on the vertical, so the two axes respond identically.
        this.y += (input.dragTargetY - this.y) * alpha;
      }
      this.vy = 0;
    } else {
      const targetX = input.axisX * lateral.keyboardSpeed * steer;
      if (input.axisX === 0) {
        this.vx -= this.vx * Math.min(lateral.damping * dt, 1);
        if (Math.abs(this.vx) < lateral.stopSpeed) this.vx = 0;
      } else {
        this.vx = targetX;
      }
      this.x += this.vx * dt;

      // The lateral calibration is in LANE FRACTIONS per second, so it is converted through the lane
      // width to get metres: both axes then move at the same rate and a diagonal is not faster than a
      // straight line.
      const verticalSpeed = lateral.keyboardSpeed * lateral.laneWidth * tuning.verticalSpeedScale;
      this.vy = input.axisY * verticalSpeed * this.slowMultiplier;
      this.y += this.vy * dt;
    }

    // A launch impulse is added on top of whichever input is driving, so being shoved does not cancel
    // the player's own control of the other axis.
    this.y += this.impulseVy * dt;
    this.x += this.impulseVx * dt;

    // Keep the bubble inside the play area. The ceiling is the camera's, enforced by the game.
    const margin = 0.006;
    this.x = Math.min(Math.max(this.x, margin), 1 - margin);
    this.y = Math.max(0, this.y);
  }
}
