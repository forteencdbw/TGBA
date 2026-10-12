/**
 * Answer the questions `asset_flow.py` asks `config/mechanics.json5`.
 *
 * WHY THIS IS JAVASCRIPT. The config is JSON5 -- it carries the long Chinese comments that explain every number,
 * which is the thing that makes it readable and the thing that makes Python's `json` refuse it. Node already has
 * `json5` in `node_modules` (the game's own tooling pulled it in), so the honest move is to parse it with the
 * parser that exists rather than to write a second, worse one in Python or to regex out the two numbers this
 * needs and hope the file keeps its shape.
 *
 * WHAT IT IS FOR. `obstacles.art.coral.variants` and `hazards.radius` are what turn "a picture of a coral" into
 * "a picture drawn 111 screen pixels wide, which is a 79-pixel file, which is a 75-wide pixel grid". Nothing else
 * in the pipeline knows those numbers, and getting them wrong is the failure the README calls out by name: one
 * creature looking finer or coarser than its neighbours.
 *
 * Usage:
 *   node config-query.mjs lookup --table obstacles --kind coral [--scale 1.3]
 *   node config-query.mjs tables
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import json5 from 'json5';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const CONFIG = join(ROOT, 'config', 'mechanics.json5');

function fail(message) {
  // A one-line JSON error on stdout, so the caller never has to parse a stack trace to find out what went wrong.
  process.stdout.write(JSON.stringify({ ok: false, error: message }) + '\n');
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else if (!out._) {
      out._ = argv[i];
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

// `validate` reads a CANDIDATE config, not the live one, and it is the gate in front of writing one: the pipeline
// edits `mechanics.json5` as text (it is JSON5 full of comments, so re-serialising would throw the comments away)
// and a text edit that produces something which does not parse breaks the whole game. Nothing is written until
// this says yes. Passing no --path validates the real file, which is also a useful sanity check.
if (args._ === 'validate') {
  const path = args.path || CONFIG;
  try {
    const parsed = json5.parse(readFileSync(path, 'utf8'));
    const kinds = Object.keys(parsed?.obstacles?.art?.coral?.variants ?? {}).length;
    process.stdout.write(
      JSON.stringify({ ok: true, path, coralVariants: kinds, topLevelKeys: Object.keys(parsed).length }, null, 2) + '\n',
    );
  } catch (error) {
    fail(`${path} does not parse: ${error.message}`);
  }
  process.exit(0);
}

let config;
try {
  config = json5.parse(readFileSync(CONFIG, 'utf8'));
} catch (error) {
  fail(`could not parse ${CONFIG}: ${error.message}`);
}

if (args._ === 'tables') {
  const tables = {};
  for (const name of ['hazards', 'obstacles']) {
    const table = config[name];
    if (table && table.radius) tables[name] = Object.keys(table.radius);
  }
  process.stdout.write(JSON.stringify({ ok: true, tables }, null, 2) + '\n');
  process.exit(0);
}

if (args._ !== 'lookup') fail(`unknown mode ${args._ ?? '(none)'}; expected 'lookup' or 'tables'`);

const table = args.table;
const kind = args.kind;
if (!table || !kind) fail('lookup needs --table and --kind');
if (!['hazards', 'obstacles'].includes(table)) fail(`--table must be hazards or obstacles, not ${table}`);

const section = config[table];
if (!section) fail(`no ${table} section in the config`);

/**
 * The radius, from wherever this kind keeps it.
 *
 * `hazards.radius` is the table for ordinary creatures, and a BOSS is not in it: the boss's size is part of its
 * dossier (`hazards.bosses.<kind>.radiusRatio`), the same way its colour and its attacks are -- a boss is a
 * creature whose every number belongs to that one boss. Asking the dossier as a second place is what lets the
 * pipeline derive a boss's grid at all; the alternative was putting the boss back into `hazards.radius`, which is
 * the design the README explains the boss does NOT follow.
 */
const radius = section.radius?.[kind] ?? section.bosses?.[kind]?.radiusRatio;
if (radius === undefined) {
  const known = Object.keys(section.radius ?? {}).join(', ');
  fail(`no ${table}.radius.${kind} and no ${table}.bosses.${kind}.radiusRatio. Known kinds: ${known}`);
}

// `hazardArt` is a flat table keyed by kind; `obstacles.art` is too. Either may carry a single `scale`, or a
// `variants` list where each entry has its OWN scale -- which is the shape a new coral has to be added to.
const artTable = table === 'hazards' ? config.hazardArt : section.art;
const art = artTable?.[kind] ?? null;

const siblings = [];
if (art?.variants) {
  for (const variant of art.variants) {
    siblings.push({ image: variant.image, scale: variant.scale ?? 1 });
  }
} else if (art) {
  siblings.push({ image: kind, scale: art.scale ?? 1 });
}

process.stdout.write(
  JSON.stringify(
    {
      ok: true,
      table,
      kind,
      radius,
      art,
      siblings,
      // Every scale this kind currently uses, so the pipeline can say "the others are 1.07-1.46" when a caller
      // proposes a new one -- a number nobody can judge in isolation.
      siblingScales: siblings.map((s) => s.scale),
    },
    null,
    2,
  ) + '\n',
);
