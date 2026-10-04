import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

/**
 * ---------------------------------------------------------------------------------------------
 * BUILD METADATA: the version and the commit the page is actually running
 * ---------------------------------------------------------------------------------------------
 * Both are shown on the main menu and in the level's debug readout, because "which build am I looking at" is a
 * question that comes up constantly -- on a phone, on a deployed URL, and in a screenshot somebody sent you -- and
 * it is not answerable from the running game any other way.
 *
 * `version` comes from `package.json` because that is the one file a human already remembers to bump, and the hash
 * comes from git because a hand-maintained hash is a hash that lies. Neither is read at RUNTIME: there is no git in
 * a browser and no filesystem on a phone, so both are frozen into the bundle here, at build (and dev-server) start.
 *
 * Injected as bare identifiers rather than exposed on `window`, so they are compile-time constants: Vite replaces
 * the token, the values fold into the bundle, and the game reads them like any other constant.
 *
 * **In dev this is read once, when the server starts.** Commit something and the displayed hash goes stale until
 * Vite restarts the server (editing this file does it) -- which is the honest behaviour: the page in the browser
 * really was loaded from the older code.
 */

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

/**
 * Ask git something, or return null.
 *
 * Swallows every failure on purpose: a tarball with no `.git`, a machine without git on PATH, or a sandbox that
 * refuses to spawn a process must all still produce a build. A missing hash is a cosmetic loss; a build that will
 * not run because it could not read a decoration is not.
 */
function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const gitHash = git(['rev-parse', '--short', 'HEAD']) ?? 'unknown';
/**
 * Whether the working tree had uncommitted changes when this build was made.
 *
 * Worth carrying: `51be519` means the running page IS that commit, and `51be519 (uncommitted)` means it is
 * something on top of it that nobody can reproduce from the hash alone. Without this the hash quietly claims more
 * than it knows, which is worse than showing nothing.
 */
const gitDirty = (git(['status', '--porcelain']) ?? '').length > 0;

// Relative base so the build works from any static host / subdirectory (itch.io, GitHub Pages, file:// preview).
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_HASH__: JSON.stringify(gitHash),
    __GIT_DIRTY__: JSON.stringify(gitDirty),
  },
  server: {
    /**
     * The big imported images are NOT watched.
     *
     * `public/levels/*` holds hand-authored backdrops, which nothing regenerates during dev -- and watching a
     * multi-megabyte file is what crashed the dev server with EBUSY the moment one was copied in while it ran.
     */
    // (the asset-ignore rule lives with the other watch exclusions below)
    port: 5173,
    // Exposed on the LAN so the game can be opened on a real phone during development.
    host: true,
    watch: {
      // Editors and agent tooling write scratch/temp directories inside the repo. Watching them
      // makes Vite's fs watcher throw EBUSY on Windows and kill the dev server outright, so the
      // non-runtime directories are excluded.
      ignored: ['**/scripts/**', '**/.scratch/**', '**/dist/**', '**/*.tmpdir/**', '**/.*.tmp', '**/public/levels/**'],
    },
  },
  build: {
    target: 'es2020',
    // Vite 8 bundles with rolldown; let it minify too. `minify: 'esbuild'` would pull in esbuild,
    // which is only an optional peer dependency and is not installed.
    minify: true,
    /**
     * No source maps in the shipped build.
     *
     * They were 2.9 MB of the 3.0 MB artifact -- the game itself is 589 kB -- and they are the one thing here
     * that is purely for a developer. A browser only fetches a map when devtools is open, so this is about
     * the size of what gets uploaded rather than about runtime cost.
     *
     * There is still deliberately no environment-variable switch: reading one needs `process.env`, and a switch
     * that only a build machine can flip is a switch that is never flipped. What changed with the version stamping
     * above is only that this file now HAS Node's types (`tsconfig.node.json`), so the old reason -- "the game's
     * tsconfig has no `process`, so `pnpm build` fails" -- no longer applies. Set this to `true` locally, build,
     * and set it back to read a minified stack trace.
     */
    sourcemap: false,
  },
});

