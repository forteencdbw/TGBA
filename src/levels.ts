import JSON5 from 'json5';
import { BOSS_KINDS, isBossKind, type HazardKind, type VentAim, type VentSide } from './hazards';
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
 * the view and the current carries it down. `left`/`right`/`bottom` are the ones this type exists for --
 * something swimming in from the side, or catching the player up from behind. `random` is not an edge: it asks the
 * block's coin to pick left or right, and `ResolvedSide` is what the runtime actually sees.
 */
export type EntrySide = 'top' | 'left' | 'right' | 'bottom' | 'random';

/** An edge after the coin has been rolled: `random` is an authoring request, never a runtime state. */
export type ResolvedSide = Exclude<EntrySide, 'random'>;

/**
 * Which wall a vent may name.
 *
 * `random` and an omitted `side` mean the same thing: this block's coin picks a wall. Only an explicit `left` or
 * `right` pins it, which is the "if the file says where, the file wins" half of the mirroring rule.
 */
export type LevelVentSide = VentSide | 'random';

/**
 * One thing to place, and how far into the level it appears.
 */
export interface LevelEntry {
  /** Metres of scroll at which this enters. */
  at: number;
  /**
   * Which authored block this entry came from.
   *
   * Every entry expanded from one `spawns` block shares it, so the block's horizontal coin is rolled ONCE and the
   * whole row/line/school mirrors together. Without it a barrier would have each piece flip on its own and the gap
   * would scatter. Optional only because hand-written test timelines may predate it.
   */
  group?: number;
  /**
   * The named spline this entry follows, if any. See `PathSpec`.
   *
   * A creature on a path ignores every other motion rule -- it does not chase, which is what keeps an authored shape
   * the shape that was authored -- and its `x` here only decides where it sits on the frame it spawns, since the
   * curve's own first point takes over on the next.
   */
  path?: string;
  /**
   * How many seconds LATE this entry leaves the start of its spline.
   *
   * A string is spaced by TIME, not by position: every member is created at the head of the curve and waits there
   * until its turn, so the school visibly sets off from the start and swims the whole line. The earlier version
   * seeded each member part-way along the curve instead (`elapsed = seconds * i / n`), which meant most of a string
   * simply APPEARED in the middle of its own path, already at speed, with nothing to say how it got there.
   *
   * Waiting at the head only works when the head is off-screen -- every path in this game enters from beyond the
   * lane edge -- because a queue that waits where it can be seen is a pile. See `SpawnBlock.pathSpacingSeconds` for
   * how far apart the turns are.
   */
  pathDelaySeconds?: number;
  /**
   * Which Boids school this creature belongs to: the index of the block that made it, which every creature of one block
   * shares. Absent for everything that is not part of a school.
   *
   * A school with this set follows `path` through an invisible leader rather than itself -- see `src/boids.ts` -- so the
   * `path` an entry carries means "the leader's spline" and `pathDelaySeconds` is absent: nothing waits its turn, the
   * whole school is born at once.
   */
  school?: number;
  /**
   * For a creature of a Boids school: how many real fish the block makes and which of them this is, 0-based.
   *
   * The index is the fish's place in the order it is placed, which decides its fixed depth (see `seedMember` in
   * `src/boids.ts`); the size is what spreads those depths evenly. Absent for everything that is not part of a school.
   */
  schoolSize?: number;
  schoolIndex?: number;
  /**
   * Which layer the school swims in. Absent means the foreground; `'back'` is a background school, which `placeEntry` hands to
   * `HazardField.back` instead of making hazards, so it has no hitbox. Carried on every entry of the block.
   */
  layer?: 'back';
  /** For a background school: how far away it is, 0 (near) to 1 (far). Present exactly when `layer` is. */
  distance?: number;
  /**
   * Which of the kind's looks every creature in this BLOCK shows.
   *
   * A block is a school: `{ kind: 'fish', count: 6 }` is six fish that arrived together and are one shoal, and a
   * shoal drawn half sardine and half perch is two shoals pretending to be one. So the number is the block's own
   * index rather than a per-creature roll -- see `expandBlock` -- and a string on a spline is one school too, for
   * the same reason.
   */
  variety?: number;
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
   * Collectables are `bubble`, hazards name their kind, and `crate` / `coral` / `wall` / `net` are the
   * obstacles. (The pickups are gone: the gun's rows and the rate tiers are all paid in
   * mutations now, so a level no longer places any of them.)
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
  /**
   * Which edge it arrives from. Absent means `top`; `'random'` means this block's coin picks left or right.
   *
   * `'random'` is a request for a SIDE, not a vertical direction: it cannot be used on a collectable, which always
   * comes down with the current.
   */
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
  /**
   * Metres ABOVE the visible top to place it, for a top-borne creature.
   *
   * Absent (0) is the old rule: the entry appears at the top edge. A positive value parks it further up, so whatever
   * it reaches DOWNWARD -- a vent's plume -- can enter the view before its body does. It does not change `at`: the
   * level hands the entry over at the same moment, and it simply takes longer to be seen.
   *
   * Creatures only. A collectable comes down with the current and scenery has nothing that reaches ahead of it, so
   * the loader refuses the key on those rather than letting it do nothing.
   */
  aboveMeters?: number;
  /**
   * Vents only: which wall the rock is mounted on.
   *
   * There is no `x` for a vent, and that is the point. A vent used to be placed anywhere across the lane, so the file
   * could say "vent in the middle" and the game would dutifully put one there; naming a WALL instead means the
   * position is derived and the illegal case has nowhere to be written.
   *
   * Omitted or `'random'` means the block's coin picks the wall; `left`/`right` pins it.
   */
  side?: LevelVentSide;
  /** Vents only: which way the plume points relative to its own wall. Absent means `up`. */
  aim?: VentAim;
  /** Vents only: seconds of quiet after it appears, overriding `hazards.vent.startDelaySeconds` for this one. */
  startDelaySeconds?: number;
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
  /**
   * THE GUNNERS: the four that fight at range. All four ride the current like the eel does; what
   * separates them is written where it belongs -- `enemyBullets.shooters` for their fire and
   * `hazards.<kind>` for each one's signature rule.
   */
  | 'archer'
  | 'pistol'
  | 'puffer'
  | 'starfish'
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
  /**
   * Put this block's creatures on a named spline.
   *
   * `count` then means "a string of this many": they all start at the head of the same curve and set off one after
   * another, which is the whole effect. `pathSpacingSeconds` is how long one waits behind the one before it -- see
   * `LevelEntry.pathDelaySeconds`. Times rather than distances, because a gap measured along the curve would stretch
   * and bunch as the curve speeds up and slows down, and a school with a rhythm is a squad.
   */
  path?: string;
  /**
   * Seconds between one member of a string setting off and the next. Default `DEFAULT_PATH_SPACING_SECONDS`.
   *
   * This is the knob for how tight a school is, and it is the one to reach for: the same count over a shorter gap is
   * a tighter school, over a longer gap it is a looser line. `count` alone no longer decides -- it decides the
   * LENGTH of the string, which is the honest reading of "ten fish, two a second".
   */
  pathSpacingSeconds?: number;
  /**
   * Make this block a Boids school: `count` fish that swim as one body behind an invisible leader walking `path`.
   *
   * Only for `kind: 'fish'`, and only with a `path` -- the loader refuses anything else, because a school with nothing
   * to follow is a key that silently does nothing. See `src/boids.ts`, and the config's `hazards.boids` for the numbers.
   */
  boids?: boolean;
  /**
   * Which layer a Boids school swims in: `'front'` (the default) is the hazards the player fights, and `'back'` is the same
   * simulation as pictures -- no hitbox, nothing shoots them, nothing eats them -- drawn behind everything else.
   *
   * A background school is a school, so it needs `boids: true`; and it needs a `distance`. The order background schools come
   * on in is the order of their `at`, like everything else in the file.
   */
  layer?: 'front' | 'back';
  /**
   * How far away a background school is: 0 is as near as the foreground, 1 is as far as anything goes. It decides how big and how
   * dim the school is, between the ends the config gives at `hazards.boids.back`, and NOTHING else: how fast the school crosses
   * is its path's. Required with `layer: 'back'` and refused without it.
   */
  distance?: number;
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
  /** Metres above the visible top a top-borne creature begins; see `LevelEntry.aboveMeters`. */
  aboveMeters?: number;
  /**
   * Vents, and only vents -- the loader refuses these on anything else.
   *
   * Optional here because `SpawnBlock` is also what the level AUTHORING helpers in this file produce, and those are
   * used for every kind; omitted on a vent means its coin picks the wall.
   */
  side?: LevelVentSide;
  aim?: VentAim;
  startDelaySeconds?: number;
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
  /**
   * How fast the water's creatures move on the SCREEN, in metres per second: the one number their downward drift is
   * measured in.
   *
   * It used to be `scrollSpeed` as well. The camera's rise and the creatures' drift were the same variable, so a
   * level's pace and its creatures' speed could not be set apart: halving `scrollSpeed` halved how fast every fish fell
   * (measured: -45 -> -22.5 m/s) and stopping it froze them where they were. Now the scroll is the level's PROGRESS --
   * which part of the timeline is due, the depth readout, the backdrop's parallax -- and nothing a creature does depends
   * on it. See `HazardField.update`, which carries each creature along with the camera so that this is true.
   *
   * Written as a number in every level rather than defaulted to `scrollSpeed`: a default that copies the other field is the
   * coupling again, with a quieter name. The six levels carry today's numbers, so nothing on screen changed when it
   * was introduced.
   */
  driftSpeed: number;
  /**
   * The pace as a CURVE over the level's length, or absent for a constant `scrollSpeed`.
   *
   * Keyframed in METRES and not in seconds, and that choice is the whole reason this is cheap: the timeline's `at` values
   * are metres too, so re-pacing a level does not move a single thing in it -- what changes is WHEN each piece arrives.
   * Doing it in seconds would have invalidated every hand-placed block, the splines, and the obstacle gaps.
   *
   * Linear between keyframes, and the ends CLAMP: a keyframe at 300m says nothing about 100m, so the first speed simply
   * holds backwards. **One keyframe is a legal curve and means "constant"**, which is why a level that has not been
   * re-paced needs no entry at all -- and why this can be introduced one level at a time.
   */
  scrollSpeedCurve?: readonly (readonly [number, number])[];
  /** The scripted content, in any order: it is sorted by `at` when the level loads. */
  entries: readonly LevelEntry[];
  /** The blocks the entries were expanded from, kept so a test can prove the file and the timeline agree. */
  blocks: readonly SpawnBlock[];
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
   * lasts and what the thing is called. `kind` is here too, and it is the seam between the two: a level CHOOSES which
   * creature it ends with, and that creature's mechanics -- how it moves, what it fires, how big it is, what colour it
   * is -- live in the config's `hazards.bosses.<kind>`, exactly as a fish's motion lives there and its spawn position
   * lives in the level.
   *
   * The colour used to be here as well, which was the shape of the mistake the split fixed: a level could say what its
   * boss LOOKED like but nothing about how it fought, so six different creatures were one creature repainted. What a
   * boss looks like is a property of the boss.
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
   * Coordinates are relative to where the creature spawned, and the two axes use different units on purpose: `x` is a
   * LANE fraction (below 0 and above 1 are off the screen, which is how entering and leaving work -- the lane is a
   * fixed 361 metres wide, so this is the same place on every device), and `y` is a SCREEN fraction, one unit being
   * one visible screen, positive upward: -0.5 is the middle of the glass, -1 the bottom edge. Metres would not do for
   * the height, because how many of them fit on the screen depends on the device -- 433 on a desktop window against
   * 781 on a phone -- and "pass the middle of the screen" is the thing being authored. See `LevelEntry.path`.
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
  /**
   * Set only on the debug level: the id of the ladder level whose music it borrows.
   *
   * A level is keyed by its id in the audio config, and the debug level has no track of its own. Naming the level it
   * borrows from, rather than copying that level's track under a second key, keeps one definition of what level 1 sounds like.
   */
  looksLike?: string;
  /**
   * The recorded track this level plays, as a stem under `src/assets/audio/music/` (no extension).
   *
   * Absent means "the level's own id", which is the old one-file-per-level convention; `looksLike` and then the id
   * remain the fallback for the debug level. Two levels naming the same stem share one file, which is how a theme can
   * cover a pair of levels without duplicating the MP3.
   */
  music?: string;
}
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
  /**
   * The waypoints, in order. At least two: a spline needs something to run through.
   *
   * `x` is a lane fraction and `y` a screen fraction, both from the spawn point -- see `Level.paths` for why the two
   * axes are measured in different things.
   */
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

/** One level's boss, as authored: which creature it is, where it arrives, how tough it is, and what it is called. */
export interface BossSpec {
  /** Which boss this is -- a hazard kind, and one of `BOSS_KINDS`. The level's answer to "what am I ending on". */
  kind: HazardKind;
  /** Metres travelled when it arrives. Must be inside the level, or the fight could never start. */
  at: number;
  /** Hit points. The length of the fight. */
  health: number;
  /** Shown above its health bar. */
  name: string;
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
 * for the same reason `isScenery` asks the obstacle table -- and the bosses are the ones filtered out, because a
 * level does not place its boss in a spawn block, it names it in its own `boss` field.
 *
 * The filter asks `isBossKind` rather than comparing against one name: it used to be `kind !== 'boss'`, which was
 * correct exactly until the boss became six kinds -- at which point all six would have become spawnable by a level
 * file, and a level could have placed 长尾鲨 in a `spawns` line like any fish.
 */
const SPAWN_KINDS: readonly string[] = [
  // The collectable. Spelled out because it is not a creature: nothing about it lives in the hazard tables.
  'bubble',
  ...Object.keys(mech.hazards.health).filter((kind) => !isBossKind(kind as HazardKind)),
  ...OBSTACLE_KINDS,
];
const ARRANGEMENTS: readonly string[] = ['single', 'line', 'column', 'spread', 'barrier'];
/** Whether a kind is scenery. Asked of the config's own list, so a new obstacle kind is covered by construction. */
const isScenery = (kind: string): boolean => (OBSTACLE_KINDS as readonly string[]).includes(kind);

const SIDES: readonly string[] = ['top', 'left', 'right', 'bottom', 'random'];

/**
 * The walls a vent may be mounted on, and the ways its plume may point.
 *
 * Runtime lists for the same reason `SIDES` is one: the loader only has strings to compare, and the TYPE half alone
 * would let a typo through to a fallback.
 */
const VENT_SIDES: readonly string[] = ['left', 'right', 'random'];
const VENT_AIMS: readonly string[] = ['up', 'flat', 'down'];

/** The keys a block may use. Anything else is an error rather than a silent no-op -- see `readBlock`. */
/**
 * Seconds between one member of a spline string setting off and the next, when a block does not say.
 *
 * Half a second is a school with visible water between the fish. It replaced a spacing that was a fraction of the
 * CURVE (`seconds / count`), which for level 1's weave worked out at 0.75-1.25 seconds a fish -- about a body and a
 * half of clear water, which the owner read as a scattered line rather than a shoal.
 */
const DEFAULT_PATH_SPACING_SECONDS = 0.5;

const BLOCK_KEYS: readonly string[] = [
  'path',
  'pathSpacingSeconds',
  'boids',
  'layer',
  'distance',
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
  'aboveMeters',
  // Vents, and only vents: see the `side`/`aim` checks in `readBlock`.
  'side',
  'aim',
  'startDelaySeconds',
];

const LEVEL_KEYS: readonly string[] = [
  'id',
  'name',
  'music',
  'scrollLength',
  'scrollSpeed',
  'scrollSpeedCurve',
  'driftSpeed',
  'playerLeadLimit',
  'boss',
  'palette',
  'paths',
  'backdrop',
  'backdrops',
  'spawns',
];

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
  const aboveMeters = optNum(node, 'aboveMeters', where, 0, 0, 100000);

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
  if (from !== 'top' && kind === 'bubble') {
    const fromWhere = from === 'random' ? 'a random side' : `the ${from}`;
    fail(
      where,
      `is a "${kind}" arriving from ${fromWhere}, but collectables come down with the current. Only creatures and obstacles can enter from a side.`,
    );
  }
  if (from === 'bottom' && isScenery(kind)) {
    fail(where, `is a "${kind}" arriving from the bottom, but scenery cannot swim up -- the current only carries things down.`);
  }
  if (arrange === 'barrier' && !isScenery(kind)) {
    fail(where, `arranges a "${kind}" as a barrier, but only obstacles can be arranged into a row with a gap.`);
  }
  /**
   * The vent rules, in both directions.
   *
   * A vent may name a wall (or ask for a random one) and must not name a position, and nothing else may name a wall
   * at all. Both directions are checked because a half-applied rule is worse than none: `side` on a fish would be a
   * key that silently does nothing, and an accidental `side` on scenery would make the file look like it decided
   * something it did not.
   */
  const isVent = kind === 'vent';
  if (isVent && from !== 'top') {
    const fromWhere = from === 'random' ? 'a random side' : `the ${from}`;
    fail(where, `is a "vent" arriving from ${fromWhere}, but a vent is terrain: it is where it is, and nothing carries it in.`);
  }
  if (!isVent) {
    const stray = ['side', 'aim', 'startDelaySeconds'].filter((k) => node[k] !== undefined);
    if (stray.length) fail(where, `gives a "${kind}" the vent-only key(s) ${stray.join(', ')}, which would do nothing.`);
  }
  const side =
    isVent && node['side'] !== undefined
      ? (pick(node, 'side', where, 'left', VENT_SIDES) as LevelVentSide)
      : undefined;
  const aim = node['aim'] === undefined ? undefined : (pick(node, 'aim', where, 'up', VENT_AIMS) as VentAim);

  /**
   * A school needs a fish and a spline, and nothing else may claim to be one.
   *
   * Both directions are refused rather than ignored: `boids` on a shark would be a key that does nothing, and a school
   * with no `path` would have no leader to follow -- each looks like "the school is not working" rather than like a
   * mistake in the file.
   */
  const boidsRaw = node['boids'];
  if (boidsRaw !== undefined && typeof boidsRaw !== 'boolean') {
    fail(where, `"boids" is ${JSON.stringify(boidsRaw)}, but it should be true or false.`);
  }
  const boids = boidsRaw === true;
  if (boids && kind !== 'fish') {
    fail(where, `makes a school of "${kind}", but only fish swim in a Boids school.`);
  }
  if (boids && typeof node['path'] !== 'string') {
    fail(where, 'is a Boids school with no "path": the school follows its path through an invisible leader, so it needs one.');
  }
  /**
   * The background layer, and its one number.
   *
   * Both directions are refused rather than ignored, for the reason every rule here is: a `distance` on a foreground school
   * would be a key that does nothing, and a background school with no `distance` would be drawn at a depth the author never
   * chose. A background school is a Boids school -- the layer is a way of drawing and not a way of moving -- so it needs the
   * flag too.
   */
  const layer = pick(node, 'layer', where, 'front', ['front', 'back']) as 'front' | 'back';
  if (layer === 'back' && !boids) {
    fail(where, 'is on layer "back" but is not a Boids school: only a school can be in the background. Add boids: true (with a path).');
  }
  if (layer === 'back' && node['distance'] === undefined) {
    fail(where, 'is on layer "back" with no "distance": 0 is as near as the foreground and 1 is as far as it goes, and it decides the size and the dimming.');
  }
  if (layer === 'front' && node['distance'] !== undefined) {
    fail(where, 'has "distance", which is how far away a BACKGROUND school is. Add layer: "back", or it would do nothing.');
  }
  if (boids && from !== 'top') {
    fail(where, `is a Boids school arriving from the ${from}: a school is born where its path starts, so it has no edge to arrive from.`);
  }
  /**
   * `aboveMeters` is for an entry that has a VIEW above it to wait in, which means a creature arriving from the top.
   *
   * Both refusals are about a key that would otherwise look like it did something: a side arrival's position is
   * decided by `depth`, and a collectable or a piece of scenery has nothing that reaches ahead of its body, so
   * parking it above the view would change nothing visible and only delay it.
   */
  if (aboveMeters > 0) {
    if (from !== 'top') {
      fail(where, `has "aboveMeters" and arrives from the ${from}: only a top-borne entry has a view above it to wait in.`);
    }
    if (kind === 'bubble' || isScenery(kind)) {
      fail(
        where,
        `gives a "${kind}" "aboveMeters", but only creatures can wait above the view: a collectable comes down with the current and scenery has nothing that reaches ahead of it.`,
      );
    }
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
    ...(aboveMeters > 0 ? { aboveMeters } : {}),
    // The block's PATH, if it names one. Checked against the level's own path table later (the block is read before the
    // level finishes parsing), so a typo here is reported once the table is known rather than silently ignored.
    ...(typeof node['path'] === 'string' ? { path: node['path'] } : {}),
    pathSpacingSeconds: optNum(node, 'pathSpacingSeconds', where, DEFAULT_PATH_SPACING_SECONDS, 0.02, 10),
    ...(boids ? { boids: true } : {}),
    ...(layer === 'back' ? { layer: 'back' as const, distance: reqNum(node, 'distance', where, 0, 1) } : {}),
    // (a school key used to live here; schools are splines now)

    // The vent's own three, absent for everything else. `side` is only ever set for a vent because the checks above
    // refuse it anywhere else, so a consumer that sees it can rely on the kind -- see `placeEntry`.
    ...(side === undefined ? {} : { side }),
    ...(aim === undefined ? {} : { aim }),
    ...(isVent && node['startDelaySeconds'] !== undefined
      ? { startDelaySeconds: optNum(node, 'startDelaySeconds', where, mech.hazards.vent.startDelaySeconds, 0, 600) }
      : {}),

    // that silently disappears between the file and the water. (That is exactly how path failed the first time.)
  };
}

/**
 * Expand one block into the entries it places.
 *
 * The helpers below are unchanged from when levels were written in code -- they were always the mechanism, and this
 * function is the only thing that changed: it reads a block instead of being handed arguments by a source file.
 */
/**
 * The variety number each block hands down, as a map, so `expandBlock` can stay a pure function of one block.
 *
 * Fish blocks are numbered among THEMSELVES rather than by their position in the file. That is the difference
 * between "the number is different from the block before it" and "the number is different from the last school":
 * a level interleaves bubbles, torpedoes and obstacles between its shoals, so a counter over every block
 * lands on the same value four blocks apart -- which is exactly two shoals of the same fish with a gap between
 * them, and the gap is what makes it look like a mistake.
 *
 * Everything else gets its own index, which costs nothing: a variety is only ever read by a kind that has variants,
 * and no other kind does.
 */
function blockVarieties(blocks: readonly SpawnBlock[]): Map<SpawnBlock, number> {
  const out = new Map<SpawnBlock, number>();
  let schools = 0;
  blocks.forEach((block, index) => out.set(block, block.kind === 'fish' ? schools++ : index));
  return out;
}

function expandBlock(block: SpawnBlock, variety = 0, index = 0): LevelEntry[] {
  const side: Pick<LevelEntry, 'from' | 'enterSpeed' | 'depth'> =
    block.from === 'top' ? {} : { from: block.from, enterSpeed: block.enterSpeed, depth: block.depth };
  /**
   * A VENT's own keys, carried onto every entry the block makes.
   *
   * Spread here because the entries below are built by the `place.*` helpers, which know about POSITIONS; anything a
   * block says about WHAT this is rather than WHERE it is has to be carried separately. Without it the keys reach the
   * block reader and stop there, and a level file that plainly says `side: 'right'` quietly produces a left-hand one.
   *
   * KEYED ON THE KIND, not on whether `side` was written. That distinction used to be invisible because every vent had
   * to name a wall; now a vent may omit `side` for a random one, and keying on the side would silently drop its `aim`
   * and start delay too -- every vent became an upward one. The placement probe caught it as "all three aims: false".
   */
  const vent: Pick<LevelEntry, 'side' | 'aim' | 'startDelaySeconds'> =
    block.kind !== 'vent'
      ? {}
      : {
          ...(block.side === undefined ? {} : { side: block.side }),
          ...(block.aim === undefined ? {} : { aim: block.aim }),
          ...(block.startDelaySeconds === undefined ? {} : { startDelaySeconds: block.startDelaySeconds }),
        };
  /**
   * The off-screen-above offset, carried like the vent keys.
   *
   * It is about WHERE the entry begins, but it is not one of the `place.*` helpers' positions: those are x and
   * spread, and this is the one number that moves the whole block above the view.
   */
  const above: Pick<LevelEntry, 'aboveMeters'> =
    block.aboveMeters === undefined ? {} : { aboveMeters: block.aboveMeters };
  /**
   * EVERY CREATURE THE BLOCK PLACES GETS THE SAME `variety`.
   *
   * A block is a school: `{ kind: 'fish', count: 6 }` is six fish that arrived together, and a shoal drawn half
   * sardine and half perch is two shoals pretending to be one. A string on a spline is one school for the same
   * reason, and it arrives here as one block.
   */
  const tag = (entries: LevelEntry[]): LevelEntry[] => entries.map((e) => ({ ...e, ...side, ...vent, ...above, variety }));

  /**
   * A block on a PATH is a STRING: `count` creatures, spread along the curve by their own index.
   *
   * Expanded here rather than at spawn time so the whole string exists in the timeline like everything else -- which
   * is authored in metres rather than in frames.
   */

  /**
   * A BOIDS SCHOOL is `count` fish with no delay between them: they are born together, in a cloud, and the school's
   * rules do the rest. The `school` number is this block's index, which every fish of the block shares and no other
   * block's does -- that is what lets the hazard field give them one leader.
   */
  if (block.boids) {
    const n = Math.max(1, block.count);
    return tag(
      Array.from({ length: n }, (_, i) => ({
        ...place.one(block.at, block.kind, block.x, block.sizes?.[i % Math.max(1, block.sizes?.length ?? 1)]),
        path: block.path as string,
        school: index,
        schoolSize: n,
        schoolIndex: i,
        ...(block.layer === 'back' ? { layer: 'back' as const, distance: block.distance as number } : {}),
      })),
    );
  }

  if (block.path) {
    const n = Math.max(1, block.count);
    const spacing = block.pathSpacingSeconds ?? DEFAULT_PATH_SPACING_SECONDS;
    return tag(
      Array.from({ length: n }, (_, i) => ({
        ...place.one(block.at, block.kind, block.x, block.sizes?.[i % Math.max(1, block.sizes?.length ?? 1)]),
        path: block.path as string,
        // The first one has no delay at all, so a string always begins where the level said it would.
        pathDelaySeconds: i * spacing,
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
  const musicRaw = node['music'];
  if (musicRaw !== undefined && (typeof musicRaw !== 'string' || musicRaw.trim() === '')) {
    fail(`${where} (level "${id}")`, `"music" is ${JSON.stringify(musicRaw)}, but it should be a non-empty track name.`);
  }
  const music = musicRaw === undefined ? undefined : (musicRaw as string);
  const extra = Object.keys(node).filter((k) => !LEVEL_KEYS.includes(k));
  if (extra.length) fail(`${where} (level "${id}")`, `has keys that do nothing here: ${extra.join(', ')}. Known keys: ${LEVEL_KEYS.join(', ')}.`);

  const rawSpawns = node['spawns'];
  if (!Array.isArray(rawSpawns) || !rawSpawns.length) fail(`${where} (level "${id}")`, '"spawns" must be a non-empty list.');

  const blocks = rawSpawns.map((raw, i) => readBlock(raw, id, i));
  const varieties = blockVarieties(blocks);
  /**
   * One `group` per BLOCK, shared by every entry it expands to.
   *
   * The mirror coin is rolled per group, not per entry: a barrier's row, a line of crates, or a school of fish must
   * flip as one shape, or the gap scatters and the school tears in half. The block's index is enough because the
   * timeline is rebuilt per level.
   */
  const entries = blocks
    .flatMap((block, i) => expandBlock(block, varieties.get(block), i).map((entry) => ({ ...entry, group: i })))
    .sort((a, b) => a.at - b.at);

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
        // Screens, not metres -- so a `y` in the hundreds is a spline authored in the OLD unit, and it would fly off
        // at 300 screens a second without ever looking like an error. Refusing it by range is what turns that into a
        // message naming the file, which is the whole reason the level files are loaded through this function.
        y: reqNum(pt, 'y', `${where}.paths.${name}.points[${i}]`, -8, 8),
      };
    });
    paths[name] = {
      points,
      seconds: reqNum(pathNode, 'seconds', `${where}.paths.${name}`, 0.1, 600),
    };
  }
}

/**
 * Every path a block names must exist.
 *
 * Checked here because only now is the level's path table known (the blocks were read before it). A name that is not in
 * it used to fall through to a creature with no spline, which is a string of fish that simply sits at the top of the
 * screen and drifts -- and for a Boids school, which has nothing but its path to follow, a school with no leader.
 */
blocks.forEach((block, i) => {
  if (block.path && !paths?.[block.path]) {
    fail(
      `${where}.spawns[${i}]`,
      `puts creatures on the path "${block.path}", but this level has no such path. It has: ${Object.keys(paths ?? {}).join(', ') || '(none)'}.`,
    );
  }
  /**
   * A school must be BORN off the screen.
   *
   * Its fish are born in a cloud of `hazards.boids.spawnSpread` round the first point of the path (a lane fraction), and a
   * cloud that overlaps the lane is a school that appears out of nothing in front of the player. The path may start beyond
   * either side of the lane by more than the cloud's radius, or above the top of the screen by a fifth of a screen -- which
   * is a conservative reading of the cloud's radius in screens, since a screen is 433 to 781 metres tall and the cloud is
   * about 65. Everything else is refused, with the point named, rather than left to pop in.
   */
  if (block.boids && block.path) {
    const p0 = paths?.[block.path]?.points[0];
    const spread = mech.hazards.boids.spawnSpread;
    if (p0 && !(p0.x < -spread || p0.x > 1 + spread || p0.y >= 0.2)) {
      fail(
        `${where}.spawns[${i}]`,
        `is a Boids school on the path "${block.path}", whose first point (x ${p0.x}, y ${p0.y}) is inside the screen: the school is born in a cloud of ${spread} lane widths round it, so it would appear out of nothing. Start the path beyond either side (x below ${-spread} or above ${1 + spread}) or above the top (y of 0.2 or more).`,
      );
    }
  }
});

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
/**
 * Which boss this level ends on, checked against the real list.
 *
 * Named rather than defaulted, because the failure a default would hide is the interesting one: a level that forgot
 * to say which boss it ends with would silently end on whichever creature the default named, and the only symptom
 * would be the wrong monster -- which looks exactly like a level whose boss was swapped on purpose.
 */
const bossKind = bossNode['kind'];
if (typeof bossKind !== 'string' || !isBossKind(bossKind as HazardKind)) {
  fail(
    `${where}.boss.kind`,
    `is ${JSON.stringify(bossNode['kind'])}, but it must be one of: ${BOSS_KINDS.filter((k) => k !== 'boss').join(', ')}.`,
  );
}
const boss: BossSpec = {
  kind: bossKind as HazardKind,
  at: bossAt,
  health: reqNum(bossNode, 'health', `${where}.boss`, 1, 100000),
  name: typeof bossNode['name'] === 'string' ? (bossNode['name'] as string) : 'BOSS',
};

  const scrollSpeed = reqNum(node, 'scrollSpeed', `${where} (level "${id}")`, 0.001, 10000);
  /**
   * The pace curve, if the level has one.
   *
   * Checked in metres against the level's own length and required to be SORTED, because both mistakes are silent: a
   * keyframe past the end never applies, and an out-of-order pair makes the interpolation walk backwards, which looks like
   * the curve was ignored rather than like a typo.
   */
  const curveNode = node['scrollSpeedCurve'];
  let scrollSpeedCurve: [number, number][] | undefined;
  if (curveNode !== undefined) {
    if (!Array.isArray(curveNode) || curveNode.length === 0) fail(where, `level "${id}": scrollSpeedCurve must be a non-empty list of [metres, speed] pairs`);
    scrollSpeedCurve = curveNode.map((pair, i) => {
      if (!Array.isArray(pair) || pair.length !== 2) fail(where, `level "${id}": scrollSpeedCurve[${i}] must be [metres, speed]`);
      const at = reqNum({ at: pair[0] }, 'at', `${where} (level "${id}") scrollSpeedCurve[${i}]`, 0, scrollLength);
      const speed = reqNum({ speed: pair[1] }, 'speed', `${where} (level "${id}") scrollSpeedCurve[${i}]`, 0.001, 10000);
      return [at, speed] as [number, number];
    });
    for (let i = 1; i < scrollSpeedCurve.length; i++) {
      if (scrollSpeedCurve[i]![0] <= scrollSpeedCurve[i - 1]![0]) {
        fail(where, `level "${id}": scrollSpeedCurve must be sorted by metres (${scrollSpeedCurve[i - 1]![0]} then ${scrollSpeedCurve[i]![0]})`);
      }
    }
  }

  return {
    id,
    name,
    ...(music ? { music } : {}),
    scrollLength,
    scrollSpeed,
    ...(scrollSpeedCurve ? { scrollSpeedCurve } : {}),
    // 0 is allowed -- creatures that hold still on the screen are a legitimate thing to ask for (a probe does) -- but it must
    // be written: see the field's note on why there is no default.
    driftSpeed: reqNum(node, 'driftSpeed', `${where} (level "${id}")`, 0, 10000),
    ...(node['playerLeadLimit'] === undefined
      ? {}
      : { playerLeadLimit: optNum(node, 'playerLeadLimit', `${where} (level "${id}")`, 0, 0, 10000) }),
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
 * The debug level's file, which is NOT one of the numbered levels.
 *
 * Its own glob and its own path, outside `config/levels/`, because everything in that directory is a rung of the
 * progression: the numbers are the unlock order, so a debug level dropped in there would sit on the ladder and be
 * walked into after the sixth.
 */
const DEBUG_LEVEL_FILE = import.meta.glob('../config/debug-level.json5', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/**
 * The debug level: a level in the ordinary format that is not in `LEVELS`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT IS FOR, AND WHAT MAKES IT DIFFERENT
 * ---------------------------------------------------------------------------------------------
 * A place to put creatures on purpose and watch them: its spawn table is `config/debug-level.json5`, written in the same
 * blocks every level uses, so what is tested here is the real path rather than a parallel one. It runs as a normal level
 * -- the same player, the same scroll, the same boss to end it -- and differs in exactly three ways:
 *
 *   - it is not in `LEVELS`, so it has no place on the ladder and clearing it unlocks nothing;
 *   - it has no water of its own: palette, backdrops and music are the FIRST level's (`looksLike`), so it needs no art;
 *   - the way in is a button in the settings panel, offered from the main menu with the debug switch on.
 *
 * The file may not declare a palette or backdrops. They would be overwritten, and a knob that is quietly ignored is the
 * kind of thing this project does not keep -- the loader says so instead.
 */
export const DEBUG_LEVEL: Level = readDebugLevel();

function readDebugLevel(): Level {
  const sources = Object.entries(DEBUG_LEVEL_FILE);
  const first = LEVELS[0] as Level;
  if (sources.length !== 1) {
    fail('config/debug-level.json5', 'is missing: the debug level is a level in the ordinary format, and it has to be there.');
  }
  const [path, text] = sources[0] as [string, string];
  const file = path.replace('../config/', '');
  const node = parseLevelFile(path, text);
  if (node === null || typeof node !== 'object' || Array.isArray(node)) fail(file, 'must be an object: one level.');
  const fields = node as Record<string, unknown>;
  for (const key of ['palette', 'backdrop', 'backdrops']) {
    if (fields[key] !== undefined) {
      fail(file, `has "${key}", but the debug level has no water of its own: it uses the first level's ("${first.id}"). Remove the key.`);
    }
  }
  const level = readLevel(fields, file);
  if (LEVELS.some((l) => l.id === level.id)) {
    fail(file, `is called "${level.id}", which is also a level on the ladder. The debug level needs an id of its own.`);
  }
  return { ...level, palette: first.palette, ...(first.backdrops ? { backdrops: first.backdrops } : {}), looksLike: first.id };
}

/** Whether this is the debug level, which the run treats as an ordinary level that is not on the ladder. */
export function isDebugLevel(level: Level): boolean {
  return level === DEBUG_LEVEL;
}

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
  const level = LEVELS.find((l) => l.id === id) ?? (id === DEBUG_LEVEL.id ? DEBUG_LEVEL : undefined);
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
  const varieties = blockVarieties(parsed);
  const entries = parsed
    .flatMap((block, i) => expandBlock(block, varieties.get(block), i).map((entry) => ({ ...entry, group: i })))
    .sort((a, b) => a.at - b.at);
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
 * The pace in force at a place in the level, in metres per second.
 *
 * Interpolated linearly between keyframes and CLAMPED at both ends, so a level with no curve (or one keyframe) answers with
 * its constant, and a level whose curve starts at 300m is not undefined before it.
 */
export function speedAt(level: Level, metres: number): number {
  const curve = level.scrollSpeedCurve;
  if (!curve || curve.length === 0) return level.scrollSpeed;
  const first = curve[0]!;
  if (curve.length === 1 || metres <= first[0]) return first[1];
  for (let i = 1; i < curve.length; i++) {
    const [at, speed] = curve[i]!;
    if (metres <= at) {
      const [prevAt, prevSpeed] = curve[i - 1]!;
      const span = Math.max(1e-6, at - prevAt);
      return prevSpeed + (speed - prevSpeed) * ((metres - prevAt) / span);
    }
  }
  return curve[curve.length - 1]![1];
}

/**
 * Seconds to travel between two places in a level.
 *
 * NUMERIC, because the integral of `1/speed` over a piecewise-linear speed has no elementary antiderivative -- the same
 * reason the old single-ascent solver had to be a script rather than a formula. Simpson over the interval, which is exact
 * enough that the error is not worth naming for a curve drawn by hand between a handful of points.
 *
 * A level with no curve short-circuits to the division, so nothing about a constant-pace level is approximated.
 */
export function timeToScroll(level: Level, fromMetres: number, toMetres: number): number {
  if (!level.scrollSpeedCurve) return Math.max(0, toMetres - fromMetres) / level.scrollSpeed;
  const from = Math.max(0, Math.min(level.scrollLength, fromMetres));
  const to = Math.max(from, Math.min(level.scrollLength, toMetres));
  const span = to - from;
  if (span <= 0) return 0;
  // A half-step every couple of metres: the curve's own kinks are the only thing to resolve, and they are authored by hand.
  const steps = Math.max(8, Math.ceil(span / 4) * 2);
  const h = span / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const a = from + i * h;
    const mid = a + h / 2;
    const b = a + h;
    sum += (h / 6) * (1 / speedAt(level, a) + 4 / speedAt(level, mid) + 1 / speedAt(level, b));
  }
  return sum;
}

/**
 * How long a full scroll of a level takes, in seconds.
 *
 * An OUTPUT of the level's length and pace, never an input. Nothing back-solves a duration: an earlier version of this
 * project made that mistake once, with a run length as the target, and the ascent curve had to be distorted to hit it.
 */
export function nominalScrollSeconds(level: Level): number {
  return level.scrollSpeedCurve ? timeToScroll(level, 0, level.scrollLength) : level.scrollLength / level.scrollSpeed;
}

/**
 * Seconds to traverse each screenful, in order from the start of the level.
 *
 * Reported as a series rather than an average, because a mean of a curve describes no part of it. A level with a constant
 * pace makes this flat -- correctly, and that is what the first five levels still are -- and a level with a pace curve
 * makes it the shape that level was authored with.
 */
export function secondsPerScreenSeries(level: Level, maxScreens = 12): number[] {
  const count = Math.min(maxScreens, Math.max(1, Math.round(level.scrollLength / WORLD_HEIGHT)));
  return Array.from({ length: count }, (_, i) => timeToScroll(level, i * WORLD_HEIGHT, (i + 1) * WORLD_HEIGHT));
}

/**
 * How much room each screenful's content takes away, in order from the start of the level.
 *
 * The vertical axis of pacing, and the reason `pacing.threat` exists: seconds-per-screen says how fast the level goes by,
 * this says how much is happening while it does. "Too crowded here" and "nothing happens for five screens" are both
 * visible in it, and neither is visible in an entity count -- ten bubbles and ten zappers are not the same screen.
 *
 * A block's whole weight lands in the screen it STARTS in, which is an approximation the author should know about: a
 * `spread` block of ten fish trickles in over a screen or more, and it is all counted where it begins. That is the honest
 * reading of a spawn TABLE (the table says when a thing is placed, not when each of its members arrives), and it is why
 * the numbers are for comparing one stretch against another rather than for anything absolute.
 */
export function threatPerScreenSeries(level: Level, maxScreens = 24): number[] {
  const count = Math.min(maxScreens, Math.max(1, Math.ceil(level.scrollLength / WORLD_HEIGHT)));
  const series = new Array<number>(count).fill(0);
  for (const block of level.blocks) {
    const weight = mech.pacing.threat[block.kind] ?? 0;
    const screen = Math.floor(block.at / WORLD_HEIGHT);
    if (screen >= 0 && screen < series.length) series[screen] += weight * (block.count ?? 1);
  }
  return series;
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
  // The INTEGRAL, not `length / speed`: a level with a pace curve is as long as its curve says, and checking it against
  // its base constant would reject a level that is perfectly playable at either end of its own ramp.
  const seconds = nominalScrollSeconds(level);
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
assertLevelSane(DEBUG_LEVEL);


























