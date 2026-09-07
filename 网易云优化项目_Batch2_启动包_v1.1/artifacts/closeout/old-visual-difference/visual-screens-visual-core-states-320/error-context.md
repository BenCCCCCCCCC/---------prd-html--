# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual\screens.spec.ts >> visual core states 320
- Location: tests\visual\screens.spec.ts:30:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  3400 pixels (ratio 0.02 of all image pixels) are different.

  Snapshot: batch2.1-candidate\temporary-review-required-320.png

Call log:
  - Expect "toHaveScreenshot(batch2.1-candidate\\temporary-review-required-320.png)" with timeout 7000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 3400 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 3400 pixels (ratio 0.02 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "← 返回案例" [ref=e5] [cursor=pointer]:
      - /url: "#/"
    - group "演示任务" [ref=e6]:
      - button "Demo 1" [pressed] [ref=e7] [cursor=pointer]
      - button "Demo 2" [ref=e8] [cursor=pointer]
      - button "Demo 3" [ref=e9] [cursor=pointer]
      - button "AI 实验" [ref=e10] [cursor=pointer]
    - button "重置演示" [ref=e11] [cursor=pointer]
  - main [ref=e12]:
    - generic "产品画布" [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: 交互模拟 · 不播放声音
        - button "推荐队列" [ref=e16] [cursor=pointer]: 推荐队列 ≡
      - generic [ref=e17]: 已到提醒时间，当前仍不用于长期推荐。
      - generic [ref=e21]:
        - paragraph [ref=e22]: 保护继续，直到你明确选择。
        - generic [ref=e23]:
          - button "继续4小时" [ref=e24] [cursor=pointer]
          - button "关闭临时收听" [ref=e25] [cursor=pointer]
      - img "虚构几何封面：沿河慢行" [ref=e36]
      - button [ref=e42] [cursor=pointer]:
        - generic [ref=e43]:
          - text: 调整推荐
          - generic [ref=e44]: ›
      - generic [ref=e45]:
        - generic [ref=e46]:
          - heading "沿河慢行" [level=2] [ref=e47]
          - paragraph [ref=e48]: 示例音乐人1 ↗
        - button "收藏当前虚构歌曲" [ref=e49] [cursor=pointer]
      - progressbar "模拟播放进度" [ref=e52]
      - generic [ref=e53]:
        - generic [ref=e54]: 00:00
        - generic [ref=e55]: 合成曲库 · 无真实音频
        - generic [ref=e56]: 3:21
      - generic [ref=e57]:
        - button "更多：快捷少推" [ref=e58] [cursor=pointer]: •••
        - button "播放模拟" [ref=e59] [cursor=pointer]
        - button "下一首模拟歌曲" [ref=e62] [cursor=pointer]
      - paragraph [ref=e65]: 平衡 · 不限方向
      - region "本轮调整结果" [ref=e66]:
        - status [ref=e67]:
          - strong [ref=e68]: 仅本次已保存
          - paragraph [ref=e69]: 开启临时保护
          - paragraph [ref=e70]: 已到提醒时间，当前仍不用于长期推荐。
        - button "撤销" [ref=e72] [cursor=pointer]
      - group [ref=e74]:
        - generic "当前调整与恢复" [ref=e75] [cursor=pointer]
      - generic [ref=e76]:
        - img "虚构几何封面：沿河慢行" [ref=e77]
        - generic [ref=e83]:
          - strong [ref=e84]: 沿河慢行
          - generic [ref=e85]: 保护持续 · 普通收听不参与长期推荐
    - complementary [ref=e88]:
      - generic [ref=e89]: TRY THE DECISION
      - heading "这次，听一点新的。" [level=1] [ref=e90]
      - paragraph [ref=e91]: 选择探索与民谣，仅本次应用。看看后续推荐如何变化，再试着撤销。
      - generic [ref=e92]:
        - text: 两个独立的选择
        - paragraph [ref=e93]: 设置保存多久，与你希望普通收听如何影响长期推荐，是两件事。
      - generic [ref=e94]:
        - text: 新建受控播放来源
        - combobox "新建受控播放来源" [ref=e95]:
          - option "每日推荐 / 自动队列" [selected]
          - option "搜索来源 / 手动播放"
          - option "歌单来源 / 手动顺序"
      - button "加入本地虚构歌单" [ref=e96] [cursor=pointer]
      - button "AI 建议草稿（实验） ↗" [ref=e97] [cursor=pointer]
      - button "Product Notes · 收起" [expanded] [ref=e98] [cursor=pointer]
      - generic [ref=e99]:
        - group [ref=e100]:
          - generic "版本与操作 · 技术 JSON" [ref=e101] [cursor=pointer]
        - paragraph [ref=e102]: 演示公式，不是网易云真实算法。全部事件只留在本地。
        - generic [ref=e103]:
          - text: 下次保存场景
          - combobox "下次保存场景" [ref=e104]:
            - option "正常" [selected]
            - option "保存失败"
            - option "保存成功、刷新失败"
        - generic [ref=e105]:
          - button "推进30分钟" [ref=e106] [cursor=pointer]
          - button "推进4小时" [active] [ref=e107] [cursor=pointer]
          - button "旧响应晚到" [ref=e108] [cursor=pointer]
          - button "打开并模拟版本冲突" [ref=e109] [cursor=pointer]
          - button "模拟撤销冲突" [ref=e110] [cursor=pointer]
          - button "模拟结果为空" [ref=e111] [cursor=pointer]
          - button "模拟候选不足" [ref=e112] [cursor=pointer]
        - generic [ref=e113]:
          - checkbox "启用 R07 本地实验" [checked] [ref=e114]
          - text: 启用 R07 本地实验
        - group [ref=e115]:
          - generic "排序分数与前后列表" [ref=e116] [cursor=pointer]
        - group [ref=e117]:
          - generic "本地事件日志（10）" [ref=e118] [cursor=pointer]
        - button "导出本地事件 JSON" [ref=e119] [cursor=pointer]
      - paragraph [ref=e120]: 个人产品概念，非网易官方项目。歌曲与推荐数据为演示数据；未调用真实模型，不连接真实音乐账号。
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { mkdir } from "node:fs/promises";
  3   | import {
  4   |   start,
  5   |   want,
  6   |   commit,
  7   |   enableProtection,
  8   |   notes,
  9   |   noOverflow,
  10  | } from "../helpers";
  11  | async function capture(page: Page, name: string) {
  12  |   await page.evaluate(() => document.fonts.ready);
  13  |   // Candidate application regression baseline; owner design approval is separate.
> 14  |   await expect(page).toHaveScreenshot(["batch2.1-candidate", name], {
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  15  |     animations: "disabled",
  16  |   });
  17  |   await mkdir("artifacts/screenshots", { recursive: true });
  18  |   await page.screenshot({
  19  |     path: `artifacts/screenshots/${name}`,
  20  |     animations: "disabled",
  21  |   });
  22  |   await noOverflow(page);
  23  | }
  24  | for (const [width, height] of [
  25  |   [320, 740],
  26  |   [390, 844],
  27  |   [768, 1024],
  28  |   [1440, 900],
  29  | ])
  30  |   test(`visual core states ${width}`, async ({ page }) => {
  31  |     test.setTimeout(180000);
  32  |     await page.setViewportSize({ width, height });
  33  |     await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
  34  |     await page.goto("/");
  35  |     await capture(page, `case-home-${width}.png`);
  36  |     await page.locator("#decisions").scrollIntoViewIfNeeded();
  37  |     await capture(page, `decisions-quick-${width}.png`);
  38  |     await page
  39  |       .locator("#alternatives > .deep-decisions > details")
  40  |       .first()
  41  |       .locator(":scope > summary")
  42  |       .click();
  43  |     await page.locator("#alternatives article details summary").first().click();
  44  |     await page.locator("#alternatives").scrollIntoViewIfNeeded();
  45  |     await capture(page, `decisions-deep-${width}.png`);
  46  |     await start(page);
  47  |     await page.evaluate(() =>
  48  |       scrollTo({
  49  |         top:
  50  |           scrollY +
  51  |           document.querySelector(".product")!.getBoundingClientRect().top,
  52  |         behavior: "instant",
  53  |       }),
  54  |     );
  55  |     await capture(page, `demo-player-${width}.png`);
  56  |     if (width === 320 || width === 768)
  57  |       await page.screenshot({
  58  |         path: `artifacts/screenshots/case-demo-${width}.png`,
  59  |       });
  60  |     await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  61  |     await capture(page, `sheet-root-default-${width}.png`);
  62  |     await page.getByRole("button", { name: "取消", exact: true }).click();
  63  |     await want(page);
  64  |     await capture(page, `want-explore-folk-${width}.png`);
  65  |     await page.getByRole("button", { name: "完成", exact: true }).click();
  66  |     await page.getByRole("button", { name: /影响范围/ }).click();
  67  |     await capture(page, `impact-session-off-${width}.png`);
  68  |     await page.getByRole("switch").check();
  69  |     await capture(page, `impact-session-on-${width}.png`);
  70  |     await page.getByRole("radio", { name: /长期偏好/ }).check();
  71  |     await capture(page, `impact-longterm-on-${width}.png`);
  72  |     await page.getByRole("switch").uncheck();
  73  |     await capture(page, `impact-longterm-off-${width}.png`);
  74  |     await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  75  |     await enableProtection(page);
  76  |     await notes(page);
  77  |     await page.getByRole("button", { name: "推进4小时", exact: true }).click();
  78  |     await page.evaluate(() => scrollTo(0, 0));
  79  |     await capture(page, `temporary-review-required-${width}.png`);
  80  |     await page
  81  |       .getByRole("button", { name: "关闭临时收听", exact: true })
  82  |       .click();
  83  |     await page.getByRole("button", { name: "重置演示", exact: true }).click();
  84  |     await notes(page);
  85  |     await page.getByLabel("下次保存场景").selectOption("refresh");
  86  |     await want(page);
  87  |     await commit(page);
  88  |     await page.locator(".notice").first().scrollIntoViewIfNeeded();
  89  |     await capture(page, `saved-refresh-failed-${width}.png`);
  90  |     await page.getByRole("button", { name: "重置演示", exact: true }).click();
  91  |     await page.getByLabel("下次保存场景").selectOption("none");
  92  |     await page.getByRole("button", { name: "更多：快捷少推" }).click();
  93  |     await page.getByRole("radio", { name: /少推音乐人/ }).check();
  94  |     await page.getByRole("button", { name: "确认调整" }).click();
  95  |     await page.locator(".notice").first().scrollIntoViewIfNeeded();
  96  |     await capture(page, `negative-artist-applied-${width}.png`);
  97  |     for (const [input, status, suffix] of [
  98  |       ["想探索一下民谣", "已识别 · 请核对候选", "ready"],
  99  |       ["这周少推摇滚", "需要确认", "needs-clarification"],
  100 |       ["想听爵士", "暂不支持", "unsupported"],
  101 |     ] as const) {
  102 |       await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  103 |       await page.getByLabel("描述这次想听什么").fill(input);
  104 |       await page.getByRole("button", { name: "生成候选预览" }).click();
  105 |       await expect(
  106 |         page.getByRole("heading", { name: status, exact: true }),
  107 |       ).toBeVisible();
  108 |       await page.locator(".candidate").scrollIntoViewIfNeeded();
  109 |       await capture(page, `ai-${suffix}-${width}.png`);
  110 |       await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  111 |     }
  112 |   });
  113 | 
```