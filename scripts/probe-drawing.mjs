// Golden DRAW commands for every hazard kind.
//
// `paintHazards` builds a Pixi `Graphics` description without touching the GPU, so in Node it can be asked what it
// would draw: the instruction list is the picture. Run against two trees and diff.
//
//   node scripts/probe-drawing.mjs [tree]            # defaults to this checkout
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());

// A seeded PRNG, so both runs see the same "random" numbers.
let seed = 0x51f3a7;
Math.random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

// `artTexture` builds an `Image` to load a sheet. In Node there is none, and the painter's documented behaviour with no
// texture is to fall back to the drawn body -- which is exactly the path this probe wants to compare.
globalThis.Image = class {
  set src(_v) {}
  set onload(_v) {}
  set onerror(_v) {}
  decode() {
    return Promise.resolve();
  }
};

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const hz = await server.ssrLoadModule('/src/hazards.ts');
  const pixi = await import((await import('node:url')).pathToFileURL((await import('node:module')).createRequire(root + '/package.json').resolve('pixi.js')).href);

  const KINDS = ['fish', 'tuna', 'jelly', 'trash', 'crab', 'urchin', 'bombfish', 'eel', 'boss', 'vent', 'mineral', 'shrimp', 'angler', 'torpedo', 'zapper', 'foam', 'rain', 'dolphin', 'octopus', 'shark', 'whale', 'archer', 'pistol', 'puffer', 'starfish'];

  const digest = (g) => {
    const instructions = g.context?.instructions ?? [];
    const parts = [];
    for (const ins of instructions) {
      const d = ins.data ?? {};
      const nums = Object.keys(d)
        .filter((k) => typeof d[k] === 'number')
        .sort()
        .map((k) => `${k}=${Number.isFinite(d[k]) ? d[k].toFixed(4) : d[k]}`)
        .join(',');
      const colour = d.style?.color !== undefined ? `#${Number(d.style.color).toString(16)}` : '';
      const alpha = d.style?.alpha !== undefined ? `a=${Number(d.style.alpha).toFixed(3)}` : '';
      parts.push(`${ins.action}[${nums}]${colour}${alpha}`);
    }
    let hash = 0;
    const all = parts.join('|');
    for (let i = 0; i < all.length; i++) hash = (Math.imul(hash, 31) + all.charCodeAt(i)) | 0;
    return { count: parts.length, hash, head: parts.slice(0, 3).join(' ') };
  };

  for (const kind of KINDS) {
    for (const state of ['rest', 'charge', 'flee', 'hit']) {
      seed = 0x51f3a7;
      const field = new hz.HazardField();
      const h = field.spawnAt(kind, 40, 120, { deterministic: true });
      h.phase = 0.9;
      if (kind === 'vent') h.phase = 0.05;
      if (state === 'charge') h.charge = { fromX: 40, fromY: 120, toX: 45, toY: 130, bow: 8, elapsed: 0.3 };
      if (state === 'flee') h.flee = 'up';
      if (state === 'hit') h.hitFlash = 0.1;
      field.hazards.push(h);
      const g = new pixi.Graphics();
      for (const which of ['in-play', 'leaving']) {
        g.clear();
        // `canEat` true so the golden outline marker is drawn as well -- it is one of the per-kind branches.
        hz.paintHazards(g, field, 100, 1.7, () => true, which, 30);
        const d = digest(g);
        console.log(`${kind}/${state}/${which} draws=${d.count} hash=${d.hash} head=${d.head}`);
      }
    }
  }
} finally {
  await server.close();
}
