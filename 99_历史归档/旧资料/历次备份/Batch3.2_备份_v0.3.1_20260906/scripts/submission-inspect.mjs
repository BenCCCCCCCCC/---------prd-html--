import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  locale: "zh-CN",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("artifacts/batch3-1/initial", { recursive: true });
await page.goto("http://127.0.0.1:5173/#/demo");
await page.getByTestId("product").waitFor();
await page.screenshot({
  path: "artifacts/batch3-1/initial/player-desktop.png",
  fullPage: true,
});
await page
  .getByTestId("product")
  .screenshot({ path: "artifacts/batch3-1/initial/player.png" });
await page
  .getByRole("button", { name: "调整本次推荐偏好", exact: true })
  .click();
await page.screenshot({ path: "artifacts/batch3-1/initial/root-desktop.png" });
await page.getByRole("button", { name: /本次想听/ }).click();
await page.screenshot({ path: "artifacts/batch3-1/initial/want-desktop.png" });
await writeFile(
  "artifacts/batch3-1/initial/errors.json",
  JSON.stringify(errors),
);
console.log(errors);
await browser.close();
