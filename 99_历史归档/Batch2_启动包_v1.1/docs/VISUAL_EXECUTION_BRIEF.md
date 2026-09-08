# Visual Execution Brief｜给 Codex 的强约束视觉规范

版本：0.1 / 2026-09-05

## 1. 视觉目标

公开站点必须同时具备两种气质：

- 案例层：安静、编辑型、可信、易扫读，像一份经过取舍的产品案例，不像营销落地页。
- Demo 层：保留唱片居中、暗色播放器、黑色 Bottom Sheet、单一红色主操作的音乐产品识别。

关键词可使用：`editorial product case study`, `quiet neutral shell`, `single red accent`, `record-centered dark player`, `dense but breathable`, `evidence-led`, `state clarity`。

这些词只是方向，真正权威的是 Token、尺寸、截图和下列禁区。

## 2. 明确禁止

- 蓝紫 AI 渐变、霓虹、发光球、网格宇宙背景。
- 玻璃拟态、半透明卡片层层叠叠。
- 每句话一个 pill、满屏圆角胶囊。
- 无意义的“98% 准确率/用户增长/AI Score”卡片。
- 自动轮播、持续飘动、背景视频、夸张 3D 手机模型。
- 在桌面端把手机稿简单放大；在手机端再套一个手机壳。
- 随意新增品牌色、渐变、阴影和第三套圆角。
- 用真实网易云 Logo、真实封面、真实音乐播放冒充官方或可用服务。

## 3. 案例页布局

### Desktop 1440

- 页面背景 `#FAFAFC`，内容最大宽 1120px，左右自动居中。
- 顶部导航高度 64px；只保留项目名、Case / Demo / Evidence / Reflection 导航与一个主 CTA。
- Hero 使用两列：左侧约 52%，右侧约 48%；列间 64px。
- H1 48/58，最多 2 行；副标题 18/30，最大宽 620px。
- 右侧不是营销插画，而是可操作设备预览或 3 张状态叠层中的一个当前状态。
- Section 上下间距 96px；同一内容块内部使用 24/32px。
- 案例卡片最多 3 列；优先用留白和文字层级，不依赖阴影。

### Tablet 768–1099

- Hero 上下排列，说明先于 Demo。
- Demo 宽度不超过 430px，居中。
- Section 上下 72px。

### Mobile <768

- 16px 页面边距；H1 32/42。
- 说明、证据、CTA、Demo 依次呈现。
- 不隐藏关键免责声明；可把长表格改为纵向 definition list。
- 320px 宽不得横向溢出。

## 4. Demo 设备与播放器

- 参考视口 390×844，但容器响应式，不写死所有屏幕的 y 坐标。
- 设备外壳仅在桌面案例预览使用，边框 1px，圆角 32px，阴影克制；真正 `/demo` 页面不套双重外壳。
- 唱片和唱臂是视觉锚点；播放器信息层级保持接近 Figma，而不是重新设计完整网易云。
- 所有歌曲、封面和音乐人是虚构内容；封面使用几何色块，本地 SVG/PNG。
- 播放按键必须标明是模拟；不自动发声。

## 5. Bottom Sheet

- 暗色背景 `#1B1B20`；顶部圆角 24px；左右 padding 22px，320px 时 16px。
- 遮罩 alpha 0.42；背景 inert。
- Sheet 高度由内容决定，最大 90vh；主体可滚动，动作区固定在 Sheet 内。
- Title 20/28；行标题 16/24；摘要 14/20；分割线只使用 Token。
- 主按钮高 48px，深红 `#D92D3A`；次按钮边框清晰。
- 行本身可点击，Radio 视觉 24px、交互目标至少 44px。
- 每个子页都有明确标题、返回路径和可见关闭/取消手段。

## 6. 关键状态必须视觉区分

1. 默认 / 草稿 / 已应用。
2. 仅本次 / 长期偏好。
3. 临时收听 off / active / review_required。
4. 保存成功但刷新失败。
5. 少推已应用 / 黑名单只读说明。
6. AI idle / parsing / ready / needs_clarification / unsupported / error。
7. 可撤销 / 因后续变更不可撤销。

不能只靠红色区分；结合勾选、边框、标题、摘要和状态文案。

## 7. AI 面板视觉

- 标题：`AI 建议草稿（实验）`。
- 紧邻标题显示：`本地规则模拟 · 不调用真实模型`。
- 输入区给 2–3 个可点击示例，不在输入框预填假用户语句。
- 结果采用“我识别到 / 需要你确认 / 暂不支持”三段，而不是聊天气泡连续对话。
- 映射结果以可编辑表单呈现，技术 JSON 默认折叠到“查看结构化结果”。
- 显示未识别片段；提供“采用到草稿”和“改用手动设置”。
- 无数值置信度、AI 魔法图标、闪烁 typing dots 长动画。

## 8. 视觉自审评分

总分 100；交付门槛 ≥85，且无 P0/P1 问题。

| 维度 | 分值 | 通过条件 |
|---|---:|---|
| 信息层级 | 20 | 5 秒看出问题、角色、状态和 CTA；深层内容不抢首屏。 |
| 字体与留白 | 20 | 中文行高稳定；无拥挤、孤行、异常窄列。 |
| Figma/产品一致性 | 20 | 播放器锚点、三行面板、影响范围和状态含义一致。 |
| 状态清晰 | 15 | 所有关键状态、失败和撤销有可见差异。 |
| 响应式 | 15 | 320/390/768/1440 全部自然，不靠整体缩放。 |
| 无障碍与细节 | 10 | 焦点、对比、触控、缩放、reduced motion 可用。 |

## 9. 截图清单

至少输出：

- `case-home-1440.png`
- `case-home-390.png`
- `demo-player-390.png`
- `sheet-root-default-390.png`
- `want-explore-folk-390.png`
- `impact-session-off-390.png`
- `impact-session-on-390.png`
- `impact-longterm-on-390.png`
- `temporary-review-required-390.png`
- `saved-refresh-failed-390.png`
- `negative-artist-applied-390.png`
- `ai-ready-390.png`
- `ai-needs-clarification-390.png`
- `ai-unsupported-390.png`
- `case-demo-768.png`
- `case-demo-320.png`

截图生成后，逐张按项目 visual QA skill 审查；发现问题必须修复并重拍，不得仅写“建议以后优化”。
