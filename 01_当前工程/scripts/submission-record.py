"""Prepend this batch's verified handback while preserving all pre-batch history."""
from pathlib import Path
import json
from pypdf import PdfReader
r=Path(__file__).resolve().parents[1]
b=r.parent/'Batch3.1_备份_v0.3.0_20260906'
read=lambda p:json.loads((r/p).read_text(encoding='utf-8'))
unit=read('artifacts/reports/unit.json');e2e=read('artifacts/reports/e2e.json');visual=read('artifacts/reports/visual.json')
assert unit['numPassedTests']==unit['numTotalTests']==87 and unit['numFailedTests']==0
assert e2e['stats']['expected']==97 and e2e['stats']['unexpected']==e2e['stats']['flaky']==e2e['stats']['skipped']==0
assert visual['stats']['expected']==4 and visual['stats']['unexpected']==visual['stats']['flaky']==visual['stats']['skipped']==0
for p in ['artifacts/reports/production-smoke.json','artifacts/batch3-1/production/result.json']:assert read(p)['status']=='PASS'
perf=read('artifacts/reports/performance-summary.json')
assert isinstance(perf['score'],(float,int))
pages=len(PdfReader(r/'artifacts/batch3-1/print/PRD_v0.6_提交候选.pdf').pages)
tables=sum(s['tables'] for s in read('artifacts/batch3-1/body-coverage.json')['sections'])
head=f'''# Batch 3.1｜提交候选整理、研发旁注与指定Figma复刻 · v0.3.1

日期：2026-09-06（Australia/Sydney）。**已完成本地实施、自审和测试；PRD v0.6与新视觉候选仍为负责人待复核。** 本批不是公开发布、真人任务或真实模型验证通过。本文下方完整保留此前Handoff、审批归档与AD01—AD33；后文旧阶段版本和分数仅属于原阶段。

## 执行依据、版本与备份

- 唯一当前输入：用户最新聊天及项目根 `finalization_input/BATCH3_1_CODEX_定稿与播放器复刻.md`，已完整读取；配套正文、来源、标注、参考和内部迁移记录均来自同目录。`netease_submission_prepare/` 已被替代，未执行其旧指令、未混用正文或视觉依据；最初Master Prompt未重跑。
- 实际工程：`F:\\html\\网易云优化项目_Batch2_启动包_v1.1`。开工版本v0.3.0，与上一交付1199文件清单核对，清单中没有额外后续修改；新增权威输入已保留。先备份到 `F:\\html\\Batch3.1_备份_v0.3.0_20260906`，不包含可重装依赖/缓存/Git/真实环境配置。
- 当前应用 **v0.3.1**；正文 **PRD v0.6 提交候选**。没有自动宣称PRD研发批准。v0.2.3已批准功能行为继续作为本批R03/R04/R07基线；其旧黑色/几何封面不是本轮视觉目标。未初始化/提交Git，不改依赖版本或锁文件。
- 新正文SHA256：`4c673b161bcfe829cce85c234d4071e128a673fcde525c2e09913c2d598b94cd`。旧v0.5.1 SHA256：`ee82185ef668fd81ce506d5ca83f33cd4472b264d6ed52bbd52e15ad4bf2786d`。后者原样留档；新正文与候选、Word与提供原件均逐字节一致。

## 已完成

1. 完整接入提供的v0.6候选01—19节，{tables}张表、3段文字图、1张多角色静态PNG与引用保留。网页、MD下载、Word下载、浏览器打印均来自指定原件/正文，未再自由概括。保留频率/强度/熟练度/意图/情境区别、未经真实数据校准的阈值、QQ音乐/Apple Music主竞品、本地解析、生产依赖和真实验证缺口。SRC-01只是输入候选中的来源纠错，本轮未新增行业事实。见 [正文覆盖表](../qa/BATCH3_1_BODY_COVERAGE.md) 和输入内部新旧迁移表。
2. 主阅读外壳精简为正式标题、副标题、小字版本日期、完整目录/搜索/正文下载/打印；内部制作、审批、面试指导、测试分数与宣传不进入默认阅读或打印。旧 `/overview` 保留为历史地址，不放主导航。§06—13仍进入同一现有原型并返回本节，不加载或重置示例，不暂停会话，不静默改草稿；R05/R06仍未实施。
3. 本轮实时只读取得Figma四节点context和截图，download_assets取得原始1170×2532 PNG。按原图暖棕背景、唱片、封面、唱臂、顶部和播放工具层级分层复刻；入口x76/y520、160×44命中、154×28视觉与指定文案实际对齐。原图参考素材只用于授权的本地复刻，没有音频或真实账号。
4. 动态封面/歌曲/音乐人/可访问名称在播放器、队列、少推对象与AI当前候选一致；保持原T01/A01等底层ID和推荐数据。播放模拟、切歌、收藏、队列、快捷少推、调整和反馈为真实组件，未把整张播放器截图充作交互原型。未实现的原图功能仅作非交互上下文。
5. 原型旁侧改为状态对应研发标注，每状态3—5条、需求/验收/章节链接和实际状态。开关只影响说明；原生模态内仍能读标注，背景隔离与焦点循环保留。手机下方说明可折叠，模态说明置顶层折叠区；测试工具位于画布外，默认收起。
6. 保留按具体操作撤销、回执互斥、错误不伪报、10秒与持久撤销分离、保护三态、范围/保护独立、AI采用只入草稿。当前调整/持久恢复/开启或待确认保护仍是产品能力。全播放器取消重复mini player，队列原mini player保留。AD14仍被AD16方案替代，未恢复提交结果的整页自动滚动。

## 本轮实际测试结果

以下全部来自本轮实际执行，不使用旧报告冒充新成绩。最终 `pnpm quality` 退出码0，原断言及0.005视觉阈值保留。

| 检查 | 结果与证据 |
|---|---|
| 权限/事实源不变量、lint、类型、generated drift | PASS；`artifacts/batch3-1/quality-final.log` |
| 单元/契约 | **87/87 PASS**；`artifacts/reports/unit.json`，原单元未删除 |
| E2E | **97/97 PASS，无跳过或flaky**；原87项实质行为＋本批10项；`artifacts/reports/e2e.json` |
| 视觉应用回归 | **4/4组、72张实际比较 PASS**；新`batch3-1-candidate`，阈值0.005；`artifacts/reports/visual.json`。建立候选另有creation报告，不冒充比较运行 |
| AC追踪与生产构建 | PASS；`artifacts/reports/acceptance-executed.json`、`dist/` |
| 正文/下载/打印 | 19节/{tables}表/3文字图/1PNG覆盖PASS；MD、Word生产下载hash一致；PDF **{pages}页A4**，19标题与静态图保留，逐页渲染自审；`artifacts/batch3-1/print/` |
| 四视口与200% | 320×740、390×844、768×1024、1440×900，在100/200%验证正文/表格、自然提交撤销、保护三态、研发标注和模态；自动axe、键盘与无水平溢出断言PASS |
| 阅读↔原型 | 8节往返不创建操作，草稿保持、时钟继续、AI输入离开清理；显示标注不改产品状态，隐藏后持久恢复和保护仍在；E2E与`annotations/` |
| 构建版原流程 | PASS；首次加载后离线提交/撤销、无整页提交滚动、无外部请求/页面错误；`artifacts/reports/production-smoke.json` |
| 构建版正文链路 | PASS；真实MD/Word下载、首次阅读后离线进入原型、所有播放器图片加载、保护/撤销、返回章节与静态图；`artifacts/batch3-1/production/result.json` |
| 性能（本地实验室） | Lighthouse **{round(perf['score']*100)}/100**；LCP **{round(perf['lcpMs'])}ms**，CLS **{perf['cls']}**，TBT **{round(perf['totalBlockingTimeMs'])}ms**；`artifacts/reports/performance-summary.json`及原始HTML/JSON，非现场INP |
| 保留审计 | 855张开工前PNG、旧PRD、全部旧HANDOFF/审批/README历史不变；data/specs/领域代码/存储/原ProductFeedback及依赖锁未改；`artifacts/batch3-1/audit.json` |

完整失败与修正链见 [本批自审](../qa/BATCH3_1_REVIEW.md)。首轮56通过31失败、第二轮94通过3失败，以及最终前一轮96通过1失败均保留原报告；问题涉及外层标题/授权展示选择器、原生历史恢复滚动、模态视口锚点、工具区占用反馈空间和首次初始化等待。修复后25项异常/过期针对性回归及完整97项通过，没有删断言、延长撤销资格或跳过失败。新的辅助脚本lint问题也先修复后重新全链执行。

## Figma差异与自审结论

实际只读文件/节点：`ZbKyQeHug7rM5P88GBSmlY` / 48:2、48:8、50:60、69:45；48:3为原始图层。原PNG、截图、context、切片与对象映射出处见 `artifacts/batch3-1/figma/`。对照包含Figma/新实现并排、半透明叠加、差异图、Figma/旧v0.3.0/新v0.3.1三列，**完整画布零遮罩排除**。输入弹层灰底仅在参考图上按context重建背景，原输入同时保留。

本次静态层已实际改为指定暖棕播放器；动态文字和必要控件不承诺像素完全相同。主要有限差异：原模拟时长03:21而非原图03:59；浏览器字体/高对比度选中颜色/44px可访问目标；冻结标签字典不换成原图词项；取消、返回、清空、标签计数、长期差异确认与持久撤销为已批准扩展；未实现“金曲讲解”浮动功能。100%画布自然流约846px，200%使用正常换行与可滚动内容，不以裁切或缩字充数。七组逐项检查、全部差异数字和原因在自审及 `comparisons/measurements.json`。

常规视觉截图可为比较主动定位画布，**不作为自然提交可见证据**；自然四步图另在 `regression-closeout/natural/`，保留无额外整页滚动与无遮挡断言。默认/总面板/影响范围三类旁注状态图在 `annotations/`；四视口72状态联系表在 `visual-review/`。早期新候选也分档保存，未覆盖旧Beta或Batch3图片。

## Autonomous Decisions / 自主决策记录（AD34—AD43）

所有选择限本轮授权显示/文档/测试范围；下表均建议负责人按对应候选复核，未发生产品规则自行升级。

| ID | 问题与备选 | 最终选择与原因 | 代价、PRD/Figma差异 | 影响文件 | 验证与回退 |
|---|---|---|---|---|---|
| AD34 | 新候选与旧原文并存；可改写旧稿、混合旧稿或独立接入 | 新v0.6逐字节接入，旧v0.5.1完整留档；外壳精简、历史路由隐藏于主导航 | 不新概括；候选SRC-01来源纠错待负责人审；历史阅读入口改为非主导航是本轮明确授权 | Reader.tsx、docs/PRD_v0.6.md、SOURCES_v0.6.md、public/documents、package.json | 19节全文/下载hash/来源覆盖；回退Reader引用与版本外壳，保留两稿；建议复核正文与来源 |
| AD35 | 原始截图包含复杂唱片；可猜画、整页热区或分层切片 | 下载授权raw分层，原唱片/唱臂静态保真，动态封面/文本/按钮为组件；T01/A01显示映射统一所有场景 | 增加本地PNG，其他6封面由同一授权画面派生；原数据ID/排序/时长不变，素材只限本地 | ReferencePlayer.tsx、playerPresentation.ts、assets/player、prepare_submission.mjs | 真切歌/收藏/对象锁定/AI草稿与Figma四组图；回退显示组件/映射，不回滚业务存储；建议复核素材和对象一致性 |
| AD36 | 参考像素与实际交互/可访问性有差异；可强缩放或保留真实DOM | 固定390参考几何，44px目标/动态字重/200%换行；未实现图标仅非交互上下文 | 字体/红色/03:21时长/原图浮动提示有明示差异，正文与控件在200%需滚动 | ReferencePlayer.tsx、submission.css | 坐标/Figma并排叠加差异、四视口200%、axe与键盘；回退局部样式和参考层；建议复核静态层与可访问差异 |
| AD37 | 说明需随状态且模态时可读；可解锁背景、复制产品或放同一顶层 | JSON映射实际状态，只读标注；模态说明在同一原生dialog内，桌面右侧/手机折叠；数字不截获输入 | 手机空间紧，说明需展开并内部滚动；不新增产品控件或执行入口 | Annotations.tsx、Demo.tsx、submission.css | 8视口字号组合状态不变/焦点链接/背景隔离/保护草稿与生效区分；回退标注组件与外壳；建议复核3—5条说明与章节 |
| AD38 | 画布外工具过长令反馈无可见空间；可改变回执或限制工具布局 | 手机工具在画布前、故障项置前、最大min(320px,35dvh)内部滚动；默认折叠 | 工具使用需滚动；只影响演示层，不改反馈/撤销/保护规则 | Demo.tsx、submission.css | 25项失败/保护/过期针对性＋全97E2E，ProductFeedback hash不变；回退工具布局但需重验可见性；建议复核手机故障操作 |
| AD39 | 原生历史恢复滚动及模态锚点使返回/撤销偏位；可自动scrollTo或限制浏览器恢复 | Demo活动期间manual scrollRestoration，离开恢复原值；弹层底部限制在视口可用范围 | 用户后退不会自动恢复旧Demo滚动；章节主动定位保留。AD14不复活，AD16画布反馈保持 | Demo.tsx | 四视口键盘撤销/浏览器后退/无提交滚动/模态隔离；回退两个局部布局effect；建议复核返回与键盘体验 |
| AD40 | 重复解释拉长底部面板偏离参考；可删规则或折叠说明 | 默认无脏字段不重复状态，想听辅助段落进“设置说明”，影响摘要进“本轮选择说明”；标题按参考，规则原句保留 | 比原图多必要规则控件；说明需主动展开，不改确认资格/范围/保护 | Demo.tsx、submission.css | 默认平衡无标签、四组合、长期差异确认、200%与候选截图；回退折叠布局和标题；建议复核信息层级 |
| AD41 | 先读文档后离线进入原型可能缺新图片；可联网后加载或提前本地预载 | 阅读入口预载本地player素材，使首次加载后离线关联流程可用 | 首次阅读请求较多本地PNG，性能有成本；无外部请求、无业务状态写入 | App.tsx、playerPresentation.ts | 构建版首次读文档后离线全部player图complete且流程通过；回退预载则重新注明离线范围；建议结合本地性能复核 |
| AD42 | 旧展示断言与授权新文案冲突；可删旧测试或迁移显示定位 | 保留原行为、改具体展示选择器与原文源核对；追加10项必要验证，新72候选独立归档 | 候选建立不是批准；0.005阈值/87单元/原87E2E实质断言不降。存储初始化等待只等待真实完成 | tests/helpers、tests/e2e、tests/visual、production-smoke.mjs、QA脚本 | 最终87+97+72实际通过；旧→新断言表见自审；回退展示定位与候选路径，保留失败报告；建议抽查迁移覆盖 |
| AD43 | 工程审查资料与提交阅读需分离；可单一巨包或两个包 | 完整工程含历史/输入/证据；另产构建站+新MD/Word/PDF/来源/规则附件的干净阅读包；打印只改间距和分页 | 双包增加体积；新PDF来自网页，Word保留输入原件；未公开发布。辅助审计需本机旧备份路径 | README、HANDOFF、APPROVAL、submission.css、package_submission.py | 两ZIP全文件hash/CRC、真实下载、{pages}页PDF/19标题/静态图；回退打包清单/打印样式，不删旧交付；建议复核提交阅读包 |

## 剩余问题与未运行项

- **OBS-01原样保留**：刷新失败后的“继续”只回播放器，尚未定义完整收起规则，本批不自行改变。
- **OBS-02原样保留**：200%下反馈占位较大；自动布局和键盘检查不等于真人设备理解/遮挡验证。新增工具区内部滚动不是对此观察的产品定论。
- Vite默认大chunk提示保留，未上调阈值；完整Markdown与原型同包，本地素材预载增加首屏成本。性能为上述本地实验室观测，不是线上优化结论。
- 真人任务、真实设备触摸/读屏、Safari/Firefox、真实模型、真实账号/音频、线上效果与现场INP未执行（NOT_RUN/NOT_MEASURED）。Word只验证提供原件的结构/章节/嵌图与下载hash，未在Microsoft Word逐页独立排版复测；网页PDF已逐页渲染自审。
- 新PRD候选/SRC-01/本批视觉均待负责人复核；原v0.2.3负责人审查方式保留下方原始记录，未改写成负责人独立重跑本批测试。未发现必须改变冻结业务契约才可完成的阻断冲突。
- 未调用真实AI/API、未读取密钥、未接账号/音频、未付费/遥测/公开部署/远端推送/Git初始化提交/云端Figma写入。

## 预览与交付位置

完整工程解压后执行 `node scripts/serve-dist.mjs` 或原预览cmd，需Node24；打开 `http://127.0.0.1:4173/`。主入口是完整PRD，`/#/demo`为同一交互原型，`/#/overview`仅历史地址。源码开发沿用 `pnpm dev`，完整验证为 `pnpm quality`。真实下载为本地服务的实际MD/Word，不指向F盘或聊天路径。

交付目录：`F:\\html\\Batch3.1_交付_v0.3.1`。

- `网易云推荐控制_Batch3.1_v0.3.1_完整项目.zip`：构建、源码、v0.6及完整旧稿、输入、全部旧截图、本批候选/自然步骤/旁注三状态/Figma对照/正文迁移/测试原始报告/完整HANDOFF。排除可重装依赖缓存、真实环境配置和被替代旧输入目录；不要求拼接旧包。
- `网易云推荐控制_PRD_v0.6_提交阅读包_候选.zip`：构建网站、新MD/Word/{pages}页PDF、来源、规则附件、图示与简明本地运行说明；无Handoff、Prompt、历史截图和制作审批日志。执行 `node server.mjs` 后本地阅读，不双击dist/index.html。
- `Batch3.1_完整HANDOFF.md`为本文件完整副本；`Batch3.1_审查报告.md`为本批自审副本；`交付校验.json`包含两个包的SHA256、全文件清单、逐文件hash与CRC结果。

负责人建议集中检查四项：v0.6正文/来源候选；暖棕播放器与四节点有限差异；标注与200%下的独立体验；OBS-01/02和真实任务验证准备。无需逐项审批普通实现细节。

---

'''
approval='''# 当前阶段 · Batch 3.1 / PRD v0.6与原型v0.3.1提交候选待复核

2026-09-06。当前唯一输入为用户最新聊天确认的 `finalization_input/`；旧 `netease_submission_prepare/`已被替代，未执行。本批文本/显示/研发旁注按新授权实施，R03/R04/R07业务规则维持已批准语义。

| 项目 | 当前阶段 |
|---|---|
| v0.2.3及closeout-candidate | 既有批准与全部旧图保留；功能回归基线继续有效 |
| v0.3.0及旧v0.5.1 | 完整历史归档，不覆盖历史结论 |
| PRD v0.6候选与SRC-01 | 已按指定输入接入/验证；负责人待复核，未自行标为研发批准 |
| v0.3.1暖棕播放器、阅读壳和研发标注 | 本地实施、自审与测试完成；新候选待负责人复核 |
| AD34—AD43 | 本批有限自主决策详见HANDOFF；AD01—AD33完整保留，AD14仍为已被替代历史方案 |
| OBS-01、OBS-02 | 保留观察，未新增产品规则 |
| 真人任务/设备/真实模型/线上结果 | NOT_RUN，未发生的验证不升级状态 |
| 公开发布/素材公开使用 | 未授权；参考复刻仅在本地范围 |

本批87单元、97E2E及72张候选比较为Codex本轮执行，不是负责人独立重跑。原负责人浏览器被ERR_BLOCKED_BY_ADMINISTRATOR阻止的归档仍保留原文，未改写。详见HANDOFF顶部及原始报告。

---

'''
readme='''# 网易云音乐｜推荐控制链路优化 · Batch 3.1 v0.3.1

PRD v0.6提交候选＋可交互本地代码原型。当前输入仅为 `finalization_input/`，旧输入已替代；产品规则保持v0.2.3批准行为。新正文与暖棕Figma参考复刻已完成本地自审和测试，仍待负责人复核。

预览：Node24下执行 `node scripts/serve-dist.mjs`，打开 http://127.0.0.1:4173/ 。源码开发与质量检查仍为 `pnpm dev` / `pnpm quality`。主页完整PRD可搜索、定位、下载MD/Word和打印；章节进入同一个原型再返回，保留草稿。显示标注可关闭，测试工具默认折叠。旧 `/overview` 仅为历史路由。

完整交接见 [HANDOFF](docs/HANDOFF.md)、[本批自审](qa/BATCH3_1_REVIEW.md)、[正文覆盖](qa/BATCH3_1_BODY_COVERAGE.md)。`artifacts/batch3-1/`含新旧文字去向、Figma对照、三状态旁注、四视口/200%与自然回执证据。另有不含内部记录的提交阅读ZIP；工程ZIP保留全部历史，不需拼接旧包。

准备/归档脚本中的一次性迁移不要重复执行；审计脚本依赖本机旧备份/上一交付清单，常规预览和构建不依赖这些路径或Python。`prepare_submission.mjs`可基于已下载本地raw重新生成同源切片，不需要远程Figma。

以下是完整历史说明，旧版本/状态以其阶段解释；顶部HANDOFF是当前交付入口。

---

'''
for path,prefix in [('docs/HANDOFF.md',head),('docs/APPROVAL_STATUS.md',approval),('README.md',readme)]:
 old=(b/path).read_text(encoding='utf-8')
 current=(r/path).read_text(encoding='utf-8')
 assert old in current, path
 (r/path).write_text(prefix+old,encoding='utf-8')
print('Verified current handback and stage record prepended; all prior history retained.')
