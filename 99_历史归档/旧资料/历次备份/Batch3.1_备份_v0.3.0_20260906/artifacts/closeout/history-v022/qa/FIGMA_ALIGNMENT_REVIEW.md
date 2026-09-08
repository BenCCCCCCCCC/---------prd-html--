# Batch 2.1 · Figma 对齐 self-review

2026-09-05，v0.2.2。由 Codex 对本地实现自审，提交负责人进行产品、视觉、代码与 PRD 一致性审查。**未获得负责人设计批准；新截图基线为候选。**

## 实际完成的审查

读取12个真实Figma节点的context，4个指定核心frame全部成功读取context和截图。逐项检查播放器、三行根面板、分段/五类Tab、Radio/Switch、四组合、AI候选及200%文字；四视口64状态拼图用于查漏，再放大核心图和专项截图。Figma截图文本缓存与几何测量可审计，详见 `docs/FIGMA_ALIGNMENT_ADDENDUM.md`。

| 关键状态 | 原依据 → Beta前问题 → 本轮结果 | 对照图（左原稿/中旧版/右候选） |
|---|---|---|
| 播放器 | 48:2；入口过重、唱片过小 → 曲线唱臂与轻胶囊，歌曲层级恢复 | [player](../artifacts/batch2.1/comparisons/player.png) |
| 根面板 | 48:8；过高、亮线 → h447，原h444，必要状态保留 | [root](../artifacts/batch2.1/comparisons/root.png) |
| 探索+民谣 | 50:60；分类纵铺 → 一体分段、五类Tab、跨类保留 | [want](../artifacts/batch2.1/comparisons/want.png) |
| 即时少推 | 52:41；原生控件左置 → 右Radio，仍是软少推和绑定当前对象 | [negative](../artifacts/batch2.1/comparisons/negative.png) |
| 仅本次+保护关 | 52:63；卡片过重 → Radio/Switch独立，双维度明确 | [session-off](../artifacts/batch2.1/comparisons/impact-session-off.png) |
| 仅本次+保护开 | 52:87；checkbox混淆 → 可访问Switch及保护说明 | [session-on](../artifacts/batch2.1/comparisons/impact-session-on.png) |
| 长期+保护关 | 69:20；信息堆叠 → 紧凑分层，保留差异确认checkbox | [longterm-off](../artifacts/batch2.1/comparisons/impact-longterm-off.png) |
| 长期+保护开 | 69:45；两维度形态混淆 → 右Radio+独立Switch，h629仍高于原500 | [longterm-on](../artifacts/batch2.1/comparisons/impact-longterm-on.png) |
| 保护提醒 | PRD新增；52:122仅是状态先例 → 提醒与继续保护/明确关闭都保留 | [reminder](../artifacts/batch2.1/comparisons/reminder.png) |
| 保存/刷新失败 | PRD新增 → 设置已保存、重试/继续、保护含义仍可见 | [refresh-failed](../artifacts/batch2.1/comparisons/refresh-failed.png) |
| Toast | 52:117；扩大唱片后回执会落到视口外 → 必要滚动显示，保留撤销 | [toast](../artifacts/batch2.1/comparisons/toast.png) |
| 撤销结果 | PRD新增 → 撤销反馈与恢复状态保留 | [undo](../artifacts/batch2.1/comparisons/undo.png) |
| AI ready | 无完整旧frame → 差异在前、共用分段/Tab、字段可编辑 | [ai-ready](../artifacts/batch2.1/comparisons/ai-ready.png) |
| AI澄清 | 无完整旧frame → 需要确认与不自动执行保留 | [ai-clarification](../artifacts/batch2.1/comparisons/ai-clarification.png) |
| AI不支持 | 无完整旧frame → 保留不支持原因和手动处理 | [ai-unsupported](../artifacts/batch2.1/comparisons/ai-unsupported.png) |

三列AI ready来自连续同状态脚本，当前偏好已是探索/民谣，故显示“探索→探索、民谣→民谣”；这是真实的无变化候选，不是伪造差异。独立E2E另验证从默认状态编辑并采用熟悉+纯音乐后的真实变更。

## 验证与自审修复

- 原 quality 链路：输入边界、lint、typecheck、生成漂移、87单元/契约、32 E2E、4视口视觉测试（64候选截图）、生产构建；原23项E2E断言保留，新增9项。
- 新增测试覆盖跨分类保留/拒绝第4项/主题可达、Switch Space操作和范围独立、候选编辑/null、四视口200%字体、axe类别面板与Switch。四视口为320×740、390×844、768×1024、1440×900。
- 原有三条Demo、AI三个结果分支、草稿/事务/保存刷新/撤销冲突、保护生命周期等回归通过；axe共3个多状态测试入口。自动检查不等于完整WCAG或真人读屏。
- 放大图发现根面板仍偏高，压缩普通状态与行内间距后从h468降至447；唱片起点从190校准至202。200% Tab汉字拆行改为整词换行。回执新增必要滚动后加入四视口按钮在视口内断言。
- 旧基线真实差异已存档。新64图生成之后再次按候选执行比较；没有删除旧64图或降低差异阈值。任何“PASS”仅指相应检查通过。
- 最终生产包离线smoke及性能另见 `artifacts/reports/production-smoke.json`、`performance-summary.json`；这些属于本地自动/实验室证据。

## 剩余差异与未覆盖

1. 合成封面与深色背景不同于旧真实歌曲；唱臂与沟槽是截图测量的本地重建，不能声称内部原生组件或逐像素还原。
2. 根面板比原稿高3px，想听高46px；长期开启页高129px，少推页高186px。原因是当前PRD新增说明/管理/确认及14px辅助文字，未通过删规则或缩字达到旧高度。
3. 标签使用现有五类字典，未导入旧稿“二次元、华语流行”等不同标签；选中文字与轮廓加强以兼顾可辨识性。
4. 200%文字在限定高的原生dialog内部滚动；截图可能只显示当前阅读区，顶部输入/下方字段仍能滚到并完成流程。白色导航在普通全页截图中属于作品集外壳，390核心三列图已分别标明画布/详情视图。
5. R07、刷新失败、到期提醒、撤销结果按已批准语义延续核心视觉，不属于逐像素Figma复刻。52:122不能替代当前提醒frame。
6. 回执可包含多行及revision，比旧42pxToast高；仅超出视口时instant滚动到最近可见位置，焦点不被转移。需负责人结合播放器体验复核。
7. 真人可用性/真实读屏、物理软键盘、iOS Safari/Android真机、真实模型、field INP：NOT_RUN/NOT_MEASURED。未调用真实账号或音乐API。

未发现阻止本地交付的P0/P1问题；以上差异保留给负责人集中审查。这一判断不是设计批准，也不是公开发布结论。
