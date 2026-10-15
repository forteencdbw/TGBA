// 热液喷口改版之后：判定是不是**和画出来的一致**，三种朝向的解法是不是真的不同？
//
// 这件事必须量。改版之前绘制是一根 1.5 泳道宽的高柱、判定只有半径 0.085 的圆——绘制是判定的 11 倍高，
// 玩家能站在画出来的柱子里不掉血。现在判定是"底座圆 + 等宽胶囊"，绘制读的是同一组数字，
// 这个 probe 就是来钉住那件事的。
//
//   node scripts/probe-vent-shape.mjs
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
  const { HazardField, ventX } = await server.ssrLoadModule('/src/hazards.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const LANE = 1000;
  const LANE_Y = 320; // 喷口所在的世界 y
  const PLAYER_R = 0.045;
  const cfg = mech.hazards.vent;
  const base = cfg.baseRadiusRatio * LANE;
  const halfWidth = cfg.jetHalfWidthRatio * LANE;
  const playerR = PLAYER_R * LANE;
  const reach = halfWidth + playerR;

  console.log(
    `config: base=${cfg.baseRadiusRatio}W (${base}px)  jetHalfWidth=${cfg.jetHalfWidthRatio}W (${halfWidth}px)\n` +
      `        长度 up/down=${cfg.jetLengthRatio.up}W  flat=${cfg.jetLengthRatio.flat}W  斜角=${cfg.diagonalRadians}rad\n` +
      `        判定余量 = 喷流半宽 + 玩家半径 = ${reach}px\n`,
  );

  const dirOf = (side, aim) => {
    const into = side === 'left' ? 1 : -1;
    if (aim === 'flat') return { x: into, y: 0 };
    const c = Math.cos(cfg.diagonalRadians);
    return { x: into * c, y: aim === 'up' ? c : -c };
  };

  /**
   * 玩家站在 (dx,dy)（相对喷口，单位 px，y 向上为正）时会不会挨打。
   * `phase` / `fed` 给成"正在喷"，除非调用方另说。
   */
  const hurtsAt = (side, aim, dx, dy, { erupting = true, delay = 0, fed = 0 } = {}) => {
    const field = new HazardField();
    const vent = field.spawnAt('vent', ventX(side, LANE), LANE_Y, { deterministic: true, side, aim, startDelaySeconds: delay });
    // phase 0 = 喷发开始；要"没在喷"就推到 `activeSeconds` 之后。
    vent.phase = erupting ? 0 : cfg.activeSeconds + 0.1;
    vent.fed = fed;
    field.hazards.push(vent);
    const effects = field.update(1 / 120, {
      min: 0,
      max: 2000,
      laneWidth: LANE,
      playerX: vent.x + dx,
      playerY: vent.y + dy,
      playerRadiusFraction: PLAYER_R,
      driftSpeed: 0,
      cameraRise: 0,
      elapsed: 0,
      invulnerable: false,
      struggling: false,
      playerVolume: 1,
      canEat: () => false,
      suction: null,
      bubbles: [],
      eatenBubbleIds: [],
      splitCount: 0,
    });
    return effects.some((e) => e.kind === 'vent');
  };

  // --- 底座：一块常驻的岩石 ---------------------------------------------------------------
  check('底座 · 站在岩上挨打', hurtsAt('left', 'up', 0, 0), true);
  check('底座 · 没在喷也挨打（岩石是常驻的）', hurtsAt('left', 'up', 0, 0, { erupting: false }), true);
  // 离底座一个"底座 + 玩家半径"再多一点：只有底座够不到。用 `flat` 且关掉喷流，好把两件事分开测。
  check('底座 · 站在岩外不挨打', hurtsAt('left', 'flat', 0, base + playerR + 20, { erupting: false }), false);

  // --- 喷流：等宽胶囊，打到它该打到的地方 ------------------------------------------------
  for (const [side, aim] of [
    ['left', 'up'],
    ['left', 'down'],
    ['right', 'up'],
    ['right', 'down'],
    ['left', 'flat'],
    ['right', 'flat'],
  ]) {
    const dir = dirOf(side, aim);
    const len = cfg.jetLengthRatio[aim] * LANE;
    // 沿朝向、离喷口 `len - 10` 的地方在带子里
    const inside = { x: dir.x * (len - 10), y: dir.y * (len - 10) };
    // 再往外越过一个判定余量就出界
    const beyond = { x: dir.x * (len + reach + 20), y: dir.y * (len + reach + 20) };
    check(`${side}/${aim} · 带内挨打`, hurtsAt(side, aim, inside.x, inside.y), true);
    check(`${side}/${aim} · 越过喷流尽头不挨打`, hurtsAt(side, aim, beyond.x, beyond.y), false);
    // 不在喷的时候，带子里也不挨打（底座除外）
    check(`${side}/${aim} · 没在喷时带子不伤人`, hurtsAt(side, aim, inside.x, inside.y, { erupting: false }), false);
  }

  // --- 两种解法的分界：横向封不封得死 ----------------------------------------------------
  //
  // 这是设计里最要紧的一条：斜向要留出能横向躲开的空隙，横向要横贯整条泳道。
  // 对着"另一面墙"测，同高度。
  for (const aim of ['up', 'down']) {
    for (const side of ['left', 'right']) {
      const far = side === 'left' ? LANE - 5 : 5;
      const dx = far - ventX(side, LANE);
      check(`${side}/${aim} · 贴对面墙同高度可躲`, hurtsAt(side, aim, dx, 0), false);
    }
  }
  for (const side of ['left', 'right']) {
    const far = side === 'left' ? LANE - 5 : 5;
    const dx = far - ventX(side, LANE);
    check(`${side}/flat · 贴对面墙同高度躲不掉（横贯）`, hurtsAt(side, 'flat', dx, 0), true);
  }

  // --- 首喷延迟 --------------------------------------------------------------------------
  {
    const delay = 1.0;
    const dir = dirOf('left', 'up');
    const at = { x: dir.x * 200, y: dir.y * 200 };
    check('延迟 · 延迟内安静（带子里不挨打）', hurtsAt('left', 'up', at.x, at.y, { delay, fed: delay - 0.4 }), false);
    check('延迟 · 延迟结束就进入周期', hurtsAt('left', 'up', at.x, at.y, { delay, fed: delay + 0.01 }), true);
    check('延迟 · 延迟内底座照样疼', hurtsAt('left', 'up', 0, 0, { delay, fed: delay - 0.4 }), true);
  }
  console.log(
    `\n（预警的时机由 ventWarning 决定，和这里测的 ventErupting 是同两个函数——绘制读的是同一套，\n` +
      ` 所以"画出来的带子"就是"打到你的带子"。）`,
  );
} finally {
  await server.close();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
