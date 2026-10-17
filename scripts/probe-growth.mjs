// Does the pause panel's growth readout tell the truth about the run?
//
// `growthView` is a pure function of a Run, so this needs no canvas: take cards through the real pick path
// (`pickMutationCard`), read the view back, and compare it to the numbers the simulation itself holds.
//
//   node scripts/probe-growth.mjs [tree]            # defaults to this checkout

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
  const { Run } = await server.ssrLoadModule('/src/run.ts');
  const { mech } = await server.ssrLoadModule('/src/mechanisms.ts');
  const { growthView } = await server.ssrLoadModule('/src/growth.ts');
  const { mutationCard, pickMutationCard, rollMutationChoices } = await server.ssrLoadModule('/src/mutations.ts');
  const { ROUTES } = await server.ssrLoadModule('/src/bubbleTypes.ts');
  const take = (run, id) => {
    const card = mutationCard(id);
    if (!card) throw new Error(`no card ${id}`);
    pickMutationCard(run, card);
  };
  const stat = (view, label) => view.stats.find((s) => s.label === label)?.value;

  // ---- a fresh run has nothing to list, and still says what it is
  {
    const run = new Run();
    const view = growthView(run);
    check('empty · no card groups at all', view.groups, []);
    check('empty · five numbers, in order', view.stats.map((s) => s.label), ['血上限', '枪管', '射速', '伤害', '护甲']);
    check('empty · the gun is one row of the maximum', stat(view, '枪管'), `1 / ${mech.bullets.maxStreams} 排`);
    check('empty · damage is the base multiplier', stat(view, '伤害'), '×1');
    check('empty · health ceiling is the run\'s own', stat(view, '血上限'), String(Math.round(run.healthMax * 100) / 100));
  }

  // ---- the pick path logs, and the log is what the view groups
  {
    const run = new Run();
    take(run, 'damage');
    take(run, 'gun');
    take(run, 'damage');
    take(run, 'damage');
    check('log · every pick is in it, in order', run.picks, ['damage', 'gun', 'damage', 'damage']);
    const view = growthView(run);
    check('mutations · one group, titled', view.groups.map((g) => g.title), ['突变']);
    const lines = view.groups[0].lines;
    check('mutations · a card taken three times is ONE line, where it first appeared, with its count', lines.map((l) => [l.name, l.count]), [
      [mutationCard('damage').name, 3],
      [mutationCard('gun').name, 1],
    ]);
    check('mutations · the line carries the card\'s own blurb', lines[0].blurb, mutationCard('damage').blurb);
    const want = Math.round((1 + mech.mutation.pool.damagePerPick * 3) * 100) / 100;
    check('numbers · damage is the multiplier the simulation holds (three picks)', [stat(view, '伤害'), run.bulletDamageMultiplier > 1], [`×${want}`, true]);
    check('numbers · the gun row the card added', stat(view, '枪管'), `${run.gunStreams} / ${mech.bullets.maxStreams} 排`);
    check('numbers · and it really is two rows', run.gunStreams, 2);
  }

  // ---- the rate tier, and a card the game no longer has
  {
    const run = new Run();
    take(run, 'rate');
    const view = growthView(run);
    const tiers = mech.bullets.rateTiers;
    check('rate · the tier and its rounds per second', stat(view, '射速'), `${Math.round((tiers[run.rateTier - 1] ?? 0) * 100) / 100} 发/秒 · ${Math.min(run.rateTier, tiers.length)}/${tiers.length} 档`);
    check('rate · one pick moved the tier', run.rateTier, 2);
    run.picks.push('gone:forever');
    const last = growthView(run).groups.flatMap((g) => g.lines).find((l) => l.name === 'gone:forever');
    check('removed card · still listed, by its id, with a note rather than dropped', [last?.count, last?.blurb.includes('不在游戏里')], [1, true]);
  }

  // ---- the three-choice panel's cards all resolve, so nothing the panel can offer prints as a bare id later
  {
    const run = new Run();
    const offered = [...rollMutationChoices(run), ...(() => { run.route = ROUTES[0].id; return rollMutationChoices(run, 99); })()];
    check('cards · everything the panel offers is found by id', offered.every((c) => mutationCard(c.id) === c), true);
  }

  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} check(s) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await server.close();
}
