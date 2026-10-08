import JSON5 from 'json5';
import { OBSTACLE_KINDS, mech } from './mechanisms';
import { rowGapIsPassable, type ObstacleKind } from './obstacles';

/**
 * The level files, one per level, and the ORDER OF THE LEVELS is the order they are read in.
 *
 * A glob rather than a list of imports, because a list is a second place to remember: adding a level would mean
 * writing the file AND editing an index here, and forgetting the second half looks exactly like a level that does not
 * exist. Every `config/levels/*.json5` is a level, sorted by file name -- which is why they are numbered
 * (`01-black-smokers.json5`, `02-wreck-gorge.json5`, …): the numbers ARE the progression, in the same spirit as `at:`
 * being metres rather than seconds. A level inserted between two others gets a free number (`01b-…`) rather than
 * forcing every later file to be renamed, and the progression is still readable at a glance.
 *
 * `config/levels.json5` is read too, AFTER the directory, when it exists: it is the file the levels used to live in,
 * kept working so the split did not have to be a flag day. Nothing depends on it.
 */
const LEVEL_FILES = import.meta.glob('../config/levels/*.json5', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const COMBINED_LEVELS = import.meta.glob('../config/levels.json5', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Every level source, in progression order: the numbered files first, then the file they came from. */
function levelSources(): (readonly [string, unknown])[] {
  const sources: (readonly [string, unknown])[] = [];
  for (const [path, text] of Object.entries(LEVEL_FILES).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    sources.push([path.replace('../config/', ''), parseLevelFile(path, text)]);
  }
  for (const [path, text] of Object.entries(COMBINED_LEVELS)) {
    sources.push([path.replace('../config/', ''), parseLevelFile(path, text)]);
  }
  return sources;
}

/** One file's text as JSON5, with the file named when it is not valid. */
function parseLevelFile(path: string, text: string): unknown {
  try {
    return JSON5.parse(text);
  } catch (e) {
    fail(path.replace('../config/', ''), `is not valid JSON5 (${(e as Error).message}).`);
  }
}

/**
 * Levels, in the arcade vertical-scroller form.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SHAPE OF A LEVEL
 * ---------------------------------------------------------------------------------------------
 * A level is a fixed stretch of water. The camera scrolls up through it at a constant rate, which is
 * what makes everything in the world appear to travel downwards -- and what makes new content enter
 * from the top of the screen instead of appearing in place.
 *
 * A level's content is a TIMELINE: a list of "when the camera has travelled this far, put this here".
 * The level ends when the whole timeline has been emitted and has cleared the screen. Nothing is
 * generated procedurally and nothing is randomised, so a level is fully authored rather than tuned
 * statistically -- which is what makes it a level rather than a difficulty curve.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE A LEVEL LIVES, AND WHY IT MOVED OUT OF THIS FILE
 * ---------------------------------------------------------------------------------------------
 * Levels used to be TypeScript in this file, written as calls to the `place` helpers below. That made
 * every level a code change, and it meant the AUTHOR of a level had to compose a function call graph
 * to say "four fish, left of centre" -- so the level could only be tuned by whoever was willing to
 * open the editor.
 *
 * They are now data: one file per level in `config/levels/`, one block per batch of content, validated on load by
 * `readSpawns` below. The helpers in this file are unchanged and still do the geometry -- they are the
 * mechanism, and the file is the content. A block names an arrangement and gives it numbers.
 *
 * The three spaces this leaves, and they are the three things a level actually needs:
 *   - WHAT and HOW MANY: `kind`, `count`
 *   - WHICH ARRANGEMENT: `arrange` and its parameters (a line, a column, a woven stream, a row of
 *     obstacles with a gap)
 *   - FROM WHERE: `from`, which is what lets content arrive from the sides and from behind rather
 *     than only from above. See `EntrySide`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY AT-DISTANCE AND NOT AT-TIME
 * ---------------------------------------------------------------------------------------------
 * Entries are placed by how far the camera has scrolled, not by elapsed seconds. Duration is then an
 * OUTPUT of distance over speed, and changing the scroll speed re-times the whole level coherently
 * instead of sliding every entry relative to the level's shape. It is the same lesson as the earlier
 * run-length mistake: express content against the world, not against a clock.
 *
 * ---------------------------------------------------------------------------------------------
 * COORDINATES
 * ---------------------------------------------------------------------------------------------
 * World y is metres above the seabed, and `at` is metres travelled from the seabed. So an entry at
 * distance S sits at world y = S. Depth from the surface is `scrollLength - S`, which is what the HUD
 * shows.
 */

/**
 * Which edge of the screen something arrives from.
 *
 * `top` is the classic case and the only one that needs no motion of its own: content is placed above
 * the view and the current carries it down. The other three are the ones this type exists for --
 * something swimming in from the side, or catching the player up from behind.
 */
export type EntrySide = 'top' | 'left' | 'right' | 'bottom';

/**
 * One thing to place, and how far into the level it appears.
 */
export interface LevelEntry {
  /** Metres of scroll at which this enters. */
  at: number;
  /** The named spline this entry follows, if any. See `PathSpec`. */
  path?: string;
  /**
   * How far along that spline this entry starts, 0..1.
   *
   * A string is spaced along its curve by THIS rather than by when each member happens to spawn. The timeline stagger
   * cannot do it: members that spawn in the same frame (a level reached by teleport, a fast scroll) start together and
   * stay locked together for the whole crossing, which is the pile the owner saw. Spacing by index is deterministic and
   * depends on neither the frame rate nor the scroll speed.
   */
  pathOffset?: number;
  /**
   *
   * A fraction rather than metres so a lane stays a lane on every display: the play area's width
   * follows the canvas, so an absolute x would drift off-screen on a narrow phone.
   *
   * For a side entry this is where the thing is HEADED rather than where it starts: it spawns outside
   * the lane and swims in to here.
   */
  x: number;
  /**
   * Which kind of thing to place.
   *
   * Collectables are `bubble`, hazards name their kind, `skill` is a pickup, and `crate` / `coral` / `wall` /
   * `net` are the obstacles.
   *
   * `urchin`, `bombfish`, `eel`, `rot` and `oil` are the negative food: ordinary hazards from the outside, and
   * something that keeps acting once it is in the player's stomach. They are placed SPARINGLY, and that is a design
   * decision rather than a difficulty one -- a risk decision is only a decision while it is occasional. A screen
   * full of bomb fish would not be a choice between eating and avoiding, it would be a corridor of unavoidable
   * damage.
   */
  kind: SpawnKind;
  /**
   * Size for a collectable, as a multiple of the player's radius at full size. Ignored otherwise.
   *
   * Authored rather than random: a designer placing food wants to decide whether it is a snack or a
   * meal, and the volume economy keys off this number.
   */
  size?: number;
  /** Which edge it arrives from. Absent means `top`. */
  from?: EntrySide;
  /**
   * Metres per second it moves INTO the play area while arriving, relative to the screen.
   *
   * Only meaningful with a `from` other than `top`, where the current does the work. For a `bottom` entry this has
   * to beat the scroll speed to be visible at all, which is why it is a speed rather than a distance.
   */
  enterSpeed?: number;
  /**
   * For a `left` / `right` entry: how far up the screen it cuts in, 0 at the bottom edge and 1 at the top.
   *
   * Needed because "from the left" does not say WHERE on the left, and that is a real authoring decision -- a fish
   * entering at eye level is a surprise, one entering at the top of the screen is a warning.
   */
  depth?: number;
}

/**
 * Every kind a level block may place. Spelled out so a typo in the config file is a type error here too.
 *
 * The TYPE is the compile-time half and `SPAWN_KINDS` is the runtime half (the loader can only compare strings); a
 * creature has to be in both, which is why the runtime one is derived from the config rather than listed.
 */
export type SpawnKind =
  | 'bubble'
  | 'fish'
  | 'jelly'
  | 'trash'
  | 'crab'
  | 'urchin'
  | 'bombfish'
  | 'eel'
  | 'rot'
  | 'oil'
  | 'skill'
  | 'upgrade'
  | 'rate'
  /** LEVEL 1's black smokers, the mineral grit they throw up, and the blind shrimp. */
  | 'vent'
  | 'mineral'
  | 'shrimp'
  /** LEVEL 2's lanternfish and rogue torpedoes. */
  | 'angler'
  | 'torpedo'
  /** LEVEL 3's electric jellyfish: the ignition source for the conductive chain. */
  | 'zapper'
  /** LEVEL 6's foam and rain. */
  | 'foam'
  | 'rain'
  /** The tuna: a size up from `fish`, and it hunts the same way. */
  | 'tuna'
  /** LEVEL 4's four predators, in ascending order of how much screen they take up. */
  | 'dolphin'
  | 'octopus'
  | 'shark'
  | 'whale'
  | ObstacleKind;

/** The arrangement vocabulary: how a block's `count` things are laid out. */
export type Arrange = 'single' | 'line' | 'column' | 'spread' | 'barrier';

/**
 * One block from a level file, after validation: exactly what the file allows, with the defaults filled in.
 *
 * Typed separately from `LevelEntry` because the two are different things: a block is what a human writes, an entry
 * is one object in the water. One block becomes many entries, and that expansion is the whole point of the file.
 */
export interface SpawnBlock {
  /** Put this block's creatures on a named spline; `count` becomes a staggered string. */
  path?: string;
  at: number;
  kind: SpawnKind;
  count: number;
  arrange: Arrange;
  x: number;
  xFrom: number;
  xTo: number;
  span: number;
  amplitude: number;
  wavelength: number;
  gapAt: number;
  gapWidth: number;
  sizes: readonly number[] | null;
  from: EntrySide;
  enterSpeed: number;
  depth: number;
}

export interface Level {
  id: string;
  name: string;
  /**
   * How far the camera scrolls, in metres. The level's LENGTH, and the only measure of how big it is.
   *
   * Everything else follows: `scrollLength / scrollSpeed` is the duration, and the timeline is
   * expressed in terms of this.
   */
  scrollLength: number;
  /**
   * Camera travel in metres per second. THE pacing dial.
   *
   * Sets how fast the world appears to move and how long the level lasts, without touching a single
   * timeline entry -- so it can be retuned late without re-authoring the level. It is a LEVEL property
   * rather than a global one for the same reason: two levels of the same length should be allowed to
   * have different pacings.
   */
  scrollSpeed: number;
  /** The scripted content, in any order: it is sorted by `at` when the level loads. */
  entries: readonly LevelEntry[];
  /** The blocks the entries were expanded from, kept so a test can prove the file and the timeline agree. */
  blocks: readonly SpawnBlock[];
  /**
   * Put this block's creatures on a named spline.
   *
   * `count` then means "a string of this many": each member takes its own place along the same curve (`pathOffset`), so
   * they enter one after another and follow the same line, which is the whole effect. The spacing is a fraction of the
   * path rather than a distance or a delay, which is what keeps a string from collapsing into a pile -- see
   * `LevelEntry.pathOffset`.
   */
  path?: string;
  /** Signposts, at depths from the surface, for the HUD. */
  landmarks?: readonly { depth: number; label: string }[];
  /**
   * How far the player may stray above the camera before the scroll carries them, in metres.
   *
   * The player moves freely, but cannot outrun the current: the camera is a soft ceiling that carries
   * them along, which is what stops a level being skipped by holding "up".
   */
  playerLeadLimit?: number;
  /**
   * The level's BOSS: what has to die before the level is over.
   *
   * Required, and that is the point of the field rather than an oversight: a level ends when its boss is defeated, so
   * a level without one could never finish. The schema says so instead of leaving a level that quietly cannot be
   * completed.
   *
   * `health` and `name` are HERE rather than in `mechanics.json5` because they are level design -- how long the fight
   * lasts and what the thing is called. The shared mechanics (how it moves, what it fires, how big it is) live in the
   * config's `hazards.boss`, exactly as a fish's motion lives there and its spawn position lives in the level.
   */
  boss: BossSpec;
  /**
   * Named SPLINES a spawn block can put its creatures on.
   *
   * The point of a path is a shape no single rule produces: a string of fish that enters from the right, weaves up and
   * down inside the screen and leaves on the left. Each creature follows the SAME spline with a delay, which is what
   * makes it a string rather than a shoal -- and because the world keeps scrolling underneath, the same path reads
   * differently at different scroll speeds without being re-authored.
   *
   * Coordinates are relative to where the creature spawned: `x` is a lane fraction (below 0 and above 1 are off the
   * screen, which is how entering and leaving work) and `y` is metres ABOVE that spawn point.
   */
  paths?: Record<string, PathSpec>;
  /**
   * A hand-authored image painted behind everything, the farthest layer of the level.
   *
   * The one place in this project where an image file is the right answer: the environment of a level is a piece of ART
   * -- volcanic ridges at the seabed -- and no amount of procedural dots says that. It is per LEVEL for the same reason
   * the palette is: the six levels are six places.
   */
  /**
   * The level's backdrop layers, FARTHEST FIRST.
   *
   * A list rather than one picture because distance is not one thing: a level has a far horizon and a nearer ridge, and
   * they move at different speeds. Order is the drawing order as well as the meaning, exactly like the parallax motes.
   */
  backdrops?: BackdropSpec[];
  /**
   * This level's water: a deep-to-shallow gradient, the surface bloom, and a mood tint over both.
   *
   * Per LEVEL because the six levels are six different places, and water colour is the cheapest way to say so. It used
   * to be one hardcoded ramp, which made every level the same sea with different creatures in it.
   */
  palette: LevelPalette;
}

/** A level's backdrop image and how it sits in the water. */
export interface BackdropSpec {
  /** Path under public/, e.g. levels/black-smokers-backdrop.jpg. */
  image: string;
  /** How far it moves per metre of scroll. The farthest layer moves least; 0.03 is nearly still. */
  speedFactor: number;
  /** Height on screen, in screen heights. Above 1 leaves no seam while the image wraps. */
  heightScreens: number;
  /** Overall opacity, on top of whatever the water gradient is already doing. */
  alpha: number;
  /** A colour multiplied into the image, so it sits inside the level's palette rather than on top of it. */
  tint: number;
}

/** A spline for creatures to follow, as written in the level file. */
export interface PathSpec {
  /** The waypoints, in order. At least two: a spline needs something to run through. */
  points: { x: number; y: number }[];
  /** Seconds to travel the whole spline. */
  seconds: number;
}

/** One level's water colours. `tintStrength` is how much of `tint` to mix over the gradient, 0..1. */
export interface LevelPalette {
  /** How opaque the water gradient is, 0..1. Below 1 it is a wash over whatever is behind it. */
  waterAlpha: number;
  deep: number;
  shallow: number;
  bloom: number;
  tint: number;
  tintStrength: number;
}

/** One level's boss, as authored: where it arrives, how tough it is, and what it is called. */
export interface BossSpec {
  /** Metres travelled when it arrives. Must be inside the level, or the fight could never start. */
  at: number;
  /** Hit points. The length of the fight. */
  health: number;
  /** Shown above its health bar. */
  name: string;
  /** Body colour, so two levels' bosses do not look like the same creature. */
  colour?: number;
}


/**
 * Helpers for building a level's entry list from a compact shorthand.
 *
 * Composing a level by hand as a flat list of a hundred objects is unreadable, and an unreadable level
 * is one nobody will tune. These express the patterns that actually appear -- a stream of food, a line
 * of hazards, a corridor -- and the result is plain data.
 */
export const place = {
  /** A single entry. */
  one: (at: number, kind: LevelEntry['kind'], x: number, size?: number): LevelEntry =>
    size === undefined ? { at, x, kind } : { at, x, kind, size },

  /**
   * `count` entries spread evenly over `span` metres, starting at `at`.
   *
   * The workhorse: a stretch of water with food in it.
   */
  spread: (
    at: number,
    span: number,
    count: number,
    kind: LevelEntry['kind'],
    x: (i: number) => number,
    size?: (i: number) => number,
  ): LevelEntry[] => {
    const out: LevelEntry[] = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0 : i / (count - 1);
      const entry: LevelEntry = { at: at + t * span, x: x(i), kind };
      if (size) entry.size = size(i);
      out.push(entry);
    }
    return out;
  },

  /** A horizontal line of hazards at one distance: a wall to slip through. */
  line: (at: number, kind: LevelEntry['kind'], count: number, from = 0.12, to = 0.88): LevelEntry[] => {
    const out: LevelEntry[] = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      out.push({ at, x: from + t * (to - from), kind });
    }
    return out;
  },

  /** A vertical column of one hazard kind, for a corridor or a chase. */
  column: (at: number, span: number, count: number, kind: LevelEntry['kind'], x: number): LevelEntry[] => {
    const out: LevelEntry[] = [];
    for (let i = 0; i < count; i++) {
      out.push({ at: at + (count <= 1 ? 0 : (i / (count - 1)) * span), x, kind });
    }
    return out;
  },

  /**
   * A row of obstacles with a GAP left in it, which is the only legal way to place them.
   *
   * Deliberately not a general `line`: a row that could seal the lane would make being small MANDATORY at that
   * point rather than a choice, and "should I be big here" would stop being a question. `assertLevelSane` checks
   * the result against the config's minimum, so a hand-written row cannot quietly close the lane.
   *
   * ---------------------------------------------------------------------------------------------
   * HOW THE GAP IS CARVED, AND WHY IT TOOK A SECOND ATTEMPT
   * ---------------------------------------------------------------------------------------------
   * The first version spaced blocks evenly and DELETED any that landed near the gap centre. That leaves blocks
   * sitting wherever the even spacing happened to put them, which is not far enough from the gap: at four blocks
   * the neighbours landed at 0.37 and 0.63, and the space between them worked out to 0.11 against a required
   * 0.17. The level refused to load, and the assertion named the row -- which is exactly what it is for.
   *
   * So the gap is CARVED FIRST: it is widened to the width the passability rule actually needs, and blocks are
   * then placed only in the two strips that remain. The gap is therefore a guarantee rather than a request, and
   * the guarantee is derived from the same config the assertion reads.
   *
   * @param gapAt where the gap sits, as a fraction of the play area.
   * @param gapWidth the gap the designer WANTS. Widened automatically if the rule needs more room than this.
   */
  barrier: (at: number, kind: LevelEntry['kind'], count: number, gapAt = 0.5, gapWidth = 0.24): LevelEntry[] => {
    const radius = mech.obstacles.radius[kind] ?? 0.05;
    // The clearance a gap needs: the lane margin at each side plus the rule's minimum.
    const required = radius * 2 + mech.obstacles.minGapFraction;
    const half = Math.max(gapWidth, required) / 2;
    const gapLo = gapAt - half;
    const gapHi = gapAt + half;

    const out: LevelEntry[] = [];
    const from = 0.1;
    const to = 0.9;
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const x = from + t * (to - from);
      // A hair of tolerance, because the assertion measures with `>` and an exactly-equal gap must pass.
      if (x > gapLo - 1e-6 && x < gapHi + 1e-6) continue;
      out.push({ at, x, kind });
    }
    return out;
  },
};

/** Deterministic weave, so a level looks the same every time it is played. */
const weave = (amplitude: number, centre = 0.5, wavelength = 6) => (i: number) =>
  centre + Math.sin((i / wavelength) * Math.PI * 2) * amplitude;

/** A repeating size pattern, so a stream alternates snacks and meals rather than being uniform. */
const sizes = (pattern: readonly number[]) => (i: number) => pattern[i % pattern.length] as number;

// =====================================================================================================
// Reading the level files
// =====================================================================================================

/**
 * Every kind a block may name -- ASKED OF THE TABLES rather than written out again.
 *
 * Writing it out again is exactly how the tuna became a creature that could not be placed. The type `SpawnKind` below
 * gained `'tuna'` and this list did not, so `{ at: 260, kind: 'tuna' }` in level 1 failed the load with "kind is
 * 'tuna', but it should be one of …" -- a list that did not contain the kind the game had just learned to draw. The
 * compiler cannot help here (the type is compile-time and this list is runtime), so the list must not exist.
 *
 * The creatures come from `hazards.health`, which the config checks against every hazard kind ON LOAD, in both
 * directions and by name (see the check beside its rule in `mechanisms.ts`): a creature with no health row fails the
 * load, and a health row for something that is not a creature fails it too. So this list is complete by construction
 * for the same reason `isScenery` asks the obstacle table -- and the boss is the one creature filtered out, because a
 * level does not place its boss in a spawn block, it names it in its own `boss` field.
 */
const SPAWN_KINDS: readonly string[] = [
  // The pickups. Spelled out because they are not creatures: nothing about them lives in the hazard tables.
  'bubble',
  'skill',
  'upgrade',
  'rate',
  ...Object.keys(mech.hazards.health).filter((kind) => kind !== 'boss'),
  ...OBSTACLE_KINDS,
];
const ARRANGEMENTS: readonly string[] = ['single', 'line', 'column', 'spread', 'barrier'];
/** Whether a kind is scenery. Asked of the config's own list, so a new obstacle kind is covered by construction. */
const isScenery = (kind: string): boolean => (OBSTACLE_KINDS as readonly string[]).includes(kind);

/**
 * The kinds that are PICKED UP: a skill, or the ability upgrade.
 *
 * One list rather than a comparison repeated per rule, because these kinds share rules the others do not: they arrive
 * with the current (never from a side), and they occupy a single slot in the water rather than a field. A new pickup
 * added here inherits both, which is the point.
 */
export const PICKUP_KINDS = ['skill', 'upgrade', 'rate'] as const;
export type PickupKind = (typeof PICKUP_KINDS)[number];
const isPickup = (kind: string): boolean => (PICKUP_KINDS as readonly string[]).includes(kind);
const SIDES: readonly string[] = ['top', 'left', 'right', 'bottom'];

/** The keys a block may use. Anything else is an error rather than a silent no-op -- see `readBlock`. */
const BLOCK_KEYS: readonly string[] = [
  'path',
  'at',
  'kind',
  'count',
  'arrange',
  'x',
  'xFrom',
  'xTo',
  'span',
  'amplitude',
  'wavelength',
  'gapAt',
  'gapWidth',
  'sizes',
  'from',
  'enterSpeed',
  'depth',
];

const LEVEL_KEYS: readonly string[] = ['id', 'name', 'scrollLength', 'scrollSpeed', 'playerLeadLimit', 'landmarks', 'boss', 'palette', 'paths', 'backdrop', 'backdrops', 'spawns'];

/** Throw with the offending place named, so a typo in the file is a message rather than a mystery. */
function fail(where: string, message: string): never {
  throw new Error(
    `the level files are invalid: ${where} ${message}\n` +
      'The file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.',
  );
}

/** Read an optional number, range-checked. */
function optNum(node: Record<string, unknown>, key: string, where: string, fallback: number, min: number, max: number): number {
  const value = node[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    fail(where, `"${key}" is ${JSON.stringify(value)}, but it should be a number between ${min} and ${max}.`);
  }
  return value;
}

/** Read a required number. */
function reqNum(node: Record<string, unknown>, key: string, where: string, min: number, max: number): number {
  if (node[key] === undefined) fail(where, `"${key}" is required.`);
  return optNum(node, key, where, NaN, min, max);
}

/** Read a string from a fixed vocabulary. `fallback` null means required. */
function pick(node: Record<string, unknown>, key: string, where: string, fallback: string | null, allowed: readonly string[]): string {
  const value = node[key];
  if (value === undefined) {
    if (fallback === null) fail(where, `"${key}" is required; it should be one of ${allowed.join(' / ')}.`);
    return fallback;
  }
  if (typeof value !== 'string' || !allowed.includes(value)) {
    fail(where, `"${key}" is ${JSON.stringify(value)}, but it should be one of ${allowed.join(' / ')}.`);
  }
  return value;
}

/**
 * One block, validated.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY AN UNKNOWN KEY IS AN ERROR
 * ---------------------------------------------------------------------------------------------
 * This is the check that earns its keep in a hand-edited file. A misspelled `amplitude` would otherwise be ignored,
 * and a block that quietly produced a straight line instead of a weave does not look like a typo -- it looks like the
 * game is broken. Naming the key is the difference between the two.
 */
function readBlock(raw: unknown, levelId: string, index: number): SpawnBlock {
  const where = `levels["${levelId}"].spawns[${index}]`;
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) fail(where, 'must be an object.');
  const node = raw as Record<string, unknown>;
  const extra = Object.keys(node).filter((k) => !BLOCK_KEYS.includes(k));
  if (extra.length) fail(where, `has keys that do nothing here: ${extra.join(', ')}. Known keys: ${BLOCK_KEYS.join(', ')}.`);

  const at = reqNum(node, 'at', where, 0, Number.MAX_SAFE_INTEGER);
  const kind = pick(node, 'kind', where, null, SPAWN_KINDS) as SpawnKind;
  const count = Math.round(optNum(node, 'count', where, 1, 1, 200));
  const arrange = pick(node, 'arrange', where, count <= 1 ? 'single' : 'line', ARRANGEMENTS) as Arrange;
  const from = pick(node, 'from', where, 'top', SIDES) as EntrySide;

  const sizesRaw = node['sizes'];
  let sizeTable: number[] | null = null;
  if (sizesRaw !== undefined) {
    if (!Array.isArray(sizesRaw) || !sizesRaw.length || !sizesRaw.every((n) => typeof n === 'number' && n > 0)) {
      fail(where, `"sizes" is ${JSON.stringify(sizesRaw)}, but it should be a non-empty list of positive numbers.`);
    }
    sizeTable = sizesRaw as number[];
  }

  /**
   * The two rules that keep the file from describing something the game cannot do.
   *
   * Both are checked HERE rather than being ignored at runtime, because in both cases the config would look fine and
   * the game would look broken: scenery that never arrives, or a collectable that ignores its own direction.
   */
  if (from !== 'top' && (kind === 'bubble' || isPickup(kind))) {
    fail(
      where,
      `is a "${kind}" arriving from the ${from}, but collectables and skills come down with the current. Only creatures and obstacles can enter from a side.`,
    );
  }
  if (from === 'bottom' && isScenery(kind)) {
    fail(where, `is a "${kind}" arriving from the bottom, but scenery cannot swim up -- the current only carries things down.`);
  }
  if (arrange === 'barrier' && !isScenery(kind)) {
    fail(where, `arranges a "${kind}" as a barrier, but only obstacles can be arranged into a row with a gap.`);
  }

  return {
    at,
    kind,
    count,
    arrange,
    x: optNum(node, 'x', where, 0.5, 0, 1),
    xFrom: optNum(node, 'xFrom', where, 0.12, 0, 1),
    xTo: optNum(node, 'xTo', where, 0.88, 0, 1),
    span: optNum(node, 'span', where, 0, 0, 100000),
    amplitude: optNum(node, 'amplitude', where, 0, 0, 0.5),
    wavelength: optNum(node, 'wavelength', where, 6, 0.5, 100),
    gapAt: optNum(node, 'gapAt', where, 0.5, 0, 1),
    gapWidth: optNum(node, 'gapWidth', where, 0.24, 0, 1),
    sizes: sizeTable,
    from,
    /**
     * The entry speed defaults come from `config/mechanics.json5` rather than being literals here, so "how fast does
     * something swim in" is one tunable number shared by the whole file instead of a number per block.
     */
    enterSpeed: optNum(node, 'enterSpeed', where, mech.spawning.enterSpeedMps, 1, 500),
    depth: optNum(node, 'depth', where, mech.spawning.entryDepth, 0, 1),
    // The block's PATH, if it names one. Checked against the level's own path table later (the block is read before the
    // level finishes parsing), so a typo here is reported once the table is known rather than silently ignored.
    ...(typeof node['path'] === 'string' ? { path: node['path'] } : {}),
    // (a school key used to live here; schools are splines now)

    // that silently disappears between the file and the water. (That is exactly how path failed the first time.)
  };
}

/**
 * Expand one block into the entries it places.
 *
 * The helpers below are unchanged from when levels were written in code -- they were always the mechanism, and this
 * function is the only thing that changed: it reads a block instead of being handed arguments by a source file.
 */
function expandBlock(block: SpawnBlock): LevelEntry[] {
  const side: Pick<LevelEntry, 'from' | 'enterSpeed' | 'depth'> =
    block.from === 'top' ? {} : { from: block.from, enterSpeed: block.enterSpeed, depth: block.depth };
  const tag = (entries: LevelEntry[]): LevelEntry[] => entries.map((e) => ({ ...e, ...side }));

  /**
   * A block on a PATH is a STRING: `count` creatures, spread along the curve by their own index.
   *
   * Expanded here rather than at spawn time so the whole string exists in the timeline like everything else -- which
   * is authored in metres rather than in frames.
   */

  if (block.path) {
    const n = Math.max(1, block.count);
    return tag(
      Array.from({ length: n }, (_, i) => ({
        ...place.one(block.at, block.kind, block.x, block.sizes?.[i % Math.max(1, block.sizes?.length ?? 1)]),
        path: block.path as string,
        pathOffset: n > 1 ? i / n : 0,
      })),
    );
  }

  switch (block.arrange) {
    case 'single':
      return tag([place.one(block.at, block.kind, block.x, block.sizes?.[0])]);
    case 'line':
      return tag(place.line(block.at, block.kind, block.count, block.xFrom, block.xTo));
    case 'column':
      return tag(place.column(block.at, block.span, block.count, block.kind, block.x));
    case 'spread':
      return tag(
        place.spread(
          block.at,
          block.span,
          block.count,
          block.kind,
          weave(block.amplitude, block.x, block.wavelength),
          block.sizes ? sizes(block.sizes) : undefined,
        ),
      );
    case 'barrier':
      return tag(place.barrier(block.at, block.kind, block.count, block.gapAt, block.gapWidth));
  }
}

/** The file, parsed and validated. Throws with the offending place named. */
/**
 * Read one colour from a level's palette, with a default.
 *
 * Accepts the same two spellings the config uses everywhere else (0xrrggbb or a "#rrggbb" string), because a level
 * author writing a palette should not have to remember which of the two this particular field wants.
 */
function optColour(node: Record<string, unknown>, key: string, where: string, fallback: number): number {
  const raw = node[key];
  if (raw === undefined) return fallback;
  const value = typeof raw === 'string' ? Number.parseInt(raw.replace('#', ''), 16) : raw;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 0xffffff) {
    fail(where + '.' + key, 'should be a colour: 0xrrggbb or a "#rrggbb" string.');
  }
  return value;
}

/**
 * Read one level out of a parsed object, named by where it came from.
 *
 * `where` is the file (or the `levels[i]` slot) the level came from, so every validation message says WHICH FILE to
 * open. Since levels moved into one file each, "levels[3] is invalid" would be a worse message than the one it
 * replaced: the reader would have to count objects in an editor to find out which file that is.
 */
function readLevel(node: Record<string, unknown>, where: string): Level {
  const id = pick(node, 'id', where, null, [String(node['id'])]);
  const name = typeof node['name'] === 'string' ? (node['name'] as string) : id;
  const extra = Object.keys(node).filter((k) => !LEVEL_KEYS.includes(k));
  if (extra.length) fail(`${where} (level "${id}")`, `has keys that do nothing here: ${extra.join(', ')}. Known keys: ${LEVEL_KEYS.join(', ')}.`);

  const rawSpawns = node['spawns'];
  if (!Array.isArray(rawSpawns) || !rawSpawns.length) fail(`${where} (level "${id}")`, '"spawns" must be a non-empty list.');

  const blocks = rawSpawns.map((raw, i) => readBlock(raw, id, i));
  const entries = blocks.flatMap(expandBlock).sort((a, b) => a.at - b.at);
  const landmarks = Array.isArray(node['landmarks'])
    ? (node['landmarks'] as { depth: number; label: string }[])
    : undefined;

  const scrollLength = reqNum(node, 'scrollLength', `${where} (level "${id}")`, 1, 1000000);
/**
 * The boss, validated against the level's own length.
 *
 * `at` must be INSIDE the level, because the scroll stops at `scrollLength`: a boss scheduled past that point would
 * never arrive, and the level could never be completed. That is a config error that looks exactly like the game
 * hanging at the end of a level, so it is caught here with the numbers in the message.
 */
/**
 * The palette: four colours and a strength.
 *
 * Defaulted rather than required, so a level written before palettes existed still loads -- and the default is the
 * ramp this game shipped with, which is also a reasonable no-opinion answer.
 */
const rawPalette = node['palette'];
const paletteNode = (rawPalette && typeof rawPalette === 'object' && !Array.isArray(rawPalette) ? rawPalette : {}) as Record<string, unknown>;
const palette: LevelPalette = {
  waterAlpha: optNum(paletteNode, 'waterAlpha', `${where}.palette`, 1, 0, 1),
  deep: optColour(paletteNode, 'deep', `${where}.palette`, 0x020710),
  shallow: optColour(paletteNode, 'shallow', `${where}.palette`, 0x2e8fc4),
  bloom: optColour(paletteNode, 'bloom', `${where}.palette`, 0xbff0ff),
  tint: optColour(paletteNode, 'tint', `${where}.palette`, 0xffffff),
  tintStrength: optNum(paletteNode, 'tintStrength', `${where}.palette`, 0, 0, 1),
};

/**
 * The named paths, validated as they are read.
 *
 * A path with fewer than two points is not a spline and a path with a zero duration never finishes, and both would
 * look like "the creatures I placed are not moving" rather than like a config error -- so both are refused here,
 * with the level and the path named.
 */
/**
 * The backdrop layer list, read as an array.
 *
 * A single object is accepted and wrapped, so a level with one picture (or a config written before this became a
 * list) keeps working: the shape of the data follows the common case, and the common case for a while was one image.
 */
const rawBackdrop = node['backdrop'] ?? node['backdrops'];
const rawList = Array.isArray(rawBackdrop) ? rawBackdrop : rawBackdrop === undefined ? [] : [rawBackdrop];
const backdrops: BackdropSpec[] | undefined =
  rawList.length === 0
    ? undefined
    : rawList.map((raw, i) => {
        const bd = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
        // Its own name: shadowing `where` with a string built from `where` is a self-reference, not a refinement.
        const at = `${where}.backdrops[${i}]`;
        if (typeof bd['image'] !== 'string') fail(at + '.image', 'must be the file name of a picture.');
        return {
          image: bd['image'] as string,
          speedFactor: optNum(bd, 'speedFactor', at, 0.03, 0, 1),
          heightScreens: optNum(bd, 'heightScreens', at, 1.15, 0.2, 6),
          alpha: optNum(bd, 'alpha', at, 0.55, 0, 1),
          tint: optColour(bd, 'tint', at, 0xffffff),
        };
      });
let paths: Record<string, PathSpec> | undefined;
if (node['paths'] !== undefined) {
  const rawPaths = node['paths'];
  if (rawPaths === null || typeof rawPaths !== 'object' || Array.isArray(rawPaths)) {
    fail(`${where}.paths`, 'must be an object of path name to path.');
  }
  paths = {};
  for (const [name, rawPath] of Object.entries(rawPaths as Record<string, unknown>)) {
    const pathNode = (rawPath && typeof rawPath === 'object' && !Array.isArray(rawPath) ? rawPath : {}) as Record<string, unknown>;
    const rawPoints = pathNode['points'];
    if (!Array.isArray(rawPoints) || rawPoints.length < 2) {
      fail(`${where}.paths.${name}.points`, 'must be a list of at least two points, or there is no spline to follow.');
    }
    const points = rawPoints.map((raw, i) => {
      const pt = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
      return {
        x: reqNum(pt, 'x', `${where}.paths.${name}.points[${i}]`, -20, 20),
        y: reqNum(pt, 'y', `${where}.paths.${name}.points[${i}]`, -100000, 100000),
      };
    });
    paths[name] = {
      points,
      seconds: reqNum(pathNode, 'seconds', `${where}.paths.${name}`, 0.1, 600),
    };
  }
}

const rawBoss = node['boss'];
if (rawBoss === null || typeof rawBoss !== 'object' || Array.isArray(rawBoss)) {
  fail(`${where}.boss`, 'is missing. Every level ends when its boss is defeated, so a level must name one.');
}
const bossNode = rawBoss as Record<string, unknown>;
const bossAt = reqNum(bossNode, 'at', `${where}.boss`, 0, 1000000);
if (bossAt >= scrollLength) {
  fail(
    `${where}.boss.at`,
    `is ${bossAt}, but the level is only ${scrollLength} long and the scroll stops there -- the boss would never arrive and the level could never end. Put it below ${scrollLength}.`,
  );
}
const boss: BossSpec = {
  at: bossAt,
  health: reqNum(bossNode, 'health', `${where}.boss`, 1, 100000),
  name: typeof bossNode['name'] === 'string' ? (bossNode['name'] as string) : 'BOSS',
  ...(bossNode['colour'] === undefined
    ? {}
    : { colour: reqNum(bossNode, 'colour', `${where}.boss`, 0, 0xffffff) }),
};

  return {
    id,
    name,
    scrollLength,
    scrollSpeed: reqNum(node, 'scrollSpeed', `${where} (level "${id}")`, 0.001, 10000),
    ...(node['playerLeadLimit'] === undefined
      ? {}
      : { playerLeadLimit: optNum(node, 'playerLeadLimit', `${where} (level "${id}")`, 0, 0, 10000) }),
    ...(landmarks ? { landmarks } : {}),
    boss,
    palette,
    ...(paths ? { paths } : {}),
    ...(backdrops ? { backdrops } : {}),
    entries,
    blocks,
  };
}

/**
 * Read the whole level set out of one or more parsed files.
 *
 * `sources` is `[file name, parsed object]` per file: the name is only ever used to SAY WHERE a mistake is, which is
 * the whole reason levels moved into one file each -- a message that reads `black-smokers.json5: paths.weave.points`
 * sends the reader to the file to open, where `levels[3].paths.weave.points` sent them counting objects in an editor.
 *
 * The order of `sources` is the ORDER OF THE LEVELS, because that order is the progression: each level unlocks the
 * next. A file that holds a single level (the usual case now) and an older file that holds `levels: [...]` are both
 * accepted, so the split did not have to be a flag day.
 */
function readLevels(sources: readonly (readonly [string, unknown])[]): { start: string | undefined; levels: Level[] } {
  const levels: Level[] = [];
  const perFile: { file: string; start?: unknown; ids: string[] }[] = [];

  for (const [file, parsed] of sources) {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail(file, 'must be an object. A level file holds one level, or a list of them under "levels".');
    }
    const node = parsed as Record<string, unknown>;
    /**
     * The two accepted shapes: the level's own keys at the top of the file, or the same keys nested under `levels`.
     *
     * Decided by looking for a key only a level has, rather than by a `version` field: a file that is neither shape
     * then fails with the message that says what a level file is, instead of with "id is missing".
     */
    const looksLikeLevel = typeof node['id'] === 'string' || Array.isArray(node['spawns']) || node['scrollLength'] !== undefined;
    const nested = node['levels'];
    let nodes: Record<string, unknown>[];
    if (looksLikeLevel) {
      nodes = [node];
    } else if (Array.isArray(nested) && nested.length > 0) {
      nodes = nested.map((raw, index) => {
        if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) fail(`${file} levels[${index}]`, 'must be an object.');
        return raw as Record<string, unknown>;
      });
    } else if (Array.isArray(nested)) {
      /**
       * A file with an EMPTY `levels: []` contributes nothing, which is what the combined file became when the levels
       * moved out into their own files. It is kept because that file also holds the field documentation -- the only
       * written description of what a spawn block may contain -- and a documentation file should not be something the
       * loader chokes on.
       */
      continue;
    } else {
      fail(file, 'is not a level file: it has no "id" (one level), and no non-empty "levels" list.');
    }

    const ids: string[] = [];
    for (const [index, levelNode] of nodes.entries()) {
      const where = nodes.length === 1 ? file : `${file} levels[${index}]`;
      const level = readLevel(levelNode, where);
      ids.push(level.id);
      levels.push(level);
    }
    perFile.push({ file, start: node['start'], ids });
  }

  if (levels.length === 0) fail('the level files', 'are all empty: there is nothing to play.');
  const duplicates = levels.map((l) => l.id).filter((id, i, all) => all.indexOf(id) !== i);
  if (duplicates.length) {
    fail('the level files', `each define a level called "${duplicates[0]}". Ids must be unique across the files.`);
  }

  /**
   * Which level a fresh player begins on.
   *
   * A file may still say `start:` and it wins (an old combined file, or an owner who wants the first level to open on
   * a different one), otherwise it is the FIRST LEVEL OF THE FIRST FILE -- which is the progression order, and needs
   * no `start` key at all now that each level has a file of its own.
   */
  const declared = perFile.map((entry) => entry.start).find((value) => typeof value === 'string') as string | undefined;
  const start = declared ?? (levels[0] as Level).id;
  if (!levels.some((l) => l.id === start)) {
    fail('"start"', `names "${start}", but there is no level with that id. Levels: ${levels.map((l) => l.id).join(', ')}.`);
  }
  return { start, levels };
}

const FILE = readLevels(levelSources());

/** Every level in the files, in file order. THIS IS THE PROGRESSION ORDER: each level unlocks the next. */
export const LEVELS: readonly Level[] = FILE.levels;

/**
 * The level a fresh player begins on: the first level of the first file, unless a file says otherwise.
 *
 * `readLevels` guarantees this names a real level (it fails the load otherwise), so the `??` here is the compiler
 * being told what the loader already proved rather than a second fallback.
 */
export const START_LEVEL_ID: string = FILE.start ?? (LEVELS[0] as Level).id;

/**
 * The level currently being played.
 *
 * A `let` because levels are SELECTED now: the menu picks one and every reader has to follow, including the ones that
 * read the binding after import (`depth.ts` and `main.ts` both use `LEVEL.scrollLength`, and an ES module export is a
 * live binding, so reassigning here is seen everywhere).
 */
export let LEVEL: Level = LEVELS.find((l) => l.id === START_LEVEL_ID) ?? (LEVELS[0] as Level);

/** Where a level sits in the file, or -1. Used by the unlock rule and by the menu. */
export function levelIndex(id: string): number {
  return LEVELS.findIndex((l) => l.id === id);
}

/**
 * Switch levels.
 *
 * The level and its timeline are reassigned together rather than left to the caller, and any timeline a spec installed is
 * discarded: one function, so there is no way to select a level and keep playing the previous one's content.
 *
 * @return false for an id that does not exist, so a caller with a stale name learns about it instead of silently
 *   continuing on the previous level.
 */
export function selectLevel(id: string): boolean {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) return false;
  LEVEL = level;
  TIMELINE = level.entries;
  installedBlocks = null;
  return true;
}

/**
 * The timeline, sorted by distance so consumers can walk it forwards with a cursor.
 *
 * A `let` rather than a `const` because of the test hook below: an ES module export is a LIVE binding, so a spec can
 * install a hand-written level and every reader -- including the diagnostics that report the entry count -- sees it.
 */
export let TIMELINE: readonly LevelEntry[] = LEVEL.entries;

/** The blocks a spec installed, or null while the file's own timeline is in use. */
let installedBlocks: readonly SpawnBlock[] | null = null;

/**
 * The blocks the CURRENT timeline came from: the file's, or a spec's if one was installed.
 *
 * Kept in step with `TIMELINE` rather than reported separately, because the two describe one thing. Reporting the
 * file's block count beside an installed timeline would give two numbers that cannot be compared, and a test that
 * compared them would be asserting something meaningless.
 */
export function currentSpawnBlocks(): readonly SpawnBlock[] {
  return installedBlocks ?? LEVEL.blocks;
}

/**
 * Test hook: install a hand-written spawn table, read and expanded exactly as the file's is.
 *
 * The point is to make "the config drives the level" provable without editing the config file: the blocks go through
 * the same reader and the same expansion, so what a spec measures is the real path rather than a parallel one. It
 * also proves the loader's refusals, because a bad block here throws the same way it would in the file.
 *
 * @return how many entries the blocks expanded to, which is the number a test wants to assert against `count`.
 */
export function installSpawnBlocks(blocks: readonly unknown[]): number {
  const parsed = blocks.map((raw, i) => readBlock(raw, LEVEL.id, i));
  const entries = parsed.flatMap(expandBlock).sort((a, b) => a.at - b.at);
  assertLevelSane({ ...LEVEL, entries, blocks: parsed });
  TIMELINE = entries;
  installedBlocks = parsed;
  return entries.length;
}

export const PLAY_AREA_ASPECT = 1.9;

/** Metres of water one screenful shows. The play area's height in metres. */
export const WORLD_HEIGHT = 190;
/** Metres across the play area. Derived so the lane keeps a consistent shape on every display. */
export const WORLD_WIDTH = WORLD_HEIGHT * PLAY_AREA_ASPECT;

/**
 * The level's length used to be exported here a second time, as `DEPTH_TOTAL`.
 *
 * That name was the depth vocabulary this project has largely left behind -- a level ends when its boss does, not when
 * the bubble reaches the surface -- and it was always exactly `LEVEL.scrollLength`. Its readers were `player.depth`,
 * the snow field and the water colour, all of which now take the level (or the length) as an argument, so the duplicate
 * binding is gone rather than kept in step.
 */

/**
 * How long a full scroll of a level takes, in seconds.
 *
 * An OUTPUT of the level's length and speed, never an input. Nothing back-solves a duration: an earlier version of this
 * project made that mistake once, with a run length as the target, and the ascent curve had to be distorted to hit it.
 */
export function nominalScrollSeconds(level: Level): number {
  return level.scrollLength / level.scrollSpeed;
}

/**
 * Seconds to traverse each screenful, in order from the start of the level.
 *
 * Reported as a series rather than an average, because a mean of a curve describes no part of it. With a CONSTANT scroll
 * speed every screenful takes the same time, so this is a series for consistency with the tooling -- and it will stop
 * being flat the moment a level varies its speed, which is a natural thing to want later.
 */
export function secondsPerScreenSeries(level: Level, maxScreens = 12): number[] {
  const perScreen = WORLD_HEIGHT / level.scrollSpeed;
  const count = Math.min(maxScreens, Math.max(1, Math.round(level.scrollLength / WORLD_HEIGHT)));
  return Array.from({ length: count }, () => perScreen);
}

/**
 * Fail loudly at startup rather than shipping a level that cannot be played.
 *
 * The obstacle check is the important one, and it is not about tidiness: a row of obstacles that SEALS the lane
 * would make being small mandatory at that point rather than a choice, and "should I be big here" would stop
 * being a question. Rows are authored by hand, so the rule needs enforcing rather than remembering.
 */
export function assertLevelSane(level: Level): void {
  const problems: string[] = [];
  if (!(level.scrollLength > 0)) problems.push('scrollLength must be positive');
  if (!(level.scrollSpeed > 0)) problems.push('scrollSpeed must be positive');
  const seconds = level.scrollLength / level.scrollSpeed;
  if (seconds < 10) problems.push(`only ${seconds.toFixed(1)}s of scroll; too short to be a level`);
  if (seconds > 400) problems.push(`${seconds.toFixed(0)}s of scroll; too long for one level`);
  if (!level.entries.length) problems.push('no entries; the level would be empty');
  const beyond = level.entries.filter((e) => e.at < 0 || e.at > level.scrollLength);
  if (beyond.length) problems.push(`${beyond.length} entries outside the level's length`);
  const badX = level.entries.filter((e) => e.x < 0 || e.x > 1);
  if (badX.length) problems.push(`${badX.length} entries outside the play area`);

  /**
   * Every row of obstacles must leave a gap the smallest player can fit through.
   *
   * Rows are grouped by their `at` value, which is how `place.barrier` authors them: one distance, several blocks.
   * Two rows a metre apart are treated as separate, which is correct -- a player passes them at different times.
   */
  const required = mech.obstacles.minGapFraction;
  const rows = new Map<number, { x: number; radius: number }[]>();
  for (const entry of level.entries) {
    if (entry.kind !== 'crate' && entry.kind !== 'coral') continue;
    const radius = mech.obstacles.radius[entry.kind] ?? 0.05;
    const row = rows.get(entry.at) ?? [];
    row.push({ x: entry.x, radius });
    rows.set(entry.at, row);
  }
  for (const [at, row] of rows) {
    if (!rowGapIsPassable(row)) {
      problems.push(
        `obstacle row at ${at}m leaves no gap of ${required} or more; it would seal the lane and make being small mandatory`,
      );
    }
  }

  if (problems.length) throw new Error(`Level "${level.id}" is unusable: ${problems.join('; ')}`);
}

/**
 * Check EVERY level in the file, not just the one being played.
 *
 * A level nobody is playing today is a level nobody will notice is broken until it is selected, and by then the
 * failure is a runtime one rather than a message at boot. The check is cheap and the file is the only way to add a
 * level, so this is the moment to fail.
 */
for (const level of LEVELS) assertLevelSane(level);


























