# 网易云推荐控制作品集 — AGENTS.md

当前阶段：Batch 2 本地 HTML Beta / v1.1 / 2026-09-05。

## 地图

本文件只负责告诉 Agent 去哪里找规则，不重复整份 PRD。权威阅读顺序：

1. `BATCH2_CODEX_MASTER_PROMPT.md`
2. `docs/PRD_v0.5.1.md`
3. `docs/HTML_SPEC.md`
4. `docs/IMPLEMENTATION_CONTRACT.md`
5. `docs/AI_CONTRACT.md`
6. `docs/RESEARCH_ADDENDUM.md`
7. `docs/TRADEOFFS_AND_REJECTED_ALTERNATIVES.md`
8. `docs/PORTFOLIO_STORY_ARCHITECTURE.md`
9. `docs/VISUAL_EXECUTION_BRIEF.md`
10. `specs/*.json`
11. `data/*`
12. `.agents/skills/*/SKILL.md`

用户明确的新决定优先；其次是产品/AI/实现契约；然后是机器可读 spec、fixture、设计 token；页面实现必须追踪这些事实源。发现矛盾时先采用更保守、可撤销、不会扩大 AI 权限的解释，并记录在 `docs/ASSUMPTIONS.md`。只有改变核心语义时才升级。

## 不可违反的产品边界

- 核心是 R03 推荐控制与 R04 临时收听；R07 只是可移除的 P2 实验。
- 作品集必须展示主要方案取舍：采用方案、未采用/延后、理由、代价与反转条件；不得把设计方案比较说成已完成线上 A/B 测试。
- `仅本次/长期偏好`控制显式设置的保存范围；`临时收听`控制普通行为是否进入长期学习，二者不能合并。
- 显式用户确认优先于隐式行为；AI 没有执行、账户、长期画像、删除或黑名单写入权限。
- 少推是软性降权，仍可能出现；黑名单是强约束，首版只读。
- 临时保护到期进入 `review_required` 时继续保护，不得静默恢复学习。
- 推荐刷新失败不回滚已经确认的保护；旧响应不得覆盖新 revision。
- 无真实问卷、上线效果、真实模型评估或网易内部算法数据，公开文案必须诚实。

## 工程边界

- 不调用真实/付费模型，不读取 API Key，不发远程遥测，不使用真实账号/音频。
- 不部署、不创建远端、不 push。未经授权不得公开。
- 只使用合成曲库与本地资产；不复制真实 Logo/封面冒充官方。
- spec、schema、tokens 是事实源，禁止在组件另写冲突常量。
- 构建成功不是交付。必须运行测试、操作页面、生成截图、审查、修复、重跑。
- 普通实现问题自行解决；不要让用户审每个间距或常规依赖选择。

## 交付

每批更新 `docs/HANDOFF.md`，说明版本、本地/远端状态、已做/未做、测试、截图、限制和下一步。没有运行、没有 push、没有真人数据时都要明确写出。
