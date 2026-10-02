import {
  COLUMN_CROSSING_SECONDS,
  BOOST_CROSSING_SECONDS,
  KEYBOARD_CROSSING_SECONDS,
  LATERAL_DAMPING,
  SIM_DT,
} from './config';

/**
 * Lateral (horizontal) control authority, calibrated to the actual play-area width.
 *
 * The point of this module is that FEEL should not depend on the screen. A phone, a tablet and a
 * desktop window have different aspect ratios, so once the play area fills the screen the lane is
 * a different number of metres wide on each. Expressing the controls as "how long does it take to
 * cross the lane" keeps them identical everywhere, at the cost of a few numbers that vary.
 *
 * Why the acceleration is solved rather than derived:
 *
 *     vx += accel * dt;  vx -= vx * damping * dt
 *
 * speed approaches its steady state asymptotically, so `accel / damping` is NOT the speed reached
 * from a standstill. Using that closed form made a lane crossing measurably slower than intended
 * (1.8s target measured as 2.11s). So the acceleration is bisected against a simulation of this
 * exact loop until the measured crossing time matches the target, once per lane width.
 */
export interface LateralAuthority {
  /** Horizontal acceleration under input, in lane-widths per second squared. */
  accel: number;
  /** Speed cap in lane-widths per second: a safety net, above the asymptote actually reached. */
  speedCap: number;
  /** Passive drag toward zero velocity, per second. */
  damping: number;
  /** How much lateral thrust survives while boosting (drag is never scaled). */
  boostSteerFactor: number;
  /** Velocity below which a released control snaps to a full stop, in lane-widths per second. */
  stopSpeed: number;
  /** Seconds to cross the lane from a standstill at cruising speed. */
  crossingSeconds: number;
  /** Seconds to cross the lane from a standstill while holding accelerate. */
  boostCrossingSeconds: number;
  /** Speed actually reached while cruising, from the simulation. */
  cruiseTopSpeed: number;
  /**
   * Keyboard steering speed, in lane-widths per second, applied as a CONSTANT velocity.
   *
   * The keyboard does not use `accel` at all. A binary key axis through an acceleration ramp
   * saturates almost instantly and overshoots, which reads as twitchy however the ramp is scaled.
   * A constant speed is directly predictable: hold the key, move at exactly this rate.
   */
  keyboardSpeed: number;
  /** The lane's width in metres, so a caller can convert these lane-relative speeds for the OTHER axis. */
  laneWidth: number;
}

/** Simulate the real update loop; returns seconds to travel `laneWidth` from a standstill. */
function crossingSeconds(accel: number, steerFactor: number, laneWidth: number, speedCap: number): number {
  let vx = 0;
  let x = 0;
  let t = 0;
  while (x < laneWidth && t < 600) {
    vx += accel * steerFactor * SIM_DT;
    vx -= vx * Math.min(LATERAL_DAMPING * SIM_DT, 1);
    if (vx > speedCap) vx = speedCap;
    x += vx * SIM_DT;
    t += SIM_DT;
  }
  return t;
}

/** Peak speed after `seconds` of held input, used to place the safety cap. */
function topSpeed(accel: number, steerFactor: number, seconds: number): number {
  let vx = 0;
  let t = 0;
  while (t < seconds) {
    vx += accel * steerFactor * SIM_DT;
    vx -= vx * Math.min(LATERAL_DAMPING * SIM_DT, 1);
    t += SIM_DT;
  }
  return vx;
}

/** Bisect `lo..hi` for the value where `measure` crosses `target`. */
function bisect(measure: (value: number) => number, target: number, lo: number, hi: number): number {
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    if (measure(mid) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const cache = new Map<number, LateralAuthority>();

/**
 * Calibrate the controls for a play area `laneWidth` metres wide. Cached, because it runs a few
 * hundred short simulations and the result only depends on the width.
 */
export function calibrateLateral(laneWidth: number): LateralAuthority {
  const cached = cache.get(laneWidth);
  if (cached) return cached;

  // Solve acceleration so the cruising crossing hits its target.
  const accel = bisect((a) => crossingSeconds(a, 1, laneWidth, Infinity), COLUMN_CROSSING_SECONDS, 1, 1e6);

  // Safety cap: 8% above the speed actually reached, so it never interferes with normal play.
  const speedCap = Math.ceil(topSpeed(accel, 1, 6) * 1.08);

  // Solve the boost penalty so the boosting crossing ALSO hits its own target, rather than
  // accepting whatever ratio falls out.
  const boostSteerFactor = +bisect(
    (f) => crossingSeconds(accel, f, laneWidth, speedCap),
    BOOST_CROSSING_SECONDS,
    0.01,
    1,
  ).toFixed(4);

  // Must stay far below the per-frame thrust increment or the stop-snap fires every frame and the
  // bubble never moves. Expressed relative to that increment so it stays safe at any lane width.
  const stopSpeed = (accel / (1 / SIM_DT)) / 4;

  const result: LateralAuthority = {
    accel,
    speedCap,
    damping: LATERAL_DAMPING,
    boostSteerFactor,
    stopSpeed,
    crossingSeconds: COLUMN_CROSSING_SECONDS,
    boostCrossingSeconds: BOOST_CROSSING_SECONDS,
    cruiseTopSpeed: topSpeed(accel, 1, 6),
    // A crossing time IS a speed when there is no ramp: one lane width in KEYBOARD_CROSSING_SECONDS.
    keyboardSpeed: 1 / KEYBOARD_CROSSING_SECONDS,
    laneWidth,
  };

  cache.set(laneWidth, result);
  return result;
}
