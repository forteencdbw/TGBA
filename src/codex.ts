import { mech } from './mechanisms';
import { KIND_TUNING, type HazardKind } from './hazards';
import { OBSTACLE_NAMES } from './obstacles';
import { SKILLS, activationFor, type SkillId } from './skills';
import { TALENTS, type TalentId } from './talents';
import { BASE_TYPE, formForRoute, ROUTES, type ControlId, type Route, type RouteId } from './bubbleTypes';

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
  { id: 'bubble', label: '气泡与路线' },
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
  | 'stages'
  | 'collectable'
  | 'boil'
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
  type?: 'base' | RouteId;
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
      '吞得动它的时候贴脸吃下，体积、分数与突变经验立即到账——吞是即时的，没有库存，也没有为你暂停的引信。',
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
      '**两条路都会电到你**：吞下去（每 2.4 秒一下，节奏固定），或者被它射出来的电箭打中（一下 0.5 秒，取决于你躲不躲得开）。所以它开火时身上那片电弧不只是动画，那是你要付的代价。',
      '它游一条明显的 S 形——这是"可以提前读出来"的全部依据。',
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
   * THE GUNNERS. Four cards, one idea each: the archer is the one you can shoot back at, the pistol shrimp
   * is the one you respect, the puffer is the one you time, and the starfish is the one you read.
   */
  {
    kind: 'archer',
    tagline: '射水鱼：会开枪的日常款——打得跑',
    notes: [
      '它是**电鳗的对照**：电鳗打不死（0 血），它是几发就跑（3 血）——"会开枪的东西也可以被赶走"是它的第一课。',
      '慢节奏、中速直线弹，第一发永远瞄的是**开火那一刻的你**，之后不再修正，所以看得懂也躲得开。',
      '随水流漂着下坠，一路扫过你的泳道：它不追你，它的弹幕替它追。',
    ],
  },
  {
    kind: 'pistol',
    tagline: '手枪虾：一发电化弹，半管血',
    notes: [
      '**全表最快、最大、最重的一发**：约 2.6 倍弹径，命中一次扣 **2 个命中点**——这一发不是被打一下，是被打两下。',
      '射速极慢（约 3 秒一发）：稀疏、快、狠，看到它抬螯就该挪了。',
      '10 点血的精英，值得你花火力——但它的弹比你的快，隔着泳道对射是它赢。',
    ],
  },
  {
    kind: 'puffer',
    tagline: '刺魨：打它一下，吃它一圈刺',
    notes: [
      '它**从不主动开火**——它的刺什么时候出，取决于你什么时候打它：每受一次击，向四周炸一圈 9 根刺。',
      '反击有 **1.2 秒冷却**（冷却期间它瘪下去、刺也暗了）：打一发、吃一圈、在窗口里再打——射击它是**节奏**，不是反射。',
      '6 点血：硬，但不是硬到不值得。贴太近打它，刺圈几乎必中；隔着一个刺圈的宽度打，它就只是个会还嘴的肉靶。',
    ],
  },
  {
    kind: 'starfish',
    tagline: '海星：不瞄人的旋转星形弹幕',
    notes: [
      '每轮 5 向齐射、每轮整体转 36°（两轮补满整星）——**它的五条臂就是下一轮的方向**，站在臂与臂的缝里就永远有活路。',
      '它不瞄人：弹幕是固定角度的星形，所以"读它"替代了"躲它"——站着不动是死，一直动就永远有缝。',
      '每 2.5 秒一轮，4 点血：读懂它的人几发就能让它闭嘴。',
    ],
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
  /**
   * LEVEL 4's four predators, and they share one tagline idea: nothing here is a second behaviour, everything is a
   * SIZE. Their cards are therefore written about what each size costs the player rather than about what each one
   * does, because what they do is identical.
   */
  {
    kind: 'dolphin',
    tagline: '海豚：四个猎食者里唯一可以吃的那一个',
    notes: [
      '**只有 3 点血，和一条小鱼一样薄**，第 3 档就能吞下去——所以它不是威胁，是这一关先发给你的一次胜利。',
      '它也是四个里最快的（前摇 0.55 秒、冷却 1.8 秒）：追得紧，但追上了也不致命。',
      '一关全是啃不动的东西，玩家记住的就只有"躲"。它是这一关的第一课：**这里的东西可以很大，而大的也可以是食物**。',
    ],
  },
  {
    kind: 'octopus',
    tagline: '章鱼：这一关最懒的那个猎食者',
    notes: [
      '前摇 0.9 秒、冷却 2.6 秒，是四个里最容易看穿的——**它的作用是让另外三个显得快**。',
      '体型和大白鲨一样（radius 0.07），但它是软体：怒火爆发推得动它、清不掉，喷出去的分量也按软体算。',
      '它是唯一"可以忽略一会儿"的东西——而"哪个可以忽略"本身也是这一关要你做的判断。',
    ],
  },
  {
    kind: 'shark',
    tagline: '大白鲨：前摇 0.6 秒、冲刺 0.4 秒，这一关的招牌',
    notes: [
      '它是四个里最"已经决定了"的那个：从摆架势到撞上来只有 1 秒。**这 1 秒就是它全部的公平性。**',
      '6 点血、第 4 档才吞得下——遇到它就得先决定是打还是绕，因为它不给你第三个选项。',
      '它排在 900m 才登场：到那时玩家已经见过鱼群、也被温跃层逼着换过高度，知道"大"在这个游戏里是什么意思了。',
    ],
  },
  {
    kind: 'whale',
    tagline: '座头鲸：全场最大、最厚、也最慢的一个',
    notes: [
      '**8 点血、画出来 154px 宽**，是游戏里最大的东西。但它前摇 1.1 秒——大到这个程度，慢就是它给你的礼貌。',
      '它一次只来一只。屏幕被占住就是它的机制，所以它放在收尾段：刚躲完一串快的东西，慢的才最压人。',
      '第 4 档才吞得下，而吃下去值 0.6 质量——全场最重的一口。',
    ],
  },
];

function enemyEntry(kind: HazardKind, tagline: string, notes: readonly string[]): CodexEntry {
  const tier = mech.consumption.edibleAtTier[kind] ?? 0;
  const mass = mech.consumption.mass[kind] ?? 0;
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
  whale: '座头鲸',
  dolphin: '海豚',
  shark: '大白鲨',
  octopus: '章鱼',
  jelly: '水母',
  trash: '垃圾袋',
  crab: '螃蟹',
  bombfish: '炸弹鱼',
  urchin: '海胆',
  eel: '电鳗',
  boss: 'BOSS',
  vent: '热液喷口',
  mineral: '矿物颗粒',
  shrimp: '盲眼虾',
  angler: '灯笼鱼',
  torpedo: '失控鱼雷',
  zapper: '电击水母',
  foam: '碎浪泡沫',
  rain: '雨滴冲击',
  archer: '射水鱼',
  pistol: '手枪虾',
  puffer: '刺魨',
  starfish: '海星',
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
    ],
    notes: [
      '够大就一头穿过去：这是大体积的奖励。',
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
    ],
    notes: [
      '珊瑚硬得多，所以它逼你变小或走缝，而木箱奖励你变大。两种答案放在一起，选择才是真的。',
      '每一排都保证留出"玩家最小时也能通过"的缺口——这不是体贴，而是让"变小"成为选择而不是必需。',
    ],
    icon: { kind: 'obstacle', obstacle: 'coral' },
  },
  {
    id: 'env:mutation',
    category: 'environment',
    name: '突变',
    tagline: '攒满突变值，冻结三选一',
    facts: [
      {
        label: '来源',
        value: `随时间 ${num(mech.mutation.autoPerSecond, 1)}/秒  ·  打跑/吞噬 ${mech.mutation.gain.drivenOff}  ·  子弹擦边 ${mech.mutation.gain.bulletGraze}  ·  贴脸 ${mech.mutation.gain.pointBlank}  ·  拆弹 ${mech.mutation.gain.defuse}  ·  擦边 ${mech.mutation.gain.graze}  ·  BOSS ${mech.mutation.gain.boss}`,
      },
      { label: '首级', value: `${mech.mutation.first} 点，每级 ×${mech.mutation.growth}` },
      { label: '持续', value: '跨关保留，死亡清零' },
    ],
    notes: [
      '擦边是**过点判定**：冲锋的怪不再朝你过来、又还在接触半径 2 倍的圈内才算——冲着脸来的全程不判，躲开它、它擦身而过的那一帧到账。',
      '碰到过你的冲锋永不判擦边（挨过一下的冲锋什么也不欠你）；一次冲锋只算一次。',
      '擦边的瞬间整个世界慢放半秒——后怕节拍：怪已经过去了，世界慢下来让你看清刚才发生了什么。',
      '三条小技巧同构：子弹擦边（电鳗的闪电擦身、小字「擦」）、贴脸（接触圈内枪毙、小字「贴脸」）、拆弹（爆炸半径外打死炸弹鱼、小字「拆弹」）——都不慢动作。',
      '三种来源刻意拉开速率：挂机最慢、战斗居中、玩命最快——想快，就把脸凑过去。',
      '枪管、射速和技能都在这里出：地图上不再有任何可拾取的道具，一切成长都走突变。',
    ],
    icon: { kind: 'glyph', glyph: 'stages' },
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
 * The base bubble's own card: what every run starts as, before any route is picked.
 *
 * One card and no feature cards -- the base has no signature mechanics beyond what the whole game shares
 * (growth, the gun), and a card about nothing would be the flat-array mistake again.
 */
const BASE_PROSE: { tagline: string; glyph: CodexGlyph; notes: readonly string[] } = {
  tagline: '每局的开局形态：枪、成长、你的操作',
  glyph: 'player',
  notes: [
    '它有技能钮（技能是突变给的道具，不是气泡的能力）、有枪、会因吸收而成长，体积就是血量——这是所有形态共享的地基。',
    '它没有吸附、不能吞危险物、没有怒气：这些是路线的事，而路线是第一次升级时的三选一，在水里选。',
    '血量按体积算：一次受击固定扣一点，吃得越多越能挨，也越难躲——"要不要继续吃"从第一颗泡泡起就是真取舍。',
  ],
};

/**
 * The route cards' prose. The FACTS beside each are derived from the running config by `routeFacts` below --
 * the same numbers the game uses, so the page cannot describe a route the game no longer has.
 */
const ROUTE_PROSE: Record<RouteId, { glyph: CodexGlyph; notes: readonly string[] }> = {
  devour: {
    glyph: 'suction',
    notes: [
      '选它的那一刻：吸附按钮出现（技能钮的按住形态），贴脸碰到吞得动的危险物直接吃下——体积、分数、突变经验立即到账，外加短暂无敌。',
      '吸附只负责拉近，不负责吃：把吃不了的螃蟹吸过来，等于加速把危险物拉到脸上。两重代价合起来，"什么时候按住"才是决定。',
      '专属卡：吸取范围、吞噬无敌、大胃口（比体积说的话多吃一档）。本局另外两条路线的卡永不再出。',
    ],
  },
  boil: {
    glyph: 'boil',
    notes: [
      '选它的那一刻：怒气槽出现（空槽起步），蓄力冲撞与爆破按钮到位，配色换成怒气阶段——气泡的颜色从此在说"我有多烫"。',
      '怒气只从"挨打但没破"来；冲撞的破坏力只看怒气不看体积，所以残血反打是可行的。满怒不是终点，是一段倒计时（失控）。',
      '专属卡：怒气积攒、爆破半径、余温（怒气衰减更慢）。本局另外两条路线的卡永不再出。',
    ],
  },
  barrage: {
    glyph: 'stages',
    notes: [
      '选它的那一刻：枪管 +1 立刻到账。没有新按钮——这条路线的动词就是基础气泡已有的那把枪，只是更深。',
      '专属卡：弹速、大弹丸（判定和画面同一个数）、射程。它们只在这条路线的池里出现。',
      '通用枪卡（枪管/射速/伤害）人人可抽：枪是每个形态的基础武器，这条路线赢在把它堆得更狠。',
    ],
  },
};

/**
 * A route card's facts, all derived from the running config.
 *
 * The verbs come from the form the route produces (`formForRoute`), the economy from the block that owns it --
 * consumption for eating, angry for rage, bullets for the gun -- and the route's own cards from the mutation
 * pool's per-pick amounts. Nothing is authored twice.
 */
function routeFacts(route: Route): readonly CodexFact[] {
  const form = formForRoute(route);
  const facts: CodexFact[] = [{ label: '按钮', value: form.controls.map((c) => CONTROL_LABELS[c]).join(' · ') }];
  const pool = mech.mutation.pool;
  if (route.id === 'devour') {
    facts.push(
      { label: '可吞档位', value: `体积档位 ≥ ${mech.consumption.edibleAtTier.fish} 起能吃鱼；大胃口每张 +1 档` },
      { label: '吃下到账', value: `质量 ×${num(mech.consumption.massEfficiency)} · 无敌 ${num(mech.consumption.eatInvulnerableSeconds, 2)}s` },
      { label: '专属卡', value: `吸取范围 +${Math.round(pool.suctionPerPick * 100)}% · 吞噬无敌 +${num(pool.eatInvulnSecondsPerPick, 1)}s · 大胃口 +${pool.appetiteTiersPerPick} 档` },
    );
  } else if (route.id === 'boil') {
    facts.push(
      { label: '怒气', value: `受伤 +${mech.angry.rage.perHit} · 安全 ${num(mech.angry.rage.decayDelaySeconds, 1)}s 后每秒 -${mech.angry.rage.decayPerSecond}` },
      { label: '失控', value: `满怒 ${num(mech.angry.overload.seconds, 1)}s 倒计时，不放掉扣 ${mech.angry.overload.punishHits} 点但不破` },
      { label: '专属卡', value: `怒气积攒 +${Math.round(pool.ragePerPick * 100)}% · 爆破半径 +${Math.round(pool.burstRadiusPerPick * 100)}% · 余温 -${Math.round(pool.rageDecayReductionPerPick * 100)}% 衰减` },
    );
  } else {
    facts.push(
      { label: '立刻到账', value: `枪管 +1（上限 ${mech.bullets.maxStreams} 排）` },
      { label: '专属卡', value: `弹速 +${Math.round(pool.bulletSpeedPerPick * 100)}% · 大弹丸 +${Math.round(pool.bulletRadiusPerPick * 100)}% · 射程 +${Math.round(pool.bulletRangePerPick * 100)}%` },
      { label: '通用枪卡', value: '枪管 / 射速 / 伤害：所有形态都能抽到' },
    );
  }
  return facts;
}

/**
 * The base bubble's own facts: what it has, and the numbers of being a bubble at all.
 *
 * Derived rather than authored -- which buttons, whether contact is a meal -- for the same reason the old
 * per-type facts were: a fact that is copied can describe the wrong game, a fact that is read cannot.
 */
function baseFacts(): readonly CodexFact[] {
  return [
    { label: '按钮', value: BASE_TYPE.controls.map((c) => CONTROL_LABELS[c]).join(' · ') },
    { label: '吞噬', value: '没有：碰到敌人不会被吞掉，而是挨打——吃是路线的事' },
    { label: '颜色', value: `随成长阶段：${mech.stages.appearance.map((a) => a.name).join(' → ')}` },
    { label: '成长', value: `吸收 ${mech.stages.absorbToStage2} / ${mech.stages.absorbToStage3} 颗晋升 · 速度 ${mech.stages.speedMultiplier.map((m) => `×${num(m)}`).join(' → ')}` },
    { label: '开局体积', value: num(mech.volume.start, 1) },
    { label: '上限', value: num(mech.volume.max, 1) },
    { label: '一次受击', value: `-${num(mech.volume.hitCost, 1)}（固定值，与当前体积无关）` },
    { label: '无敌时间', value: `${num(mech.hazards.invulnerableSeconds, 1)}s` },
  ];
}

/**
 * Build the bubble tab from the game's own form list: the base bubble, then every route.
 *
 * Throws for a route with no prose, which is the load-time half of the coverage guarantee; the test is the other
 * half. Every fact on a route's card is derived from the running config by `routeFacts`.
 */
function bubbleCards(): readonly CodexEntry[] {
  const out: CodexEntry[] = [
    {
      id: `bubble:${BASE_TYPE.id}`,
      category: 'bubble',
      type: BASE_TYPE.id,
      name: BASE_TYPE.name,
      tagline: BASE_PROSE.tagline,
      facts: baseFacts(),
      notes: BASE_PROSE.notes,
      icon: { kind: 'glyph', glyph: BASE_PROSE.glyph },
    },
  ];
  for (const route of ROUTES) {
    const prose = ROUTE_PROSE[route.id];
    if (!prose) throw new Error(`codex: no prose for route "${route.id}" -- add it to ROUTE_PROSE`);
    out.push({
      id: `bubble:${route.id}`,
      category: 'bubble',
      type: route.id,
      name: `路线 · ${route.name}`,
      tagline: `${route.title}——${route.blurb}`,
      facts: routeFacts(route),
      notes: prose.notes,
      icon: { kind: 'glyph', glyph: prose.glyph },
    });
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
      return mech.codex.collectableColour;
    default: {
      /**
       * A bubble card is coloured by ITS OWN FORM's resting palette.
       *
       * The boil route starts blue, which is the honest answer -- the design says it looks like an ordinary
       * bubble until it has been hit. The SHAPES carry the difference; the colour deliberately does not, because
       * the colour is a promise about what the thing in the water looks like.
       */
      return entry.type === 'boil'
        ? (mech.angry.appearance[0]?.hudColor ?? mech.codex.collectableColour)
        : (mech.stages.appearance[0]?.hudColor ?? mech.codex.collectableColour);
    }
  }
}

