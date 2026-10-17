# 减少操作键：删三张卡、删技能系统

## 1. 这句话

**玩家的操作键要变少，能被动呈现的就被动呈现。** 这一轮做两件事：删掉三张纯手感/纯容错的卡（转向、
升速、受击无敌），以及拆掉整个技能系统——五个技能、它们模块、按钮、以及一个早就死掉的充能动词。

---

## 2. 为什么

不是因为它们弱。是因为**其中两张根本没在做任何事**，而这一点是查证之后才知道的（见第 3 节）。
在一张卡、一个按钮、一个天赋都可能是惰性的前提下，"减少操作键"的第一步不是删掉有用的东西，
而是**先把不生效的东西认出来**。

方向本身是 owner 定的：操作键越少越好，尽量被动化。

---

## 3. 现状（查证过，五条和最初的判断不一样）

| 事实 | |
|---|---|
| **`ascentBonus` 有三个写入者、零个读取者** | 「升速 +10%」写它，`rollTalent` 写它，`debugSetTalent` 写它；`grep` 全仓库，唯一的读者是暂停面板 `growthView`。这张卡改的是一个没人读的读数 |
| **`steerScale` 只活在键盘路径上** | 它进 `Player.update` 里那一个 `steer` 乘积，而这个乘积只乘键盘的横向/纵向速度。拖拽路径是 `sensitivity × (penaltiesApply ? steer × slow : 1)`，而 `movement.drag.penaltiesApply` 出厂就是 `false`。配置注释写明了理由：**距离不能被缩放，否则"气泡严格跟着手指走"就不成立**。所以触屏下「转向」也是惰性的 |
| **天赋 `汽水泡` 在触屏下一直是纯赚的** | 它只有两个字段，正是上面那两个。它的"更难控"代价从来没生效过，所以对真实玩家它一直是纯赚——删它只是把代码改成它实际的样子 |
| **那个"技能按钮"同时是吸取键和充能键** | `chargeButton` 从它复制，按下时 `has('suction')` 就置 `suctionHeld`、`has('charge')` 就 `setChargeHeld`，而 `drawSkillButton` 画的力场环就是吸取的表现。四个 e2e 正是用它去按吸取 |
| **充能动词整套是死的** | `input.charging` 和 `consumeChargeRelease` 在 `src/` 里**没有任何消费者**。`Space` 写着 `chargeKeyHeld`，喂给 `charging`，没人读。触摸那条臂还有第二个独立原因不可达：没有任何形态的 `controls` 里有 `'charge'`。BOIL 的注释早就写了"the charge went" |
| **`stink` 是唯一能解除减速、挣脱垃圾袋的来源** | `slowRemaining = 0` + `h.gripping = false`，全仓库只有 `skills.ts` 这么做过 |
| **`controls` 表不完整** | 没有任何形态列出过 `spit` / `compress` / `burst`，而按钮的绘制是 `if (this.has('spit'))`——所以**吐弹和消化在触屏上从来没有被画出来过**，只有键盘 K / L 能用 |

---

## 4. 决策

### 4.1 删三张卡

转向、升速、受击无敌全删，连带 `TalentEffects` 的两个字段、`resolveTalent` 的两条分支、诊断面板里
报告的那两项、暂停面板的两行。

分工很清楚：`ascentBonus` **没有任何读者**所以删得毫无代价；`steerScale` 还有键盘路径和天赋在写，
但既然它的唯一新写入者是 `汽水泡`、而 `汽水泡` 在触屏下是空的，它整体出局。第三张「受击无敌」是
真的在工作（加宽受击后的闪烁），删它是因为一个"只让玩家更难被打中"的卡不构成构筑选择——它和另外
两张是同一个决定。

### 4.2 删天赋 `汽水泡`

它的全部内容就是那两个不再被读的字段。留着一个抽得到但什么也不做的天赋，比没有这个天赋更糟：它
占掉天赋抽取的一个位。

配置块、`TALENTS` 里那一行、codex 的文本、图鉴图标、以及 `SEEDS`（出生名，一个天赋一个）一起走。

两个 e2e 原本拿它当**中立天赋**（注释明说"a neutral talent"，因为 `fish-fart` 会改变接触行为），
现在改钉 `淤泥` 并写明为什么它对这两个断言安全：它改体积和防御，而两个 spec 都自己把 `player.volume`
钉住，而"接触被记了一次"和防御把伤害减到多少无关。

### 4.3 拆掉整个技能系统

按 owner 的选择，不是"只从池子里删卡"，也不是照 codex 的先例留着代码不加载，是**整个拆掉**：
`src/skills.ts`、卡模板、`run.skill` / `skillActivations` / `grantSkill`、`runEvents` 的 `skillSlot`、
`Player` 的三个技能字段、输入层的 `KEYS.skill` / `pressSkill` / `consumeSkill`、HUD 的技能行、
诊断与快照的字段、`growthView` 的技能组、codex 的技能分类与条目、五个技能音效、
`scripts/probe-skills.mjs`。

### 4.4 按钮整个删掉，吸取机制留着

那个按钮删掉之后，**devour 的吸取在触屏上没有输入了**——`suctionHeld` 全球只有一个写入者，就是它。
owner 看过这一点之后的决定是：按钮照删，吸取以后单独设计，先留占位。

所以 `src/suction.ts`、`suctionUp`、`input.sucking` 全部保留，并在 `input.suctionHeld` 上留一条注释
写清楚：**没有任何东西再写它**，这是决定不是遗漏，这里是替代输入将来落地的位置。

### 4.5 删掉充能动词

它整套没有读者，所以删它不改变任何行为。范围：`KEYS.charge`、`chargeKeyHeld`、`chargeTouchHeld`、
`chargeReleased`、`charging`、`pressChargeRelease`、`consumeChargeRelease`、`setChargeHeld`、
`Input.update` 里的充能块、清输入时的充能行、`ControlId` 的 `'charge'`、`hasVerb` 的 `'charge'`。

`spit` 和 `compress` **不动**——它们是另外两个动词，不在这次决定里。

### 4.6 接受：减速和垃圾袋从此无解

`stink` 删掉之后，水母的减速和垃圾袋的缠抱没有任何解法。**接受**，记在这里：要找回那个出口，需要
一个新的被动机制（而不是再给一个按钮），这是另一次设计决定。

---

## 5. 动过的东西

| 位置 | 变化 |
|---|---|
| `mutation.pool` | 删 `steerPerPick`、`ascentPerPick`、`invulnSecondsPerPick` |
| `talents` | 删整个 `soda` 块 |
| 技能 | 删 `skills` 配置块、`mech.skills` 类型与校验规则、五个 `skill.*` 音效 ID 与配方、`SKILL_SOUNDS`、`codex.skillColour` |
| `ControlId` | 删 `'skill'`、`'charge'`；`spit`/`compress`/`burst` 保留（见 3、6） |
| `controls` | base / boil → `[]`；devour → `['suction']` |
| `touch.ts` | 删按钮与其按下分支、槽位预留；`layout()` 现在只排 spit/burst 与 compress 两档 |
| e2e | 删 `suction.spec.ts` 整个文件、`drag.spec.ts` 两个测试、吸取截图、codex 技能页；其余随符号改名 |

---

## 6. 提交

1. **`35055f0` 删三张卡**（连带死字段与 `汽水泡`）
2. **`a36b7d0` 拆技能系统 + 按钮 + 充能**

分开是因为第二个体量是第一个的十倍（删掉一个模块、一处 UI、一次输入重构），单独回退才有意义。

---

## 7. 顺带查出来的既有问题（都不是这次改的）

- **`scripts/probe-mutation-pool.mjs`** 引用早就不存在的 `routeCardPending` —— 已按决定删除。
- **`scripts/probe-growth.mjs`** 在 HEAD 上就是**失败**的：它向 `mutationCard` 要 `route:devour`，而
  路径卡从选择器取代分支节点起就不再是池卡。这次把那段不可达的代码删掉，探针恢复通过。
- **`e2e/spawns.spec.ts`** 期待一句已经被改写的拒绝文案 —— 一并对齐。
- **`e2e/routes.spec.ts`** 还在等一个"分支节点"给出 `route:barrage`，而分支节点早已删除，所以那个测试
  不可能通过。**未动。**
- **`growthView` 的 `route:` 分支** 现在不可达（没有东西再往 `Run.picks` 里写 `route:`）。**未动。**
- **`CodexGlyph`** 还留着一个没人指派的 `charge` 字形（外加三个同类）。**未动。**
- **`Input.dragAimX` / `dragAimY`** 在 `src/` 里失去了最后一个消费者。**未动。**

---

## 8. 留给 owner 的

**手玩时会看到的**：

- **触屏上现在一个按钮都没有了。** 操作就是拖动。
- **devour 的吸取按不出来**（见 4.4）。
- **水母的减速和垃圾袋的缠咬没有办法解除**（见 4.6）。
- 暂停面板少两行（转向、升速），天赋只剩两个。

**下一轮该处理的**（都写在第 7 节）：`controls` 表不完整导致 **吐弹和消化在触屏上从来没有按钮** ——
这和吸取键是同一类问题，是"减少操作键"这个方向真正要回答的问题：这两个动词是也给一个键，
还是也改成被动？另外**成长阶段的移动惩罚 `stageSpeedMultiplier` 和吞噬的 `suctionMoveFactor`
也只作用于键盘**（同一个 `steer` 乘积），也就是说触屏下吞噬路线宣称的"越大越难躲"是不存在的。
