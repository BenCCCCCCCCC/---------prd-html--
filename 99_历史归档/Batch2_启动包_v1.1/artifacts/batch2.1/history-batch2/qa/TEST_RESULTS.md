# Batch 2 执行结果

最终质量链路于 2026-09-05 执行完成，退出码 0。证据：`artifacts/reports/quality-final.log`，各测试 JSON 与 `verification-summary.json`。以下是实际执行结果，不改写输入 fixture 中的历史状态。

| Gate | 结果 | 证据与范围 |
|---|---|---|
| 输入/边界 invariants | PASS | specs、data、design、项目 skills 原始哈希；禁止运行时外发与原始输入持久化模式 |
| ESLint | PASS | src、tests、scripts |
| TypeScript strict | PASS | tsc --noEmit |
| generated drift | PASS | canonical schema 类型与 token 输出重算一致 |
| 单元/契约 | PASS，87 项 | `unit.json`，包括 40 AI 合成例、6 非法输出、4 排序 fixture、领域规则及2个作品集来源测试 |
| AC01–AC34 | PASS，34/34 | `acceptance-executed.json` 列出对应真实执行测试名，部分验收由领域及浏览器共同覆盖 |
| e2e | PASS，23 项 | `e2e.json`；主流程、失败、恢复、键盘、宽度、axe |
| axe | PASS | 23 项 e2e 中包含 2 项 axe 多状态审查；非额外23项之外的测试 |
| 视觉 | PASS，4 项视口测试 | `visual.json`；每项16张，共64张像素比较 |
| production build | PASS | Vite 输出 dist |
| 最终生产离线 smoke | PASS | 初次加载后断网完成核心流程，无页面错误/外部请求，`production-smoke.json` |
| 200% 字体放大专项 | PASS | 320/390 下滚动弹层并完成临时保护开启，`accessibility-targeted.json` |

R07 的 40/40 仅表明本地规则解析器通过指定合成评测，不能当作真实模型准确率或泛化能力。6个非法输出按结构与语义分层拒绝，不能只用 schema 通过代替权限检查。

AC31–AC34 同时检查决策 JSON 来源、快读/深读对应关系、取舍与验证条件，以及手机布局；完整证据在 acceptance-executed.json。

修复循环：初轮发现 AC04 场景准备遗漏、焦点可移出弹层、200% 横向溢出、进度语义/主地标遗漏；修正测试准备与实际实现后重跑。随后修复浏览器返回草稿路径、平板窄列、AI 标识可见性及保护启用前长时间暂停导致的错误计时。最终新增计时回归测试后完整 quality 再次通过。

NOT_RUN：真人任务测试、真人读屏、物理手机软键盘、Safari/Firefox、真实模型/账号/服务、线上实验、远端 CI、field INP。未以静态阅读或生成基线替代执行。
