# 本地性能实验室结果 · 当前 Batch 2.1

2026-09-05最终v0.2.2构建，本地Lighthouse13.4.1、Windows/Chromium151，移动模拟：98/100，LCP1654.3ms、CLS0、TBT146.5ms。原始数据为 `artifacts/reports/performance-summary.json` 和 `lighthouse.html/json`。JS450.46kB（gzip142.11kB）、CSS32.70kB（gzip6.73kB）；field INP未测。生产离线smoke通过、页面错误与外部请求均0。

该数据仅为本机实验室采样；以下旧结果与旧产物体积保留为历史，不混用。

## 历史：Batch 2 性能结果

最终 dist 在本机回环地址4173提供，Lighthouse13.4.1、Windows、Chromium151.0.7922.34，模拟 Moto G Power 移动条件。最终采样：性能97/100，LCP1652.01ms，CLS0，TBT154.5ms。原始环境及报告见 `artifacts/reports/performance-summary.json` 与 `lighthouse.html/json`。

LCP低于参考2500ms、CLS低于0.1。INP：NOT_MEASURED；导航实验室采样的TBT不能代替INP200ms预算，也不能宣称真实用户75分位通过。前一轮压缩采样98分、LCP1664.18ms，结果有环境波动；本报告以最终构建97分为准。

初轮无压缩预览86分，LCP3152.84ms。为本地静态服务器增加JS/CSS/HTML gzip响应后改善；前测原始JSON单独保存。最终JS448.09kB，gzip141.27kB；CSS24.84kB，gzip5.20kB。没有远程字体、图片、音频或分析脚本。

最终生产smoke在初次加载后切换离线，完成探索+民谣主流程，无页面错误及外部请求。核心交互不依赖外网；首次获取本地应用本身仍需要预览服务器。未来托管压缩/缓存策略与field采样尚未验证，未执行公开部署。
