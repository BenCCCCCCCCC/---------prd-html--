# Batch 2 构建报告 · 0.2.1

完成本地React/TypeScript/Vite应用：Hash路由案例页与Demo、R03/R04/R07、合成排序、故障模拟、Product Notes本地事件导出、sessionStorage恢复、自动验证及截图。纯规则集中在src/domain；没有服务端、真实音频、账号、模型或遥测。

## 依赖与环境

Windows；Node24.19.0、pnpm11.19.0、项目本地npm12.0.2。React/react-dom19.2.8、Router7.18.3、AJV8.20.0；TypeScript6.0.3、Vite8.2.2、plugin-react6.1.1、Vitest5.0.0、Playwright1.62.1、axe4.13.0、Testing Library react16.3.3/jest-dom7.0.1、jsdom30.0.1、ESLint10.9.1、typescript-eslint8.69.0、@eslint/js10.0.1、json-schema-to-typescript16.0.0、Lighthouse13.4.1、Prettier3.9.6、sharp0.35.4；其余类型依赖见package.json及pnpm-lock.yaml。

采用稳定版；TypeScript曾尝试7.0.2但与当前lint工具链不兼容，最终固定为6.0.3。系统无npm，提供本地npm转发脚本。依赖通过pnpm安装并锁定；尝试生成额外npm lock受npm远端包策略失败，未产生package-lock，pnpm-lock.yaml为唯一安装锁。此辅助失败不影响已通过的构建链路。没有初始化Git，也没有checkpoint commit。

## EXT落地

| 决策 | 落地与检查 |
|---|---|
| EXT-01 | 事实源读取、输入哈希、生成漂移、完整自审修复再运行 |
| EXT-02 | 案例快读/深读、证据状态、无虚构成果 |
| EXT-03 | 价值/可用性/可行性/商业可持续性四类风险 |
| EXT-04 | 课程与2026行业来源分开；R07权限预览定位、不称首创 |
| EXT-05 | 模拟标识、可编辑候选、未识别内容、手动替代、确认与撤销、可关闭实验 |
| EXT-06 | canonical schema生成类型、AJV、40+6分层评测、禁用真实适配器 |
| EXT-07 | 曝光/分桶/SRM/A-A/实验前分层、指标组与ring通过/暂停/回滚 |
| EXT-08 | 原生dialog、键盘焦点、axe、64同环境快照、200%专项；真人检查未运行 |
| EXT-09 | 本地核心无外网、相对base+HashRouter、生产smoke、Lighthouse97；未部署 |
| EXT-10 | Melo仅行业依据；确定性步骤、实体字典、显式约束回退、非完整歌单生成 |
| EXT-11 | 经营信息只在背景/深读，未推导本项目收入或留存效果 |

## 实际验证

最终quality退出码0：输入/边界检查、lint、typecheck、生成漂移、87单元/契约、23e2e（含axe）、4视口共64快照、build全部PASS。AC01–AC34对应执行名见acceptance-executed.json。最终生产离线smoke与320/390的200%字体专项通过。性能最终97分、LCP1.65s、CLS0、TBT154.5ms，INP未测。详见qa四份报告与原始JSON/log。

第一轮功能与契约发现并修复焦点循环、放大溢出、ARIA地标及测试场景准备；第二轮视觉修复平板窄列、AI说明可见性、播放器密度与截图滚动定位，完整链路重跑。最终契约复核补充保护启用前暂停计时边界及撤销恢复提醒周期回归。无已知未解决P0/P1；视觉自评89/100。不是独立人工审查结论。

## 限制与交付

仅同标签页合成状态；无跨设备/账号同步；有限本地语法，不等于真实AI；真实音频未实现。真人任务/读屏、物理软键盘、Safari/Firefox、线上field性能与真实实验NOT_RUN。原行业来源是输入快照，未新增实时调研结论。真实AI/账号/付费/远端写入/公开部署均未执行。

交付包含源码、锁文件、原始事实源、测试、64基线、76张审查图（含对照/拼图/专项）、报告及dist；排除依赖缓存/node_modules。压缩包独立SHA256与清单在交付目录，不修改启动包历史MANIFEST。下一批建议先集中产品/视觉/代码/PRD审查，再决定真人任务测试、R07公开版和发布流程。
