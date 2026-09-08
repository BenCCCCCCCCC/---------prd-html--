import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import {
  start,
  want,
  commit,
  enableProtection,
  notes,
  noOverflow,
} from "../helpers";
async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  // Candidate application regression baseline; owner design approval is separate.
  await expect(page).toHaveScreenshot(
    [
      name.startsWith("reader-") ? "batch3-2-document" : "batch3-1-candidate",
      name,
    ],
    {
      animations: "disabled",
    },
  );
  await mkdir("artifacts/batch3-2/regression-screenshots", { recursive: true });
  await page.screenshot({
    path: `artifacts/batch3-2/regression-screenshots/${name}`,
    animations: "disabled",
  });
  await noOverflow(page);
}
for (const [width, height] of [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
])
  test(`visual core states ${width}`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height });
    await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
    await page.goto("/");
    await capture(page, `reader-entry-${width}.png`);
    await page
      .getByRole("navigation", { name: "PRD 章节目录" })
      .getByRole("link")
      .filter({ hasText: "03｜" })
      .click();
    await capture(page, `reader-section-03-${width}.png`);
    await page.goto("/#/overview");
    await capture(page, `case-home-${width}.png`);
    await page.locator("#decisions").scrollIntoViewIfNeeded();
    await capture(page, `decisions-quick-${width}.png`);
    await page
      .locator("#alternatives > .deep-decisions > details")
      .first()
      .locator(":scope > summary")
      .click();
    await page.locator("#alternatives article details summary").first().click();
    await page.locator("#alternatives").scrollIntoViewIfNeeded();
    await capture(page, `decisions-deep-${width}.png`);
    await start(page);
    await page.evaluate(() =>
      scrollTo({
        top:
          scrollY +
          document.querySelector(".product")!.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
    await capture(page, `demo-player-${width}.png`);
    if (width === 320 || width === 768)
      await page.screenshot({
        path: `artifacts/batch3-2/regression-screenshots/case-demo-${width}.png`,
      });
    await page
      .getByRole("button", { name: "调整本次推荐偏好", exact: true })
      .click();
    await capture(page, `sheet-root-default-${width}.png`);
    await page.getByRole("button", { name: "取消", exact: true }).click();
    await want(page);
    await capture(page, `want-explore-folk-${width}.png`);
    await page.getByRole("button", { name: "完成", exact: true }).click();
    await page.getByRole("button", { name: /影响范围/ }).click();
    await capture(page, `impact-session-off-${width}.png`);
    await page.getByRole("switch").check();
    await capture(page, `impact-session-on-${width}.png`);
    await page.getByRole("radio", { name: /长期偏好/ }).check();
    await capture(page, `impact-longterm-on-${width}.png`);
    await page.getByRole("switch").uncheck();
    await capture(page, `impact-longterm-off-${width}.png`);
    await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
    await enableProtection(page);
    await notes(page);
    await page.getByRole("button", { name: "推进4小时", exact: true }).click();
    await page.evaluate(() => scrollTo(0, 0));
    await capture(page, `temporary-review-required-${width}.png`);
    await page
      .getByRole("button", { name: "关闭临时收听", exact: true })
      .click();
    await page.getByRole("button", { name: "重置演示", exact: true }).click();
    await notes(page);
    await page.getByLabel("下次保存场景").selectOption("refresh");
    await want(page);
    await commit(page);
    await expect(
      page.getByRole("region", { name: "本轮调整结果" }),
    ).toBeInViewport();
    await capture(page, `saved-refresh-failed-${width}.png`);
    await page.getByRole("button", { name: "重置演示", exact: true }).click();
    await page.getByLabel("下次保存场景").selectOption("none");
    await page.getByRole("button", { name: "更多：快捷少推" }).click();
    await page.getByRole("radio", { name: /少推音乐人/ }).check();
    await page.getByRole("button", { name: "确认调整" }).click();
    await expect(
      page.getByRole("region", { name: "本轮调整结果" }),
    ).toBeInViewport();
    await capture(page, `negative-artist-applied-${width}.png`);
    for (const [input, status, suffix] of [
      ["想探索一下民谣", "已识别 · 请核对候选", "ready"],
      ["这周少推摇滚", "需要确认", "needs-clarification"],
      ["想听爵士", "暂不支持", "unsupported"],
    ] as const) {
      await page
        .getByRole("button", { name: "AI 实验 · 本地解析", exact: true })
        .click();
      await page.getByLabel("描述这次想听什么").fill(input);
      await page.getByRole("button", { name: "生成候选预览" }).click();
      await expect(
        page.getByRole("heading", { name: status, exact: true }),
      ).toBeVisible();
      await page.locator(".candidate").scrollIntoViewIfNeeded();
      await capture(page, `ai-${suffix}-${width}.png`);
      await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
    }
  });
