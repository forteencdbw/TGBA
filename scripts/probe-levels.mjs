// Does the app still see the same six levels, in the same order, with the same contents?
//
// The split moved each level into its own file; this asks the loader (through Vite, the way the game loads it) for
// what it actually parsed, and prints a digest per level: id, name, length, speed, how many spawn blocks, how many
// expanded entries, the boss, and whether it has paths/backdrops. If the split is a pure move, every number here
// matches the ones from the combined file.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] ?? process.cwd());
const require = createRequire(root + '/package.json');
const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const levels = await server.ssrLoadModule('/src/levels.ts');
  console.log(`start level: ${levels.START_LEVEL_ID}`);
  console.log(`levels: ${levels.LEVELS.length}\n`);
  const kinds = new Map();
  for (const level of levels.LEVELS) {
    for (const entry of level.entries) kinds.set(entry.kind, (kinds.get(entry.kind) ?? 0) + 1);
    console.log(
      `${level.id.padEnd(15)} name=${level.name.padEnd(6)} length=${String(level.scrollLength).padStart(5)}  ` +
        `speed=${String(level.scrollSpeed).padStart(5)}  blocks=${String(level.blocks.length).padStart(3)}  ` +
        `entries=${String(level.entries.length).padStart(4)}  boss=${level.boss.at}/${level.boss.health}  ` +
        `paths=${level.paths ? Object.keys(level.paths).join('+') : '-'}  backdrops=${level.backdrops?.length ?? 0}  ` +
        `landmarks=${level.landmarks?.length ?? 0}`,
    );
  }
  console.log(
    `\nevery kind placed, across all levels: ${[...kinds.entries()].map(([k, n]) => `${k}:${n}`).join(' ')}`,
  );
  // The ids have to be unique and in progression order -- the loader fails the import otherwise, so getting here at
  // all is the check; printing them makes the order visible.
  console.log(`order: ${levels.LEVELS.map((l) => l.id).join(' -> ')}`);
} finally {
  await server.close();
}
