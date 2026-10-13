// Does a placed entry arrive where the level asked for it?
//
// `placeEntry` used to be a method on `Game`, so this could only be asked by playing the game: it needs a canvas. It
// takes data now, so a probe can hand it a view and four fields and read what happened.
//
//   node scripts/probe-placement.mjs [tree]          # defaults to this checkout
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

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { placeEntry } = await server.ssrLoadModule('/src/placement.ts');
  const { EntityField } = await server.ssrLoadModule('/src/entities.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const { LEVEL } = await server.ssrLoadModule('/src/levels.ts');

  const LANE = 100;
  const VIEW = { min: 0, max: 800 };
  const world = () => ({
    field: new EntityField(),
    obstacles: new ObstacleField(),
    hazards: new HazardField(),
    playerRadiusFraction: 0.08,
  });
  const place = (entry, y, w = world()) => ({ record: placeEntry(entry, y, VIEW, LANE, w), w });

  const off = LANE * mech.spawning.offscreenMarginRatio;
  const bottom = LANE * mech.spawning.bottomMarginRatio;

  // A creature from the top is at the authored x, carried down by the current.
  {
    const { record, w } = place({ kind: 'fish', x: 0.5 }, 750);
    check('top · record', [record.from, record.x, record.worldY, record.visibleTop, record.visibleBottom], ['top', 50, 750, 800, 0]);
    check('top · one creature, at the authored place', [w.hazards.hazards.length, w.hazards.hazards[0].x, w.hazards.hazards[0].y], [1, 50, 750]);
    check('top · not entering', w.hazards.hazards[0].entry, null);
  }

  // A side arrival is placed OFF the lane, at the authored height, and is told it is arriving.
  for (const side of ['left', 'right']) {
    const { record, w } = place({ kind: 'fish', x: 0.5, from: side }, 750);
    const wantX = side === 'left' ? -off : LANE + off;
    check(`${side} · off the lane`, [record.from, Number(record.x.toFixed(3))], [side, Number(wantX.toFixed(3))]);
    check(`${side} · entering from that side`, [w.hazards.hazards[0].entry?.from, w.hazards.hazards[0].x], [side, wantX]);
  }

  // A bottom arrival is below the view and swims up.
  {
    const { record, w } = place({ kind: 'jelly', x: 0.25, from: 'bottom' }, 750);
    check('bottom · below the view', [record.from, record.worldY], ['bottom', Number((VIEW.min - bottom).toFixed(1))]);
    check('bottom · entry state', w.hazards.hazards[0].entry?.from, 'bottom');
  }

  // An authored depth decides the height a side arrival appears at; the default does when it is absent.
  {
    const authored = place({ kind: 'fish', x: 0.5, from: 'left', depth: 0.75 }).w.hazards.hazards[0].y;
    const dflt = place({ kind: 'fish', x: 0.5, from: 'left' }).w.hazards.hazards[0].y;
    check('left · authored depth', Number(authored.toFixed(1)), Number((VIEW.min + 0.75 * 800).toFixed(1)));
    check('left · default depth', Number(dflt.toFixed(1)), Number((VIEW.min + mech.spawning.entryDepth * 800).toFixed(1)));
  }

  // Collectables go to the shared field, not to the hazards.
  {
    const { w } = place({ kind: 'bubble', x: 0.4 }, 700);
    check('bubble · into the field', [w.field.bubbles.length, w.hazards.hazards.length], [1, 0]);
  }

  // Scenery is an obstacle, asked of the list rather than enumerated by kind.
  {
    const { w } = place({ kind: 'crate', x: 0.3 }, 700);
    check('obstacle · into the obstacles, not the creatures', [w.obstacles.obstacles.length, w.hazards.hazards.length], [1, 0]);
  }

  // A creature on an authored spline carries it, anchored where it spawned, pre-advanced by its offset.
  {
    const name = Object.keys(LEVEL.paths ?? {})[0];
    if (!name) {
      console.log('skip path · this level has no paths');
    } else {
      const { w } = place({ kind: 'fish', x: 0.5, path: name, pathDelaySeconds: 0.5 }, 750);
      const h = w.hazards.hazards[0];
      const spec = LEVEL.paths[name];
      check('path · anchored at the spawn', [h.path?.startX, h.path?.startY, h.path?.points.length], [50, 750, spec.points.length]);
      // WAITING, not advanced: a member of a string that has not set off yet holds a negative clock, which the
      // path reader clamps to the head of the curve. See `LevelEntry.pathDelaySeconds`.
      check('path · waits at the head for its turn', Number(h.path?.elapsed.toFixed(3)), -0.5);
      check('path · seconds from the level', h.path?.seconds, spec.seconds);
    }
  }

  // A top entry with an x outside the lane is clamped INTO it; an arriving one is deliberately left outside.
  {
    const clamped = place({ kind: 'fish', x: 1.6 }, 700).w.hazards.hazards[0].x;
    const arriving = place({ kind: 'fish', x: 1.6, from: 'right' }, 700).w.hazards.hazards[0].x;
    check('top · clamped into the lane', clamped, LANE);
    check('right · left outside the lane', arriving, LANE + off);
  }

  /**
   * A VENT is placed from its WALL, and its plume's direction comes from the same fact.
   *
   * Three things have to hold at once, and the third is the one that would rot silently: the rock's position must be
   * derived from `side` (so an authored `x` cannot move it into the middle of the lane), the direction must point
   * AWAY from that wall (or a right-hand vent fires into the rock), and the length must be the one for that AIM
   * rather than a single shared number.
   */
  {
    const base = mech.hazards.vent.baseRadiusRatio * LANE;
    for (const side of ['left', 'right']) {
      const { w } = place({ kind: 'vent', side, aim: 'up' }, 700);
      const h = w.hazards.hazards[0];
      const wantX = side === 'left' ? base : LANE - base;
      check(`vent ${side} · 贴在自己那面墙上`, [Number(h.x.toFixed(3)), Number(h.vent.aimX.toFixed(3)) > 0], [Number(wantX.toFixed(3)), side === 'left']);
      check(`vent ${side} · 朝向朝泳道里（不是墙里）`, [h.vent.aimX > 0, h.vent.aimY > 0], [side === 'left', true]);
    }
    // 一个写了 `x` 的火山：x 不参与，位置仍然由 side 决定。
    const withX = place({ kind: 'vent', side: 'left', aim: 'flat', x: 0.9 }, 700).w.hazards.hazards[0];
    check('vent · 关卡写的 x 不参与（位置仍由 side 决定）', Number(withX.x.toFixed(3)), Number(base.toFixed(3)));
    // 长度按朝向取，共用一个值的话横向就横贯不了。
    const aims = ['up', 'flat', 'down'].map((aim) => place({ kind: 'vent', side: 'left', aim }, 700).w.hazards.hazards[0].vent.lengthRatio);
    check('vent · 长度按朝向取', aims, [mech.hazards.vent.jetLengthRatio.up, mech.hazards.vent.jetLengthRatio.flat, mech.hazards.vent.jetLengthRatio.down]);
    check('vent · 横向确实横贯整条泳道', mech.hazards.vent.jetLengthRatio.flat >= 1, true);
  }

  /**
   * And the level file actually uses those keys.
   *
   * The loader is what makes "a vent in the middle of the lane" unrepresentable, so this drives the REAL first level
   * through `placeEntry` rather than a hand-written entry: a `side` that never reached the water would pass every
   * check above and still leave the campaign's first vent wherever the default put it.
   */
  {
    const vents = LEVEL.entries.filter((e) => e.kind === 'vent');
    check('第一关 · 火山都在墙上', vents.every((e) => e.side === 'left' || e.side === 'right'), true);
    check('第一关 · 火山都没写 x 的位置依赖', vents.every((e) => e.side !== undefined), true);
    const aims = vents.map((e) => e.aim);
    for (const aim of ['up', 'flat', 'down']) {
      check(`第一关 · 三种朝向都出现过：${aim}`, aims.includes(aim), true);
    }
    const placed = vents.map((e) => place(e, 700).w.hazards.hazards[0]);
    const base = mech.hazards.vent.baseRadiusRatio * LANE;
    check('第一关 · 每一个都落在墙上（没有落在泳道中间的）', placed.every((h) => Math.abs(h.x - base) < 1e-6 || Math.abs(h.x - (LANE - base)) < 1e-6), true);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
} finally {
  await server.close();
}
