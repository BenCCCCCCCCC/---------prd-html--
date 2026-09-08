import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [],
  external = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (!r.url().startsWith("http://127.0.0.1:4173")) external.push(r.url());
});
const out = "artifacts/batch3-1/production";
await mkdir(out, { recursive: true });
const sha = (b) => createHash("sha256").update(b).digest("hex");
try {
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("[data-prd-section]")).toHaveCount(19);
  expect(
    await page
      .locator(".prd-body img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  const downloads = [];
  for (const [name, path] of [
    ["下载正文（MD）", "docs/PRD_v0.6.md"],
    ["下载正文（Word）", "public/documents/PRD_v0.6_提交候选.docx"],
  ]) {
    const wait = page.waitForEvent("download");
    await page.getByRole("link", { name, exact: true }).click();
    const file = await wait;
    expect(await file.failure()).toBeNull();
    expect(sha(await readFile(await file.path()))).toBe(
      sha(await readFile(path)),
    );
    downloads.push({ name, status: "PASS" });
  }
  await page.screenshot({ path: `${out}/reader-1440.png` });
  await page.waitForLoadState("networkidle");
  await context.setOffline(true);
  await page
    .getByRole("navigation", { name: "PRD 章节目录" })
    .getByRole("link")
    .filter({ hasText: "08｜" })
    .click();
  await page
    .locator("#section-08")
    .getByRole("link", { name: "体验对应流程 ↗" })
    .click();
  expect(
    await page
      .locator(".reference-player img")
      .evaluateAll((nodes) =>
        nodes.every((el) => el.complete && el.naturalWidth > 0),
      ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "调整本次推荐偏好", exact: true })
    .click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("switch").check();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  await expect(page.locator(".protection-bar")).toContainText("临时收听中");
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "本轮调整结果" }),
  ).toContainText("已撤销本轮调整");
  await page.getByRole("checkbox", { name: "显示标注" }).uncheck();
  await page.screenshot({ path: `${out}/autonomous-guide-closed-1440.png` });
  await page.getByRole("link", { name: "← 返回本节", exact: true }).click();
  await expect(page.locator("#section-08")).toBeFocused();
  expect(
    await page
      .locator(".prd-body img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  const result = {
    status: "PASS",
    mode: "production_reader_initial_load_then_offline_section_prototype_return",
    downloads,
    errors,
    externalRequests: external,
    originalSections: 19,
    staticDiagramOnReturn: true,
  };
  await writeFile(`${out}/result.json`, JSON.stringify(result, null, 2));
  console.log(result);
} finally {
  await browser.close();
}
