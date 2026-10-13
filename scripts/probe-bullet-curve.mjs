// 配置里的数值范围校验拿掉之后，两件事要证明：
//   1) 真的配置仍然能通过（往返校验：每个键有规则、每条规则有键——这部分没动，得确认没被碰坏）；
//   2) 用户的数现在真的能进去了，而且能算出它到底意味着多大。
//
//   node scripts/probe-bullet-curve.mjs
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  // 仅仅是 import 就跑了整份校验：配置有问题这里会抛，抛了就是校验还挡着
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  console.log('ok   配置通过校验（往返检查完整）');

  const b = mech.bullets;
  console.log(`\nbullets.radiusRatio          = ${b.radiusRatio}`);
  console.log(`bullets.radiusGrowthPerSecond= ${b.radiusGrowthPerSecond}`);
  console.log(`bullets.lifeSeconds          = ${b.lifeSeconds}`);
  console.log(`bullets.speedStartPerSecond  = ${b.speedStartPerSecond}`);
  console.log(`bullets.accelerationPerSecond= ${b.accelerationPerSecond}`);
  console.log(`bullets.speedMaxPerSecond    = ${b.speedMaxPerSecond}`);
  console.log(`bullets.rateTiers            = [${b.rateTiers.join(', ')}]`);

  // 半径是"泳道宽的比例"，所以这里的数字直接就是"几个泳道宽"
  const radiusAt = (age) => b.radiusRatio + b.radiusGrowthPerSecond * age;
  console.log('\n半径随时间（单位：泳道宽；泳道约 900 设计像素）');
  for (const age of [0, 0.1, 0.25, 0.5, 1, b.lifeSeconds]) {
    const r = radiusAt(age);
    console.log(
      `  t=${String(age).padStart(4)}s  ${r.toFixed(3).padStart(9)} 泳道宽  ≈ ${Math.round(r * 900).toString().padStart(7)}px`,
    );
  }

  // 速度曲线：射程 = 曲线下面积，用来判断"子弹能不能飞到顶"
  const speedAt = (age) => Math.min(b.speedMaxPerSecond, b.speedStartPerSecond + b.accelerationPerSecond * age);
  let range = 0;
  const dt = 1 / 1200;
  for (let t = 0; t < b.lifeSeconds; t += dt) range += speedAt(t) * dt;
  console.log(`\n射程（曲线下面积，泳道宽）: ${range.toFixed(2)}`);
  console.log(`达到最高速用时            : ${((b.speedMaxPerSecond - b.speedStartPerSecond) / b.accelerationPerSecond).toFixed(2)}s`);
} finally {
  await server.close();
}
