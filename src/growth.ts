import type { Run } from './run';
import { mech } from './mechanisms';
import { mutationCard } from './mutations';

/**
 * What the pause panel's growth section shows: the run's numbers as they stand, and every card it has taken.
 *
 * A pure function of the run and nothing else -- no Pixi, no layout -- so what the player is TOLD can be tested without a
 * canvas, and the panel has only to draw it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE EACH THING COMES FROM
 * ---------------------------------------------------------------------------------------------
 * The cards come from `run.picks`, the log `pickMutationCard` writes, and each one's name and blurb from the card itself
 * (`mutationCard`) -- the very text the three-choice panel showed, so the two cannot disagree. The numbers are read from the
 * fields the simulation reads (`healthMax`, `defense`, `bulletDamageMultiplier`, `player.steerScale`, ...) and not
 * recomputed here, so they include the talent's share too: this is what the player IS now, not what the cards alone gave.
 */
export interface GrowthStat {
  label: string;
  value: string;
}

export interface GrowthLine {
  /** The card's name, as the three-choice panel printed it. */
  name: string;
  /** How many times it was taken, or null for a card that is taken once and has no count (a route, a skill). */
  count: number | null;
  /** The card's one-line description, verbatim. */
  blurb: string;
  /** A skill's standing: it is the one carried now, or it has been replaced by a later pick. Null for every other card. */
  note: string | null;
}

export interface GrowthGroup {
  title: string;
  lines: GrowthLine[];
}

export interface GrowthView {
  stats: GrowthStat[];
  groups: GrowthGroup[];
}

/** A number to at most two decimals with no trailing zeros: 1.3, not 1.30; 12, not 12.00. */
function plain(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function growthView(run: Run): GrowthView {
  const tiers = mech.bullets.rateTiers;
  const tier = Math.min(run.rateTier, tiers.length);
  const stats: GrowthStat[] = [
    { label: '血上限', value: plain(run.healthMax) },
    { label: '枪管', value: `${run.gunStreams} / ${mech.bullets.maxStreams} 排` },
    { label: '射速', value: `${plain(tiers[tier - 1] ?? 0)} 发/秒 · ${tier}/${tiers.length} 档` },
    { label: '伤害', value: `×${plain(run.bulletDamageMultiplier)}` },
    { label: '护甲', value: plain(run.defense) },
    { label: '转向', value: `×${plain(run.player.steerScale)}` },
    { label: '升速', value: `×${plain(run.player.ascentBonus)}` },
  ];

  // Group the log by card, keeping the order each card was FIRST taken: a card taken three times is one line, where it
  // first appeared.
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const id of run.picks) {
    if (!counts.has(id)) order.push(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const routes: GrowthLine[] = [];
  const skills: GrowthLine[] = [];
  const stacking: GrowthLine[] = [];
  for (const id of order) {
    const card = mutationCard(id);
    // A logged id with no card is a card that was removed from the game; it is still part of what the run took, so it is
    // listed by its id rather than dropped.
    const name = card?.name ?? id;
    const blurb = card?.blurb ?? '（这张卡已经不在游戏里了）';
    if (id.startsWith('route:')) {
      routes.push({ name, count: null, blurb, note: null });
    } else if (id.startsWith('skill:')) {
      skills.push({ name, count: null, blurb, note: id === `skill:${run.skill?.id}` ? '持有中' : '已被替换' });
    } else {
      stacking.push({ name, count: counts.get(id) ?? 1, blurb, note: null });
    }
  }

  // The route comes before the skills: it is the choice the rest of the run is built on.
  const identity = [...routes, ...skills];
  const groups: GrowthGroup[] = [];
  if (identity.length > 0) groups.push({ title: '路线与技能', lines: identity });
  if (stacking.length > 0) groups.push({ title: '突变', lines: stacking });
  return { stats, groups };
}
