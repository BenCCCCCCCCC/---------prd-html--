# Batch 2.1 · Figma 对齐补充

日期：2026-09-05；实现版本：0.2.2。当前状态：本地实现与自审完成，视觉设计与候选基线待负责人批准。本文件覆盖本轮呈现修正；原 Batch 2 文档中的视觉结论属于历史。

## 依据与读取证据

执行优先级：最新 PRD v0.5.1 产品语义 > 已批准产品决策 > 原 Figma 视觉与交互意图 > HTML 规格 > 本轮局部判断。依据包括本轮《Batch2.1_CODEX_视觉对齐修正指令》和负责人的 bounded autonomy 补充。原 Master Prompt 不重新执行。

实际工作目录为 `F:\html\网易云优化项目_Batch2_启动包_v1.1`。修改前副本在 `F:\html\Batch2.1_备份_修改前`；项目内 `artifacts/batch2.1/history-batch2/` 保留上一批报告和截图。无 Git 初始化、提交或远端写入。

本轮使用已连接 Figma plugin 的 `get_design_context`、`get_screenshot` 和必要 `get_metadata`，原文件 key 为 `ZbKyQeHug7rM5P88GBSmlY`。先读取本机官方 `figma-design-to-code/SKILL.md`，并读取项目 product-review、visual-qa、build-verify、ai-eval 四套 Skill。只读调用成功，未创建第二个同名 MCP 服务器，未改云端文件。

下表是本轮成功读取的节点。调用发生于 2026-09-05；工具未提供逐请求服务器时间，下列时间为**成功响应文本缓存落盘的 UTC 时间**，不冒充精确请求时间。所有 frame 参考画布均为 390×844。

| 节点 / 实际名称 | 工具与内容 | 缓存时间 UTC |
|---|---|---|
| 48:2 / D_01_Player | context + screenshot；锁定底图、入口控件、整帧像素 | 12:07:57 |
| 48:8 / D_02_Adjust_Default | context + screenshot；三行、444px sheet、按钮、分隔线 | 12:07:59 |
| 50:60 / D_03_Want_Explore_Folk | context + screenshot；分段、Tab、民谣选中 | 12:08:01 |
| 69:45 / D_05_Impact_LongTerm_On | context + screenshot；长期单选、开启 Switch | 12:08:02 |
| 52:20 / D_04_Dont_Default | metadata + context（含返回内嵌截图）；未另存独立 PNG | 12:20:05 |
| 52:41 / D_04_Dont_ArtistSelected | metadata + context + screenshot；音乐人少推选中 | 12:20:07 |
| 52:63 / D_05_Impact_Off | metadata + context + screenshot；仅本次、保护关 | 12:20:09 |
| 52:87 / D_05_Impact_On | metadata + context + screenshot；仅本次、保护开 | 12:20:11 |
| 69:20 / D_05_Impact_LongTerm | metadata + context + screenshot；长期、保护关 | 12:20:12 |
| 52:112 / D_06_Toast_Want | metadata + context + screenshot；想听回执 | 12:20:14 |
| 52:117 / D_07_Toast_Dont | metadata + context + screenshot；少推回执 | 12:20:16 |
| 52:122 / D_08_TemporaryMode | metadata + context + screenshot；临时收听状态先例 | 12:20:18 |

文本及 11 张独立 Figma PNG 位于 `artifacts/batch2.1/figma/`。根 metadata 本轮只返回 `00_Reference`，不足以证明 `03_Demo` 页面归属；以上节点均通过直接 node 调用读取成功，未据此猜测节点或谎报连接失败。R07、当前到期提醒、刷新失败、撤销结果没有对应完整原 frame。

## 设计事实与 V01–V06 结果

390×844 的产品画布单独比较；播放器/根面板/想听/四组合/少推截图已去掉白色演示导航所占的 y。回执、撤销、失败与 AI 为滚动后的详情截图，不能把它们的屏幕 y 当原播放器坐标。原始几何在 `artifacts/batch2.1/geometry-comparison.json`。

| 项目 | Figma 事实 | Batch 2 前 | Batch 2.1 后与必要差异 |
|---|---|---|---|
| V01 播放器 | 唱片外缘约320px、顶部约202；曲名约572；入口48:4为160×44、x76/y520，内部154×28胶囊 | 唱片224、顶部112；曲名360；全宽342×52红入口在574 | 唱片306加外环，顶部202；曲名572；154×44命中区x72/y524，14px圆角轻胶囊；曲线唱臂；合成封面 |
| V02 根面板 | y400/h444；三行约62；按钮48高/24圆角；弱分隔 | y315/h529，亮线和状态占位偏重 | y397/h447，紧凑三行约64；保留已保存、未改禁用、关闭及管理；3px高度差来自可读字号与新增状态 |
| V03 想听 | y243/h601；三段一体，五类别Tab，选中民谣 | h759.6，原生圆点及全部分类纵铺 | y197/h647；原生radio语义的一体分段；五Tab、当前分类、跨类已选摘要；多46px用于现字典、14px辅助文字、清空/返回与状态 |
| V04 影响范围 | 长期页h500，右Radio24，独立Switch52×28 | 四组合683–767左右，框线与checkbox混淆 | 四组合h597/571/655/629（本次关/开、长期关/开）；右Radio与独立Switch；保留新增长期差异确认、双维度说明和返回 |
| V05 R07 | 没有完整旧frame；延续核心控件和层级 | radio/select与标签堆叠、原值说明较密 | 候选差异在前，分段与分类共用组件；null明示未提及；JSON在折叠Product Notes；仍为本地规则模拟 |
| V06 外壳 | 390×844是产品参考，不含案例导航 | 演示外壳与画布位置容易混读，桌面弹层居窗口中心 | 桌面画布390，dialog横向按真实product边界定位；原生模态与外部隔离；不写死所有视口的y |

即时少推保留当前对象绑定、软少推说明、清空及只读黑名单，h670超过原h484。回执保持 revision 与撤销说明，所以不是旧42px单行Toast；提交后若回执在视口外，滚到最近可见位置（instant），不抢焦点。到期提醒仍保护且有明确选择，不用旧单状态胶囊替代已批准行为。

## Token 映射与重建边界

原 `specs/design-tokens.json` 不变；新增 `specs/figma-alignment-tokens.json`，由原生成脚本输出 `src/generated/alignment-tokens.css`，经过 generated drift 检查。

| 用途 | 原值/形态 | 本轮局部值 | 原因 |
|---|---|---|---|
| 装饰分隔 | darkControlBorder #92929F | divider #303036 | 参考原稿弱线；控件轮廓/焦点仍独立 |
| Sheet footer | button radius12 | actionRadius24，原48px高 | 原稿胶囊，不全局改变白色外壳按钮 |
| 轻入口 | 全宽红主按钮 | entryRadius14，深底#141416 | 恢复播放优先级，44px命中区 |
| 分段 | 独立带框radio | #141416轨道/#383840选中，radius24 | 保留radio操作，统一形态；实际轨道48高，比原42高以满足点击目标 |
| 标签 | radius16及原选中颜色 | radius24/#470911；选中文字#FFB5BE | 原#FF3A3D小字对比不足；加勾与描边，不只凭颜色 |
| 范围选择 | 左侧原生radio | 右侧24px，红底白勾，独立控件边界 | 原稿位置关系，保留原生键盘与checked |
| 临时保护 | checkbox形态 | Switch52×28/knob22，外层48高 | 与长期确认checkbox明确区分 |
| 唱片/唱臂 | 224px唱片、粗折线唱臂 | 306px+外环；#09090B/#18181C沟槽；120×170曲臂 | 从原锁定截图测量重建比例；舞台上留106、下留16 |
| 画布/面板 | 混合外壳坐标 | 390/844参考；根444、想听601、影响500、少推484为min-height | 内容自然增长，90dvh上限并内部滚动；不固定y |
| 字号 | 旧Figma辅助11–13px | 沿用项目辅助14/body16/title20 | 当前规格可读性优先；200%文字允许整体词语换行 |

48:3 是一张锁定的真实播放器截图，不能声称 MCP 读取了其内部唱片/歌名组件树。唱片比例、曲线唱臂、歌曲信息位置由实际像素参考测量后重建；合成歌曲和自制几何封面继续使用。原图只在本地审查 artifacts 内，未进入 public/dist。没有整张底图加热区、真实音乐/封面接入或新增下载/评论。

## 最小 UI 状态变化与审查边界

新增仅包含：当前分类Tab的临时UI状态、分类键盘焦点、复用候选编辑器、null恢复按钮、弹层横向定位、回执必要滚动。父级草稿仍持有标签；返回可重置当前展示分类为曲风，但已选值不丢。候选仍先进入草稿，范围/保护仍手动，业务模块、Schema、算法、事件格式、时限和原字典均未修改。

原64张基线保留；对旧基线实际执行曾在320播放器报告32,244差异像素（约14%），证据在 `artifacts/batch2.1/old-baseline-difference.json` 和同名目录。该失败作为本次可预期视觉变更证据保留，未降低阈值。独立目录 `tests/visual/screens.spec.ts-snapshots/batch2.1-candidate/` 的64张图只用于应用回归，**待负责人批准**。最终结果见 [FIGMA_ALIGNMENT_REVIEW](../qa/FIGMA_ALIGNMENT_REVIEW.md)，自主决策详见 [HANDOFF](HANDOFF.md)。
