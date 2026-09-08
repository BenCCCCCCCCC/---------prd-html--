# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual\screens.spec.ts >> visual core states 320
- Location: tests\visual\screens.spec.ts:27:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  32244 pixels (ratio 0.14 of all image pixels) are different.

  Snapshot: demo-player-320.png

Call log:
  - Expect "toHaveScreenshot(demo-player-320.png)" with timeout 7000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 32244 pixels (ratio 0.14 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 32244 pixels (ratio 0.14 of all image pixels) are different.

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
      - generic [ref=e17]: 临时收听未开启
      - img "虚构几何封面：沿河慢行" [ref=e31]
      - button [ref=e37] [cursor=pointer]:
        - generic [ref=e38]:
          - text: 调整推荐
          - generic [ref=e39]: ›
      - generic [ref=e40]:
        - generic [ref=e41]:
          - heading "沿河慢行" [level=2] [ref=e42]
          - paragraph [ref=e43]: 示例音乐人1 ↗
        - button "收藏当前虚构歌曲" [ref=e44] [cursor=pointer]
      - progressbar "模拟播放进度" [ref=e47]
      - generic [ref=e48]:
        - generic [ref=e49]: 00:00
        - generic [ref=e50]: 合成曲库 · 无真实音频
        - generic [ref=e51]: 3:21
      - generic [ref=e52]:
        - button "更多：快捷少推" [ref=e53] [cursor=pointer]: •••
        - button "播放模拟" [ref=e54] [cursor=pointer]
        - button "下一首模拟歌曲" [ref=e57] [cursor=pointer]
      - paragraph [ref=e60]: 平衡 · 不限方向
      - group [ref=e62]:
        - generic "当前调整与恢复 · revision 0" [ref=e63] [cursor=pointer]
      - generic [ref=e64]:
        - img "虚构几何封面：沿河慢行" [ref=e65]
        - generic [ref=e71]:
          - strong [ref=e72]: 沿河慢行
          - generic [ref=e73]: 普通收听可参与长期推荐
    - complementary [ref=e76]:
      - generic [ref=e77]: TRY THE DECISION
      - heading "这次，听一点新的。" [level=1] [ref=e78]
      - paragraph [ref=e79]: 选择探索与民谣，仅本次应用。看看后续推荐如何变化，再试着撤销。
      - generic [ref=e80]:
        - text: 两个独立的选择
        - paragraph [ref=e81]: 设置保存多久，与你希望普通收听如何影响长期推荐，是两件事。
      - generic [ref=e82]:
        - text: 新建受控播放来源
        - combobox "新建受控播放来源" [ref=e83]:
          - option "每日推荐 / 自动队列" [selected]
          - option "搜索来源 / 手动播放"
          - option "歌单来源 / 手动顺序"
      - button "加入本地虚构歌单" [ref=e84] [cursor=pointer]
      - button "AI 建议草稿（实验） ↗" [ref=e85] [cursor=pointer]
      - button "Product Notes · 查看规则与模拟失败" [ref=e86] [cursor=pointer]
      - paragraph [ref=e87]: 个人产品概念，非网易官方项目。歌曲与推荐数据为演示数据；未调用真实模型，不连接真实音乐账号。
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
> 13  |   await expect(page).toHaveScreenshot(name, { animations: "disabled" });
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  14  |   await mkdir("artifacts/screenshots", { recursive: true });
  15  |   await page.screenshot({
  16  |     path: `artifacts/screenshots/${name}`,
  17  |     animations: "disabled",
  18  |   });
  19  |   await noOverflow(page);
  20  | }
  21  | for (const [width, height] of [
  22  |   [320, 740],
  23  |   [390, 844],
  24  |   [768, 1024],
  25  |   [1440, 900],
  26  | ])
  27  |   test(`visual core states ${width}`, async ({ page }) => {
  28  |     test.setTimeout(180000);
  29  |     await page.setViewportSize({ width, height });
  30  |     await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
  31  |     await page.goto("/");
  32  |     await capture(page, `case-home-${width}.png`);
  33  |     await page.locator("#decisions").scrollIntoViewIfNeeded();
  34  |     await capture(page, `decisions-quick-${width}.png`);
  35  |     await page
  36  |       .locator("#alternatives > .deep-decisions > details")
  37  |       .first()
  38  |       .locator(":scope > summary")
  39  |       .click();
  40  |     await page.locator("#alternatives article details summary").first().click();
  41  |     await page.locator("#alternatives").scrollIntoViewIfNeeded();
  42  |     await capture(page, `decisions-deep-${width}.png`);
  43  |     await start(page);
  44  |     await capture(page, `demo-player-${width}.png`);
  45  |     if (width === 320 || width === 768)
  46  |       await page.screenshot({
  47  |         path: `artifacts/screenshots/case-demo-${width}.png`,
  48  |       });
  49  |     await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  50  |     await capture(page, `sheet-root-default-${width}.png`);
  51  |     await page.getByRole("button", { name: "取消", exact: true }).click();
  52  |     await want(page);
  53  |     await capture(page, `want-explore-folk-${width}.png`);
  54  |     await page.getByRole("button", { name: "完成", exact: true }).click();
  55  |     await page.getByRole("button", { name: /影响范围/ }).click();
  56  |     await capture(page, `impact-session-off-${width}.png`);
  57  |     await page.getByRole("switch").check();
  58  |     await capture(page, `impact-session-on-${width}.png`);
  59  |     await page.getByRole("radio", { name: /长期偏好/ }).check();
  60  |     await capture(page, `impact-longterm-on-${width}.png`);
  61  |     await page.getByRole("switch").uncheck();
  62  |     await capture(page, `impact-longterm-off-${width}.png`);
  63  |     await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  64  |     await enableProtection(page);
  65  |     await notes(page);
  66  |     await page.getByRole("button", { name: "推进4小时", exact: true }).click();
  67  |     await page.evaluate(() => scrollTo(0, 0));
  68  |     await capture(page, `temporary-review-required-${width}.png`);
  69  |     await page
  70  |       .getByRole("button", { name: "关闭临时收听", exact: true })
  71  |       .click();
  72  |     await page.getByRole("button", { name: "重置演示", exact: true }).click();
  73  |     await notes(page);
  74  |     await page.getByLabel("下次保存场景").selectOption("refresh");
  75  |     await want(page);
  76  |     await commit(page);
  77  |     await page.locator(".notice").first().scrollIntoViewIfNeeded();
  78  |     await capture(page, `saved-refresh-failed-${width}.png`);
  79  |     await page.getByRole("button", { name: "重置演示", exact: true }).click();
  80  |     await page.getByLabel("下次保存场景").selectOption("none");
  81  |     await page.getByRole("button", { name: "更多：快捷少推" }).click();
  82  |     await page.getByRole("radio", { name: /少推音乐人/ }).check();
  83  |     await page.getByRole("button", { name: "确认调整" }).click();
  84  |     await page.locator(".notice").first().scrollIntoViewIfNeeded();
  85  |     await capture(page, `negative-artist-applied-${width}.png`);
  86  |     for (const [input, status, suffix] of [
  87  |       ["想探索一下民谣", "已识别 · 请核对候选", "ready"],
  88  |       ["这周少推摇滚", "需要确认", "needs-clarification"],
  89  |       ["想听爵士", "暂不支持", "unsupported"],
  90  |     ] as const) {
  91  |       await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  92  |       await page.getByLabel("描述这次想听什么").fill(input);
  93  |       await page.getByRole("button", { name: "生成候选预览" }).click();
  94  |       await expect(
  95  |         page.getByRole("heading", { name: status, exact: true }),
  96  |       ).toBeVisible();
  97  |       await page.locator(".candidate").scrollIntoViewIfNeeded();
  98  |       await capture(page, `ai-${suffix}-${width}.png`);
  99  |       await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  100 |     }
  101 |   });
  102 | 
```