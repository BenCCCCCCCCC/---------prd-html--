import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { start, getState, commit, noOverflow } from "../helpers";
import AxeBuilder from "@axe-core/playwright";

test("B31 approved candidate source exact, history preserved, clean reader shell", async ({
  page,
}) => {
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
  expect(
    sha(await readFile("docs/history/batch3-1/PRD_v0.6_提交候选.md")),
  ).toBe(
    sha(await readFile("finalization_input/content/PRD_v0.6_提交候选.md")),
  );
  expect(sha(await readFile("docs/PRD_v0.5.1.md"))).toBe(
    "ee82185ef668fd81ce506d5ca83f33cd4472b264d6ed52bbd52e15ad4bf2786d",
  );
  await page.goto("/");
  await expect(page.locator(".document-meta")).toContainText(
    "PRD v0.6 · 原型 v0.3.2",
  );
  await expect(page.locator(".reader-page")).not.toContainText(
    /Batch|NOT_RUN|负责人待复核|原文结束|面试|简历|ERR_BLOCKED|90秒/,
  );
  await expect(page.locator("#section-03")).toContainText("尚未校准");
  await expect(page.locator("#section-05")).toContainText(
    "主竞品为QQ音乐、Apple Music",
  );
  await expect(page.locator("#section-13")).toContainText("本地规则解析");
  await expect(page.locator("#section-12")).toContainText("尚未定义");
  await expect(page.locator("#section-19 tbody tr")).toHaveCount(7);
});

test("B31 shared display identity across player queue negative snapshot and AI candidate", async ({
  page,
}) => {
  await start(page);
  await expect(page.locator(".track-heading")).toContainText("牵丝戏");
  await expect(page.locator(".track-heading")).toContainText("Aki阿杰 / 银临");
  const firstCover = await page
    .locator(".reference-cover img")
    .getAttribute("src");
  await page.getByRole("button", { name: "推荐队列", exact: true }).click();
  await expect(
    page.locator(".queue-row").filter({ hasText: "牵丝戏" }),
  ).toContainText("Aki阿杰 / 银临");
  await expect(page.locator(".mini-player img")).toHaveAttribute(
    "src",
    firstCover!,
  );
  await page.getByRole("button", { name: "返回播放器", exact: true }).click();
  await expect(page.locator(".mini-player")).toHaveCount(0);
  await page.getByRole("button", { name: "更多：快捷少推" }).click();
  await expect(page.locator(".sheet-body")).toContainText(
    "对象绑定打开时的歌曲：牵丝戏",
  );
  await expect(
    page.getByRole("radio", { name: /少推音乐人/ }),
  ).toHaveAccessibleName(/Aki阿杰/);
  await page.getByRole("radio", { name: /少推歌曲/ }).check();
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  expect((await getState(page)).session.negativeTargets).toEqual([
    { kind: "track", id: "T01" },
  ]);
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await page.getByRole("button", { name: "AI 实验 · 本地解析" }).click();
  await page.getByLabel("描述这次想听什么").fill("少推当前音乐人");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(page.locator(".candidate")).toContainText("Aki阿杰 / 银临");
  await page.getByRole("button", { name: "采用到草稿" }).click();
  expect((await getState(page)).session.negativeTargets).toEqual([]);
  await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  await page.getByRole("button", { name: "下一首模拟歌曲" }).click();
  expect((await getState(page)).trackId).not.toBe("T01");
  await expect(page.locator(".track-heading")).not.toContainText("牵丝戏");
  expect(
    await page.locator(".reference-cover img").getAttribute("src"),
  ).not.toBe(firstCover);
  const state = await getState(page);
  await page.getByRole("button", { name: /收藏当前歌曲/ }).click();
  expect((await getState(page)).likes).toEqual([state.trackId]);
  await expect(
    page.getByRole("button", { name: /收藏当前歌曲/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

for (const [width, height] of [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
])
  for (const scale of [100, 200])
    test(`B31 read-only annotations and modal isolation ${width} ${scale}%`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await start(page);
      if (scale === 200)
        await page.addStyleTag({ content: "html{font-size:200%}" });
      const dir = `artifacts/batch3-2/annotations/${width}-${scale}`;
      await mkdir(dir, { recursive: true });
      const before = await getState(page);
      await page.getByRole("checkbox", { name: "显示标注" }).uncheck();
      await expect(
        page.getByRole("complementary", { name: "研发规则标注" }),
      ).toHaveCount(0);
      await expect(
        page.getByText("当前调整与恢复", { exact: true }),
      ).toBeVisible();
      await page.getByRole("checkbox", { name: "显示标注" }).check();
      const after = await getState(page);
      expect(after.operations).toEqual(before.operations);
      expect(after.session).toEqual(before.session);
      expect(after.protection).toBe(before.protection);
      await page.screenshot({ path: `${dir}/player.png` });
      await page
        .getByRole("button", { name: "调整本次推荐偏好", exact: true })
        .click();
      const annotations = page.getByRole("complementary", {
        name: "研发规则标注",
      });
      if (width < 1100) await annotations.locator("summary").click();
      await expect(annotations.getByRole("listitem")).toHaveCount(5);
      await expect(annotations).toContainText("提交中防止重复操作");
      expect(
        await page
          .locator(".demo-toolbar input")
          .evaluate(
            (el) =>
              el.matches(":disabled") ||
              el.closest("[inert]") !== null ||
              !!document.querySelector("dialog:modal"),
          ),
      ).toBe(true);
      await annotations.getByRole("link", { name: "返回对应章节" }).focus();
      await expect(
        annotations.getByRole("link", { name: "返回对应章节" }),
      ).toBeFocused();
      await page.screenshot({ path: `${dir}/root.png` });
      if (width < 1100) await annotations.locator("summary").click();
      await page.getByRole("button", { name: /影响范围/ }).click();
      await page.getByRole("radio", { name: /长期偏好/ }).check();
      await page.getByRole("switch").check();
      if (width < 1100) await annotations.locator("summary").click();
      await expect(annotations).toContainText("长期偏好");
      await expect(annotations).toContainText("保护草稿：开启");
      await page.screenshot({ path: `${dir}/impact.png` });
      if (width < 1100) await annotations.locator("summary").click();
      await commit(page);
      expect((await getState(page)).protection).toBe("active");
      await page.getByRole("checkbox", { name: "显示标注" }).uncheck();
      await expect(page.locator(".protection-bar")).toContainText("临时收听中");
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
