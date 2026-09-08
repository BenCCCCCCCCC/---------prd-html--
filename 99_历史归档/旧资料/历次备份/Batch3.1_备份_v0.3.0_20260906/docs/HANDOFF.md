# Batch 3｜PRD 文档阅读层＋Figma 播放器代码原型 · v0.3.0

日期：2026-09-06（Australia/Sydney）。执行依据：用户聊天确认的完整 Batch 3 请求；不等待附件，不重跑 Master Prompt。实际工程：`F:\html\网易云优化项目_Batch2_启动包_v1.1`。本轮只开放文档阅读、章节关联和局部呈现；R03/R04/R07 产品规则继续冻结。**新阅读层与新候选截图：负责人待复核。** 后文 v0.2.3 已批准记录及更早历史均保留，不把旧批准延伸为本批设计批准。

## 版本、备份与已完成

- 开工前实际版本 v0.2.3；对照原交付848文件清单，已存在的后续修改仅为负责人归档后的 `docs/HANDOFF.md`、`docs/APPROVAL_STATUS.md`，已完整保留。修改前副本：`F:\html\Batch3_备份_v0.2.3_20260906`，不含可重装依赖和临时测试目录。无 Git 初始化或提交。
- 应用版本 v0.3.0；PRD 仍为 v0.5.1。完整原文 01—19 节、23 张表格、3 段静态文字图示、1 张原流程 PNG及引用均呈现，正文独立核对见 [覆盖表](../qa/BATCH3_BODY_COVERAGE.md)。原文 SHA256：`ee82185ef668fd81ce506d5ca83f33cd4472b264d6ed52bbd52e15ad4bf2786d`，未改原稿。
- `/` 为完整 PRD 主入口，`/#/overview` 保留旧项目概览，`/#/demo` 复用现有交互原型。正式标题/副标题、文档版本、应用版本、验证状态分开呈现；完整目录、章节定位、全文搜索入口、浏览器查找与文本选择、原文真实下载、打印均提供。
- §06—13 提供 R03/R04/R07 对应流程和返回本节。进入时使用当前状态，不预选或加载示例。访问过的实际 Demo 保持同一实例，会话计时继续；地址栏路由切换也保留手动草稿。自由输入离开原型时清理，不进入文档 URL、存储或日志。
- 任务/重置/来源模拟/故障/时间推进/JSON仍位于画布外；评审说明可收起。当前调整与恢复、持久撤销和保护状态保留为产品能力。AD14 整页结果滚动不恢复；仅用户主动导航时定位页面/章节。
- 实时只读取得 Figma 四节点 context + screenshot：48:2、48:8、50:60、69:45。证据在 `artifacts/batch3/figma/`，不是引用旧缓存冒充实时读取。四组 Figma / v0.2.3 / v0.3.0 对照在 `artifacts/batch3/comparisons/`；390×844 产品局部四状态与批准的 v0.2.3 图均为0差异像素，保留唱片、封面比例、唱臂、歌曲信息、胶囊和底部弹层。
- 564 张开工前 PNG（含原192张应用快照及64张已接受 closeout 基线）均逐文件哈希验证保留。新候选独立存放；旧测试截图输出改到 Batch 3 目录，旧断言/阈值保留。

## 本批实际验证与自审

最终全链实际执行退出码 **0**，汇总生成时间 **2026-09-05T19:19:32.144Z**（本地9月6日）。以下均为本批重新执行结果，不引用旧成绩代替：

| 检查 | 实际结果 / 证据 |
|---|---|
| 事实源/权限边界、lint、typecheck、generated drift | PASS；`artifacts/batch3/quality-final.log` |
| 单元/契约 | **87/87 PASS**；`artifacts/reports/unit.json` |
| E2E | **87/87 PASS**＝原73项＋本批14项；`artifacts/reports/e2e.json` |
| 视觉回归 | **4/4组 PASS，72张候选实际比较**；原阈值0.005保留；`artifacts/reports/visual.json`。建候选运行另存`visual-candidate-creation.json/.log` |
| AC01—AC34追踪与生产构建 | PASS；`artifacts/reports/acceptance-executed.json`、`dist/` |
| 完整正文/真实下载/打印 | PASS；19节/23表/3文字图/1PNG、两种下载与源文件hash一致、23页PDF及19节打印标题；`body-coverage.json`、`document-download-hashes.json`、`print/` |
| 四视口/200%与键盘 | PASS；320×740、390×844、768×1024、1440×900；自然撤销、保护三态、目录搜索/表格/返回，axe无自动检测违规；相应E2E及`artifacts/batch3/reader/` |
| 草稿/计时/权限 | PASS；8节往返不产生操作；保留未提交选择，阅读期间30分钟进入原有待确认保护状态；AI输入及未采用候选清理，已进入草稿的选择不变 |
| 构建版原流程 | PASS；`artifacts/reports/production-smoke.json`，首次加载后离线调整/撤销、无提交滚动、无外部请求或页面错误 |
| 构建版文档链路 | PASS；`artifacts/batch3/production/result.json`，生产真实下载、从阅读初次加载后离线体验/返回、静态图仍可读、说明可收起 |
| 性能 | 本地Lighthouse **89/100**，LCP **1952ms**、CLS **0**、TBT **373ms**；`artifacts/reports/performance-summary.json`、`lighthouse.json/.html`。属于实验室观测，非现场INP或真人结果 |
| 保留审计 | PASS；`artifacts/batch3/final-audit.json`：后续审批文档保留、冻结业务/原文hash不变、564旧PNG不变；4核心产品画布前后零像素差异 |

生产预览首次检测时4173未启动，连接拒绝，首次性能无有效分数；启动仅回环的生产服务器后已重新运行并取得上表结果。无效结果留在`artifacts/batch3/performance-initial-unavailable.json`和`lighthouse-initial-unavailable.json`。第二次全链的新概览测试曾用手机去选原设计隐藏的桌面导航，改为桌面导航＋手机可见决策入口后保留全部断言并通过；中间结果见`quality-second.log`、`e2e-second.json`。

构建保留一项非阻断告警：主JS约663.40kB（gzip214.44kB），超过Vite默认500kB提示线。未上调告警阈值。完整Markdown解析与原型目前同包加载，省去异步章节缺失风险，代价是本地性能低于旧轻量概览入口；实际指标如上，后续若性能成为任务目标再独立优化，不牺牲完整正文、查找或打印。详细自审见 [BATCH3_REVIEW](../qa/BATCH3_REVIEW.md)。

已执行的发现与修复：逐节正文比对及下载哈希通过；阅读层首轮发现重复表格无障碍名称、320px/200%文字溢出，已修复并复测。带草稿路由跳转时发现原生模态框关闭与阅读焦点交接次序问题，已修复。原行为回归发现过长的新说明区把桌面故障工具推低，使反馈正文可见空间不足；已把新说明移至画布外说明区下部，保持原反馈组件、关闭规则及测试断言。失败原始报告保留于 `artifacts/batch3/reader-first.json`、`reader-second.json`、`e2e-first.json`、`quality-first.log`。

## 剩余问题、未运行项与内容差异

- **OBS-01 保留：** 刷新失败后的“继续”仅切回播放器；提示收起规则尚未完整定义，本批不新增规则。
- **OBS-02 保留：** 200%文字下反馈占位较大，真人设备理解和遮挡仍待测；本批回归修复不改变该观察含义。
- PRD §01 非目标“本轮编写应用代码或发布网站”、§13“40条尚未跑”、§16“运行时均待实施”、§18“当前完成PRD…计划原型”均为原稿历史状态。阅读说明单列当前本地实现与测试来源，不删改正文。§16历史“B3 用户与视觉验证”与本轮同名批次的工作范围不同，**本批不代表真人验证阶段通过**。
- HTML_SPEC §01 原 `/` 案例页由最新用户授权改为完整 PRD，概览迁至 `/overview`。这是已明确授权的阅读入口变化，不是产品规则冲突。未发现需要擅自补齐的核心规则冲突。
- Figma 48:3 是锁定的真实截图，不能声称读取了内部播放器组件。现有实现沿用已批准深色 Token、自制几何封面与虚构歌曲，保留与原稿暖棕底/真实封面的差异；辅助字号、关闭/返回、长期差异确认和保护说明使部分弹层高于原稿。未为了缩短弹层删减产品规则，未扩大 R07。此类既有差异详见 `docs/FIGMA_ALIGNMENT_ADDENDUM.md`（其中 AD14 等旧记录仍为历史）。
- 真人任务/真人设备、读屏人工测试、Safari/Firefox、真实模型、真实音频/账号、线上实验、现场 INP：**NOT_RUN**。自动化 Chromium、axe 与打印模拟不能替代这些验证。没有新增行业事实；原竞品 QQ音乐/Apple Music、Spotify补充参照及原研究边界保持。

## Autonomous Decisions / 自主决策记录（延续 AD24—AD33）

以下局部选择由本批有限自主权限覆盖；不修改冻结的产品语义。AD01—AD23在后文原样保留，AD14仍是由AD16—AD23阶段方案取代的历史项。

| ID | 问题 / 备选方案 | 最终选择与原因 | 代价 / PRD或Figma差异 | 影响文件 | 验证 / 回退 / 后续复核 |
|---|---|---|---|---|---|
| AD24 | 完整正文呈现：手写章节、简化摘要、成熟 Markdown 组件 | 原稿 raw 导入，react-markdown + remark-gfm 渲染；按原二级标题分19节，原文不改 | 增加本地依赖和解析开销；不增加内容或行业事实，不注入 HTML | Reader.tsx、package.json、pnpm-lock.yaml、vite-env.d.ts | 逐节全文、表格/图示/引用比对；回退阅读组件与这两项依赖；建议复核阅读体验 |
| AD25 | 文档导航可能卸载 Demo 丢草稿：抬升业务状态、另建副本、保留原实例 | 首次进入后保留同一实际 Demo，非活动时隐藏/inert；时钟继续；先关闭视觉模态再移交阅读焦点 | 实例占用持续到刷新；自由输入离开清理；未保存业务稿保留，原关闭仍明确丢草稿；无产品规则变化 | App.tsx、Demo.tsx、main.tsx | 草稿往返/30分钟计时/原浏览器返回用例；回退路由外壳与active呈现接入；建议复核 |
| AD26 | 对应章节需要示例：自动设置、强制重置、从当前状态体验 | §06—13记返回来源，画布外提示对应入口；不自动打开/确认或设值，原重置由用户点击 | 不保证进入时恰为截图初始状态，需读者主动操作；不改AI采用规则 | Reader.tsx、Demo.tsx | 8章节往返无操作写入、真实调整撤销；回退章节关联链接；建议复核流程可理解性 |
| AD27 | 窄屏长表格：缩字、改写成摘要卡、保留列结构 | 原表格保留，可键盘横向滚动；正文重排；打印完整表头重复、单行尽量不拆、静态图保留 | 窄屏表格需横移，200%更长；不删正文或把列关系改为概括 | reader.css、Reader.tsx | 四视口/200%、键盘、axe、23页PDF与正文覆盖；回退局部阅读CSS；建议真人设备复核 |
| AD28 | 原文下载带相对图片引用：假链接、只给本机路径、真实静态资料 | Vite输出原Markdown字节文件；另提供原文与引用ZIP和SOURCES下载 | ZIP是冻结原稿的副本，原稿未来获批变更后须重建；下载包与源文件逐项哈希 | Reader.tsx、public/documents/、prepare_documents.py | 浏览器实际download事件及哈希、ZIP完整性；回退下载入口与静态副本；建议抽验离线阅读 |
| AD29 | Figma当前状态是否需重画：整轮重绘、局部复核复用 | 先读四节点context+截图，复用v0.2.3四核心画布；R07继续同组件语言 | 保留已批准的深色底/合成封面、字号及附加规则说明差异；不是像素级复刻Figma | artifacts/batch3/figma、comparisons；产品样式与控件不改 | 四组原稿/前/后对照，四状态与v0.2.3零像素差异；无需回退产品绘制；建议复核既有差异 |
| AD30 | 自主体验需隐藏答案；新增说明推低工具导致回归 | 原指南用原生details可收起；新关联说明置画布外下部，工具继续可达；产品状态不隐藏为调试信息 | 说明与工具分区需向下阅读；修复失败反馈可见性未改ProductFeedback或OBS关闭规则 | Demo.tsx、reader.css | 原73项行为含24种失败保护组合、8种自然撤销；回退说明包装/排序；建议复核说明的发现性 |
| AD31 | 文档与应用版本容易混淆：沿用0.2.3、升级PRD、单独应用升级 | 应用0.3.0，文档0.5.1不变；当前验证状态单列 | 新候选仍待负责人审查，不能沿用旧批准；没有产品范围升级 | package.json、Reader.tsx、index.html、HANDOFF/APPROVAL | 版本/原文hash核对；回退版本和本批呈现；建议负责人确认新批候选 |
| AD32 | 重跑测试可能覆盖旧截图：覆盖旧目录、跳过旧测试、另存本批输出 | 保留旧行为断言与0.005截图阈值，旧截图输出改到batch3；72张视觉候选单独路径 | 交付体积增加；同环境快照通过只说明回归稳定，不是设计批准 | tests/e2e/{flows,alignment,closeout,reader}.spec.ts、tests/visual/screens.spec.ts | 564旧PNG逐一hash，旧73项覆盖保留；回退测试输出路径，保留两批证据；建议抽查 |
| AD33 | 旧PRD/审批/概览状态与当前阅读层不同：改原稿、自动升级、分层说明 | 原文与审批历史原样保留，当前实现说明单列；旧概览保持次级，修正其锚点路由 | 读者需区分“原文历史”与“当前实现”；概览中旧独立预览仍只使用合成内存状态、不写实际Demo存储 | Reader.tsx、Portfolio.tsx、App.tsx、HANDOFF/APPROVAL | 19节全文、历史保留hash、概览锚点/状态回归；回退次级路由及说明；建议复核阶段用语 |

## 预览、交付与权限

本地预览：在工程目录安装锁定依赖 `pnpm install --frozen-lockfile`，执行 `pnpm dev` 打开 `http://127.0.0.1:5173/`；生产版执行 `pnpm build` 后 `node scripts/serve-dist.mjs`，打开 `http://127.0.0.1:4173/`。使用服务器访问，不承诺双击 index.html 可运行。原文与图示下载文件已包含，常规预览不需要 Python；prepare_documents.py 仅在原稿将来获批变更时用于重建资料包。

交付目录：`F:\html\Batch3_交付_v0.3.0`；完整项目 `网易云推荐控制_Batch3_v0.3.0_完整项目.zip`、`Batch3_完整HANDOFF.md`、`Batch3_审查报告.md`、`交付校验.json`。截图/正文覆盖/报告均在项目包内，无需拼旧包。ZIP完整性与逐文件hash由打包脚本验证，包体hash记录在目录内校验JSON。依赖目录、临时测试缓存、系统字体和真实环境文件不打包；锁文件与生产构建保留。

未调用真实AI/API、未读密钥、未接账号/音频、未付费或加遥测、未公开部署/远端推送、未初始化或提交Git、未改云端Figma。全部应用操作及验证为本机合成状态。

---

# 负责人复核归档 · v0.2.3 本地 Beta 冻结

归档日期：2026-09-06（Australia/Sydney）。依据：用户本条聊天中的完整负责人复核结论，不等待其他附件。归档前确认package版本为 **v0.2.3**；与v0.2.3交付清单的848个文件逐项哈希比对一致，未发现清单内文件的后续修改。本次只更新本文件和 [阶段审批记录](APPROVAL_STATUS.md)，不回滚任何工作。

## 当前批准与冻结状态

**Batch 2.1 收尾通过产品/视觉负责人审查。v0.2.3及现有 `closeout-candidate` 截图接受为当前本地 Beta 和应用回归基线，当前应用冻结。** 无需修改截图路径或重新生成基线。本批准不代表公开发布、真人验证或真实模型验证通过。

本轮接受：回执状态互斥、按具体操作撤销、取消AD14整页自动滚动、10秒提示与持久撤销分离、三态保护说明，以及AI相同值/未提及表达。**AD16—AD23在本地Beta范围内采用；AD14保留为已被替代的历史方案。** AD01—AD23、原始历史和全部旧截图保留。后文“负责人待复核”等表述为批准前的历史交付记录，不再代表当前阶段状态。

## 审查方式与证据边界

依据负责人陈述：负责人核验了归档完整性、关键文件哈希、源码、截图及原始测试报告，并运行了输入边界检查。87项单元、73项E2E及性能结果来自Codex本轮存档执行；**负责人没有独立重跑整套测试**。负责人浏览器访问被 `ERR_BLOCKED_BY_ADMINISTRATOR` 阻止，**不得记为独立运行复测通过**。本次归档仅进行版本/文件核对与记录更新，没有重新运行应用测试。

## 非阻断观察（仅记录）

| ID | 观察 | 后续处理 |
|---|---|---|
| OBS-01 | 刷新失败后的“继续”只切回播放器，不主动收起失败提示；其收起规则尚未完整定义 | 后续任务测试观察是否引起困惑；本次不改变行为 |
| OBS-02 | 200%文字下反馈占位较大，真人设备上的理解与遮挡情况仍待测 | 留待真人设备验证；本次不调整布局 |

## 下一阶段与授权边界

下一阶段为**作品集讲解、PRD与实现对应整理、真实任务验证准备**，不再全面美化；未发生的用户测试继续标为 **NOT_RUN**。本次不启动下一阶段实施。

本次未修改源码、版本号、依赖、测试或截图，未重新打包完整项目。真实AI/API、密钥读取、真实账号/音频、付费、遥测、公开部署、远端推送、Git初始化/提交及云端Figma修改仍未授权。

---

# 历史交付记录：Batch 2.1 收尾 · 完整 HANDOFF · v0.2.3

日期：2026-09-06（Australia/Sydney）。状态：本地定向修复、统一self-review、最终质量链路和生产验证完成，交负责人集中审查。**新视觉基线仍为负责人待复核；没有自行批准或公开发布。**

## 执行依据、基线与备份

本轮依据：[BATCH2_1_CLOSEOUT_CODEX](BATCH2_1_CLOSEOUT_CODEX.md)，来源明确为“用户聊天确认的执行要求”。原附件在工作区缺失，用户确认聊天内容为完整授权后已保存，不声称读取过缺失附件。没有重新执行旧整轮视觉指令或Batch2 Master Prompt。

实际工作目录：`F:\html\网易云优化项目_Batch2_启动包_v1.1`。开工时package为v0.2.2，交付清单536个文件逐项哈希一致，未发现这些文件的后续修改；修改前副本：`F:\html\Batch2.1_收尾_备份_v0.2.2_20260906`，含 `baseline-check.json`。未初始化Git、提交、远端写入或部署。

## 已完成

1. 回执绑定具体operationId，成功/已撤销/失败三种状态互斥。撤销成功替换为“已撤销本轮调整”，本条旧保存文案与撤销按钮移除；失败、相关字段冲突或会话结束不显示成功。用原domain.undo校验，回执不会转而撤销后来一笔管理操作。
2. **AD14整页自动滚动已移除，由AD16的产品画布内非模态反馈方案替代。** 反馈避开当前可见交互控件，在画布空闲区域就地显示，不改唱片比例和100%入口布局；提交恢复焦点使用preventScroll。正常打开、调整、提交、撤销八组自然操作的scrollY均保持不变。
3. 10秒提示消失与撤销资格分离：更换本条文案不重新开始10秒；“当前调整与恢复”和长期管理里的持久入口保留，由既有字段版本状态判断是否可操作，实际撤销仍调用原校验。相关变更、已撤销或会话终止不能靠旧按钮误报成功。
4. 普通提示中移出revision/operationId/技术JSON，放入默认折叠的Product Notes。刷新失败明确“设置已保存，推荐尚未刷新”；保护说明分别对应off/active/review_required。200%失败提示去掉重复保存标题/明细，紧凑操作行保留完整可访问名称。
5. AI等值显示“与当前设置一致”，未提及仍为“保持不变”；没有制造差异、猜缺省值或改变采用仅入草稿规则。

## 实际测试结果

| 检查 | 本轮最终结果与证据 |
|---|---|
| 旧问题复现 | PASS：v0.2.2提交scrollY 0→207，撤销后保存/按钮/成功撤销消息并存；`artifacts/closeout/reproduction/observed.json`及2张自然截图 |
| 原完整quality | PASS，退出0；最终汇总2026-09-05 16:03:20 UTC（本地09-06 02:03）；`artifacts/reports/quality-closeout.log` |
| 输入边界/lint/typecheck/生成漂移 | 全部PASS；原配置、字典、Schema、领域与存储规则未改 |
| 单元/契约 | 87/87 PASS；含原AI合成/非法输出/排序契约，未用历史结果替代 |
| E2E | 73/73 PASS＝原32+新增41；原32测试文件内容不变 |
| 新增覆盖 | 8自然序列、2时限/持久撤销、1操作绑定、1冲突/会话终止、24保护三态×四视口×两种字号、4纯键盘快捷少推撤销、1AI等值/null |
| axe及可读性 | 原3个多状态axe入口保留，新增24项三态矩阵均无violation；每个失败面板正文scrollHeight≤clientHeight；非真人读屏认证 |
| 视觉回归 | 4/4视口、64新候选图PASS；旧两套128图哈希保留，阈值0.005未降低 |
| 200%专项 | 新四视口自然/键盘/三态均PASS；另旧320/390根面板专项重跑PASS |
| 最终构建 | PASS；JS454.10kB/gzip143.61kB，CSS33.40kB/gzip6.86kB |
| 最终生产离线smoke | PASS：初始加载后离线提交、撤销；不滚页、不再保留旧保存回执；页面错误0、外部请求0 |
| 性能 | 本轮最终本地Lighthouse98，LCP1652.458ms、CLS0、TBT144ms；field INP未测 |
| 审计/ZIP | 原领域/规则/测试及128旧图哈希审计、64候选和自然测量审计；ZIP执行CRC与归档内每文件SHA-256比较，结果在独立交付校验JSON |

当前原始结果：`artifacts/reports/{unit,e2e,visual,verification-summary,production-smoke,performance-summary}.json`及 `lighthouse.html`。旧报告在 `artifacts/closeout/history-v022/`。旧基线真实差异报告、早期失败回归及视觉自审前通过日志均保留；它们不是最终结果。

## 自审修复、自然截图与剩余问题

自动检查首次通过后，放大200%失败图发现纵向按钮挤压正文。已压缩重复信息与操作行，并新增正文完全可读断言，24项三态矩阵重跑通过。另发现200%轻入口会竖排拆字，已允许整词呈现并在必要时收回左缩进；100%接受的唱片与入口比例保留。

自然序列共32张：`artifacts/closeout/natural/{320,390,768,1440}-{100,200}/`，每组opened/editing/saved/undone四步及真实scrollY/目标操作JSON。没有脚本额外滚动摆放反馈。键盘4张在 `artifacts/closeout/keyboard/`；保护三态24张带视口/字号后缀的当前图在 `artifacts/closeout/protection/`。64核心状态及拼图在 `artifacts/screenshots/`。完整索引、复现和限制见 [CLOSEOUT_REVIEW](../qa/CLOSEOUT_REVIEW.md)。

未发现本轮范围内仍阻止本地交付的P0/P1。剩余需产品/视觉复核：反馈在10秒内可能覆盖部分唱片装饰或非交互文字，但不遮挡关键控件，完整保护状态在反馈中保留；200%使用短按钮可视文案“重试/继续”，可访问名称仍为“重试刷新/继续听歌”。本轮没有重画旧Figma，不把这些呈现选择声称为原稿已批准设计。

## 未运行项

真人可用性/读屏、物理软键盘、真机Safari/Android、Firefox、真实账号或音乐、真实AI/API、field INP：NOT_RUN/NOT_MEASURED。未读取API Key、付费、接遥测、远端推送、修改云端Figma或公开部署。自动axe和本地Lighthouse不等于真实用户或线上效果。

## 修改文件

| 文件 | 理由与边界 |
|---|---|
| src/Demo.tsx | 回执结构/操作绑定/互斥结果、提示截止点、持久入口状态、焦点preventScroll、三态文案、技术JSON折叠、AI等值；原domain函数复用 |
| src/ProductFeedback.tsx（新增） | 画布内反馈定位、避开交互控件、随视口/滚动/尺寸更新；没有主动滚动和全页遮罩 |
| src/alignment.css | 反馈面板/可读正文/紧凑操作行，200%入口整词适配；唱片形状尺寸不变 |
| package.json、src/generated/verification.json、dist | v0.2.3、本轮实际测试汇总及生产产物，无依赖升级 |
| tests/e2e/closeout.spec.ts（新增） | 41项收尾回归和自然证据 |
| tests/visual/screens.spec.ts | 独立closeout-candidate路径；反馈截图撤掉显式滚动，以自然可见断言替代；原64状态与阈值保留 |
| scripts/closeout-reproduce.mjs、closeout-audit.mjs、package_closeout.py（新增） | 旧问题复现、基线/自然证据审计、完整ZIP及校验 |
| scripts/production-smoke.mjs | 在原离线检查上增加提交不滚页和撤销替换提示断言 |
| docs/BATCH2_1_CLOSEOUT_CODEX.md、CLOSEOUT_BUILD_PLAN.md、HANDOFF.md | 聊天授权来源、执行与决策、完整交付 |
| qa/CLOSEOUT_REVIEW.md、原质量报告、README、artifacts | 本轮结果/截图/限制，历史明确分界保留 |

`src/domain/model.ts`、`src/domain/ai.ts`、storage、原token/配置/标签、Portfolio、PreferenceControls、原32项E2E文件及pnpm-lock保持v0.2.2内容；完整变动哈希见 `artifacts/closeout/final-audit.json`。

## Autonomous Decisions / 自主决策记录（延续AD15）

下列为本轮全部非机械性决定。AD14只保留在后文历史，不再是现行实现。

| ID | 问题 | 备选方案 | 最终选择与理由 | 代价 | Figma/PRD差异 | 影响文件 | 验证结果 | 回退方式 |
|---|---|---|---|---|---|---|---|---|
| AD16（替代AD14） | 回执在屏外，旧方案自动滚整页 | 继续自动滚动 / 固定全页Toast / 画布内避让反馈 | 画布内非模态面板，根据可见交互矩形选空闲区域；画布离屏时回画布绝对定位；提交焦点preventScroll | 短时覆盖部分装饰，定位需监听尺寸/用户滚动；无新模态 | 这是批准收尾下的呈现选择，非原Figma逐像素；产品规则不变 | ProductFeedback.tsx、Demo.tsx、alignment.css | 八组自然scrollY相等、24三态矩阵、四键盘、按钮不相交、生产smoke PASS | 可单独替换反馈定位组件为画布内保留区；必须保留不主动滚页与不遮挡断言，不能恢复AD14交付 |
| AD17 | 回执和latest操作脱钩，撤销后旧成功仍显示 | 清空字符串 / 总撤销latest / 带ID的互斥状态回执 | saved/undone/error+明确operationId；每次动作给原undo传具体ID；管理模态内保留同一结果提示 | 多一个局部UI结构，不持久保存短提示 | 实现PRD本笔反向patch，未改domain资格 | Demo.tsx、closeout.spec.ts | A后B管理再撤销A、冲突/会话终止/重复防护 PASS | 局部重写回执呈现可逆；恢复前保留ID与终态断言，不能退回latest绑定 |
| AD18 | 清提示容易误删撤销能力或重启10秒 | 10秒后禁用全部 / 重置计时 / 原截止点+独立持久入口 | receipt保留原expiresAt；终态仍用原截止点；持久入口依据现有patch/fieldVersions，最终由undo校验 | 短提示与持久能力需分别维护；近截止点撤销成功提示显示时间较短 | 保持原10秒和资格/会话规则；无配置变更 | Demo.tsx、closeout.spec.ts | 9秒撤销后1秒消失、10秒后持久撤销、失效禁用 PASS | 仅可替换UI计时实现；用时限测试保证原截止点，domain/config与持久入口不回退 |
| AD19 | revision/JSON及失败重复文案干扰普通用户，200%正文受挤压 | 保留密集信息 / 小字号 / 技术折叠+紧凑失败提示 | 技术进Product Notes；失败仅显示保存/刷新两阶段和实际保护；“重试/继续”短可视字配完整aria-label | 失败浮层不重复具体变更明细；明细仍在当前调整/Notes可查，短文案需负责人复核 | 当前PRD语义保留，正文14px；布局不等同旧Toast | Demo.tsx、alignment.css | 24三态×视口字号全文可读/axe PASS，生产离线PASS | 可恢复较长按钮文字但必须重跑200%正文/控件可见性；不能恢复统一保护或普通revision |
| AD20 | AI A→A让人误以为发生变化 | 保留A→A / 制造变化 / 标相同 | 同值显示与当前设置一致；标签按集合比较，null单列保持不变 | 显示层增加等值分支 | 仅文案调整，不改候选、字典、采用规则 | Demo.tsx、closeout.spec.ts | 等值/null及采用后revision不变PASS；原AI契约PASS | 删除等值显示分支即可回原A→A；不动候选数据 |
| AD21 | 200%轻入口逐字竖排 | 缩文字 / 加宽画布 / 整词且必要时收回缩进 | nowrap与clamp左缩进，保持自然字号和100%几何 | 大字号入口横向位置与原390参考不同 | 必要响应式差异；已接受唱片比例与常态入口不变 | alignment.css | 八组自然图及四视口200%操作PASS | 单独回退这两条CSS，若出现拆字仍须修正后才能交付；不改唱片token |
| AD22 | 更新基线可能掩盖旧问题，截图滚动可能伪造可见 | 覆盖旧图 / 只测旧图 / 新候选+独立自然序列 | 保留128旧图及实际差异，新增64候选；自然证据无额外滚动；原反馈截图滚动改可见断言 | ZIP较大，历史与当前需明确索引 | 不影响产品；基线仍待负责人复核 | closeout.spec.ts、screens.spec.ts、artifacts/QA | 原quality73E2E+64图PASS；旧图哈希与8组测量审计 | 恢复测试路径即可复查旧图；保留旧/新证据，不删断言降阈值 |
| AD23 | 缺附件且需独立收尾包、不能覆盖后续工作 | 停等附件 / 重用旧阶段 / 聊天确认落盘+独立v0.2.3 | 按用户确认保存完整要求，536哈希后备份，完整新ZIP包含全部源码/报告/历史 | 多份历史使包增大；初始附件未实际读取需明示 | 执行依据来自最新用户确认，无产品扩展 | docs、package.json、审计/打包脚本 | 输入原件保存、完整ZIP CRC/逐文件SHA-256清单 | 可回到命名备份用于对照；不得以旧版当已修复交付，不改云端或Git |

## 预览与交付位置

源码根目录运行 `node scripts/serve-dist.mjs` 或双击 `预览已构建版本.cmd`，访问 `http://127.0.0.1:4173/#/demo`。端口已占用时复用当前本地预览。源码环境沿用Node24/pnpm11；`pnpm install --frozen-lockfile`、`pnpm exec playwright install chromium`、`pnpm run quality`；本机实际通过本地npm CLI执行同一quality脚本。

完整项目ZIP：`F:\html\Batch2.1_收尾_交付_v0.2.3\网易云推荐控制_Batch2.1_收尾_v0.2.3.zip`。独立HANDOFF：同目录 `Batch2.1收尾_完整HANDOFF.md`。完整性、ZIP SHA-256和归档每个文件清单：同目录 `交付校验.json`。包内已有全部截图、详细报告、历史证据和当前dist，不需手动拼接旧包；排除node_modules、字体文件、非示例.env及缓存，不含真实用户数据。

负责人重点检查（4项）：

1. 自然提交/撤销不滚页，反馈暂时覆盖装饰的接受度。
2. 撤销只作用于本条操作；旧成功消失，10秒后的持久入口仍可用，冲突不报成功。
3. 刷新失败与保护关闭/开启/待确认的说明，尤其200%文字和短按钮文案。
4. AI相同值/未提及表达及新候选基线是否接受。

---

# 历史：Batch 2.1 完整 HANDOFF · 视觉对齐修正

日期：2026-09-05。版本：0.2.2。状态：本地实现、统一 self-review、修复与验证完成，提交负责人集中审查。**视觉设计与64张候选基线尚未获得负责人批准。** 后文保留的 Batch 2 handback 为历史快照；本节及本轮补充报告为当前结果。

## 交付与运行

工作目录：`F:\html\网易云优化项目_Batch2_启动包_v1.1`。修改前完整工作副本：`F:\html\Batch2.1_备份_修改前`。未初始化Git、提交、推送或公开部署。

交付ZIP：`F:\html\Batch2.1_交付\网易云推荐控制_Batch2.1_视觉对齐_v0.2.2.zip`；完整性/SHA-256与逐文件清单：同目录 `交付校验.json`；独立handback：`Batch2.1完整Handback.md`。ZIP含源码、锁文件、原规格、dist、历史/候选基线、Figma读取缓存、前后截图与报告；排除node_modules、缓存、字体文件、非示例.env，不含真实用户数据。

已构建版：在项目根目录运行 `node scripts/serve-dist.mjs` 或双击 `预览已构建版本.cmd`，访问 `http://127.0.0.1:4173/#/demo`。Node24环境源码复现：`pnpm install --frozen-lockfile` → `pnpm exec playwright install chromium` → `pnpm run dev`；质量检查 `pnpm run quality`。本机实际使用 `node node_modules/npm/bin/npm-cli.js run quality`。生产预览只监听本地回环。

## 完成结果与依据

- Figma原文件 `ZbKyQeHug7rM5P88GBSmlY` 的48:2、48:8、50:60、69:45全部成功读取context和截图；另读取8节点，共12份context/11张独立PNG。节点事实与缓存时间见 [FIGMA_ALIGNMENT_ADDENDUM](FIGMA_ALIGNMENT_ADDENDUM.md)。
- V01：唱片比例、曲线唱臂、曲名附近轻入口；V02：紧凑三行、弱分隔、胶囊footer；V03：真正分段radio、五类Tab和跨类保留；V04：右Radio与独立Switch；V05：候选差异优先、共用编辑控件、null明确；V06：外壳与390产品画布分离，dialog横向对齐产品。
- 保留R03/R04/R07已批准语义，包括草稿/确认、最多3项、即时软少推、四种范围/保护组合、长期差异确认、提醒后继续保护、保存与刷新分离、撤销与冲突、AI仅入草稿。
- 未修改domain、storage、原Schema/字典/排序/事件规则。最小UI变化为分类临时状态/键盘焦点、候选null恢复、dialog横向定位、回执必要滚动。详细自主决策见下表。

## 验证结果

| 检查 | 当前实际结果 |
|---|---|
| 原quality完整链路 | PASS，2026-09-05退出0；汇总12:36:49 UTC |
| 输入边界 / lint / typecheck / generated drift | 全部PASS |
| 单元与契约 | 87/87 PASS，原40 AI合成例、6非法输出、4排序fixture保留 |
| E2E | 32/32 PASS，原23+新增9；原断言未减少 |
| axe | 3个多状态测试入口PASS，计入上述32项 |
| 视觉回归 | 四视口4/4测试、64张候选图比较PASS；原64图保留 |
| 视口/200%文字 | 320×740、390×844、768×1024、1440×900流程PASS；另320/390根面板专项PASS |
| 构建 | PASS；JS450.46kB/gzip142.11kB，CSS32.70kB/gzip6.73kB |
| 最终生产smoke | 初始加载后离线核心操作PASS，页面错误0、外部请求0 |
| 性能 | 最终本地Lighthouse98，LCP1654.3ms、CLS0、TBT146.5ms；field INP未测 |
| ZIP | 交付脚本执行CRC完整性、必要文件、双套基线、图像数量及SHA-256校验；结果在交付校验.json |

原始证据位于 `artifacts/reports/quality-batch2.1.log`、`unit.json`、`e2e.json`、`visual.json`、`verification-summary.json`、`production-smoke.json`、`performance-summary.json`、`lighthouse.html`。修改与不变文件哈希见 `artifacts/batch2.1/change-audit.json`。真实用户、真人读屏、物理软键盘、真机Safari/Android、真实模型均未测试；Lighthouse不是field数据。

## 修改文件及理由

| 文件/目录 | 修改理由与范围 |
|---|---|
| src/Demo.tsx | 呈现结构、共享控件接入、低干扰入口、SVG曲臂、Radio/Switch、候选差异、dialog定位、回执必要滚动；原业务回调继续使用 |
| src/PreferenceControls.tsx（新增） | 分段radio与五类Tab共用，选中数据仍由父级持有 |
| src/alignment.css（新增） | 仅局部Demo/Sheet对齐；嵌入式播放器预览单独适配 |
| specs/figma-alignment-tokens.json、src/generated/alignment-tokens.css（新增） | 原token不改，新增语义局部token及生成物 |
| src/main.tsx、scripts/generate.mjs | 加载局部样式及生成/漂移校验支持 |
| package.json | 交付版本从0.2.1标为0.2.2，无依赖改动 |
| tests/e2e/alignment.spec.ts（新增） | 9项有实际行为断言的呈现回归 |
| tests/visual/screens.spec.ts | 画布坐标与独立候选快照路径，原状态/阈值保留 |
| scripts/alignment-capture.mjs、alignment-compare.mjs（新增） | 同状态前后实拍、几何及15组三列对照 |
| scripts/batch2-1-audit.mjs、package_batch2_1.py（新增） | 修改哈希审计、排除规则、可重建ZIP与完整性清单 |
| src/generated/verification.json、dist | 实际检查汇总与当前生产产物 |
| docs/BATCH2_1_BUILD_PLAN.md、FIGMA_ALIGNMENT_ADDENDUM.md、HANDOFF.md | 本轮范围、事实、差异、决策与交付 |
| qa/FIGMA_ALIGNMENT_REVIEW.md、其他质量报告、README.md | 当前结果及历史边界；截图索引单独新增 |
| artifacts/batch2.1、artifacts/reports、artifacts/screenshots、候选快照子目录 | 原始读取、前后/专项/回归/历史证据 |

原 `src/styles.css`、`src/Portfolio.tsx`、`src/components.tsx`、domain/storage、已有E2E和unit测试、pnpm-lock、原design-tokens/tags/Schema保持原内容。案例页结构与叙事不重做，案例里的播放器预览随共享Demo作必要尺寸适配。

## Autonomous Decisions / 自主决策记录

| ID | 遇到的问题 | 可选方案 | 最终选择 | 选择原因 | 是否偏离 Figma 或 PRD | 影响文件 | 如何验证 | 是否建议负责人后续复核 |
|---|---|---|---|---|---|---|---|---|
| AD01 | 全局token同时控制白色外壳和Demo | 全局修改 / 局部语义token | 新增alignment token和CSS层 | 限定呈现影响，保留事实源 | 原token不变；局部颜色按原稿与无障碍调整 | alignment.css、alignment-tokens.json、generate.mjs、main.tsx、生成CSS | drift、原输入哈希、四视口截图 | 否，随整体审查即可 |
| AD02 | 48:3是锁定整图，无法读到内部控件 | 整图热区 / 继续粗折线 / 按像素测量本地重建 | 306px唱片加外环、曲线SVG唱臂、合成封面，顶部202 | 恢复原比例且保留独立交互 | 是：素材、背景及局部曲线像素不同；PRD不变 | Demo.tsx、alignment.css、局部token | 48:2并排与geometry；模拟播放/喜欢E2E | 是，重点看比例与唱臂 |
| AD03 | 原大红入口主次过强 | 保留全宽 / 小按钮缩小命中区 / 轻胶囊加44px命中区 | x72/y524的154×44轻入口，文案沿用“调整推荐” | 接近原位置、播放优先、满足点击目标 | 是：原入口x76/y520/160宽，旧图文案更长；保持当前PRD用语 | Demo.tsx、alignment.css | player对照、入口实际操作与曝光观察器复用 | 是，复核低干扰与可发现性 |
| AD04 | 根面板过高且亮线重复 | 删状态 / 缩字体 / 压缩普通状态和行间距 | h447三行、弱分隔、footer radius24，保留管理及禁用 | 维持信息层级与当前必要状态 | 是：比原444高3px；语义不变 | Demo.tsx、alignment.css | root对照与草稿/根取消测试 | 是，确认新增信息权重 |
| AD05 | 三个原生圆点不似一体分段 | CSS模拟无语义 / 隐藏外观保留原生radio | 原生radio透明覆盖整段，独立焦点轮廓 | 形态与键盘/读屏语义兼顾 | 是：轨道48高而非原42；无语义偏离 | PreferenceControls.tsx、alignment.css | radio/check、axe、200%测试 | 否 |
| AD06 | 类别纵铺、跨类选择与大字号换行 | 全部展示 / Tab但选择独立 / 父级选择+Tab视图 | 按现字典五类、箭头自动激活/Home/End、已选摘要、整词换行；重进默认曲风 | 分类可达并保留总3项规则，200%不拆汉字 | 是：现字典与旧图不同、选中增加勾/描边；PRD优先 | PreferenceControls.tsx、Demo.tsx、alignment.css | 跨类3项、第4项拒绝、主题纯音乐、返回保留、四视口 | 是，复核摘要与多行Tab体验 |
| AD07 | 保护checkbox与长期确认难区分 | 都用checkbox / Switch绑定范围 / 独立Switch与右Radio | Switch52×28外层48，长期确认保留左checkbox | 两维度形态明确、无权限耦合 | 形态回归原稿；点击外层和轮廓加强 | Demo.tsx、alignment.css | Space、四组合、长期确认和axe | 否 |
| AD08 | 当前范围/少推新增规则比旧图多 | 删说明 / 折叠关键含义 / 更高的可滚动面板 | 保留14px说明、差异确认、双维度摘要与少推管理 | 当前PRD优先，不能只为旧高度删规则 | 是：想听647、长期开629、少推670；分别高于旧601/500/484 | alignment.css、Demo.tsx | 并排、200%完整操作、原语义E2E | 是，重点复核密度和高度 |
| AD09 | AI null易被默认选项误导，原值反复出现 | 默认平衡 / 显示未提及 / 扩展新聊天交互 | diff在前；null无选中；提供恢复“保持不变”；复用分段/Tab | 不把缺省当推断，仍允许字段修正 | R07无完整旧frame；沿用已批准null语义 | Demo.tsx、PreferenceControls.tsx | null恢复、候选编辑、采用后revision仍0 | 是，复核差异可读性 |
| AD10 | JSON在普通候选区显得过重，外部Notes在模态期间不可用 | 展开JSON / 移到模态外 / 面板内折叠Product Notes | 面板内默认折叠技术JSON，固定模拟声明保留 | 技术信息仍可访问但不撑开主体 | 新增页排版调整，字段/权限不变 | Demo.tsx、alignment.css | ready/澄清/不支持截图、axe、JSON仍可展开 | 否 |
| AD11 | 桌面dialog居窗口中心偏离产品画布 | 全窗口面板 / 硬编码left / product矩形定位 | 读getBoundingClientRect并随resize更新left/width，native dialog隔离 | 与实际画布对齐并保留模态焦点 | 浏览器必要适配；不固定各视口y | Demo.tsx、alignment.css | 四视口对齐断言、原焦点循环与背景隔离 | 是，桌面体验复核 |
| AD12 | 同一播放器也被案例页嵌入 | 整体页面缩放 / 统一306强塞 / 预览局部缩小 | 主Demo参考390，嵌入预览仅缩唱片/唱臂间距，320布局自然收缩 | 保留白色案例叙事与小容器可用性 | 是：嵌入预览非原390完整画布 | alignment.css | 四视口案例截图与可操作预览原E2E | 否 |
| AD13 | 新快照可能掩盖旧图设计差异 | 覆盖旧图 / 不测新应用 / 双套基线 | 先记录旧基线真实失败，保留64旧图，独立64候选再比较 | 区分设计审查与应用回归 | 不适用；未变产品 | screens.spec.ts、快照目录、QA | 旧失败图/JSON、64候选再次PASS | 是，负责人批准候选基线 |
| AD14 | 大唱片导致原静态回执/撤销落到屏外 | 固定浮层 / 缩回唱片 / 必要滚到回执 | 仅receipt在视口外时instant最近滚动，保留多行说明、时限与焦点 | 让提交后能及时看到真实反馈，避免遮挡播放控件 | 是：旧Toast42px且位置固定；本实现多行可滚动；语义不变 | Demo.tsx、alignment.css、alignment.spec.ts | 四视口200%撤销按钮在视口内、生产离线、toast/undo图 | 是，重点复核提交后的视口变化 |
| AD15 | 修正版与上一批交付容易混淆 | 覆盖0.2.1 / 新版本独立包 | 标0.2.2，独立Batch2.1目录，历史报告加明确分界 | 回溯方便且不篡改旧结论 | 不涉及Figma/PRD | package.json、文档、打包/审计脚本 | 备份、哈希清单、ZIP内容检查 | 否 |

## 关键图与待复核项

完整15组并排图索引见 [FIGMA_ALIGNMENT_REVIEW](../qa/FIGMA_ALIGNMENT_REVIEW.md)；左侧原稿或批准新增状态占位，中间Batch2，右侧Batch2.1候选。四视口64图在 `artifacts/screenshots/`，专项与前后图在 `artifacts/batch2.1/`。参考真实素材仅供本地审查，未进入dist/public。

负责人重点复核：唱臂/唱片与轻入口关系；根面板和更高的想听/范围/少推信息密度；加强对比的选中标签；R07差异/未提及表达；回执必要滚动；桌面模态位置。到期提醒只有旧临时状态先例，R07、刷新失败、撤销结果没有完整原frame，不宣称逐像素还原。

本批未发现阻止本地交付的P0/P1；剩余视觉差异与未测项已公开记录。未调用真实AI/API、真实音乐/账号、远端遥测、读取API Key、写云端Figma或扩大产品范围。后续产品/视觉审查与公开发布授权仍由负责人决定。

---

# 历史：Batch 2 本地 Beta handback（以下保留原记录）

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
