import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const dir = "artifacts/closeout/reproduction";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://127.0.0.1:5173/#/demo");
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page.getByRole("button", { name: "民谣", exact: true }).click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  const beforeCommitY = await page.evaluate(() => globalThis.scrollY);
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  await page.waitForTimeout(100);
  const afterCommitY = await page.evaluate(() => globalThis.scrollY);
  await page.screenshot({ path: `${dir}/saved.png` });
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await page.screenshot({ path: `${dir}/undone.png` });
  const receipt = await page.locator(".receipt").innerText();
  const messages = await page.locator(".notice").allTextContents();
  await writeFile(
    `${dir}/observed.json`,
    JSON.stringify(
      {
        baseline: "v0.2.2",
        beforeCommitY,
        afterCommitY,
        autoScrollDelta: afterCommitY - beforeCommitY,
        receiptAfterUndo: receipt,
        undoButtonStillAvailable: await page
          .getByRole("button", { name: "撤销", exact: true })
          .isEnabled(),
        messages,
        capture:
          "Natural navigation and button operations; no script scroll calls",
      },
      null,
      2,
    ),
  );
  console.log({ beforeCommitY, afterCommitY, receipt, messages });
} finally {
  await browser.close();
}
