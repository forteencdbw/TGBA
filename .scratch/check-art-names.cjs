// Verifies that every animation frame and every art state name in the config resolves to a picture the game can
// actually load.
//
// WHAT CHANGED, AND WHY THIS IS NOT JUST A PATH UPDATE
// ---------------------------------------------------
// The pictures used to BE the files in `src/assets/`, so resolving a config name meant listing that directory. They are
// now frames inside `src/assets/atlas/*.json` (packed by `scripts/pack-atlas.py`), and the source PNGs in that
// directory are the packer's INPUT -- they are not in the bundle at all. So a name can be a file on disk and still be
// missing from the game, which is exactly the "stale atlas" failure: this checks the atlas, not the directory.
//
// `scripts/probe-atlas.mjs` is the fuller check (it also parses every manifest with PixiJS and asks `src/assets.ts`
// itself, through Vite, where each name lives). This one is kept because it needs no build step and no modules.
const fs = require('fs');
const JSON5 = require('json5');

const o = JSON5.parse(fs.readFileSync('config/mechanics.json5', 'utf8'));

const atlas = new Set();
for (const file of fs.readdirSync('src/assets/atlas')) {
  if (!file.endsWith('.json')) continue;
  const page = JSON.parse(fs.readFileSync('src/assets/atlas/' + file, 'utf8'));
  for (const key of Object.keys(page.frames)) atlas.add(key.replace(/\.[^.]+$/, ''));
}
// The loose pictures: what is still its own file. JPEG backdrops, and nothing else today.
const loose = new Set(
  fs
    .readdirSync('src/assets')
    .filter((f) => /\.(jpe?g)$/i.test(f))
    .map((f) => f.replace(/\.[^.]+$/, '')),
);

const expand = (a) =>
  Array.isArray(a.frames)
    ? a.frames
    : Array.from({ length: Math.max(1, Math.round(a.count ?? 1)) }, (_, i) => a.frames.replace('{n}', String(i + 1)));

const where = (name) => {
  const bare = name.replace(/\.[^.]+$/, '');
  if (atlas.has(bare)) return 'atlas';
  if (loose.has(bare)) return 'file';
  return null;
};

let bad = 0;
for (const [k, a] of Object.entries(o.animations)) {
  for (const n of expand(a)) {
    const at = where(n);
    if (!at) bad++;
    console.log((at ?? 'MISS').padEnd(5) + '  ' + k + ' -> ' + n);
  }
}
for (const [kind, art] of Object.entries(o.hazardArt)) {
  for (const s of ['move', 'charge', 'attack', 'dead']) {
    const n = art[s];
    if (n === undefined) continue;
    const at = where(n) ? 'anim' : o.animations[n] ? 'anim' : null;
    if (!at) bad++;
    console.log((at ?? 'MISS').padEnd(5) + '  ' + kind + '.' + s + ' = ' + n);
  }
}
console.log(bad === 0 ? `ALL RESOLVE (${atlas.size} atlas frame(s), ${loose.size} loose file(s))` : bad + ' UNRESOLVED');
