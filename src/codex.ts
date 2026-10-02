import { mech } from './mechanisms';
import { KIND_TUNING, stomachEffect, blastRadiusFraction, type HazardKind } from './hazards';
import { OBSTACLE_NAMES } from './obstacles';
import { spitImpact } from './spit';
import { SKILLS, activationFor, type SkillId } from './skills';
import { TALENTS, talentTuning, type TalentId } from './talents';

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
    tagline: '减速，扭动可以缩短',
    notes: ['惩罚是关于"气泡在哪"的，所以减速画在气泡身上，不在状态栏里。', '它优先追最大的气泡——强者先被针对。'],
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
    tagline: '吃下去就是一颗手雷，代价是引信',
    notes: [
      '在胃袋里从吞下那一刻开始倒计时，到点在里面炸开：扣血，而且它那份质量一起炸掉、不产出任何等级。',
      '吐出去是范围击退——这是"值得吃"的那一半理由。',
      '轮廓上的标记会在引信快到时开始闪，那是它唯一的预警。',
    ],
  },
  {
    kind: 'urchin',
    tagline: '吃下去就一直放血，直到它离开',
    notes: [
      '它的账单按时间算，所以带着它压缩是最糟的选择：压缩期间受伤翻倍。',
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
];

function enemyEntry(kind: HazardKind, tagline: string, notes: readonly string[]): CodexEntry {
  const tier = mech.consumption.edibleAtTier[kind] ?? 0;
  const mass = mech.consumption.mass[kind] ?? 0;
  const impact = spitImpact(kind);
  const blast = blastRadiusFraction(kind);
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
  jelly: '水母',
  trash: '垃圾袋',
  crab: '螃蟹',
  bombfish: '炸弹鱼',
  urchin: '海胆',
  eel: '电鳗',
  rot: '腐败物',
  oil: '油污',
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

/** The bubble itself, and the four verbs it has. */
const BUBBLE: readonly CodexEntry[] = [
  {
    id: 'bubble:self',
    category: 'bubble',
    name: '气泡',
    tagline: '体积就是血量，也是判定框',
    facts: [
      { label: '开局体积', value: num(mech.volume.start, 1) },
      { label: '上限', value: num(mech.volume.max, 1) },
      { label: '一次受击', value: `-${num(mech.volume.hitCost, 1)}（固定值，与当前体积无关）` },
      { label: '无敌时间', value: `${num(mech.hazards.invulnerableSeconds, 1)}s` },
    ],
    notes: [
      '受击固定扣一个命中点，所以能挨几下随体积增长——这是变大的收益；而变大的代价是更大的判定框。',
      '用"按当前体积比例扣血"试过：大泡泡能挨 13 下、小的 8 下，变大反而更容易，和设计相反。',
    ],
    icon: { kind: 'glyph', glyph: 'player' },
  },
  {
    id: 'bubble:stages',
    category: 'bubble',
    name: '成长阶段',
    tagline: '吃得越多，越难躲',
    facts: [
      { label: '晋升', value: `吸收 ${mech.stages.absorbToStage2} / ${mech.stages.absorbToStage3} 颗` },
      { label: '速度', value: mech.stages.speedMultiplier.map((m) => `×${num(m)}`).join(' → ') },
      { label: '外观', value: mech.stages.appearance.map((a) => a.name).join(' → ') },
    ],
    notes: [
      '阶段是速度档位，不是视觉大小：大小由体积连续决定，所以"刚升到阶段2"和"阶段2 又吃了五颗"看不出区别，颜色才能回答"我在第几阶段"。',
      '这是整个设计的核心张力：吃得越多，越难躲，所以"要不要继续吃"是真取舍。',
    ],
    icon: { kind: 'glyph', glyph: 'stages' },
  },
  {
    id: 'bubble:suction',
    category: 'bubble',
    name: '吸附',
    tagline: '按住产生吸力，代价是几乎躲不开',
    facts: [
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
    icon: { kind: 'glyph', glyph: 'suction' },
  },
  {
    id: 'bubble:spit',
    category: 'bubble',
    name: '喷吐',
    tagline: '吞下的东西就是弹药',
    facts: [
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
    icon: { kind: 'glyph', glyph: 'spit' },
  },
  {
    id: 'bubble:compress',
    category: 'bubble',
    name: '消化压缩',
    tagline: '把库存转成可吞等级，代价是变脆',
    facts: [
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
    icon: { kind: 'glyph', glyph: 'compress' },
  },
];

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
  soda: [`上升 ×${num(talentTuning.sodaAscentMultiplier)}，横向操控 ×${num(talentTuning.sodaSteerPenalty)}。`, '更快，也更难控——这是同一个设计里的两个方向，不是一笔好交易。'],
  silt: [`出生体积 ×${num(talentTuning.siltStartVolume, 1)}，受击缩小减免 ${pct(talentTuning.siltShrinkResistance)}。`, '一开始就更结实，但块头大也更容易被优先锁定。'],
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
    ...BUBBLE,
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
    default:
      // The bubble's own cards take the first stage's colours, so the tab reads as one family.
      return mech.stages.appearance[0]?.hudColor ?? mech.codex.collectableColour;
  }
}
