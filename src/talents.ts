/**
 * Talents (D4) -- the three ways a bubble can be born.
 *
 * Purely passive: no button, no choice during a run, rolled once at birth. So each one has to change
 * HOW THE GAME PLAYS rather than add an ability to use.
 *
 * THE DESIGN PRINCIPLE, and it is the reason these are interesting: **every talent has a backlash.**
 *
 *   "Your survival mechanism is the enemy's breeding mechanism."
 *
 * That is not flavour text, it is the mechanical contract. Two of the three work by emitting bubbles,
 * and bubbles FEED FISH -- so the reflex that saves you is also what makes the swarm grow. The third
 * makes you bigger, and being bigger is exactly what gets you targeted. A talent with no downside
 * would just be a strictly better start, and the player would never have a reason to think about it.
 *
 * The fish-splitting and targeting rules that make the backlash real live in the emergence engine
 * (D5); this module only owns what a talent changes about the player.
 */

import { tuning } from './config';
import type { HazardKind } from './hazards';

export type TalentId = 'fish-fart' | 'soda' | 'silt';

export interface Talent {
  id: TalentId;
  /** Shown on the birth banner and the results card. */
  name: string;
  /** One line the player can understand in half a second, in the spirit of the game's comedy. */
  blurb: string;
  /** What it does FOR you, for the HUD's talent line. */
  upside: string;
  /** What it costs, stated plainly. A talent whose cost is hidden is a trap, not a trade. */
  downside: string;
}

export const TALENTS: readonly Talent[] = [
  {
    id: 'fish-fart',
    name: '鱼屁泡',
    blurb: '被鱼碰到会自动放屁，把周围的鱼冲开',
    upside: '碰到鱼时震开周围的小鱼',
    downside: '屁本身是气泡，会喂鱼让它们分裂',
  },
  {
    id: 'soda',
    name: '汽水泡',
    blurb: '上升更快、横向更飘——更快，也更难控',
    upside: '上升速度 +25%',
    downside: '横向惯性更大，尾迹气泡也在喂鱼',
  },
  {
    id: 'silt',
    name: '深海淤泥泡',
    blurb: '出生就更结实，但块头大也更容易被盯上',
    upside: '出生体积 ×1.3，受击缩小减少 40%',
    downside: '体积大更容易被鱼和水母优先锁定',
  },
];

/** Per-talent numbers. Kept together because they are only meaningful as a set. */
export const talentTuning = {
  /** Soda: ascent multiplier, and how much extra lateral inertia it carries. */
  sodaAscentMultiplier: 1.25,
  /**
   * Soda: how much the lateral steering is loosened.
   *
   * Applied as a REDUCTION in steering authority rather than as a literal mass, because "floatier"
   * has to be expressed in the model that exists: less authority means more distance covered per
   * correction, which is what the player feels as slipperiness.
   */
  sodaSteerPenalty: 0.6,
  /** Silt: starting volume, and how much of a hit's shrink it ignores. */
  siltStartVolume: 1.3,
  siltShrinkResistance: 0.6,
  /**
   * Fish-fart: the radius in metres that a fart clears, and how long it takes to recharge.
   *
   * The cooldown is what keeps it a reflex rather than a shield: it fires on contact, so without one
   * a player could simply walk into fish forever.
   */
  fartRadiusMeters: 70,
  fartCooldownSeconds: 1.4,
} as const;

/** The talent's effect on the player, resolved once at birth. */
export interface TalentEffects {
  talent: Talent;
  /** Multiplies the ascent speed. */
  ascentMultiplier: number;
  /** Multiplies the lateral steering authority. */
  steerMultiplier: number;
  /** Volume the run starts at. */
  startVolume: number;
  /** Fraction of a hit's shrink that is ignored, 0..1. */
  shrinkResistance: number;
}

export function resolveTalent(talent: Talent): TalentEffects {
  switch (talent.id) {
    case 'soda':
      return {
        talent,
        ascentMultiplier: talentTuning.sodaAscentMultiplier,
        steerMultiplier: talentTuning.sodaSteerPenalty,
        startVolume: 1,
        shrinkResistance: 0,
      };
    case 'silt':
      return {
        talent,
        ascentMultiplier: 1,
        steerMultiplier: 1,
        startVolume: talentTuning.siltStartVolume,
        shrinkResistance: talentTuning.siltShrinkResistance,
      };
    case 'fish-fart':
    default:
      // The fart talent changes nothing about the player's body: its whole effect is the reaction on
      // contact, which the game applies.
      return { talent, ascentMultiplier: 1, steerMultiplier: 1, startVolume: 1, shrinkResistance: 0 };
  }
}

export function pickTalent(random = Math.random): Talent {
  return TALENTS[Math.floor(random() * TALENTS.length)] ?? TALENTS[0];
}

/**
 * What a fart does, as data, so the game can apply it without knowing the talent's details.
 *
 * Returns the push it applies to a hazard of the given kind, or 0 if the fart does not move it. Fish
 * are pushed; the rest are unaffected, because the fart is the FISH counter and broadening it would
 * make the other two hazards feel toothless.
 */
export function fartPushFor(kind: HazardKind): number {
  return kind === 'fish' ? 1 : 0;
}

/** How many bait bubbles a fart emits. These are what feed the fish and split them later. */
export function fartBaitCount(): number {
  return tuning.fartBaitCount;
}
