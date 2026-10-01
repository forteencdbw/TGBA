// Reports the pace and duration that the SHIPPING LEVEL's ascent curve produces.
//
// This used to be a back-solver: sweep (base, exponent), bisect for the peak that makes a no-input
// run last exactly TARGET seconds, and paste the winner into config. That inverted the dependency,
// and it is why the game spent a while with a first 40% of climb that barely changed speed -- the
// curve was whatever hit the duration, rather than being chosen for how it feels.
//
// Now a level declares its length and its speed range, and this script answers "what does that give
// me?" It still exists because there is no elementary closed form for the traversal time once the
// exponent is not 1:
//
//   T = DEPTH * integral of du / (base + (peak - base) * u^exponent)
//
// which only integrates to a logarithm when exponent === 1. So report it numerically rather than by
// hand, and cross-check against the running game via `diagnostics.nominalSeconds`.
//
// Run: node scripts/solve-ascent.mjs
//
// It imports the real level and the real integration, so it cannot drift from what ships.

import { LEVEL } from '../src/levels.ts';
import { ascentSpeedAtDepth, levelScreenHeights, nominalAscentSeconds, secondsPerScreen } from '../src/depth.ts';

const DEPTH = LEVEL.totalDepth;
const { ascentSpeedBase: base, ascentSpeedPeak: peak, ascentCurveExponent: exp } = LEVEL;

const timeOf = (N = 100000) => {
  const h = DEPTH / N;
  let total = 0;
  for (let i = 0; i < N; i++) {
    const d0 = i * h;
    const d1 = (i + 1) * h;
    const dm = (d0 + d1) / 2;
    total += (h / 6) * (1 / speedAt(d0) + 4 / speedAt(dm) + 1 / speedAt(d1));
  }
  return total;
};
const speedAt = (d) => ascentSpeedAtDepth(d, { base, peak, exponent: exp, totalDepth: DEPTH });

const T = timeOf();
const screenHeights = levelScreenHeights();

console.log(`level "${LEVEL.id}" (${LEVEL.name})`);
console.log(`  length            ${DEPTH} m`);
console.log(`  metres per screen ${LEVEL.metresPerScreen} m`);
console.log(`  screen-heights    ${screenHeights.toFixed(2)}`);
console.log(`  ascent            ${base} -> ${peak} m/s, exponent ${exp}`);
console.log('');
console.log(`  no-input run      ${T.toFixed(2)}s   (game reports ${nominalAscentSeconds().toFixed(2)}s)`);
console.log(`  seconds/screenful ${secondsPerScreen().toFixed(1)}s   <- the number that describes how fast it LOOKS`);
console.log('');

const PROBES = [500, 400, 300, 200, 100, 50, 0];
console.log('  depth  ascent m/s  visible px/s (390px phone)');
const scale = 390 / (LEVEL.metresPerScreen * 1.9);
for (const d of PROBES) {
  if (d > DEPTH) continue;
  const s = speedAt(d);
  console.log(`  ${String(d).padStart(4)}m  ${s.toFixed(2).padStart(9)}  ${(s * scale).toFixed(1).padStart(12)}`);
}

// exp === 1 has a closed form; use it to prove the numerical integration is not quietly wrong.
if (Math.abs(exp - 1) < 1e-9) {
  const closed = (DEPTH / (peak - base)) * Math.log(peak / base);
  const err = Math.abs(closed - T) / closed;
  console.log('');
  console.log(`  closed form check ${closed.toFixed(4)}s vs numeric ${T.toFixed(4)}s  (error ${(err * 100).toFixed(4)}%)`);
  if (err > 1e-4) {
    console.error('  MISMATCH: the numerical integration disagrees with the closed form');
    process.exit(1);
  }
}
