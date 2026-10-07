// Is the committed atlas one PixiJS can actually parse, and does every picture come out at its own size?
//
// The packer checks its own output against the source pixels, and the compiler checks that `assets.ts` type-checks.
// Neither can answer the question this change turns on: what does the ENGINE make of the manifest? The painters scale
// every picture as `size / texture.width`, so a frame PixiJS believed was trimmed -- or a `frames` table keyed
// differently from the way the loader looks names up -- would resize every creature in the game without throwing.
//
// So this parses each page with the real `Spritesheet` class, with a stand-in texture source (no GPU, no canvas), and
// then resolves the config's own art names through the packer's frame tables.
//
//   node scripts/probe-atlas.mjs [tree]      # defaults to this checkout
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] ?? process.cwd());
const require = createRequire(join(root, 'package.json'));

const pixi = await import(pathToFileURL(require.resolve('pixi.js')).href);
const JSON5 = require('json5');

const atlasDir = join(root, 'src', 'assets', 'atlas');
const manifests = readdirSync(atlasDir).filter((name) => name.endsWith('.json'));
if (manifests.length === 0) {
  console.error('no atlas manifests in ' + atlasDir + ' -- run `pnpm atlas`');
  process.exit(2);
}

const failures = [];
const framesByBareName = new Map();
const pageOf = new Map();

for (const name of manifests.sort()) {
  const page = JSON.parse(readFileSync(join(atlasDir, name), 'utf8'));
  const size = page.meta.size;

  // A TextureSource with no resource: `Spritesheet.parse` only slices rectangles out of it, which is exactly the part
  // of PixiJS this probe wants to exercise. Nothing here touches the GPU.
  const source = new pixi.TextureSource({ width: size.w, height: size.h });
  const texture = new pixi.Texture({ source });
  const sheet = new pixi.Spritesheet(texture, page);
  await sheet.parse();

  const keys = Object.keys(page.frames);
  console.log(`${name.padEnd(14)} ${String(size.w).padStart(5)}x${String(size.h).padEnd(5)} ${String(keys.length).padStart(2)} frame(s)`);

  for (const key of keys) {
    const declared = page.frames[key];
    const got = sheet.textures[key];
    if (!got) {
      failures.push(`${name}: ${key} did not produce a texture`);
      continue;
    }
    if (got.width !== declared.frame.w || got.height !== declared.frame.h) {
      failures.push(
        `${name}: ${key} came out ${got.width}x${got.height}, manifest says ${declared.frame.w}x${declared.frame.h}`,
      );
    }
    // The one that matters: `texture.width` must be the PICTURE's width, because that is the divisor every painter
    // uses for its scale. `orig` is what PixiJS would resize a sprite from, so the two agreeing is the invariant.
    if (got.orig.width !== declared.frame.w || got.orig.height !== declared.frame.h) {
      failures.push(
        `${name}: ${key} has layout size ${got.orig.width}x${got.orig.height}, picture is ${declared.frame.w}x${declared.frame.h}` +
          ' -- a trimmed frame would resize every creature drawn from it',
      );
    }
    const bare = key.replace(/\.[^.]+$/, '');
    if (framesByBareName.has(bare)) failures.push(`${key} appears on two pages (${pageOf.get(bare)} and ${name})`);
    framesByBareName.set(bare, { page: name, width: got.width, height: got.height });
    pageOf.set(bare, name);
  }
}

// ---------------------------------------------------------------------------------------------
// Every picture on disk is in the atlas, at its own size, and every name the config asks for resolves.
// ---------------------------------------------------------------------------------------------
const sources = readdirSync(join(root, 'src', 'assets')).filter((file) => file.endsWith('.png'));
for (const file of sources) {
  const bare = file.replace(/\.[^.]+$/, '');
  const frame = framesByBareName.get(bare);
  if (!frame) {
    failures.push(`${file} is not in the atlas -- run \`pnpm atlas\``);
    continue;
  }
  const declared = JSON.parse(readFileSync(join(atlasDir, frame.page), 'utf8')).frames[file];
  const size = declared.frame;
  if (frame.width !== size.w || frame.height !== size.h) {
    failures.push(`${file}: atlas frame is ${frame.width}x${frame.height}, the picture is ${size.w}x${size.h}`);
  }
}

const mech = JSON5.parse(readFileSync(join(root, 'config', 'mechanics.json5'), 'utf8'));
const wanted = [];
for (const [kind, art] of Object.entries(mech.hazardArt ?? {})) {
  for (const state of ['move', 'charge', 'dead']) {
    if (art[state] === undefined) continue;
    const animation = (mech.animations ?? {})[art[state]];
    if (animation) {
      const names = Array.isArray(animation.frames)
        ? animation.frames
        : Array.from({ length: animation.count ?? 1 }, (_, i) => animation.frames.replace('{n}', String(i + 1)));
      for (const frameName of names) wanted.push([`hazardArt.${kind}.${state}`, frameName]);
    } else {
      wanted.push([`hazardArt.${kind}.${state}`, art[state]]);
    }
  }
}
for (const [path, name] of [
  ['bullets.image', mech.bullets?.image],
  ['playerBubble.image', mech.playerBubble?.image],
  ['chargeTrail.image', mech.chargeTrail?.image],
]) {
  if (name) wanted.push([path, name]);
}

let resolved = 0;
for (const [path, name] of wanted) {
  const bare = String(name).replace(/\.[^.]+$/, '');
  if (framesByBareName.has(bare)) {
    resolved++;
    continue;
  }
  const loose = readdirSync(join(root, 'src', 'assets')).some((file) => file.replace(/\.[^.]+$/, '') === bare);
  if (loose) resolved++;
  else failures.push(`${path} names "${name}", which is in no atlas page and is no file`);
}

// ---------------------------------------------------------------------------------------------
// And now the half the manifests cannot answer: what `src/assets.ts` itself resolves, through Vite.
//
// The loader matches three sets of strings against each other -- the config's name, the manifest's key, and the URL
// Vite emitted for the page texture -- and a mismatch in any of them is not an error anywhere. It is "no art", with a
// console warning as the only trace. So the module is loaded through Vite (which is what resolves
// `import.meta.glob`), asked about every picture, and the URL it hands back is checked against a real file.
// ---------------------------------------------------------------------------------------------
const { createServer } = await (async () => {
  const { pathToFileURL: toUrl } = await import('node:url');
  return import(toUrl(require.resolve('vite')).href);
})();

const warnings = [];
const realWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.map(String).join(' '));
  realWarn(...args);
};
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
let loaderResolved = 0;
try {
  const assets = await server.ssrLoadModule('/src/assets.ts');
  const names = assets.allAssetNames();
  for (const file of sources) {
    const bare = file.replace(/\.[^.]+$/, '');
    const where = assets.atlasPageForTest(bare);
    if (!where) {
      failures.push(`assets.ts does not resolve ${file} to a page`);
      continue;
    }
    const url = where.url.split('?')[0];
    const filePath = url.startsWith('/') ? join(root, url.slice(1)) : join(root, url);
    if (!existsSync(filePath)) {
      failures.push(`${file}: assets.ts points at ${where.url}, which is not a file`);
      continue;
    }
    loaderResolved++;
  }
  const looseCount = names.length - framesByBareName.size;
  console.log(`\nassets.ts through Vite: ${loaderResolved}/${sources.length} picture(s) resolved to real page files, ${looseCount} loose file(s)`);
} finally {
  console.warn = realWarn;
  await server.close();
}
for (const line of warnings) {
  if (line.includes('[assets]')) failures.push('warning from assets.ts: ' + line);
}

console.log(
  `\n${manifests.length} page(s), ${framesByBareName.size} picture(s), ${sources.length} on disk, ` +
    `${resolved}/${wanted.length} config art name(s) resolved`,
);
if (failures.length) {
  console.log(`FAILED: ${failures.length} problem(s)`);
  for (const line of failures) console.log('  ' + line);
  process.exit(1);
}
console.log('OK: every frame parses to its own size, and every configured name resolves');
