// Compares the game inside the preview's sandboxed iframe against a plain iframe, capturing the
// frame's own console, exceptions, and failed network requests. Answers definitively whether
// sandbox="allow-scripts" (opaque origin) stops the game from booting.
//
// Usage: node .scratch/bubble-ascent/compare-embed.mjs [gameUrl]

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GAME_URL = process.argv[2] ?? 'http://localhost:5173/';
const PARENT_PORT = 4098;
const CDP_PORT = 9399;

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
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

async function runCase(label, sandboxAttr) {
  const html = `<!doctype html><html><body style="margin:0;background:#111">
<iframe id="f" src="${GAME_URL}"${sandboxAttr} allow="autoplay; fullscreen; gamepad" style="border:0;width:900px;height:800px"></iframe>
</body></html>`;
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise((r) => server.listen(PARENT_PORT, '127.0.0.1', r));

  const profile = mkdtempSync(join(tmpdir(), 'gb-cmp-'));
  const chrome = spawn(
    chromePath,
    ['--headless=new', '--no-first-run', '--no-default-browser-check', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`, '--window-size=1000,900', `http://127.0.0.1:${PARENT_PORT}/`],
    { stdio: 'ignore', windowsHide: true },
  );

  let result = { label, sandbox: sandboxAttr || 'none', dom: null, exceptions: [], console: [], logEntries: [] };
  try {
    let targets = null;
    for (let i = 0; i < 80; i++) {
      try {
        targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
        if (targets.some((t) => t.type === 'iframe')) break;
      } catch {
        /* not up */
      }
      await sleep(250);
    }
    await sleep(6000);

    targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const frame = targets.find((t) => t.type === 'iframe');
    if (frame?.webSocketDebuggerUrl) {
      const fcdp = await connect(frame.webSocketDebuggerUrl);
      await fcdp.send('Runtime.enable');
      await fcdp.send('Log.enable');
      await fcdp.send('Network.enable');
      await sleep(2500);
      result.dom = await evalIn(
        fcdp,
        `(() => ({ href: location.href, readyState: document.readyState, hasGB: typeof window.__GB, canvas: document.querySelectorAll('canvas').length, scripts: [...document.querySelectorAll('script')].map((s) => s.src || 'inline'), bodyLen: document.body ? document.body.innerHTML.length : -1 }))()`,
      );
      result.exceptions = fcdp.events
        .filter((e) => e.method === 'Runtime.exceptionThrown')
        .map((e) => (e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text).slice(0, 400));
      result.console = fcdp.events
        .filter((e) => e.method === 'Runtime.consoleAPICalled')
        .map((e) => e.params.type + ': ' + e.params.args.map((x) => x.value ?? x.description ?? x.type).join(' ').slice(0, 250));
      result.logEntries = fcdp.events
        .filter((e) => e.method === 'Log.entryAdded')
        .map((e) => e.params.entry.level + ': ' + e.params.entry.text.slice(0, 250));
      fcdp.close();
    }
  } catch (err) {
    result.error = err.message;
  } finally {
    chrome.kill();
    server.close();
    await sleep(400);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
  return result;
}

const withoutSandbox = await runCase('plain iframe', '');
const withSandbox = await runCase('preview iframe', ' sandbox="allow-scripts"');
const withSameOrigin = await runCase('preview iframe + same-origin', ' sandbox="allow-scripts allow-same-origin"');
console.log(JSON.stringify({ gameUrl: GAME_URL, withoutSandbox, withSandbox, withSameOrigin }, null, 2));
console.log(
  'CHECKS: ' +
    JSON.stringify({
      sandboxOnlyBoots: withSandbox.dom?.hasGB === 'object',
      sandboxSameOriginBoots: withSameOrigin.dom?.hasGB === 'object',
    }),
);
process.exit(withSameOrigin.dom?.hasGB === 'object' ? 0 : 1);
