/**
 * Which build this page is running.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE THE VALUES COME FROM
 * ---------------------------------------------------------------------------------------------
 * Neither is knowable at runtime: a browser has no git and a phone has no repository. Both are resolved when Vite
 * starts -- at dev-server start and at build time -- and frozen into the bundle as compile-time constants by the
 * `define` block in `vite.config.ts`. See that file for why the version comes from `package.json` and the hash from
 * git, and for what the "(uncommitted)" marker means.
 *
 * The `declare` block is the whole interface between the two: the names are bare identifiers on purpose, because
 * Vite's `define` replaces a bare identifier token, and a property on `window` would have to be assigned and read
 * at runtime -- which is the very thing that is not possible here.
 */

declare const __APP_VERSION__: string;
declare const __GIT_HASH__: string;
declare const __GIT_DIRTY__: boolean;

/** The game's version, from `package.json`. Bumped in the same commit as every change; see `AGENTS.md`. */
export const APP_VERSION = __APP_VERSION__;

/** The commit this bundle was built from, short form, or `unknown` outside a git checkout. */
export const GIT_HASH = __GIT_HASH__;

/** Whether the tree had uncommitted changes when this bundle was built. */
export const GIT_DIRTY = __GIT_DIRTY__;

/**
 * One short line for the menu and the debug readout.
 *
 * The dirty marker is a WORD rather than a `*`, because it is read by a person on a phone who has no legend: `*`
 * could mean anything, and `(uncommitted)` says exactly what is true -- this page is a commit plus some edits
 * nobody else can reproduce from the hash.
 */
export function buildLabel(): string {
  return `v${APP_VERSION} · ${GIT_HASH}${GIT_DIRTY ? ' (uncommitted)' : ''}`;
}
