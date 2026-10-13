// 两张新卡真的能到玩家手里吗？
//
// 「都进全池」是一个决定，它不是靠读代码能确认的——`routes: 'all'` 写对了，但抽卡还经过
// `rollMutationChoices` 的过滤（路线卡、首抽保底、`available()`），任何一环都能把它挡掉。
// 所以这里按**三条路**各抽很多次，看两张卡是否都出得来，以及保底逻辑还正不正常。
//
//   node scripts/probe-mutation-pool.mjs
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());

const { createServer } = await (async () => {
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(root + '/package.json');
  return import(pathToFileURL(require.resolve('vite')).href);
})();

let failures = 0;
const round = (n) => Number(n.toFixed(4));
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)})`}`);
};

const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { Run } = await server.ssrLoadModule('/src/run.ts');
  const { rollMutationChoices, applyMutationPassives } = await server.ssrLoadModule('/src/mutations.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');

  const NEW_CARDS = ['sizeDamage', 'speedDamage'];
  const ROUTES = ['devour', 'boil', 'barrage'];

  /** Every distinct card id this route can be offered, over enough draws to see the whole pool. */
  const seenOn = (route) => {
    const run = new Run();
    run.pickRoute(route);
    const ids = new Set();
    for (let i = 0; i < 4000; i++) {
      run.routeCardPending = false; // otherwise the guarantee keeps forcing the same first slot
      for (const m of rollMutationChoices(run, 3)) ids.add(m.id);
    }
    return ids;
  };

  for (const route of ROUTES) {
    const ids = seenOn(route);
    check(`${route} · 两张新卡都抽得到`, NEW_CARDS.map((id) => ids.has(id)), [true, true]);
  }

  /**
   * The panel must never come up short.
   *
   * `rollMutationChoices` degrades to fewer than three cards when the pool is thin, which is a real state late in a
   * run but must not be the state from the first level-up -- and moving 「弹速」 out of the barrage route's own list
   * is exactly the kind of change that can thin one route without touching the others.
   */
  for (const route of ROUTES) {
    const run = new Run();
    run.pickRoute(route);
    const thin = [];
    for (let i = 0; i < 3000; i++) {
      run.routeCardPending = false;
      const n = rollMutationChoices(run, 3).length;
      if (n < 3) thin.push(n);
    }
    check(`${route} · 三选一面板填得满`, thin.length, 0);
  }

  // 首抽保底：刚选完路线的那一次抽卡，第一张必须属于这条路自己。
  {
    const run = new Run();
    run.pickRoute('barrage');
    const first = rollMutationChoices(run, 3)[0];
    check('首抽保底 · 弹幕路线第一张是自己人', first.routes, 'barrage');
  }

  // 「弹速」放开到全池之后，每一条路自己的卡都还在（保底逻辑依赖 own.length > 0）。
  for (const route of ROUTES) {
    const run = new Run();
    run.pickRoute(route);
    run.routeCardPending = false;
    const own = new Set();
    for (let i = 0; i < 2000; i++) {
      for (const m of rollMutationChoices(run, 3)) if (m.routes === route) own.add(m.id);
    }
    check(`${route} · 仍有专属卡`, own.size >= 1, true);
  }

  /**
   * The two new cards actually reach the run's fields.
   *
   * This is here rather than in the damage probe because the damage probe supplies the RATES itself -- it tests the
   * formula. What is untested there is the wiring: `applyMutationPassives` looks the count up by a STRING
   * (`count('sizeDamage')`), and a misspelled key would typecheck and read as zero for ever. So the counts go in by
   * name and the rates have to come out of the other end.
   */
  {
    const run = new Run();
    run.mutations.sizeDamage = 3;
    run.mutations.speedDamage = 2;
    run.mutations.bulletSpeed = 4;
    applyMutationPassives(run);
    const pool = mech.mutation.pool;
    check('sizeDamage → bulletSizeDamageRate', round(run.bulletSizeDamageRate), round(pool.sizeDamagePerPick * 3));
    check('speedDamage → bulletSpeedDamageRate', round(run.bulletSpeedDamageRate), round(pool.speedDamagePerPick * 2));
    // And the speed card reads the STACK, so 「弹速」 picks have to move the speed bonus it is priced against.
    check('bulletSpeed × 4 → 倍率 2.0', round(run.bulletSpeedMultiplier), 2);
    // A run with no picks must be left exactly where it was, or every existing run just changed.
    const fresh = new Run();
    applyMutationPassives(fresh);
    check('没拿卡 · 两个速率都是 0', [fresh.bulletSizeDamageRate, fresh.bulletSpeedDamageRate], [0, 0]);
  }
} finally {
  await server.close();
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
