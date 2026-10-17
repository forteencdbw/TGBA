// The volatile bubble's redesign, measured.
//
//   node scripts/probe-rage.mjs
//
// The form lost both of its buttons (a charge it aimed and a burst it pressed) and gained three passives: armour on a
// metronome, an attached burn, and a burst that fires when the gauge fills. What is worth asserting is the set of
// promises those three make:
//
//   - the plates arrive on the clock, stop at the cap, and are NOTHING on any other form;
//   - a contact with a plate is not a hit -- the creature takes the damage and the mark, and the player does not;
//   - a contact without one is exactly the hit it always was;
//   - the mark multiplies everything that lands, and expires;
//   - the burn ticks on its own clock, only inside its radius, and reads the mark;
//   - a full gauge fires the burst by itself and empties it;
//   - the form's four cards each move exactly one number, the two dangerous dials have their floor and cap, the cards
//     are offered only to this form, and a NEW run adopts the NEW form rather than the last one's.

import { resolve } from 'node:path';

const root = resolve(process.cwd());
const { createRequire } = await import('node:module');
const { pathToFileURL } = await import('node:url');
const require = createRequire(root + '/package.json');
const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });

let failures = 0;
function check(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`);
}
const round = (n) => Number(n.toFixed(3));

try {
  const R = await server.ssrLoadModule('/src/run.ts');
  const H = await server.ssrLoadModule('/src/hazards.ts');
  const B = await server.ssrLoadModule('/src/bubbleTypes.ts');
  const M = await server.ssrLoadModule('/src/mutations.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const armour = mech.angry.armour;
  const aura = mech.angry.aura;
  const LANE = 100;

  const input = () => ({
    sucking: false, charging: false, compressing: false, axisX: 0, axisY: 0,
    dragAimX: 0, dragAimY: 0, steering: false,
    consumeSpit: () => false, consumeChargeRelease: () => false, consumeBurst: () => false,
  });
  /** A run on the volatile form, standing still, in the middle of a level. */
  const rageRun = () => {
    const r = new R.Run();
    r.phase = 'playing';
    r.pickRoute('boil');
    r.rage.rage = 0;
    return r;
  };
  /** The hazard field's per-frame context, copied from what `Run` passes it. */
  const ctxFor = (r, over = {}) => ({
    min: r.player.y - 400, max: r.player.y + 400, laneWidth: LANE,
    playerX: r.player.x * LANE, playerY: r.player.y, playerRadiusFraction: 0.05,
    driftSpeed: 25, cameraRise: 0, elapsed: r.elapsed, invulnerable: false, struggling: false,
    playerVolume: r.player.volume, canSlam: r.hasArmour, canEat: () => false,
    suction: null, bubbles: r.field.bubbles, eatenBubbleIds: [], splitCount: 0,
    ...over,
  });

  // --- the plate clock -------------------------------------------------------------
  {
    const r = rageRun();
    const per = armour.secondsPerPlate;
    r.updateRage(per - 0.1, LANE);
    check('怒甲 · 差一点还没有', r.armourPlates, 0);
    r.updateRage(0.2, LANE);
    check('怒甲 · 到点给 1 个', r.armourPlates, 1);
    // The cap: run long enough for far more plates than it may hold.
    for (let i = 0; i < 40; i++) r.updateRage(per, LANE);
    check('怒甲 · 到上限就停', r.armourPlates, armour.max);
    check('怒甲 · 上限之上仍然是"有甲"', r.hasArmour, true);
  }
  {
    const r = new R.Run();
    r.phase = 'playing';
    for (let i = 0; i < 60; i++) r.updateRage(1, LANE);
    check('怒甲 · 别的形态一个也攒不到', [r.armourPlates, r.hasArmour], [0, false]);
  }

  // --- a contact with a plate is not a hit -----------------------------------------
  {
    const r = rageRun();
    r.armourPlates = 1;
    const h = r.hazards.spawnAt('fish', r.player.x * LANE, r.player.y, { deterministic: true });
    r.hazards.hazards.push(h);
    const effects = r.hazards.update(0.016, ctxFor(r));
    const slammed = effects.find((e) => e.slammed);
    check('接触 · 有怒甲时报告的是 slammed 而不是伤害', Boolean(slammed), true);
    check('接触 · 报告里带着那只怪的 id', slammed?.slammed?.id === h.id, true);
    check('接触 · 玩家这一帧不掉血', r.health, r.healthMax);

    // The same overlap with NO plate: the ordinary hit, unchanged.
    const r2 = rageRun();
    r2.armourPlates = 0;
    r2.hazards.hazards.push(r2.hazards.spawnAt('fish', r2.player.x * LANE, r2.player.y, { deterministic: true }));
    const plain = r2.hazards.update(0.016, ctxFor(r2));
    check('接触 · 没有怒甲时照旧挨打', plain.some((e) => (e.damage ?? 0) > 0), true);
    check('接触 · 而且没有 slam 事件', plain.some((e) => e.slammed), false);
  }

  // --- the mark -------------------------------------------------------------------
  {
    const r = rageRun();
    const h = r.hazards.hazards[r.hazards.hazards.push(r.hazards.spawnAt('fish', 0, 0, { deterministic: true })) - 1];
    check('破甲 · 没标记时伤害原样', H.vulnerableDamage(h, 4), 4);
    H.markVulnerable(h, armour.vulnerableSeconds);
    check('破甲 · 标记后乘上倍率', round(H.vulnerableDamage(h, 4)), round(4 * armour.vulnerableMultiplier));
    // It is a countdown on the field's own clock.
    const before = h.vulnerableLeft;
    for (let i = 0; i < 3; i++) r.hazards.update(1, ctxFor(r));
    check('破甲 · 记着剩余秒数', h.vulnerableLeft < before, true);
    r.hazards.update(armour.vulnerableSeconds + 1, ctxFor(r));
    check('破甲 · 到点就过期', round(H.vulnerableDamage(h, 4)), 4);
  }

  // --- the burn --------------------------------------------------------------------
  {
    const r = rageRun();
    const near = r.hazards.spawnAt('fish', r.player.x * LANE, r.player.y, { deterministic: true });
    const far = r.hazards.spawnAt('fish', r.player.x * LANE, r.player.y + 100000, { deterministic: true });
    r.hazards.hazards.push(near, far);
    const start = near.health;
    // One tick's worth, and a hair: the aura burns what is inside it.
    r.updateRage(aura.tickSeconds + 0.001, LANE);
    check('灼烧 · 光环里的掉血', near.health < start, true);
    check('灼烧 · 光环外的没动', far.health, far.maxHealth);
    const burned = round(start - near.health);
    check('灼烧 · 一跳就是配置的量', burned, round(aura.damagePerTick));
    // And a marked creature burns harder, because the mark multiplies ALL damage.
    H.markVulnerable(near, armour.vulnerableSeconds);
    const after = near.health;
    r.updateRage(aura.tickSeconds + 0.001, LANE);
    check('灼烧 · 破甲的烧得更疼', round(after - near.health), round(aura.damagePerTick * armour.vulnerableMultiplier));
  }
  {
    const r = new R.Run();
    r.phase = 'playing';
    const h = r.hazards.hazards[r.hazards.hazards.push(r.hazards.spawnAt('fish', r.player.x * LANE, r.player.y, { deterministic: true })) - 1];
    const start = h.health;
    r.updateRage(aura.tickSeconds * 4, LANE);
    check('灼烧 · 别的形态不烧', h.health, start);
  }

  // --- the burst fires itself -------------------------------------------------------
  {
    const r = rageRun();
    check('爆破 · 开始时没炸过', r.bursts, 0);
    r.rage.rage = mech.angry.rage.max;
    r.updateRage(0.016, LANE);
    check('爆破 · 满怒自动放一次', r.bursts, 1);
    check('爆破 · 并且把怒气花光', r.rage.rage, 0);
    // And it does not re-fire from an empty gauge on the next frame.
    r.updateRage(0.016, LANE);
    check('爆破 · 空槽不会再放', r.bursts, 1);
  }
  {
    const r = new R.Run();
    r.phase = 'playing';
    r.rage.rage = mech.angry.rage.max;
    r.updateRage(0.016, LANE);
    check('爆破 · 别的形态满怒也不炸', r.bursts, 0);
  }

  // --- the form itself --------------------------------------------------------------
  {
    const boil = B.findRoute('boil');
    const form = B.formForRoute(boil);
    check('形态 · 只剩技能钮（那三个动词各有别的去处）', [...form.controls], ['skill']);
  }

  // --- the deck: four cards, and what each one moves ---------------------------------
  //
  // The cards are thin -- each is one number in `applyMutationPassives` -- so what is worth asserting is the derived
  // value rather than the count. The floor and the cap are the two that can be got wrong silently: without the floor,
  // five picks put a plate at a third of the base interval; without the cap, 多存一层 eventually stops being a
  // resource. Both are measured here against the base config, so a retune of `angry.armour` moves the test with it.
  const rageRun2 = (picks = []) => {
    const r = new R.Run();
    r.phase = 'playing';
    r.pickRoute('boil');
    for (const id of picks) {
      const card = M.mutationCard(id);
      if (!card) throw new Error(`no card ${id}`);
      r.picks.push(id);
      r.mutations[id] = (r.mutations[id] ?? 0) + 1;
    }
    M.applyMutationPassives(r);
    return r;
  };
  const derived = (id, n) => rageRun2(Array(n).fill(id));

  {
    const ids = ['plateRate', 'plateMax', 'deeperBreak', 'hotBurn'];
    const cards = ids.map((id) => M.mutationCard(id));
    check('卡组 · 四张都在池子里', cards.map((c) => !!c), [true, true, true, true]);
    check('卡组 · 都只给沸腾', cards.map((c) => c.routes), ['boil', 'boil', 'boil', 'boil']);
    // No gate: this form ships holding the armour and the aura, so unlike the shotgun's follow-ups there is nothing to
    // wait for -- and a card drawn before the thing it changes exists is the one thing the pool must never hand out.
    check('卡组 · 没有前置条件', cards.map((c) => c.available(rageRun())), [true, true, true, true]);
    const boilOffered = new Set();
    for (let i = 0; i < 200; i++) for (const c of M.rollMutationChoices(rageRun2(), 3)) boilOffered.add(c.id);
    check('卡组 · 沸腾的池子真的会抽到它们', ids.filter((id) => boilOffered.has(id)).length, 4);
  }
  {
    // Only this form's own pool sees them: a barrage run must never be offered a card about plates.
    const r = new R.Run();
    r.phase = 'playing';
    r.pickRoute('barrage');
    M.applyMutationPassives(r);
    const offered = new Set();
    for (let i = 0; i < 400; i++) for (const c of M.rollMutationChoices(r, 3)) offered.add(c.id);
    const leaks = ['plateRate', 'plateMax', 'deeperBreak', 'hotBurn'].filter((id) => offered.has(id));
    check('卡组 · 弹幕局一张都抽不到', leaks, []);
  }
  {
    const pool = mech.mutation.pool.rage;
    const one = derived('plateRate', 1);
    const n = derived('plateRate', 12);
    check('怒甲更快 · 一张乘 (1 − 每张)', round(one.armourSecondsPerPlate), round(armour.secondsPerPlate * (1 - pool.plateSecondsPerPick)));
    check('怒甲更快 · 十二张撞到地板', round(n.armourSecondsPerPlate), round(armour.secondsPerPlate * pool.plateSecondsFloor));
    check('多存一层 · 一张 +1', derived('plateMax', 1).armourMax, armour.max + 1);
    check('多存一层 · 封顶', derived('plateMax', 40).armourMax, pool.plateMaxCap);
    check('破甲更深 · 加法不是乘法', round(derived('deeperBreak', 2).armourVulnerableMultiplier), round(armour.vulnerableMultiplier + pool.breakPerPick * 2));
    check('灼烧更烈 · 乘法', round(derived('hotBurn', 3).auraDamagePerTick), round(aura.damagePerTick * (1 + pool.burnRatePerPick * 3)));
  }
  {
    // The burn card has to reach the FIRE, not just the field: one tick on a boosted run burns for the sum.
    const r = rageRun2(['hotBurn', 'hotBurn']);
    const near = r.hazards.spawnAt('fish', r.player.x * LANE, r.player.y, { deterministic: true });
    r.hazards.hazards.push(near);
    const start = near.health;
    r.updateRage(aura.tickSeconds + 0.001, LANE);
    check('灼烧更烈 · 真的烧得更疼', round(start - near.health), round(aura.damagePerTick * (1 + mech.mutation.pool.rage.burnRatePerPick * 2)));
  }
  {
    // The plate card has to reach the METRONOME: at a moment the boosted run already has a plate, the base run has
    // none. The moment is picked from the two intervals rather than written down, so retuning either moves both.
    const boosted = rageRun2(['plateRate', 'plateRate']);
    const t = boosted.armourSecondsPerPlate + 0.001;
    boosted.updateRage(t, LANE);
    check('怒甲更快 · 节拍真的变快', boosted.armourPlates, 1);
    const base = rageRun();
    check('（对照）基准节拍在这一刻还短着', t < base.armourSecondsPerPlate, true);
    base.updateRage(t, LANE);
    check('（对照）所以还没攒出来', base.armourPlates, 0);
  }

  // --- a NEW run takes the NEW form --------------------------------------------------
  //
  // `pickRoute` refuses to act once a route is set (a carried run calls it again with the same id), so a fresh run has
  // to clear the form first. Without that the picker's answer sticks to the first run of the session and every run after
  // it silently keeps the last form -- which a page reload hides.
  {
    const r = new R.Run();
    r.phase = 'playing';
    r.pickRoute('boil');
    check('重开 · 第一局是沸腾', r.route, 'boil');
    r.forgetForm();
    r.pickRoute('barrage');
    check('重开 · 第二局换成弹幕', r.route, 'barrage');
    check('重开 · 形态也跟着换', r.bubbleType.id, 'barrage');
    check('重开 · 弹幕那一排枪又发了一次', r.gunStreams, 2);
  }

  // --- the curve arrives earlier than the old one ------------------------------------
  {
    check('曲线 · 首级纯时间线（秒）', round(mech.mutation.first / mech.mutation.autoPerSecond), 55);
  }

  // --- the plate is the only way through a wall no volume can -------------------------------------
  //
  // The other half of the deleted charge test. `封路木箱` is the one obstacle in the game that volume cannot open at any
  // size, and since the charge went, a plate is the ONLY way through it -- for any form. `breaksUnrammable` lives in the
  // config rather than on the form's descriptor because it is a question about the WALL (does this bubble get to ignore
  // masonry?), and setting it to false has to leave the bubble unable to open one.
  {
    const r = rageRun();
    r.armourPlates = 2;
    const wall = r.obstacles.spawn('wall', r.player.x * LANE, r.player.y);
    const alive = wall.health;
    const hits = r.stats.hits;
    r.resolveContacts(1 / 60, { laneWidth: LANE });
    // A ram is 2 points of damage against a 3-point wall: one plate is a LAYER, not the whole wall. That is the
    // difference between "the plate opens walls" and "the plate deletes walls", and it is worth pinning down.
    check('怒甲 · 一撞削掉一层', round(alive - wall.health), round(armour.obstacleDamage));
    check('怒甲 · 这一下花掉一个甲', r.armourPlates, 1);
    check('怒甲 · 撞击不算挨打', r.stats.hits, hits);
    // Second plate, same wall: now it goes.
    r.resolveContacts(1 / 60, { laneWidth: LANE });
    check('怒甲 · 第二撞撞开', r.obstacles.broken, 1);
    check('怒甲 · 又花掉一个甲', r.armourPlates, 0);
  }
  {
    const r = rageRun();
    const wall = r.obstacles.spawn('wall', r.player.x * LANE, r.player.y);
    const alive = wall.health;
    r.resolveContacts(1 / 60, { laneWidth: LANE });
    check('（对照）没有甲撞不动', [r.obstacles.broken, wall.health], [0, alive]);
  }

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await server.close();
}
