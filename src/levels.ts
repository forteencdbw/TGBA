import { mech } from './mechanisms';

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

/** One thing to place, and how far into the level it appears. */export interface LevelEntry {
  /** Metres of scroll at which this enters. */
  at: number;
  /**
   * Lateral position as a fraction of the play area width.
   *
   * A fraction rather than metres so a lane stays a lane on every display: the play area's width
   * follows the canvas, so an absolute x would drift off-screen on a narrow phone.
   */
  x: number;
  /**
   * Which kind of thing to place.
   *
   * Collectables are `bubble`; everything else names a hazard kind, plus `skill` for a skill pickup.
   */
  kind: 'bubble' | 'fish' | 'jelly' | 'trash' | 'crab' | 'skill';
  /**
   * Size for a collectable, as a multiple of the player's radius at full size. Ignored otherwise.
   *
   * Authored rather than random: a designer placing food wants to decide whether it is a snack or a
   * meal, and the volume economy keys off this number.
   */
  size?: number;
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
   * timeline entry -- so it can be retuned late without re-authoring the level.
   */
  scrollSpeed: number;
  /** The scripted content, in any order: it is sorted by `at` when the level loads. */
  entries: readonly LevelEntry[];
  /** Signposts, at depths from the surface, for the HUD. */
  landmarks?: readonly { depth: number; label: string }[];
  /**
   * How far the player may stray above the camera before the scroll carries them, in metres.
   *
   * The player moves freely, but cannot outrun the current: the camera is a soft ceiling that carries
   * them along, which is what stops a level being skipped by holding "up".
   */
  playerLeadLimit?: number;
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
};

/** Deterministic weave, so a level looks the same every time it is played. */
const weave = (amplitude: number, centre = 0.5, wavelength = 6) => (i: number) =>
  centre + Math.sin((i / wavelength) * Math.PI * 2) * amplitude;

/** A repeating size pattern, so a stream alternates snacks and meals rather than being uniform. */
const sizes = (pattern: number[]) => (i: number) => pattern[i % pattern.length] as number;

/**
 * The shipping level.
 *
 * 1500m at 25 m/s is a 60-second scroll, which matches the pace the game had before, and the timeline
 * is built from the patterns above so it reads as a shape and can be adjusted as one.
 */
export const LEVELS: readonly Level[] = [
  {
    id: 'open-water',
    name: '开阔水域',
    scrollLength: 1500,
    /**
     * From `config/mechanics.json5` (`level.scrollSpeed`). THE pacing dial: it sets how fast the world looks
     * and how long the level lasts (`scrollLength / scrollSpeed` seconds), and it is fully decoupled from the
     * controls, so retuning the pace never changes how the bubble handles.
     */
    scrollSpeed: mech.level.scrollSpeed,
    playerLeadLimit: 130,
    landmarks: [
      { depth: 960, label: '鱼群' },
      { depth: 540, label: '气泡潮' },
      { depth: 240, label: '爆发' },
    ],
    entries: [
      // --- 0-250m: teach the shape. Food to chase, one jelly to learn to avoid. ---
      ...place.spread(30, 200, 10, 'bubble', weave(0.22), sizes([0.4, 0.5, 0.35])),
      place.one(140, 'jelly', 0.5),
      place.one(200, 'skill', 0.3),

      // --- 250-550m: the first real swarm, plus a crab as an opportunity. ---
      ...place.spread(260, 200, 12, 'bubble', weave(0.3), sizes([0.35, 0.55, 0.4, 0.7])),
      ...place.line(380, 'fish', 4),
      place.one(430, 'crab', 0.62),
      ...place.line(500, 'jelly', 2),
      place.one(540, 'skill', 0.7),

      // --- 550-900m: tighter, with trash to punish greed. ---
      ...place.spread(560, 240, 14, 'bubble', weave(0.34), sizes([0.3, 0.6, 0.45])),
      ...place.line(640, 'fish', 5),
      place.one(700, 'trash', 0.4),
      place.one(760, 'crab', 0.35),
      ...place.column(800, 60, 3, 'jelly', 0.72),
      ...place.line(880, 'fish', 6, 0.1, 0.9),
      place.one(920, 'skill', 0.25),

      // --- 900-1260m: the bubble tide. Looks like a reward, and it is -- which is the trap, since a
      // bigger player is noticed from further away and the endgame scales with size. ---
      ...place.spread(940, 260, 30, 'bubble', weave(0.4), sizes([0.3, 0.4, 0.35])),
      ...place.line(1000, 'jelly', 3),
      ...place.line(1100, 'fish', 5),
      place.one(1150, 'trash', 0.55),
      place.one(1200, 'crab', 0.5),

      // --- 1260-1500m: the burst, then a clear run to the surface. ---
      ...place.line(1280, 'fish', 7, 0.08, 0.92),
      ...place.spread(1300, 80, 8, 'bubble', weave(0.45), sizes([0.6, 0.8, 0.5])),
      ...place.line(1360, 'jelly', 4),
      ...place.line(1400, 'trash', 2, 0.25, 0.75),
      ...place.line(1440, 'fish', 6, 0.12, 0.88),
      place.one(1470, 'crab', 0.5),
      // The last stretch is deliberately sparse: the surface should feel earned, and a level that ends
      // mid-onslaught gives the player no moment to notice they have won.
      ...place.spread(1470, 30, 4, 'bubble', weave(0.2), sizes([0.4])),
    ],
  },
];

/**
 * Aspect of the play area, as width / height. Sets the shipping lane width.
 *
 * Not part of a level: it is a projection choice, and every level is played through the same lens.
 *
 * 1.9 is WIDER than it is tall, which is deliberate: the world is authored so a screenful shows plenty
 * of water across, and the lane-relative sizes of collectables then line up with the metre-scaled depth
 * through `PLAY_AREA_ASPECT`. Changing this changes how big everything looks, not just the layout.
 */
export const PLAY_AREA_ASPECT = 1.9;

/** Fail loudly at startup rather than shipping a level that cannot be played. */
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
  if (problems.length) throw new Error(`Level "${level.id}" is unusable: ${problems.join('; ')}`);
}

/** The level currently being played. */
export const LEVEL: Level = LEVELS[0] as Level;

assertLevelSane(LEVEL);

/** Metres of water one screenful shows. The play area's height in metres. */
export const WORLD_HEIGHT = 190;
/** Metres across the play area. Derived so the lane keeps a consistent shape on every display. */
export const WORLD_WIDTH = WORLD_HEIGHT * PLAY_AREA_ASPECT;

/**
 * The level's length.
 *
 * Kept under this name because the whole codebase used to think of the vertical axis as "depth from
 * the surface", and the two are the same number.
 */
export const DEPTH_TOTAL = LEVEL.scrollLength;

/** The timeline, sorted by distance so consumers can walk it forwards with a cursor. */
export const TIMELINE: readonly LevelEntry[] = [...LEVEL.entries].sort((a, b) => a.at - b.at);
