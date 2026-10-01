// Hosts a parent page of its own on http://127.0.0.1:4099 that embeds the game exactly the way
// the sidebar preview does (sandbox="allow-scripts"), then reports whether the game boots.
//
// This is the faithful shape: sandboxed cross-origin iframe, parent served over HTTP.
//
// Usage: node .scratch/bubble-ascent/verify-embed-http.mjs [gameUrl] [waitMs]

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GAME_URL = process.argv[2] ?? 'http://localhost:5173/';
const WAIT_MS = Number(process.argv[3] ?? 12000);
const PARENT_PORT = 4099;
const CDP_PORT = 9388;

const parentHtml = `<!doctype html><html><body style="margin:0;background:#111">
<iframe id="f" src="${GAME_URL}" sandbox="allow-scripts" allow="autoplay; fullscreen; gamepad" style="border:0;width:900px;height:800px"></iframe>
</body></html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(parentHtml);
});
await new Promise((resolve) => server.listen(PARENT_PORT, '127.0.0.1', resolve));

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
const profile = mkdtempSync(join(tmpdir(), 'gb-http-'));

const chrome = spawn(
  chromePath,
  ['--headless=new', '--no-first-run', '--no-default-browser-check', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`, '--window-size=1000,900', `http://127.0.0.1:${PARENT_PORT}/`],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();
    const events = [];
    ws.addEventListener('open', () =>
      resolve({
        events,
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => pending.set(id, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws error: ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
        return;
      }
      if (msg.method) events.push(msg);
    });
  });
}

const evalIn = async (cdp, expression) => {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  if (r.exceptionDetails) return { __error: r.exceptionDetails.text };
  return r.result?.value;
};

let exitCode = 1;
try {
  let targets = null;
  for (let i = 0; i < 80; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      if (targets.some((t) => t.type === 'page' && t.url.includes(String(PARENT_PORT)))) break;
    } catch {
      /* not up */
    }
    await sleep(250);
  }

  let boot = null;
  let frameReport = null;
  for (let i = 0; i < Math.ceil(WAIT_MS / 1000); i++) {
    await sleep(1000);
    targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const frame = targets.find((t) => t.type === 'iframe');
    if (!frame?.webSocketDebuggerUrl) continue;
    const fcdp = await connect(frame.webSocketDebuggerUrl);
    await fcdp.send('Runtime.enable');
    const dom = await evalIn(
      fcdp,
      `(() => { const gb = window.__GB; const d = gb ? gb.game.diagnostics : null; const c = document.querySelector('canvas'); return JSON.stringify({ href: location.href, readyState: document.readyState, hasGB: typeof window.__GB, frames: d ? d.frames : null, elapsed: d ? +d.elapsed.toFixed(2) : null, depth: gb ? +gb.player.depth.toFixed(2) : null, canvas: c ? c.width + 'x' + c.height : null }); })()`,
    );
    if (dom && !dom.__error) {
      frameReport = JSON.parse(dom);
      if (frameReport.hasGB === 'object' && frameReport.frames > 0) {
        boot = frameReport;
        fcdp.close();
        break;
      }
    }
    fcdp.close();
  }

  console.log(JSON.stringify({ gameUrl: GAME_URL, parent: `http://127.0.0.1:${PARENT_PORT}/`, sandbox: 'allow-scripts', frameReport, boot }, null, 2));
  console.log('CHECKS: ' + JSON.stringify({ gameBooted: boot !== null }));
  exitCode = boot !== null ? 0 : 1;
} catch (err) {
  console.error('HTTP EMBED VERIFY FAILED:', err.message);
  exitCode = 3;
} finally {
  chrome.kill();
  server.close();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(exitCode);
}
