// Does a creature really TURN, or does its picture just flip?
//
// The turn is a single number between -1 and +1, and almost nothing about it is checkable by reading the code: that
// it starts where the picture already was rather than at +-1, that it passes through ZERO in the middle -- which is
// the edge-on frame the whole effect exists for -- that it lands exactly on the new facing, and that a turn
// interrupted halfway carries on from where it had got to instead of snapping. None of those are visible in a
// screenshot, so this probe reads the number at every step of the clock.
//
//   node scripts/probe-turn.mjs [tree]          # defaults to this checkout

import { resolve } from 'node:path';
const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`);
};
const near = (label, got, want, tol = 0.0005) => {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${got.toFixed(4)}${ok ? '' : ` (want ~${want.toFixed(4)})`}`);
};

/** The world's step, and the only clock this probe advances -- nothing here reads a wall clock. */
const DT = 1 / 120;

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const hz = await server.ssrLoadModule('/src/hazards.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const seconds = mech.hazardFacing.turnSeconds;
  /** How many frames a turn takes, which is what lets the samples below land on exact fractions of it. */
  const frames = Math.round(seconds / DT);

  console.log('--- the clock everything below is measured against ---');
  check('a turn lasts what the config says', seconds, 0.4);
  check('which is this many frames', frames, 48);

  /** A creature in the water. Only the painter ever spawns one with a facing, so this probe commits its own. */
  const fresh = () => new hz.HazardField().spawnAt('fish', 0, 0, { deterministic: true });

  /** A creature that has arrived looking left (no animation) and then turned, stepped `n` frames into the turn. */
  const turnedAfter = (n) => {
    const h = fresh();
    hz.commitFacing(h, -1);
    hz.commitFacing(h, 1);
    for (let i = 0; i < n; i++) hz.advanceTurn(h, DT);
    return h;
  };

  console.log('\n--- arriving is not a turn ---');
  {
    const h = fresh();
    hz.commitFacing(h, -1);
    check('the facing is committed', h.facing, -1);
    check('with no animation to sit through', h.turn, undefined);
    near('so the picture is there at once', hz.hazardMirror(h), -1);
  }

  console.log('\n--- the sweep ---');
  {
    const at = (fraction) => hz.hazardMirror(turnedAfter(frames * fraction));
    near('the frame it starts on is where the picture already was', at(0), -1);
    near('a quarter of the way round', at(0.25), -Math.cos(Math.PI * 0.25));
    /**
     * THE ONE NUMBER THE WHOLE EFFECT IS FOR.
     *
     * Halfway through, the mirror is exactly zero -- the sprite is scaled to nothing and the creature is drawn as a
     * line. If this ever stops being zero, "正面 -> 侧成一条竖线 -> 反面" has quietly become "正面 -> 反面", and every
     * other check here would still pass.
     */
    near('halfway round it is a LINE', at(0.5), 0);
    near('three quarters of the way round', at(0.75), -Math.cos(Math.PI * 0.75));
    const done = turnedAfter(frames);
    near('and it lands exactly on the new facing', hz.hazardMirror(done), 1);
    check('with nothing left running', done.turn, undefined);
    near('and it stays there', hz.hazardMirror(turnedAfter(frames * 3)), 1);
  }

  console.log('\n--- it does not jump ---');
  {
    const h = turnedAfter(Math.round(frames / 4));
    const drawn = hz.hazardMirror(h);
    check('the first turn really is part-way through', Math.abs(drawn) > 0.5, true);
    // Turn back, with the first turn still in flight.
    hz.commitFacing(h, -1);
    near('the picture does not jump', hz.hazardMirror(h), drawn);
    near('because the new turn starts from the value being DRAWN', h.turn.from, drawn);
    for (let i = 0; i < frames; i++) hz.advanceTurn(h, DT);
    near('and it still lands where it was told to', hz.hazardMirror(h), -1);
  }

  console.log('\n--- zero means no animation at all ---');
  {
    const real = mech.hazardFacing.turnSeconds;
    mech.hazardFacing.turnSeconds = 0;
    try {
      const h = fresh();
      hz.commitFacing(h, -1);
      hz.commitFacing(h, 1);
      check('the facing still changes', h.facing, 1);
      check('with nothing running', h.turn, undefined);
      near('and the picture is round at once', hz.hazardMirror(h), 1);
    } finally {
      mech.hazardFacing.turnSeconds = real;
    }
  }
} finally {
  await server.close();
}

console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
