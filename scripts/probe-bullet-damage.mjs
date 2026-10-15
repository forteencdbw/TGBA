// 「越大伤害越高」「越快伤害越高」两张卡到底改了什么？
//
// 用真实模块跑：给一颗子弹预设 age，让它落在怪物身上，读它实际打掉多少。这样验的是**公式**
// 而不是我对公式的记忆——包括"没有卡的时候，伤害必须和以前一模一样"这条。
//
//   node scripts/probe-bullet-damage.mjs
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
const round = (n) => Number(n.toFixed(4));

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { BulletField } = await server.ssrLoadModule('/src/bullets.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const LANE = 100;
  const BASE_DAMAGE = 5;
  /** One simulation step. `update` ages a round BEFORE it resolves the hit, so a round pushed at age `a` lands at `a + STEP`. */
  const STEP = 1 / 120;

  /**
   * A bare scene: the two fields a round can meet, and nothing alive.
   *
   * Factored out of `damageAtAge` so the scenery checks below -- which are about a round being STOPPED rather than
   * about how hard it lands -- can build the same world without a fish in it. The context is the same object the game
   * hands over, filled in from the config rather than from any one test.
   */
  const scene = (over = {}) => {
    const hazards = new HazardField();
    const obstacles = new ObstacleField();
    const field = new BulletField();
    const ctx = {
      min: 0,
      max: 800,
      laneWidth: LANE,
      cameraRise: 0,
      muzzles: [],
      armed: false,
      perSecond: 0,
      damage: BASE_DAMAGE,
      sizeDamageRate: 0,
      speedDamageRate: 0,
      speedMultiplier: 1,
      radiusMultiplier: 1,
      lifeMultiplier: 1,
      hazards,
      obstacles,
      ...over,
    };
    return { hazards, obstacles, field, ctx };
  };

  /** A fish with enough health to survive the test, at a chosen spot. */
  const fishAt = (s, x, y) => {
    const fish = s.hazards.spawnAt('fish', x, y, { deterministic: true });
    fish.maxHealth = 100000; // it must not flee mid-test
    s.hazards.hazards.push(fish);
    return fish;
  };

  /**
   * Fire one round with a chosen AGE straight into a fish, and report what came off it.
   *
   * Age is set rather than waited for, because a probe that has to fly a round across the screen for two seconds is a
   * probe whose failure could be the speed curve instead of the formula.
   */
  const damageAtAge = (age, over = {}) => {
    const s = scene(over);
    const fish = fishAt(s, LANE / 2, 300);
    // Just below the fish, so one step puts it in reach whatever the radius is.
    s.field.bullets.push({ x: fish.x, y: fish.y - 0.001, age });
    return s.field.update(STEP, s.ctx).struck[0]?.amount ?? null;
  };

  const cfg = mech.bullets;
  // Age the round is at when it lands, which is one step past the age it was pushed with.
  const landedAt = (age) => age + STEP;
  const growthAt = (age) =>
    (cfg.radiusRatio + cfg.radiusGrowthPerSecond * landedAt(age)) / cfg.radiusRatio;
  console.log(
    `config: radiusRatio=${cfg.radiusRatio} radiusGrowthPerSecond=${cfg.radiusGrowthPerSecond} ` +
      `lifeSeconds=${cfg.lifeSeconds} sizeDamagePerPick=${mech.mutation.pool.sizeDamagePerPick} ` +
      `speedDamagePerPick=${mech.mutation.pool.speedDamagePerPick}\n`,
  );

  // 1. The default is untouched. A run that takes neither card must be indistinguishable from before this change.
  {
    const at = [0, 1, cfg.lifeSeconds].map((a) => [a, round(damageAtAge(a))]);
    check('no cards · same damage at every age', at.map(([, d]) => d), at.map(() => BASE_DAMAGE));
  }

  // 2. 「越大伤害越高」 pays for AGE, and for nothing else.
  {
    const rate = mech.mutation.pool.sizeDamagePerPick;
    const ages = [0, 1, cfg.lifeSeconds];
    for (const a of ages) {
      const want = round(BASE_DAMAGE * (1 + rate * (growthAt(a) - 1)));
      check(`越大伤害越高 · ${a}s`, round(damageAtAge(a, { sizeDamageRate: rate })), want);
    }
    const d0 = damageAtAge(0, { sizeDamageRate: rate });
    const dEnd = damageAtAge(cfg.lifeSeconds, { sizeDamageRate: rate });
    console.log(`     → 刚出膛 ${round(d0)} → 寿命尽头 ${round(dEnd)}（${round(dEnd / d0)} 倍）`);
  }

  // 3. The size card is a RANGE card: 「大弹丸」 must not feed it, because the radius multiplier cancels in the ratio.
  {
    const rate = mech.mutation.pool.sizeDamagePerPick;
    const plain = round(damageAtAge(1, { sizeDamageRate: rate }));
    const fat = round(damageAtAge(1, { sizeDamageRate: rate, radiusMultiplier: 3 }));
    check('越大伤害越高 · 大弹丸不喂它（倍率约掉）', fat, plain);
  }

  // 4. 「越快伤害越高」 pays for the SPEED BONUS, not for the round's own age.
  {
    const rate = mech.mutation.pool.speedDamagePerPick;
    for (const mult of [1.25, 2.0]) {
      const want = round(BASE_DAMAGE * (1 + rate * (mult - 1)));
      check(`越快伤害越高 · 弹速倍率 ${mult}`, round(damageAtAge(1, { speedDamageRate: rate, speedMultiplier: mult })), want);
    }
    // And it does NOT care how long the round has been flying.
    const a = round(damageAtAge(0, { speedDamageRate: rate, speedMultiplier: 2 }));
    const b = round(damageAtAge(cfg.lifeSeconds, { speedDamageRate: rate, speedMultiplier: 2 }));
    check('越快伤害越高 · 与飞行时间无关', a, b);
  }

  // 5. Both cards together MULTIPLY.
  {
    const sr = mech.mutation.pool.sizeDamagePerPick;
    const pr = mech.mutation.pool.speedDamagePerPick;
    const mult = 2;
    const want = round(BASE_DAMAGE * (1 + sr * (growthAt(1) - 1)) * (1 + pr * (mult - 1)));
    check('两张一起 · 乘算', round(damageAtAge(1, { sizeDamageRate: sr, speedDamageRate: pr, speedMultiplier: mult })), want);
  }

  // 6. A negative rate is a legal config now, and it must not become a damage PENALTY.
  {
    check('负重率 · 不是惩罚', round(damageAtAge(cfg.lifeSeconds, { sizeDamageRate: -1 })), BASE_DAMAGE);
    check('负弹速倍率 · 不是惩罚', round(damageAtAge(1, { speedDamageRate: 1, speedMultiplier: 0.5 })), BASE_DAMAGE);
  }

  /**
   * Scenery stops a round, and the creature behind it is safe.
   *
   * PORTED from `probe-projectiles.mjs`, which tested the spit system -- ammunition made of creatures the player had
   * swallowed. That whole verb was removed, so the file went with it; these two rules did NOT stop being true, they
   * just belong to the PLAYER's gun now. Nothing else in the suite covers them: `obstacles.blocks` and the check in
   * `BulletField.update` are the only things keeping a crate from being decoration, and a crate you can see in front
   * of a fish has to stop what you shoot at it.
   */
  {
    // The crate is stopped by... the round; the round does not damage it, because bullets are not ordnance.
    {
      const s = scene();
      s.obstacles.spawn('crate', LANE / 2, 300);
      s.field.bullets.push({ x: LANE / 2, y: 300 - 0.001, age: 0 });
      const out = s.field.update(STEP, s.ctx);
      check('木箱 · 挡住了这一发', [s.field.bullets.length, s.field.hits], [0, 1]);
      // And it is counted as a hit on SCENERY, not on a creature: a crate does not bleed and is not worth points, so
      // neither the returned `hits` (which drives the hit sound and the score) nor `struck` (which drives the floating
      // damage number) may include it.
      check('木箱 · 不算打中生物（不出伤害数字、不响命中音）', [out.hits, out.struck.length], [0, 0]);
    }

    // ... so a creature standing behind the crate is not shot through it.
    {
      const s = scene();
      s.obstacles.spawn('crate', LANE / 2, 300);
      const fish = fishAt(s, LANE / 2, 300);
      const before = s.hazards.hazards.length;
      s.field.bullets.push({ x: LANE / 2, y: 300 - 0.001, age: 0 });
      const out = s.field.update(STEP, s.ctx);
      check('木箱 · 后面的鱼没被打到', [out.struck.length, fish.maxHealth], [0, 100000]);
      check('木箱 · 鱼还在场', s.hazards.hazards.length, before);
    }

    // Without the crate the same shot DOES land, so the test above is about the crate and not about the aim.
    {
      const s = scene();
      const fish = fishAt(s, LANE / 2, 300);
      s.field.bullets.push({ x: LANE / 2, y: 300 - 0.001, age: 0 });
      const out = s.field.update(STEP, s.ctx);
      check('（对照）没有木箱时这一发会打中', [out.struck.length, out.hits], [1, 1]);
      check('（对照）而且鱼掉血了', fish.maxHealth - fish.health > 0, true);
    }
  }
} finally {
  await server.close();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
