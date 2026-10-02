# Agent instructions

## Working agreements

These are standing instructions from the project owner. They override the defaults below them.

### Do NOT run the full regression suite unless explicitly asked

`pnpm test` runs the whole Playwright suite across both projects and takes about 6 minutes. **Do not run it on
your own initiative** — not before a commit, not "to be safe", not after a change that looks risky.

What to do instead:

- `pnpm typecheck` plus `pnpm build` after any change.
- Run **only the spec files your change touches** (`pnpm exec playwright test e2e/wheel.spec.ts`), and only when
  the change actually needs exercising.
- A targeted measurement or a screenshot is usually worth more than a broad run.
- Save the full suite for when the owner asks for it, or for a release.

The suite is not slow because it is thorough; it is slow because it drives a real-time simulation serially. A
6-minute tax on every edit is a tax on how much gets edited.

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
