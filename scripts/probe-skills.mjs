// What does each skill actually do?
//
// `Game.useSkill` was a private method on `Game`, so "does the vortex pull collectables in" could only be answered by
// throwing one in a real run. The verb lives with the skill table now and takes the water it acts on, so each skill's
// row can be driven on its own.
//
//   node scripts/probe-skills.mjs [tree]            # defaults to this checkout

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
const round = (n) => Number(n.toFixed(3));

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { useSkill, SKILLS, activationFor } = await server.ssrLoadModule('/src/skills.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { Player } = await server.ssrLoadModule('/src/player.ts');
  const { EntityField } = await server.ssrLoadModule('/src/entities.ts');

  const LANE = 100;
  const world = (over = {}) => {
    const hazards = new HazardField();
    const field = new EntityField();
    const player = new Player();
    player.x = 0.5;
    player.y = 100;
    return {
      player,
      hazards,
      bubbles: field.bubbles,
      carried: { id: 'dash', uses: 3 },
      laneWidth: LANE,
      elapsed: 10,
      events: [],
      ...over,
    };
  };
  const creature = (w, kind, x, y) => {
    const h = w.hazards.spawnAt(kind, x, y, { deterministic: true });
    h.gripping = kind === 'trash';
    w.hazards.hazards.push(h);
    return h;
  };

  // No skill, or none left, is NOT "used with no effect" -- the caller has to be able to tell.
  check('nothing carried · null', useSkill(world({ carried: null })), null);
  check('spent · null', useSkill(world({ carried: { id: 'dash', uses: 0 } })), null);

  // Every skill spends exactly one use, and says so.
  {
    const w = world();
    const used = useSkill(w);
    check('a use is spent', [used.usesLeft, w.carried.uses], [2, 2]);
    check('and it made a sound', w.events.map((e) => e.event), ['skill']);
  }

  // Each skill's row, driven on its own: the activation the table declares is what happens.
  {
    const w = world({ carried: { id: 'dash', uses: 1 } });
    const dash = activationFor('dash');
    const used = useSkill(w);
    check('dash · a timed skill is put on the player clock', [w.player.skillId, round(w.player.skillRemaining)], ['dash', round(SKILLS.find((s) => s.id === 'dash').durationSeconds)]);
    check('dash · the ascent bonus its row declares', w.player.skillAscentBonus, dash.ascentMultiplier);
    check('dash · spent, so the run clears the slot', used.usesLeft, 0);
  }

  // ClearsSlow: the stink cloud breaks a grip and wipes the penalty.
  {
    const cloud = SKILLS.find((s) => activationFor(s.id).clearsSlow);
    if (!cloud) {
      console.log('skip clearsSlow · no skill clears a slow');
    } else {
      const w = world({ carried: { id: cloud.id, uses: 1 } });
      const grabbed = creature(w, 'trash', 50, 100);
      w.player.slowRemaining = 3;
      w.player.slowFactor = 0.4;
      useSkill(w);
      check(`${cloud.id} · grip broken`, grabbed.gripping, false);
      check(`${cloud.id} · slow cleared`, [w.player.slowRemaining, w.player.slowFactor], [0, 1]);
    }
  }

  // Push: hazards of the listed kinds move outward, others do not, and the far one does not.
  {
    const pusher = SKILLS.find((s) => activationFor(s.id).pushRadius);
    if (!pusher) {
      console.log('skip push · no skill pushes');
    } else {
      const act = activationFor(pusher.id);
      const w = world({ carried: { id: pusher.id, uses: 1 } });
      const kind = act.pushKinds[0];
      const other = SKILLS.length ? ['fish', 'jelly', 'crab', 'urchin'].find((k) => !act.pushKinds.includes(k)) : null;
      const near = creature(w, kind, 55, 105);
      const far = creature(w, kind, 55 + (act.pushRadius ?? 0) * 2, 100);
      const untouched = other ? creature(w, other, 55, 105) : null;
      const farBefore = [far.x, far.y];
      const gap = (h) => Math.hypot(h.x - w.player.x * LANE, h.y - w.player.y);
      const was = gap(near);
      useSkill(w);
      check(`${pusher.id} · the listed kind is pushed AWAY`, gap(near) > was, true);
      check(`${pusher.id} · beyond the radius is left alone`, [far.x, far.y], farBefore);
      if (untouched) check(`${pusher.id} · an unlisted kind is left alone`, [untouched.x, untouched.y], [55, 105]);
    }
  }

  // Vortex: collectables inside the radius are drawn toward the player, and one outside is not.
  {
    const vortex = SKILLS.find((s) => activationFor(s.id).vortexRadius);
    if (!vortex) {
      console.log('skip vortex · no skill vortexes');
    } else {
      const act = activationFor(vortex.id);
      const w = world({ carried: { id: vortex.id, uses: 1 } });
      const near = { x: 50 + (act.vortexRadius ?? 0) * 0.5, y: 100, id: 1, radius: 0.05, volume: 1 };
      const far = { x: 50 + (act.vortexRadius ?? 0) * 3, y: 100, id: 2, radius: 0.05, volume: 1 };
      w.bubbles.push(near, far);
      const farBefore = far.x;
      const gapBefore = near.x - w.player.x * LANE;
      useSkill(w);
      check(`${vortex.id} · a collectable inside is pulled in`, [near.x < gapBefore + 50, round(near.x - (gapBefore + 50)) < 0], [true, true]);
      check(`${vortex.id} · one outside is left alone`, far.x, farBefore);
    }
  }

  // Decoy: fish within the radius are baited and pushed no higher than the bait; a jelly is not.
  {
    const decoy = SKILLS.find((s) => activationFor(s.id).decoyRadius);
    if (!decoy) {
      console.log('skip decoy · no skill decoys');
    } else {
      const act = activationFor(decoy.id);
      const w = world({ carried: { id: decoy.id, uses: 1 } });
      const fish = creature(w, 'fish', 52, 100);
      const jelly = creature(w, 'jelly', 52, 100);
      const used = useSkill(w);
      check(`${decoy.id} · the fish is baited past the run's clock`, [fish.baitedUntil > w.elapsed, jelly.baitedUntil], [true, 0]);
      check(`${decoy.id} · the fish is held below the bait`, fish.y <= used.decoy.y, true);
      check(`${decoy.id} · the run is told where the bait is`, [used.decoy.x, used.decoy.until], [w.player.x * LANE, w.elapsed + (act.decoySeconds ?? 0)]);
    }
  }

  // Invulnerability is REPORTED, not applied: the run takes the max of it and what it has left.
  {
    const shield = SKILLS.find((s) => activationFor(s.id).invulnerableSeconds);
    if (!shield) {
      console.log('skip invulnerable · no skill grants it');
    } else {
      const w = world({ carried: { id: shield.id, uses: 1 } });
      const used = useSkill(w);
      check(`${shield.id} · reports the seconds`, used.invulnerableSeconds, activationFor(shield.id).invulnerableSeconds);
    }
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
