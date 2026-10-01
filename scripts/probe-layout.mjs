// One-off viewport probe: reports the numbers that decide whether the water column lines up with
// the HUD, and whether the text objects actually contain text.
//
// Usage: node scripts/probe-layout.mjs [url] [width] [height]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = Number(process.argv[3] ?? 1280);
const H = Number(process.argv[4] ?? 800);
const PORT = 9334;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-probe-'));
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
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error('no devtools target');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => pending.set(id, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws: ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
        return;
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
  await sleep(3500);

  const r = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const gb = window.__GB;
      const app = gb && gb.game && gb.game.app ? gb.game.app : null;
      const stage = app ? app.stage : null;
      const findTexts = (node, out, depth) => {
        if (!node || depth > 4) return out;
        const label = node.constructor ? node.constructor.name : '?';
        if (label === 'Text' || (node.text !== undefined && typeof node.text === 'string')) {
          out.push({
            text: node.text,
            x: Math.round(node.x),
            y: Math.round(node.y),
            alpha: node.alpha,
            visible: node.visible,
            scaleX: +node.scale.x.toFixed(3),
            width: Math.round(node.width || 0),
            height: Math.round(node.height || 0),
            parent: node.parent ? node.parent.constructor.name : null,
          });
        }
        if (node.children) for (const c of node.children) findTexts(c, out, depth + 1);
        return out;
      };
      return JSON.stringify({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        canvasCss: (() => { const c = document.querySelector('canvas'); return c ? c.style.width + ' x ' + c.style.height + ' | client ' + c.clientWidth + 'x' + c.clientHeight + ' | buffer ' + c.width + 'x' + c.height : null; })(),
        rendererWidth: app ? app.renderer.width : null,
        rendererHeight: app ? app.renderer.height : null,
        resolution: app ? app.renderer.resolution : null,
        viewport: gb ? JSON.parse(JSON.stringify(gb.camera.viewport)) : null,
        bubbleX: gb ? +gb.player.x.toFixed(2) : null,
        // Where the bubble actually lands on screen, and at what fraction of the view height.
        // Asserting this beats eyeballing a screenshot for camera-bias bugs.
        bubbleScreen: gb
          ? {
              x: +gb.camera.toScreenX(gb.player.x).toFixed(1),
              y: +gb.camera.toScreenY(gb.player.y).toFixed(1),
              yRatio: +(gb.camera.toScreenY(gb.player.y) / gb.camera.viewport.height).toFixed(3),
            }
          : null,
        gameplay: gb
          ? {
              phase: gb.game.diagnostics.phase,
              volume: +gb.game.diagnostics.volume.toFixed(3),
              bubbles: gb.game.diagnostics.bubbles,
              absorbed: gb.game.diagnostics.stats.absorbed,
            }
          : null,
        texts: stage ? findTexts(stage, [], 0) : null,
      });
    })()`,
    returnByValue: true,
  });
  console.log(JSON.stringify(JSON.parse(r.result.value), null, 2));
  const vp = JSON.parse(r.result.value).viewport;
  if (vp) {
    const lanePx = vp.laneWidthPx ?? 0;
    console.log(
      `\nlane check: play area x = ${vp.left.toFixed(1)} .. ${(vp.left + lanePx).toFixed(1)}` +
        ` (${lanePx.toFixed(1)}px of ${vp.width}px canvas = ${((lanePx / vp.width) * 100).toFixed(1)}%)`,
    );
    if (vp.laneWidthMeters) {
      console.log(`world: lane ${vp.laneWidthMeters.toFixed(1)}m wide, visible depth ${vp.visibleDepthMeters.toFixed(0)}m`);
    }
  }

  // Screenshot to a file: reading pixels beats inferring layout bugs from object coordinates.
  const shotPath = process.argv[5] ?? join(process.cwd(), 'screenshot.png');
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const { writeFileSync } = await import('node:fs');
  writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('SCREENSHOT: ' + shotPath);

  code = 0;
  cdp.close();
} catch (e) {
  console.error('PROBE FAILED: ' + e.message);
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
