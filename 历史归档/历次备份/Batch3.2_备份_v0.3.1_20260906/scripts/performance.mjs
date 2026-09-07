import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("artifacts/reports", { recursive: true });
const browser = await chromium.launch({
  args: ["--remote-debugging-port=9222"],
});
try {
  const result = await lighthouse("http://127.0.0.1:4173/", {
    port: 9222,
    onlyCategories: ["performance"],
    output: ["json", "html"],
    logLevel: "error",
    formFactor: "mobile",
  });
  if (!result) throw Error("No Lighthouse result");
  await writeFile("artifacts/reports/lighthouse.json", result.report[0]);
  await writeFile("artifacts/reports/lighthouse.html", result.report[1]);
  const { audits, categories, environment } = result.lhr;
  const summary = {
    mode: "local_lab_only",
    environment,
    score: categories.performance.score,
    lcpMs: audits["largest-contentful-paint"].numericValue,
    cls: audits["cumulative-layout-shift"].numericValue,
    totalBlockingTimeMs: audits["total-blocking-time"].numericValue,
    inp: "NOT_MEASURED: navigation lab run is not field INP",
  };
  await writeFile(
    "artifacts/reports/performance-summary.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(summary);
} finally {
  await browser.close();
}
