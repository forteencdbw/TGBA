import { mech } from './mechanisms';
import { KIND_TUNING, stomachEffect, blastRadiusFraction, type HazardKind } from './hazards';
import { OBSTACLE_NAMES } from './obstacles';
import { spitImpact } from './spit';
import { SKILLS, activationFor, type SkillId } from './skills';
import { TALENTS, type TalentId } from './talents';
import { BUBBLE_TYPES, type BubbleType, type BubbleTypeId, type ControlId } from './bubbleTypes';

/**
 * The codex: one card per thing in the game, reached from the main menu.
 *
 * ---------------------------------------------------------------------------------------------
 * THE RULE THIS FILE EXISTS TO KEEP
 * ---------------------------------------------------------------------------------------------
 * **A card's numbers are READ, not written.** Mass, edible tier, durability, uses, radii, rates -- all of it comes
 * from the same tables the simulation uses. Only the PROSE is authored here.
 *
 * The alternative is the usual fate of an in-game encyclopedia: it is accurate on the day it is written and it is a
 * lie three commits later, because nothing fails when a creature's mass changes and the card does not. Deriving it
 * means the page cannot describe a game that no longer exists -- and `e2e/codex.spec.ts` goes further and asserts
 * that every kind, skill and talent in the game HAS a card, so adding one without documenting it is a failing test
 * rather than a gap nobody notices.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS AUTHORED: THE VERB, AND WHAT IT MEANS
 * ---------------------------------------------------------------------------------------------
 * Each entry gets a one-line `tagline` (what the thing does, in the player's terms) and `notes` (what that means
 * for the decision in front of them). That is the part a table cannot supply, and it is the part worth writing
 * carefully: the numbers are already on the card, so the prose has to say something the numbers do not.
 */

/** The five tabs, in the order they are shown. */
export type CodexCategory = 'enemy' | 'environment' | 'bubble' | 'skill' | 'talent';

export const CODEX_CATEGORIES: readonly { id: CodexCategory; label: string }[] = [
  { id: 'enemy', label: '敌人' },
  { id: 'environment', label: '环境' },
  { id: 'bubble', label: '气泡' },
  { id: 'skill', label: '技能' },
  { id: 'talent', label: '天赋' },
];

/**
 * How to draw the entry's icon.
 *
 * `hazard` and `obstacle` go through the REAL painters, so the picture on the card is the picture in the water and
 * cannot drift from it. The rest are simple procedural glyphs drawn by the page, because there is no runtime object
 * to hand to a painter -- a skill is not something that exists on screen outside the moment it is used.
 */
export type CodexIcon =
  | { kind: 'hazard'; hazard: HazardKind }
  | { kind: 'obstacle'; obstacle: 'crate' | 'coral' }
  | { kind: 'glyph'; glyph: CodexGlyph };

export type CodexGlyph =
  | 'player'
  | 'suction'
  | 'spit'
  | 'compress'
  | 'stages'
  | 'collectable'
  | 'skillPickup'
  | 'angry'
  | 'binge'
  | 'rageGauge'
  | 'charge'
  | 'rageBurst'
  | 'overload'
  | SkillId
  | TalentId;

export interface CodexFact {
  label: string;
  value: string;
}

export interface CodexEntry {
  /** Stable id, and what the coverage test compares against the game's own lists. */
  id: string;
  category: CodexCategory;
  /**
   * Which bubble type this card belongs to, for the cards that belong to one.
   *
   * Undefined for the shared tabs, and used for exactly two things: the icon's colour, and the coverage test's
   * "every type in the game has a card". Both of those are about the TYPE rather than about the card, so the field
   * lives here rather than being re-derived from the id at each use.
   */
  type?: BubbleTypeId;
  name: string;
  tagline: string;
  facts: readonly CodexFact[];
  notes: readonly string[];
  icon: CodexIcon;
}

/** Percent, without pretending to more precision than the config has. */
const pct = (x: number): string => `${Math.round(x * 100)}%`;
const num = (x: number, places = 2): string => x.toFixed(places);

/**
 * What a creature does once it is inside, as one line.
 *
 * Derived from `stomachEffect`, so a creature whose side effect is retuned in the config re-describes itself. The
 * order of the checks is the order of how specific the effects are; only one is ever set today, but nothing here
 * assumes that.
 */
function insideText(kind: HazardKind): string {
  const e = stomachEffect(kind);
  const parts: string[] = [];
  if (e.damagePerSecond > 0) parts.push(`每秒 -${num(e.damagePerSecond)} 命中点`);
  if (e.fuseSeconds > 0) parts.push(`引信 ${num(e.fuseSeconds, 1)}s 后爆开，扣 ${e.detonationHitPoints} 点`);
  if (e.shockSeconds > 0) parts.push(`每 ${num(e.shockPeriodSeconds, 1)}s 失控 ${num(e.shockSeconds, 1)}s`);
  if (e.digestScale < 1) parts.push(`消化速度 ×${num(e.digestScale)}`);
  if (e.spitChance < 1) parts.push(`喷吐成功率 ${pct(e.spitChance)}`);
  return parts.length ? parts.join('，') : '没有';
}

/**
 * The nine creatures.
 *
 * Ordered as the player meets them rather than by kind name: the four original threats, then the five that keep
 * acting once they are inside, in the order the level introduces them. That order is a teaching order, and a codex
 * is read by somebody trying to remember what the thing that killed them was.
 */
const ENEMY_PROSE: readonly { kind: HazardKind; tagline: string; notes: readonly string[] }[] = [
  {
    kind: 'fish',
    tagline: '追着你跑，还会吃气泡分裂',
    notes: [
      '感知半径随你的体积增长——你越大，越远的鱼会来追你。',
      '这是唯一能让数量指数增长的规则：一条鱼吃够气泡就分裂成两条。',
      '所以"天赋的反噬"是真的：你的保命手段同时在喂它们。',
    ],
  },
  {
    kind: 'jelly',
    tagline: '碰到就减速 + 掉血，而且它会蓄势冲锋',
    notes: [
      '碰到它既**减速**又**掉血**：只有减速的话，碰到水母比碰到鱼更划算，而一只又慢又躲不开的漂浮物绝不能是这样。',
      '惩罚是关于"气泡在哪"的，所以减速画在气泡身上，不在状态栏里。',
      '它的冲锋从**自己当前的位置**起跳，弧线是它"从侧面扫过来"的全部来源——不再先走到某个位置再跳。',
      '它优先追最大的气泡——强者先被针对。',
    ],
  },
  {
    kind: 'trash',
    tagline: '吸住你并持续拖血',
    notes: ['主动操作（挣扎）达到最短时间后可以挣脱，挣脱时它自己破掉。', '它盯上的也是最大的那个气泡。'],
  },
  {
    kind: 'crab',
    tagline: '预兆后把你向上弹射',
    notes: [
      '唯一可能有利的危险物：它把你往上送。预兆弧线是它公平的全部依据，所以它进入距离才开始布防。',
      '被弹飞后它自己四脚朝天挣扎，然后消失。',
    ],
  },
  {
    kind: 'bombfish',
    tagline: '追着你过来的定时炸弹：打爆它，炸弹就在原地炸',
    notes: [
      '在外面它会朝你的气泡靠近，进入距离就点燃引信、开始倒计时（头上会套一圈越来越紧的环，那就是倒计时）。',
      '**打爆它不等于拆弹**：血打空它就在**原地**炸开，所以远距离打爆是唯一安全的拆法，贴脸打爆等于自爆。',
      '在胃袋里从吞下那一刻开始另一条倒计时，到点在里面炸开：扣血，而且它那份质量一起炸掉、不产出任何等级。',
      '吐出去是范围击退——这是"值得吃"的那一半理由。',
    ],
  },
  {
    kind: 'boss',
    tagline: '每关的终点：不打掉它，这一关就不会结束',
    notes: [
      '它**不随水流走**：它一直悬在你上方横向游弋，所以你跑不掉，只能打——或者死。',
      '它的血量、名字和颜色是**关卡**给的（每关一只，各不相同），怎么动和怎么开枪是共享机制。',
      '打它是在**倒计时**：它的血量就是这一关的进度条（屏幕顶部那条）。',
    ],
  },
  {
    kind: 'urchin',
    tagline: '会放尖刺的硬壳：打得跑，但要十几发',
    notes: [
      '它现在会**朝你发射尖刺**——比其它敌人的子弹都快，所以它的威胁是"远处也得躲"，不是"别碰"。',
      '血量给到 15：这是全游戏最厚的一只，打跑它的代价是时间，而时间是这局里最贵的东西。',
      '吃下去就一直放血直到它离开：它的账单按时间算，所以带着它压缩是最糟的选择（压缩期间受伤翻倍）。',
      '质量给得比水母还重，弹药也硬——否则没有人会有理由碰它。',
    ],
  },
  {
    kind: 'eel',
    tagline: '被电到的那几秒，左右是反的',
    notes: [
      '全游戏唯一夺走操作的机制，所以它必须看得见：被电时气泡外面套一圈锯齿状的电光。',
      '只反横向。纵向也反过来会让人以为是关卡坏了，而不是气泡被电了。',
      '它游一条明显的 S 形——这是"可以提前读出来"的全部依据。',
    ],
  },
  {
    kind: 'rot',
    tagline: '它在胃袋里时，消化变得很慢',
    notes: [
      '它惩罚的不是"你吃了它"，而是"你打算靠消化解决问题"。',
      '和压缩相乘：带着它去压缩，时间被拉长，而过饱引信不会等你。',
      '取最坏的那一件，不叠乘——两件腐败物不会让消化慢到看不出来。',
    ],
  },
  {
    kind: 'oil',
    tagline: '占着容量，而且吐不出来',
    notes: [
      '每次喷吐只有一定概率把它弄出来，所以它不是墙而是账单：你会花掉几次机会，而引信不会等你。',
      '拒绝时会有明确的提示——否则玩家唯一的读法会是"按钮坏了"。',
      '最重的一种，击退也强：它值得吃，只是很难甩掉。',
    ],
  },
  /**
   * The five creatures the levels after the first one introduced.
   *
   * They were missing from the book entirely, which is worse than a thin description: the codex is the only place a player
   * can find out what a thing does, so a creature that is not in it is a creature with no rules as far as anyone reading is
   * concerned. Ordered by the level that introduces them, like the rest.
   */
  {
    kind: 'angler',
    tagline: '深海鱼：触角发光，看准了才冲锋',
    notes: [
      '它的发光触角是这一关唯一的光源——**那个亮点在告诉你它在哪里**，也在告诉你它看得见你。',
      '血量比小鱼小虾厚得多（见上面的血量），所以不要指望随手几发就赶走它：它是要被"处理"的敌人，不是路过的杂兵。',
      '冲锋走的是和别的冲锋者一样的固定曲线：它从**当前所在位置**起跳、弧线是"从侧面扫过来"的全部来源，所以看到征兆就往弧线的外侧走。',
    ],
  },
  {
    kind: 'torpedo',
    tagline: '直线冲刺，被打中就当场炸开',
    notes: ['它的路径是直的，所以躲它靠的是**提前横移**，而不是等它靠近。', '打爆它在原地炸——距离太近等于自己踩上去。'],
  },
  {
    kind: 'zapper',
    tagline: '被打中会放电，电环会连累近处的水母',
    notes: ['打它是要付代价的：那圈电是你开火换来的。', '它周围的同类会被一起带进电环里——所以它既可能是麻烦，也可能是机会。'],
  },
  {
    kind: 'foam',
    tagline: '打不掉的泡沫：可以穿过，但会挡视线',
    notes: ['它不吃子弹，绕开就行——**在这里花时间是唯一真正的损失**。'],
  },
  {
    kind: 'rain',
    tagline: '从上往下压的水流：把你按回去',
    notes: ['它不造成接触伤害，但会**持续把你往下压**——上升的节奏被打断就是它的作用。'],
  },


  /**
   * The blind shrimp: in the game since the first level, and never written into the book.
   *
   * It is the least dangerous thing in level 1 and that is exactly why it belongs here: a reader who has been killed by a
   * crab, a jellyfish and a bomb fish will still want to know what the small drifting one does, and "nothing, it is food"
   * is a useful thing to be told once rather than learned by flinching.
   */
  {
    kind: 'shrimp',
    tagline: '盲虾：随水流漂，不会追你',
    notes: [
      '它没有感官，所以不会因为你变大而过来——**第一关里唯一可以放心忽略的活物**。',
      '它仍然是会动的食物：吃下去算体积，但**不提供任何额外收益**，所以饿了就吃，不饿就让开。',
      '数量多、体型小，是"随手吃两口"的来源；真正要躲的东西从来不是它。',
    ],
  },
];

function enemyEntry(kind: HazardKind, tagline: string, notes: readonly string[]): CodexEntry {
  const tier = mech.consumption.edibleAtTier[kind] ?? 0;
  const mass = mech.consumption.mass[kind] ?? 0;
  const impact = spitImpact(kind);
  const blast = blastRadiusFraction(kind);
  /**
   * What this creature does to you beyond touching you, DERIVED from the config.
   *
   * A card that listed only the contact rules would be wrong for the kinds that lunge -- "it bumps into you" badly
   * undersells a fish that telegraphs a curve and commits to it. Derived rather than authored for the usual reason:
   * a card that can disagree with the game is worse than a card with nothing on it.
   */
  const threat: string[] = [];
  const charger = mech.charges.chargers[kind];
  if (charger) {
    const how = charger.approach === 'side' ? '从侧面横扫过来' : '按一条固定曲线撞过来';
    threat.push(`冲锋：进入 ${num(charger.triggerMeters, 0)}m 蓄势 ${num(charger.telegraphSeconds, 2)}s，${how}`);
  }
  if (kind === 'bombfish') {
    const bomb = mech.hazards.bombfish;
    threat.push(
      `追踪：${num(bomb.seekSpeedFactor, 2)} 泳道/秒朝你靠近 · 进入 ${num(bomb.armMeters, 0)}m 点燃引信 ${num(bomb.fuseSeconds, 1)}s · 爆炸半径 ${num(bomb.blastRadiusRatio * 100, 0)}% 泳道`,
    );
    threat.push('打爆它 = 原地爆炸（远距离打爆才安全）');
  }
  const gun = mech.enemyBullets.shooters[kind];
  if (gun) {
    const speed = `${num(gun.speedPerSecond, 2)} 泳道/秒`;
    threat.push(
      gun.spread > 1
        ? `开火：每秒 ${num(gun.perSecond, 2)} 组扇形 ${gun.spread} 发 · ${speed}`
        : `开火：每秒 ${num(gun.perSecond, 2)} 发 · ${speed}`,
    );
  }
  return {
    id: `enemy:${kind}`,
    category: 'enemy',
    name: HAZARD_NAMES[kind],
    tagline,
    facts: [
      // The tier is stated as BOTH the rung and the volume it needs, because "第 3 档" means nothing until you have
      // seen the ladder, and the ladder is not on this card.
      { label: '可吞', value: `第 ${tier} 档 · 体积 ≥ ${num(mech.consumption.tierVolume[tier - 1] ?? 0, 1)}` },
      { label: '质量', value: num(mass) },
      { label: '弹药', value: `${num(impact)}× 击退${blast > 0 ? ' · 命中爆炸' : ''}` },
      { label: '体内', value: insideText(kind) },
      /**
       * How many rounds drive it off, DERIVED from the config.
       *
       * Worth a line because it is not the same for every creature and it changes: the fish took three rounds until
       * the day it took two. A card that stated a number in prose would have gone stale that day.
       */
      {
        label: '打跑',
        value:
          (mech.hazards.health[kind] ?? 0) > 0
            ? `${mech.hazards.health[kind]} 发小泡泡（打空就跑，不会死）`
            : '打不跑：子弹直接穿过去',
      },
      ...(threat.length ? [{ label: '攻击方式', value: threat.join('；') }] : []),
    ],
    notes,
    icon: { kind: 'hazard', hazard: kind },
  };
}

/**
 * Display names for the creatures.
 *
 * Here rather than in `KIND_TUNING` because nothing in the simulation needs a creature's name -- the game never
 * prints one. The HUD names STAGES and SKILLS; a fish is only ever a shape. So these exist for this page alone, and
 * that is why they live beside the prose instead of in the table the drawing code reads.
 */
const HAZARD_NAMES: Record<HazardKind, string> = {
  fish: '小鱼',
  tuna: '金枪鱼',
  jelly: '水母',
  trash: '垃圾袋',
  crab: '螃蟹',
  bombfish: '炸弹鱼',
  urchin: '海胆',
  eel: '电鳗',
  rot: '腐败物',
  oil: '油污',
  boss: 'BOSS',
  vent: '热液喷口',
  mineral: '矿物颗粒',
  shrimp: '盲眼虾',
  angler: '灯笼鱼',
  torpedo: '失控鱼雷',
  zapper: '电击水母',
  foam: '碎浪泡沫',
  rain: '雨滴冲击',
};

/** The four things in the water that are not creatures. */
const ENVIRONMENT: readonly CodexEntry[] = [
  {
    id: 'env:bubble',
    category: 'environment',
    name: '收集物（气泡）',
    tagline: '你的食物，也是你要躲的东西',
    facts: [
      { label: '体积', value: '按半径的平方算，所以大泡泡一颗顶好几颗' },
      { label: '上升', value: '越大升得越快（浮力随体积、阻力随截面积）' },
      { label: '吸食', value: '玩家半径 ≥ 它的 92% 才能吃' },
    ],
    notes: [
      '它相对你的屏幕速度 = 你的上升速度 - 它自己的上升速度，所以往下飘的是能吃的，往上跑的是吃不动的——这条不需要任何 UI。',
      '大泡泡比你还快，会跑到视野下方去；在那里回收等于一直删掉最大的那些。',
    ],
    icon: { kind: 'glyph', glyph: 'collectable' },
  },
  {
    id: 'env:crate',
    category: 'environment',
    name: OBSTACLE_NAMES.crate,
    tagline: '可以直接撞碎，也可以绕',
    facts: [
      { label: '耐久', value: `${num(mech.obstacles.health.crate ?? 0, 1)} 点` },
      { label: '撞碎', value: `体积 ≥ ${num(mech.obstacles.ramVolumeThreshold, 1)} 才撞得动` },
      { label: '弹丸', value: `每发 ${num(mech.obstacles.projectileDamage)} × 弹药系数` },
    ],
    notes: [
      '一炮就碎，所以它是大体积的奖励：够大就直接穿过去。',
      '撞不碎的时候，被挡住并挨一下。',
    ],
    icon: { kind: 'obstacle', obstacle: 'crate' },
  },
  {
    id: 'env:coral',
    category: 'environment',
    name: OBSTACLE_NAMES.coral,
    tagline: '撞不碎，只能绕——或者变小穿过去',
    facts: [
      { label: '耐久', value: `${num(mech.obstacles.health.coral ?? 0, 1)} 点` },
      { label: '最小缺口', value: `${pct(mech.obstacles.minGapFraction)} 泳道宽` },
      { label: '弹丸', value: `每发 ${num(mech.obstacles.projectileDamage)} × 弹药系数` },
    ],
    notes: [
      '珊瑚硬得多，所以它逼你变小或走缝，而木箱奖励你变大。两种答案放在一起，选择才是真的。',
      '每一排都保证留出"玩家最小时也能通过"的缺口——这不是体贴，而是让"变小"成为选择而不是必需。',
    ],
    icon: { kind: 'obstacle', obstacle: 'coral' },
  },
  {
    id: 'env:ratePickup',
    category: 'environment',
    name: '射速升级',
    tagline: '拾取后射速 +1 档，最高三档',
    facts: [
      { label: '档位', value: mech.bullets.rateTiers.map((r, i) => `第${i + 1}档 ${num(r, 0)}/秒`).join(' · ') },
      { label: '上限', value: `第 ${mech.bullets.rateTiers.length} 档（档数就是这个表的长度）` },
      { label: '持续', value: '整局有效，死亡后重置' },
    ],
    notes: [
      '它改的是**扣扳机的频率**，火力升级改的是**一次几排**：两个乘数各自一条拾取线，互不干扰。',
      '到顶之后再捡会被消耗掉，横幅会明说"已经是最高档"——一个什么都不做又不吭声的拾取物读起来就是 bug。',
      '档数就是配置里那个数组的长度：加一档=多写一个数，没有第二个"上限"要同步。',
    ],
    icon: { kind: 'glyph', glyph: 'skillPickup' },
  },
  {
    id: 'env:upgradePickup',
    category: 'environment',
    name: '能力升级',
    tagline: '拾取后火力永久 +1 排',
    facts: [
      { label: '效果', value: `小泡泡同时发射 ${mech.bullets.maxStreams} 排（当前上限）` },
      { label: '持续', value: '整局有效，死亡后重置' },
      { label: '排间距', value: `${num(mech.bullets.upgradeSpreadRatio * 100, 1)}% 泳道宽` },
    ],
    notes: [
      '射速不变，**每排各出一发**：所以它是"DPS 翻倍"，不是"打得更快"。',
      '排间距留在泳道里而且不宽，因为弹道之间那道缝也是玩家瞄准用的通道——糊满整条泳道会让"躲"失去意义。',
      '上限由 bullets.maxStreams 决定：改成 3 或 4 它就能叠加，上限内再捡会被消耗但不再变化。',
    ],
    icon: { kind: 'glyph', glyph: 'skillPickup' },
  },
  {
    id: 'env:skillPickup',
    category: 'environment',
    name: '技能掉落物',
    tagline: '捡起来随机得到一种技能',
    facts: [
      { label: '槽位', value: '单槽，捡新的换掉旧的' },
      { label: '内容', value: '拾取的瞬间才决定是哪一个' },
    ],
    notes: [
      '在拾取时才掷骰子，不是放在水里的时候就定好——否则关卡作者决定"放在哪"就等于决定了"是什么"。',
      '单槽是刻意的：它让捡起来这件事变成一个决定，而不是攒一套工具箱。',
    ],
    icon: { kind: 'glyph', glyph: 'skillPickup' },
  },
];

/**
 * How each control is named on a card.
 *
 * Here rather than in `bubbleTypes.ts` because it is card text -- the type descriptor deals in ids, and the one
 * place that has to turn an id into a word for a reader is this page.
 */
const CONTROL_LABELS: Record<ControlId, string> = {
  skill: '技能',
  suction: '吸附',
  spit: '喷吐',
  compress: '消化',
  charge: '蓄力冲撞',
  burst: '怒气爆破',
};

/**
 * The bubble tab: one card per type, and one per signature mechanic of that type.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A LOOP OVER `BUBBLE_TYPES` RATHER THAN A HAND-WRITTEN LIST
 * ---------------------------------------------------------------------------------------------
 * The first version of this tab documented the only bubble there was, in a flat array whose five cards read as if
 * they were the RULES of the game rather than the abilities of one character: "absorb", "spit", "digest" were
 * written as though every bubble could do them, and for one commit that was true. A second type made it false.
 *
 * So the cards are generated: one per entry in `BUBBLE_TYPES`, each followed by that type's own mechanics, with the
 * prose keyed by the game's own type id. A third type with no prose throws at load, and `e2e/codex.spec.ts` asserts
 * the same thing from the outside -- every type in the game has a card. The facts stay DERIVED: which buttons a type
 * has, what its colours follow, what it costs.
 */
interface BubbleProse {
  /** The card for the type itself. */
  self: { tagline: string; glyph: CodexGlyph; notes: readonly string[] };
  /** One card per signature mechanic, in reading order. `key` completes the id as `bubble:<type>:<key>`. */
  features: readonly {
    key: string;
    name: string;
    glyph: CodexGlyph;
    tagline: string;
    facts: () => readonly CodexFact[];
    notes: readonly string[];
  }[];
}

/** The facts that describe a type rather than a mechanic: what it is, and what it has. */
function typeFacts(type: BubbleType): readonly CodexFact[] {
  const facts: CodexFact[] = [
    { label: '按钮', value: type.controls.map((c) => CONTROL_LABELS[c]).join(' · ') },
    /**
     * The stomach, which is the first difference a player notices between the two types.
     *
     * Derived rather than authored, so a third type cannot ship with a card describing the wrong one -- and the
     * wording says what the answer MEANS rather than only yes or no, because "no stomach" is interesting once you
     * know that touching a creature is therefore a wound instead of a meal.
     */
    {
      label: '胃袋',
      value: type.swallowsHazards
        ? `有：能吞下危险物，再用${[type.controls.includes('spit') ? '喷吐' : '', type.controls.includes('compress') ? '消化' : ''].filter(Boolean).join(' / ')}处理它`
        : '没有：碰到敌人不会被吞掉，而是挨打',
    },
    {
      label: '颜色',
      value:
        type.look === 'rage'
          ? `随怒气：${mech.angry.appearance.map((a) => a.name).join(' → ')}`
          : type.look === 'plain'
            ? '不随任何东西：没有状态可以显示'
            : `随成长阶段：${mech.stages.appearance.map((a) => a.name).join(' → ')}`,
    },
  ];
  // The bubble's own numbers, identical for every type, because they are facts about BEING a bubble.
  facts.push(
    { label: '开局体积', value: num(mech.volume.start, 1) },
    { label: '上限', value: num(mech.volume.max, 1) },
    {
      label: '一次受击',
      value:
        type.hitsToPop !== null
          ? `直接爆开：血量固定 ${type.hitsToPop} 点，与体积无关`
          : `-${num(mech.volume.hitCost, 1)}（固定值，与当前体积无关）`,
    },
    { label: '无敌时间', value: `${num(mech.hazards.invulnerableSeconds, 1)}s` },
  );
  /**
   * The growth stages are speed tiers for every type that grows -- the type only changes what the COLOUR follows --
   * so they are one fact about being a bubble rather than a card of their own on the volatile bubble's side.
   *
   * A type that does NOT grow gets the fact that replaces them instead. It is derived from the type rather than
   * authored, because a card that listed "absorb 12 to promote" for a bubble that can never be promoted would be the
   * codex teaching the wrong game.
   */
  facts.push(
    type.growsByAbsorbing
      ? {
          label: '成长阶段',
          value: `吸收 ${mech.stages.absorbToStage2} / ${mech.stages.absorbToStage3} 颗晋升 · 速度 ${mech.stages.speedMultiplier.map((m) => `×${num(m)}`).join(' → ')}`,
        }
      : {
          label: '成长',
          value: `不会长大：吸收一个泡泡 +${num(mech.score.absorb, 1)} 分，体积和速度始终不变`,
        },
  );
  return facts;
}

/** The creatures a burst clears, and the ones it only pushes -- both read from the config table. */
function burstSplit(): readonly CodexFact[] {
  const mode = mech.angry.burst.hazardMode;
  const of = (want: 'destroy' | 'push') =>
    Object.keys(mode)
      .filter((kind) => mode[kind] === want)
      .map((kind) => HAZARD_NAMES[kind as HazardKind] ?? kind)
      .join('、');
  return [
    { label: '清除', value: of('destroy') },
    { label: '推开', value: of('push') },
  ];
}

const BUBBLE_PROSE: Record<BubbleTypeId, BubbleProse> = {
  devour: {
    self: {
      tagline: '体积就是血量，也是判定框',
      glyph: 'player',
      notes: [
        '受击固定扣一个命中点，所以能挨几下随体积增长——这是变大的收益；而变大的代价是更大的判定框。',
        '用"按当前体积比例扣血"试过：大泡泡能挨 13 下、小的 8 下，变大反而更容易，和设计相反。',
        '它靠吸附把食物拉过来，靠喷吐把吞下去的东西当弹药，靠消化把库存换成可吞等级——四条动词见下。',
      ],
    },
    features: [
      {
        key: 'stages',
        name: '成长阶段',
        glyph: 'stages',
        tagline: '吃得越多，越难躲',
        facts: () => [
          { label: '晋升', value: `吸收 ${mech.stages.absorbToStage2} / ${mech.stages.absorbToStage3} 颗` },
          { label: '速度', value: mech.stages.speedMultiplier.map((m) => `×${num(m)}`).join(' → ') },
          { label: '外观', value: mech.stages.appearance.map((a) => a.name).join(' → ') },
        ],
        notes: [
          '阶段是速度档位，不是视觉大小：大小由体积连续决定，所以"刚升到阶段2"和"阶段2 又吃了五颗"看不出区别，颜色才能回答"我在第几阶段"。',
          '这是整个设计的核心张力：吃得越多，越难躲，所以"要不要继续吃"是真取舍。',
        ],
      },
      {
        key: 'suction',
        name: '吸附',
        glyph: 'suction',
        tagline: '按住产生吸力，代价是几乎躲不开',
        facts: () => [
          { label: '半径', value: `${pct(mech.suction.radiusRatio)} 泳道 + 每点体积 ${pct(mech.suction.radiusPerVolume)}` },
          { label: '上限', value: `${pct(mech.suction.maxRadiusRatio)} 泳道` },
          { label: '移动', value: `×${num(mech.suction.moveSpeedFactor)}` },
          { label: '拉重物', value: `质量比 ≥ ${num(mech.suction.heavyRatio, 1)} 时只剩 ${pct(mech.suction.heavyFloor)}` },
        ],
        notes: [
          '只负责拉近，不负责吃：拉到位之后仍走档位判定，所以把吃不了的螃蟹吸过来等于加速把它拉到脸上。',
          '危险物一样会被吸——一个对它们无效的场会取消使用它的全部风险，"什么时候按住"就不再是决定。',
          '拖动难度按目标/玩家质量比算，于是吸力自动随成长变强，不需要第二套成长系统。',
        ],
      },
      {
        key: 'spit',
        name: '喷吐',
        glyph: 'spit',
        tagline: '吞下的东西就是弹药',
        facts: () => [
          { label: '容量', value: `${mech.spit.capacity} 件` },
          { label: '顺序', value: '最早吞下的先出' },
          { label: '射程', value: `约 ${num(mech.spit.speedPerSecond * mech.spit.decaySeconds)} 泳道宽` },
          { label: '命中', value: `击退 ${num(mech.spit.knockbackMeters)} m × 弹药系数 ÷ 目标质量` },
        ],
        notes: [
          '吐出去的东西保留自己的属性：蟹是重冲击、水母带减速、垃圾袋黏人。你吞了什么，决定你手上有什么。',
          '喷吐会把那份质量还回去，所以"清空胃袋 → 体积下降 → 擦过原本过不去的窄缝"是真的。',
          '命中效果是击退不是伤害：这些危险物本来就没有血量，为了一个机制给它们发明生命值，等于在机制里藏一个新系统。',
        ],
      },
      {
        key: 'binge',
        name: '过饱',
        glyph: 'binge',
        tagline: '唯一给贪婪设上限的机制',
        facts: () => [
          { label: '容量', value: `${mech.spit.capacity} 件——满了就不再吞入` },
          { label: '引信', value: `${num(mech.spit.overloadFuseSeconds, 1)}s：从满到爆开之间` },
          { label: '期间', value: `移动 ×${num(mech.spit.overloadMoveSpeedFactor, 2)}（与吸附相乘）· 吸力 ×${num(mech.spit.overloadSuctionFactor, 2)}` },
          { label: '出路', value: '吐出来、压下去，或者被炸' },
        ],
        notes: [
          '满仓之后引信就开始烧，所以"还能再塞一件"永远是错的——这两件事是同一个机制的两半。',
          '过饱时吸力不降反升：惩罚里混着诱惑。你会不由自主把更多东西拉过来，而你已经吃不下了。',
          '这是唯一一个能把自己玩死的机制，所以它有两个出口（喷吐、消化）都永远只差一个按钮，而且引信快到时会闪。',
        ],
      },
      {
        key: 'compress',
        name: '消化压缩',
        glyph: 'compress',
        tagline: '把库存转成可吞等级，代价是变脆',
        facts: () => [
          { label: '被动', value: `每秒 ${pct(mech.digest.passivePerSecond)} 件` },
          { label: '按住', value: `每秒 ${pct(mech.digest.compressPerSecond)} 件` },
          { label: '换汇率', value: `${num(mech.digest.energyPerTier, 1)} 能量 / 级，最多 +${mech.digest.maxTierBonus} 级` },
          { label: '代价', value: `禁吸附 · 受击 +${mech.digest.extraHitPoints} 点` },
        ],
        notes: [
          '胃袋有三条出路：喷吐（立刻、变弹药）、消化（慢、变等级）、以及不管它（引信烧完就爆）。',
          '账是平的：吞下多少质量就还回去多少，所以中途吐出去不会静默丢掉已经流走的那一份。',
          '消化不会杀死你：最多把你压到还剩 1 点血——这是唯一能用来杀死自己的机制，不该无声发生。',
        ],
      },
    ],
  },
  angry: {
    self: {
      tagline: '挨打积怒，把怒气撞出去',
      glyph: 'angry',
      notes: [
        '它没有吸附、没有喷吐、没有消化，也没有胃袋：碰到敌人不会被吞掉，而是挨打——那正是它的怒气来源。',
        '它只吃气泡（食物），而且靠接触、不靠吸力，所以收集得笨——这是设计给它的弱点，不是没做完。',
        '它只有两个动作：蓄力冲撞和怒气爆破，两个都花怒气。怒气从哪来只有一条路——挨打，而且得活下来。',
        '平静时它看起来就是个普通气泡（颜色也接近），差别要等它开始挨打才出现。设计有意让"受伤"成为角色本身。',
      ],
    },
    features: [
      {
        key: 'rage',
        name: '怒气',
        glyph: 'rageGauge',
        tagline: '只从"挨打但没破"来',
        facts: () => [
          { label: '范围', value: `0 ~ ${mech.angry.rage.max}` },
          { label: '每次受伤', value: `+${mech.angry.rage.perHit}（挨满上限要 ${Math.ceil(mech.angry.rage.max / mech.angry.rage.perHit)} 次）` },
          { label: '衰减', value: `安全 ${num(mech.angry.rage.decayDelaySeconds, 1)}s 后每秒 -${mech.angry.rage.decayPerSecond}` },
          {
            label: '阶段',
            value: mech.angry.appearance.map((a) => `${a.name} ≥${a.minRage}`).join(' · '),
          },
        ],
        notes: [
          '致命伤会结束这一局，没有状态可以携带怒气——所以也不存在"死了还赚怒气"这种事。',
          '挨打在这游戏里不免费：血量就是体积。所以它的武器（冲撞）的破坏力只看怒气、不看体积，否则"残血反打"会变成死循环。',
          '满怒不是终点，是一段倒计时——见「失控」那张。',
        ],
      },
      {
        key: 'charge',
        name: '蓄力冲撞',
        glyph: 'charge',
        tagline: '按住瞄准，松手撞出去',
        facts: () => [
          {
            label: '破坏力',
            value: `${num(mech.angry.charge.slamDamageBase, 1)} × (1 + ${num(mech.angry.charge.slamRageScale, 1)} × 怒气/${mech.angry.rage.max})，满怒 ${num(mech.angry.charge.slamDamageBase * (1 + mech.angry.charge.slamRageScale), 1)} 倍`,
          },
          { label: '花费', value: `撞中 -${mech.angry.charge.rageCostPerHit} · 撞碎 -${mech.angry.charge.rageCostPerBreak}` },
          { label: '猛撞窗口', value: `${num(mech.angry.charge.slamSeconds, 2)}s（这段时间内的接触才算撞）` },
          { label: '方向', value: '按住时跟随拖动/方向键，松开就锁定' },
          { label: '代价', value: '不掉血：它是玩家自己的攻击' },
        ],
        notes: [
          '破坏力只看怒气，不看体积——这是对"受伤换怒气、但受伤又让你变小"那个矛盾的正面回答：变小不会让武器失效。',
          '撞中不会停下：位移用的是一条衰减冲量，而冲量本来就不管撞到什么，所以一次冲撞可以连撞几个目标。',
          '怒气够高时它能撞碎封路木箱——那种"任何体积都撞不碎"的东西。同一道题的第三个答案，代价是怒气。',
        ],
      },
      {
        key: 'burst',
        name: '怒气爆破',
        glyph: 'rageBurst',
        tagline: '一次花光全部怒气',
        facts: () => [
          { label: '花费', value: '全部（所以它没有冷却）' },
          { label: '半径', value: `${pct(mech.angry.burst.radiusBaseRatio)} → ${pct(mech.angry.burst.radiusMaxRatio)} 泳道（随怒气变大）` },
          ...burstSplit(),
          { label: '障碍伤害', value: `${num(mech.angry.burst.obstacleDamage, 1)}（木箱 ${num(mech.obstacles.health.crate ?? 0, 1)}、渔网 ${num(mech.obstacles.health.net ?? 0, 1)} 碎；珊瑚 ${num(mech.obstacles.health.coral ?? 0, 1)}、封路木箱 ${num(mech.obstacles.health.wall ?? 0, 1)} 只掉一层皮）` },
        ],
        notes: [
          '三种处理方式对应三种东西：清掉软的、推开清不掉的、震碎脆的。哪些算哪一类写在配置里，每种危险物都必须有一行。',
          '障碍伤害刻意低于珊瑚和封路木箱：撞开木箱是冲撞的活。如果一个爆破就能开路，冲撞这个动词就没有存在理由了。',
          '没有最低怒气门槛：0 怒气时它就是一圈很小的波，没用但不撒谎——一个按下去什么都不发生的按钮读起来就是坏的。',
        ],
      },
      {
        key: 'overload',
        name: '失控',
        glyph: 'overload',
        tagline: '怒气满了就是一段倒计时',
        facts: () => [
          { label: '倒计时', value: `${num(mech.angry.overload.seconds, 1)}s` },
          { label: '期间', value: `判定 +${pct(mech.angry.overload.radiusBonus)} · 转向 ×${num(mech.angry.overload.steerFactor, 2)} · 撞击免费且破坏力 ${num(mech.angry.overload.ramDamage, 1)}` },
          { label: '释放', value: `怒气爆破，或撞碎血量 ≥ ${num(mech.angry.overload.releaseHealth, 1)} 的目标（珊瑚、封路木箱）` },
          { label: '没释放', value: `-${mech.angry.overload.punishHits} 个命中点，并清空怒气` },
        ],
        notes: [
          '"怒气既是资源，也是倒计时"：满怒不是可以放着不管的状态，是一个必须马上做点什么的时刻。',
          '失控期间撞击不花怒气：如果花，玩家可以一路撞到空槽，然后没有怒气可以释放——那个"必须释放"的状态会变成"让释放不可能"的状态。',
          '没释放的惩罚永远不会让气泡破裂（只掉到还剩 1 个命中点为止，和"消化不会杀死你"同一条护栏）：体积和怒气同时没了，代价已经够真。',
          '撞碎木箱不算释放——设计列的是"大型目标"，否则一碰布景失控就结束了，那不叫决定。',
        ],
      },
    ],
  },
  /**
   * The plain bubble: no features at all, and the card says so.
   *
   * An empty `features` list is the honest documentation of a type whose design IS the absence of mechanics. Giving it
   * a feature card would mean either inventing an ability or writing a card about nothing, and the tab's whole
   * structure says that a card is a mechanic.
   */
  plain: {
    self: {
      tagline: '一滴血，什么都不会 —— 只有一把枪',
      glyph: 'player',
      notes: [
        '血量是**恒定的 1 点**，不随体积增长：碰到任何敌人就破裂，不管已经长到多大。',
        '它也**不会长大**：吸收一个泡泡只是加分，体积和速度从头到尾不变——所以它不存在"变大变慢"这件事。',
        '它没有吸附、没有胃袋、没有喷吐与消化；捡到的技能仍然可以用（技能是关卡给的东西，不是这个气泡的能力）。',
      ],
    },
    features: [],
  },
};

/**
 * Build the bubble tab from the game's own type list.
 *
 * Throws for a type with no prose, which is the load-time half of the coverage guarantee; the test is the other half.
 */
function bubbleCards(): readonly CodexEntry[] {
  const out: CodexEntry[] = [];
  for (const type of BUBBLE_TYPES) {
    const prose = BUBBLE_PROSE[type.id];
    if (!prose) throw new Error(`codex: no prose for bubble type "${type.id}" -- add it to BUBBLE_PROSE`);
    out.push({
      id: `bubble:${type.id}`,
      category: 'bubble',
      type: type.id,
      name: type.name,
      tagline: prose.self.tagline,
      facts: typeFacts(type),
      notes: prose.self.notes,
      icon: { kind: 'glyph', glyph: prose.self.glyph },
    });
    for (const feature of prose.features) {
      out.push({
        id: `bubble:${type.id}:${feature.key}`,
        category: 'bubble',
        type: type.id,
        name: feature.name,
        tagline: feature.tagline,
        facts: feature.facts(),
        notes: feature.notes,
        icon: { kind: 'glyph', glyph: feature.glyph },
      });
    }
  }
  return out;
}


function skillEntry(id: SkillId): CodexEntry {
  const skill = SKILLS.find((s) => s.id === id);
  if (!skill) throw new Error(`codex: unknown skill ${id}`);
  const act = activationFor(id);
  const facts: CodexFact[] = [
    { label: '次数', value: `${skill.uses} 次` },
    { label: '持续', value: skill.durationSeconds > 0 ? `${num(skill.durationSeconds, 1)}s` : '瞬间' },
  ];
  if (act.ascentMultiplier) facts.push({ label: '上升', value: `×${num(act.ascentMultiplier)}` });
  if (act.vortexRadius) facts.push({ label: '半径', value: `${act.vortexRadius} m` });
  if (act.decoyRadius) facts.push({ label: '半径', value: `${act.decoyRadius} m` });
  if (act.pushRadius) facts.push({ label: '推开半径', value: `${act.pushRadius} m` });
  if (act.invulnerableSeconds) facts.push({ label: '无敌', value: `${num(act.invulnerableSeconds, 1)}s` });
  if (act.clearsSlow) facts.push({ label: '附带', value: '解除减速与抓取' });

  return {
    id: `skill:${id}`,
    category: 'skill',
    name: skill.name,
    tagline: skill.blurb,
    /**
     * `SKILLS` already carries the one-line blurb the HUD shows, and this reuses it verbatim rather than writing a
     * second description. Two descriptions of one skill is two chances to disagree, and the HUD's is the one the
     * player has already read.
     */
    facts,
    notes: SKILL_NOTES[id],
    icon: { kind: 'glyph', glyph: id },
  };
}

/** What each skill is FOR -- the thing its numbers cannot say. */
const SKILL_NOTES: Record<SkillId, readonly string[]> = {
  dash: ['最通用的一条：逃出包围、抢进度、或者单纯从一条追上来的鱼手里跑掉。'],
  decoy: ['唯一能"清场"的技能：它不是杀死鱼，而是让它们转向。', '用来换一口气，不是用来解决问题——鱼还在。'],
  vortex: ['快速变大的捷径。注意变大本身就招灾：鱼从更远处就会来追你。'],
  stink: ['专治"被拖拽"和"被减速"这两个拿走你控制权的麻烦。', '它只推垃圾与水母，所以它和诱饵泡不重复。'],
  shell: ['危机保命键：无敌并撞开一切，但不删除任何东西。', '一个会删除危险的壳会是严格更好的爆散，而爆散才是该稀缺的那个。'],
  burst: ['终局爆发的答案：以你为中心向外推开一切。', '同样是推开而不是清掉——直接删除实体，会让终局的密度变得没有意义。'],
};

function talentEntry(id: TalentId): CodexEntry {
  const talent = TALENTS.find((t) => t.id === id);
  if (!talent) throw new Error(`codex: unknown talent ${id}`);
  return {
    id: `talent:${id}`,
    category: 'talent',
    name: talent.name,
    // Reused from the talent table, so the card and the birth banner cannot say different things.
    tagline: talent.blurb,
    facts: [
      { label: '收益', value: talent.upside },
      { label: '反噬', value: talent.downside },
    ],
    notes: TALENT_NOTES[id],
    icon: { kind: 'glyph', glyph: id },
  };
}

const TALENT_NOTES: Record<TalentId, readonly string[]> = {
  'fish-fart': ['它是反射不是技能：被打到才触发，所以没法主动用。', '冷却就是它和"护盾"的区别——没有冷却的话，走进鱼群里就永远不会死。'],
  soda: [`上升 ×${num(mech.talents.soda.ascentMultiplier)}，横向操控 ×${num(mech.talents.soda.steerPenalty)}。`, '更快，也更难控——这是同一个设计里的两个方向，不是一笔好交易。'],
  silt: [`出生体积 ×${num(mech.talents.silt.startVolume, 1)}，受击缩小减免 ${pct(mech.talents.silt.shrinkResistance)}。`, '一开始就更结实，但块头大也更容易被优先锁定。'],
};

/**
 * Every card, in tab order, built FRESH on each call.
 *
 * A function rather than a module-level constant, and that is not incidental: a constant would capture the config as
 * it was when the module was first imported, so a value retuned at runtime -- which is how every test in this project
 * sets up a scenario, and what a live-tuning session does -- would leave the page describing the old game. Building
 * on demand costs a few string formats per call, and it is called when a page is drawn or a probe asks, not per
 * frame.
 */
export function codexEntries(): readonly CodexEntry[] {
  return [
    ...ENEMY_PROSE.map((e) => enemyEntry(e.kind, e.tagline, e.notes)),
    ...ENVIRONMENT,
    ...bubbleCards(),
    ...SKILLS.map((s) => skillEntry(s.id)),
    ...TALENTS.map((t) => talentEntry(t.id)),
  ];
}

/** The entries in one tab, in authored order. */
export function entriesFor(category: CodexCategory): readonly CodexEntry[] {
  return codexEntries().filter((e) => e.category === category);
}

/** How many pages a tab needs, given how many cards fit on one. */
export function pageCount(category: CodexCategory, perPage: number): number {
  return Math.max(1, Math.ceil(entriesFor(category).length / Math.max(1, perPage)));
}

/** One page of a tab, already sliced. An out-of-range page yields an empty list rather than throwing. */
export function pageEntries(category: CodexCategory, page: number, perPage: number): readonly CodexEntry[] {
  const all = entriesFor(category);
  const start = Math.max(0, page) * Math.max(1, perPage);
  return all.slice(start, start + Math.max(1, perPage));
}

/**
 * The colour an entry's icon is drawn in, where it has one of its own.
 *
 * Colour is the link between the card and the thing in the water, so this reads the same tables the drawing code
 * reads wherever one exists. The three exceptions are things that have no colour of their own yet: a collectable,
 * a skill pickup, and anything a skill or talent is illustrated with.
 */
export function iconColour(entry: CodexEntry): number {
  switch (entry.icon.kind) {
    case 'hazard':
      return KIND_TUNING[entry.icon.hazard].colour;
    case 'obstacle':
      return entry.icon.obstacle === 'crate' ? mech.obstacles.crateColor : mech.obstacles.coralColor;
    case 'glyph':
      break;
  }
  switch (entry.category) {
    case 'skill':
      return mech.codex.skillColour;
    case 'talent':
      return mech.codex.talentColour;
    case 'environment':
      // The pickup is a skill even though it lives in the environment tab, so it takes the skill colour rather than
      // the collectable one: colour is how the card and the thing in the water are matched up.
      return entry.icon.kind === 'glyph' && entry.icon.glyph === 'skillPickup'
        ? mech.codex.skillColour
        : mech.codex.collectableColour;
    default: {
      /**
       * A bubble card is coloured by ITS OWN TYPE's resting palette.
       *
       * The devour bubble starts cyan and the volatile one starts blue, which is the honest answer for both -- the
       * design says the volatile bubble looks like an ordinary bubble until it has been hit. The SHAPES carry the
       * difference; the colour deliberately does not, because the colour is a promise about what the thing in the
       * water looks like.
       */
      return entry.type === 'angry'
        ? (mech.angry.appearance[0]?.hudColor ?? mech.codex.collectableColour)
        : (mech.stages.appearance[0]?.hudColor ?? mech.codex.collectableColour);
    }
  }
}









