# Batch 2 构建计划

- 目录：F:\html\网易云优化项目_Batch2_启动包_v1.1（实际存在的启动包）。
- 环境：Windows，Node 24.19.0；系统 npm 未提供，使用内置 pnpm 11.19.0 引导安装项目本地 npm。
- Git：开始时无仓库；本批不建立远端。
- 依赖：从 npm registry 获取当前 stable React/TypeScript/Vite/Router/Vitest/Playwright/axe/AJV/ESLint，以锁文件记录精确版本。
- 已读取启动入口、AGENTS、PRD、HTML、实现/AI 契约、研究增补、叙事/视觉规范、测试计划、全部 spec/fixture 与四个项目技能；Figma 48:8 design context 已读取。
- 模块：纯领域事务与计时/事件分片、确定性排序、本地解析与校验、编辑器/播放器、JSON 驱动决策案例页。
- Gate：lint → typecheck → generated drift → unit/contract → Playwright/e2e/axe → visual → build；另运行性能实验室采样。
- 限制：依赖安装需沙箱外公共仓库读取；不连接任何真实音乐/模型/账号，不写远端，不公开部署。
