# 冒泡大作战 / Bubble Battle

一个关于「涌现」的 GameJam 项目。9:16 竖屏、手机优先、浏览器直接玩。

设计文档：`.scratch/bubble-ascent/spec.md`

## 改数值看这里

**所有可调的机制数值都在 [`config/mechanics.json5`](config/mechanics.json5)**，每一项都有中文说明。
改完存盘即可，页面会自动重载（Vite HMR），不需要重新构建。

格式是 **JSON5**（JSON 的超集），所以：

- `//` 行注释和 `/* */` 块注释
- 最后一项的尾逗号
- 键名不加引号
- 颜色写 `0x9fe4ff` 十六进制字面量（写 `"#9fe4ff"` 字符串也认）
- **数值写错会在浏览器控制台报错并指出是哪一项**，不会静默退回默认值——一个悄悄失效的配置
  文件比没有配置文件更糟
- 运行时的 `window.__GB.tuning` 和它是**同一个对象**，所以控制台里改和改文件是一回事

代价是 json5 解析器会进包：**主包 +33 kB（gzip +10.5 kB）**，一次性。这是"配置文件人能手工编辑"
的价格。

`src/mechanisms.ts` 负责读取与校验，`src/config.ts` 只保留**不是数值旋钮**的东西（设计分辨率、
世界投影、标定契约），因为那些改起来会牵动代码而不只是平衡。

### 触屏控制：底部摇杆

手机上是**屏幕底部居中的一个圆形摇杆**（"轮盘"）：按住圆盘上任意位置，往哪个方向推、推多远，气泡就按那个
方向和速度移动；推到底 = 全速（和按住键盘方向键完全一致），松手回中、气泡滑行一小段后停下。

配置在 `movement.wheel` 段，全部有中文说明：半径、半径上限、离底边距离、死区、静止/按住的不透明度。

**为什么不是"气泡跟着手指走"**（那是之前的做法）：跟手是把手指位置当作**目标位置**，于是
(1) 手势里的力度信息被浪费了——目标位置只能说"到那儿去"，无法表达"慢慢修正一点"，而躲一条已经贴上来的
鱼恰恰需要这个；(2) **手指必然挡住气泡**——拇指得待在目标位置上，于是玩家自己的手遮住了自己在操控的东西，
而这个游戏的核心技能就是早点看见危险。

**为什么是固定圆盘，不是"手指按下处浮出摇杆"**：浮出的摇杆单次按压更舒服，但**无法被学会**——想推"左上
偏右"的玩家没有稳定的物理参照，"上"在哪每次都不一样，每次都要用眼睛重新瞄。固定圆盘是拇指不看就能回到的
地方，这是它能在高速下可用的前提。

摇杆和键盘**共用同一个速度常量**（`movement.keyboardCrossingSeconds`），所以换设备不换手感，也不需要为
触屏单独维护一套速度数值。

### 气泡成长阶段的外观

**每个阶段一个对象**，在 `stages.appearance` 数组里，所有外观数值都在里面（含 alpha 和线宽）——
改一个阶段不用在多个平行数组之间数下标，加阶段就往数组末尾再塞一个对象。少于阶段数时最后一个会被复用。

| 键 | 管什么 |
|---|---|
| `radius` | 阶段越高气泡越大。**同时影响判定**——画多大就吃多大，两者走同一个函数 |
| `rim` / `rimAlpha` / `rimWidthRatio` | 轮廓。**色相的主要载体**，最饱和、接近不透明，余光里分辨阶段靠它。**想换颜色先改这里** |
| `glow` / `glowOuterAlpha` / `glowInnerAlpha` / `glow*RadiusRatio` | 外圈光晕。要**亮**，不要饱和——它以 1.18 倍半径压在气泡内部之上，亮度直接决定内部多亮 |
| `inner` / `innerAlpha` | 内部填充。只有 12% 不透明度，**接近白色**即可 |
| `innerRing` / `innerRingAlpha` / `innerRingWidthRatio` | 轮廓内侧的细环。**形状线索**：手机上白天看暖金和暖粉会混，一圈和两圈不会混。想让**更多阶段**靠形状区分，就把它改成"环的数量" |
| `sheen` / `sheenAlpha`、`specular` / `specularAlpha` | 内高光和镜面高光点 |
| `hudColor` | HUD 上阶段标签的颜色。要**在深色 HUD 上**看得清，和 `rim` 的背景不同，不能混用 |
| `name` | 阶段中文名 |

**内部为什么几乎透明**：五个半透明浅色层（两次光晕、填充、内高光、镜面高光）叠在一起会趋近白色，
在深色水上就是**中性灰**——阶段色相恰好在玩家最常看的地方被平均掉了。所以内部保留水的深色，
色相交给天生不透明的轮廓和光晕承担。

实测三个阶段画出半径 17.5 / 32.3 / 42.0 px，轮廓色 `#d8fbff` / `#ffcf6b` / `#ff8fbe`。

颜色两种写法都认：JSON5 十六进制字面量 `0x9fe4ff`，或取色器给的 `"#9fe4ff"` 字符串。

### 吞噬：食物链反转

**刚才还要躲开的东西，变大后可以回头一口吃掉。**

判定是**双向**的，这是它好玩的原因：

- 体积**够** → 你撞上去，它被你吃掉，你变大
- 体积**不够** → 同一只、同一次碰撞，但结果是它伤害你

所以同一只水母在关卡前半段是威胁、后半段是补给，而**分界线由玩家自己吃出来**——没有任何东西被
脚本改成"现在可以吃了"，是世界对玩家的意义变了。

配置在 `consumption` 段：

| 键 | 管什么 |
|---|---|
| `tierVolume` | **体积档位阶梯**。下标就是档位，值是进入该档所需的体积。默认 5 档（微型/小型/中型/大型/巨型） |
| `edibleAtTier` | 每种危险物从第几档开始可吃。调高 = 威胁期更长 |
| `mass` | 每种危险物吃下去值多少体积 |
| `massEfficiency` | 消化损耗。小于 1 表示吃危险物得到的比它自身轻，于是不能靠它无限膨胀 |
| `marker` | 可吞噬标记的颜色/线宽/不透明度 |

**为什么档位阶梯是独立的、而不是复用成长阶段**：成长阶段按**吸收个数**晋升，体积按每颗的大小累加，
两者不是同一个量——体积反推不出阶段。第一版就是用吸收个数当体积阈值，结果长到阶段2 的玩家体积只有
2.3、却要 13 才算"第2档"，**永远吃不到鱼**。

**标记用的是独立的一套视觉语言**：阶段色（青/金/粉）继续说"我是第几阶段"，可吞噬标记是画在危险物
**自己**身上的金色光环，说"这个是食物"。两者互不覆盖。默认只画"可吞"这一半，因为那是玩家**行动所需**
的信息；`marker.showBlocked` 打开后会额外画红色硬边表示"不可吞"。

判定规则只有一处实现（`src/consumption.ts`），**碰撞和标记问的是同一个函数**——如果两者不一致，
标记承诺是食物而碰撞给了一下伤害，那会是这个机制最糟的 bug，因为它惩罚玩家相信看到的东西。

## 跑起来

```bash
pnpm install
pnpm test:install   # 一次性：下载 Chromium（约 115 MB，只装这一个）
pnpm dev            # http://localhost:5173，同时暴露在局域网，手机可直接打开
```

## 测试

**端到端测试用 Playwright**，在 `e2e/`：

```bash
pnpm test                # 全部（phone + desktop 两个 project）
pnpm test:phone          # 只跑手机尺寸，迭代时用这个
pnpm test:ui             # 交互式：时间旅行、逐帧看、重跑单个用例
pnpm test:report         # 打开上一次的 HTML 报告
pnpm test:shots          # 只截图（不算测试，看画面用），输出在 test-results/
```

**为什么是 Playwright。** 之前 `scripts/` 里的探针每一支都靠裸 CDP 驱动浏览器：手动 spawn Chrome、
轮询 `/json/list` 拿 websocket、手写 promise 客户端、再 `Runtime.evaluate` 字符串。**每个文件重复约 130
行脚手架，而那些探针的绝大多数 bug 就住在那层脚手架里**——读了游戏已改名的字段、抄了实现而没调用它、
`until` 辅助函数返回了上一轮的采样。

Playwright 把这一切换成 `page.evaluate(() => ...)`：页面里的真函数调用、自动等待的 locator、trace 查看
器、`--ui` 模式、失败重试和失败自动截图。**脚手架成本归零，断言终于可以只关心游戏本身。**

游戏自己的测试钩子 `window.__GB` 仍然是正确的接缝——canvas 里没有 DOM 可查，水面、气泡、危险物都是
Pixi 的绘制调用，所以"气泡动了"没有诚实的 locator。钩子是**刻意的**：它暴露卷轴、玩家的屏幕比例、危险物
列表和音频图，好让测试断言**事实**而不是事实的替身。

只有两样东西走真实输入，因为那才是被测对象：**菜单的开始按钮**和**设置面板的控件**——它们由游戏自己做
命中判定，所以点歪了就是失败，而不是悄悄通过。

| spec | 覆盖 |
|---|---|
| `main-loop` | 菜单→开局；**卷轴独立于玩家**（静止和按着时分别测速率）；两轴匀速；无输入不漂移 |
| `settings-and-menu` | 齿轮暂停（断言 `scrolled` 不动，不是标志位）；滑块驱动主增益、点轨道也生效；取消/保存恢复；重开回到阶段1；退出到菜单**并停止环境音** |
| `stages` | 按配置阈值晋升；每级**实测更慢**（稳态速度 + 位移）；**画出的半径与轮廓色**逐级不同 |
| `wheel` | 摇杆：盘内才算按住、**死区内无输入**、刚出死区是小推力而非跳变、推到底=全速、方向正确、松手回中并滑行停下、**气泡不再跟手**、与技能钮多指并存 |
| `layout` | 手机铺满、宽窗封顶居中；resize 后控件仍在屏内；2560 宽下面板仍能打开 |
| `screenshots` | 只截图不断言（`pnpm test:shots`） |

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 开发服务器（HMR，局域网可访问） |
| `pnpm test` | **Playwright 端到端测试**（phone + desktop，30 个用例） |
| `pnpm test:phone` / `test:ui` / `test:report` / `test:shots` | 只跑手机 / 交互模式 / 打开报告 / 只截图 |
| `pnpm typecheck` | 应用 **和 e2e** 的类型检查 |
| `pnpm build` | 类型检查 + 生产构建到 `dist/` |
| `node scripts/verify-dist.mjs` | **验证打包产物真的能跑**（静态服务 `dist/` 于子目录下 + headless 启动） |
| `node scripts/probe-layout.mjs <url> <w> <h> <out.png>` | 截一张图并打印布局数字（**人看**，不断言） |
| `node scripts/measure-pixels.mjs` | 解截图读真实像素（验证布局/HUD 用，见下） |
| `node scripts/performance.mjs <url> <w> <h>` | 帧时百分位（软件光栅化，不能代表真机，但能测**变化**） |
| `pwsh -File scripts/dev-server.ps1 status\|start\|stop` | 脱离会话的 dev server 管理 |
| `pwsh -File scripts/install-pwsh-path.ps1` | 重建 `pwsh` 的稳定 PATH 入口（PowerShell 升级后重跑） |

`scripts/` 里剩下的都是**诊断工具，不断言任何东西**——当"为什么和预期不一样"时用它们，而不是当回归测试用。
`verify-dist.mjs` 是例外，它断言打包产物能跑，因为"构建成功"和"构建出来的东西能玩"是两件事。

## 发布流程

```bash
pnpm build                              # 类型检查 → dist/
node scripts/verify-dist.mjs            # 必做：确认打包产物能跑
```

然后打包上传：

```powershell
Compress-Archive -Path dist\* -DestinationPath release\bubble-battle.zip
```

**产物**：10 个文件 / **590 kB**（主包 gzip 后 101 kB），打成 zip **175 kB**。

`vite.config.ts` 设了 `base: './'`，所有资源都是**相对路径**，所以：

| 目标 | 做法 |
|---|---|
| itch.io | 把 `dist/` 里的**内容**（不是 `dist` 目录本身）压成 zip 上传 |
| GitHub Pages / Netlify / 自建 | 把 `dist/` 整个目录作为站点根，**放在子目录也行**（`/bubble/` 已实测） |
| 本地试跑 | 见下 |

> ⚠️ **不能用 `file://` 直接打开 `dist/index.html`。** 这是 ES module 的 CORS 限制，浏览器会拒绝加载模块，
> 页面上不会报有用的错，只是**白屏**。本地要起一个静态服务：
> `npx serve dist`、`python -m http.server -d dist`，或 `node scripts/verify-dist.mjs`（它就顺带验证了）。

**source map 默认不发。** 它们曾占产物的 2.9 MB / 3.0 MB，而浏览器只在打开 devtools 时才下载。
需要读压缩后的堆栈时，把 `vite.config.ts` 里的 `sourcemap` 临时改成 `true` 再构建。

> 这里**故意不做环境变量开关**：读环境变量要用 `process`，而本项目 tsconfig 是浏览器向的、没有 Node 类型，
> 于是 `pnpm build`（会类型检查这个 config）会**直接失败**。这个坑踩过一次。

### 关于验证（约定）

**没有回归测试套件了，2026 年删的。** 曾经有 15 个套件、并行跑约 88 秒，靠一行
`CHECKS: {...}` JSON 判定通过与否。删掉的原因是**维护成本**：玩法从"强制上升 + 只能左右"
改成"平面自由移动 + 卷轴关卡"之后，其中 5 个测的是已删除的功能，另外 4 个引用着已改名的字段。
把它们逐个修好、再让它们跟上后续每一次机制调整，花掉的时间**超过了它们挡住的 bug 的价值**。

留下的是**不花时间的工具**：`probe-layout` / `measure-pixels` / `performance` 都只输出数字或图片
给人和 agent 看，不作断言，所以既不会过期也不会拖慢任何东西。

日常验证就两条：**`pnpm typecheck`**（顺手、约 5 秒），以及**针对自己刚改的东西做一次真实测量**。
改完手感或布局后，`probe-layout` 截一张图看一眼通常比任何断言都值。

## 测量工具的坑（重要）

**不要用 `drawImage` 读画布像素。** Pixi 没开 `preserveDrawingBuffer`，WebGL 画布合成后缓冲区即被清空，
`getImageData` 会**静默返回全黑**——我因此误判"渐变没铺满"并去修一个不存在的 bug。

要读真实像素，用 `scripts/measure-pixels.mjs`：它走 CDP 截图 + 自己解 PNG。

同理，**不要用 `--dump-dom` + `--virtual-time-budget` 验证动画**：那样只跑得到个位数帧，
看起来像"世界没推进"。用 `scripts/probe-layout.mjs`（CDP + 真实墙钟时间）。

## 调手感

所有手感参数集中在 `src/config.ts` 的 `tuning`，**运行时可改**，不用重新编译：

```js
// 浏览器控制台
__GB.player                        // 实时状态（x 是水柱比例 0..1，vx 单位是"水柱宽/秒"）
__GB.game.diagnostics              // 帧数 / 用时 / 名义总时长 / 本机标定出的横向参数
__GB.lateralSnapshot               // 这台设备解出的 accel / boostSteerFactor / stopSpeed
__GB.frame()                       // 一次性打印所有尺寸（排查移动端显示问题用这个）
```

> **横向手感参数不在这里**，而在 `src/config.ts` 顶部的**手感目标**里，以"横穿时间"表达：
> `COLUMN_CROSSING_SECONDS`（默认 2.5s）、`KEYBOARD_CROSSING_SECONDS`（默认 2s）。
> 真正的速度由 `src/lateral.ts` **按泳道宽度运行时反解**，所以换个设备手感不变。
> 纵向速度是它的 `verticalSpeedScale` 倍，两个方向用同一个常量，斜向移动不会更快。
>
> **关卡节奏改 `src/levels.ts` 的 `scrollSpeed`**（默认 25 m/s），它与操作完全解耦：
> 改它只影响世界走多快、关卡多长（`scrollLength / scrollSpeed` 秒），不影响手感。

## 结构

```
src/
  levels.ts      关卡 = 一段水域 + 卷轴速度 + 一张"卷到多少米放什么"的时间表
  config.ts      全部手感参数 + 显示尺度（改这里就能调游戏）
  depth.ts       卷轴位置与节奏（时长是长度的输出，不是输入）
  viewport.ts    画布 -> 世界：泳道宽度上限、HUD 的设计缩放
  input.ts       键盘（四方向）/ 指针输入
  player.ts      气泡物理：在 SCREEN 内自由移动，位置是屏幕比例
  entities.ts    收集物 + 视差雪粒，由关卡时间表放置
  hazards.ts     4 种危险物 + 涌现在其中的三条规则
  talents.ts     3 个天赋（含反噬）
  skills.ts      6 个技能，单槽
  volume.ts      体积 = 血量，以及"大泡泡上升更快"的物理
  background.ts  相机（只由卷轴驱动）、水体渐变、视差、HUD
  audio.ts       合成音频（零素材），环境音随深度变亮
  main.ts        主循环（固定 120Hz 步进）、渲染、关卡时间表
scripts/
  verify-dist.mjs         验证打包产物（静态服务 dist/ + headless 启动）
  probe-layout.mjs        截图 + 视口几何与文本对象（人看，不断言）
  measure-pixels.mjs      CDP 截图 + PNG 解码，读真实像素
  performance.mjs         帧时百分位（软件光栅化，用于测变化）
  dev-server.ps1          脱离会话的 dev server 管理
  install-pwsh-path.ps1   重建 pwsh 的稳定 PATH 入口
```

## 注意

- `vite.config.ts` 里 `build.minify` **不能**设成 `'esbuild'`：esbuild 只是 Vite 8 的可选
  peer dependency，pnpm 默认不装，会直接导致构建失败。
- `server.watch.ignored` 排除了 `scripts/`、`.scratch/` 等目录：Windows 上 Vite 的 fs watcher
  碰到编辑器/工具产生的临时目录会抛 `EBUSY` 并**直接杀掉 dev server**。
- **用 `pwsh` 跑 `.ps1`**。Windows PowerShell 5.1 在这里的执行策略是 `Restricted`（脚本文件被禁），
  而 `pwsh` 继承 `LocalMachine = RemoteSigned`，本地脚本可直接运行。
  若 `pwsh` 找不到，见下。

## pwsh 的安装方式（本机特殊情况）

PowerShell 7 是以 MSIX 包装在
`C:\Program Files\WindowsApps\Microsoft.PowerShell_<版本>_x64__8wekyb3d8bbwe`，
而机器 PATH 里留的是**已不存在的旧版本目录**（7.6.4 装完升级到 7.6.6 后旧包被删），
所以 `pwsh` 无法解析。

两个坑：

1. **PATH 扫描会跳过 `WindowsApps` 目录本身**。把 junction 建在 `WindowsApps` 里面**没用**，
   `where pwsh` 依然找不到。
2. 直接写死带版本号的路径，**下次升级就会再坏一次**。

所以稳定入口建在 `%LOCALAPPDATA%\pwsh7`（junction，指向当前包），并加进用户 PATH。
**PowerShell 升级后重跑一次即可**（脚本自动发现最新版本目录，可重复执行）：

```powershell
pwsh -File scripts\install-pwsh-path.ps1
```

> 机器 PATH 里那条失效的 7.6.4 条目已经无害（目录不存在，只是拖慢一点点路径查找），
> 但它归 `Machine` 作用域，**需要管理员**才能清理。脚本只报告、不修改。

