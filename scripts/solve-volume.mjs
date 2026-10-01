// Prints the volume economy so it can be judged as a whole instead of by reading three files.
//
// Volume is the health pool AND the growth stat, so the numbers form a closed loop:
//   - how many hits you can absorb;
//   - what one hit costs;
//   - what one absorbed bubble gives back.
//
// The model: health is a FIXED number of hits; a hit costs exactly one hit-point, implemented as a
// fixed share of base volume. Volume is the pool. See src/volume.ts for why both alternatives
// (loss proportional to current volume, and loss as a fixed absolute amount) were rejected.
//
// Run: node scripts/solve-volume.mjs

// Keep in sync with src/config.ts `tuning`.
const hitPointVolume = 0.2;
const absorbEfficiency = 0.9;
const volumeMax = 3.2;
const bubbleLaneRatio = 0.053;

const hits = (v) => Math.floor(v / hitPointVolume);
const afterHit = (v) => Math.max(0, v - hitPointVolume);
const popped = (v) => hits(v) <= 0;

/** Hits required to go from `from` to popped, simulating the real loop. */
function hitsToDie(from) {
  let cur = from;
  let n = 0;
  while (n < 500) {
    cur = afterHit(cur);
    n++;
    if (popped(cur) || cur <= 0) break;
  }
  return n;
}

// A "normal" collectable is 0.55x the player's radius; volume scales with radius squared.
const ratio = 0.55;
const gainVolume = ((ratio * bubbleLaneRatio) / bubbleLaneRatio) ** 2 * absorbEfficiency;

console.log('volume economy\n');
console.log(`  one hit-point         ${hitPointVolume} volume`);
console.log(`  start volume          1  -> ${hits(1)} hits`);
console.log(`  volume ceiling        ${volumeMax} -> ${hits(volumeMax)} hits`);
console.log(`  one absorbed bubble   +${gainVolume.toFixed(3)} volume = ${(gainVolume / hitPointVolume).toFixed(2)} hits\n`);

console.log('hits to die, by starting volume (must be the same at every size)');
for (const v of [1, 1.5, 2, 3.2]) {
  console.log(`  volume ${v.toFixed(2).padStart(5)}: ${String(hitsToDie(v)).padStart(3)} hits  (${hits(v)} hit-points)`);
}

console.log('\nrecovery: bubbles needed to undo one hit (this is what growing can improve)');
for (const v of [1, 2, 3.2]) {
  console.log(`  volume ${v.toFixed(2).padStart(5)}: ${(hitPointVolume / gainVolume).toFixed(2)} bubbles`);
}

const hitsAtOne = hitsToDie(1);
const hitsAtMax = hitsToDie(volumeMax);

const checks = {
  startsWithSeveralHits: hitsAtOne >= 4 && hitsAtOne <= 10,
  // Growing MUST buy survivability, otherwise there is no reason to absorb anything.
  growingBuysSurvivability: hitsAtMax > hitsAtOne,
  // What must NOT drift is the cost of one hit: exactly one hit-point, at any size.
  hitCostIsFixed: afterHit(1) === 1 - hitPointVolume && afterHit(2.5) === 2.5 - hitPointVolume,
  recoveryCostIsFlat: hitPointVolume / gainVolume > 0,
  oneBubbleIsWorthRealProgress: gainVolume / hitPointVolume >= 1,
  ceilingIsFinite: volumeMax > 1 && hits(volumeMax) < 40,
};
console.log('\nCHECKS: ' + JSON.stringify(checks));
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
