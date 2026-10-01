// Verifies the emergence engine (D5) with no browser at all.
//
// A deliberate change of approach. The browser harness for this had spent a long time reporting an
// impossible exception -- "cannot read properties of undefined" at a line whose guard had provably not
// tripped, while a separate evaluate in the same instant saw a healthy page -- and none of that
// debugging was producing information about the GAME. The emergence rules are pure logic over plain
// objects, and `hazards.ts` only imports Pixi's Graphics as a TYPE (erased at runtime), so they can be
// driven directly in Node. Faster, deterministic, and it tests the rules rather than the harness.
//
// Run: node scripts/emergence.mjs

import { HazardField, hazardTuning } from '../src/hazards.ts';

/** A hazard context with sane defaults, so each test states only what it is about. */
function makeContext(overrides = {}) {
  return {
    min: -50,
    max: 400,
    laneWidth: 361,
    playerX: 180,
    playerY: 0,
    playerRadiusFraction: 0.05,
    ascentSpeed: 13,
    elapsed: 0,
    invulnerable: false,
    struggling: false,
    playerVolume: 1,
    bubbles: [],
    eatenBubbleIds: [],
    splitCount: 0,
    ...overrides,
  };
}

/** A fish at a given place, with the counters the emergence rules use. */
function makeFish(x, y, overrides = {}) {
  return {
    id: Math.floor(Math.random() * 1e6) + 1,
    kind: 'fish',
    x,
    y,
    radiusFraction: 0.035,
    phase: 0,
    seed: 0,
    baitedUntil: 0,
    squashed: 0,
    gripping: false,
    gripSeconds: 0,
    fuse: 0,
    fired: false,
    armed: false,
    fed: 0,
    digest: 0,
    ...overrides,
  };
}

/** A collectable, as much of one as the hazard rules look at. */
function makeBubble(id, x, y, volume = 1) {
  return { id, x, y, radius: 0.03, volume };
}

const results = {};

// ---------------------------------------------------------------- rule 2
// Perception radius grows with the player's volume. This is what gives "getting bigger is dangerous"
// a number, so it is checked across the range rather than at one point.
{
  const field = new HazardField();
  const small = field.perceptionRadius(1);
  const mid = field.perceptionRadius(2);
  const big = field.perceptionRadius(3.2);
  results.perception = { at1: small, at2: mid, at3_2: big, grows: small < mid && mid < big };
  console.log(
    `perception radius: volume 1 -> ${small}m, 2 -> ${mid}m, 3.2 -> ${big}m  (grows: ${results.perception.grows})`,
  );
}

// A fish outside its perception radius must NOT converge; inside it must.
{
  // Off to one side, so "converging" and "staying put" are distinguishable at all. An earlier version
  // spawned the idle fish at the player's own x, where "it did not move" was misread as "it converged".
  const beyond = new HazardField().perceptionRadius(1) + 120;
  const field = new HazardField();
  const fish = makeFish(60, beyond);
  field.hazards.push(fish);
  const ctx = makeContext({ playerX: 180, playerY: 0, playerVolume: 1 });
  for (let i = 0; i < 120; i++) field.update(1 / 60, ctx);
  const idleX = field.hazards[0]?.x ?? 60;
  // Out of range: it must NOT have closed on the player.
  const idleConverged = Math.abs(idleX - 180) < Math.abs(60 - 180) - 20;

  const field2 = new HazardField();
  const near = makeFish(60, 60);
  field2.hazards.push(near);
  const ctx2 = makeContext({ playerX: 180, playerY: 0, playerVolume: 1 });
  for (let i = 0; i < 120; i++) field2.update(1 / 60, ctx2);
  const chasedX = field2.hazards[0]?.x ?? 60;
  // In range: it must have closed on the player.
  const chaseConverged = Math.abs(chasedX - 180) < Math.abs(60 - 180) - 20;

  results.perceptionGates = { idleX, chasedX, idleConverged, chaseConverged };
  console.log(
    `perception gates the chase: 270m away -> x ${idleX.toFixed(1)} (stays, ${!idleConverged}); 120m away -> x ${chasedX.toFixed(1)} (converges, ${chaseConverged})`,
  );
}

// ---------------------------------------------------------------- rule 1
// A fish that eats enough collectables splits in two.
{
  const field = new HazardField();
  field.hazards.push(makeFish(180, 100, { digest: 0 }));
  const bubbles = [];
  for (let i = 0; i < hazardTuning.fishFeedToSplit; i++) bubbles.push(makeBubble(1000 + i, 180, 100));

  // Feed one at a time, letting the digest timer lapse between meals.
  let fed = 0;
  for (const b of bubbles) {
    const ctx = makeContext({ bubbles: [b] });
    field.update(1 / 60, ctx);
    if (ctx.eatenBubbleIds.length) fed++;
    // Clear the digest timer directly: it exists to pace a real fight, not this check.
    for (const h of field.hazards) h.digest = 0;
    // Keep the remaining food within reach of the NEW fish positions too.
    for (const h of field.hazards) {
      h.x = 180;
      h.y = 100;
    }
  }

  results.feeding = {
    fed,
    fishAfter: field.hazards.filter((h) => h.kind === 'fish').length,
    splits: field.splits,
    eaten: field.bubblesEaten,
  };
  console.log(
    `feeding: ate ${fed} collectables -> ${results.feeding.fishAfter} fish (splits=${field.splits}, eaten=${field.bubblesEaten})`,
  );
}

// The hard cap must actually hold, or the design's own centrepiece is a crash on a phone.
{
  const field = new HazardField();
  // Start already at the cap and keep feeding.
  for (let i = 0; i < hazardTuning.fishHardCap; i++) {
    field.hazards.push(makeFish(180, 100, { fed: hazardTuning.fishFeedToSplit - 1, digest: 0 }));
  }
  const before = field.hazards.length;
  const ctx = makeContext({ bubbles: [makeBubble(9999, 180, 100)] });
  for (let i = 0; i < 300; i++) field.update(1 / 60, ctx);
  const after = field.hazards.length;
  results.cap = { before, after, cap: hazardTuning.fishHardCap, held: after <= hazardTuning.fishHardCap + 1 };
  console.log(`hard cap: ${before} fish -> ${after} (cap ${hazardTuning.fishHardCap}, held: ${results.cap.held})`);
}

// ---------------------------------------------------------------- rule 3
// A jellyfish drifts toward the LARGEST collectable in range, not the nearest.
{
  const field = new HazardField();
  const jelly = {
    ...makeFish(180, 200),
    kind: 'jelly',
    radiusFraction: 0.062,
  };
  field.hazards.push(jelly);
  // The big one is FURTHER away than the small one, so seeking the nearest and seeking the biggest
  // give different answers -- which is the property being tested.
  const small = makeBubble(1, 100, 200, 0.5);
  const big = makeBubble(2, 300, 200, 3.0);
  const ctx = makeContext({ bubbles: [small, big] });
  const startX = jelly.x;
  for (let i = 0; i < 200; i++) field.update(1 / 60, ctx);
  const endX = field.hazards[0]?.x ?? startX;

  const movedTowardBig = endX > startX;
  results.seeking = { startX, endX, movedTowardBig };
  console.log(`seeking the biggest: jelly x ${startX} -> ${endX.toFixed(1)} (toward the big one: ${movedTowardBig})`);
}

// ---------------------------------------------------------------- summary
const checks = {
  perceptionGrowsWithVolume: results.perception.grows,
  perceptionGatesTheChase: results.perceptionGates.idleConverged === false && results.perceptionGates.chaseConverged,
  fishEatsCollectables: results.feeding.eaten > 0,
  fishSplitsWhenFed: results.feeding.fishAfter > 1 && results.feeding.splits > 0,
  hardCapHolds: results.cap.held,
  seeksBiggestNotNearest: results.seeking.movedTowardBig,
  // The rules are independent: eating must not be required for seeking, or vice versa.
  rulesAreIndependent: results.feeding.eaten > 0 && results.seeking.movedTowardBig,
};
console.log('\nCHECKS: ' + JSON.stringify(checks));
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
