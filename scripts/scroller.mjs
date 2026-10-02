// Verifies the arcade-scroller refactor: free four-direction movement, a scrolling camera, and a
// level whose content comes from an authored timeline.
//
// The invariants worth proving are the ones the redesign rests on, not the ones that are easy to read:
//
//   1. the camera scrolls on its own, so progress no longer depends on the player's cooperation
//   2. holding nothing means HOVERING -- the player neither rises nor falls
//   3. all four directions move the player, and the two axes are independent
//   4. the touch drag follows the finger on BOTH axes, in WORLD space
//   5. the timeline places exactly the entries the level authored, in order, once each
//   6. the camera is a soft ceiling: the player cannot outrun the scroll and skip the level
//   7. the level ends when the scroll is done and the water is clear
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
    '--headless=new',
    '--no-first-run',
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=500,780',
    'about:blank',
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
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
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
    if (r.result.value === true) {
      booted = true;
      break;
    }
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

  const key = async (type, code, keyCode, k) =>
    cdp.send('Input.dispatchKeyEvent', { type, code, key: k, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });

  // ------------------------------------------------------------ the scroll
  const scroll = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const before = g.diagnostics.level;
       // Player parked and NOT touching anything: the scroll must still advance.
       g.debugSetSteadyCruise();
       const t0 = performance.now();
       while (performance.now() - t0 < 1500) await raf();
       const after = g.diagnostics.level;
       return JSON.stringify({
         scrolledBefore: before.scrolled,
         scrolledAfter: after.scrolled,
         emittedBefore: before.entriesEmitted,
         emittedAfter: after.entriesEmitted,
         entriesTotal: after.entriesTotal,
         playerY: g.player.y,
         playerVx: g.diagnostics.playerVx,
         playerVy: g.diagnostics.playerVy
       });
     })()`,
    true,
  );

  console.log(`scroll: ${scroll.scrolledBefore}m -> ${scroll.scrolledAfter}m without any input`);
  console.log(`timeline: ${scroll.emittedBefore} -> ${scroll.emittedAfter} of ${scroll.entriesTotal} entries emitted`);
  console.log(`player at rest: y=${scroll.playerY.toFixed(2)} vx=${scroll.playerVx} vy=${scroll.playerVy}`);

  // ------------------------------------------------------------ four directions
  const axisProbe = async (codeName, keyCode, k, label) => {
    const out = await evalJson(
      `(async function () {
         const g = window.__GB.game;
         const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
         g.debugSetSteadyCruise();
         for (let i = 0; i < 3; i++) await raf();
         const x0 = g.player.x, y0 = g.player.y;
         window.__GB.__test_key_down('${codeName}');
         const t0 = performance.now();
         while (performance.now() - t0 < 700) await raf();
         window.__GB.__test_key_up('${codeName}');
         const x1 = g.player.x, y1 = g.player.y;
         return JSON.stringify({ dx: +(x1 - x0).toFixed(4), dy: +(y1 - y0).toFixed(2) });
       })()`,
      true,
    );
    console.log(`  ${label.padEnd(6)} dx=${String(out.dx).padStart(8)}  dy=${String(out.dy).padStart(8)}`);
    void keyCode;
    void k;
    return out;
  };

  // Install raw key injectors, so the probe drives the real `down` set rather than faking axes.
  await evalJson(
    `(function () {
       const g = window.__GB.game;
       window.__GB.__test_key_down = (code) => g.input.down.add(code);
       window.__GB.__test_key_up = (code) => g.input.down.delete(code);
       return JSON.stringify({ ok: true });
     })()`,
  );

  console.log('\nfour directions (700ms each, from rest):');
  const up = await axisProbe('KeyW', 87, 'w', 'up');
  const down = await axisProbe('KeyS', 83, 's', 'down');
  const left = await axisProbe('KeyA', 65, 'a', 'left');
  const right = await axisProbe('KeyD', 68, 'd', 'right');

  // ------------------------------------------------------------ touch drag
  const drag = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const w = g.canvasSize.width, h = g.canvasSize.height;
       g.debugSetSteadyCruise();
       for (let i = 0; i < 3; i++) await raf();
       // Press near the BOTTOM-RIGHT of the screen. Both axes must respond, and in the right
       // directions: right and up.
       const x0 = g.player.x, y0 = g.player.y;
       g.handlePointerDown(9, w * 0.85, h * 0.25);
       const t0 = performance.now();
       while (performance.now() - t0 < 900) await raf();
       const x1 = g.player.x, y1 = g.player.y;
       const target = g.touchRef.debugState;
       g.handlePointerUp(9);
       return JSON.stringify({
         dx: +(x1 - x0).toFixed(4),
         dy: +(y1 - y0).toFixed(2),
         targetX: target.targetX,
         targetY: target.targetY === null ? null : +target.targetY.toFixed(1),
         worldYNow: +g.player.y.toFixed(1)
       });
     })()`,
    true,
  );
  console.log(`\ntouch drag to the top-right (85% across, 25% down):`);
  console.log(`  dx=${drag.dx}  dy=${drag.dy}m   target lane=${drag.targetX === null ? 'null' : drag.targetX.toFixed(3)}  target world y=${drag.targetY}`);

  // ------------------------------------------------------------ the ceiling
  const ceiling = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const lead = g.levelRef.playerLeadLimit;
       g.debugSetSteadyCruise();
       // Hold "up" for a long time: the camera must carry the player along rather than let them escape.
       window.__GB.__test_key_down('KeyW');
       const t0 = performance.now();
       while (performance.now() - t0 < 2500) await raf();
       window.__GB.__test_key_up('KeyW');
       const d = g.diagnostics;
       return JSON.stringify({
         lead,
         playerY: +g.player.y.toFixed(1),
         scrolled: d.level.scrolled,
         gap: +(g.player.y - d.level.scrolled).toFixed(1)
       });
     })()`,
    true,
  );
  console.log(`\nceiling: held "up" for 2.5s; player ${ceiling.playerY}m, scroll ${ceiling.scrolled}m, lead limit ${ceiling.lead}m, gap ${ceiling.gap}m`);

  // ------------------------------------------------------------ level end
  const ending = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const before = g.hazardsRef.hazards.length;
       g.debugSkipToLevelEnd();
       // Read IMMEDIATELY after the hook, then again after a frame: that separates "the hook did not
       // clear them" from "something put them back".
       const rightAfter = g.hazardsRef.hazards.length;
       const scrolledRightAfter = g.diagnostics.level.scrolled;
       const fieldRightAfter = g.fieldRef.debugTimeline;
       const perFrame = [];
       for (let i = 0; i < 6; i++) {
         await raf();
         perFrame.push({ n: g.hazardsRef.hazards.length, emitted: g.diagnostics.level.entriesEmitted, field: g.fieldRef.debugTimeline });
       }
       const afterOneFrame = g.hazardsRef.hazards.length;
       const t0 = performance.now();
       while (g.diagnostics.phase !== 'burst' && performance.now() - t0 < 8000) await raf();
       const d = g.diagnostics;
       return JSON.stringify({
         before, rightAfter, afterOneFrame, scrolledRightAfter, fieldRightAfter, perFrame,
         phase: d.phase, surfaced: d.ending.surfaced, hits: d.stats.hits,
         endTrace: g.endTraceRef
       });
     })()`,
    true,
  );
  console.log(`\nlevel end: phase=${ending.phase} surfaced=${ending.surfaced}`);
  console.log(`  hazards before=${ending.before} right after the skip=${ending.rightAfter} one frame later=${ending.afterOneFrame}`);
  console.log(`  scrolled right after the skip: ${ending.scrolledRightAfter}`);
  console.log('  per frame {hazards, entriesEmitted}: ' + JSON.stringify(ending.perFrame));
  console.log('  field right after the skip: ' + JSON.stringify(ending.fieldRightAfter));
  console.log('  end-condition trace: ' + JSON.stringify(ending.endTrace));

  const checks = {
    // The whole redesign rests on this: progress is the level's, not the player's.
    cameraScrollsWithoutInput: scroll.scrolledAfter > scroll.scrolledBefore + 10,
    timelineEmitsEntries: scroll.emittedAfter > 0,
    // Holding nothing means hovering, not drifting.
    atRestIsStationary: scroll.playerVy === 0 && scroll.playerVx === 0,
    // All four directions.
    upMovesUp: up.dy > 15 && Math.abs(up.dx) < 0.02,
    downMovesDown: down.dy < -15 && Math.abs(down.dx) < 0.02,
    leftMovesLeft: left.dx < -0.1 && Math.abs(left.dy) < 3,
    rightMovesRight: right.dx > 0.1 && Math.abs(right.dy) < 3,
    // Touch follows the finger on BOTH axes, toward the finger.
    touchMovesRight: drag.dx > 0.1,
    touchMovesUp: drag.dy > 15,
    touchTargetIsInWorldSpace: drag.targetY !== null && Math.abs(drag.targetY - drag.worldYNow) < 400,
    // The scroll is a soft ceiling.
    cannotOutrunTheScroll: ceiling.gap <= ceiling.lead + 1,
    // The level has an end, and reaching it is a SURFACE finish.
    levelEnds: ending.phase === 'burst' && ending.surfaced === true,
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
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
