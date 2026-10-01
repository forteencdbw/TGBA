import { DEPTH_TOTAL, tuning } from './config';

/**
 * Depth -> ascent speed.
 *
 * Depth is measured from the surface: 0 = surface, DEPTH_TOTAL = seabed.
 * `t` runs 0 at the seabed to 1 at the surface, so early ascent is slow and the final stretch
 * is fast. This is the "slow start, frantic finish" spine of the whole game.
 */
export function ascentSpeedAtDepth(depth: number, override?: { base: number; peak: number; exponent: number }): number {
  const base = override?.base ?? tuning.ascentSpeedBase;
  const peak = override?.peak ?? tuning.ascentSpeedPeak;
  const exponent = override?.exponent ?? tuning.ascentCurveExponent;

  const clamped = Math.min(Math.max(depth, 0), DEPTH_TOTAL);
  const t = 1 - clamped / DEPTH_TOTAL;
  return base + (peak - base) * Math.pow(t, exponent);
}

/**
 * How long a full 0 -> DEPTH_TOTAL ascent takes with the current tuning, in seconds,
 * assuming the player never touches the accelerate or brake control.
 *
 * Integrated numerically (Simpson's rule) because the curve has a live-tunable exponent and an
 * approximate answer would defeat the point of a progress readout.
 */
export function nominalAscentSeconds(steps = 400): number {
  const h = DEPTH_TOTAL / steps;
  let total = 0;

  for (let i = 0; i < steps; i++) {
    const d0 = i * h;
    const d1 = (i + 1) * h;
    const dMid = (d0 + d1) / 2;
    const f = (d: number) => 1 / ascentSpeedAtDepth(d);
    // Composite Simpson over one panel.
    total += (h / 6) * (f(d0) + 4 * f(dMid) + f(d1));
  }

  return total;
}
