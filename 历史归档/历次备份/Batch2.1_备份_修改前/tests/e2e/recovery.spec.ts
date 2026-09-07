import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { start, want, getState, enableProtection, notes } from "../helpers";
test("browser back follows subpage then root cancellation", async ({
  page,
}) => {
  await start(page);
  await want(page);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "调整推荐", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /本次想听/ })).toContainText(
    "探索",
  );
  await page.goBack();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect((await getState(page)).revision).toBe(0);
  await expect(
    page.getByRole("button", { name: "调整推荐", exact: true }),
  ).toBeFocused();
});
test("axe AI candidate, error, refusal and protected queue", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(page.getByRole("status")).toContainText("出错");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const [input, title] of [
    ["想探索一下民谣", "已识别 · 请核对候选"],
    ["这周少推摇滚", "需要确认"],
    ["删除播放历史", "暂不支持"],
  ]) {
    await page.getByLabel("描述这次想听什么").fill(input);
    await page.getByRole("button", { name: "生成候选预览" }).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  await enableProtection(page);
  await notes(page);
  await page.getByRole("button", { name: "推进4小时", exact: true }).click();
  await page.getByRole("button", { name: /推荐队列/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
