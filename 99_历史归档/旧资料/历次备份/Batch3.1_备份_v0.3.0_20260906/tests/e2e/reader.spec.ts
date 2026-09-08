import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  want,
  commit,
  getState,
  noOverflow,
  enableProtection,
} from "../helpers";

const original = await readFile("docs/PRD_v0.5.1.md", "utf8");
const sections = original.split(/(?=^## \d{2}｜)/m).slice(1);
const norm = (text: string) => text.replace(/\s/g, "");
const plain = (text: string) =>
  norm(
    text
      .split(/\r?\n/)
      .filter((line) => !/^```|^\|[\s|:-]+\|$|^!\[/.test(line))
      .map((line) => line.replace(/^#{1,6} |^> ?/g, "").replace(/`|\|/g, ""))
      .join(""),
  );
const sha = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

test("Batch3 complete original 01–19 body tables diagrams references and versions", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "网易云音乐｜推荐控制链路优化",
      exact: true,
    }),
  ).toBeVisible();
  expect(sections).toHaveLength(19);
  await expect(page.locator("[data-prd-section]")).toHaveCount(19);
  await expect(
    page.getByRole("navigation", { name: "PRD 章节目录" }).getByRole("link"),
  ).toHaveCount(19);
  const coverage = [];
  for (const body of sections) {
    const id = body.match(/^## (\d{2})/)![1];
    const section = page.locator(
      `[data-prd-section="${id}"] .original-section`,
    );
    const actual = norm(await section.innerText());
    expect(actual, `§${id}: complete text, no paraphrase`).toBe(plain(body));
    const tables = (body.match(/^\|[\s|:-]+\|\r?$/gm) ?? []).length;
    await expect(section.locator("table")).toHaveCount(tables);
    const blocks = (body.match(/^```text/gm) ?? []).length;
    await expect(section.locator("pre")).toHaveCount(blocks);
    const references = body.match(/\[(?:S|W)\d[^\]]*\]/g) ?? [];
    for (const ref of references)
      expect(await section.innerText()).toContain(ref);
    coverage.push({
      id,
      title: body.split("\n")[0].trim(),
      status: "PASS",
      completeTextSha256: sha(actual),
      tables,
      staticTextDiagrams: blocks,
      references: references.length,
    });
  }
  const diagram = page.locator(".prd-body img");
  await expect(diagram).toHaveCount(1);
  expect(
    await diagram.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
    ),
  ).toBe(true);
  await expect(diagram).toHaveAttribute(
    "alt",
    "图｜多角色正向、取消、失败与撤销流程。为目标集成方案，并非已部署服务。",
  );
  await mkdir("artifacts/batch3", { recursive: true });
  await writeFile(
    "artifacts/batch3/body-coverage.json",
    JSON.stringify(
      { sourceSha256: sha(original), sections: coverage, imageCount: 1 },
      null,
      2,
    ),
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Batch3 actual PRD original and reference ZIP downloads", async ({
  page,
}) => {
  await page.goto("/");
  for (const [name, file] of [
    ["下载 PRD 原文（Markdown）", "docs/PRD_v0.5.1.md"],
    ["下载原文与图示（ZIP）", "public/documents/PRD_v0.5.1_阅读资料.zip"],
  ]) {
    const link = page.getByRole("link", { name, exact: true });
    expect(await link.getAttribute("href")).not.toMatch(/F:|chatgpt|sandbox:/i);
    const download = page.waitForEvent("download");
    await link.click();
    const result = await download;
    expect(await result.failure()).toBeNull();
    expect(sha(await readFile((await result.path())!))).toBe(
      sha(await readFile(file)),
    );
  }
});

for (const [width, height] of [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
])
  for (const scale of [100, 200])
    test(`Batch3 reading navigation search table keyboard ${width} ${scale}%`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
      await page.goto("/");
      if (scale === 200)
        await page.addStyleTag({ content: "html{font-size:200%}" });
      const dir = `artifacts/batch3/reader/${width}-${scale}`;
      await mkdir(dir, { recursive: true });
      await page.screenshot({ path: `${dir}/entry.png` });
      await noOverflow(page);
      await page.getByLabel("搜索正文", { exact: true }).fill("使用频率");
      await expect(page.getByRole("status")).toContainText("章节：");
      const match = page
        .locator(".reading-search")
        .getByRole("link")
        .filter({ hasText: "03｜" });
      await match.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#section-03")).toBeFocused();
      await page.screenshot({ path: `${dir}/section-03.png` });
      await noOverflow(page);
      const table = page.locator("#section-03 .prd-table-scroll");
      await table.focus();
      await page.keyboard.press("ArrowRight");
      expect(
        await table.evaluate((el) => el.scrollWidth >= el.clientWidth),
      ).toBe(true);
      await page
        .getByRole("navigation", { name: "PRD 章节目录" })
        .getByRole("link")
        .filter({ hasText: "06｜" })
        .click();
      await page
        .locator("#section-06")
        .getByRole("link", { name: "体验对应流程 ↗" })
        .click();
      await expect(page.getByTestId("product")).toHaveCount(1);
      expect((await getState(page)).operations).toHaveLength(0);
      expect((await getState(page)).session.positiveTagIds).toBeNull();
      await want(page);
      await commit(page);
      await expect(
        page.getByRole("region", { name: "本轮调整结果" }),
      ).toContainText("已保存");
      await page.getByRole("button", { name: "撤销", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "本轮调整结果" }),
      ).toContainText("已撤销本轮调整");
      await page.screenshot({ path: `${dir}/prototype-undone.png` });
      const before = await getState(page);
      await page.getByRole("link", { name: "← 返回本节", exact: true }).click();
      await expect(page.locator("#section-06")).toBeFocused();
      expect((await getState(page)).operations).toEqual(before.operations);
      await page.screenshot({ path: `${dir}/return-section.png` });
      await noOverflow(page);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });

test("Batch3 all linked flows return to their exact section without applying or loading examples", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of ["06", "07", "08", "09", "10", "11", "12", "13"]) {
    await page
      .getByRole("navigation", { name: "PRD 章节目录" })
      .getByRole("link")
      .filter({ hasText: `${id}｜` })
      .click();
    await page
      .locator(`#section-${id}`)
      .getByRole("link", { name: "体验对应流程 ↗" })
      .click();
    expect((await getState(page)).operations).toHaveLength(0);
    await page.getByRole("link", { name: "← 返回本节", exact: true }).click();
    await expect(page.locator(`#section-${id}`)).toBeFocused();
  }
});

test("Batch3 route navigation keeps dirty draft and session clock while clearing private AI input", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-05T10:00:00Z") });
  await page.goto("/#/demo?from=09");
  await enableProtection(page);
  await want(page);
  const before = await getState(page);
  // Address-bar route navigation must preserve the in-memory draft too.
  await page.evaluate(() => {
    location.hash = "#/?section=09";
  });
  await expect(page.locator("#section-09")).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.clock.fastForward(30 * 60 * 1000 + 1000);
  expect((await getState(page)).protection).toBe("review_required");
  expect((await getState(page)).operations).toEqual(before.operations);
  await page
    .locator("#section-09")
    .getByRole("link", { name: "体验对应流程 ↗" })
    .click();
  await expect(
    page.getByRole("radio", { name: "探索", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "民谣", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  await page.getByLabel("描述这次想听什么").fill("想探索一下民谣");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(
    page.getByRole("heading", { name: "已识别 · 请核对候选", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    location.hash = "#/?section=13";
  });
  await page
    .locator("#section-13")
    .getByRole("link", { name: "体验对应流程 ↗" })
    .click();
  await expect(page.getByLabel("描述这次想听什么")).toHaveValue("");
  await expect(page.locator(".candidate")).toHaveCount(0);
  await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
  await page.locator(".review-guide > summary").click();
  await expect(
    page.getByText(
      "选择探索与民谣，仅本次应用。看看后续推荐如何变化，再试着撤销。",
    ),
  ).not.toBeVisible();
  await expect(page.getByText("当前调整与恢复", { exact: true })).toBeVisible();
});

test("Batch3 print contains all original sections tables and static figures", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  for (const id of sections.map((s) => s.match(/^## (\d{2})/)![1]))
    await expect(page.locator(`#section-${id}`)).toBeVisible();
  await expect(page.locator(".reading-index")).not.toBeVisible();
  await expect(page.locator(".section-prototype").first()).not.toBeVisible();
  await expect(page.locator(".prd-body img")).toBeVisible();
  await mkdir("artifacts/batch3/print", { recursive: true });
  await page.pdf({
    path: "artifacts/batch3/print/PRD_v0.5.1_完整阅读层.pdf",
    printBackground: true,
    preferCSSPageSize: true,
  });
});

test("Batch3 secondary overview and its internal anchors preserve the active prototype state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/demo");
  await want(page);
  await commit(page);
  const before = await getState(page);
  await page.getByRole("link", { name: "← 返回完整 PRD", exact: true }).click();
  await page.getByRole("link", { name: "项目概览", exact: true }).click();
  for (const [name, id] of [
    ["Evidence", "evidence"],
    ["Reflection", "reflection"],
    ["Case", "case"],
  ]) {
    await page
      .getByRole("navigation", { name: "案例导航" })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  expect((await getState(page)).operations).toEqual(before.operations);
  expect((await getState(page)).session).toEqual(before.session);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("link", { name: "查看产品决策 ↓" }).click();
  await expect(page.locator("#decisions")).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .getByRole("navigation", { name: "案例导航" })
    .getByRole("link", { name: "Demo", exact: true })
    .click();
  await expect(page.getByTestId("product")).toHaveCount(1);
  expect((await getState(page)).session).toEqual(before.session);
});
