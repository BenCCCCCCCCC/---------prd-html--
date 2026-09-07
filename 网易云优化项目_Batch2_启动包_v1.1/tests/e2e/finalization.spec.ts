import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import { noOverflow } from "../helpers";

test("B32 limited text diff preserves 15 untouched sections and every original formula", async ({
  page,
}) => {
  const old = await readFile(
    "docs/history/batch3-1/PRD_v0.6_提交候选.md",
    "utf8",
  );
  const current = await readFile("docs/PRD_v0.6.md", "utf8");
  const parts = (text: string) => text.split(/(?=^## \d{2}｜)/m).slice(1);
  expect(parts(current)).toHaveLength(19);
  parts(old).forEach((section, i) => {
    if (![0, 4, 6, 11].includes(i)) expect(parts(current)[i]).toBe(section);
  });
  for (const code of old.match(/```text[\s\S]*?```/g) ?? [])
    expect(current).toContain(code);
  expect(current).not.toContain("提交候选");
  await page.goto("/");
  await expect(page.locator(".document-meta")).toHaveText(
    "PRD v0.6 · 原型 v0.3.2 · 2026-09-06",
  );
  await expect(page.locator(".document-status")).toHaveText("状态：需求评审稿");
  await expect(page.locator("#section-01 h2")).toHaveText(
    "01｜项目背景、目标与范围",
  );
  await expect(page.locator("#section-05")).toContainText(
    "不代表用户需求已经被证明",
  );
  const table = page.locator("#section-12 table").last();
  await expect(table.locator("tbody tr")).toHaveCount(5);
  for (const id of ["Q01", "Q02", "Q03", "Q04", "Q05"])
    await expect(table).toContainText(id);
  await expect(table).toContainText("产品 / 客户端");
  await expect(table).toContainText("UI冻结前");
});

test("B32 parameter search expands text and printing restores prior disclosure state", async ({
  page,
}) => {
  await page.goto("/");
  const details = page.locator(".prototype-parameters");
  await expect(details).not.toHaveAttribute("open");
  await page.getByLabel("搜索正文").fill("positiveMatch");
  await page.locator(".reading-search").getByRole("link").click();
  await expect(details).toHaveJSProperty("open", true);
  await expect(details).toContainText("0.30 × positiveMatch");
  await details.locator("summary").click();
  await expect(details).toHaveJSProperty("open", false);
  await page.emulateMedia({ media: "print" });
  await expect(details).toHaveJSProperty("open", true);
  await expect(details.locator("pre")).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await expect(details).toHaveJSProperty("open", false);
  await details.locator("summary").click();
  await page.emulateMedia({ media: "print" });
  await page.emulateMedia({ media: "screen" });
  await expect(details).toHaveJSProperty("open", true);
});

for (const [width, height] of [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
]) {
  for (const scale of [100, 200]) {
    test(`B32 document disclosure questions and keyboard ${width} ${scale}%`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      if (scale === 200)
        await page.addStyleTag({ content: "html{font-size:200%}" });
      const dir = `artifacts/batch3-2/document/${width}-${scale}`;
      await mkdir(dir, { recursive: true });
      await page.screenshot({ path: `${dir}/entry.png` });
      await page
        .getByRole("navigation", { name: "PRD 章节目录" })
        .getByRole("link")
        .filter({ hasText: "07｜" })
        .click();
      const details = page.locator(".prototype-parameters");
      await expect(details).toHaveJSProperty("open", false);
      await expect(details.locator("pre")).not.toBeVisible();
      await expect(page.locator("#section-07")).toContainText("少推仍可能出现");
      await page.screenshot({ path: `${dir}/parameters-collapsed.png` });
      await details.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(details.locator("pre")).toBeVisible();
      await expect(details).toContainText("正式融合权重需推荐团队");
      await noOverflow(page);
      await page.screenshot({ path: `${dir}/parameters-expanded.png` });
      await page
        .getByRole("navigation", { name: "PRD 章节目录" })
        .getByRole("link")
        .filter({ hasText: "12｜" })
        .click();
      await page
        .getByRole("heading", { name: "待确认事项 / Open Questions" })
        .scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${dir}/questions.png` });
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}
