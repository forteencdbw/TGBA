# Agent instructions

## Working agreements

These are standing instructions from the project owner. They override the defaults below them.

### Compiling is the bar: run NO tests unless explicitly asked

The owner is iterating quickly and tests **manually**. A change is done when it compiles.

- `pnpm typecheck` after a change; `pnpm build` too when the change could affect the bundle.
- Then commit. **Do not run Playwright at all** — not one spec file, not "just the ones the change touches", not
  the full suite, not before a commit, not after a change that looks risky.
- A targeted measurement or a screenshot is still fine when it answers a question the compiler cannot, but the
  owner's own manual run is what decides whether something works.
- `pnpm test` / `pnpm exec playwright test ...` are for when the owner **asks** for them, or for a release.

This supersedes the earlier "run only the specs your change touches" guidance. The suite drives a real-time
simulation serially, so any run is minutes of waiting for a verdict the owner is going to re-check by hand anyway.

### Bump the version on every change

`version` in `package.json` is the single source. It is drawn on the main menu and on the first line of the level's
debug readout as `v<version> · <git hash>`, with ` (uncommitted)` when the working tree was dirty at build time —
see `src/version.ts` and the `define` block in `vite.config.ts`.

- **The patch number rolls over at 100: 1.0.100 -> 1.1.0, not 1.0.101.** Three digits is the end of a patch series, not
  the start of a fourth one -- and the owner asked for it in exactly those terms.
- **Increment it in the same commit as the change.** Patch (`1.0.1`, `1.0.2`, …) for an ordinary change; minor or
  major when the owner says so.
- Do not hand-edit a git hash anywhere: it is read from git at build time, and a hand-maintained hash is a hash
  that lies. In dev it reflects the commit at server start, so it goes stale until Vite restarts — which is the
  honest reading of "the page in this browser was loaded from older code".
- Bump it for **every** commit, documentation included. A docs-only change moving the number is a slightly
  misleading version, and that is the price of a rule with no judgement calls in it: the number always names a
  tree, so "which build is this" is answerable from the number alone.

### Push every commit

The owner has asked for this explicitly: **every commit goes straight to `origin main`.** Do not leave commits
sitting locally, and do not ask whether to push.

- `git push origin main` immediately after committing.
- A push therefore **is a deploy** — it triggers the GitHub Pages workflow. That is intended, not a side effect
  to be careful about.
- If a push is rejected as non-fast-forward, **stop and report**. Someone else commits to this repository (the
  owner has pushed the Pages workflow and its documentation from outside this session), so a rejection means
  there is work here that has not been fetched yet. Never `--force`: it would throw that work away, and the
  local commit is far cheaper to redo than the remote one is to recover.

### Build only the MINIMUM styling; the owner tunes the specifics

When a request involves how something looks or feels, **make it configurable and pick one reasonable default**.
Do not spend turns refining colours, sizes, alphas, or feel.

- Put the values in `config/mechanics.json5` with Chinese comments explaining what each one does.
- Every visual number belongs there, including alphas, line widths, and ratios — a value hardcoded in the
  drawing code is not "configurable", it just looks that way from the outside.
- Group values by the thing being styled rather than into parallel arrays, so tuning one stage does not mean
  counting indices across a dozen lists.
- Then stop. Say what is now adjustable and at what key. The owner will adjust it.

The reason is not only speed: the owner is the one looking at the screen, and iterating on aesthetics through an
agent costs several round trips per colour. The agent's job is the mechanism and the visibility of the knobs.

## Agent skills

### Issue tracker

Issues and specs are tracked as markdown files under `.scratch/<feature-slug>/` in this repo, not in a hosted tracker. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default labels, recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
