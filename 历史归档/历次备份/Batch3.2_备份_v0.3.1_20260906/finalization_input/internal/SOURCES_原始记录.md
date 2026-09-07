# 资料与资源登记

检索日：2026-09-05。外部资料与课程材料分开；仅使用明确支持的结论。没有抓取第三方博客替代官方功能说明。

## 内部资料

- S01：当前上传PRD v0.4，共8页，全文及内嵌截图已作为基线阅读。
- S02：当前上传w4ai转写.txt，完整内容为课堂原始转写；本人点评约00:59–01:15；其他同学建议标为迁移方法。
- S03：当前上传w4ai总结.txt，仅作索引；重复段落及出席概括不作为独立证据。
- S04：文件库检索到早期用户研究文件的相关片段，证明20条模拟案例、15题以及频率/时长题目选项；未声称本轮全文重读早期报告。
- S05：原PRD中Figma fileKey=ZbKyQeHug7rM5P88GBSmlY，48:2与48:8截图接口可返回；本轮直接检查48:8。未更新Figma，也未验证所有跳转。
- U01：用户在本对话明确确认没有真实问卷原始数据；用途为求职/公开作品集；允许由本助手推荐R07与AI形式；本轮只做PRD和HTML规格。

W3原文件经过多次文件库检索未取到；不从简历或旧回复倒推W3内容。早期公开反馈逐条来源本轮未复核，不用其数量证明需求。当前网易实机截图仅有旧PRD内嵌版本，未获得新录屏。

## 外部资源

### W01｜TME Q2 2026
https://ir-tc.tencentmusic.com/2026-08-11-Tencent-Music-Entertainment-Group-Announces-Second-Quarter-2026-Unaudited-Financial-Results
官方检索结果核验到QQ/酷狗即时意图AI歌单披露；直接打开一度失败，未依据财务表格做分析；不能推导UI点击数。

### W02｜Apple iPhone User Guide
https://support.apple.com/en-hk/guide/iphone/iph2b1748696/ios
官方支持说明Use Listening History与Focus；不据此推断网易事件覆盖。

### W03｜Spotify Exclude taste profile
https://support.spotify.com/us/article/exclude-playlists-or-tracks-from-your-taste-profile/
直接读取官方说明：单曲/歌单、过去未来收听less impact；不等于从系统彻底删除或处处屏蔽。

### W04｜Google PAIR User Needs
https://pair.withgoogle.com/guidebook/chapters/user-needs-and-defining-success
AI适用性与成功定义方法；不是本项目用户需求已经成立的证据。

### W05｜Microsoft HAX
https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/
辅助人机交互审查；对应15细粒度反馈和16操作后果。

### W05a｜HAX Guideline 15
https://www.microsoft.com/en-us/haxtoolkit/guideline/encourage-granular-feedback/
只借鉴显式反馈原则。

### W05b｜HAX Guideline 16
https://www.microsoft.com/en-us/haxtoolkit/guideline/convey-the-consequences-of-user-actions/
用于范围解释、变更预览与结果反馈。

### W06｜OpenAI Structured model outputs
https://developers.openai.com/api/docs/guides/structured-outputs
结构化输出方法；结构合规不保证语义正确；真实适配时核验支持的JSON Schema子集。

### W07｜OpenAI Evaluation best practices
https://developers.openai.com/api/docs/guides/evaluation-best-practices
只采用评估方法；本包不依赖某一托管Evals产品，也未执行真实模型评测。

### W08｜Microsoft Research SRM
https://www.microsoft.com/en-us/research/articles/diagnosing-sample-ratio-mismatch-in-a-b-testing/
在线实验样本分组健康检查；不是本项目已做A/B的证据。

### W09｜Atlassian PRD
https://www.atlassian.com/agile/product-management/requirements
目标、假设、需求、范围与协作；不替代老师的原作业结构。

### W10a｜W3C modal dialog pattern
https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
模态焦点、关闭和背景不可交互。

### W10b｜W3C WCAG2.2
https://www.w3.org/TR/WCAG22/
普通文字4.5:1；AA目标尺寸24 CSS px有例外；本项目主动采用关键触控44，不混淆等级。

### W11｜Anthropic frontend-design skill
https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
已读取公开原文；使用先定视觉方向/Token再截图自审的方法，不整段复制，也不声称已在用户Codex安装。

### W12｜OpenAI local skills
https://developers.openai.com/codex/skills/
官方原链接跳转至learn.chatgpt.com/docs/build-skills；核验.agents/skills本地目录与SKILL.md结构。

## Skill与插件状态

本轮在本地包中新建了两个项目专属SKILL.md，并未安装或修改用户机器。它们属于本项目原创建议，参考上述官方方法，但不是把第三方skill原文复制过来。

本轮插件搜索未返回可用的product-design条目，因此没有把先前推荐过的Product Design当成已安装/已执行的能力；也没有让安装插件阻塞交付。Figma连接实际做了只读调用。

## 特别区分

课堂中的具体样本量、30%/50%衰减、7/30天有效期、4小时自动关闭均是示例或开放讨论，不是给本项目的固定命令。本文的30分钟/4小时/30秒等属于明确可改的设计/演示参数。转写中统计显著性表述存在语音识别歧义，正文使用外部统计方法作独立方案，不声称是老师逐字说法。
