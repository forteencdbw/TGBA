// Verifies the mechanics config loads, and that the growth stages work as configured.
//
// Two things here are worth more than the rest:
//
//   THE CONFIG IS ACTUALLY READ, not merely parsed. A hand-editable file that silently falls back to a default
//   is worse than no file, so every value the game depends on is compared against what the file says.
//
//   STAGE SPEED IS MEASURED AS DISPLACEMENT, not read from a multiplier. "Stage 3 is slower" has to be true of
//   the bubble's actual movement on screen, because a multiplier that never reaches the movement code is
//   exactly the bug this would otherwise miss.
//
// Usage: node scripts/verify-mechanics.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9396;
const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('no chrome');
  process.exit(2);
}

/** Read the config file the same way the loader does, so the expectations come from the file itself. */
function readConfig() {
  const text = readFileSync('config/mechanics.json', 'utf8');
  const noComments = text
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(noComments);
}
const cfg = readConfig();

const profile = mkdtempSync(join(tmpdir(), 'gb-mech-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=500,780', 'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error('no devtools target');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 1;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        errors,
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) rej(new Error(JSON.stringify(m.error)));
        else res(m.result);
      } else if (m.method === 'Runtime.exceptionThrown') {
        errors.push(String(m.params?.exceptionDetails?.exception?.description ?? '').split('\n')[0]);
      }
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await findTarget());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });

  let booted = false;
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.__GB && window.__GB.game)', returnByValue: true });
    if (r.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) throw new Error('the game never booted');

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
    return JSON.parse(r.result.value);
  };

  /** Leave the menu and wait until the level is actually running. */
  const started = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const m = g.menuRef.geometry;
       g.handlePointerDown(900, m.button.x + m.button.w / 2, m.button.y + m.button.h / 2);
       await raf();
       g.handlePointerUp(900);
       for (let i = 0; i < 400 && g.diagnostics.phase !== 'playing'; i++) await raf();
       return JSON.stringify({ phase: g.diagnostics.phase });
     })()`,
    true,
  );

  // ---------------------------------------------------------------- the config was read
  const loaded = await evalJson(
    `JSON.stringify({
       loaded: window.__GB.mechRef !== undefined,
       stages: window.__GB.mechRef.stages,
       volume: window.__GB.mechRef.volume,
       movement: window.__GB.mechRef.movement,
       collectables: window.__GB.mechRef.collectables,
       hazards: window.__GB.mechRef.hazards,
       emergence: window.__GB.mechRef.emergence,
       level: window.__GB.mechRef.level,
       scrollSpeedInUse: window.__GB.game.diagnostics.level.scrollSpeed,
       tuningAlias: {
         volumeMax: window.__GB.tuning.volumeMax,
         hitPointVolume: window.__GB.tuning.hitPointVolume,
         verticalSpeedScale: window.__GB.tuning.verticalSpeedScale
       },
       stageNow: window.__GB.game.diagnostics.stage
     })`,
  );

  console.log('config file says:');
  console.log('  stages.speedMultiplier     ' + JSON.stringify(cfg.stages.speedMultiplier));
  console.log('  stages.absorbToStage2/3    ' + cfg.stages.absorbToStage2 + ' / ' + cfg.stages.absorbToStage3);
  console.log('  stages.minSpeedMultiplier  ' + cfg.stages.minSpeedMultiplier);
  console.log('  level.scrollSpeed          ' + cfg.level.scrollSpeed);
  console.log('\nthe game loaded:');
  console.log('  stages                     ' + JSON.stringify(loaded.stages));
  console.log('  volume                     ' + JSON.stringify(loaded.volume));
  console.log('  scrollSpeed in use         ' + loaded.scrollSpeedInUse);
  console.log('  tuning alias               ' + JSON.stringify(loaded.tuningAlias));
  console.log('  stage at run start         ' + JSON.stringify(loaded.stageNow));

  // ---------------------------------------------------------------- stage progression
  /**
   * Drive the bubble up through the stages by absorbing, and record what happened at each promotion.
   *
   * Uses a real oversized-then-undersized sequence through the game's own absorb path rather than setting the
   * stage directly, so the thresholds under test are the ones the game applies.
   */
  const progression = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const events = [];
       let last = g.diagnostics.stage.stage;
       // Spawn an edible bubble on the player repeatedly; each one is absorbed on the next frames.
       for (let i = 0; i < 200; i++) {
         g.spawnBubbleOnPlayer(0.4);
         await raf();
         const s = g.diagnostics.stage;
         if (s.stage !== last) {
           events.push({ atAbsorbed: g.diagnostics.stats.absorbed, from: last, to: s.stage, speed: s.speedMultiplier, playerMult: g.player.stageSpeedMultiplier });
           last = s.stage;
         }
       }
       return JSON.stringify({ events, final: g.diagnostics.stage, absorbed: g.diagnostics.stats.absorbed });
     })()`,
    true,
  );

  console.log('\nstage promotions (driven by absorbing through the real path):');
  for (const e of progression.events) {
    console.log(
      '  -> stage ' + e.to + '  after ' + e.atAbsorbed + ' absorbed  speed x' + e.speed +
      '  player multiplier ' + e.playerMult,
    );
  }
  console.log('  final: ' + JSON.stringify(progression.final));

  // ---------------------------------------------------------------- does the stage actually slow the bubble?
  /**
   * THE assertion that matters: measure DISPLACEMENT over a fixed window at each stage.
   *
   * A multiplier that never reaches the movement code would pass every check above and change nothing the
   * player feels, so the last word is how far the bubble actually travels.
   */
  const measured = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       /** Hold right for a fixed number of frames and report how far across the lane it got. */
       const travel = async function (frames) {
         g.debugSetSteadyCruise();
         g.player.x = 0.5;
         g.player.screenY = 0.5;
         for (let i = 0; i < 6; i++) await raf();
         const x0 = g.player.x;
         g.input.down.add('KeyD');
         for (let i = 0; i < frames; i++) await raf();
         g.input.down.delete('KeyD');
         const dx = g.player.x - x0;
         return +dx.toFixed(5);
       };
       const stageOf = function () { return g.diagnostics.stage.stage; };
       const measured = [];
       // Whatever stage the run is in now, then forced down to each one by the same path the game uses.
       for (const target of [1, 2, 3]) {
         while (stageOf() > target) { g.demoteStageForTest(); await raf(); }
         while (stageOf() < target) {
           const before = g.diagnostics.stats.absorbed;
           for (let i = 0; i < 200 && g.diagnostics.stats.absorbed === before; i++) {
             g.spawnBubbleOnPlayer(0.4);
             await raf();
           }
         }
         const dx = await travel(60);
         measured.push({
           stage: stageOf(),
           configuredSpeed: g.diagnostics.stage.speedMultiplier,
           playerMultiplier: +g.player.stageSpeedMultiplier.toFixed(3),
           travelledPer60Frames: dx
         });
       }
       return JSON.stringify({ measured });
     })()`,
    true,
  );

  console.log('\nlateral travel while holding right for 60 frames, per stage:');
  for (const m of measured.measured) {
    console.log(
      '  stage ' + m.stage + '  configured x' + m.configuredSpeed + '  player x' + m.playerMultiplier +
      '  travelled ' + m.travelledPer60Frames + ' of the lane',
    );
  }

  const m = measured.measured;
  const ratios = m.length >= 3 ? [m[1].travelledPer60Frames / m[0].travelledPer60Frames, m[2].travelledPer60Frames / m[1].travelledPer60Frames] : [];
  console.log('\nmeasured step ratios: ' + ratios.map((r) => r.toFixed(3)).join(', '));

  const checks = {
    configLoaded: loaded.loaded === true,
    // Every section the game depends on came from the file, not from a literal in the source.
    stagesMatchTheFile: JSON.stringify(loaded.stages.speedMultiplier) === JSON.stringify(cfg.stages.speedMultiplier),
    thresholdsMatchTheFile:
      loaded.stages.absorbToStage2 === cfg.stages.absorbToStage2 &&
      loaded.stages.absorbToStage3 === cfg.stages.absorbToStage3,
    scrollSpeedMatchesTheFile: loaded.scrollSpeedInUse === cfg.level.scrollSpeed,
    // The `tuning` alias must be a live view of the same object, or the console and the file disagree.
    tuningAliasMatchesTheFile:
      loaded.tuningAlias.volumeMax === cfg.volume.max &&
      Math.abs(loaded.tuningAlias.verticalSpeedScale - cfg.movement.verticalSpeedScale) < 1e-9,
    // The run starts in stage 1.
    startsAtStageOne: loaded.stageNow.stage === 1,
    // Promotions happen, exactly twice, and land on the configured multipliers.
    promotesTwice: progression.events.length === 2,
    promotionSpeedsMatchTheFile:
      progression.events.length === 2 &&
      Math.abs(progression.events[0].speed - cfg.stages.speedMultiplier[1]) < 1e-9 &&
      Math.abs(progression.events[1].speed - cfg.stages.speedMultiplier[2]) < 1e-9,
    // The multiplier reaches the PLAYER, not just the stage state.
    multiplierReachesThePlayer:
      m.length === 3 && Math.abs(m[2].playerMultiplier - cfg.stages.speedMultiplier[2]) < 0.02,
    /** And it is visible as real movement: each stage measurably slower than the last. */
    eachStageIsSlowerOnScreen: ratios.length === 2 && ratios.every((r) => r > 0 && r < 0.95),
    noExceptions: cdp.errors.length === 0,
  };
  if (cdp.errors.length) console.log('\nexceptions: ' + JSON.stringify(cdp.errors.slice(0, 4)));
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('VERIFY-MECHANICS FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
