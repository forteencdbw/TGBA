// Verifies the BUILT artifact actually runs.
//
// Every other check in this repo drives the dev server, which serves the SOURCE through Vite. None of them
// would notice the things that only go wrong in a build: a module that fails to resolve once bundled, an
// asset referenced by an absolute path that breaks in a subdirectory, a minifier that mangles something.
//
// So this serves `dist/` as plain static files, on a path with a SUBDIRECTORY, and checks the game boots
// there. The subdirectory is deliberate: `base: './'` exists so the game can be hosted under a path rather
// than at a domain root, and an absolute reference would pass at the root and fail here.
//
// Usage: node scripts/verify-dist.mjs [port]

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? 4178);
const ROOT = join(process.cwd(), 'dist');
/** A subdirectory, so a path that only works at a domain root shows up as a failure. */
const PREFIX = '/bubble/';

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error('no dist/index.html -- run the build first');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
};

const requests = [];
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!url.pathname.startsWith(PREFIX)) {
    res.writeHead(404).end('outside the app prefix');
    return;
  }
  const rel = decodeURIComponent(url.pathname.slice(PREFIX.length)) || 'index.html';
  const file = join(ROOT, normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  try {
    const body = readFileSync(file);
    requests.push({ path: url.pathname, status: 200, bytes: body.length });
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    requests.push({ path: url.pathname, status: 404, bytes: 0 });
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${PORT}${PREFIX}`;
console.log(`serving dist/ at ${BASE}`);

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('no chrome');
  server.close();
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'gb-dist-'));
const DEBUG_PORT = PORT + 1;
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`,
    '--window-size=390,844', 'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let code = 1;
try {
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const page = (await res.json()).find((t) => t.type === 'page');
      ws = page?.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    if (!ws) await sleep(250);
  }
  if (!ws) throw new Error('no devtools target');

  const sock = new WebSocket(ws);
  let id = 1;
  const pending = new Map();
  const errors = [];
  await new Promise((r) => sock.addEventListener('open', r));
  sock.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(String(m.params?.exceptionDetails?.exception?.description ?? '').split('\n')[0]);
    }
    if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') {
      errors.push('log: ' + m.params.entry.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = id++;
      pending.set(i, r);
      sock.send(JSON.stringify({ id: i, method, params }));
    });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: BASE });

  let booted = false;
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await send('Runtime.evaluate', { expression: '!!(window.__GB && window.__GB.game)', returnByValue: true });
    if (r.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) throw new Error('the built game never exposed __GB -- check the console errors above');

  /**
   * The game BOOTS INTO THE MENU, so reaching gameplay means pressing start.
   *
   * This used to wait for `playing` on its own, which was right until the menu was added -- and then the wait
   * timed out while the built game was sitting there perfectly healthy, one tap from running. The assertion
   * that the bundle works has to exercise the path a player takes.
   */
  await send('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__GB.game;
      const b = g.menuRef.geometry.button;
      g.handlePointerDown(900, b.x + b.w / 2, b.y + b.h / 2);
      g.handlePointerUp(900);
      return 'started';
    })()`,
    returnByValue: true,
  });

  let phase = null;
  for (let i = 0; i < 90; i++) {
    const r = await send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    phase = r.result.value;
    if (phase === 'playing') break;
    await sleep(200);
  }

  // Let it run, then read a few things a broken bundle would get wrong.
  await sleep(1500);
  const r = await send('Runtime.evaluate', {
    expression: `JSON.stringify((() => {
      const g = window.__GB.game;
      const d = g.diagnostics;
      const canvas = document.querySelector('canvas');
      return {
        phase: d.phase,
        frames: d.frames,
        level: d.level.id,
        scrollLength: d.level.scrollLength,
        scrollSpeed: d.level.scrollSpeed,
        scrolled: d.level.scrolled,
        laneWidthPx: Math.round(g.camera.viewport.laneWidthPx),
        canvasW: canvas ? canvas.clientWidth : 0,
        canvasH: canvas ? canvas.clientHeight : 0,
        bubbles: d.bubbles,
        audioMuted: d.audio.muted
      };
    })())`,
    returnByValue: true,
  });
  const state = JSON.parse(r.result.value);

  const failedRequests = requests.filter((q) => q.status !== 404 ? false : true);
  const jsRequests = requests.filter((q) => q.path.endsWith('.js'));
  const totalJs = jsRequests.reduce((a, q) => a + q.bytes, 0);

  console.log('\nrequests served:');
  for (const q of requests.slice(0, 12)) console.log(`  ${String(q.status).padStart(3)}  ${(q.bytes / 1024).toFixed(1).padStart(8)} kB  ${q.path}`);
  if (requests.length > 12) console.log(`  ... and ${requests.length - 12} more`);

  console.log('\nstate after the bundle loaded: ' + JSON.stringify(state));

  const checks = {
    gameBootedFromTheBundle: booted === true,
    reachedPlaying: state.phase === 'playing',
    framesAdvancing: state.frames > 30 && state.scrolled > 5,
    canvasSized: state.canvasW > 100 && state.canvasH > 100,
    laneFitsTheCanvas: state.laneWidthPx > 0 && state.laneWidthPx <= state.canvasW + 1,
    noMissingAssets: failedRequests.length === 0,
    noConsoleErrors: errors.length === 0,
  };
  if (errors.length) console.log('\nconsole errors: ' + JSON.stringify(errors.slice(0, 5)));
  console.log(`\nbundle: ${jsRequests.length} js files, ${(totalJs / 1024).toFixed(0)} kB on the wire (uncompressed)`);
  console.log('CHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
} catch (e) {
  console.error('VERIFY-DIST FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  server.close();
  await sleep(200);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
