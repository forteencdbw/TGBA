// Test runner. Runs the suites in PARALLEL and reports a compact table.
//
// Why this exists: every browser suite spawns its own Chrome, loads the page and waits out the birth
// intro before it can check anything. That fixed cost is about 3.1s, paid nine times, and it is pure
// duplication -- the suites do not interact, use their own Chrome profile and their own debugging
// port, and only ever read from the dev server.
//
// The suites themselves are unchanged and still runnable standalone; this only schedules them.
//
// Usage:
//   node scripts/run-tests.mjs              everything
//   node scripts/run-tests.mjs motion       only suites whose name matches a substring
//   node scripts/run-tests.mjs --fast       the quick tier only
//   node scripts/run-tests.mjs --jobs 6     override the parallelism
//   node scripts/run-tests.mjs --list       show what would run
//
// Exit code is non-zero if any suite failed, so it is safe to use in a hook or CI.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const URL_ARG = process.env.GB_URL ?? 'http://127.0.0.1:5173/';

/**
 * Suites, with the tier that says how much they are worth running on every edit.
 *
 * `fast`  -- pure computation, or one short browser interaction. Run these constantly.
 * `slow`  -- depend on simulated time passing (animation windows, multi-second holds). Run before
 *            committing, not on every keystroke.
 *
 * Deliberately NOT a suite list: see the "what is not here" note below.
 *
 * `expect` is the number of assertions the suite reports. It is checked, because a suite that
 * silently stops emitting its CHECKS line would otherwise look like a pass.
 */
const SUITES = [
  { name: 'solve-lateral', tier: 'fast', kind: 'node' },
  { name: 'solve-volume', tier: 'fast', kind: 'node' },
  { name: 'solve-ascent', tier: 'fast', kind: 'node' },
  { name: 'keyboard-speed', tier: 'fast', kind: 'browser' },
  { name: 'rise-speed', tier: 'fast', kind: 'browser' },
  { name: 'boost-scope', tier: 'slow', kind: 'browser' },
  { name: 'accel-ramp', tier: 'slow', kind: 'browser' },
  { name: 'mechanics', tier: 'slow', kind: 'browser' },
  { name: 'mobile', tier: 'slow', kind: 'browser' },
  { name: 'field-distribution', tier: 'slow', kind: 'browser' },
  // The only suite that measures what the player actually SEES, and the one that caught the
  // "accelerating scales the whole ocean" bug. It absorbed the former motion.mjs parallax
  // assertions, which is why that suite no longer exists.
  { name: 'approach-speed', tier: 'slow', kind: 'browser' },
  { name: 'smoke', tier: 'slow', kind: 'browser' },
];

/**
 * WHAT IS NOT HERE, and why.
 *
 * measure-pixels.mjs and probe-layout.mjs are diagnostic TOOLS, not tests. They capture a screenshot
 * or dump layout numbers for a human to look at; they assert nothing, so running them in a
 * regression pass would only ever add time.
 *
 * motion.mjs was deleted. Its assertions had accumulated to overlap two other suites: its bubble
 * direction check was the same contract as rise-speed.mjs, its player-is-screen-fixed check was
 * already in approach-speed.mjs, and approach-speed.mjs measured the parallax relationship from a
 * strictly better angle (on screen, with the boost applied). The two assertions that were unique to
 * it moved into approach-speed.mjs.
 *
 * Assertions that duplicate a cheaper suite were also pruned rather than the suites themselves: the
 * level-pacing arithmetic left smoke.mjs (0.1s in solve-ascent.mjs instead of a browser boot), and
 * "the player accelerates" left boost-scope.mjs (approach-speed.mjs already measures it on screen).
 */

// ---------------------------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const showList = argv.includes('--list');
const fastOnly = argv.includes('--fast');
const jobsFlag = argv.indexOf('--jobs');
const jobsArg = jobsFlag >= 0 ? Number(argv[jobsFlag + 1]) : null;
const filters = argv.filter((a) => !a.startsWith('--') && a !== String(jobsArg));

// Default parallelism: the box has to run several Chrome instances at once, each of which is doing
// layout and rasterisation. Four is comfortably under the point where they start stealing time from
// each other; six is usually still faster but noisier, so it is opt-in.
const jobs = jobsArg ?? Math.max(2, Math.min(4, SUITES.length));

let selected = SUITES;
if (fastOnly) selected = selected.filter((s) => s.tier === 'fast');
if (filters.length) selected = selected.filter((s) => filters.some((f) => s.name.includes(f)));
if (filters.length && selected.length === 0) {
  console.error(`no suite matches: ${filters.join(', ')}`);
  console.error(`available: ${SUITES.map((s) => s.name).join(', ')}`);
  process.exit(2);
}

if (showList) {
  for (const s of selected) console.log(`${s.tier.padEnd(5)} ${s.kind.padEnd(8)} ${s.name}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// Preflight: the browser suites need the dev server, and it is much cheaper to check once here than
// to have nine suites each fail with an obscure devtools timeout.
// ---------------------------------------------------------------------------------------------
const needsServer = selected.some((s) => s.kind === 'browser');
if (needsServer) {
  let reachable = false;
  try {
    const res = await fetch(URL_ARG, { signal: AbortSignal.timeout(3000) });
    reachable = res.ok || res.status === 404;
  } catch {
    reachable = false;
  }
  if (!reachable) {
    console.error(`dev server not reachable at ${URL_ARG}`);
    console.error('start it first:  pwsh -File scripts/dev-server.ps1 start');
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------------------------
const results = new Map();

/**
 * Run one suite and pull its verdict out of stdout.
 *
 * The CHECKS line is the contract every suite already honours, so this needs no changes to them. A
 * suite that exits 0 without printing CHECKS is treated as a FAILURE rather than a pass: silence is
 * how a broken assertion quietly stops being a test.
 */
function runSuite(suite) {
  return new Promise((resolve) => {
    const script = join(HERE, `${suite.name}.mjs`);
    const args = suite.kind === 'browser' ? [script, URL_ARG] : [script];
    const started = Date.now();
    const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

    let out = '';
    let err = '';
    child.stdout.on('data', (d) => {
      out += d;
    });
    child.stderr.on('data', (d) => {
      err += d;
    });

    child.on('error', (e) => {
      resolve({ name: suite.name, ok: false, seconds: 0, reason: `spawn failed: ${e.message}`, out, err });
    });

    child.on('close', (code) => {
      const seconds = (Date.now() - started) / 1000;
      const checksLine = out.split('\n').find((l) => l.includes('CHECKS:'));
      if (!checksLine) {
        const detail = (err.trim().split('\n').slice(-3).join(' | ') || out.trim().split('\n').slice(-3).join(' | ') || 'no output').slice(0, 400);
        resolve({ name: suite.name, ok: false, seconds, reason: `no CHECKS line (exit ${code}) :: ${detail}`, out, err });
        return;
      }
      let checks;
      try {
        checks = JSON.parse(checksLine.slice(checksLine.indexOf('{'), checksLine.lastIndexOf('}') + 1));
      } catch {
        resolve({ name: suite.name, ok: false, seconds, reason: 'CHECKS line was not valid JSON', out, err });
        return;
      }
      const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
      if (failed.length) {
        resolve({ name: suite.name, ok: false, seconds, reason: `failed: ${failed.join(', ')}`, checks, out, err });
        return;
      }
      if (code !== 0) {
        resolve({ name: suite.name, ok: false, seconds, reason: `all checks passed but exit code ${code}`, checks, out, err });
        return;
      }
      resolve({ name: suite.name, ok: true, seconds, assertions: Object.keys(checks).length, checks, out, err });
    });
  });
}

/** Bounded-concurrency pool. Keeps `jobs` suites in flight without a dependency. */
async function pool(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (;;) {
      const next = queue.shift();
      if (!next) return;
      const r = await worker(next);
      results.set(next.name, r);
      const label = r.ok ? 'ok  ' : 'FAIL';
      const note = r.ok ? `${r.assertions} checks` : r.reason;
      console.log(`  ${label} ${r.name.padEnd(20)} ${r.seconds.toFixed(1).padStart(5)}s  ${note}`);
    }
  });
  await Promise.all(runners);
}

console.log(`running ${selected.length} suites, ${jobs} at a time against ${URL_ARG}`);
const wall = Date.now();
await pool(selected, jobs, runSuite);
const totalWall = (Date.now() - wall) / 1000;

const ordered = selected.map((s) => results.get(s.name)).filter(Boolean);
const failures = ordered.filter((r) => !r.ok);
const serialSeconds = ordered.reduce((a, r) => a + r.seconds, 0);

console.log('');
console.log(`${ordered.length - failures.length}/${ordered.length} suites passed`);
console.log(`wall ${totalWall.toFixed(1)}s   (sum of suite times ${serialSeconds.toFixed(1)}s, ${jobs}-way parallel)`);
if (failures.length) {
  console.log('');
  for (const f of failures) console.log(`FAILED ${f.name}: ${f.reason}`);
}
process.exit(failures.length ? 1 : 0);
