# Batch 2.1 完整 HANDOFF · 视觉对齐修正

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
