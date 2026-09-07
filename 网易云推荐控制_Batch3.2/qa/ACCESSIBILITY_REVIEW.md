# 无障碍审查 · 当前 Batch 2.1 收尾

本轮新增四视口200%纯Tab/Enter/Space快捷少推与撤销，四视口两种字号自然操作，保护三态×四视口×两种字号24项axe与可读性断言。原32项E2E及其3个多状态axe入口保留；反馈通过role=status宣读、不在提交时抢焦点、不触发页面滚动，动作保留完整可访问名称。未做真人读屏、物理软键盘或完整WCAG认证。结果与截图见 [CLOSEOUT_REVIEW](CLOSEOUT_REVIEW.md) 和当前HANDOFF。

## 历史：Batch 2.1 对齐阶段

本轮32项E2E内包含3项多状态axe审查，均PASS。新增验证Tab方向键/Home/End、跨类选择、主题可达、Switch Space操作、候选编辑及null、四视口200%文本完整流程与回执撤销按钮在视口内。另执行320/390根面板200%专项。原生dialog隔离、焦点循环和子页返回仍经原测试验证。

证据：`tests/e2e/alignment.spec.ts`、`artifacts/reports/e2e.json`、`accessibility-targeted.json` 与 `artifacts/batch2.1/after/want-200percent-*.png`。没有真人读屏/物理软键盘测试，不宣称完整WCAG合规。

## 历史：Batch 2 无障碍审查

自动检查未发现可检测问题，不等同于完整 WCAG 合规或真人读屏测试。

Playwright + axe 已实际覆盖案例页、播放器、根弹层、影响范围、AI候选、错误及保护中的队列状态。键盘测试覆盖进入弹层、Tab/Shift+Tab循环、Esc关闭、焦点返回；原生 dialog 提供模态背景隔离，可见按钮替代关闭手势。保留焦点样式、字段label、状态文字及进度条语义。

Codex另使用浏览器脚本和截图检查320/390、200%字体放大及reduced motion，并实际滚动弹层完成保护开启。没有横向溢出或必须依赖手势的操作。注意：这是字体放大专项，不等同于物理浏览器所有缩放/屏幕组合。截图见 `accessibility-root-200percent-320.png` 和390版。

关键按钮按项目44px触控目标实现；44px是本项目目标，不声称是WCAG统一最低值。200%时按钮可能换行，内容区纵向滚动，未通过缩小字体规避问题。

人工参与的键盘/读屏验收：NOT_RUN；物理软键盘/触摸设备：NOT_RUN。上述键盘、焦点和布局结果是Codex执行的自动化及图像审查。下一批请在真实设备和读屏软件上独立验收，不能以当前结果宣称完整合规。
