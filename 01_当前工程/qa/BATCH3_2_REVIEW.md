# Batch 3.2 文档收口自审与正文覆盖

日期：2026-09-06。应用v0.3.2，PRD v0.6，状态需求评审稿。执行依据是本轮用户完整聊天要求，不重新执行旧输入包。以下均为本轮实际执行或明确标注未运行。

## 修改与保留

§01新增211字背景；§05在原三列表强化竞品→需求/设计决策并加参照边界；§07原参数单份折叠、打印完整保留；§12追加5项Open Questions。19节顺序不变；另外15节逐字保留，原3段文字图原样保留，原21表加Q表共22表、静态PNG不变。没有新增竞品事实、需求验证结论或假答案。

清理仅涉及标题区/页脚旧“提交候选”、读者版本日期与状态、原Word来源记录的冗余随附说明（改为真实链接），以及原型参数视觉层级；没有继续删产品细节。旧候选三格式归档于docs/history/batch3-1，旧v0.5.1保留。研究真实性、模型、效果、阈值校准等限制留在原对应章节；§16验收标准及原执行口径保留。源码的Annotations、Demo和暖棕播放器未改。

## 逐节核对

| 节 | 标题 | 正文核对 | 表格 | 文字图 | 引用 | 本轮变化 |
|---|---|---|---|---|---|---|
| 01 | 01｜项目背景、目标与范围 | PASS | 1 | 0 | 1 | 211字背景、标题 |
| 02 | 02｜需求依据 | PASS | 1 | 0 | 2 | 原文逐字保留 |
| 03 | 03｜用户分层口径 | PASS | 1 | 0 | 1 | 原文逐字保留 |
| 04 | 04｜典型任务与交叉分析 | PASS | 2 | 0 | 0 | 原文逐字保留 |
| 05 | 05｜竞品与差异化 | PASS | 1 | 0 | 4 | 需求/设计决策关系、参照边界 |
| 06 | 06｜R03：入口、字段与提交 | PASS | 1 | 0 | 0 | 原文逐字保留 |
| 07 | 07｜推荐与降权规则 | PASS | 1 | 1 | 1 | 参数折叠、非生产说明 |
| 08 | 08｜保存范围与临时收听 | PASS | 2 | 0 | 0 | 原文逐字保留 |
| 09 | 09｜会话生命周期 | PASS | 1 | 0 | 0 | 原文逐字保留 |
| 10 | 10｜页面与操作流程 | PASS | 1 | 1 | 0 | 原文逐字保留 |
| 11 | 11｜服务流程与执行一致性 | PASS | 0 | 0 | 0 | 原文逐字保留 |
| 12 | 12｜异常、数据与依赖 | PASS | 2 | 0 | 0 | Q01—Q05表 |
| 13 | 13｜R07：自然语言候选 | PASS | 1 | 1 | 1 | 原文逐字保留 |
| 14 | 14｜指标定义 | PASS | 1 | 0 | 0 | 原文逐字保留 |
| 15 | 15｜埋点与实验 | PASS | 1 | 0 | 1 | 原文逐字保留 |
| 16 | 16｜验收与追踪 | PASS | 2 | 0 | 0 | 原文逐字保留 |
| 17 | 17｜后续需求与投入 | PASS | 1 | 0 | 0 | 原文逐字保留 |
| 18 | 18｜参考资料 | PASS | 1 | 0 | 0 | 原文逐字保留 |
| 19 | 19｜方案取舍 | PASS | 1 | 0 | 0 | 原文逐字保留 |

## 本轮检查

| 检查 | 本轮实际结果与证据 |
|---|---|
| 不变量、lint、类型、generated drift | PASS；`artifacts/batch3-2/quality-final.log` |
| 单元/契约 | **87/87 PASS**；`artifacts/batch3-2/unit.log`、`artifacts/reports/unit.json` |
| E2E | **107/107 PASS，无跳过、无 flaky**；保留原97项并新增10项；`artifacts/reports/e2e.json` |
| 视觉 | **4/4组 PASS，72次比较**；8张新阅读页候选，64张仍与Batch 3.1旧基线比较；原0.005阈值及断言未改；`artifacts/reports/visual.json` |
| 原验收覆盖 | AC01—AC34均有本轮通过测试对应；`artifacts/batch3-2/acceptance-current.json`；仅本地回归，不升级产品验收 |
| 生产构建 | PASS，`dist/`与页面版本0.3.2一致；原500kB chunk提示仍存在，未降低检查标准 |
| 生产原流程 | PASS；原`production-smoke.mjs`实际执行，离线提交/撤销、无提交整页自动滚动、无外部请求/页面错误；`artifacts/batch3-2/production-smoke.log` |
| 生产阅读链路 | PASS；MD、Word、PDF真实下载SHA256核对，首次加载后离线进入Demo、图片加载、保护/撤销、返回本节；`artifacts/batch3-2/production/result.json` |
| 正文/版式 | 19节、22表、3段原文字图、1PNG；Word全正文与MD规范化比对一致；15个未修改章节逐字一致；`artifacts/batch3-2/final-audit.json`、`body-coverage.json` |
| 四视口/200%/键盘 | 320×740、390×844、768×1024、1440×900各100%/200%，折叠、目录、正文、表格、打印、axe及无横向溢出通过；8组`document/`与原阅读往返测试 |
| 打印/PDF/Word | 浏览器PDF18页A4，Word原生导出13页；全文标题、公式、Q表核验通过。Word13页逐页检查，浏览器全页联系表及公式/Q表关键页检查；`print/`、`word-render/` |
| 冻结/历史保留 | 原播放器、Annotations、业务/存储/data/specs/既有样式和依赖锁hash未变；1375张旧PNG原样保留；旧HANDOFF/审批/README全文保留；`final-audit.json` |
| 文档生成并发锁回归 | PASS；Office临时文件独占时开发服务器仍返回200；`watch-regression.json` |

## 失败、修复与口径

首轮文档定向检查23通过、1失败，因Windows换行导致逐字比较不同；生成器固定LF，未放宽正文断言。首次建立8张新阅读页截图时4组报告缺失基线，creation报告单独保留，未当作通过结果。首次完整运行64通过、43失败：Word生成在artifacts中独占Office临时文件，Vite watcher报EBUSY退出，后续浏览器连接失败；仅在开发配置中忽略artifacts，独占锁回归通过后重新完整执行107项及视觉、构建。上述原始报告均保留，见`document-first.*`、`visual-document-creation.*`、`quality-server-lock-failure.log`、`e2e-server-lock-failure.json`和`dev-server-failure.log`。

额外逐像素核对不是原质量门禁：64张独立保存的非Reader证据中37张完全相同，27张存在原始RGB差异（包括弹层背景及少量文字/焦点差异），因此没有宣称像素完全一致。该探针最初“全部像素相同”的假设不成立，改为如实记录差异，不修改任何原视觉断言、阈值或截图。原Playwright截图断言的比较结果为4组通过；逐像素与感知比较口径不同，独立截图也不是断言内部捕获帧。差异分布完整保存在`frozen-visual-comparison.json`；对照查看了390范围弹层，布局、文案和控件保持一致，源码与旧PNG hash核对也通过。

推荐的LibreOffice渲染器实际尝试后因系统无soffice.exe无法运行；改用已安装Microsoft Word隐藏窗口、只读打开、本地原生PDF导出完成13页验证。没有下载Office组件或使用外部服务。辅助审计脚本的Windows默认编码问题已显式改为UTF-8，不涉及产品代码。

## 未运行

未运行：`pnpm quality`总包装命令及会改写历史界面结果快照的`scripts/summarize.mjs`；其不变量、lint、类型、generated检查、单元、E2E、视觉、构建全部已分别实际执行，AC追踪另存本轮报告。`src/generated/verification.json`保持旧项目概览历史内容，不拿其中旧分数冒充本轮成绩。性能/Lighthouse未重跑，旧88分仅是Batch 3.1历史结果。Figma未实时重读或改写；本轮按冻结范围沿用既有参考和有限差异。真人任务、真实设备、真实模型、线上效果、Firefox/Safari和人工读屏器验证均为NOT_RUN，不宣称通过。打印自动化、浏览器PDF导出与Microsoft Word原生渲染已运行；实体打印机未测试。

## 核心规则未变

频率/强度/熟练度/意图/情境；R03/R04/R07；少推/黑名单；仅本次/长期偏好；临时收听生命周期/跨场景；手动偏好/显式操作/隐式行为排序；返回/取消/具体操作撤销；10秒提示和持久撤销分离；保存成功与刷新失败；保护三态；异常降级；指标方向/意义、A/B四要素、验收标准、方案取舍；R05/R06仍为后续边界。领域源文件/data/specs/存储hash冻结加上本轮原行为回归共同核验。

## 证据与余项

正文截图：artifacts/batch3-2/document/{320,390,768,1440}-{100,200}/；每组含entry、parameters-collapsed、parameters-expanded、questions。往返与原流程另见reader/、annotations/、regression-closeout/、regression-screenshots/。打印页图与原生Word页图分别在print/及word-render/。本轮新阅读页截图是候选，不自动取得负责人设计批准。

Q01—Q05保持待确认。OBS-01刷新失败“继续”的详细提示收起规则、OBS-02 200%文字在真人设备上的理解/占位继续保留；没有定义新关闭行为。旧chunk体积提示存在，本轮未做非必要架构优化。自主决策AD44—AD51及回退方式见完整HANDOFF。
