# 网易云音乐｜推荐控制链路优化 · Batch 3.1 v0.3.1

PRD v0.6提交候选＋可交互本地代码原型。当前输入仅为 `finalization_input/`，旧输入已替代；产品规则保持v0.2.3批准行为。新正文与暖棕Figma参考复刻已完成本地自审和测试，仍待负责人复核。

预览：Node24下执行 `node scripts/serve-dist.mjs`，打开 http://127.0.0.1:4173/ 。源码开发与质量检查仍为 `pnpm dev` / `pnpm quality`。主页完整PRD可搜索、定位、下载MD/Word和打印；章节进入同一个原型再返回，保留草稿。显示标注可关闭，测试工具默认折叠。旧 `/overview` 仅为历史路由。

完整交接见 [HANDOFF](docs/HANDOFF.md)、[本批自审](qa/BATCH3_1_REVIEW.md)、[正文覆盖](qa/BATCH3_1_BODY_COVERAGE.md)。`artifacts/batch3-1/`含新旧文字去向、Figma对照、三状态旁注、四视口/200%与自然回执证据。另有不含内部记录的提交阅读ZIP；工程ZIP保留全部历史，不需拼接旧包。

准备/归档脚本中的一次性迁移不要重复执行；审计脚本依赖本机旧备份/上一交付清单，常规预览和构建不依赖这些路径或Python。`prepare_submission.mjs`可基于已下载本地raw重新生成同源切片，不需要远程Figma。

以下是完整历史说明，旧版本/状态以其阶段解释；顶部HANDOFF是当前交付入口。

---

# 网易云音乐｜推荐控制链路优化 · Batch 3 v0.3.0

完整 PRD 文档阅读层＋现有交互原型。文档仍为 v0.5.1；应用 v0.3.0 为负责人待复核候选，v0.2.3 已接受基线与历史全部保留。产品规则继续冻结，未开展真人或真实模型验证。

解压后使用随包 `预览已构建版本.cmd`（需 Node），或在项目根执行 `node scripts/serve-dist.mjs`。打开 `http://127.0.0.1:4173/` 阅读完整PRD；`/#/overview` 是原项目概览，`/#/demo` 为交互原型。PRD页含实际原文/图示下载与打印入口。全项目包包含构建、源码、原PRD、图示、旧截图及新候选和报告，不需要拼接旧包。

本轮完整 [HANDOFF](docs/HANDOFF.md)、[自审与证据](qa/BATCH3_REVIEW.md)、[逐节正文覆盖表](qa/BATCH3_BODY_COVERAGE.md)。从源码运行及质量检查方式沿用后文；新增Python脚本只用于本机归档审计与交付，常规预览/构建不依赖Python。`batch3-audit.py` 的历史hash复核需要本次备份及旧交付校验目录；同包已有执行结果，不是应用运行依赖。

以下为完整历史说明，旧的“待复核”状态按其阶段阅读，以顶部HANDOFF审批时间线为准。

---

# 推荐，听你调整 · Batch 2.1 收尾候选 v0.2.3

本轮修复操作绑定的撤销回执、取消AD14整页自动滚动、产品画布内就地反馈、三态保护说明和技术信息分离。见 [当前HANDOFF](docs/HANDOFF.md)、[收尾审查及自然四步截图](qa/CLOSEOUT_REVIEW.md)。原128张图保留，新64张 `closeout-candidate` 仍为负责人待复核。

以下为上一阶段说明，完整历史仍包含在项目内。

本轮在原项目内修正 V01–V06。完整交付说明见 [HANDOFF](docs/HANDOFF.md)，设计事实见 [Figma补充](docs/FIGMA_ALIGNMENT_ADDENDUM.md)，前后15组对照及剩余差异见 [视觉对齐审查](qa/FIGMA_ALIGNMENT_REVIEW.md)。原64张视觉基线保留；`batch2.1-candidate` 中新64张仅作应用回归，待负责人批准。

本地预览：`node scripts/serve-dist.mjs`，打开 `http://127.0.0.1:4173/#/demo`。白色演示导航属于作品集外壳，390×844原稿坐标只对应深色产品画布。未初始化Git、未公开发布。

个人产品概念，非网易官方项目。React + TypeScript + Vite；合成曲库、本地规则解析、无真实音频/账号/模型/遥测。

## 直接审查已构建版本

解压项目后，在项目根目录运行 `node scripts/serve-dist.mjs`，或双击 `预览已构建版本.cmd`（需要 Node）。浏览器打开 http://127.0.0.1:4173/；Demo 为 http://127.0.0.1:4173/#/demo。此服务器只监听本地回环，不是公开部署。完成后 Ctrl+C 关闭。

`dist/` 在交付 ZIP 中附带；不承诺双击 index.html 运行模块应用。

## 从源码运行

本次验证 Node 24.19.0、pnpm 11.19.0；完整依赖版本锁定在 `pnpm-lock.yaml`。请使用稳定 Node 24 与 pnpm 11。

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
.\npm.cmd run dev
```

Windows 随包 `npm.cmd` 只转发到项目依赖内 npm CLI；已配置系统 npm 的环境可直接使用 `npm run …`。其他系统可用 `pnpm run …` 或 `node node_modules/npm/bin/npm-cli.js run …`。

```text
npm run lint
npm run typecheck
npm run generate:types
npm run check:generated
npm run test
npm run test:e2e
npm run test:visual
npm run quality
npm run build
```

`quality` 串联输入哈希/运行时边界、lint、类型、生成漂移、单元、端到端（含 axe）、视觉比较、执行摘要与构建。视觉基线固定为 Windows / Chromium 151 / 系统字体；其他 OS 的像素差异必须审查，不能直接把新基线当通过。

性能：先运行生产预览服务器，然后 `npm run audit:perf`。只得到本地 Lighthouse 导航实验室值，不代表真实用户 INP 或 field Core Web Vitals。

## 三条审查路径

1. Demo 1：调整推荐 → 本次想听 → 探索 + 民谣 → 完成 → 仅本次确认 → 查看推荐队列 → 撤销。
2. Demo 2：播放器 `•••` → 少推当前音乐人 → 确认 → 撤销。对象绑定打开时快照，少推仍可能出现。
3. Demo 3：影响范围 → 开启临时保护 → 确认 → 新建歌单来源播放 → Product Notes 推进4小时 → 仍保护 → 继续/关闭。

AI 实验：输入 → 结构/字典/权限/冲突校验 → 可编辑候选 → 采用到草稿 → 最终确认。输入只在内存，不写 URL、存储或导出日志；范围/保护建议要手动选择。R07 可在 Product Notes 独立关闭。

Product Notes 提供保存失败、刷新失败、旧响应、版本冲突、撤销冲突、候选不足、空池及时间推进；调试工具不是正式产品规则。实际队列永远保留黑名单强约束。

## 代码与事实源

- `src/domain/model.ts`：字段级覆盖、事务、排序、撤销、会话与事件分片。
- `src/domain/ai.ts`：有限词法规则、AJV 2020、候选采用、关闭的真实适配器。
- `src/Demo.tsx`：播放器、弹层、候选与本地调试入口。
- `src/Portfolio.tsx`：快读/深读、风险与实验边界，决策读取同一 JSON。
- `specs/`、`data/`、`design/`、`.agents/skills/`：原输入哈希保持；不把 fixture 的历史 not_run 直接改成通过。
- `scripts/generate.mjs`：从 canonical JSON Schema 和 tokens 生成类型/CSS，禁止手改生成输出。
- `MANIFEST.json` 是启动包历史清单；本次交付与运行证据见 handback，不能用旧清单判断应用未实现。

## 交付索引

- 完整 handback：`docs/HANDOFF.md`
- 构建报告：`docs/BATCH2_BUILD_REPORT.md`
- 验收与逐例关联：`qa/TEST_RESULTS.md`、`artifacts/reports/acceptance-executed.json`
- 视觉/无障碍/性能：`qa/VISUAL_REVIEW.md`、`qa/ACCESSIBILITY_REVIEW.md`、`qa/PERFORMANCE_REVIEW.md`
- 关键图：`artifacts/screenshots/case-home-1440.png`、`case-home-390.png`、`demo-player-390.png`、`sheet-root-default-390.png`、`impact-longterm-on-390.png`、`temporary-review-required-390.png`、`ai-ready-390.png`
- 全状态截图：`artifacts/screenshots/`；基线：`tests/visual/screens.spec.ts-snapshots/`

## 已知边界

仅同一标签页刷新恢复合成状态，不模拟账号/设备同步。需要本地浏览器存储；不可用时退回内存并提示。真实用户需求、模型泛化、线上因果效果、平台服务接入、真人读屏、触屏设备软键盘与 Safari/Firefox 尚未验证。

包内研究为批准时的来源快照，公开发布前需要再次复核。旧 Figma/PRD 参考图仅供本地审查；应用不打包真实品牌封面。未经本轮授权的真实 AI、付费、账号、公开部署与远端推送均未执行。
