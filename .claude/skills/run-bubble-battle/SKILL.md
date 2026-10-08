---
name: run-bubble-battle
description: Build, run, and drive 冒泡大作战 / Bubble Battle. Use when asked to start the game, launch the dev server, build or typecheck it, take a screenshot of the menu or a level, spawn a creature, or otherwise interact with the running game in a browser.
---

冒泡大作战 / Bubble Battle is a Vite + PixiJS vertical-scrolling arcade game: a single canvas, no DOM to
query. It is driven two ways, and they answer different questions:

- **In a browser** — `node .claude/skills/run-bubble-battle/driver.mjs`, a headless-Chrome + CDP REPL with
  **zero dependencies**. Use it when the question is about what a player sees (rendering, layout, feel,
  menus) or about real input reaching the canvas.
- **With no browser at all** — `node scripts/probe-*.mjs`, which load `src/*.ts` through Vite's SSR
  transform and call internals directly. Use it when the question is about a rule inside `Run`. It is
  seconds instead of minutes and cannot be fooled by a rendering bug.

All paths below are relative to the repo root (`TGBA/`).

## Prerequisites

Windows, and nothing to install system-wide beyond what is already here:

- **Node 24** — the driver uses the global `WebSocket` (Node ≥ 22). Check: `node -v`.
- **Google Chrome** at the default install path — no `playwright install chromium` needed, and none is
  present. Override with `GB_CHROME` if it lives elsewhere.
- **No pnpm on PATH.** Use `corepack`, which ships with Node.

There is no `apt-get` line for this one; it is not a Linux container.

## Setup

```bash
corepack pnpm@9 install
```

The lockfile is `lockfileVersion: 9.0`, which is why it is pinned to pnpm 9. One-time.

## Build

```bash
corepack pnpm@9 typecheck   # tsc over src/, e2e/, and vite.config.ts — the bar per AGENTS.md
corepack pnpm@9 build       # typecheck + vite build -> dist/ (dist/ is gitignored)
```

`build` also stamps `__APP_VERSION__` / `__GIT_HASH__` / `__GIT_DIRTY__` into the bundle from `package.json`
and git. In dev those are read **once, at server start** — see Gotchas.

## Run (agent path)

Start the dev server, then drive it.

```bash
# 1. dev server, background. Prints "ready in ... ms" and both URLs.
corepack pnpm@9 dev
```

`vite.config.ts` sets `host: true`, so the Network URL it prints is reachable from a phone on the same
WiFi. Started this way the server keeps running across turns — and note that stopping the task is *not*
enough to stop it; see Gotchas for freeing the port.

```bash
# 2. the driver. Commands on stdin, one per line; stdout is `ok <result>` or `ERR <reason>`.
cd <repo-root>
printf 'launch\nstart\nhold ArrowRight 900\nshot level\nstate stage\nquit\n' \
  | node .claude/skills/run-bubble-battle/driver.mjs
```

Launch it with no stdin for an interactive REPL. `launch` starts Chrome itself if the debug port is idle
and reuses it otherwise, loads `http://localhost:5173/`, and **waits for `window.__GB`** rather than
sleeping — that is the honest "the game is up" signal.

| command | what it does |
|---|---|
| `launch [url]` | start/reuse headless Chrome, load the page, wait for `__GB` |
| `goto <url>` | navigate again, wait for `__GB` |
| `start` | begin a run via the game's own hook `__GB.game.startRun()` — skips the menu |
| `menu` | click the menu's **real** start button, at the geometry the game reports |
| `state [path]` | print `__GB.game.diagnostics`, or a dotted path into it (`state stage`, `state "score.value"`) |
| `eval <expr>` | evaluate any expression in the page, print the JSON |
| `shot [name]` | screenshot to `.scratch/run-check/<name>.png` |
| `click <x> <y>` | real pointer event at CSS-pixel viewport coordinates |
| `hold <code> <ms>` | hold a key down. The game reads `e.code`: `Space`, `ArrowRight`, `KeyW`, … |
| `tap <code>` | press + release |
| `wait <ms>` / `size <w> <h>` | sleep / set viewport (default 390×844, the phone the suite uses) |
| `console` | dump captured console output and exceptions |
| `quit` | close the browser |

Screenshots land in `.scratch/run-check/`. That is deliberate: `.gitignore` covers
`.scratch/**/*.png`, so the driver cannot dirty the tree. **Look at the screenshot** — with software GL
a broken Pixi context comes back uniformly black, which reads as "the game is broken" when it is not.

`state` is the deep handle. `__GB.game.diagnostics` carries the whole game as values — `phase`, `score`,
`stage`, `hazards`, `bullets`, `spit`, `stomach`, `digest`, `obstacles`, `lateral`, `build` — so
"did the thing happen" is answered by reading a number, not by squinting at a canvas.

## Run (agent path, no browser)

For a rule that lives inside `Run`, skip the browser entirely. This is the same Vite SSR trick the
existing probes use:

```bash
node scripts/probe-run.mjs          # -> "ALL CHECKS PASSED" (15 checks)
```

A probe boots real modules with no `Game`, no Pixi, no camera:

```js
const server = await createServer({ root, server: { middlewareMode: true }, logLevel: 'error' });
const { Run } = await server.ssrLoadModule('/src/run.ts');
const r = new Run();
r.phase = 'playing';
r.takeHit();
// ...assert on r.phase, r.events, r.player.volume
await server.close();
```

`Run`'s input is a plain object of six fields (see the `input()` stub in `scripts/probe-run.mjs`), and its
output is an event queue, so both sides of the seam are values. Copy that file as a template — it is the
worked example of the whole pattern.

## Run (human path)

```bash
corepack pnpm@9 dev    # -> http://localhost:5173/, Ctrl-C to stop
```

A browser window you can actually play. Same server as the agent path.

## Test

Per `AGENTS.md`, **do not run Playwright** — not one spec, not "just the ones the change touches". The
owner tests by hand; a change is done when it typechecks.

The scripts below are from `package.json` and are **not run in this session** — the committed suite needs
a chromium download (`playwright install chromium`) that is not present here, and the driver path above
does not need it. They are listed so nobody rediscovers the names; run them only on request or for a
release.

```bash
corepack pnpm@9 test:install      # playwright install chromium -- one-time, ~150 MB
corepack pnpm@9 test              # the full suite
corepack pnpm@9 test:phone        # --project=phone
```

## Gotchas

- **The test hooks are `debug*`-prefixed, but `e2e/helpers.ts` says otherwise.** `GameHandle` in that file
  declares `spawnHazardOnPlayer`, `grantSkill`, `skipToLevelEnd`, `restart`, `steadyCruise` — **none of
  those exist.** The live names are `debugSpawnHazardOnPlayer`, `debugGrantSkill`, `debugSkipToLevelEnd`,
  `restartLevel`, `debugSetSteadyCruise`. The type is declared and used by nothing, so `pnpm typecheck`
  never checks it against the real object. Read the live surface instead of trusting the type:

  ```bash
  printf 'launch\neval (()=>{const o=window.__GB.game,r=new Set();let p=o;while(p&&p!==Object.prototype){for(const k of Object.getOwnPropertyNames(p))if(typeof o[k]==="function"&&/^debug/.test(k))r.add(k);p=Object.getPrototypeOf(p);}return [...r].sort();})()\nquit\n' | node .claude/skills/run-bubble-battle/driver.mjs
  ```

  They live on the prototype, so `Object.keys(game)` returns `[]` — walk the prototype chain, as above.
- **`scripts/dev-server.ps1` is stale on this machine.** Line 17 hardcodes `$root = 'D:\TGBA'`; the repo
  is at `I:\TGBA`. It will start a server rooted at the wrong tree or fail on a missing
  `node_modules\vite\bin\vite.js`. Use `pnpm dev` as above, or fix the path first.
- **Stopping the background task does not stop Vite.** On Windows the harness kills the wrapper and the
  `node.exe` child keeps listening on 5173 — which is exactly why `dev-server.ps1` tracks its server by
  port instead of by the pid it was handed. To free the port:

  ```bash
  netstat -ano | grep LISTENING | grep ":5173"        # -> the last column is the pid
  taskkill //F //PID <pid>
  ```
- **`--screenshot=` needs a Windows path.** The plain `chrome.exe --headless --screenshot=.scratch/x.png`
  form fails with `Failed to write file: 系统找不到指定的路径`, silently — exit code still 0, no file. The
  driver sidesteps it by writing the bytes itself; if you shell out to Chrome directly, pass
  `I:\TGBA\.scratch\x.png`.
- **Use `--use-gl=swiftshader --enable-unsafe-swiftshader`.** Without software GL, headless Chrome hands
  Pixi a context it cannot draw to and every screenshot is black. The driver always passes these.
- **The version stamp goes stale until Vite restarts.** `__GIT_HASH__` is read once when the dev server
  starts, so a page loaded after a commit still reports the old hash. That is the intended behaviour, not
  a bug — restart the server if the reported build matters.
- **Software rendering runs at ~9 fps.** The debug readout's `fps` is SwiftShader, not the game. Give waits
  generous margins when a step depends on several frames of simulation.

## Troubleshooting

- **`ERR unknown command: <name>`** — the driver has the commands in the table above and no others; use
  `eval` for anything else.
- **`ERR no page target; is Chrome running with --remote-debugging-port?`** — Chrome is up but has no
  page. `quit` and `launch` again.
- **`ERR Chrome not found at C:\Program Files\...`** — set `GB_CHROME` to the real path.
- **`Chrome did not open a debug port on 9222 within 15s`** — a stale Chrome is holding the port with a
  locked profile. Kill `chrome.exe` processes and retry; the profile lives in the OS temp dir.
- **`__GB never appeared at <url>`** — the dev server is not up, or it is on another port. Check the
  server's output; `vite.config.ts` pins 5173.
- **Screenshots are black** — the GL flags above were dropped. Do not launch Chrome by hand without them.
- **`ERR TypeError: Cannot read properties of undefined (reading 'game')`** — `state` was given the whole
  path. The object is implied: `state stage.stage`, not `state __GB.game.diagnostics.stage.stage`.
