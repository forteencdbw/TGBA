// `.ts` extension so Node's native type stripping can resolve it when scripts/solve-ascent.mjs
// imports this module directly. Vite resolves either form.
import { LEVEL } from './levels.ts';

/**
 * Depth -> ascent speed.
 *
 * Depth is measured from the surface: 0 = surface, DEPTH_TOTAL = seabed.
 * `t` runs 0 at the seabed to 1 at the surface, so with the shipping exponent the early ascent is
 * slow and the final stretch is fast. This is the "slow start, frantic finish" spine of the game.
 *
 * The curve is a property of the LEVEL, not of a global tuning block: a level's length and its
 * curve together ARE its pacing. `override` exists for probes that want to explore curves without
 * editing the level.
 */
export function ascentSpeedAtDepth(
  depth: number,
  override?: { base: number; peak: number; exponent: number; totalDepth?: number },
): number {
  const base = override?.base ?? LEVEL.ascentSpeedBase;
  const peak = override?.peak ?? LEVEL.ascentSpeedPeak;
  const exponent = override?.exponent ?? LEVEL.ascentCurveExponent;
  const total = override?.totalDepth ?? LEVEL.totalDepth;

  const clamped = Math.min(Math.max(depth, 0), total);
  const t = 1 - clamped / total;
  return base + (peak - base) * Math.pow(t, exponent);
}

/**
 * How long a full ascent of the current level takes, in seconds, assuming the player never touches
 * the accelerate or brake control.
 *
 * This is an OUTPUT, not a target. Nothing in the project back-solves the ascent curve from a
 * desired duration; the level declares its length and its speed range, and this reports what that
 * adds up to. Integrated numerically (composite Simpson) so it stays correct for any exponent --
 * there is no elementary closed form once the exponent is not 1, and an approximation would make the
 * HUD's `eta` lie.
 */
export function nominalAscentSeconds(steps = 400): number {
  const h = LEVEL.totalDepth / steps;
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

/**
 * Screen-heights of climb in the current level.
 *
 * The number that actually describes pacing: how many screenfuls of water the player passes through.
 * Two levels with the same value feel the same regardless of their depth in metres, so this is what
 * to match when authoring a new one. See `src/levels.ts`.
 */
export function levelScreenHeights(): number {
  return LEVEL.totalDepth / LEVEL.metresPerScreen;
}

/**
 * Seconds to traverse each screenful of the climb, in order from the seabed up.
 *
 * This is the honest readout, and the single number it replaces was actively misleading: an AVERAGE
 * seconds-per-screen collapses a curve that runs from 13.5s to 3.6s into "7.7s", which describes no
 * part of the actual experience. Pacing is a shape, not a mean.
 */
export function secondsPerScreenSeries(maxScreens = 12): number[] {
  const step = 0.25;
  const perScreen: number[] = [];
  let t = 0;
  let mark = LEVEL.metresPerScreen;
  let screenStart = 0;
  for (let d = LEVEL.totalDepth; d > 0; d -= step) {
    t += step / ascentSpeedAtDepth(d);
    if (LEVEL.totalDepth - d >= mark) {
      perScreen.push(t - screenStart);
      screenStart = t;
      mark += LEVEL.metresPerScreen;
      if (perScreen.length >= maxScreens) return perScreen;
    }
  }
  // The final, partial screenful still counts: it is time the player spends playing.
  if (screenStart < t) perScreen.push(t - screenStart);
  return perScreen;
}
