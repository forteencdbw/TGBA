// Verifies the decoupled model: the player moves freely WITHIN THE SCREEN, and the level's scroll runs
// at its own configured speed, entirely independent of the player.
//
// The central assertion is an INDEPENDENCE one, which is the thing the previous model got wrong:
//
//     holding "up" must move the bubble up the screen and must NOT change how fast the level advances
//
// Both halves matter. Testing only that up moves the bubble would pass on the old model, where up moved
// the bubble by advancing the level.
//
// Usage: node scripts/scroller.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9377;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-scroller-'));
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
    } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error('no devtools target');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 1;
    const pending = new Map();
    ws.addEventListener('open', () => resolve({
      send(m, p = {}) {
        const i = id++;
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
        return new Promise((res, rej) => pending.set(i, { res, rej }));
      },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
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
    if (r.result.value === true) { booted = true; break; }
  }
  if (!booted) throw new Error('the game never booted');
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(200);
  }

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
    return JSON.parse(r.result.value);
  };

  await evalJson(
    `(function () {
       const g = window.__GB.game;
       window.__GB.__down = (code) => g.input.down.add(code);
       window.__GB.__up = (code) => g.input.down.delete(code);
       return JSON.stringify({ ok: true });
     })()`,
  );

  // ------------------------------------------------------------ independence
  /**
   * Time the scroll under two different inputs.
   *
   * If holding "up" affected progress, these two rates would differ. They must match, and the bubble
   * must have moved up the screen in between.
   */
  const rateUnder = (keyCode) =>
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       g.debugSetSteadyCruise();
       for (let i = 0; i < 4; i++) await raf();
       const s0 = g.diagnostics.level.scrolled;
       const y0 = g.player.screenY;
       const t0 = performance.now();
       ${keyCode ? `window.__GB.__down('${keyCode}');` : ''}
       while (performance.now() - t0 < 1200) await raf();
       ${keyCode ? `window.__GB.__up('${keyCode}');` : ''}
       const s1 = g.diagnostics.level.scrolled;
       const y1 = g.player.screenY;
       return JSON.stringify({
         scrollDelta: +(s1 - s0).toFixed(2),
         screenDelta: +(y1 - y0).toFixed(4),
         speed: +g.levelRef.scrollSpeed.toFixed(2),
         screenY: +y1.toFixed(3)
       });
     })()`;

  const idle = await evalJson(rateUnder(null), true);
  const holdingUp = await evalJson(rateUnder('KeyW'), true);
  console.log('scroll advanced while idle:        ' + JSON.stringify(idle));
  console.log('scroll advanced while holding up:  ' + JSON.stringify(holdingUp));

  // ------------------------------------------------------------ four directions
  const axisProbe = async (codeName, label) => {
    const out = await evalJson(
      `(async function () {
         const g = window.__GB.game;
         const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
         g.debugSetSteadyCruise();
         // Recentre the bubble first. A probe that starts wherever the previous one finished measures
         // nothing when the previous one ended against a clamp -- "hold up again" cannot move a bubble
         // that is already at the top, and that is a fault in the probe, not in the game.
         g.player.screenY = 0.5;
         g.player.x = 0.5;
         for (let i = 0; i < 3; i++) await raf();
         const x0 = g.player.x, y0 = g.player.screenY;
         const s0 = g.diagnostics.level.scrolled;
         window.__GB.__down('${codeName}');
         const t0 = performance.now();
         while (performance.now() - t0 < 700) await raf();
         window.__GB.__up('${codeName}');
         return JSON.stringify({
           dx: +(g.player.x - x0).toFixed(4),
           dScreenY: +(g.player.screenY - y0).toFixed(4),
           dScroll: +(g.diagnostics.level.scrolled - s0).toFixed(2)
         });
       })()`,
      true,
    );
    console.log(`  ${label.padEnd(6)} dx=${String(out.dx).padStart(8)}  dScreenY=${String(out.dScreenY).padStart(8)}  dScroll=${out.dScroll}`);
    return out;
  };

  console.log('\nfour directions (700ms each):');
  const up = await axisProbe('KeyW', 'up');
  const down = await axisProbe('KeyS', 'down');
  const left = await axisProbe('KeyA', 'left');
  const right = await axisProbe('KeyD', 'right');

  // ------------------------------------------------------------ touch drag
  const drag = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const w = g.canvasSize.width, h = g.canvasSize.height;
       g.debugSetSteadyCruise();
       // Recentre, for the same reason the axis probes do: this runs after a probe that left the bubble
       // against the right wall, and a bubble already there cannot demonstrate moving right.
       g.player.x = 0.5;
       g.player.screenY = 0.5;
       for (let i = 0; i < 3; i++) await raf();
       const x0 = g.player.x, y0 = g.player.screenY;
       // A finger near the TOP-RIGHT of the glass: the bubble should go right and up the SCREEN.
       // Screen y is measured downwards, so 20% down is high up.
       g.handlePointerDown(9, w * 0.85, h * 0.2);
       const t0 = performance.now();
       while (performance.now() - t0 < 900) await raf();
       const target = g.touchRef.debugState;
       g.handlePointerUp(9);
       return JSON.stringify({
         dx: +(g.player.x - x0).toFixed(4),
         screenY: +g.player.screenY.toFixed(3),
         dScreenY: +(g.player.screenY - y0).toFixed(4),
         targetX: target.targetX,
         targetY: target.targetY
       });
     })()`,
    true,
  );
  console.log(`\ntouch drag to the top-right (85% across, 20% down):`);
  console.log(`  dx=${drag.dx}  dScreenY=${drag.dScreenY}  screenY=${drag.screenY}  target=(${drag.targetX}, ${drag.targetY})`);

  // ------------------------------------------------------------ bounds
  const bounds = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       g.debugSetSteadyCruise();
       window.__GB.__down('KeyW');
       const t0 = performance.now();
       while (performance.now() - t0 < 2500) await raf();
       window.__GB.__up('KeyW');
       const top = g.player.screenY;
       window.__GB.__down('KeyS');
       const t1 = performance.now();
       while (performance.now() - t1 < 3500) await raf();
       window.__GB.__up('KeyS');
       const bottom = g.player.screenY;
       return JSON.stringify({ top: +top.toFixed(3), bottom: +bottom.toFixed(3) });
     })()`,
    true,
  );
  console.log(`\nheld "up" 2.5s -> screenY ${bounds.top}; then "down" 3.5s -> ${bounds.bottom}  (bounds 0.12..0.94)`);

  // ------------------------------------------------------------ the progress readout
  /**
   * The reported bug: "the progress bar still changes when I move up and down".
   *
   * The bar and the headline were read off the PLAYER's world position, which now includes their screen
   * offset -- so steering moved the level's progress. Both must follow the SCROLL and nothing else.
   */
  const readout = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       g.debugSetSteadyCruise();
       g.player.screenY = 0.5;
       for (let i = 0; i < 4; i++) await raf();
       const before = { headline: g.hudRef.headlineText, depth: g.player.depth, screenY: g.player.screenY };
       // Shove the bubble to the very top of the window WITHOUT touching the scroll.
       g.player.screenY = 0.94;
       for (let i = 0; i < 4; i++) await raf();
       const after = { headline: g.hudRef.headlineText, depth: g.player.depth, screenY: g.player.screenY };
       g.player.screenY = 0.5;
       return JSON.stringify({ before, after });
     })()`,
    true,
  );
  console.log(
    `\nprogress readout with the bubble moved to the top of the window:\n  headline "${readout.before.headline}" -> "${readout.after.headline}"   (world depth ${readout.before.depth.toFixed(0)} -> ${readout.after.depth.toFixed(0)})`,
  );

  // ------------------------------------------------------------ spawn position
  /**
   * The other reported bug: "enemies and bubbles spawn in the middle of the screen".
   *
   * Checked against the view the game itself reports at the moment of placement, which is the only way
   * to tell "entered from above" from "appeared in the middle".
   */
  const spawn = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       // Finish the current run and wait for a fresh one, because startRun clears the spawn log and
       // the timeline restarts from zero. Sampling before the new run reaches its first entry reads an
       // empty log, which looks identical to "nothing spawned" -- a false failure.
       g.debugSkipToLevelEnd();
       const t0 = performance.now();
       while (g.diagnostics.phase !== 'burst' && performance.now() - t0 < 8000) await raf();
       const t1 = performance.now();
       while (g.diagnostics.phase !== 'playing' && performance.now() - t1 < 15000) await raf();
       // The level's first entry is at 30m, so wait for actual placements rather than for a duration.
       const t2 = performance.now();
       while (g.spawnLogRef.length < 3 && performance.now() - t2 < 8000) await raf();
       return JSON.stringify({ log: g.spawnLogRef, scrolled: +g.diagnostics.level.scrolled.toFixed(1) });
     })()`,
    true,
  );
  const spawns = spawn.log;
  const allAboveTheView = spawns.length > 0 && spawns.every((s) => s.worldY >= s.visibleTop - 1);
  const noneInsideTheView = spawns.every((s) => s.worldY > s.visibleTop - 1);
  console.log('\nspawn positions over ' + spawns.length + ' entries at scroll ' + spawn.scrolled + 'm (worldY vs visibleTop):');
  for (const s of spawns.slice(0, 5)) {
    console.log(
      '  ' + s.kind.padEnd(8) + ' worldY=' + String(s.worldY).padStart(8) +
      '  visibleTop=' + String(s.visibleTop).padStart(8) + '  visibleBottom=' + s.visibleBottom,
    );
  }

  // ------------------------------------------------------------ restart
  /**
   * The earlier regression: "start the game and it suddenly becomes 130m, then ends."
   *
   * Checked AFTER a completed level, because a fresh page cannot show it -- which is exactly why the
   * first version of this suite passed while the game was broken.
   */
  const restart = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       g.debugSkipToLevelEnd();
       const t0 = performance.now();
       while (g.diagnostics.phase !== 'burst' && performance.now() - t0 < 8000) await raf();
       const ended = { phase: g.diagnostics.phase, surfaced: g.diagnostics.ending.surfaced };
       const t1 = performance.now();
       while (g.diagnostics.phase !== 'playing' && performance.now() - t1 < 15000) await raf();
       const t2 = performance.now();
       while (performance.now() - t2 < 600) await raf();
       const d = g.diagnostics;
       return JSON.stringify({
         ended,
         phase: d.phase,
         scroll: +d.level.scrolled.toFixed(2),
         headline: g.hudRef.headlineText,
         playerY: +g.player.y.toFixed(1),
         screenY: +g.player.screenY.toFixed(3),
         elapsed: +d.elapsed.toFixed(2)
       });
     })()`,
    true,
  );
  console.log(`\nlevel end: ${JSON.stringify(restart.ended)}`);
  console.log(`after the restart: phase=${restart.phase} scroll=${restart.scroll}m headline="${restart.headline}" screenY=${restart.screenY}`);

  const checks = {
    /**
     * THE POINT OF THE MODEL. Both halves are needed: the scroll rate must be the same whether or not
     * the player is pushing up, AND the bubble must actually move on screen. Testing only the second
     * would pass on the old model, where up moved the bubble by advancing the level.
     */
    scrollIsIndependentOfInput: Math.abs(holdingUp.scrollDelta - idle.scrollDelta) < idle.scrollDelta * 0.25,
    upMovesTheBubbleUpTheScreen: holdingUp.screenDelta > 0.05,
    idleLeavesTheBubbleStill: Math.abs(idle.screenDelta) < 0.02,
    /** The scroll rate matches the level's own configured speed. */
    scrollSpeedMatchesTheLevel:
      Math.abs(idle.scrollDelta / 1.2 - idle.speed) < idle.speed * 0.3,
    // All four directions, on the correct axis and only that axis.
    upMovesUp: up.dScreenY > 0.05 && Math.abs(up.dx) < 0.02,
    downMovesDown: down.dScreenY < -0.05 && Math.abs(down.dx) < 0.02,
    leftMovesLeft: left.dx < -0.1 && Math.abs(left.dScreenY) < 0.02,
    rightMovesRight: right.dx > 0.1 && Math.abs(right.dScreenY) < 0.02,
    // Touch follows the finger on BOTH axes, toward the finger.
    touchMovesRight: drag.dx > 0.1,
    touchMovesUp: drag.dScreenY > 0.05,
    // The bubble stays inside the window it moves in.
    staysWithinTheScreen: bounds.top <= 0.941 && bounds.bottom >= 0.119 && bounds.top > bounds.bottom,
    /**
     * The progress readout must follow the SCROLL, not the bubble.
     *
     * Both halves: the headline must survive the bubble being shoved to the top of the window, and the
     * world depth must actually have changed, or the test would pass on a frozen HUD.
     */
    readoutIgnoresTheBubblesScreenPosition:
      Math.abs(Number(readout.after.headline) - Number(readout.before.headline)) <= 12 &&
      Math.abs(readout.after.depth - readout.before.depth) > 20,
    /** Content enters from ABOVE the view rather than appearing inside it. */
    contentSpawnsAboveTheView: allAboveTheView && noneInsideTheView,
    // The reported restart regression, as separate facts so a failure says which part broke.
    restartResetsTheScroll: restart.scroll < 60,
    restartShowsTheFullDistance: Number(restart.headline) > 1200,
    restartIsActuallyPlaying: restart.phase === 'playing' && restart.elapsed < 6,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('SCROLLER FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
  process.exit(code);
}
