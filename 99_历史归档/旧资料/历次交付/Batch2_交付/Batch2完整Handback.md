# Batch 2 本地 Beta handback

日期：2026-09-05。版本：0.2.1。状态：本地实施、自审修复、最终质量链路完成，提交负责人集中审查。以下为当前交付；文末保留的启动记录属于历史快照。

## 工作目录 / Git / 运行

工作目录：`F:\html\网易云优化项目_Batch2_启动包_v1.1`。用户所写分层路径未存在，采用实际附件目录。Git未初始化，无checkpoint commit、无远端、无push。

审查已构建版：项目根目录运行 `node scripts/serve-dist.mjs` 或双击 `预览已构建版本.cmd`，打开 http://127.0.0.1:4173/；Demo为 http://127.0.0.1:4173/#/demo。只监听本地回环。

源码复现：Node24、pnpm11，`pnpm install --frozen-lockfile` → `pnpm exec playwright install chromium` → `pnpm run dev`。完整检查 `pnpm run quality`；Windows也可用 `npm.cmd run quality`。性能在生产预览启动后运行 `pnpm run audit:perf`。视觉基线为Windows/Chromium151/系统字体，跨平台须审查差异。

## 完成

- 案例页快读与深读、T02/T04/T07与T01–T08同一JSON来源、证据边界/四风险/实验健康Gate、可操作播放器预览。
- R03：三入口草稿、子页保留/根取消、软少推、只读黑名单、默认仅本次、长期差异二次确认、事务幂等/冲突、保存和刷新分离、撤销。
- R04：影响范围与临时保护正交，四组合、30分钟闲置/4小时提醒且继续保护、显式喜欢保留、关闭不补回、来源切换及可控时间。
- R07：本地词典规则模拟、结构/语义/权限校验、可编辑候选、采用只到草稿、手动范围/保护、失败/歧义/不支持/取消与过期处理，真实适配器禁用。
- 合成排序、解释分数、故障调试、本地事件导出、同标签页恢复及命名空间重置。
- 源码、pnpm锁文件、原事实源、生成类型/token、测试、dist、76张截图（含64核心状态、对照/拼图/专项）、QA及完整报告。

## 测试

| 项目 | 最终结果 |
|---|---|
| 输入哈希与运行时边界 | PASS |
| lint / typecheck / generated drift | 全部PASS |
| unit / contract | 87/87 PASS，含40 AI例、6非法输出、4排序fixture |
| AC01–AC34 | 34/34 PASS，逐条对应真实执行测试名 |
| e2e | 23/23 PASS |
| axe | PASS，包含在23项e2e内的2项多状态审查 |
| visual | 4/4视口测试，64张比较PASS |
| build | PASS，最终dist已附带 |
| 生产离线smoke | PASS，无页面错误与外部请求 |
| 200%字体专项 | 320/390操作完成PASS；非真人设备测试 |
| performance | 最终本地Lighthouse97，LCP1.65s、CLS0、TBT154.5ms；INP未测 |

证据：`artifacts/reports/quality-final.log`、`unit.json`、`e2e.json`、`visual.json`、`acceptance-executed.json`、`lighthouse.html`。完整说明见 `qa/TEST_RESULTS.md`、`VISUAL_REVIEW.md`、`ACCESSIBILITY_REVIEW.md`、`PERFORMANCE_REVIEW.md`、`PRODUCT_REVIEW.md` 与 `docs/BATCH2_BUILD_REPORT.md`。

自动检查未发现可检测问题，不等同于完整WCAG合规或真人读屏测试。40本地AI合成例通过不等于真实模型准确率；Lighthouse不是field结果。

## 关键截图

均在 `artifacts/screenshots/`：

- `case-home-1440.png`、`case-home-390.png`：作品集首屏。
- `demo-player-390.png`、`sheet-root-default-390.png`：播放器与推荐控制。
- `want-explore-folk-390.png`：主动调整。
- `impact-longterm-on-390.png`、`temporary-review-required-390.png`：范围/保护与到期保持保护。
- `saved-refresh-failed-390.png`、`negative-artist-applied-390.png`：刷新失败与即时少推。
- `ai-ready-390.png`、`ai-needs-clarification-390.png`、`ai-unsupported-390.png`：AI三个结果态。
- `decisions-quick-320.png`、`decisions-deep-1440.png`：方案取舍。
- `review-contact-320.png` /390/768/1440：全部状态拼图；完整列表见 `qa/SCREENSHOT_INDEX.md`。

## 自审后修复

- 焦点可能离开弹层 → 显式首尾循环、Esc和返回焦点测试。
- 200%网格溢出、平板中文窄列 → 最小列宽修复、纵向布局与滚动表单。
- ARIA进度/主地标缺失 → 语义修复后axe通过。
- AI模拟说明会滚出视野 → 固定说明区域。
- 路由滚动继承导致截图定位错误 → 截图入口滚回顶部，重建并独立比较。
- 开保护前长时间暂停被算成保护闲置 → 按保护开启时间重新界定闲置起点，增加回归；撤销恢复原提醒周期。
- 预览无压缩导致LCP超参考预算 → 增加静态gzip，最终1.65s。

视觉自评89/100，无已观察到的未解决P0/P1。320及200%下长内容需滚动，按钮可能换行，操作可到达；由Codex审查，仍需负责人视觉判断。

## 未完成 / 未授权

真实AI、真实账号/API、音频、付费、外部遥测、公开部署、远端写入均未执行。真人任务研究、读屏与物理手机软键盘、Safari/Firefox、线上实验与field性能未运行。依赖缓存不随ZIP提供；源码复现首次安装需要下载依赖，但已构建版仅需Node即可本地预览。研究内容沿用输入快照，公开前需复核时效。保留的旧参考资产用于本地审查，应用仅使用合成素材。

## 需要负责人集中审查

1. 产品语义、失败/撤销/保护提示与PRD一致性。
2. 作品集视觉、叙事密度、方案取舍表达。
3. 代码结构、测试覆盖与R07是否保留公开版。
4. 是否进入真人测试及独立发布审查。

---

## 历史：Batch 2 启动门 Handoff（保留原记录，不代表当前未实施）

日期：2026-09-05。状态：**EXT-01 至 EXT-11 已批准；方案取舍与面试深挖材料已补齐；可立即进入 Batch 2 本地 HTML Beta。**

## 当前交付

- 保留 Batch 1 的 PRD、HTML 规格、产品/AI/实现契约、Schema、fixtures、设计 Token 与 Figma 参考图。
- 新增行业研究审批文档、来源登记、变更记录和机器可读审批开关。
- 新增面向招聘者与面试官的双层作品集叙事。
- 新增 Codex 一次性 Master Prompt，以及产品、视觉、构建、AI Eval 四套项目 Skill。
- 新增方案 A/B/C 决策记录、未采用/延后边界、选择代价与反转条件；HTML 快速层显示 3 项，深读层显示完整 8 项。
- 新增面试深挖指南，明确设计方案比较不等于真实 A/B 对照实验。
- 公开演示路径改用 Demo 1/2/3 命名，避免与方案 A/B/C 和 A/B 对照实验混淆。
- 重要叙事修正：Spotify 2026 Taste Profile 与网易云 Melo/Muse Mix 已说明自然语言音乐推荐进入实际产品/生产研究，本项目 R07 因此定位为“自然语言推荐控制助手”，不宣称行业首创，也不复制完整歌单 Agent。

## 本轮明确未做

- 尚未创建 React/TypeScript/Vite 应用代码。
- 未调用真实模型或读取 API Key。
- 未使用真实网易云账号、歌曲、封面、音频或个人数据。
- 未执行真人可用性测试、线上 A/B 测试或远端遥测。
- 未部署网站、未创建远端仓库、未 push。
- 外部论文、公司数字和竞品能力没有被写成本项目效果。

## 质量状态

- 审批版 DOCX 共 11 页，已使用标准渲染工具导出并逐页人工检查；无裁切、重叠、溢出或异常分页。
- JSON/JSONL、用例数量、EXT 编号、关键文件引用与包内路径已静态检查。
- 详细结果见 `qa/BATCH2_PACKAGE_VALIDATION.md` 与 `qa/BATCH2_DOCX_LAYOUT_REVIEW.md`。
- `MANIFEST.json` 是本启动包当前文件快照；后续 Codex 修改后必须重建。

## 下一步

启动条件已满足。将 v1.1 包放入独立目录交给 Codex，并粘贴根目录 `BATCH2_CODEX_MASTER_PROMPT.md` 全文。Codex 一次性完成本地 Beta、测试、截图、自审修复和集中 handback；普通实现细节不再逐项请求审批。

仍不授权真实 AI、公开部署、远端 push、真实账号/素材或远端遥测。
