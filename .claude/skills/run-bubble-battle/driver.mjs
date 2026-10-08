#!/usr/bin/env node
/**
 * =================================================================================================
 * DRIVER: headless Chrome + CDP for 冒泡大作战 / Bubble Battle
 * =================================================================================================
 * The game is a Pixi canvas with no DOM to query -- but it exposes `window.__GB`, a deliberate seam that
 * carries the full diagnostics tree and the test hooks (`startRun`, `spawnBubbleOnPlayer`, ...). So the
 * two handles an agent actually needs are: real input into the canvas, and `__GB` reads back out.
 * This driver gives both, and nothing else.
 *
 * WHY NOT PLAYWRIGHT
 * ------------------
 * `AGENTS.md` says do not run Playwright, and the project's own `windows`-side `pnpm test` path needs a
 * ~150 MB `playwright install chromium` that is not present on a clean machine. The system Chrome is
 * already here, and Node 24 has a global `WebSocket`, so this driver needs ZERO dependencies and no
 * download. It is agent tooling, not product surface -- that is why it lives in the skill directory and
 * why it is allowed to be a bit blunt.
 *
 * USAGE
 * -----
 *   node driver.mjs                      # interactive REPL (reads stdin, one command per line)
 *   printf 'launch\nstart\nwait 3000\nshot level\n' | node driver.mjs
 *
 * Every command prints one line. Screenshots go to `<repo>/.scratch/run-check/`, which `.gitignore`
 * already covers (`.scratch/**\/*.png`), so nothing this driver writes can dirty the tree.
 *
 * The Chrome profile lives in the OS temp dir on purpose: a profile directory under `.scratch/` would
 * NOT be ignored by `.gitignore` and would show up as thousands of untracked files in `git status`.
 *
 * COMMANDS
 *   launch [url]      start headless Chrome (or reuse one) and load the page, waiting for `__GB`
 *   goto <url>        navigate and wait for `__GB` again
 *   start             begin a run through the game's own hook: `__GB.game.startRun()`
 *   menu              click the menu's REAL start button, at the geometry the game reports
 *   state [path]      print `__GB.game.diagnostics` (or a dotted path into it, e.g. `stage.stage`)
 *   eval <expr>       evaluate a JS expression in the page, print the JSON
 *   shot [name]       screenshot to .scratch/run-check/<name>.png (default: shot-<n>)
 *   click <x> <y>     real pointer event at CSS-pixel viewport coordinates
 *   tap <code>        press+release a key by `KeyboardEvent.code` (Space, ArrowRight, KeyW, ...)
 *   hold <code> <ms>  hold a key down for ms (the game reads `e.code`; see src/input.ts)
 *   wait <ms>         sleep
 *   size <w> <h>      viewport in CSS pixels (default 390x844 -- the phone the suite uses)
 *   console           dump captured console output and exceptions
 *   quit              close the browser and exit
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

// ---------------------------------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------------------------------

/** The repo root: the nearest ancestor of this file that has a package.json. */
function findRoot(start) {
  let d = start;
  for (;;) {
    if (existsSync(join(d, 'package.json'))) return d;
    const up = dirname(d);
    if (up === d) return start;
    d = up;
  }
}

const ROOT = process.env.GB_ROOT ?? findRoot(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'));
const PORT = Number(process.env.GB_CDP_PORT ?? 9222);
const URL_DEFAULT = process.env.GB_URL ?? 'http://localhost:5173/';
const SHOT_DIR = process.env.GB_SHOT_DIR ?? join(ROOT, '.scratch', 'run-check');
const PROFILE = join(tmpdir(), 'gb-cdp-profile');

/** Windows install path; override with GB_CHROME on another machine or OS. */
const CHROME =
  process.env.GB_CHROME ??
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'google-chrome');

// ---------------------------------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpJson(path) {
  try {
    return await (await fetch(`http://127.0.0.1:${PORT}${path}`)).json();
  } catch {
    return null;
  }
}

/**
 * Start Chrome if nothing is listening on the debug port yet.
 *
 * Detached and unref'd so the driver can exit without taking the browser with it... except that we DO
 * want it gone on `quit`, hence the recorded pid. A stale Chrome from a killed driver is harmless: the
 * next run reuses it.
 */
async function ensureChrome() {
  if (await cdpJson('/json/version')) return 'reused';
  if (!existsSync(CHROME) && process.platform === 'win32') {
    throw new Error(`Chrome not found at ${CHROME} -- set GB_CHROME to its path`);
  }
  mkdirSync(PROFILE, { recursive: true });
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      // Software GL. The container has no GPU, and without this Pixi gets a context it cannot draw to
      // and the screenshots come back uniformly black -- which reads as "the game is broken".
      '--use-gl=swiftshader',
      '--enable-unsafe-swiftshader',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      `--remote-debugging-port=${PORT}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${PROFILE}`,
      'about:blank',
    ],
    { detached: true, stdio: 'ignore' },
  );
  proc.unref();
  chromeProc = proc;

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await cdpJson('/json/version')) return `started (pid ${proc.pid})`;
  }
  throw new Error(`Chrome did not open a debug port on ${PORT} within 15s`);
}

let chromeProc = null;

// ---------------------------------------------------------------------------------------------------
// CDP connection
// ---------------------------------------------------------------------------------------------------

let ws = null;
let nextId = 0;
const pending = new Map();
const logs = [];

async function connect() {
  if (ws) return;
  const list = await cdpJson('/json/list');
  const page = (list ?? []).find((t) => t.type === 'page');
  if (!page) throw new Error('no page target; is Chrome running with --remote-debugging-port?');

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error('websocket to Chrome failed'));
  });

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej, timer } = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(timer);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      return;
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ');
      logs.push(`[${msg.params.type}] ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push(`[EXCEPTION] ${d.text} ${d.exception?.description ?? ''}`);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await setSize(390, 844);
}

function send(method, params = {}, timeoutMs = 30_000) {
  return new Promise((res, rej) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      rej(new Error(`${method} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    pending.set(id, { res, rej, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/** Evaluate an expression in the page and hand back a JSON-safe value. */
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression: `JSON.stringify(${expression})`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  }
  return r.result.value === undefined ? undefined : JSON.parse(r.result.value);
}

async function setSize(width, height) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
}

/**
 * Load a URL and wait for `window.__GB`.
 *
 * `__GB` is assigned in `Game`'s constructor (see e2e/helpers.ts `boot`), so waiting on it is the honest
 * "the game is up" signal -- far better than a sleep, which is a guess about how long Pixi takes to
 * build its textures under software rendering.
 */
async function goto(url) {
  await send('Page.navigate', { url });
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      if (await evaluate('Boolean(window.__GB)')) return;
    } catch {
      // Mid-navigation the execution context is gone; that is expected, not an error.
    }
    if (Date.now() > deadline) throw new Error(`__GB never appeared at ${url} after 30s`);
    await sleep(250);
  }
}

// ---------------------------------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------------------------------

let shotCount = 0;

async function shot(name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const file = join(SHOT_DIR, `${name ?? `shot-${++shotCount}`}.png`);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(file, Buffer.from(data, 'base64'));
  return file;
}

async function click(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
  }
}

async function keyEvent(type, code) {
  // The game reads `e.code` (src/input.ts), and CDP wants the virtual key codes for the same thing.
  const VK = { Space: 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Enter: 13, Escape: 27 };
  await send('Input.dispatchKeyEvent', {
    type,
    code,
    key: code.startsWith('Key') ? code.slice(3).toLowerCase() : code,
    windowsVirtualKeyCode: VK[code] ?? 0,
    nativeVirtualKeyCode: VK[code] ?? 0,
  });
}

const commands = {
  async launch(arg) {
    const how = await ensureChrome();
    await connect();
    await goto(arg ?? URL_DEFAULT);
    return `chrome ${how}; loaded ${arg ?? URL_DEFAULT}; __GB up`;
  },

  async goto(url) {
    await goto(url);
    return `loaded ${url}`;
  },

  /** Begin a run without touching the menu -- the game's own hook. */
  async start() {
    await evaluate('window.__GB.game.startRun()');
    return 'startRun() called';
  },

  /**
   * Click the menu's real start button at the geometry the GAME reports.
   *
   * Deliberately not a hardcoded coordinate: the button is Pixi geometry hit-tested by the game, so a
   * click at the reported centre is a real input at a real place -- and it fails loudly if the layout
   * moved instead of silently clicking whatever is now at (250, 490).
   */
  async menu() {
    const b = await evaluate(
      '(({x, y, w, h}) => ({x: x + w / 2, y: y + h / 2}))(window.__GB.game.menuRef.geometry.button)',
    );
    await click(b.x, b.y);
    return `clicked menu start button @ ${Math.round(b.x)},${Math.round(b.y)}`;
  },

  async state(path) {
    const expr = path ? `window.__GB.game.diagnostics.${path}` : 'window.__GB.game.diagnostics';
    return JSON.stringify(await evaluate(expr), null, path ? 0 : 1);
  },

  async eval(expr) {
    return JSON.stringify(await evaluate(expr));
  },

  async shot(name) {
    return `wrote ${await shot(name)}`;
  },

  async click(x, y) {
    await click(Number(x), Number(y));
    return `click @ ${x},${y}`;
  },

  async tap(code) {
    await keyEvent('rawKeyDown', code);
    await sleep(50);
    await keyEvent('keyUp', code);
    return `tap ${code}`;
  },

  async hold(code, ms) {
    await keyEvent('rawKeyDown', code);
    await sleep(Number(ms));
    await keyEvent('keyUp', code);
    return `held ${code} for ${ms}ms`;
  },

  async wait(ms) {
    await sleep(Number(ms));
    return `waited ${ms}ms`;
  },

  async size(w, h) {
    await setSize(Number(w), Number(h));
    return `viewport ${w}x${h}`;
  },

  async console() {
    return logs.length ? logs.join('\n') : '(no console output)';
  },

  async quit() {
    if (ws) ws.close();
    if (chromeProc) chromeProc.kill();
    return 'closed';
  },
};

// ---------------------------------------------------------------------------------------------------
// REPL
// ---------------------------------------------------------------------------------------------------

async function runLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const sp = trimmed.indexOf(' ');
  const name = sp === -1 ? trimmed : trimmed.slice(0, sp);
  const rest = sp === -1 ? '' : trimmed.slice(sp + 1).trim();
  const fn = commands[name];
  if (!fn) return `ERR unknown command: ${name}`;
  // `state "spit.contents"` is how a dotted path gets typed; the quotes are the shell's, not the path's.
  const arg = name === 'state' ? rest.replace(/^"(.*)"$/, '$1') : rest;
  try {
    if (name === 'size' || name === 'click' || name === 'hold') {
      const [a, b] = rest.split(/\s+/);
      return `ok ${await fn(a, b)}`;
    }
    return `ok ${await fn(arg || undefined)}`;
  } catch (e) {
    return `ERR ${e.message}`;
  }
}

const argv = process.argv.slice(2);
if (argv.length) {
  for (const line of argv) console.log(await runLine(line));
  await runLine('quit');
  process.exit(0);
}

console.log(`# bubble-battle driver -- repo ${ROOT}`);
console.log(`# screenshots -> ${SHOT_DIR}`);

const rl = createInterface({ input: process.stdin });
let chain = Promise.resolve();
rl.on('line', (line) => {
  chain = chain.then(async () => {
    const out = await runLine(line);
    if (out !== null) console.log(out);
  });
});
rl.on('close', async () => {
  await chain;
  await runLine('quit');
  process.exit(0);
});
