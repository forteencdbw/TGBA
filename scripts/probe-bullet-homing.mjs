// 追踪弹：哪些敌人会被锁上，锁上之后子弹怎么飞，目标丢了之后怎么办？
//
// 用真实模块跑：真的建一个 `BulletField`，真的往里面塞怪物，真的让子弹一帧一帧飞。验的是**规则**，
// 而不是我对规则的记忆——尤其是"纵向必须和普通子弹一模一样"和"气泡下方的敌人不许锁"这两条，
// 编译器一个字都管不到，而它们恰好是这张卡全部的手感。
//
//   node scripts/probe-bullet-homing.mjs
//
// 骰子是**喂进去的**（`ctx.random`），不是随机的：这一整个模块在追踪弹之前一行随机数都没有，
// 探针能逐字节比对全靠这个缝（见 `Run.bulletRandom`）。所以这里的每一发都是确定的第一发、第二发……
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
  const { BulletField } = await server.ssrLoadModule('/src/bullets.ts');
  const { HazardField } = await server.ssrLoadModule('/src/hazards.ts');
  const { ObstacleField } = await server.ssrLoadModule('/src/obstacles.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const LANE = 100;
  const STEP = 1 / 120;
  const cfg = mech.bullets.homing;
  /** The lateral numbers are in lane widths; the rounds below are measured in metres. */
  const LATERAL_MAX = cfg.lateralMaxPerSecond * LANE;

  /**
   * A dice that hands out a fixed list of rolls and then repeats the last one.
   *
   * The module asks in a fixed order -- the birth roll, then the target's index, then (only when there was nothing
   * to lock) the arc's direction -- so a list of rolls IS a script for one round. Writing the rolls out rather than
   * letting the module roll is what makes "it picked the right one" a decidable question.
   */
  const dice = (...rolls) => {
    let i = 0;
    return () => rolls[Math.min(i++, rolls.length - 1)];
  };

  /**
   * A bare scene: the two fields a round can meet, and nothing alive.
   *
   * `playerY` is the bubble's own world `y` -- the number the half-plane is measured against -- and the default
   * here is picked so that "above the player" is unambiguous for everything the tests place.
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
      damage: 1,
      sizeDamageRate: 0,
      speedDamageRate: 0,
      speedMultiplier: 1,
      radiusMultiplier: 1,
      lifeMultiplier: 1,
      playerY: 200,
      homingChance: 0,
      random: dice(0),
      hazards,
      obstacles,
      ...over,
    };
    return { hazards, obstacles, field, ctx };
  };

  /** A fish that will not flee mid-test, at a chosen spot. */
  const fishAt = (s, x, y) => {
    const fish = s.hazards.spawnAt('fish', x, y, { deterministic: true });
    fish.maxHealth = 100000;
    s.hazards.hazards.push(fish);
    return fish;
  };

  /**
   * Fire ONE round and return it.
   *
   * Disarmed immediately after, so the round below can be flown for as long as a test needs without the cadence
   * putting more of them in the water -- every check here is about a single round's choices.
   */
  const fire = (s, muzzle) => {
    s.ctx.muzzles = [muzzle];
    s.ctx.armed = true;
    s.ctx.perSecond = 1;
    s.field.update(STEP, s.ctx);
    s.ctx.armed = false;
    return s.field.bullets[s.field.bullets.length - 1];
  };

  const fly = (s, steps) => {
    for (let i = 0; i < steps; i++) s.field.update(STEP, s.ctx);
  };

  // ---------------------------------------------------------------------------------------------
  // 出膛判定：概率、以及"属性在子弹上而不是在枪上"这件事
  // ---------------------------------------------------------------------------------------------
  {
    const s = scene({ homingChance: 0, random: dice(0) });
    const b = fire(s, { x: LANE / 2, y: 100 });
    check('概率 0 · 出膛不带追踪', !!b.homing, false);
  }
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5) });
    fishAt(s, LANE / 2, 400);
    const b = fire(s, { x: LANE / 2, y: 100 });
    check('概率 1 · 出膛就是追踪弹', !!b.homing, true);
  }
  {
    // 同一发齐射里两颗枪口：一颗掷中、一颗没掷中。这是这张卡存在的意义，不是边界情况。
    const s = scene({ homingChance: 0.5, random: dice(0.1, 0.5, 0.9) });
    fishAt(s, LANE / 2, 400);
    s.ctx.muzzles = [{ x: 40, y: 100 }, { x: 60, y: 100 }];
    s.ctx.armed = true;
    s.ctx.perSecond = 1;
    s.field.update(STEP, s.ctx);
    check('同一次齐射 · 一颗追踪一颗不追踪', s.field.bullets.map((b) => !!b.homing), [true, false]);
  }

  // ---------------------------------------------------------------------------------------------
  // 谁有资格当目标：三条规则，各自一条断言
  // ---------------------------------------------------------------------------------------------
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5) });
    const up = fishAt(s, LANE / 2, 400);
    const b = fire(s, { x: LANE / 2, y: 300 });
    check('在气泡上方 · 锁定它', b.homing.targetId, up.id);
  }
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5, 0.9) });
    fishAt(s, LANE / 2, 100); // 气泡在 200，这条在下面——已经被游过去了
    const b = fire(s, { x: LANE / 2, y: 300 });
    check('在气泡下方 · 不锁', b.homing.targetId, null);
    check('在气泡下方 · 转入弧线（0.9 → 朝右）', b.homing.side, 1);
  }
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5, 0.9) });
    fishAt(s, LANE / 2, 5000); // 可见范围是 [0, 800]
    const b = fire(s, { x: LANE / 2, y: 300 });
    check('屏幕外 · 不锁', b.homing.targetId, null);
  }
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5, 0.9) });
    const rock = fishAt(s, LANE / 2, 400);
    rock.maxHealth = 0; // 和枪自己那一行判定同样：打不动的东西也不许追
    const b = fire(s, { x: LANE / 2, y: 300 });
    check('打不动的东西 · 不锁', b.homing.targetId, null);
  }
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.5, 0.9) });
    const leaving = fishAt(s, LANE / 2, 400);
    leaving.flee = 'up'; // 已经被打跑了，正在离场
    const b = fire(s, { x: LANE / 2, y: 300 });
    check('正在离场的东西 · 不锁', b.homing.targetId, null);
  }

  // ---------------------------------------------------------------------------------------------
  // 飞行：纵向必须一模一样，横向才拐
  // ---------------------------------------------------------------------------------------------
  {
    const steps = 120;
    const a = scene({ homingChance: 1, random: dice(0, 0.5), playerY: 200 });
    fishAt(a, LANE / 2 + 200, 700);
    const tracked = fire(a, { x: LANE / 2, y: 100 });
    const b = scene({ homingChance: 0, playerY: 200 });
    fishAt(b, LANE / 2 + 200, 700);
    const plain = fire(b, { x: LANE / 2, y: 100 });
    const trackedX0 = tracked.x;
    const plainX0 = plain.x;
    fly(a, steps);
    fly(b, steps);
    // 这条是整张卡的骨架：追踪只是**在往上飞的同时往旁边滑**，不掉头、不减速，所以射程和寿命一个字没改。
    check('纵向 · 和普通弹逐帧相同', round(tracked.y), round(plain.y));
    check('横向 · 追踪弹朝目标拐了', tracked.x > trackedX0, true);
    check('横向 · 普通弹一个像素没动', plain.x, plainX0);
  }
  {
    // 横向速度有上限：追一个远在天边的目标也不会变成横着飞的东西。
    const s = scene({ homingChance: 1, random: dice(0, 0.5), playerY: 200 });
    fishAt(s, LANE * 20, 700);
    const b = fire(s, { x: LANE / 2, y: 100 });
    fly(s, 120);
    check('横向速度 · 封顶在 lateralMaxPerSecond', round(Math.abs(b.homing.vx)), round(LATERAL_MAX));
  }

  // ---------------------------------------------------------------------------------------------
  // 没有目标：那条弧线
  // ---------------------------------------------------------------------------------------------
  {
    const s = scene({ homingChance: 1, random: dice(0, 0.9), playerY: 200 });
    const b = fire(s, { x: LANE / 2, y: 100 }); // 场上一条命都没有
    check('出膛就没目标 · 转入弧线', b.homing.targetId, null);
    const x0 = b.x;
    fly(s, 90);
    check('弧线 · 朝骰子那一侧出去（0.9 → 右）', b.x > x0, true);
    check('弧线 · 横向速度同样封顶', round(Math.abs(b.homing.vx)), round(LATERAL_MAX));
  }
  {
    // 弧线上依然保留伤害：它是"出膛那一刻没找到目标"，不是"打空了"。
    const s = scene({ homingChance: 1, random: dice(0, 0.9), playerY: 200 });
    const b = fire(s, { x: LANE / 2, y: 100 });
    fishAt(s, b.x, b.y);
    const out = s.field.update(STEP, s.ctx);
    check('弧线上撞到东西 · 一样算伤害', out.struck.length, 1);
  }

  // ---------------------------------------------------------------------------------------------
  // 目标消失之后：用**当下**的气泡位置重选一次，选不到就转弧线
  // ---------------------------------------------------------------------------------------------
  {
    const s = scene({ homingChance: 1, random: dice(0, 0, 0.5), playerY: 200 });
    const first = fishAt(s, LANE / 2, 700);
    const second = fishAt(s, LANE / 2, 600);
    const b = fire(s, { x: LANE / 2, y: 100 });
    check('先锁上骰到的那只', b.homing.targetId, first.id);
    b.homing.targetId = second.id; // 换成另一只，下面把它拿掉
    s.hazards.hazards = s.hazards.hazards.filter((h) => h.id !== second.id);
    s.field.update(STEP, s.ctx);
    check('目标消失 · 重选到剩下那只', b.homing.targetId, first.id);
  }
  {
    // 气泡已经升到两只上面去了——重选时用的是**现在**的位置，所以上面已经没有合格目标了。
    const s = scene({ homingChance: 1, random: dice(0, 0, 0.9), playerY: 200 });
    const locked = fishAt(s, LANE / 2, 700);
    fishAt(s, LANE / 2, 600);
    const b = fire(s, { x: LANE / 2, y: 100 });
    check('先锁上一只', b.homing.targetId, locked.id);
    s.ctx.playerY = 750; // 玩家已经游到两只头上了
    s.hazards.hazards = s.hazards.hazards.filter((h) => h.id !== locked.id);
    s.field.update(STEP, s.ctx);
    check('重选用当下气泡位置 · 都不在"上面"了', b.homing.targetId, null);
    check('选不到 · 转入弧线（0.9 → 右）', b.homing.side, 1);
  }
  {
    // 进了弧线就不再回头找：否则一颗弹会在"追"和"不追"之间反复横跳。
    const s = scene({ homingChance: 1, random: dice(0, 0.9), playerY: 200 });
    const b = fire(s, { x: LANE / 2, y: 100 });
    check('出膛就没目标', b.homing.targetId, null);
    const late = fishAt(s, LANE / 2, 700); // 后来才出现的敌人
    fly(s, 5);
    check('后来的敌人 · 不会把已经进了弧线的弹拉回来', b.homing.targetId === null && late.y > s.ctx.playerY, true);
  }

  check('（对照）追踪弹确实是关着的默认值', new BulletField().bullets.length, 0);
} finally {
  await server.close();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
