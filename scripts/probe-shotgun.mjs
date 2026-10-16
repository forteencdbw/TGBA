// The shotgun branch, measured: what one trigger pull produces, with and without the card.
//
//   node scripts/probe-shotgun.mjs
//
// No browser and no `Game`: the bullet field's input is a plain object and its output is a list of rounds, so both
// sides of the seam are values. What is worth asserting here is arithmetic that prose gets wrong easily:
//
//   - the transform is a FAN of ordinary rounds, not a different round: same damage each, one per pellet;
//   - the cone is the configured total, so N pellets sit at the edges of it and none outside;
//   - without the card the gun is EXACTLY what it was (one pellet, no angle), which is the promise the whole branch
//     rests on -- a run that never sees a shotgun must not pay for its geometry;
//   - the archetype's arithmetic: all pellets landed at arm's length is a multiple of the old damage per pull, and a
//     target far enough away is inside one pellet's path instead of four.

import { resolve } from 'node:path';

const root = resolve(process.cwd());
const { createRequire } = await import('node:module');
const { pathToFileURL } = await import('node:url');
const require = createRequire(root + '/package.json');
const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
}

/** A hazard field that only says yes: everything in it is shootable and nothing moves. */
function stubHazards(at) {
  const hits = [];
  return {
    hits,
    hazards: at,
    hit(hazard, damage, impact) {
      hits.push({ kind: hazard.kind, damage, knockScale: impact?.knockScale ?? 1 });
      return 'damaged';
    },
  };
}

try {
  const B = await server.ssrLoadModule('/src/bullets.ts');
  const M = await server.ssrLoadModule('/src/mechanisms.ts');
  const mech = M.mech;
  const sg = mech.mutation.pool.shotgun;
  const laneWidth = 361;

  const field = new B.BulletField();
  const hazards = stubHazards([]);
  const ctx = (over) => ({
    min: 0,
    max: 1e6,
    laneWidth,
    cameraRise: 0,
    muzzles: [{ x: laneWidth * 0.5, y: 0 }],
    armed: true,
    perSecond: 2,
    damage: mech.bullets.damage,
    sizeDamageRate: 0,
    speedDamageRate: 0,
    speedMultiplier: 1,
    radiusMultiplier: 1,
    lifeMultiplier: 1,
    playerY: 0,
    homingChance: 0,
    random: () => 1,
    hazards,
    obstacles: { blocks: () => false },
    pellets: 1,
    spreadDegrees: 0,
    closeRangeMeters: sg.closeRangeMeters,
    closeDamageRate: 0,
    knockbackScale: 1,
    ...over,
  });

  // --- without the card: exactly the gun that was there before --------------------------------
  field.reset();
  field.update(0.0001, ctx({}));
  check('普通枪：一次一枪只有 1 颗', field.bullets.length === 1, `got ${field.bullets.length}`);
  check('普通枪：没有角度（直线）', field.bullets.every((b) => b.angle === undefined));

  // --- with the card -------------------------------------------------------------------------
  const pellets = 1 + sg.pellets;
  field.reset();
  field.update(0.0001, ctx({ pellets, spreadDegrees: sg.totalSpreadDegrees, perSecond: 2 * sg.rateScale }));
  const volley = field.bullets.slice(0, pellets);
  check(`霰弹：一次 ${pellets} 颗`, volley.length === pellets, `got ${volley.length}`);
  const degs = volley.map((b) => ((b.angle ?? 0) * 180) / Math.PI).sort((a, b) => a - b);
  const half = sg.totalSpreadDegrees / 2;
  check('霰弹：最外两颗正好在张角边缘', Math.abs(degs[0] + half) < 1e-6 && Math.abs(degs[degs.length - 1] - half) < 1e-6, degs.map((d) => d.toFixed(2)).join(', '));
  check('霰弹：没有一颗飞出张角', degs.every((d) => Math.abs(d) <= half + 1e-6));
  check('霰弹：均分（相邻间隔相等）', degs.every((d, i) => i === 0 || Math.abs(d - degs[i - 1] - sg.totalSpreadDegrees / (pellets - 1)) < 1e-6));
  check('霰弹：每颗都是普通弹（同样的伤害来源）', typeof field.bullets[0].age === 'number' && field.bullets[0].angle !== undefined);

  // --- the geometry: pellets diverge, so range decides how many land ---------------------------
  // Fly the volley up the lane and measure how wide it has become.
  const widthAfter = (seconds) => {
    field.reset();
    field.update(0.0001, ctx({ pellets, spreadDegrees: sg.totalSpreadDegrees }));
    for (let t = 0; t < seconds; t += 0.1) field.update(0.1, ctx({ pellets, spreadDegrees: sg.totalSpreadDegrees, armed: false }));
    const xs = field.bullets.map((b) => b.x);
    return Math.max(...xs) - Math.min(...xs);
  };
  const near = widthAfter(0.5);
  const far = widthAfter(2.0);
  check('几何：弹丸越飞越散', far > near * 2, `0.5s ≈ ${near.toFixed(1)}m, 2s ≈ ${far.toFixed(1)}m`);

  /**
   * How many of the four are inside a creature's box when it arrives.
   *
   * Counted by ANGLE rather than by array index, because the field removes expired rounds from the end of its list
   * and an index would then mean a different pellet from frame to frame -- four angles are four identities, which is
   * one of the few places the shotgun's fan is easier to measure than a single round.
   *
   * A fish is about 0.035 of the lane across, so a pellet is "on it" when it is inside that box at the moment the
   * creature is at the same height.
   */
  const landed = (gap) => {
    const angles = new Set();
    field.reset();
    field.update(0.0001, ctx({ pellets, spreadDegrees: sg.totalSpreadDegrees, armed: true }));
    const half = laneWidth * 0.035;
    for (let t = 0; t < 2.2; t += 0.005) {
      field.update(0.005, ctx({ pellets, spreadDegrees: sg.totalSpreadDegrees, armed: false }));
      for (const b of field.bullets) {
        // The pellet's own radius counts: the field's test is 'within reach of the box', and a round is a
        // swelling ball, not a point. Leaving it out undercounts the volley by a few metres of reach.
        const reach = half + B.radiusOf(b, laneWidth, 1);
        if (Math.abs(b.y - gap) <= reach && Math.abs(b.x - laneWidth * 0.5) <= reach) angles.add(b.angle);
      }
    }
    return angles.size;
  };
  const closeIn = landed(120);
  const farOff = landed(1600);
  check('几何：贴脸四颗全中', closeIn === pellets, `120m 处中 ${closeIn}/${pellets}`);
  check('几何：远了只中一两颗', farOff < closeIn, `1600m 处中 ${farOff}/${pellets}`);
  check('算术：贴脸的瞬间伤害是一枪的整把', closeIn === pellets && pellets === 1 + sg.pellets);

  /**
   * The ladder, which is the whole design in one table: how many of the pellets are on a creature at each distance.
   *
   * This is why the cone is the number it is. A fish is 0.035 of the lane across and the pellets diverge in
   * proportion to the distance travelled, so the count falls off once the fan is wider than the target -- and what
   * matters is WHERE that happens relative to the range a fight actually uses. A twenty-degree cone loses half its
   * pellets by 120m and all of them by 300m, which is most of the game's shooting; the configured one is meant to
   * keep the full volley while the creature is close and still land a couple of pellets at the range the lane is
   * usually fought at.
   */
  console.log('\n  距离   命中');
  const ladder = [60, 120, 200, 300, 450, 700, 1000].map((gap) => ({ gap, n: landed(gap) }));
  for (const { gap, n } of ladder) {
    console.log(`  ${String(gap).padStart(4)}m  ${'■'.repeat(n).padEnd(pellets, '·')} ${n}/${pellets}`);
  }
  /**
   * The three rungs the cone was CHOSEN for, asserted rather than printed.
   *
   * A printed table documents; an assertion is what stops the next person from widening the cone to make the fan look
   * better. Each rung is a claim about how the branch plays: full damage while a creature is on top of you, break-even
   * at the range the lane is normally fought at, and nothing at all beyond it.
   */
  const at = (gap) => ladder.find((r) => r.gap === gap)?.n ?? -1;
  check('阶梯：贴脸（120m 内）四颗全中', at(120) === pellets, `${at(60)}/${pellets} @60m`);
  check('阶梯：中距离（300-450m）中两颗——正好和现在打平', at(300) === 2 && at(450) === 2, `${at(300)}, ${at(450)}`);
  check('阶梯：700m 外一颗不中（霰弹逼你逼近）', at(700) <= 1, String(at(700)));

  // --- the derived numbers, which is where the branch actually lives ---------------------------
  // The cards are counted in `run.mutations` and folded in by `applyMutationPassives`; the transform is the `picks`
  // entry. Driving that directly is the only way to assert the branch's arithmetic without a card draw.
  const R = await server.ssrLoadModule('/src/run.ts');
  const MU = await server.ssrLoadModule('/src/mutations.ts');
  const derived = (picks, counts) => {
    const run = new R.Run();
    run.picks.push(...picks);
    Object.assign(run.mutations, counts);
    MU.applyMutationPassives(run);
    return run;
  };
  const plain = derived([], {});
  check('没拿卡：枪还是原来那把', plain.gunPellets === 1 && plain.gunSpreadDegrees === 0 && plain.gunRateScale === 1 && plain.bulletKnockbackScale === 1 && plain.bulletCloseDamageRate === 0);

  const justTransform = derived(['shotgun'], {});
  check('转型卡：射速 ×0.5', justTransform.gunRateScale === sg.rateScale, String(justTransform.gunRateScale));
  check('转型卡：一枪 4 颗', justTransform.gunPellets === 1 + sg.pellets, String(justTransform.gunPellets));
  check('转型卡：张角 = 配置的总张角', justTransform.gunSpreadDegrees === sg.totalSpreadDegrees, String(justTransform.gunSpreadDegrees));
  check('转型卡：不白送伤害和击退', justTransform.bulletCloseDamageRate === 0 && justTransform.bulletKnockbackScale === 1);

  const stacked = derived(['shotgun'], { pellets: 2, closeDamage: 2, narrow: 2, knock: 2 });
  check('多一发 ×2：一枪 6 颗', stacked.gunPellets === 1 + sg.pellets + 2 * sg.pelletsPerPick, String(stacked.gunPellets));
  check('抵近射击 ×2：+70%', Math.abs(stacked.bulletCloseDamageRate - 0.7) < 1e-9, String(stacked.bulletCloseDamageRate));
  check('顶开 ×2：击退 ×2', Math.abs(stacked.bulletKnockbackScale - 2) < 1e-9, String(stacked.bulletKnockbackScale));
  check('收束 ×2：张角 × 0.75²', Math.abs(stacked.gunSpreadDegrees - sg.totalSpreadDegrees * 0.5625) < 1e-9, String(stacked.gunSpreadDegrees));

  const floorish = derived(['shotgun'], { narrow: 10 });
  check('收束有地板：张角不会缩到 0', floorish.gunSpreadDegrees === sg.totalSpreadDegrees * sg.narrowFloor, String(floorish.gunSpreadDegrees));

  console.log(`\n配置读数：射速 ×${sg.rateScale}、每排 +${sg.pellets} 颗（共 ${pellets}）、总张角 ${sg.totalSpreadDegrees}°、` +
    `抵近 ${sg.closeRangeMeters}m 内每张 +${Math.round(sg.closeDamagePerPick * 100)}%、收束每张 −${Math.round(sg.narrowPerPick * 100)}%（地板 ${sg.narrowFloor}）、顶开每张 +${Math.round(sg.knockbackPerPick * 100)}%`);
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await server.close();
}
