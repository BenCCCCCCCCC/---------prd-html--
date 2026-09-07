# BATCH 2｜Codex 一次性实施指令 — 本地 HTML Beta v1.1

> 适用范围：网易云音乐推荐控制作品集，Batch 2 本地 Beta。
> 执行方式：将整个启动包放在一个独立工作目录，把本文件全文交给 Codex。
> 授权边界：发送本指令代表项目负责人批准 `specs/research-decisions.json` 中 EXT-01 至 EXT-11 的推荐方案；**不代表授权真实 AI、真实网易云账号、远端推送、公开部署、付费服务或外部遥测。**

---

## 0. 任务目标

在当前目录完成一个可运行、可测试、可截图审查的中文作品集本地 Beta。它既要让招聘者快速理解产品判断，也要让面试官深入检查推荐控制、AI 权限、异常、数据和验证逻辑。

本批必须一次性完成：

1. React + TypeScript + Vite 应用；
2. `/` 作品集案例页；
3. `/demo` 交互 Demo；
4. R03 推荐控制、R04 临时收听、R07 本地规则模拟；
5. 合成曲库与可解释排序；
6. 关键正常、逆向、边界与失败状态；
7. 单元、契约、端到端、可访问性与视觉快照测试；
8. 截图、构建报告、自审修复和集中 handback。

不要为普通实现问题向用户逐条提问。先读事实源，做合理、保守且可追踪的实现决定，完成自审后再集中报告。只有以下情况才允许暂停并升级：

- 需要改变核心产品权限、R03/R04 生命周期或“显式意图 > 隐式行为”的语义；
- 需要真实账户、真实 API、付费、外网写入、部署或远端仓库权限；
- 权威文件存在无法同时满足的直接冲突，且没有保守解释可以维持安全边界。

即使某一非核心项受环境限制，也要继续完成其余范围，并把该项标为 `NOT_RUN` 或 `BLOCKED`，不能把未执行写成通过。

---

## 1. 开始前的强制预检

### 1.1 阅读顺序

按下列顺序读取，不要只看本提示：

1. `00_START_HERE.md`
2. `AGENTS.md`
3. `docs/PRD_v0.5.1.md`
4. `docs/HTML_SPEC.md`
5. `docs/IMPLEMENTATION_CONTRACT.md`
6. `docs/AI_CONTRACT.md`
7. `docs/RESEARCH_ADDENDUM.md`
8. `docs/TRADEOFFS_AND_REJECTED_ALTERNATIVES.md`
9. `docs/INTERVIEW_DEEP_DIVE_GUIDE.md`
10. `docs/PORTFOLIO_STORY_ARCHITECTURE.md`
11. `docs/VISUAL_EXECUTION_BRIEF.md`
12. `docs/TEST_PLAN.md`
13. `specs/product-config.json`
14. `specs/design-tokens.json`
15. `specs/tags.json`
16. `specs/intent-request.schema.json`
17. `specs/intent.schema.json`
18. `specs/events.spec.json`
19. `specs/research-decisions.json`
20. `specs/portfolio-decisions.json`
21. `data/*`
22. `.agents/skills/netease-product-review/SKILL.md`
23. `.agents/skills/netease-visual-qa/SKILL.md`
24. `.agents/skills/netease-build-verify/SKILL.md`
25. `.agents/skills/netease-ai-eval/SKILL.md`

### 1.2 建立预检记录

创建 `docs/BATCH2_BUILD_PLAN.md`，只记录：

- 当前目录、Node/npm 版本；
- 是否已有 Git 仓库；
- 准备使用的稳定依赖版本；
- 权威文件读取结果；
- 关键实现模块；
- 预计测试命令；
- 任何环境限制。

此记录不需要用户先批准。完成后继续实施。

### 1.3 目录与 Git

- 不覆盖包内已有文档、spec、data、design 和 skill。
- 应用代码放在当前根目录的 `src/`、`public/`、`tests/`、`scripts/`，配置文件也放根目录。
- 若当前目录不是 Git 仓库，可以初始化本地 Git；禁止添加远端、禁止 push、禁止创建公开仓库。
- 创建 `.gitignore`，排除 `node_modules`、`dist`、测试临时文件、浏览器缓存、Lighthouse 原始缓存及任何 `.env*`，但保留 `.env.example`（不得含密钥）。
- 最终只有在全部必需测试通过后才允许创建本地 checkpoint commit；若未提交，必须明确说明。

---

## 2. 技术栈与工程约束

### 2.1 技术栈

使用当前环境可安装的**稳定版本**，不要使用 prerelease：

- React
- TypeScript，开启严格模式
- Vite
- React Router；为了静态站点后续兼容，优先使用 Hash Router，路由仍定义为 `/` 与 `/demo`
- Vitest + Testing Library
- Playwright
- `@axe-core/playwright`
- AJV 2020 用于 JSON Schema 运行时校验
- ESLint；不强制引入 Prettier，格式必须统一

避免：

- Next.js、服务端框架、数据库、真实后端；
- 大型 UI 库、CSS-in-JS 重型运行时；
- 远程字体、远程图标、远程图片、分析 SDK；
- 需要登录或联网才能完成核心流程的依赖。

图标使用本地内联 SVG。样式使用 CSS Modules、普通 CSS 或分层 CSS，保持简单可查。所有颜色、尺寸、运动参数从 `specs/design-tokens.json` 同步到代码中的唯一 token 层，不在各组件随意写常量。

### 2.2 建议目录

```text
src/
  app/
  pages/
  features/
    portfolio/
    recommendation-control/
    temporary-listening/
    ai-preview/
    product-notes/
  domain/
    preferences/
    session/
    ranking/
    operations/
    ai/
  data/
  components/
  styles/
  generated/
  test-utils/
public/
tests/
  e2e/
  visual/
scripts/
artifacts/
  screenshots/
  reports/
```

可微调目录，但不得把产品规则散落在页面组件里。

### 2.3 事实源与漂移检查

- `specs/product-config.json`：产品与演示参数唯一来源。
- `specs/design-tokens.json`：视觉参数唯一来源。
- `specs/intent.schema.json`：AI candidate 的结构唯一来源。
- `specs/tags.json`：标签字典唯一来源。
- `data/demo_catalog.json`：虚构曲库唯一来源。

实现脚本：

1. 从 `specs/intent.schema.json` 生成 TypeScript 类型到 `src/generated/intent-schema.d.ts` 或等价文件；
2. `npm run generate:types` 可重建；
3. `npm run check:generated` 在生成后检查 Git diff 或内容哈希，发现漂移即失败；
4. JSON Schema、TypeScript 类型与运行时 AJV 校验不能分别手写三份。

---

## 3. 公开案例页 `/`

严格按 `docs/PORTFOLIO_STORY_ARCHITECTURE.md` 和 `docs/VISUAL_EXECUTION_BRIEF.md` 实现，不做营销模板。

### 3.1 首屏

必须在 1440×900 和 390×844 首屏中清楚出现：

- 项目类型：`AI Product / Recommendation Control / Concept Prototype`
- 主标题：`推荐可以懂你，也应该听你调整`
- 一句话：让用户说明“这次想听什么、不要什么、影响多久”，且可以修正和撤销
- 角色：个人产品概念、产品策略、交互与 AI 边界设计
- 真实状态：无真实问卷原始数据、未接真实账号/模型、没有上线业务结果
- CTA：`体验 3 分钟 Demo`、`查看产品决策`
- 一个真实可操作的设备预览，不使用夸张 3D 手机模型

### 3.2 快速扫描层

必须包含：

1. 证据状态条：FACT / INFERENCE / HYPOTHESIS / SIMULATION；
2. 三个关键决策；
3. 当前验证状态：规格通过、代码测试结果、真人测试未完成；
4. Demo 路径入口；
5. 明确的非官方声明。

不能使用假增长卡、假准确率或假“用户喜爱度”。

### 3.3 深读层

实现可扫读的内容结构，而不是整篇论文：

- 背景与证据边界；
- 用户分析：频率、强度、熟练度、意图、情境分轴；
- 现象 → 机制 → 决策；
- 当时课程竞品结论与 2026 行业复核分开标注；
- R03/R04 核心规则；
- R07 AI 实验；
- 四类产品风险；
- 方案 A/B/C、未采用/延后、选择代价与反转条件；
- 数据、实验健康 Gate 与验收；
- 已完成 / 未证明 / 下一步。

### 3.4 最新行业内容的准确表达

必须纳入但保持克制：

- Spotify Taste Profile Beta：在已开放地区，文字表达偏好已进入当前产品实验，R07 不可宣传为行业首创；
- Spotify Taste Profile 排除：对象与播放上下文需要分别定义；
- Apple Use Listening History：证明临时隔离思路有行业可行性，但不能证明网易云用户需求；
- NetEase Cloud Music 2026 `Melo / Muse Mix` 研究：说明自然语言音乐推荐已经进入生产实践；本项目差异是**控制层与权限预览**，不是替用户生成完整歌单；
- NetEase 2026 H1 公开信息只能作为成熟业务背景，不得拿来证明本方案会提高收入或留存。

来源在 `docs/RESEARCH_SOURCE_REGISTER.md`。页面正文使用短引用标签，不复制长段落。

---

### 3.5 方案取舍（必须实现）

- 从 `specs/portfolio-decisions.json` 读取，不在组件复制内容。
- 快速层默认显示 T02/T04/T07；深读层显示 T01–T08。
- 每项先显示采用方案，再显示判断标准、至少一个代价和验证/反转条件。
- A/C 选项标记为 `未采用` 或 `延后`，二者不可混用。
- 桌面可以横向比较；320px 手机必须改为纵向卡片/折叠，不压缩成不可读三列表。
- 产品设计比较称为“方案 A/B/C”；实验章节称为“A/B 对照实验”。禁止写“通过 A/B 测试选择了方案 B”。
- 不使用虚构精确评分、假 ROI、假用户投票或假实验结果。


## 4. 交互 Demo `/demo`

### 4.1 总体结构

- 真正的 Demo 页面不再套第二层手机壳；在桌面上可居中显示 390px 产品视口及右侧 Product Notes，在手机上全屏。
- 顶部提供 `返回案例`、Demo 1/2/3/AI 切换和 `重置演示`。
- 默认进入 Demo 1 的初始播放器。
- 播放器是模拟界面：播放/暂停改变本地状态，不产生声音；清楚显示“交互模拟”。
- 所有音乐、音乐人、标签、封面来自合成数据或本地生成，不使用真实封面、Logo 或音频。

### 4.2 R03 根面板

根 Bottom Sheet 只回答三件事：

- 本次想听
- 不想听
- 影响范围

必须实现草稿与已提交状态：

- 子页返回/完成只回根面板并保留草稿；
- 根取消或下滑关闭放弃未提交修改；
- 没有有效 dirty field 时确认禁用；
- 默认写入范围为 `session`，不因长期偏好已有值改变；
- 提交后显示具体结果、revision 与撤销；
- 下滑不是唯一关闭方式，始终保留可见取消/关闭。

### 4.3 “本次想听”

- 熟悉 / 平衡 / 探索单选；
- 正向标签最多 3 个；
- 空集合与 `null` 语义按契约区分；
- 同标签正向与旧/新少推冲突时，不得自动删掉负向项，展示冲突解决；
- 实现 Demo 1｜主动调整：探索 + 民谣 + 仅本次。

### 4.4 “不想听”

- 首版支持对当前歌曲、音乐人、风格的**软性少推**；
- 文案明确“仍可能出现”；
- 黑名单只读展示现有示例，文案明确“强屏蔽”；不得伪造可编辑的真实黑名单服务；
- 实现 Demo 2｜即时负反馈：少推当前音乐人 → 应用 → 撤销。

### 4.5 影响范围与临时收听

必须让用户理解两个控制是正交的：

- `仅本次 / 长期偏好` 控制显式设置写到哪里；
- `本次听歌不影响长期推荐` 控制普通播放/播放时长/普通跳过是否进入长期学习。

实现四种组合，并有清楚摘要。长期保存当前本轮差异时，必须二次列出差异并确认，不能仅切换 radio 就写入长期。

临时保护状态：

- `off`
- `active`
- `review_required`

到 30 分钟闲置或 4 小时上限时进入 `review_required`，**继续保护**，直到用户明确“继续 4 小时”或“关闭”。在 Demo 中提供可控时间推进器，不依赖真实等待。

保护状态在播放器、推荐页/队列和迷你播放器位置至少有两处可见提示。关闭只影响之后的事件，不补回已经隔离的片段。

实现 Demo 3｜临时收听：开启临时保护 → 切换到歌单来源 → 推进到提醒 → 结束保护。

### 4.6 两阶段提交、幂等与失败状态

按 `docs/IMPLEMENTATION_CONTRACT.md` 实现：

- operationId、baseRevision、dirtyFields、beforePatch；
- 同 operation 重试幂等；
- 版本冲突保留草稿，不 last-write-wins；
- 偏好应用成功与推荐刷新是两阶段；
- 旧 requestId/revision 的晚到刷新结果不能覆盖新状态；
- “设置已保存，推荐尚未刷新”必须有独立状态；
- 撤销只反向恢复本次相关字段，字段后来变更时提示冲突。

在 Product Notes 中提供“模拟失败场景”入口，至少可触发：

1. 保存失败；
2. 保存成功、刷新失败；
3. 旧响应晚到；
4. 版本冲突；
5. 撤销冲突；
6. 标签不足/结果为空后的保守回退。

### 4.7 排序与可解释变化

使用 `specs/product-config.json` 固定公式和 `data/ranking_fixtures.json`：

- 先过滤不可播放与预置黑名单；
- 按正向命中、novelty、少推惩罚计算；
- 相同分按 trackId 升序；
- 列表长度按配置；
- 不能加入随机打散或自行调权重。

应用前后列表要有可见、可解释差异。Product Notes 可显示每首歌的分数组成，但标明“演示公式，不是网易云真实算法”。

---

## 5. R07｜AI 建议草稿（实验）

### 5.1 核心定位

R07 不能成为首屏主角，也不能冒充真实 AI。标题固定：

- `AI 建议草稿（实验）`
- 副说明：`本地规则模拟 · 不调用真实模型`

它的任务是把自然语言转成**可编辑候选**，不是直接生成推荐、写长期画像或调用账户工具。

### 5.2 链路

```text
输入
→ 本地解析
→ 结构/字典/冲突/权限校验
→ 展示识别与未识别内容
→ 用户编辑候选
→ 采用到 R03 草稿
→ 用户最终确认
→ 既有产品执行层写入
```

### 5.3 状态

实现并视觉区分：

- idle
- parsing
- ready
- needs_clarification
- unsupported
- error
- cancelled / stale response（可在测试或调试面板呈现）

不展示数值置信度。使用“已识别 / 需要确认 / 暂不支持 / 出错”。

### 5.4 本地解析器

- 以 `specs/tags.json` 为字典；
- 支持明确否定、熟悉/平衡/探索、有限范围建议、临时保护建议、明确清空；
- 无上下文的“这个歌手”不得猜；
- 未知标签不得偷偷映射成相似项；
- 超过 200 Unicode code points 或空输入在解析前拒绝，不静默截断；
- scope/isolation 只作为建议，不自动修改；
- ready 至少包含真实字段修改或范围/保护建议；
- needs_clarification/unsupported 不显示“采用”。

### 5.5 Melo 研究带来的实现约束

不要复制生产系统，也不要使用其结果数字宣传本项目。仅吸收以下可迁移原则：

- 自由循环 Agent 不用于本地 Beta；使用固定、可追踪步骤；
- 实体/标签必须先在本地曲库和字典中 grounding；
- 结果为空或约束过紧时，不能静默丢弃用户核心条件；
- 任何放宽条件都要在预览中告诉用户；
- 失败原因和下一步必须显式，而不是返回看似合理的流行结果。

### 5.6 未来真实适配器

本批只建立接口和 disabled stub：

- `LocalRuleAdapter` 可运行；
- `RealProviderAdapter` 明确 disabled；
- 不安装官方 API SDK也可以，除非纯类型接口需要；
- 不读取或要求任何 API Key；
- 不发网络请求；
- `.env.example` 只写说明，不写可用 key 或浏览器变量；
- UI 不出现“连接真实模型”可点击按钮。

---

## 6. 视觉实施

### 6.1 方向

严格使用：

`editorial product case study` / `quiet neutral shell` / `single red accent` / `record-centered dark player` / `dense but breathable` / `evidence-led` / `state clarity`

这些词不能替代具体 Token。禁止蓝紫 AI 渐变、玻璃拟态、发光球、满屏胶囊、假数据卡、自动轮播、背景视频和夸张 3D 手机。

### 6.2 Figma 与参考图

- `design/reference/*` 与 `design/FRAME_MAPPING.md` 是基线；
- 保留唱片、唱臂、暗色播放器、黑色 Bottom Sheet、单一红色主操作的识别；
- 不复制真实品牌资产；
- 不重新设计与需求无关的整套播放器；
- 不以固定 y 坐标硬编码所有视口。

### 6.3 响应式与页面密度

至少覆盖：

- 320×740
- 390×844
- 768×1024
- 1440×900

桌面案例页最大宽 1120px；移动边距 16px；设备 Demo 在桌面不超过约 430px。中文不应出现异常窄列、拥挤、孤行或横向溢出。

### 6.4 无障碍

- Bottom Sheet 使用原生 `<dialog>` 或行为等价、经测试的实现；
- 打开后焦点进入；Tab/Shift+Tab 保持在弹层；Esc 可关闭；关闭后回到触发器；背景 inert；
- 可见焦点样式；
- 关键目标至少 44×44，这是本项目目标，不声称是 WCAG 统一最低值；
- 所有拖动/滑动都有按钮替代；
- 支持 `prefers-reduced-motion`；
- 320px 和 200% 缩放无关键信息丢失。

---

## 7. 埋点模拟与实验说明

### 7.1 本地事件日志

根据 `specs/events.spec.json` 建立内存/本地调试日志，只在 Product Notes 中查看和导出 JSON；不发送到任何远端。

必须记录：

- 事件名、schemaVersion、sessionId、operationId/requestId（适用时）；
- source、state/revision、scope、保护状态；
- 失败原因和 stale/undo 结果；
- 不保存 R07 原始文本到持久存储。

### 7.2 作品集中的实验健康 Gate

案例页需清楚说明：

1. 埋点完整性与时间戳；
2. 分桶/曝光与随机化；
3. SRM 检查先于效果读取；
4. A/A 或最小链路验证；
5. 分层使用实验前特征；
6. OEC、诊断、Guardrail 与数据质量并列；
7. 每个灰度 ring 有 pass/hold/rollback。

不写固定“每组十万”，不编造 p 值、提升阈值或已完成实验。

---

## 8. 测试与质量门槛

### 8.1 必须提供的脚本

至少：

```text
npm run dev
npm run lint
npm run typecheck
npm run generate:types
npm run check:generated
npm run test
npm run test:e2e
npm run test:visual
npm run build
npm run quality
```

`npm run quality` 必须串联所有不依赖人工检查的必需 Gate。若 Lighthouse 单独运行，提供 `npm run audit:perf`。

### 8.2 单元/契约测试

至少覆盖：

- `data/acceptance_cases.json` 34 条；
- `data/ranking_fixtures.json` 4 组；
- `data/ai_eval_cases.jsonl` 40 条；
- `data/invalid_output_fixtures.json` 6 条；
- null/empty 语义；
- dirtyFields、默认 scope、长期提升确认；
- 冲突检查；
- operation 幂等与 stale response；
- 撤销冲突；
- 保护时间片和 review_required；
- Schema generated type drift。

不要通过硬编码 case id 返回预期结果。规则必须对等价输入起作用。

### 8.3 端到端测试

至少实现：

- Demo 1、2、3 与 AI 实验 ready；
- R07 needs_clarification、unsupported；
- 根取消丢草稿、子页返回保留草稿；
- 长期提升的显式 diff 确认；
- 保存成功刷新失败；
- 旧响应不覆盖；
- 撤销与撤销冲突；
- 键盘打开/导航/关闭/focus return；
- 320px 无横向滚动；
- 页面刷新恢复同标签页合成状态；
- 重置只清理项目 namespace。

### 8.4 自动无障碍测试

使用 `@axe-core/playwright` 检查关键页面和状态。报告必须写：

> 自动检查未发现可检测问题（若通过），不等同于完整 WCAG 合规或真人读屏测试。

另外人工检查键盘、焦点、200% 缩放、320px、reduced motion，并记录在 `qa/ACCESSIBILITY_REVIEW.md`。

### 8.5 视觉快照

生成 `docs/VISUAL_EXECUTION_BRIEF.md` 中全部截图，路径：

`artifacts/screenshots/`

同一 OS、浏览器、字体、时间和合成 seed。先生成基线，再逐张自审。不能因为测试“像素一致”就认为设计合理。

自审流程：

1. 读取 `.agents/skills/netease-visual-qa/SKILL.md`；
2. 对每张图检查层级、留白、裁切、状态、触控和品牌边界；
3. 建立 `qa/VISUAL_REVIEW.md`，记录 P0/P1/P2；
4. 发现 P0/P1 必须修复；
5. 重跑受影响截图和测试；
6. 视觉评分必须 ≥85/100，且无 P0/P1，才能交回。

### 8.6 性能

- 核心流程不依赖外网；
- 图片定尺寸，无布局跳动；
- 不加载远程字体或自动媒体；
- 可尝试本地 Lighthouse；
- 参考预算：LCP 2.5s、INP 200ms、CLS 0.1；
- 只能报告本地实验室运行，不得写成真实用户 75 分位 field 结果。

---

## 9. 自我审核与修复循环

首次实现完成后，不要立刻回交。至少执行两轮：

### Round 1｜功能与契约

- `npm run quality`
- 操作全部主流程
- 检查数据/规则/状态一致性
- 修复失败

### Round 2｜视觉与内容

- 生成全部截图
- 按 visual QA skill 审查
- 按 product review skill 检查事实、假设、权限和文案
- 修复 P0/P1 与明显 P2
- 重跑 `npm run quality` 和受影响截图

如果两轮后仍有失败，继续修复，直到通过或确有环境阻断。不得把明显问题留给用户逐条指出。

---

## 10. 最终交付文件

新增或更新：

- `README.md`：项目说明、运行、测试、边界、截图索引；
- `docs/BATCH2_BUILD_PLAN.md`；
- `docs/BATCH2_BUILD_REPORT.md`；
- `docs/ASSUMPTIONS.md`；
- `docs/HANDOFF.md`；
- `qa/TEST_RESULTS.md`；
- `qa/VISUAL_REVIEW.md`；
- `qa/ACCESSIBILITY_REVIEW.md`；
- `qa/PERFORMANCE_REVIEW.md`；
- `artifacts/screenshots/*`；
- 应用源码、测试和 lockfile。

`docs/BATCH2_BUILD_REPORT.md` 至少列出：

- 实现范围；
- 使用的依赖版本；
- EXT-01 至 EXT-11 如何落地；
- 通过/失败/未运行的测试；
- 视觉问题与修复；
- 性能测试环境；
- 已知限制；
- 未授权事项仍未执行；
- 下批建议。

---

## 11. 方案取舍专项 Gate

回交前必须证明：

1. T02/T04/T07 快速卡与 T01–T08 深读内容均来自同一 JSON；
2. 每项有采用、未采用/延后、代价、验证或反转条件；
3. 320/390/1440 截图无不可读三列表；
4. 页面没有把设计比较说成真实 A/B 实验；
5. `data/acceptance_cases.json` 的 AC31–AC34 已执行并报告；
6. 若修改任何决策文案，需同步更新 JSON、规格和截图，不得只改 UI。

---

## 12. 最终 handback 格式

最终回复只给集中结果，不要复制全部日志。格式：

```text
Batch 2 本地 Beta handback

工作目录：
Git 状态 / checkpoint：
运行命令：

完成：
- ...

测试：
- lint：PASS/FAIL/NOT_RUN
- typecheck：...
- unit/contract：...
- e2e：...
- axe：...
- visual：...
- build：...
- performance：...

关键截图：
- path

自审后修复：
- 问题 → 修复

未完成/未授权：
- 真实 AI：未调用
- 公开部署：未执行
- 远端推送：未执行
- 真人测试：未执行

需要项目负责人集中审查的内容：
1. 产品语义与文案
2. 视觉与作品集叙事
3. R07 是否保留到公开版
4. 是否进入真人测试/发布审查
```

只有真实运行过的项目才写 PASS；不能用“代码看起来正确”替代执行结果。


