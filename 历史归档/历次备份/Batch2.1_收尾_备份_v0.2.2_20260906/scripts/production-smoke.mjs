import { chromium, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const errors = [],
  external = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (!r.url().startsWith("http://127.0.0.1:4173")) external.push(r.url());
});
try {
  await page.goto("http://127.0.0.1:4173/#/demo");
  await expect(
    page.getByRole("button", { name: "调整推荐", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page.getByRole("button", { name: "民谣", exact: true }).click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "确认调整" }).click();
  await expect(
    page.getByRole("button", { name: "撤销", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  await writeFile(
    "artifacts/reports/production-smoke.json",
    JSON.stringify(
      {
        status: "PASS",
        mode: "production_build_offline_after_initial_load",
        errors,
        externalRequests: external,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: built demo runs core flow offline after initial load, no page errors or external requests.",
  );
} finally {
  await browser.close();
}
