// Golden trajectories AND golden effect streams for every hazard kind.
//
// Drives each kind through `HazardField.update` with a seeded PRNG and a fixed context, and prints a digest of where it
// ended up plus a hash of every effect it produced. Run it against two trees and diff: a behaviour-preserving refactor
// must produce byte-identical output.
//
//   node scripts/probe-creatures.mjs [tree] [steps]  # defaults to this checkout
//
// Two contact modes per creature, because the reversal short-circuits the contact rules: with `canEat` true the player
// swallows what it touches (and the damage cases never run), and with it false every contact goes down the damage path.
// Covering only one of them would leave half of `update` unmeasured.
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());
const steps = Number(process.argv[3] ?? 600);

// A seeded PRNG, so both runs see the same "random" numbers.
let seed = 0x2f6e2b1;
Math.random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

const { createServer } = await (async () => {
  // Resolve vite from the TREE being probed, not from wherever this script lives, so the same script can be pointed at
  // two checkouts and their behaviour compared.
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const hz = await server.ssrLoadModule('/src/hazards.ts');
  const mech = (await server.ssrLoadModule('/src/mechanisms.ts')).mech;

  const KINDS = ['fish', 'tuna', 'jelly', 'trash', 'crab', 'urchin', 'bombfish', 'eel', 'rot', 'oil', 'boss', 'vent', 'mineral', 'shrimp', 'angler', 'torpedo', 'zapper', 'foam', 'rain', 'dolphin', 'octopus', 'shark', 'whale', 'archer', 'pistol', 'puffer', 'starfish'];

  const ctxFor = (eat) => ({
    laneWidth: 100,
    min: 0,
    max: 400,
    playerX: 30,
    playerY: 200,
    playerVolume: 2,
    // Set explicitly: without it every reach test is NaN and NOTHING ever touches the player, which made an earlier
    // version of this probe silently measure the movement code only.
    playerRadiusFraction: 0.05,
    invulnerable: false,
    elapsed: 0,
    descentSpeed: 12,
    struggling: true,
    bubbles: [{ id: 1, x: 40, y: 210, volume: 3, radius: 0.05 }],
    eatenBubbleIds: [],
    canEat: () => eat,
    canSwallow: () => true,
    suction: null,
  });

  const round = (n) => (Number.isFinite(n) ? n.toFixed(3) : String(n));
  const signature = (e) =>
    [
      e.kind,
      e.damage ?? '',
      e.slowSeconds ?? '',
      e.slowFactor ?? '',
      e.impulse ?? '',
      e.broke ? 1 : 0,
      e.eaten ? e.eaten.id : '',
      e.pushDown ?? '',
      e.charge ?? '',
      e.drainPerSecond ? 1 : 0,
      e.blast ? round(e.blast.radius) : '',
      e.shot ? `${round(e.shot.x)},${round(e.shot.y)}` : '',
    ].join('|');

  for (const kind of KINDS) {
    for (const [i, start] of [[0, { x: 20, y: 100 }], [1, { x: 32, y: 205 }]]) {
      for (const mode of ['eat', 'hurt']) {
        seed = 0x2f6e2b1;
        const field = new hz.HazardField();
        field.autoSpawn = false;
        const h = field.spawnAt(kind, start.x, start.y, { deterministic: true });
        h.phase = 0.4;
        h.health = h.maxHealth;
        field.hazards.push(h);
        const ctx = ctxFor(mode === 'eat');
        let count = 0;
        let hash = 0;
        let byKind = {};
        for (let s = 0; s < steps; s++) {
          ctx.elapsed = s / 120;
          for (const e of field.update(1 / 120, ctx)) {
            count++;
            const sig = signature(e);
            for (let c = 0; c < sig.length; c++) hash = (Math.imul(hash, 31) + sig.charCodeAt(c)) | 0;
            byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
          }
        }
        const fields = ['x', 'y', 'phase', 'health', 'flee', 'fired', 'armed', 'gripping', 'gripSeconds', 'squashed', 'fed', 'digest', 'discharge', 'dischargeRest', 'foamLife', 'chargeRest', 'shootTimer']
          .map((f) => `${f}=${typeof h[f] === 'number' ? round(h[f]) : h[f]}`)
          .join(' ');
        const charge = h.charge ? `charge(${round(h.charge.fromX)},${round(h.charge.fromY)},${round(h.charge.toX)},${round(h.charge.toY)},${round(h.charge.bow)},${round(h.charge.elapsed)})` : 'charge=none';
        const knock = h.knock ? `knock(${round(h.knock.dirX)},${round(h.knock.dirY)},${round(h.knock.meters)},${round(h.knock.elapsed)})` : 'knock=none';
        const by = Object.entries(byKind).sort().map(([k, v]) => `${k}:${v}`).join(',');
        console.log(`${kind}#${i}/${mode} ${fields} ${charge} ${knock} alive=${field.hazards.length} effects=${count} hash=${hash} by=${by}`);
      }
    }
  }
  console.log('MECH_DIGEST', KINDS.map((k) => `${k}:${hz.hazardHealth(k)}:${JSON.stringify(mech.charges.chargers[k] ?? null).length}`).join(' '));
} finally {
  await server.close();
}
