// Consistency check for the lateral calibration in src/lateral.ts.
//
// The runtime calibration lives in that module (it depends on the display's aspect ratio, so it
// cannot be a build-time constant). This script imports the same maths and prints what the game
// will resolve to for a given play-area width, so the numbers can be sanity-checked without a
// browser -- and failing numbers can be caught before they reach a device.
//
// Run: node scripts/solve-lateral.mjs [laneWidthMeters]

import { calibrateLateral } from '../src/lateral.ts';

const laneWidth = Number(process.argv[2] ?? 361); // matches WORLD_WIDTH in src/config.ts

const a = calibrateLateral(laneWidth);

console.log(`lateral authority for a lane ${laneWidth} m wide\n`);
console.log('resolved constants');
console.log(`  accel             = ${a.accel.toFixed(1)}   (lane-widths/s^2)`);
console.log(`  damping           = ${a.damping}`);
console.log(`  speedCap          = ${a.speedCap.toFixed(3)}   (lane-widths/s)`);
console.log(`  boostSteerFactor  = ${a.boostSteerFactor}`);
console.log(`  stopSpeed         = ${a.stopSpeed.toFixed(4)}   (lane-widths/s)\n`);

console.log('feel targets (these hold on every device, because they are expressed as times)');
console.log(`  cruise crossing   = ${a.crossingSeconds}s`);
console.log(`  boost crossing    = ${a.boostCrossingSeconds}s`);
console.log(`  cruise top speed  = ${a.cruiseTopSpeed.toFixed(3)} lane-widths/s`);
console.log(`  time constant     = ${(1 / a.damping).toFixed(2)}s\n`);

// --- Ordering guard -------------------------------------------------------
// The single bug that made the bubble completely undrivable: a stop threshold larger than one
// frame's worth of thrust, so the snap zeroed the velocity every frame.
const perFrameThrust = a.accel / 120;
const perFrameBoost = (a.accel * a.boostSteerFactor) / 120;
console.log('ordering guard');
console.log(`  thrust per frame (120Hz) = ${perFrameThrust.toFixed(4)} lane-widths/s`);
console.log(`  boost  per frame         = ${perFrameBoost.toFixed(4)} lane-widths/s`);
console.log(`  stopSpeed / thrust       = ${(a.stopSpeed / perFrameThrust).toFixed(3)}  (must be < 1)`);

if (a.stopSpeed >= perFrameBoost) {
  console.error('\nFAIL: stopSpeed is at or above the boost per-frame increment.');
  console.error('The stop-snap would fire every frame and the bubble would never move.');
  process.exit(1);
}
console.log('\nOK');
