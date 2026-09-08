import { chromium, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const checks = [];
try {
  for (const width of [320, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      reducedMotion: "reduce",
    });
    await page.goto("http://127.0.0.1:5173/#/demo");
    await page.addStyleTag({ content: "html{font-size:200%}" });
    await page.getByRole("button", { name: "调整推荐", exact: true }).click();
    await page.screenshot({
      path: `artifacts/screenshots/accessibility-root-200percent-${width}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: /影响范围/ }).click();
    await page.getByRole("switch").check();
    await page.getByRole("button", { name: "完成", exact: true }).click();
    await page.getByRole("button", { name: "确认调整", exact: true }).click();
    await expect(page.locator(".protection-bar")).toContainText("临时收听中");
    checks.push({
      width,
      textScale: "200%",
      flow: "enable_protection_with_scrollable_dialog",
      status: "PASS",
      reducedMotion: await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    });
    await page.close();
  }
  await writeFile(
    "artifacts/reports/accessibility-targeted.json",
    JSON.stringify(
      { checks, realScreenReader: "NOT_RUN", physicalSoftKeyboard: "NOT_RUN" },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
