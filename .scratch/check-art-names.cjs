// Verifies that every animation frame and every art state name in the config resolves to a real file
// in src/assets, or to an animation. Mirrors what assetUrl does (extension optional).
const fs = require('fs');
const JSON5 = require('json5');
const o = JSON5.parse(fs.readFileSync('config/mechanics.json5', 'utf8'));
const bare = new Set(fs.readdirSync('src/assets').map((f) => f.replace(/\.[^.]+$/, '')));
const expand = (a) =>
  Array.isArray(a.frames)
    ? a.frames
    : Array.from({ length: Math.max(1, Math.round(a.count ?? 1)) }, (_, i) => a.frames.replace('{n}', String(i + 1)));
let bad = 0;
for (const [k, a] of Object.entries(o.animations)) {
  for (const n of expand(a)) {
    const ok = bare.has(n);
    if (!ok) bad++;
    console.log((ok ? 'ok  ' : 'MISS') + '  ' + k + ' -> ' + n);
  }
}
for (const [kind, art] of Object.entries(o.hazardArt)) {
  for (const s of ['move', 'charge', 'dead']) {
    const n = art[s];
    if (n === undefined) continue;
    const isAnim = Boolean(o.animations[n]);
    const isFile = bare.has(n);
    if (!isAnim && !isFile) bad++;
    console.log((isAnim ? 'anim' : isFile ? 'file' : 'MISS') + '  ' + kind + '.' + s + ' = ' + n);
  }
}
console.log(bad === 0 ? 'ALL RESOLVE' : bad + ' UNRESOLVED');
