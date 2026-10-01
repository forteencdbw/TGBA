// Consistency check for the lateral calibration in src/lateral.ts.
//
// The runtime calibration lives in that module (it depends on the display's aspect ratio, so it
// cannot be a build-time constant). This script imports the same maths and prints what the game
// will resolve to for a given play-area width, so the numbers can be sanity-checked without a
// browser -- and failing numbers can be caught before they reach a device.
//
// Run: node scripts/solve-lateral.mjs [laneWidthMeters]

import { calibrateLateral } from '../src/lateral.ts';
import { BOOST_CROSSING_SECONDS, COLUMN_CROSSING_SECONDS, KEYBOARD_CROSSING_SECONDS } from '../src/config.ts';

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
console.log(`  cruise crossing   = ${a.crossingSeconds}s   (touch / drag model)`);
console.log(`  boost crossing    = ${a.boostCrossingSeconds}s`);
console.log(`  cruise top speed  = ${a.cruiseTopSpeed.toFixed(3)} lane-widths/s`);
console.log(`  time constant     = ${(1 / a.damping).toFixed(2)}s`);
console.log(`  keyboard speed    = ${a.keyboardSpeed.toFixed(4)} lane-widths/s  (fixed, no ramp)`);
console.log(`    => keyboard crosses the lane in ${(1 / a.keyboardSpeed).toFixed(1)}s\n`);

// --- Ordering guard -------------------------------------------------------
// The single bug that made the bubble completely undrivable: a stop threshold larger than one
// frame's worth of thrust, so the snap zeroed the velocity every frame.
const perFrameThrust = a.accel / 120;
const perFrameBoost = (a.accel * a.boostSteerFactor) / 120;
console.log('ordering guard');
console.log(`  thrust per frame (120Hz) = ${perFrameThrust.toFixed(4)} lane-widths/s`);
console.log(`  boost  per frame         = ${perFrameBoost.toFixed(4)} lane-widths/s`);
console.log(`  stopSpeed / thrust       = ${(a.stopSpeed / perFrameThrust).toFixed(3)}  (must be < 1)`);

// Reported in the same form as the browser suites so the runner can schedule this alongside them
// without special-casing it. See scripts/run-tests.mjs.
const checks = {
  stopSpeedBelowThrust: a.stopSpeed < perFrameThrust,
  stopSpeedBelowBoostThrust: a.stopSpeed < perFrameBoost,
  accelIsPositive: a.accel > 0,
  // The calibration must reproduce the design targets it was solved FROM. Comparing against the
  // constants rather than against each other is the point: `1 / cruiseTopSpeed` is seconds per lane
  // width AT TOP SPEED (0.0064), which is a different quantity from the seconds it takes to cross
  // from a STANDSTILL (2.5), and treating those as the same thing silently checks nothing.
  crossingTimeMatchesTarget: Math.abs(a.crossingSeconds - COLUMN_CROSSING_SECONDS) < 1e-6,
  boostCrossingTimeMatchesTarget: Math.abs(a.boostCrossingSeconds - BOOST_CROSSING_SECONDS) < 1e-6,
  keyboardCrossingMatchesTarget: Math.abs(1 / a.keyboardSpeed - KEYBOARD_CROSSING_SECONDS) < 1e-6,
  // Crossing from rest must take longer than crossing at full speed, or the ramp is inverted.
  crossingAtSpeedIsQuicker: 1 / a.cruiseTopSpeed < a.crossingSeconds,
  keyboardSpeedIsUsable: a.keyboardSpeed > 0 && 1 / a.keyboardSpeed < 20,
  boostSteersWorse: a.boostSteerFactor > 0 && a.boostSteerFactor < 1,
};
console.log('CHECKS: ' + JSON.stringify(checks));

const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
if (failed.length) console.error('\nFAIL: ' + failed.join(', '));
process.exit(failed.length ? 1 : 0);
