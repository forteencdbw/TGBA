import { SPAWN_X_RATIO, tuning } from './config';
import { DEPTH_TOTAL } from './levels';
import type { LateralAuthority } from './lateral';
import type { Input } from './input';

/**
 * The bubble.
 *
 * Moves freely WITHIN THE SCREEN. It does not climb the level: the camera scrolls on its own, at a rate
 * the level sets, and the player's job is to move around inside the window that scroll presents.
 *
 * That is why position is stored as SCREEN-space fractions rather than world metres. An earlier version
 * put the player in world space and let the camera follow them, which made "press up" also advance the
 * level -- the two are independent, and storing screen position is what makes that structural rather
 * than a rule someone has to remember.
 *
 *   x        fraction across the play area, 0..1
 *   screenY  fraction up the visible window, 0 at the bottom edge and 1 at the top
 *
 * `y` is DERIVED: the world position the player currently occupies, which is what hazards and
 * collectables are compared against. See `syncToCamera`.
 */
export class Player {
  /**
   * Vertical position as a fraction of the VISIBLE WINDOW, 0 at the bottom edge and 1 at the top.
   *
   * Clamped to `SCREEN_Y_MIN..SCREEN_Y_MAX` rather than to the window edges, so the bubble cannot be
   * pushed half off the screen where it would be impossible to see or steer.
   */
  screenY = 0.5;
  /** Horizontal position as a fraction of the play area width, 0..1. */
  x = SPAWN_X_RATIO;

  /**
   * World position in metres, derived every frame from the camera and `screenY`.
   *
   * A field rather than a getter: it is read many times per frame, including by the hazard simulation,
   * and recomputing it would require every reader to know the camera.
   */
  y = 0;

  /** Horizontal speed in play-area widths per second. */
  vx = 0;
  /** Vertical speed in screen fractions per second. Positive is up. */
  vy = 0;

  /** Bubble volume. Becomes HP; the volume economy is unchanged by free movement. */
  volume = 1;

  /**
   * Instrumentation, read by probes. Needed because a frozen bubble is
   * indistinguishable by eye from broken input: these prove `update` ran, and with what dt.
   */
  debugUpdates = 0;
  debugLastDt: number = 0;
  /** The steering authority actually applied last frame, for probes. */
  debugSteerMultiplier = 1;

  readonly tuning = tuning;

  /**
   * How far up and down the bubble may be positioned, as fractions of the visible window.
   *
   * The bottom band stays clear for the skill button and the top for the depth readout, and neither
   * extreme lets the bubble sit against a letterboxed edge where it would look clipped.
   */
  static readonly SCREEN_Y_MIN = 0.12;
  static readonly SCREEN_Y_MAX = 0.94;

  reset(): void {
    this.screenY = 0.5;
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

  /**
   * Metres still to climb, i.e. distance left to the surface.
   *
   * The LEVEL's remaining length, not the player's: progress belongs to the scroll, and a player who
   * could add to it by holding up is the bug this model exists to prevent.
   */
  get remaining(): number {
    return Math.max(0, DEPTH_TOTAL - this.y);
  }

  /** How far above the camera's centre the bubble sits, in world metres. */
  screenOffsetMetres(visibleDepthMeters: number): number {
    return (this.screenY - 0.5) * visibleDepthMeters;
  }

  /** The world position the bubble would occupy at a given camera position. */
  worldYFor(cameraY: number, visibleDepthMeters: number): number {
    return cameraY + this.screenOffsetMetres(visibleDepthMeters);
  }

  /**
   * Derive the world position from the camera and the current `screenY`.
   *
   * Called BOTH before and after `update`: before, so the camera's scroll is reflected in the world
   * position the hazards are tested against; after, so the movement `update` just applied is converted
   * into world space.
   */
  syncToCamera(cameraY: number, visibleDepthMeters: number): void {
    this.y = this.worldYFor(cameraY, visibleDepthMeters);
  }

  /**
   * Pull `screenY` back into its legal band, and re-derive `y`.
   *
   * SEPARATE from `syncToCamera` on purpose, and the separation is a bug fix. Folding it in made
   * `syncToCamera` non-idempotent: it re-read `screenY` from `y`, so calling it at the end of a frame --
   * which the game does, to convert movement into world space -- undid that frame's movement entirely. The
   * bubble simply refused to move on screen.
   *
   * This runs only after everything that can displace the bubble, which is where the clamp belongs: a
   * launch impulse is applied on top of the player's own input, so it can push past the band without the
   * input ever being illegal.
   */
  clampToScreen(cameraY: number, visibleDepthMeters: number): void {
    if (visibleDepthMeters <= 0) return;
    const fromY = (this.y - cameraY) / visibleDepthMeters + 0.5;
    this.screenY = Math.min(Math.max(fromY, Player.SCREEN_Y_MIN), Player.SCREEN_Y_MAX);
    this.y = this.worldYFor(cameraY, visibleDepthMeters);
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

  /**
   * A launch impulse from a crab, decaying on its own.
   *
   * `impulseVy` is in SCREEN FRACTIONS per second and `impulseVx` in lane widths per second, because
   * both are shoves within the screen the player moves in. They were m/s when the player lived in world
   * space; keeping the old unit would have launched them through the whole level in a frame.
   */
  impulseVy = 0;
  impulseVx = 0;

  /** Talents and skills, as plain multipliers. */
  ascentBonus = 1;
  steerScale = 1;
  /** Fraction of a hit's shrink ignored, 0..1. Set by the silt talent. */
  shrinkResistance = 0;

  /**
   * Movement multiplier from the current growth stage, 0..1.
   *
   * Set by the game from `src/stages.ts`, and applied to BOTH axes and to TOUCH as well as the keyboard. That
   * last part is deliberate: applying it only to keyboard speed would make the stage system invisible to anyone
   * playing on a phone, which is the shipping target -- and "bigger is slower" is the entire tension of the
   * design, so it has to be felt on the device that matters.
   */
  stageSpeedMultiplier = 1;

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
   *
   * Both axes move within the SCREEN. Neither touches the level's scroll, which the game advances
   * independently -- that separation is the whole point of this model.
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
      if (Math.abs(this.impulseVy) < 1e-4) this.impulseVy = 0;
      if (Math.abs(this.impulseVx) < 0.005) this.impulseVx = 0;
    }
    if (this.skillRemaining > 0) {
      this.skillRemaining = Math.max(0, this.skillRemaining - dt);
      if (this.skillRemaining === 0) {
        this.skillId = null;
        this.skillAscentBonus = 1;
      }
    }

    /**
     * One multiplier for everything that follows, folding in the growth stage.
     *
     * The stage applies to the KEYBOARD speed and to the TOUCH easing, because the design's tension -- bigger
     * means slower -- has to be felt on the device the game ships to, and that device steers by dragging.
     */
    const steer = Math.max(0, this.steerScale) * Math.max(0, this.stageSpeedMultiplier);
    this.debugSteerMultiplier = steer;

    if (input.dragTargetX !== null) {
      // Touch eases toward where the finger is, on BOTH axes. On glass, dragging something directly is
      // more legible than steering it with a virtual stick, and a stick would need a second control to
      // express "go there at once". Both targets are SCREEN positions, which is what a finger reports.
      const alpha = Math.min(1, lateral.damping * steer * dt);
      this.x += (input.dragTargetX - this.x) * alpha;
      if (input.dragTargetY !== null) {
        this.screenY += (input.dragTargetY - this.screenY) * alpha;
      }
      this.vx = 0;
      this.vy = 0;
    } else {
      if (input.axisX === 0) {
        this.vx -= this.vx * Math.min(lateral.damping * dt, 1);
        if (Math.abs(this.vx) < lateral.stopSpeed) this.vx = 0;
      } else {
        this.vx = input.axisX * lateral.keyboardSpeed * steer;
      }
      this.x += this.vx * dt;

      // The vertical is in SCREEN FRACTIONS per second, derived from the same crossing-time calibration
      // the horizontal uses so the two axes feel identical. `verticalSpeedScale` converts between a
      // window height and a lane width, which are different lengths in metres but should take the same
      // time to cross.
      const verticalSpeed = lateral.keyboardSpeed * tuning.verticalSpeedScale * steer;
      this.vy = input.axisY * verticalSpeed * this.slowMultiplier;
      this.screenY += this.vy * dt;
    }

    // A launch impulse is added on top of whichever input is driving, so being shoved does not cancel
    // the player's own control of the other axis.
    this.screenY += this.impulseVy * dt;
    this.x += this.impulseVx * dt;

    // Keep the bubble inside the play area. The bounds are the SCREEN's, since that is the space the
    // player moves in.
    const margin = 0.006;
    this.x = Math.min(Math.max(this.x, margin), 1 - margin);
    this.screenY = Math.min(Math.max(this.screenY, Player.SCREEN_Y_MIN), Player.SCREEN_Y_MAX);
  }
}
