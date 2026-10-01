/**
 * Level definitions.
 *
 * A level declares its LENGTH and its ASCENT CURVE. The run time is a CONSEQUENCE, never an input:
 * nothing here targets a duration, and there is no "target seconds" to keep in sync. Earlier in this
 * project the run length WAS the input, and back-solving the other numbers from it produced an ascent
 * curve so flat near the seabed that the first 40% of the climb barely changed speed -- which read as
 * frozen water, because it was.
 *
 * ---------------------------------------------------------------------------------------------
 * SCREEN-HEIGHTS ARE THE UNIT OF FEEL
 * ---------------------------------------------------------------------------------------------
 * What the player actually sees is not metres per second, it is SCREEN-FRAMES per second. A speed of
 * 1.7 m/s means nothing on its own; 1.7 m/s against a screen showing 0.72 m per pixel is under 3 px/s
 * of visible motion. So the length and the visible depth have to move together:
 *
 *   - `totalDepth` is the level's length in metres.
 *   - `metresPerScreen` says how much water fits on screen -- i.e. how tall a screenful is.
 *
 * Their ratio is the level's apparent pacing, and it is the number worth thinking about:
 *
 *   screenHeights = totalDepth / metresPerScreen
 *
 * With 500 / 190 that is 2.6 screen-heights of climb, traversed in 118s -- about 45 seconds per
 * screenful. A level that is twice as deep at the SAME metresPerScreen therefore takes twice as long
 * and feels identical, with no other change. That is what makes levels tunable independently.
 *
 * Scale `ascentSpeedBase`/`ascentSpeedPeak` with `totalDepth` to keep the pace and change only the
 * duration; leave them alone to keep the duration and change the pace.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY metresPerScreen IS NOT FREE TO CHANGE
 * ---------------------------------------------------------------------------------------------
 * It sets how many collectables and hazards share the screen, and how big they look. Lowering it
 * shows less water, so everything appears larger and there is less room to react; raising it shows
 * more, so everything shrinks. The current value was chosen for the bubble density the field is
 * tuned around (~20 collectables on screen at once).
 */

export interface Level {
  /** Stable id, used by probes and (later) by level selection. */
  id: string;
  /** Shown to the player. */
  name: string;
  /**
   * The level's length, in metres of water. The independent variable: change this and the run gets
   * longer or shorter, with the pace unchanged, as long as `metresPerScreen` holds.
   */
  totalDepth: number;
  /**
   * How much water one screenful shows, in metres. Together with `totalDepth` this fixes the pace.
   *
   * Kept in the same block as `totalDepth` on purpose: they are only meaningful as a ratio, and
   * setting one without the other is the mistake this layout exists to prevent.
   */
  metresPerScreen: number;
  /** Ascent speed in m/s at the seabed (the start of the climb). */
  ascentSpeedBase: number;
  /** Ascent speed in m/s at the surface (the end of the climb). */
  ascentSpeedPeak: number;
  /**
   * Curve shape. 1 = linear in depth, 0 = constant speed, >1 = a slow start that back-loads speed.
   *
   * Must be documented per level, because it is the most player-visible number here: it decides
   * whether the opening seconds feel like drifting or like climbing.
   */
  ascentCurveExponent: number;
  /**
   * The level's signposts, in metres from the surface, with what they announce.
   *
   * The LABEL belongs here rather than in the renderer: what happens at 320m is level content, not a
   * drawing decision. The depths are also the anchors the later depth events hang off, so a new level
   * states its own set instead of inheriting another level's pacing.
   */
  landmarks?: readonly { depth: number; label: string }[];
}

/**
 * The shipping level list. The first entry is the one that runs.
 *
 * Kept as data rather than as loose constants so a second level is an added object, not a refactor.
 */
export const LEVELS: readonly Level[] = [
  {
    id: 'open-water',
    name: '开阔水域',
    totalDepth: 500,
    metresPerScreen: 190,
    // Chosen by feel at this length: 1.7 m/s gives ~2.4 px/s of visible motion at the seabed on a
    // 390px-wide phone, and the linear curve means the pace keeps rising all the way up instead of
    // being flat for the first 200m.
    ascentSpeedBase: 1.7,
    ascentSpeedPeak: 8.55,
    ascentCurveExponent: 1,
    landmarks: [
      { depth: 180, label: '鱼群' },
      { depth: 320, label: '气泡潮' },
      { depth: 420, label: '爆发' },
    ],
  },
];

/**
 * Aspect of the play area, as width / height. Sets the shipping lane width.
 *
 * Not in `config` because it is a projection choice rather than a level's property: every level is
 * played through the same lens.
 */
export const PLAY_AREA_ASPECT = 1.9;

/** Fail loudly at startup rather than shipping a level that cannot be played. */
export function assertLevelSane(level: Level): void {
  const screenHeights = level.totalDepth / level.metresPerScreen;
  const problems: string[] = [];
  if (!(level.totalDepth > 0)) problems.push('totalDepth must be positive');
  if (!(level.metresPerScreen > 0)) problems.push('metresPerScreen must be positive');
  if (!(level.ascentSpeedBase > 0)) problems.push('ascentSpeedBase must be positive');
  if (!(level.ascentSpeedPeak >= level.ascentSpeedBase)) {
    problems.push('ascentSpeedPeak must be at least ascentSpeedBase, or the climb slows down as it rises');
  }
  if (!(level.ascentCurveExponent >= 0)) problems.push('ascentCurveExponent must not be negative');
  // Too few screen-heights and the level is over before its own pacing is legible; too many and the
  // player spends the whole run watching the same density of water go by.
  if (screenHeights < 1.5) problems.push(`only ${screenHeights.toFixed(2)} screen-heights of climb; too short to read`);
  if (screenHeights > 12) problems.push(`${screenHeights.toFixed(2)} screen-heights of climb; very long for one level`);
  if (problems.length) throw new Error(`Level "${level.id}" is unusable: ${problems.join('; ')}`);
}

/** The level currently being played. */
export const LEVEL: Level = LEVELS[0] as Level;

assertLevelSane(LEVEL);

/** Metres of water one screenful shows. The play area's height in metres. */
export const WORLD_HEIGHT = LEVEL.metresPerScreen;
/** Metres across the play area. Derived so the lane keeps a consistent shape on every display. */
export const WORLD_WIDTH = WORLD_HEIGHT * PLAY_AREA_ASPECT;

/**
 * How much water the level contains, i.e. its length. The one number that says how long a run is.
 */
export const DEPTH_TOTAL = LEVEL.totalDepth;
