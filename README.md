# 气泡的伟大冒险 / The Great Bubble Adventure

一个关于「涌现」的 GameJam 项目。9:16 竖屏、手机优先、浏览器直接玩。

设计文档：`.scratch/bubble-ascent/spec.md`

## 跑起来

```bash
pnpm install
pnpm dev            # http://localhost:5173，同时暴露在局域网，手机可直接打开
```

## 命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 开发服务器（HMR，局域网可访问） |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm build` | 类型检查 + 生产构建到 `dist/` |
| `node scripts/run-tests.mjs` | **并行跑全部验证套件**，输出一张表。`--fast` 只跑快档，`motion` 之类按名字过滤 |
| `node scripts/solve-ascent.mjs` | **报告**当前关卡的时长与节奏（不反解参数），`DEPTH_TOTAL` 改动后必跑 |
| `node scripts/solve-lateral.mjs` | 核对横向标定（含"停止阈值必须小于单帧推力"的硬断言） |
| `node scripts/hazard-verbs.mjs` | 核对 4 种危险物的"动词"确实互不相同 |
| `node scripts/measure-pixels.mjs` | 解 CDP 截图读真实像素（验证布局用，见下） |
| `node scripts/mobile.mjs [url] [w] [h]` | **手机专项**：触摸模拟 + 真实触摸事件，验证尺寸/铺满/拖动/加速按钮 |
| `pwsh -File scripts/dev-server.ps1 status\|start\|stop` | 脱离会话的 dev server 管理 |
| `pwsh -File scripts/install-pwsh-path.ps1` | 重建 `pwsh` 的稳定 PATH 入口（PowerShell 升级后重跑） |

### 什么时候跑测试（约定）

> **只在用户明确要求跑回归时才跑。** 日常改代码只做 `typecheck`（顺手）和必要的针对性验证，
> 不要自作主张跑整套。

原因是时间成本：整套约 50 秒（并行 3 路），而绝大多数改动只需要其中一两个套件。
需要时用 `--fast`（约 7 秒）或按名字过滤，别习惯性跑全套。

### 测试套件的一些约定

**每个套件都要输出一行 `CHECKS: {...}` JSON。** `run-tests.mjs` 靠它判定通过与否；
**退出 0 但不输出 `CHECKS` 会被判为失败**——否则一个悄悄失效的断言会看起来像通过。

**不要用固定 `sleep` 去等游戏推进。** 单帧的模拟时间被钳在 50ms（`main.ts: frame()`），
所以**低于 20fps 时游戏时间比墙钟慢**；并行跑测试时浏览器只分到一部分 CPU，
很容易掉到 20fps 以下，让所有"睡 N 毫秒再看"的断言失效。要**轮询你真正关心的条件**。

**测游戏自己的时长（加速斜坡、无敌窗口、动画）要用 `diagnostics.gameSeconds`**，不是 `performance.now()`。
挂钟会测出帧率而不是游戏行为。

## 测量工具的坑（重要）

**不要用 `drawImage` 读画布像素。** Pixi 没开 `preserveDrawingBuffer`，WebGL 画布合成后缓冲区即被清空，
`getImageData` 会**静默返回全黑**——我因此误判"渐变没铺满"并去修一个不存在的 bug。

要读真实像素，用 `scripts/measure-pixels.mjs`：它走 CDP 截图 + 自己解 PNG。

同理，**不要用 `--dump-dom` + `--virtual-time-budget` 验证动画**：那样只跑得到个位数帧，
看起来像"世界没推进"。用 `scripts/smoke.mjs`（CDP + 真实墙钟时间）。

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
> `COLUMN_CROSSING_SECONDS`（默认 2.5s）、`BOOST_CROSSING_SECONDS`（默认 6.5s）。
> 真正的加速度由 `src/lateral.ts` **按水柱宽度运行时反解**，所以换个设备手感不变。
> 改完跑 `node scripts/solve-lateral.mjs` 可以在不开浏览器的情况下核对结果。
> 改 `ascentSpeedPeak` / `ascentCurveExponent` 后总时长会变，HUD 的 `eta` 会实时显示（目标 175 秒）。

## 结构

```
src/
  config.ts      全部手感参数 + 世界尺度（改这里就能调游戏）
  depth.ts       深度 -> 上升速度曲线，以及名义总时长积分
  input.ts       键盘 / 指针输入
  player.ts      气泡物理（纵向自动上升，横向玩家驱动）
  background.ts  相机、水体渐变、视差粒子、深度尺、HUD
  main.ts        主循环（固定 120Hz 步进）、渲染、气泡绘制
scripts/
  smoke.mjs               headless Chrome + CDP 冒烟测试
  solve-ascent.mjs        上升曲线参数求解器
  measure-pixels.mjs      CDP 截图 + PNG 解码，读真实像素
  probe-layout.mjs        视口几何与文本对象探针
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

