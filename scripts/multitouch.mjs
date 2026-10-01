// Verifies the two on-screen controls are INDEPENDENT under two simultaneous fingers.
//
// The bug this exists for: dragging to steer blocked the accelerate button, and tapping accelerate
// blocked steering. The cause was that the touch layer tracked exactly ONE pointer id and returned
// early when a second arrived, so whichever finger landed second was silently discarded. That is
// invisible on a desktop mouse -- you cannot press the button and drag at the same time -- which is
// why it survived until it was reported from a phone.
//
// Uses real multi-point touch events through CDP, not direct calls, so the host's own pointer
// routing is exercised too.
//
// Usage: node scripts/multitouch.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = 390;
const H = 844;
const PORT = 9366;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-multi-'));
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
    `--window-size=${W},${H}`,
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
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: W,
    height: H,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await cdp.send('Page.navigate', { url: URL_ARG });

  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!window.__GB', returnByValue: true });
    if (r.result.value === true) break;
  }
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(200);
  }

  const evalJson = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return JSON.parse(r.result.value);
  };

  const geo = await evalJson('JSON.stringify(window.__GB.game.touchGeometry)');
  const buttonX = Math.round(geo.x);
  const buttonY = Math.round(geo.y);
  const waterY = Math.round(H * 0.4);
  const waterLeft = Math.round(W * 0.2);
  const waterRight = Math.round(W * 0.75);

  const state = () =>
    evalJson(
      'JSON.stringify({ ...window.__GB.game.touchState, inputDrag: window.__GB.input.dragTargetX, inputBoost: window.__GB.input.touchBoosting, axisY: window.__GB.input.axisY, x: window.__GB.player.x, mult: window.__GB.player.speedMultiplier })',
    );

  const trace = () => evalJson('JSON.stringify(window.__GB.game.pointerTrace)');
  const clearTrace = () => cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.pointerTrace.length = 0' });

  const results = {};

  // --- 1. Drag first, THEN press the button (finger A = water, finger B = button) ---
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: waterLeft, y: waterY, id: 1 }],
  });
  await sleep(150);
  results.dragOnly = await state();

  // Second finger goes down on the button WITHOUT lifting the first. This is the reported bug.
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: waterLeft, y: waterY, id: 1 },
      { x: buttonX, y: buttonY, id: 2 },
    ],
  });
  // Let the boost ramp move off 1.0 so "did it engage" is measurable, not just a flag.
  await sleep(600);
  results.dragThenBoost = await state();

  // Drag the steering finger while the button is held: the bubble must still move sideways.
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: waterRight, y: waterY, id: 1 },
      { x: buttonX, y: buttonY, id: 2 },
    ],
  });
  await sleep(700);
  results.dragWhileBoosted = await state();

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(400);
  results.allReleased = await state();

  // --- 2. Button first, THEN drag (finger A = button, finger B = water) ---
  await clearTrace();
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: buttonX, y: buttonY, id: 3 }],
  });
  await sleep(500);
  const boostOnlyNow = await state();
  results.boostOnly = boostOnlyNow;
  const traceAfterBoostOnly = await trace();

  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: buttonX, y: buttonY, id: 3 },
      { x: waterLeft, y: waterY, id: 4 },
    ],
  });
  await sleep(200);
  const afterSecond = await state();
  const traceAfterSecond = await trace();
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: buttonX, y: buttonY, id: 3 },
      { x: waterRight, y: waterY, id: 4 },
    ],
  });
  await sleep(700);
  const boostThenDragNow = await state();
  results.boostThenDrag = boostThenDragNow;

  // Lift the STEERING finger (touch id 4, the one at the water position) while the button stays down,
  // and check the boost survives.
  //
  // Which finger actually lifts is decided by CDP's touch-point id; the coordinates are ignored for
  // routing. This payload was verified against the game's own event log: it lifts the water pointer.
  // An earlier version lifted the button by mistake and the resulting state -- boost dropped,
  // steering kept -- looked exactly like a bug in the game rather than in the test.
  await clearTrace();
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [{ x: waterRight, y: waterY, id: 4 }],
  });
  await sleep(300);
  const dragLiftedNow = await state();
  const traceAfterLift = await trace();
  results.waterLiftedBoostKept = dragLiftedNow;

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(300);
  results.end = await state();

  console.log('\nraw pointer ids as the game received them:');
  console.log('  after button-only press : ' + JSON.stringify(traceAfterBoostOnly));
  console.log('  after second finger down: ' + JSON.stringify(traceAfterSecond));
  console.log('  state after second down : ' + JSON.stringify(afterSecond));
  console.log('  events when lifting the drag finger: ' + JSON.stringify(traceAfterLift));

  const rows = [
    ['drag only', results.dragOnly],
    ['+ press button', results.dragThenBoost],
    ['drag while boosted', results.dragWhileBoosted],
    ['all released', results.allReleased],
    ['boost only', results.boostOnly],
    ['+ second finger drags', results.boostThenDrag],
    ['water lifted, boost kept', results.waterLiftedBoostKept],
    ['end', results.end],
  ];
  console.log('step                      steering  boosting  pointers(s/b)  dragTargetX  axisY  playerX   mult');
  for (const [label, r] of rows) {
    console.log(
      `${label.padEnd(24)}  ${String(r.steering).padStart(8)}  ${String(r.boosting).padStart(8)}  ${String(r.steeringPointers + '/' + r.boostPointers).padStart(13)}  ${String(r.inputDrag === null ? 'null' : r.inputDrag.toFixed(2)).padStart(11)}  ${String(r.axisY).padStart(5)}  ${r.x.toFixed(3).padStart(7)}  ${r.mult.toFixed(2)}`,
    );
  }

  // The core claim: both controls live at once, whichever finger arrived first.
  const dragThenBoostBothLive =
    results.dragThenBoost.steering === true && results.dragThenBoost.boosting === true && results.dragThenBoost.axisY === 1;
  // And boosting from the middle of a drag actually accelerates, rather than being swallowed.
  const boostEngagedDuringDrag = results.dragThenBoost.mult > 1.1;
  // Steering still works while the button is held.
  const steeringWhileBoosted = results.dragWhileBoosted.x > results.dragThenBoost.x + 0.05;

  const boostThenDragBothLive =
    boostThenDragNow.steering === true && boostThenDragNow.boosting === true && boostThenDragNow.axisY === 1;
  // Steering must FOLLOW the second finger's drag. Measured after the touchMove, not merely after the
  // touchStart: on placement the target is still the landing point, which can legitimately be to the
  // left of wherever the bubble happens to be, so an earlier sample proves nothing about steering.
  const steeringFollowedSecondFinger =
    boostThenDragNow.x > afterSecond.x + 0.05 && boostThenDragNow.targetX !== null && boostThenDragNow.targetX > 0.5;
  // Which finger lifts must follow CDP's touch-point id. Read it back from the game's own event log
  // so a wrong guess fails loudly as a TEST failure rather than masquerading as a game bug.
  const buttonPointerId = traceAfterBoostOnly.find((e) => e.kind === 'down')?.id;
  const waterPointerId = traceAfterSecond.filter((e) => e.kind === 'down').map((e) => e.id).find((id) => id !== buttonPointerId);
  const liftedId = traceAfterLift.find((e) => e.kind === 'up')?.id;
  const liftTargetedTheWater = liftedId !== undefined && liftedId === waterPointerId;

  // Lifting the steering finger must leave the button held, and steering must stop.
  const boostSurvivesWaterLift =
    liftTargetedTheWater &&
    dragLiftedNow.boosting === true &&
    dragLiftedNow.axisY === 1 &&
    dragLiftedNow.steering === false &&
    dragLiftedNow.boostPointers === 1;

  const releasesCleanly =
    results.allReleased.steering === false && results.allReleased.boosting === false && results.allReleased.inputDrag === null;

  const checks = {
    // The reported bug, both orders.
    dragThenBoostBothLive,
    boostEngagedDuringDrag,
    steeringWhileBoosted,
    boostThenDragBothLive,
    steeringFollowedSecondFinger,
    liftTargetedTheIntendedFinger: liftTargetedTheWater,
    boostSurvivesWaterLift,
    releasesCleanly,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('MULTITOUCH FAILED: ' + e.message);
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
