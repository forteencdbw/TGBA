// Sweep the ascent curve and pick the parameters that make a no-input run last TARGET seconds.
//
// This exists because there is no elementary closed form for the traversal time:
//   T = DEPTH * ∫₀¹ du / (base + (peak - base)·u^exp)
// which only integrates to a logarithm when exp === 1. Deriving peak by hand is how you end up
// shipping a 244-second game while believing it is 175. So: solve it numerically, then re-check
// it in the same commit as `src/config.ts`.
//
// Run: node scripts/solve-ascent.mjs
// Then paste the winning row into the `ascentSpeedPeak` comment in src/config.ts.

const DEPTH = 500;
const TARGET = 175;

const speedAt = (d, base, peak, exp) => {
  const t = 1 - Math.min(Math.max(d, 0), DEPTH) / DEPTH;
  return base + (peak - base) * Math.pow(t, exp);
};

const timeOf = (base, peak, exp, N = 100000) => {
  const h = DEPTH / N;
  let total = 0;
  for (let i = 0; i < N; i++) {
    const d0 = i * h;
    const d1 = (i + 1) * h;
    const dm = (d0 + d1) / 2;
    total += (h / 6) * (1 / speedAt(d0, base, peak, exp) + 4 / speedAt(dm, base, peak, exp) + 1 / speedAt(d1, base, peak, exp));
  }
  return total;
};

/** Bisect for the peak that lands exactly on the target traversal time. */
const solvePeak = (base, exp, target = TARGET) => {
  let lo = base + 0.01;
  let hi = 500;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (timeOf(base, mid, exp) < target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};

/** (base, exponent) shapes worth considering. Chosen for how the speed is distributed, not maths. */
const SHAPES = [
  [1.7, 1.6],
  [1.7, 1.8],
  [1.7, 2.0],
  [1.7, 2.4],
  [2.0, 1.6],
  [2.2, 1.8],
];

const PROBES = [500, 400, 300, 180, 100, 50, 0];

for (const [base, exp] of SHAPES) {
  const peak = solvePeak(base, exp);
  const speeds = PROBES.map((d) => speedAt(d, base, peak, exp).toFixed(2).padStart(5)).join(' ');
  console.log(`base=${base}  exp=${exp}  ->  peak=${peak.toFixed(2)}   T=${timeOf(base, peak, exp).toFixed(2)}s`);
  console.log(`   ${PROBES.map((d) => `${d}m`).join('  ')}`);
  console.log(`   ${speeds}`);
}
