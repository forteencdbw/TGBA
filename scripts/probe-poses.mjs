// Which picture does each creature show, at each moment of its charge?
//
// The anglerfish bug was invisible to the compiler and to every probe here: the shared rule showed its OPEN MOUTH
// during the wind-up and a closed mouth while it lunged, and nothing in the repository could be asked about it. Now
// that the decision is a pure function (`hazardArtPose`), it can be. This prints the answer for every creature that
// charges, at the three moments that matter, and checks the two that are specified:
//
//   * the anglerfish bites with its open mouth: closed while it winds up, OPEN during the lunge, closed afterwards;
//   * the shrimp curls while it winds up (that is what its charge picture is for), and swims again after.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] ?? process.cwd());
const require = createRequire(root + '/package.json');
const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
let failures = 0;
try {
  const hz = await server.ssrLoadModule('/src/hazards.ts');
  const mech = (await server.ssrLoadModule('/src/mechanisms.ts')).mech;

  const field = new hz.HazardField();
  const moments = ['winding up', 'lunging', 'after the charge'];
  console.log(`${'creature'.padEnd(10)} ${'pictures'.padEnd(30)} ${moments.map((m) => m.padEnd(18)).join('')}`);

  // Every creature whose art has a charge picture -- NOT every row of the chargers table: the anglerfish charges on
  // its own trigger and has no row there, which is precisely how the first version of this probe skipped the one
  // creature it was written for and printed OK.
  const kinds = Object.entries(mech.hazardArt)
    .filter(([, art]) => art.charge !== undefined)
    .map(([kind]) => kind);
  if (kinds.length === 0) {
    failures++;
    console.log('  FAIL: no creature has a charge picture, so this probe checks nothing');
  }

  for (const kind of kinds) {
    const art = mech.hazardArt[kind];
    const telegraph = hz.chargeWindow(kind).telegraphSeconds;
    const travel = hz.chargeWindow(kind).travelSeconds;
    const h = field.spawnAt(kind, 100, 100, { deterministic: true });
    const shown = [
      // Winding up: a third of the way into the telegraph.
      (() => {
        h.charge = { fromX: 0, fromY: 0, toX: 10, toY: 0, bow: 0, elapsed: telegraph * 0.34 };
        return hz.hazardArtPose(h, art, telegraph).state;
      })(),
      // Lunging: a third of the way through the travel.
      (() => {
        h.charge = { fromX: 0, fromY: 0, toX: 10, toY: 0, bow: 0, elapsed: telegraph + travel * 0.34 };
        return hz.hazardArtPose(h, art, telegraph).state;
      })(),
      // The charge is over.
      (() => {
        h.charge = null;
        return hz.hazardArtPose(h, art, telegraph).state;
      })(),
    ];
    console.log(
      `${kind.padEnd(10)} move=${String(art.move).padEnd(6)} charge=${String(art.charge).padEnd(10)} ` +
        shown.map((s) => String(s ?? '-').padEnd(18)).join(''),
    );

    if (kind === 'angler') {
      const [wind, lunge, after] = shown;
      // The jaws ARE the warning and the bite: open for the whole charge, shut before and after.
      if (wind !== art.charge) {
        failures++;
        console.log(`  FAIL: the anglerfish shows ${wind} while winding up -- it should be ${art.charge} (jaws open)`);
      }
      if (lunge !== art.charge) {
        failures++;
        console.log(`  FAIL: the anglerfish shows ${lunge} while lunging -- it should be ${art.charge} (jaws open)`);
      }
      if (after !== art.move) {
        failures++;
        console.log(`  FAIL: the anglerfish shows ${after} after the charge -- it should be ${art.move} (jaws shut)`);
      }
      if (art.charge === undefined || art.move === undefined) {
        failures++;
        console.log('  FAIL: the anglerfish has no separate charge picture, so this test cannot mean anything');
      }
    }
    if (kind === 'shrimp' && shown[0] !== art.charge) {
      failures++;
      console.log(`  FAIL: the shrimp no longer curls while winding up (shows ${shown[0]}, expected ${art.charge})`);
    }
  }

  // And the boss's swing must still beat its charge-shaped behaviour, plus death beating everything.
  const boss = field.spawnAt('boss', 100, 100, { deterministic: true });
  const bossArt = mech.hazardArt.boss;
  boss.attackSince = 0.2;
  if (hz.hazardArtPose(boss, bossArt, 0.75).state !== bossArt.attack) {
    failures++;
    console.log('  FAIL: the boss does not show its claw swing while attacking');
  }
  boss.deadSince = 0.2;
  if (hz.hazardArtPose(boss, bossArt, 0.75).state !== bossArt.dead) {
    failures++;
    console.log('  FAIL: a dying boss does not show its death picture');
  }
  console.log(`\n${failures === 0 ? 'OK: every creature shows its own pose' : failures + ' problem(s)'}`);

  // ---------------------------------------------------------------------------------------------
  // The window itself: the numbers in force must be the ones the config states. The anglerfish's wind-up, lunge and
  // cooldown sit in its own block and were read by nobody (the motion took the fish's fallback for all three), which
  // is the bug behind the trail appearing before the lunge.
  // ---------------------------------------------------------------------------------------------
  console.log('\ncharge window in force, against the config:');
  for (const kind of Object.keys(mech.charges.chargers)) {
    const window = hz.chargeWindow(kind);
    const row = mech.charges.chargers[kind];
    const ok =
      window.telegraphSeconds === row.telegraphSeconds &&
      window.travelSeconds === row.travelSeconds &&
      window.cooldownSeconds === row.cooldownSeconds;
    if (!ok) failures++;
    console.log(
      `  ${kind.padEnd(10)} telegraph ${window.telegraphSeconds}s  travel ${window.travelSeconds}s  ` +
        `cooldown ${window.cooldownSeconds}s  (chargers row) ${ok ? 'ok' : 'MISMATCH'}`,
    );
  }
  const angler = mech.hazards.angler;
  const anglerWindow = hz.chargeWindow('angler');
  const anglerOk =
    anglerWindow.telegraphSeconds === angler.telegraphSeconds &&
    anglerWindow.travelSeconds === angler.travelSeconds &&
    anglerWindow.cooldownSeconds === angler.cooldownSeconds;
  if (!anglerOk) failures++;
  console.log(
    `  ${'angler'.padEnd(10)} telegraph ${anglerWindow.telegraphSeconds}s  travel ${anglerWindow.travelSeconds}s  ` +
      `cooldown ${anglerWindow.cooldownSeconds}s  (its OWN block, and it has no chargers row) ${anglerOk ? 'ok' : 'MISMATCH'}`,
  );

  // And what that means in the water: a lunge, timed from a fixed starting position.
  const ctx = {
    laneWidth: 400,
    min: 0,
    max: 900,
    playerX: 200,
    playerY: 200,
    playerVolume: 1,
    playerRadiusFraction: 0.05,
    invulnerable: true,
    elapsed: 0,
    descentSpeed: 0,
    struggling: false,
    bubbles: [],
    eatenBubbleIds: [],
    canEat: () => false,
    canSwallow: () => false,
    suction: null,
  };
  const live = new hz.HazardField();
  const one = live.spawnAt('angler', 200, 240, { deterministic: true });
  live.hazards.push(one);
  const step = 1 / 60;
  const marks = {};
  for (let tick = 0; tick < 60 * 12; tick++) {
    ctx.elapsed = tick * step;
    live.update(step, ctx);
    const t = +(tick * step).toFixed(2);
    if (marks.started === undefined && one.charge) marks.started = t;
    if (marks.lunging === undefined && one.charge && one.charge.elapsed >= anglerWindow.telegraphSeconds) {
      marks.lunging = t;
    }
    if (marks.ended === undefined && marks.started !== undefined && !one.charge) marks.ended = t;
  }
  console.log(
    `\nthe anglerfish in the water (player parked inside its 300m lure range): swing starts at ${marks.started}s, ` +
      `the jaws close on the lunge at ${marks.lunging}s, the bite is over at ${marks.ended}s`,
  );
  console.log(failures === 0 ? 'OK' : `${failures} problem(s)`);
} finally {
  await server.close();
}
process.exit(failures ? 1 : 0);
