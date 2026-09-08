"""Archive this batch without rewriting prior handback or approval history."""
from pathlib import Path
import json
r=Path(__file__).resolve().parents[1];b=r.parent/'Batch3.2_备份_v0.3.1_20260906'
def write(path,text):
 (r/path).write_text(text,encoding='utf-8',newline='\n')
coverage=json.loads((r/'artifacts/batch3-2/body-coverage.json').read_text(encoding='utf-8'))
table='| 节 | 标题 | 正文核对 | 表格 | 文字图 | 引用 | 本轮变化 |\n|---|---|---|---|---|---|---|\n'
changes={'01':'211字背景、标题','05':'需求/设计决策关系、参照边界','07':'参数折叠、非生产说明','12':'Q01—Q05表'}
for s in coverage['sections']:
 table+=f"| {s['id']} | {s['title'].removeprefix('## ')} | {s['status']} | {s['tables']} | {s['staticTextDiagrams']} | {s['references']} | {changes.get(s['id'],'原文逐字保留')} |\n"
tests='''| 检查 | 本轮实际结果与证据 |
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
'''
failures='''首轮文档定向检查23通过、1失败，因Windows换行导致逐字比较不同；生成器固定LF，未放宽正文断言。首次建立8张新阅读页截图时4组报告缺失基线，creation报告单独保留，未当作通过结果。首次完整运行64通过、43失败：Word生成在artifacts中独占Office临时文件，Vite watcher报EBUSY退出，后续浏览器连接失败；仅在开发配置中忽略artifacts，独占锁回归通过后重新完整执行107项及视觉、构建。上述原始报告均保留，见`document-first.*`、`visual-document-creation.*`、`quality-server-lock-failure.log`、`e2e-server-lock-failure.json`和`dev-server-failure.log`。

额外逐像素核对不是原质量门禁：64张独立保存的非Reader证据中37张完全相同，27张存在原始RGB差异（包括弹层背景及少量文字/焦点差异），因此没有宣称像素完全一致。该探针最初“全部像素相同”的假设不成立，改为如实记录差异，不修改任何原视觉断言、阈值或截图。原Playwright截图断言的比较结果为4组通过；逐像素与感知比较口径不同，独立截图也不是断言内部捕获帧。差异分布完整保存在`frozen-visual-comparison.json`；对照查看了390范围弹层，布局、文案和控件保持一致，源码与旧PNG hash核对也通过。

推荐的LibreOffice渲染器实际尝试后因系统无soffice.exe无法运行；改用已安装Microsoft Word隐藏窗口、只读打开、本地原生PDF导出完成13页验证。没有下载Office组件或使用外部服务。辅助审计脚本的Windows默认编码问题已显式改为UTF-8，不涉及产品代码。
'''
notrun='''未运行：`pnpm quality`总包装命令及会改写历史界面结果快照的`scripts/summarize.mjs`；其不变量、lint、类型、generated检查、单元、E2E、视觉、构建全部已分别实际执行，AC追踪另存本轮报告。`src/generated/verification.json`保持旧项目概览历史内容，不拿其中旧分数冒充本轮成绩。性能/Lighthouse未重跑，旧88分仅是Batch 3.1历史结果。Figma未实时重读或改写；本轮按冻结范围沿用既有参考和有限差异。真人任务、真实设备、真实模型、线上效果、Firefox/Safari和人工读屏器验证均为NOT_RUN，不宣称通过。打印自动化、浏览器PDF导出与Microsoft Word原生渲染已运行；实体打印机未测试。
'''
decisions=[
('AD44','背景与竞品关系需要补足，避免增加行业报告','扩写新资料/增设宽列；或原表第三列强化关系','新增211字背景，保留原目标/范围；原第三列改为主要支持需求/设计决策并标注R03/R04/R05/R07','使用用户授权事实和原来源，保留QQ与Apple主竞品定位及参照非需求证明的边界','原列标题改变，未新增行业事实；保持三列减少窄屏负担','无产品/Figma差异，§01/§05文档补充','docs/PRD_v0.6.md、对应Word/PDF、scripts/batch32-content.py、batch32-word.py','19节正文比对、211字计数、竞品旧内容/来源保留','从备份恢复§01/§05并重新生成同源下载','建议复核背景措辞与关系'),
('AD45','需要列出待确认，但保持19节及OBS行为','新增第20节；或现有依赖节末添加','在§12依赖后加Q01—Q05表，不填答案','最接近依赖和开发风险的阅读位置，保持原章节定位','§12增加一表；原文其余15节不变','无规则变化；Q03仍待确认，OBS-01关闭规则未实现','docs/PRD_v0.6.md、Word/PDF','逐项比对ID/角色/节点，无虚构姓名日期','移除新增Q表并重新生成下载','建议对应协作角色后续确认'),
('AD46','本地权重不能与正式规则同级，又需搜索/打印完整','隐藏/删除；复制打印正文；或单份原文原生折叠','§07原生details默认闭合；搜索到本节主动展开；打印临时展开并恢复原先状态','单份正文避免版本分叉，原生键盘可用，不触发产品状态','增加打印前后状态维护；搜索§07会展开整个参数区','只有文档层级变化，权重/公式/少推规则未改；Figma无差异','src/Reader.tsx、src/reader-final.css、src/main.tsx','4视口×2字号、键盘/搜索、打印前闭/开两种恢复、公式全文测试','恢复Reader/main和移除reader-final.css后重建','建议复核默认折叠与打印展开'),
('AD47','读者看到的版本/状态需与真实构建及档案一致','仍显示旧0.3.1；或内部与外部同升0.3.2','应用0.3.2；PRD仍0.6；标题区需求评审稿；旧候选MD/Word/PDF完整归档','网页有新增折叠与下载功能，应辨别构建；不自动升级PRD或产品批准','0.3.2仅代表本次阅读层构建；历史候选仍占归档空间','元信息清理，无产品规则/视觉变化','package.json、index.html、Reader、docs/history/batch3-1、公开下载','生产页面版本、真实下载hash、历史hash及禁止旧状态文案断言','恢复备份元数据与旧构建，不删除本轮归档','建议确认需求评审稿状态'),
('AD48','三个下载格式一致且原Word模板需保留','重写Word；或在原件局部编辑；无LibreOffice时停下或用现有Word','原Word局部修订、A4与表/图保持；用本地Word原生渲染；网页导出完整PDF','避免重新概括和排版分叉，借助已装Word验证实际中文分页','Word13页/网页PDF18页，分页非逐页相同；移除旧蓝标题边线和候选页脚；来源文字改实际相对链接','文本与规范化图注完全同源，仅媒介分页和字级差异；Figma不变','scripts/batch32-word.py、batch32-export.mjs、public/documents、word-render/、print/','Word全正文对MD、22表1图、两PDF19标题/公式/Q表、页图自审、生产下载hash','从docs/history恢复原件，重新生成对应版本，不覆盖原归档','建议抽查Word/PDF表格和分页'),
('AD49','Word生成独占临时文件让Vite watcher退出','停止文档生成；或只忽略产物目录','仅开发watcher忽略**/artifacts/**','归档产物无需热更新，避免Office锁影响本地质量检查','artifacts内文件不触发开发热重载','无生产构建或产品规则变化','vite.config.ts','Office独占文件时HTTP200；完整107E2E及构建再通过','删除新增watch配置','无需产品复核'),
('AD50','需要新文档证据但不能重定义旧产品基线/验收','统一更新全部截图/生成旧概览分数；或隔离新阅读证据','8张Reader新候选，64张旧图继续原门禁比较；原97E2E保留加10项；单独归档当前AC追踪','保留产品覆盖和历史审批；不让工程成绩进入主阅读页','未运行会改历史结果快照的quality总包装；各原门禁实际单独执行；原始像素不同如实记录','产品源码/旧PNG/0.005阈值不变；新Reader候选不是负责人批准','tests/e2e、tests/visual/screens.spec.ts、scripts/batch32-evidence.py、artifacts/batch3-2','87单元、107E2E、4视觉组、AC01—34及冻结hash审计','保留当前证据后恢复旧测试路径/Reader候选选择；不删除旧断言','建议按需要查看文档新截图，无需重审播放器设计'),
('AD51','需可独立交付的完整工程与阅读包','只给增量；或工程历史全包加简洁阅读包','工程包含源码/构建/历史/截图/报告，排除可重装依赖与缓存；阅读包含构建、本地server、MD/Word/PDF/来源/规则附件','用户不必拼接旧包，读者默认不看到内部流水线文件','工程包较大；阅读预览需Node本地服务，不支持直接双击HTML','不发布、不新增服务/功能，读者正文相同','scripts/batch32-package.py、交付目录','ZIP CRC和逐文件SHA256、三格式生产下载、旧PNG保留、HANDOFF副本比对','保留源码，删除本轮交付目录中的已核验包后可重新打包；不得递归操作其他目录','建议打开最终阅读包确认用途')]
decision_text=''
for id,problem,options,choice,reason,cost,diff,files,verify,rollback,review in decisions:
 decision_text+=f'### {id}\n\n- 问题：{problem}。\n- 备选方案：{options}。\n- 最终选择：{choice}。\n- 原因：{reason}。\n- 代价：{cost}。\n- 与PRD/Figma差异：{diff}。\n- 影响文件：{files}。\n- 验证：{verify}。\n- 回退方式：{rollback}。\n- 后续复核建议：{review}。\n\n'
review='''# Batch 3.2 文档收口自审与正文覆盖

日期：2026-09-06。应用v0.3.2，PRD v0.6，状态需求评审稿。执行依据是本轮用户完整聊天要求，不重新执行旧输入包。以下均为本轮实际执行或明确标注未运行。

## 修改与保留

§01新增211字背景；§05在原三列表强化竞品→需求/设计决策并加参照边界；§07原参数单份折叠、打印完整保留；§12追加5项Open Questions。19节顺序不变；另外15节逐字保留，原3段文字图原样保留，原21表加Q表共22表、静态PNG不变。没有新增竞品事实、需求验证结论或假答案。

清理仅涉及标题区/页脚旧“提交候选”、读者版本日期与状态、原Word来源记录的冗余随附说明（改为真实链接），以及原型参数视觉层级；没有继续删产品细节。旧候选三格式归档于docs/history/batch3-1，旧v0.5.1保留。研究真实性、模型、效果、阈值校准等限制留在原对应章节；§16验收标准及原执行口径保留。源码的Annotations、Demo和暖棕播放器未改。

## 逐节核对

'''+table+'''
## 本轮检查

'''+tests+'''
## 失败、修复与口径

'''+failures+'''
## 未运行

'''+notrun+'''
## 核心规则未变

频率/强度/熟练度/意图/情境；R03/R04/R07；少推/黑名单；仅本次/长期偏好；临时收听生命周期/跨场景；手动偏好/显式操作/隐式行为排序；返回/取消/具体操作撤销；10秒提示和持久撤销分离；保存成功与刷新失败；保护三态；异常降级；指标方向/意义、A/B四要素、验收标准、方案取舍；R05/R06仍为后续边界。领域源文件/data/specs/存储hash冻结加上本轮原行为回归共同核验。

## 证据与余项

正文截图：artifacts/batch3-2/document/{320,390,768,1440}-{100,200}/；每组含entry、parameters-collapsed、parameters-expanded、questions。往返与原流程另见reader/、annotations/、regression-closeout/、regression-screenshots/。打印页图与原生Word页图分别在print/及word-render/。本轮新阅读页截图是候选，不自动取得负责人设计批准。

Q01—Q05保持待确认。OBS-01刷新失败“继续”的详细提示收起规则、OBS-02 200%文字在真人设备上的理解/占位继续保留；没有定义新关闭行为。旧chunk体积提示存在，本轮未做非必要架构优化。自主决策AD44—AD51及回退方式见完整HANDOFF。
'''
write('qa/BATCH3_2_REVIEW.md',review)
handoff='''# Batch 3.2｜PRD最终收口 · 应用v0.3.2 / PRD v0.6

日期：2026-09-06（Australia/Sydney）。**本轮已完成文档接入、局部阅读实现、自审与回归；面向读者状态为“需求评审稿”。** 未重定义既有产品验收、未重新设计播放器；新阅读呈现仍供负责人最终检查。以下历史、AD01—AD43和旧截图全部保留。

## 执行依据、开工核对与备份

- 唯一执行依据：用户本轮“Batch 3.2｜PRD最终收口”完整聊天。没有等待新附件、没有重跑Master Prompt、没有执行被替代输入。
- 实际项目：`F:\\html\\网易云优化项目_Batch2_启动包_v1.1`；开工读取AGENTS、既有Skills、package、PRD、HANDOFF、Reader、Annotations和生产构建。基线v0.3.1/PRD v0.6。对照前交付1837项文件清单，仅`artifacts/batch3-1/package-result.log`属于交付后日志变化，已保留；未发现后续源码/PRD/旁注/构建修改。
- 修改前备份：`F:\\html\\Batch3.2_备份_v0.3.1_20260906`；保留源文件、构建及历史，不含可重装依赖、缓存、Git和真实环境文件。旧v0.6候选MD/Word/PDF另原样归档到`docs/history/batch3-1/`；v0.5.1未改。
- 因新增文档折叠、打印恢复及PDF下载，应用版本升为**v0.3.2**，package、生产构建与读者原型版本一致；PRD仍为**v0.6**，不自动升版或批准。依赖及锁文件未变。

## 已完成、原因与内容迁移

1. §01改为“项目背景、目标与范围”，原目标/范围之前增加211字背景，仅使用用户给定事实。§05保留原来源和表内容，强化网易云→R03、QQ→R07、Apple→R04、Spotify→R04/R05，并明确竞品能力不证明用户需求。
2. §12依赖之后增加Q01—Q05待确认表，不增第20节、不填写假答案/姓名/日期；Q03与OBS-01保留待决。
3. §07公式、权重及解释完整保留，网页默认折叠“原型验证参数（非生产规则）”；搜索可展开匹配区域，打印展开并恢复阅读状态。明确本地交互验证参数不是正式推荐算法，正式权重待推荐团队评估与实验。
4. 标题区改为正式标题、副标题、`PRD v0.6 · 原型 v0.3.2 · 2026-09-06`及“状态：需求评审稿”。旧“提交候选”移入历史档案；未在主阅读页加入Batch、待审批、NOT_RUN大块或工程流水线。原章节中的真实性/模型/线上效果/阈值限制和验收内容继续保留。
5. MD、Word、PDF及真实下载同步；Word全正文规范化比对与MD一致，网页逐节正文/表/图/引用比对通过。Word沿用模板局部改动，候选页脚改需求评审稿、冗余来源随附说明改真实链接；打印完整公式且低于规则层级。
6. 核心规则、暖棕播放器、唱片/唱臂/封面、入口、Bottom Sheet、Annotations和既有Figma差异冻结。保留具体操作撤销、草稿/确认、保护三态、AI仅入草稿、10秒提示与持久资格、少推/黑名单和生命周期。无源文件规则变更，原回归覆盖仍在。

详细19节覆盖、失败修复和截图索引见`qa/BATCH3_2_REVIEW.md`。15个未授权修改章节逐字保留，3段文字图原样保留；22表/1PNG均核对。1375张旧PNG逐文件hash保留。

## 实际重新执行

'''+tests+'''
## 未运行与验证边界

'''+notrun+'''
## 自审修复与剩余问题

'''+failures+'''
没有已知阻断本次文档交付的问题。Q01—Q05须由对应角色在表列节点前确认；OBS-01/OBS-02仍是原观察项，不以本次文档整理决定新行为。构建chunk提示保留。文档自动化通过不等于研究真实性、真人任务、真实模型或上线效果已经通过。AD14仍为被AD16替代的历史方案。

## Autonomous Decisions / 自主决策记录

编号延续AD43；以下全部为本轮非机械性判断，未更改已冻结产品语义。

'''+decision_text+'''## 预览、最终文件与回退

- 本地生产预览：项目根执行`node scripts/serve-dist.mjs`，浏览器打开`http://127.0.0.1:4173/`。当前交付构建0.3.2；`/#/demo`为同一现有原型。端口已开时直接访问。仅监听本机。
- 最终正文：`docs/PRD_v0.6.md`；Word：`public/documents/PRD_v0.6_需求评审稿.docx`；PDF：`public/documents/PRD_v0.6_需求评审稿.pdf`。对应构建内真实下载已核验。
- 完整工程ZIP：`F:\\html\\Batch3.2_交付_v0.3.2\\网易云推荐控制_Batch3.2_v0.3.2_完整工程.zip`。
- 最终提交阅读包ZIP：`F:\\html\\Batch3.2_交付_v0.3.2\\网易云推荐控制_PRD_v0.6_最终提交阅读包.zip`。含可本地打开的生产站点、server、正文三格式、来源/规则附件；无需拼接旧包。
- 完整HANDOFF副本：同交付目录`Batch3.2_完整HANDOFF.md`；详细自审副本`Batch3.2_自审报告.md`。逐文件hash/ZIP CRC结果见交付目录`交付校验.json`，打包后复核见`交付最终复核.json`。
- 工程包保留全部源、构建、旧图、历史和新证据，排除依赖安装目录、缓存、Git、Office临时文件、真实环境配置和已被替代的netease_submission_prepare输入。回退按AD条目使用修改前备份恢复相关文件并重建；不回滚其他后续工作，不覆盖本轮归档。

## 权限执行

仅本地文件、构建、模拟浏览器测试和已安装Word渲染。未调用真实AI/API、读取密钥、接真实账号/音频、付费、增加遥测、公开部署、远端写入、初始化/提交Git或修改云端Figma。

---

以下为原始历史，保持原文，其旧版本、候选状态与测试分数不代表本轮状态。

'''
write('docs/HANDOFF.md',handoff+(b/'docs/HANDOFF.md').read_text(encoding='utf-8'))
write('docs/APPROVAL_STATUS.md','''# 当前阶段 · Batch 3.2 文档收口 / PRD v0.6需求评审稿 / 原型v0.3.2

2026-09-06。执行依据为用户本轮聊天。文档修订与本地测试完成，读者状态“需求评审稿”。应用升0.3.2仅标识阅读层代码/真实下载变更；PRD不自动升版。本轮不授予新的产品、视觉、真人、模型或公开发布批准。用户冻结的暖棕播放器、研发旁注与R03/R04/R07规则保持；新Reader截图候选供最终检查。

实际执行87单元、107E2E、4组72次视觉、生产构建/链路、19节三格式核验通过；未重跑性能或真人/真实模型实验。AD44—AD51记录于HANDOFF；AD01—AD43和以下历史原样保留。Q01—Q05待确认，OBS-01/02不变。详细口径见qa/BATCH3_2_REVIEW.md，不能将历史结果当作本轮成绩。

---

'''+(b/'docs/APPROVAL_STATUS.md').read_text(encoding='utf-8'))
write('README.md','''# 网易云音乐｜推荐控制链路优化 · 当前阅读版本

PRD v0.6 · 原型 v0.3.2 · 2026-09-06 · 状态：需求评审稿。

本轮仅文档收口；播放器、研发旁注和核心规则冻结。详情见[完整HANDOFF](docs/HANDOFF.md)与[本轮自审](qa/BATCH3_2_REVIEW.md)。正文见[PRD](docs/PRD_v0.6.md)，Word/PDF在public/documents/。已有生产构建可在项目根执行`node scripts/serve-dist.mjs`并打开http://127.0.0.1:4173/；开发执行`pnpm dev`。工程包未包含node_modules，可按锁文件安装后开发；本地预览dist只需Node。

完整工程与提交阅读包位于`F:\\html\\Batch3.2_交付_v0.3.2`。以下原README完整保留，其中旧版本/测试分数仅属历史。

---

'''+(b/'README.md').read_text(encoding='utf-8'))
print('Batch 3.2 review, 19-section coverage, HANDOFF AD44–AD51, approval record and README written; prior text preserved.')
