import type { Text } from 'pixi.js';
import type { Camera } from './background';
import type { BulletField } from './bullets';
import type { BubbleType, RouteId } from './bubbleTypes';
import type { CodexUi } from './codexUi';
import type { EnemyBulletField } from './enemyBullets';
import type { EntityField } from './entities';
import type { HazardField, HazardKind } from './hazards';
import type { LateralAuthority } from './lateral';
import type { EntrySide } from './levels';
import type { NumberPopups } from './numberPopups';
import type { ObstacleField } from './obstacles';
import type { Player } from './player';
import type { Progression } from './progress';
import type { RageState } from './rage';
import type { Score } from './score';
import type { SkillId } from './skills';
import type { StageState } from './stages';
import type { TalentEffects } from './talents';
import type { Xp } from './xp';

/**
 * What the game is doing, as one value.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS TYPE EXISTS
 * ---------------------------------------------------------------------------------------------
 * The diagnostics report was a six-hundred-line getter on `Game`, which meant the run's state could only be read by a
 * probe that had a whole game -- a canvas, a scene, a menu, a synth. It is a function of this now, so the report is a
 * function of the state it reports.
 *
 * It is deliberately the WHOLE game rather than the run: the report exists to answer questions about a frame the player
 * just watched, so frame time, the popup pools, the banner and the codex page are part of the answer. The run's own
 * state is the bulk of it.
 *
 * Four of these members are DERIVED -- `overloaded`, `onSlam`, `suctionUp` and `burstRadiusRatio` are
 * getters on the game. They arrive as VALUES, because a report that had to ask the game to compute things would be a
 * report that needs the game.
 */
export interface GameSnapshot {
  // ---------------------------------------------------------------------------------------------
  // The run
  // ---------------------------------------------------------------------------------------------
  player: Player;
  /** Collectables and decoration. */
  field: EntityField;
  hazards: HazardField;
  obstacles: ObstacleField;
  bullets: BulletField;
  enemyBullets: EnemyBulletField;
  score: Score;
  /** The mutation ladder, for the report: what the bar is at and what is waiting to be picked. */
  xp: Xp;
  progress: Progression;
  stats: {
    absorbed: number;
    hits: number;
    maxVolume: number;
    ended: number;
    overloads: number;
    newRecord: boolean;
  };
  stage: StageState;
  bubbleType: BubbleType;
  /** The route this run committed to at its first level-up, or null while it is still the base bubble. */
  route: RouteId | null;
  /** The gun's row count: what the 枪管 cards and the barrage route's own grant move. */
  gunStreams: number;
  lateral: LateralAuthority;
  rage: RageState;
  talentEffects: TalentEffects;

  /** Which part of the flow this is: menu, intro, playing, the two halves of clearing a level, or a page. */
  phase: Phase;
  /** Seconds left in the current phase, when the phase has one. */
  phaseTimer: number;
  /** Metres the level has scrolled: the level's own progress, independent of where the player is. */
  scrolled: number;
  /** Seconds since the run began. */
  elapsed: number;
  /** Timeline entries emitted so far. */
  timelineEmitted: number;
  /** How many entries have arrived from each edge. */
  spawnedBySide: Record<EntrySide, number>;

  /** The carried skill, or null. */
  skill: { id: SkillId; name: string; uses: number } | null;
  skillActivations: number;
  /** Seconds of invulnerability left. */
  invulnerable: number;
  /** The rage burst in progress, if one is. */
  burst: { radius: number; seconds: number; kills: number; pushes: number } | null;
  bursts: number;
  chargeAim: { x: number; y: number };
  charging: boolean;
  comedyBeats: number;
  lastComedyBeat: { what: HazardKind; at: number } | null;
  lastEaten: number;
  lastEvent: { label: string; at: number } | null;
  farts: number;
  slams: number;
  slamSeconds: number;
  trashDrain: number;
  eventsSeen: number;
  eventsFired: Set<number>;
  bannerSeen: boolean;
  surfaced: boolean;
  bestClimbed: number;
  bestScore: number;
  bestVolume: number;
  /** The level's nominal length in seconds, for the progress readout. */
  nominalSeconds: number;

  // ---------------------------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------------------------
  overloaded: boolean;
  onSlam: boolean;
  suctionUp: boolean;
  /** The burst's reach as a fraction of a lane, from the rage stage the run is in. */
  burstRadiusRatio: number;

  // ---------------------------------------------------------------------------------------------
  // Presentation, because the report is what the player's frame looked like
  // ---------------------------------------------------------------------------------------------
  camera: Camera;
  popups: NumberPopups;
  damagePopups: NumberPopups;
  finishBanner: Text;
  codex: CodexUi;
  splash: number;
  audioMuted: boolean;
  fps: number;
  frameCount: number;
  lastDelta: number;
}

/**
 * Which part of the flow the game is in.
 *
 * Named rather than left as an anonymous union on one field, because two things now say it: the field, and the
 * snapshot's report of it.
 */
export type Phase =
  | 'menu'
  | 'intro'
  | 'playing'
  | 'burst'
  | 'cleared'
  | 'ascend'
  | 'summary'
  | 'loading'
  | 'paused'
  | 'codex'
  /**
   * The mutation pick: the bar filled, and the whole world is frozen behind three cards.
   *
   * Joins `paused` in the freeze list rather than being one, because the two must not restore each
   * other's phases -- closing the settings during a pick must drop back into the pick, and picking
   * must return to `playing` rather than to whatever pause remembered.
   */
  | 'levelup';
