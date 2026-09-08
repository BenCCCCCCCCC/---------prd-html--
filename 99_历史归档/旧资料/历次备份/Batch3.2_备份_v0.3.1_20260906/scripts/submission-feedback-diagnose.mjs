import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const trace = [];
const measure = async (name) =>
  trace.push(
    await page.evaluate(
      (name) => ({
        name,
        y: globalThis.scrollY,
        focus: document.activeElement?.outerHTML.slice(0, 150),
        elements: Object.fromEntries(
          [
            ".product",
            ".adjust-entry",
            ".product-notes",
            ".sheet",
            ".sheet-inner",
            ".modal-annotations",
            ".product-feedback",
            ".feedback-copy",
          ].map((sel) => {
            const e = document.querySelector(sel),
              r = e?.getBoundingClientRect();
            return [
              sel,
              r
                ? {
                    y: r.y,
                    h: r.height,
                    scroll: e.scrollHeight,
                    client: e.clientHeight,
                  }
                : null,
            ];
          }),
        ),
      }),
      name,
    ),
  );
await page.goto("http://127.0.0.1:5173/#/demo");
await measure("open");
await page.getByRole("button", { name: /测试工具/ }).click();
await measure("tools");
await page.getByLabel("下次保存场景").selectOption("refresh");
await measure("failure");
await page
  .getByRole("button", { name: "调整本次推荐偏好", exact: true })
  .click();
await measure("root");
await page.getByRole("button", { name: /本次想听/ }).click();
await measure("want");
await page.getByRole("radio", { name: "探索", exact: true }).check();
await page.getByRole("button", { name: "民谣", exact: true }).click();
await page.getByRole("button", { name: "完成", exact: true }).click();
await measure("complete");
await page.getByRole("button", { name: "确认调整", exact: true }).click();
await measure("commit");
await writeFile(
  "artifacts/batch3-1/feedback-diagnosis.json",
  JSON.stringify(trace, null, 2),
);
console.log(trace);
await browser.close();
