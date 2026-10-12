/**
 * Open the candidate gallery in a real Chrome window, wait for you to pick, and write down what you picked.
 *
 * WHY A BROWSER AT ALL, and why this one. "Batch-select fast" and "decide about the idle animation while you are
 * choosing" are two requirements that only meet in something you can click. A contact sheet PNG is faster to make
 * and worse to use: it cannot carry a decision, so the decision comes back as typing, and typing a decision per
 * candidate is exactly what batch work is bad at.
 *
 * WHY NOT PLAYWRIGHT'S OWN BROWSER. `pnpm exec playwright install chromium` is another 115 MB, and this machine
 * does not have it (`%LOCALAPPDATA%/ms-playwright` is absent) while it does have Chrome. The project already
 * drives Chrome over raw CDP in `scripts/measure-pixels.mjs` and `.scratch/run-check/drive.mjs`; this is the same
 * shape with Node 24's global WebSocket, so it has no dependencies at all.
 *
 * WHY CDP `Browser.close` AND NOT A PROCESS KILL. It was tried the other way first: killing the launcher leaves
 * Chrome's renderer children orphaned, and from a sandboxed shell they could not be killed afterwards (`taskkill`
 * reported "no running instance" while `Get-CimInstance` still listed them). Closing over CDP is in-band, takes
 * the whole browser with it, and needs no privileges. The temp profile is then removed by this process.
 *
 * WHAT IT READS. `window.__gallerySelection` -- a plain object the page keeps up to date. Not a file download
 * (a `file://` page has no reliable way to write one), not `localStorage` (an opaque origin there), not the
 * clipboard (needs a gesture and a permission prompt). A global read over CDP is the one route with no failure
 * mode worth naming.
 *
 * Usage:  node gallery-driver.mjs <gallery.html> <selection.json> [--timeout <seconds>]
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const timeoutFlag = args.indexOf('--timeout');
const portFlag = args.indexOf('--port');
const TIMEOUT_S = timeoutFlag >= 0 ? Number(args[timeoutFlag + 1]) : 3600;
const PORT_WANTED = portFlag >= 0 ? Number(args[portFlag + 1]) : null;

const [pagePath, outPath] = positional;
if (!pagePath || !outPath) {
  console.error('usage: node gallery-driver.mjs <gallery.html> <selection.json> [--timeout <seconds>] [--port <n>]');
  process.exit(2);
}

const chrome = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate));
if (!chrome) {
  console.error(
    `no Chrome found. Looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}\n` +
      'Install Chrome, or open the gallery by hand and copy the JSON out of its footer.',
  );
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A port nothing is already answering on.
//
// It is not a fixed number because a previous run can leave a Chrome behind -- killing one was tried and is
// sometimes refused by the environment, and an orphan holding the port makes the next launch look like "Chrome
// never started". One fetch is cheaper than that confusion.
async function pickPort() {
  for (let port = PORT_WANTED ?? 9444; port < (PORT_WANTED ?? 9444) + 20; port++) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(400) });
      console.log(`port ${port} is answering already, trying the next one`);
    } catch {
      return port;
    }
  }
  console.error('no free debug port in the range tried');
  process.exit(2);
}

const PORT = await pickPort();
const profile = mkdtempSync(join(tmpdir(), 'tgba-gallery-'));
const url = pathToFileURL(resolve(pagePath)).href;

console.log(`gallery: ${url}`);
console.log(`chrome:  ${chrome}`);
console.log(`port:    ${PORT}`);
console.log('pick in the window that just opened, then press 完成选择.\n');

const child = spawn(
  chrome,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--new-window',
    url,
  ],
  { stdio: 'ignore', windowsHide: false },
);

let socket = null;
let send = null;

async function cleanup(code) {
  try {
    if (send) await Promise.race([send('Browser.close'), sleep(3000)]);
  } catch {
    /* the browser may already be gone; that is the outcome we wanted */
  }
  try {
    socket?.close();
  } catch {
    /* already closed */
  }
  try {
    await sleep(500);
    rmSync(profile, { recursive: true, force: true });
  } catch {
    console.log(`note: could not remove the temp profile at ${profile}`);
  }
  process.exit(code);
}

async function attach() {
  // 180s, not 60. Launching Chrome on this machine has taken over two minutes when the profile is cold and the
  // machine is busy, and a timeout that fires during a normal launch reads as "the driver is broken".
  for (let attempt = 0; attempt < 360; attempt++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && t.url.startsWith('file:'));
      if (page) return page;
    } catch {
      /* the port is not up yet */
    }
    await sleep(500);
  }
  return null;
}

const page = await attach();
if (!page) {
  console.error(`Chrome never exposed a file:// page target on port ${PORT} within 180s.`);
  console.error('Open the gallery by hand instead and paste the JSON from its footer -- nothing is lost.');
  await cleanup(1);
}

socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  socket.onopen = res;
  socket.onerror = rej;
});

let sequence = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { res, rej } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? rej(new Error(JSON.stringify(message.error))) : res(message.result);
  }
};
send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++sequence;
    pending.set(id, { res, rej });
    socket.send(JSON.stringify({ id, method, params }));
  });

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

// Wait until the page's OWN script has run.
//
// Attaching as soon as the target appears is too early: measured, `window.__gallerySelection` was still
// `undefined` at that moment while the document was loading. The polling below would survive that -- an undefined
// `__galleryDone` is not `true`, so it keeps waiting -- but a page that FAILED to load is indistinguishable from a
// slow one, and the driver would then sit silently until its timeout. This turns that into a clear verdict.
let ready = false;
for (let attempt = 0; attempt < 240 && !ready; attempt++) {
  try {
    ready = (await evaluate('typeof window.__galleryDone')) === 'boolean';
  } catch {
    /* still navigating */
  }
  if (!ready) await sleep(250);
}
if (!ready) {
  console.error(`the page at ${url} never ran its script -- the gallery may be truncated or corrupt.`);
  await cleanup(1);
}
console.log('page ready.');

console.log('waiting for 完成选择 ...');
const deadline = Date.now() + TIMEOUT_S * 1000;
let done = false;
while (Date.now() < deadline && !done) {
  if (child.exitCode !== null) {
    console.error('Chrome exited before a selection was made.');
    await cleanup(1);
  }
  try {
    done = await evaluate('window.__galleryDone === true');
  } catch {
    /* navigation or a transient detach; try again */
  }
  if (!done) await sleep(700);
}

if (!done) {
  console.error(`no selection after ${TIMEOUT_S}s -- leaving nothing behind.`);
  await cleanup(1);
}

const raw = await evaluate('JSON.stringify(window.__gallerySelection)');
const selection = JSON.parse(raw ?? '{"picks":[]}');
writeFileSync(resolve(outPath), JSON.stringify(selection, null, 2) + '\n', 'utf-8');

console.log(`\n${selection.picks.length} pick(s):`);
for (const pick of selection.picks) {
  console.log(`  ${pick.name} 候选 ${pick.candidate}${pick.idle ? '  + idle 动画' : '  不要 idle'}`);
}
console.log(`\nwritten to ${resolve(outPath)}`);
console.log('now run:  asset_flow.py select --batch <name>');

await cleanup(0);
