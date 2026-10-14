// Runs the atlas packer with a Python that has Pillow.
//
// WHY A WRAPPER AT ALL
// --------------------
// This machine has no usable system Python -- `python` on PATH is the Windows Store stub, which opens the Store
// instead of running anything -- and the packer needs Pillow. DSH unpacks a managed runtime that has both, so the
// interpreter is looked for rather than assumed, and the search order is written down here so that "which Python
// did that use" is answerable without reading a stack trace.
//
// `stdio: 'inherit'` rather than capturing the output: the packer's report is the point of running it (page shapes,
// fill ratios, KB), and a wrapper that swallowed it would leave the summary inside a string. It also sidesteps the
// sandbox rule that stops a child process from being read through a pipe.
//
// Usage: node scripts/pack-atlas.mjs [--check] [args for pack-atlas.py]

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packer = join(here, 'pack-atlas.py');

/**
 * Does this interpreter exist and can it import Pillow? Asked, not assumed: a stub python.exe "exists" too.
 *
 * THE `existsSync` GUARD IS FOR PATHS ONLY, and that is the bug this comment is here to prevent. It used to run on
 * every candidate, including the bare names -- and `existsSync('python')` is false on every machine that has Python,
 * because a bare name is resolved against the current directory rather than against PATH. So `python`, `python3` and
 * `py` were thrown away before `spawnSync` -- the call that CAN find them -- ever ran, and the search reported "no
 * Python with Pillow" on a machine where typing `python` at a prompt works. The guard only belongs on a path we were
 * HANDED (`DSH_PYTHON`, a managed runtime), where a missing file is a cheap thing to rule out first.
 */
function hasPillow(exe) {
  if (!exe) return false;
  const isPath = exe.includes('/') || exe.includes('\\');
  if (isPath && !existsSync(exe)) return false;
  const probe = spawnSync(exe, ['-c', 'import PIL'], { stdio: 'ignore' });
  return probe.status === 0;
}

function managedInterpreters() {
  const roots = [process.env.DSH_HOME, join(homedir(), '.dsh')].filter(Boolean);
  const found = [];
  for (const root of roots) {
    const runtimes = join(root, 'dsh-runtimes');
    if (!existsSync(runtimes)) continue;
    // Newest runtime first: the managed runtimes are versioned by name, and the newest is the one DSH ships today.
    for (const name of readdirSync(runtimes).sort().reverse()) {
      found.push(join(runtimes, name, 'dependencies', 'python', 'python.exe'));
      found.push(join(runtimes, name, 'dependencies', 'python', 'bin', 'python3'));
    }
  }
  return found;
}

const candidates = [
  process.env.DSH_PYTHON,
  ...managedInterpreters(),
  'python3',
  'python',
  'py',
];

const python = candidates.find(hasPillow);
if (!python) {
  console.error(
    'No Python with Pillow found. Tried:\n  ' +
      candidates.filter(Boolean).join('\n  ') +
      '\nSet DSH_PYTHON to a python.exe that has Pillow (pip install pillow) and try again.',
  );
  process.exit(2);
}

try {
  execFileSync(python, [packer, ...process.argv.slice(2)], { stdio: 'inherit' });
} catch (error) {
  // The packer's own exit code is the answer -- a stale atlas (1) is not the same failure as a broken interpreter
  // (2), and collapsing them into one number would make `atlas:check` useless in a script.
  process.exit(typeof error.status === 'number' ? error.status : 1);
}
