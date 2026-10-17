// Prints the two curves that pacing is a shape OF, for every level.
//
//   node scripts/probe-pacing.mjs [tree]              # defaults to this checkout
//
// The project's own doctrine (`.scratch/bubble-ascent/spec.md`) is that pacing is measured in SECONDS PER SCREEN and that
// "节奏是一条形状，不是一个均值" -- a shape, never a mean. Both halves of that are series here, side by side:
//
//   seconds/screen   how fast the level goes past. Flat on a constant-pace level, and the level's authored shape once it
//                    has a `scrollSpeedCurve`.
//   threat/screen    how much room that screenful's content takes away, from `pacing.threat`. This is the one that says
//                    "nothing happens for five screens" or "this stretch is a wall".
//
// Nothing plays, no browser opens: this loads `src/levels.ts` through Vite's SSR transform and reads the level data.

import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });

/** A row of numbers as a compact bar chart, so a shape is visible without reading twelve values. */
function bar(values, scale = 1) {
  return values.map((v) => Math.round(v * scale)).join(' ');
}

try {
  const L = await server.ssrLoadModule('/src/levels.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  for (const level of L.LEVELS) {
    const total = L.nominalScrollSeconds(level);
    const screens = total > 0 ? level.scrollLength / L.WORLD_HEIGHT : 0;
    const perScreen = L.secondsPerScreenSeries(level, 40);
    const threat = L.threatPerScreenSeries(level, 40);

    const bossSeconds = L.timeToScroll(level, 0, level.boss.at);
    // The last screen that has anything in it, and the run of empty ones before the boss: the level-1 symptom.
    let lastContent = -1;
    threat.forEach((v, i) => {
      if (v > 0) lastContent = i;
    });
    const emptyBeforeBoss = Math.max(0, Math.floor(level.boss.at / L.WORLD_HEIGHT) - lastContent - 1);

    console.log(`\n===== ${level.id}  ${level.name}`);
    console.log(`  pace       ${level.scrollSpeed} m/s${level.scrollSpeedCurve ? `  curve: ${level.scrollSpeedCurve.map(([a, v]) => `${a}m→${v}`).join('  ')}` : ' (constant)'}`);
    console.log(`  length     ${level.scrollLength} m = ${screens.toFixed(1)} screens of ${L.WORLD_HEIGHT} m`);
    console.log(`  duration   ${total.toFixed(1)} s   boss at ${level.boss.at} m = ${bossSeconds.toFixed(1)} s   (hp ${level.boss.health})`);
    console.log(`  s/screen   ${perScreen.map((v) => v.toFixed(1)).join(' ')}`);
    console.log(`  threat/scr ${bar(threat)}`);
    console.log(`             peak ${Math.max(...threat)} in screen ${threat.indexOf(Math.max(...threat))}, mean ${(threat.reduce((a, b) => a + b, 0) / threat.length).toFixed(1)}`);
    console.log(`             last content in screen ${lastContent}, then ${emptyBeforeBoss} empty screen(s) before the boss`);
    if (emptyBeforeBoss > 1) console.log(`  !! ${emptyBeforeBoss} screens with nothing before the boss (${(emptyBeforeBoss * L.WORLD_HEIGHT / level.scrollSpeed).toFixed(0)} s)`);

    // Where the collectables are, and how long you go with nothing to pick up.
    //
    // The threat series above cannot see this: a collectable's weight is 0, so a level whose food is all in the
    // first screen and the last one reads exactly like a level whose food is spread through it. That was the state
    // of all six until they were redone -- a 45-58 second hole in the middle of every level, which is the part of
    // the level the food exists for.
    const drops = level.entries.filter((e) => e.kind === 'bubble').map((e) => e.at).sort((a, b) => a - b);
    const screenOf = (m) => Math.floor(m / L.WORLD_HEIGHT);
    const dropScreens = new Array(Math.ceil(level.scrollLength / L.WORLD_HEIGHT)).fill(0);
    for (const at of drops) dropScreens[screenOf(at)]++;
    let worst = { s: 0, from: 0, to: 0 };
    for (let i = 1; i < drops.length; i++) {
      const s = L.timeToScroll(level, drops[i - 1], drops[i]);
      if (s > worst.s) worst = { s, from: drops[i - 1], to: drops[i] };
    }
    console.log(`  food/scr   ${dropScreens.join(' ')}`);
    console.log(`             ${drops.length} 颗 = ${(drops.length / total).toFixed(2)}/秒 · 最长空档 ${worst.s.toFixed(1)}s（${worst.from}m → ${worst.to}m）`);
    if (worst.s > 15) console.log(`  !! ${worst.s.toFixed(1)}s with nothing to pick up -- longer than a burst screen should take`);
  }

  // The campaign, in the order a player meets it: is the pressure climbing?
  console.log('\n===== THE CAMPAIGN');
  const rows = L.LEVELS.map((level) => {
    const threat = L.threatPerScreenSeries(level, 40);
    const screens = Math.max(1, Math.round(level.scrollLength / L.WORLD_HEIGHT));
    const total = threat.reduce((a, b) => a + b, 0);
    return { id: level.id, screens, total, perScreen: total / screens, seconds: L.nominalScrollSeconds(level) };
  });
  console.log('  level           screens  threat  threat/screen  seconds');
  for (const r of rows) {
    console.log(`  ${r.id.padEnd(15)} ${String(r.screens).padStart(6)} ${String(r.total).padStart(7)} ${r.perScreen.toFixed(1).padStart(14)} ${r.seconds.toFixed(1).padStart(8)}`);
  }
  const climbing = rows.every((r, i) => i === 0 || r.perScreen >= rows[i - 1].perScreen);
  console.log(`  density is ${climbing ? 'MONOTONIC' : 'NOT monotonic'} across the six`);
  if (!climbing) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].perScreen < rows[i - 1].perScreen) {
        console.log(`  !! ${rows[i].id} (${rows[i].perScreen.toFixed(1)}) is looser than ${rows[i - 1].id} (${rows[i - 1].perScreen.toFixed(1)})`);
      }
    }
  }

  /**
   * When the first mutation card arrives, measured rather than asserted.
   *
   * The shape of the mutation ladder is `first` points for the first one, and two things feed it: the timeline, which
   * runs for everybody, and the collectables, which only the player who swims over them gets. So the honest answer is a
   * WINDOW, and it is computed from LEVEL 1's own food (the level the first card is drawn in) rather than from a rate
   * typed into this file -- move the food and this number moves with it.
   */
  const l1 = L.LEVELS[0];
  const food1 = l1.entries.filter((e) => e.kind === 'bubble').length;
  const collecting = mech.mutation.autoPerSecond + (food1 / L.nominalScrollSeconds(l1)) * mech.mutation.gain.absorb;
  console.log(
    `\n  first card: ${(mech.mutation.first / mech.mutation.autoPerSecond).toFixed(0)}s on the clock alone, ` +
      `${(mech.mutation.first / collecting).toFixed(0)}s taking every collectable in ${l1.id}`,
  );
} finally {
  await server.close();
}
