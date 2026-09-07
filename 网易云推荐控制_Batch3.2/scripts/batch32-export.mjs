import { chromium, expect } from "@playwright/test";
import { mkdir, copyFile } from "node:fs/promises";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("http://127.0.0.1:5173/");
  await expect(page.locator("[data-prd-section]")).toHaveCount(19);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".prototype-parameters")).toHaveJSProperty(
    "open",
    true,
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".prd-body img")).toBeVisible();
  await mkdir("artifacts/batch3-2/print", { recursive: true });
  const path = "public/documents/PRD_v0.6_需求评审稿.pdf";
  await page.pdf({ path, printBackground: true, preferCSSPageSize: true });
  await copyFile(path, "artifacts/batch3-2/print/PRD_v0.6_需求评审稿.pdf");
  console.log("Exported complete browser PRD to the actual PDF download.");
} finally {
  await browser.close();
}
