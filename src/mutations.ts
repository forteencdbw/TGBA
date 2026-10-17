import { mech } from './mechanisms';
import type { Run } from './run';
import { healthAfterHeal, healthMaxFor } from './health';
import type { RouteId } from './bubbleTypes';

/**
 * Mutations (突变): the three-choice ladder the mutation meter pays for.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE POOL IS HERE RATHER THAN IN THE CONFIG
 * ---------------------------------------------------------------------------------------------
 * The same split the config uses: a card's NAME and BLURB are content, and content
 * lives in a table next to the verbs that use it. Its NUMBERS are balance, and balance lives in
 * `config/mechanics.json5` (`mutation.pool`) -- so retuning a card is a file edit, while ADDING one is a
 * row here plus the `apply` that lands it.
 *
 * The pool owns the whole in-run economy of picks now that the pickups are gone: the gun's rows and rate
 * tiers, and the body's multipliers, all arrive through the same three-button
 * freeze. The rules the design fixed, and why:
 *
 *   - 必选 (a pick is mandatory): a skip button is a second decision to design and tune, and the modal
 *     exists to be answered, not dismissed.
 *   - 均匀随机 (uniform draw): no rarity weights until the pool is big enough to want them.
 *   - 可叠加 (numeric cards stack): the ladder stays climbable late in a run.
 *   - 按路线过滤 (route filtering): a card a run's FORM does not own is never offered. The form is chosen on the
 *     screen between 开始游戏 and the load now, so the filter is settled before the first card is ever drawn -- the
 *     pool a run sees is a consequence of a decision the player already made, rather than of one it is about to.
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
  /**
   * Which form's pool this card belongs to, or 'all' for every run.
   *
   * This one field is the whole of the lock: a run's form is fixed before its first draw, so a card belonging to
   * another form is never legal for it.
   */
  routes: 'all' | RouteId;
  /** Whether this card is a legal offer for THIS run right now -- a ceiling reached, one already carried. */
  available: (run: Run) => boolean;
  /** Land one pick. Instant cards do their thing; stacking cards bump their count and let the passives re-derive. */
  apply: (run: Run) => void;
}

/** How many times each stacking card has been taken this run. Non-stacking cards never appear in it. */
export type MutationCounts = Record<string, number>;

/** The pool. Order is display order for nothing -- the draw is uniform -- but keeps the file readable: gun, body, type-specific. */
const POOL: readonly Mutation[] = [
  {
    id: 'gun',
    name: '枪管 +1',
    blurb: `小泡泡同时发射 ${mech.bullets.maxStreams} 排（上限内可叠加）`,
    routes: 'all',
    available: (run) => run.gunStreams < mech.bullets.maxStreams,
    apply: (run) => {
      run.gunStreams = Math.min(mech.bullets.maxStreams, run.gunStreams + 1);
    },
  },
  {
    id: 'rate',
    name: '射速 +1 档',
    blurb: `最高第 ${mech.bullets.rateTiers.length} 档`,
    routes: 'all',
    available: (run) => run.rateTier < mech.bullets.rateTiers.length,
    apply: (run) => {
      run.rateTier = Math.min(mech.bullets.rateTiers.length, run.rateTier + 1);
    },
  },
  {
    id: 'damage',
    name: '子弹伤害 +15%',
    blurb: '每发打掉的血更多，可叠加',
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.damage = (run.mutations.damage ?? 0) + 1;
    },
  },
  {
    id: 'armor',
    name: `护甲 +${mech.mutation.pool.defensePerPick}`,
    blurb: `每次受击少掉 ${mech.mutation.pool.defensePerPick} 点，可叠加`,
    /**
     * A whole number subtracted from every blow, rather than the percentage this card used to grant.
     *
     * The percentage had no floor under it: 90% off a 20-damage fish is 2 points whatever else the player does, so
     * the last pick and the first were worth the same. Defence stacks linearly and reads as a number the player
     * can count -- which is what makes it a thing to build toward.
     */
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.armor = (run.mutations.armor ?? 0) + 1;
    },
  },
  {
    id: 'thickArmor',
    name: `厚甲 +${mech.mutation.pool.defenseBigPerPick}`,
    blurb: `每次受击少掉 ${mech.mutation.pool.defenseBigPerPick} 点，可叠加`,
    /**
     * The same effect, bigger, and it exists so the ladder has a late step: the small card is the steady climb,
     * this is the pick that visibly changes what the player can swim through.
     */
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.thickArmor = (run.mutations.thickArmor ?? 0) + 1;
    },
  },
  {
    id: 'heal',
    name: '修复血条',
    blurb: `血条立刻回 ${mech.health.healPerPick} 点（一次性）`,
    /**
     * One card, one pool, for every route.
     *
     * It used to branch: a growing bubble kept its health in its volume, so healing it meant adding volume. Health is
     * its own pool for all three routes now, which makes this the same one line everywhere.
     */
    routes: 'all',
    available: (run) => {
      const view = run.healthView;
      return view.current < view.max - 0.01;
    },
    apply: (run) => {
      run.health = healthAfterHeal(run.health, run.healthMax);
    },
  },
  {
    id: 'maxHp',
    name: `血上限 +${mech.health.maxPerPick}`,
    blurb: `血条的上限加 ${mech.health.maxPerPick} 点，可叠加`,
    /**
     * Always legal now, and that is a consequence of the same change: on a growing route it used to be a growth card
     * (one more hit point = more volume), so it had to go dead once the volume ceiling was reached. Volume is not the
     * ceiling any more, and the health ceiling has no top.
     */
    routes: 'all',
    available: () => true,
    apply: (run) => {
      /**
       * BOTH numbers, and the COUNT first.
       *
       * The count is the source of truth every other passive is re-derived from (`applyMutationPassives` reads
       * `run.mutations[id]`). This card used to set `healthMax` from `count + 1` without storing that count, so the
       * passives pass immediately recomputed the ceiling from the OLD count and undid it -- the card was a 20-point
       * heal with the word "上限" on it.
       *
       * The new ceiling arrives FILLED: the card buys 20 points of room and the 20 points in it, so current health
       * moves with the maximum rather than leaving a hole the player never took damage for.
       */
      const next = (run.mutations['maxHp'] ?? 0) + 1;
      run.mutations['maxHp'] = next;
      run.healthMax = healthMaxFor(next);
      run.health = Math.min(run.healthMax, run.health + mech.health.maxPerPick);
    },
  },
  {
    id: 'rage',
    name: '怒气积攒 +15%',
    blurb: '挨打和释放的怒气更多，可叠加',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.rage = (run.mutations.rage ?? 0) + 1;
    },
  },
  {
    id: 'suction',
    name: '吸取范围 +15%',
    blurb: '吸附场罩得更宽，可叠加',
    routes: 'devour',
    available: () => true,
    apply: (run) => {
      run.mutations.suction = (run.mutations.suction ?? 0) + 1;
    },
  },
  {
    id: 'eatInvuln',
    name: '吞噬无敌 +0.3 秒',
    blurb: '吞下生物后的无敌更长，可叠加',
    routes: 'devour',
    available: () => true,
    apply: (run) => {
      run.mutations.eatInvuln = (run.mutations.eatInvuln ?? 0) + 1;
    },
  },
  {
    id: 'appetite',
    name: '大胃口 +1 档',
    blurb: '比体积说的话多吃一档，可叠加——食欲也能爬食物链',
    routes: 'devour',
    available: () => true,
    apply: (run) => {
      run.mutations.appetite = (run.mutations.appetite ?? 0) + 1;
    },
  },
  {
    id: 'burstRadius',
    name: '爆破半径 +15%',
    blurb: '怒气爆破罩得更宽，可叠加',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.burstRadius = (run.mutations.burstRadius ?? 0) + 1;
    },
  },
  {
    id: 'simmer',
    name: '余温 -25% 衰减',
    blurb: '挨打攒的热散得更慢，可叠加——怒气留得更久',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.simmer = (run.mutations.simmer ?? 0) + 1;
    },
  },
  /**
   * The volatile form's own deck: the armour's three dials and the burn's one.
   *
   * Unlike the shotgun's follow-ups these are NOT gated on another card, because the volatile form ships holding
   * the armour and the aura -- the gates there exist so a card cannot be drawn before the thing it changes exists,
   * and here that thing exists from the first frame of the run. So they are plain `available: () => true`, and the
   * first three-choice of a 暴怒 run can be about being 暴怒 rather than about the gun.
   *
   * Each one moves exactly one number, and they are deliberately the three lines the form already has: the plates
   * arrive sooner, there are more of them in the bank, the break they leave goes deeper, and the burn hurts more.
   * Nothing here is a new verb -- the form's whole bet is that closing the distance is the interesting decision, and
   * a card that added a verb would be a second way to play it.
   */
  {
    id: 'plateRate',
    name: `怒甲更快 −${Math.round(mech.mutation.pool.rage.plateSecondsPerPick * 100)}%`,
    blurb: '攒出一个怒甲的时间更短，可叠加——撞得更勤',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.plateRate = (run.mutations.plateRate ?? 0) + 1;
    },
  },
  {
    id: 'plateMax',
    name: `多存一层 +${mech.mutation.pool.rage.plateMaxPerPick}`,
    blurb: '怒甲上限 +1，可叠加——连着撞两三个不用等',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.plateMax = (run.mutations.plateMax ?? 0) + 1;
    },
  },
  {
    id: 'deeperBreak',
    name: `破甲更深 +${mech.mutation.pool.rage.breakPerPick} 倍`,
    blurb: '被撞的敌人受到的所有伤害更重，可叠加——贴脸那一枪就是靠它',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.deeperBreak = (run.mutations.deeperBreak ?? 0) + 1;
    },
  },
  {
    id: 'hotBurn',
    name: `灼烧更烈 +${Math.round(mech.mutation.pool.rage.burnRatePerPick * 100)}%`,
    blurb: '贴身灼烧每跳更疼，可叠加——不用等怒气也有输出',
    routes: 'boil',
    available: () => true,
    apply: (run) => {
      run.mutations.hotBurn = (run.mutations.hotBurn ?? 0) + 1;
    },
  },
  {
    id: 'bulletSpeed',
    name: '弹速 +25%',
    blurb: '小泡泡飞得更快，可叠加',
    // ALL FORMS, and it was the first gun card to be opened up. 「越快伤害越高」 prices a round off the SPEED BONUS,
    // so a card only one form could stack would make that one card worthless everywhere else -- a slot in the
    // three-choice panel that reads "+0%" whatever you do.
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.bulletSpeed = (run.mutations.bulletSpeed ?? 0) + 1;
    },
  },
  {
    id: 'bulletRadius',
    name: '大弹丸 +30%',
    blurb: '小泡泡变大，判定跟着变大，可叠加',
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.bulletRadius = (run.mutations.bulletRadius ?? 0) + 1;
    },
  },
  {
    id: 'bulletRange',
    name: '射程 +40%',
    blurb: '小泡泡飞得更远，可叠加——寿命就是射程',
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.bulletRange = (run.mutations.bulletRange ?? 0) + 1;
    },
  },
  {
    id: 'homing',
    name: `追踪弹 ${Math.round(mech.bullets.homing.chance * 100)}%`,
    blurb: '三成的子弹自己找泡泡上方的敌人；找不到就划一道弧飞出屏幕',
    /**
     * ALL FORMS: a tracking round is a gun card, and the gun is every form's weapon -- the same sentence the shotgun
     * branch below spells out at length. The gate that follows is the part that still matters, and it is about the
     * card rather than the form.
     */
    routes: 'all',
    /**
     * ONCE, and the gate is the run's own log rather than a new flag.
     *
     * `available` is asked on every draw, and `run.picks` already holds every id this run has taken -- so "have I
     * got this one" is answerable with no new state to keep in step, and nothing to remember to clear when the run
     * restarts. A stacking version would have to be a count in `run.mutations`, which is precisely what makes a
     * card stackable; this one must not appear twice in a mandatory pick.
     */
    available: (run) => !run.picks.includes('homing'),
    apply: (run) => {
      run.bulletHomingChance = mech.bullets.homing.chance;
    },
  },
  {
    id: 'sizeDamage',
    name: '越大伤害越高',
    blurb: '子弹胀大多少就多打多少，可叠加——要飞得久才吃得到',
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.sizeDamage = (run.mutations.sizeDamage ?? 0) + 1;
    },
  },
  {
    id: 'speedDamage',
    name: '越快伤害越高',
    blurb: '「弹速」的加成直接变成伤害，可叠加——和它配套拿',
    routes: 'all',
    available: () => true,
    apply: (run) => {
      run.mutations.speedDamage = (run.mutations.speedDamage ?? 0) + 1;
    },
  },
  // ---------------------------------------------------------------------------------------------
  // 霰弹：枪的一条支线（一次打出一把，间隔拉长）
  // ---------------------------------------------------------------------------------------------
  //
  // 枪是每个形态的基础武器，所以枪卡就是每个人的卡：这一整段（连同上面的追踪弹、大弹丸、射程）对所有形态开放，
  // 形态之间分的只是身体，不是武器。专属卡现在只剩吞噬和沸腾各自的那几组。
  //
  // 转型卡改的是"一枪是什么"，不是数值，所以它**只拿一次**——用 `picks` 而不是计数，和「追踪弹」同一条路
  // （见那张卡上的说明：能叠加的东西才会有一个计数）。
  //
  // 四张配套卡全部**以"拿过转型卡"为条件**，所以在支线开始之前它们根本不进池子。这不是流程洁癖：单独拿到它们
  // 没有意义（"多一发"没有张角就是白送 DPS，"收束"收一个零度角什么都没发生），而一张会在错误的时候被抽到的
  // 废卡就是这个池子最不该有的东西。
  {
    id: 'shotgun',
    name: '霰弹枪',
    blurb: `射速减半，但每排一次打出 ${1 + mech.mutation.pool.shotgun.pellets} 颗：贴脸才全中`,
    routes: 'all',
    available: (run) => !run.picks.includes('shotgun'),
    // 空实现：这一张的"记下来"就是 `picks` 里那一笔，四个数值在 `applyMutationPassives` 里派生。
    apply: () => {},
  },
  {
    id: 'pellets',
    name: '多一发',
    blurb: '每一枪多一颗弹丸，可叠加',
    routes: 'all',
    available: (run) => run.picks.includes('shotgun'),
    apply: (run) => {
      run.mutations.pellets = (run.mutations.pellets ?? 0) + 1;
    },
  },
  {
    id: 'closeDamage',
    name: '抵近射击',
    blurb: `目标在 ${Math.round(mech.mutation.pool.shotgun.closeRangeMeters)} 米内时弹丸更疼，可叠加`,
    routes: 'all',
    available: (run) => run.picks.includes('shotgun'),
    apply: (run) => {
      run.mutations.closeDamage = (run.mutations.closeDamage ?? 0) + 1;
    },
  },
  {
    id: 'narrow',
    name: '收束',
    blurb: `张角收窄 ${Math.round(mech.mutation.pool.shotgun.narrowPerPick * 100)}%：打得更远，可叠加`,
    routes: 'all',
    available: (run) => run.picks.includes('shotgun'),
    apply: (run) => {
      run.mutations.narrow = (run.mutations.narrow ?? 0) + 1;
    },
  },
  {
    id: 'knock',
    name: '顶开',
    blurb: '命中把敌人推开，可叠加',
    routes: 'all',
    available: (run) => run.picks.includes('shotgun'),
    apply: (run) => {
      run.mutations.knock = (run.mutations.knock ?? 0) + 1;
    },
  },
];


/**
 * A card by its id -- a pool card or a route card -- or undefined for an id no card has.
 *
 * For the growth readout, which has the log's ids and needs each card's name and blurb. The cards are the single source of
 * both, so the readout cannot describe a card differently from the panel that offered it.
 *
 * The route cards used to be a second list to search, because the first level-up's panel showed them. That panel is
 * gone (the form is chosen before the run starts) and so is the list.
 */
export function mutationCard(id: string): Mutation | undefined {
  return POOL.find((m) => m.id === id);
}

/**
 * Take a card: apply it, write it in the run's log, and re-derive the passives.
 *
 * The one place a pick lands, so there is no way to take a card without it appearing in `run.picks` -- which is what the
 * pause panel's growth section reads.
 */
export function pickMutationCard(run: Run, card: Mutation): void {
  card.apply(run);
  run.picks.push(card.id);
  applyMutationPassives(run);
}

/**
 * Draw `count` distinct cards, uniformly, from everything legal for this run right now.
 *
 * Fewer than asked for when the pool is thin (late run, everything else capped); always at least one,
 * because the five universal body cards are never unavailable.
 *
 * ---------------------------------------------------------------------------------------------
 * EVERY DRAW IS UNIFORM
 * ---------------------------------------------------------------------------------------------
 * There used to be two exceptions here: the branch node (a run with no route was handed the three route cards as its
 * whole panel) and the guarantee (the draw right after choosing a route was forced to include one of that route's own
 * cards). Both went with the pick -- the form is chosen before the run starts now, so there is no node to be at and
 * nothing for a guarantee to deepen. What is left is one uniform draw from everything legal for the form.
 */
export function rollMutationChoices(run: Run, count = 3): readonly Mutation[] {
  const legal = POOL.filter((m) => (m.routes === 'all' || m.routes === run.route) && m.available(run));
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
 * A carried run keeps its counts but starts each level with a fresh player body, and `startRun` clears the
 * derived fields before this runs. A mutation that had multiplied them in place would be silently wiped -- so
 * the counts are the one source of truth, and this folds them back in on top of the defaults. Idempotent by
 * construction, which is what makes calling it on every level start safe.
 *
 * It used to fold two more, from the 转向 and 升速 cards: `player.steerScale` and `player.ascentBonus`.
 * Both cards and both fields are gone: `steerScale` reached only the keyboard's speed product -- the drag
 * path is a 1:1 promise with the finger and scales nothing -- and `ascentBonus` was written by three callers
 * and read by none, its one reader being the pause panel.
 *
 * The run-level fields it writes are nobody else's to reset: a carry keeps them, a death zeroes the
 * counts in `startRun` and this restores the defaults.
 */
export function applyMutationPassives(run: Run): void {
  const pool = mech.mutation.pool;
  const count = (id: string) => run.mutations[id] ?? 0;
  run.bulletDamageMultiplier = 1 + pool.damagePerPick * count('damage');
  run.rageGainMultiplier = 1 + pool.ragePerPick * count('rage');
  run.suctionBonus = 1 + pool.suctionPerPick * count('suction');
  run.eatInvulnBonusSeconds = pool.eatInvulnSecondsPerPick * count('eatInvuln');
  run.eatTierBonus = pool.appetiteTiersPerPick * count('appetite');
  run.burstRadiusMultiplier = 1 + pool.burstRadiusPerPick * count('burstRadius');
  // 余温 stacks as a REDUCTION, floored at 0.05: ten picks cannot freeze the gauge outright, only make the
  // heat near-permanent -- a rage that never cools is a different mechanic than slow-cooling rage.
  run.rageDecayMultiplier = Math.max(0.05, 1 - pool.rageDecayReductionPerPick * count('simmer'));
  run.bulletSpeedMultiplier = 1 + pool.bulletSpeedPerPick * count('bulletSpeed');
  run.bulletRadiusMultiplier = 1 + pool.bulletRadiusPerPick * count('bulletRadius');
  run.bulletLifeMultiplier = 1 + pool.bulletRangePerPick * count('bulletRange');
  /**
   * The shotgun branch: one transform, four stacks on top of it.
   *
   * The transform is `picks` rather than a count (it cannot be taken twice), so everything below is inert until that
   * pick exists -- 1 pellet and 0 degrees IS the ordinary gun, which is why no other module needs to know this branch
   * is there. The cone is the one that needs a floor: 收束 multiplies it, and without a floor four picks would
   * collapse it to nothing, at which point every pellet is on the same line and the spread has stopped being visible
   * while still being paid for.
   */
  const shotgun = run.picks.includes('shotgun');
  const sg = pool.shotgun;
  run.gunRateScale = shotgun ? sg.rateScale : 1;
  run.gunPellets = shotgun ? 1 + sg.pellets + sg.pelletsPerPick * count('pellets') : 1;
  run.gunSpreadDegrees = shotgun
    ? sg.totalSpreadDegrees * Math.max(sg.narrowFloor, (1 - sg.narrowPerPick) ** count('narrow'))
    : 0;
  run.bulletCloseRangeMeters = sg.closeRangeMeters;
  run.bulletCloseDamageRate = sg.closeDamagePerPick * count('closeDamage');
  run.bulletKnockbackScale = 1 + sg.knockbackPerPick * count('knock');
  /**
   * The volatile form's deck: three dials off the armour, one off the burn.
   *
   * Read from the config every time rather than stored on the card, so the armour's own numbers stay in one place --
   * a card that hard-coded "4 seconds" would go stale the day `angry.armour.secondsPerPlate` was tuned.
   *
   * Two of the four are MULTIPLIERS and two are additions, and the split follows the gun's: the burn scales with its
   * BASE the way `damagePerPick` scales with `bullets.damage`, so it stays the same card however the base is later
   * tuned, while 破甲更深 and 多存一层 are amounts, which cap themselves.
   *
   * The interval is the one multiplier that also needs a floor, for the reason `plateSecondsFloor` gives: five picks
   * of a -20% would put a plate down to a third of the base interval, and plates arriving that fast stop being a
   * rhythm.
   */
  const rage = pool.rage;
  const armour = mech.angry.armour;
  run.armourSecondsPerPlate =
    armour.secondsPerPlate * Math.max(rage.plateSecondsFloor, (1 - rage.plateSecondsPerPick) ** count('plateRate'));
  run.armourMax = Math.min(rage.plateMaxCap, armour.max + rage.plateMaxPerPick * count('plateMax'));
  run.armourVulnerableMultiplier = armour.vulnerableMultiplier + rage.breakPerPick * count('deeperBreak');
  run.auraDamagePerTick = mech.angry.aura.damagePerTick * (1 + rage.burnRatePerPick * count('hotBurn'));
  // The two state-driven cards are RATES, not multipliers, because neither collapses into one number for the run:
  // the size one is applied to each round's own growth at the moment it lands (see `damageOf`).
  run.bulletSizeDamageRate = pool.sizeDamagePerPick * count('sizeDamage');
  run.bulletSpeedDamageRate = pool.speedDamagePerPick * count('speedDamage');
  /**
   * Defence: both cards' worth, with NO ceiling.
   *
   * There is no `min` here on purpose. The card that used to live in this line was a percentage capped at 0.9,
   * because a percentage has to be capped -- at 1.0 it is invulnerability, and the game has no way to say "90% of
   * a fish". A subtraction caps itself: the `minDamageRatio` floor in `src/health.ts` is what keeps a very high
   * defence from being the same thing.
   */
  run.defense = pool.defensePerPick * count('armor') + pool.defenseBigPerPick * count('thickArmor');
  /**
   * The health ceiling, re-derived like every other passive.
   *
   * The 「血上限」 card also adds to the CURRENT health when it is taken -- a ceiling without the point that fills
   * it would leave the bar showing a deficit the player never took damage for. Both numbers move by the same
   * amount, one at pick time and one here, and this one is idempotent so a re-roll cannot double it.
   */
  run.healthMax = healthMaxFor(count('maxHp'));
}
