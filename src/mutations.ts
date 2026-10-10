import { mech } from './mechanisms';
import type { Run } from './run';
import { SKILLS } from './skills';
import type { BubbleTypeId } from './bubbleTypes';

/**
 * Mutations (突变): the three-choice ladder the mutation meter pays for.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE POOL IS HERE RATHER THAN IN THE CONFIG
 * ---------------------------------------------------------------------------------------------
 * The same split the skills use (`src/skills.ts`): a card's NAME and BLURB are content, and content
 * lives in a table next to the verbs that use it. Its NUMBERS are balance, and balance lives in
 * `config/mechanics.json5` (`mutation.pool`) -- so retuning a card is a file edit, while ADDING one is a
 * row here plus the `apply` that lands it.
 *
 * The pool owns the whole in-run economy of picks now that the pickups are gone: the gun's rows and rate
 * tiers, the body's multipliers, and the skills themselves all arrive through the same three-button
 * freeze. The rules the design fixed, and why:
 *
 *   - 必选 (a pick is mandatory): a skip button is a second decision to design and tune, and the modal
 *     exists to be answered, not dismissed.
 *   - 均匀随机 (uniform draw): no rarity weights until the pool is big enough to want them.
 *   - 可叠加 (numeric cards stack): the ladder stays climbable late in a run.
 *   - 按类型过滤 (type filtering): a plain bubble must never be offered a suction it cannot hold -- the
 *     first three-choice the system ever shows is the one that teaches the player whether to trust it.
 *   - 卡满不出现 (capped cards leave the pool): the same honesty as the filtering. A "gun +1" offered at
 *     the ceiling is a dead card, and a dead card in a mandatory pick is a punishment for having played
 *     well.
 */

/** One card in the pool. `apply` lands one pick; the passive multipliers are re-derived from the counts by `applyMutationPassives`. */
export interface Mutation {
  id: string;
  name: string;
  /** One line, on the button under the name. */
  blurb: string;
  /** Which bubble types may be offered this card. */
  types: readonly BubbleTypeId[] | 'all';
  /** Whether this card is a legal offer for THIS run right now -- a ceiling reached, a skill already carried. */
  available: (run: Run) => boolean;
  /** Land one pick. Instant cards do their thing; stacking cards bump their count and let the passives re-derive. */
  apply: (run: Run) => void;
}

/** How many times each stacking card has been taken this run. Non-stacking cards never appear in it. */
export type MutationCounts = Record<string, number>;

/** The pool. Order is display order for nothing -- the draw is uniform -- but keeps the file readable: gun, body, type-specific, skills. */
const POOL: readonly Mutation[] = [
  {
    id: 'gun',
    name: '枪管 +1',
    blurb: `小泡泡同时发射 ${mech.bullets.maxStreams} 排（上限内可叠加）`,
    types: 'all',
    available: (run) => run.gunStreams < mech.bullets.maxStreams,
    apply: (run) => {
      run.gunStreams = Math.min(mech.bullets.maxStreams, run.gunStreams + 1);
    },
  },
  {
    id: 'rate',
    name: '射速 +1 档',
    blurb: `最高第 ${mech.bullets.rateTiers.length} 档`,
    types: 'all',
    available: (run) => run.rateTier < mech.bullets.rateTiers.length,
    apply: (run) => {
      run.rateTier = Math.min(mech.bullets.rateTiers.length, run.rateTier + 1);
    },
  },
  {
    id: 'damage',
    name: '子弹伤害 +15%',
    blurb: '每发打掉的血更多，可叠加',
    types: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.damage = (run.mutations.damage ?? 0) + 1;
    },
  },
  {
    id: 'steer',
    name: '转向 +10%',
    blurb: '横向操控更灵敏，可叠加',
    types: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.steer = (run.mutations.steer ?? 0) + 1;
    },
  },
  {
    id: 'ascent',
    name: '升速 +10%',
    blurb: '向上游得更快，可叠加',
    types: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.ascent = (run.mutations.ascent ?? 0) + 1;
    },
  },
  {
    id: 'armor',
    name: '减伤 +8%',
    blurb: '每次受伤掉得更少，可叠加',
    types: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.armor = (run.mutations.armor ?? 0) + 1;
    },
  },
  {
    id: 'heal',
    name: '修复体积',
    blurb: `立刻恢复 ${mech.mutation.pool.healVolume} 体积（一次性）`,
    types: 'all',
    available: (run) => run.player.volume < mech.volume.max - 0.01,
    apply: (run) => {
      run.player.volume = Math.min(mech.volume.max, run.player.volume + mech.mutation.pool.healVolume);
    },
  },
  {
    id: 'invuln',
    name: '受击无敌 +0.2 秒',
    blurb: '挨打后的闪烁更久，可叠加',
    types: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.invuln = (run.mutations.invuln ?? 0) + 1;
    },
  },
  {
    id: 'rage',
    name: '怒气积攒 +15%',
    blurb: '挨打和释放的怒气更多，可叠加',
    types: ['angry'],
    available: () => true,
    apply: (run) => {
      run.mutations.rage = (run.mutations.rage ?? 0) + 1;
    },
  },
  {
    id: 'suction',
    name: '吸取范围 +15%',
    blurb: '吸附场罩得更宽，可叠加',
    types: ['devour'],
    available: () => true,
    apply: (run) => {
      run.mutations.suction = (run.mutations.suction ?? 0) + 1;
    },
  },
  {
    id: 'eatInvuln',
    name: '吞噬无敌 +0.3 秒',
    blurb: '吞下生物后的无敌更长，可叠加',
    types: ['devour'],
    available: () => true,
    apply: (run) => {
      run.mutations.eatInvuln = (run.mutations.eatInvuln ?? 0) + 1;
    },
  },
  ...SKILLS.map((skill) => ({
    id: `skill:${skill.id}`,
    name: `技能 · ${skill.name}`,
    blurb: skill.blurb,
    types: 'all' as const,
    available: (run: Run) => run.skill?.id !== skill.id,
    apply: (run: Run) => {
      run.grantSkill(skill.id);
    },
  })),
];

/**
 * Draw `count` distinct cards, uniformly, from everything legal for this run right now.
 *
 * Fewer than asked for when the pool is thin (late run, everything else capped); always at least one,
 * because the five universal body cards are never unavailable.
 */
export function rollMutationChoices(run: Run, count = 3): Mutation[] {
  const legal = POOL.filter((m) => (m.types === 'all' || m.types.includes(run.bubbleType.id)) && m.available(run));
  const drawn: Mutation[] = [];
  while (drawn.length < count && drawn.length < legal.length) {
    let pick = legal[Math.floor(Math.random() * legal.length)]!;
    while (drawn.includes(pick)) pick = legal[Math.floor(Math.random() * legal.length)]!;
    drawn.push(pick);
  }
  return drawn;
}

/**
 * Re-derive every mutation-driven number from the counts.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PASSIVES ARE RE-DERIVED RATHER THAN ACCUMULATED
 * ---------------------------------------------------------------------------------------------
 * `startRun` re-rolls the TALENT on every level transition, and the talent rewrites the player's base
 * multipliers (`steerScale`, `ascentBonus`, `shrinkResistance`). A mutation that had multiplied those
 * fields in place would be silently wiped by the re-roll -- so the counts are the one source of truth,
 * and this folds them back in on top of whatever base the talent just set. Idempotent by construction,
 * which is what makes calling it after every `rollTalent` safe.
 *
 * The run-level fields it writes are nobody else's to reset: a carry keeps them, a death zeroes the
 * counts in `startRun` and this restores the defaults.
 */
export function applyMutationPassives(run: Run): void {
  const pool = mech.mutation.pool;
  const count = (id: string) => run.mutations[id] ?? 0;
  run.bulletDamageMultiplier = 1 + pool.damagePerPick * count('damage');
  run.invulnBonusSeconds = pool.invulnSecondsPerPick * count('invuln');
  run.rageGainMultiplier = 1 + pool.ragePerPick * count('rage');
  run.suctionBonus = 1 + pool.suctionPerPick * count('suction');
  run.eatInvulnBonusSeconds = pool.eatInvulnSecondsPerPick * count('eatInvuln');
  run.player.steerScale = run.talentEffects.steerMultiplier * (1 + pool.steerPerPick) ** count('steer');
  run.player.ascentBonus = run.talentEffects.ascentMultiplier * (1 + pool.ascentPerPick) ** count('ascent');
  run.player.shrinkResistance = Math.min(0.9, run.talentEffects.shrinkResistance + pool.armorPerPick * count('armor'));
}
