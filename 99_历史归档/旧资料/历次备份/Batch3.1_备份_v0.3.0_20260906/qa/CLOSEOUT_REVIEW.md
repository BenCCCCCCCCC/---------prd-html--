# Batch 2.1 收尾审查 · v0.2.3

日期：2026-09-06（Australia/Sydney；执行日志使用UTC）。依据为用户聊天确认的 [完整执行要求](../docs/BATCH2_1_CLOSEOUT_CODEX.md)。这是现有项目的定向收尾，没有重跑Master Prompt或整轮Figma对齐。新视觉基线为**负责人待复核**。

## 先复现，再修复

v0.2.2交付清单536个文件与工作区一致；修改前备份保留。旧页面自然操作记录 `artifacts/closeout/reproduction/observed.json` 显示：提交前scrollY=0，提交后=207；撤销后仍有“仅本次已保存 · 探索 / 民谣 · revision 1”和可用撤销按钮，并另追加“已撤销本轮调整”。截图脚本没有额外scroll调用。

实际根因：字符串回执独立于最新operation；Toast的撤销读取 `operations.at(-1)`；成功撤销只改message不替换receipt；AD14主动scrollIntoView；失败提示统一说保护继续。已在UI层修复，domain/存储/规则配置保留原哈希。

## 结果与证据

| 事项 | 修正及验证 |
|---|---|
| 回执对应操作 | 回执记录operationId、saved/undone/error状态；按钮传入本条回执的ID。新增A回执之后发生独立B管理操作，再点A撤销：断言撤销事件targetOperationId=A，B不被误撤销 |
| 成功、失败、冲突 | 成功替换为“已撤销本轮调整”，移除旧保存文案及本条撤销按钮；冲突/过期调用原undo校验，显示真实错误、不显示成功 |
| 10秒与持久入口 | 本条receipt绝对截止点不因撤销换文案重置；10秒消失后仍可在“当前调整与恢复”执行符合既有规则的撤销。已撤销/相关变更后禁用持久入口，不改变domain资格 |
| AD14替代 | 非模态反馈区限定在实际产品画布，避开可见按钮/链接/summary，按空闲区域定位；不调用页面滚动，不挪动唱片/入口布局。画布离开视口时回到画布内绝对定位，不漂在白色外壳上 |
| 普通提示 | revision/operationId及技术JSON进入折叠Product Notes；队列和恢复摘要不再暴露revision。失败正文明确保存与刷新两阶段，保护文案直接取off/active/review_required |
| AI相同值 | 与当前草稿显示值相同显示“与当前设置一致”；null保持“未提及，保持不变”；采用之后revision不变，仍需总面板确认 |

原quality包含87单元/契约、原32 E2E、64图/4视口视觉比较、lint/typecheck/生成漂移/边界及构建。本轮新增41项E2E（合计73）：8自然操作、2提示时限/持久撤销、1操作绑定、1冲突/会话终止、24保护三态×四视口×两种字号、4纯键盘快捷少推撤销、1AI等值/null。最终实际退出码、时间、生产smoke见HANDOFF和当前 `artifacts/reports/quality-closeout.log`，不引用历史通过结果冒充本轮。

## 自然操作截图索引

自然序列通过 `tests/e2e/closeout.spec.ts` 从正常 `page.goto` 开始，只有用户按钮/输入操作；无scrollTo/scrollIntoView截图摆位。浏览器为用户点击或Tab焦点自动保证控件可见是正常行为。测量的是提交前、提交后、撤销后的实际scrollY，八组均断言相等。普通图未去掉作品集导航，保留真实打开页面的上下文。

| 视口 | 正常文字四步序列 | 200%四步序列 |
|---|---|---|
| 320×740 | `artifacts/closeout/natural/320-100/` | `artifacts/closeout/natural/320-200/` |
| 390×844 | `artifacts/closeout/natural/390-100/` | `artifacts/closeout/natural/390-200/` |
| 768×1024 | `artifacts/closeout/natural/768-100/` | `artifacts/closeout/natural/768-200/` |
| 1440×900 | `artifacts/closeout/natural/1440-100/` | `artifacts/closeout/natural/1440-200/` |

每个目录包含 `opened.png`、`editing.png`、`saved.png`、`undone.png` 和测量JSON；共32张。保护三态24张当前图为 `artifacts/closeout/protection/{off,active,review_required}-{width}-{100,200}.png`。该目录无尺寸后缀的3张为早期检查记录，不是最终矩阵。纯键盘4张在 `artifacts/closeout/keyboard/`。原全状态64张在 `artifacts/screenshots/`；它们是应用回归图，包含案例章节导航，与自然序列分开说明。

## 图像自审与修复

放大检查自然提交/撤销、四视口200%、保护关闭/开启/待确认、失败结果和键盘反馈。初轮自动测试虽通过，放大图发现200%失败提示正文被三个纵向按钮挤压；已去掉重复保存标题/明细，将按钮可视文字压缩为“撤销/重试/继续”，后两项保留完整可访问名称“重试刷新/继续听歌”。重新执行24项三态矩阵，并新增正文scrollHeight≤clientHeight断言，确认当前提示全文不需要内部滚动。

另修正200%轻入口拆字为竖排：仅允许大字号下收回左缩进和整词布局，100%仍保留接受的唱片、入口比例与位置。反馈可能暂时覆盖部分封面/唱臂装饰或非交互文字，完整保护状态在反馈内重复显示；关键按钮/返回/关闭不被覆盖。模态打开期间不展示外部浮动回执，保持原生模态隔离。

短文案按钮另显式设置最小44px宽度，并断言所有反馈按钮宽/高均≥44px，避免文字变短后命中区随之缩小。此修正沿用AD19，不改变动作含义。

旧两套128张截图哈希保留。先对v0.2.2基线实际执行，320提醒图报告3,400差异像素（约2%）；记录在 `artifacts/closeout/old-visual-difference.json` 与同名目录。新64图位于 `closeout-candidate/`，生成后再比较；没有降低0.005阈值或删旧断言。上一批报告/截图在 `artifacts/closeout/history-v022/`。

## 未运行与剩余边界

没有真人读屏、真机软键盘、Safari/Firefox、真实用户、真实AI/API、field INP或公开部署。axe是自动检查，不等于完整WCAG认证。未改变10秒、会话周期、排序、标签上限、AI权限、业务undo校验，原哈希及自然测量汇总见 `artifacts/closeout/final-audit.json`。

需要负责人集中复核：反馈区临时覆盖装饰的接受度；200%紧凑按钮文案；操作绑定/10秒后持久撤销；三态失败说明。完整自主决策AD16起及回退方式见 [HANDOFF](../docs/HANDOFF.md)。
