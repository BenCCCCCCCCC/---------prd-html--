import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const phase = process.argv[2] ?? "after";
const base =
  phase === "before" ? "http://127.0.0.1:4174" : "http://127.0.0.1:5173";
const directory = `artifacts/batch2.1/${phase}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
  locale: "zh-CN",
});
const metrics = [];
const button = (name) => page.getByRole("button", { name, exact: true });
async function reset() {
  await page.goto(base + "/#/demo");
  await button("重置演示").click();
  await page.reload();
  await page.evaluate(() =>
    globalThis.scrollTo({
      top:
        globalThis.scrollY +
        document.querySelector(".product").getBoundingClientRect().top,
      behavior: "instant",
    }),
  );
}
async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${directory}/${name}.png` });
  metrics.push({
    name,
    rectangles: await page.evaluate(() =>
      Object.fromEntries(
        [
          ".product",
          ".record",
          ".tonearm",
          ".track-heading",
          ".adjust-entry",
          ".product .primary",
          "dialog[open]",
          ".segmented",
          ".category-tabs",
          ".switch-row",
        ].map((selector) => {
          const r = document.querySelector(selector)?.getBoundingClientRect();
          return [
            selector,
            r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
          ];
        }),
      ),
    ),
  });
}
try {
  await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
  await reset();
  await capture("player");
  await button("调整推荐").click();
  await capture("root");
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await button("民谣").click();
  await capture("want");
  await button("完成").click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await capture("impact-session-off");
  await page.getByRole("switch").check();
  await capture("impact-session-on");
  await page.getByRole("radio", { name: /长期偏好/ }).check();
  await capture("impact-longterm-on");
  await page.getByRole("switch").uncheck();
  await capture("impact-longterm-off");
  await button("关闭并放弃草稿").click();
  await reset();
  await button("更多：快捷少推").click();
  await page.getByRole("radio", { name: /少推音乐人/ }).check();
  await capture("negative");
  await button("确认调整").click();
  await page.locator(".notice").first().scrollIntoViewIfNeeded();
  await capture("toast");
  await button("撤销").click();
  await page.locator(".notice").last().scrollIntoViewIfNeeded();
  await capture("undo");
  await reset();
  await button("调整推荐").click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("switch").check();
  await button("完成").click();
  await button("确认调整").click();
  await page.getByRole("button", { name: /Product Notes/ }).click();
  await button("推进4小时").click();
  await page.evaluate(() =>
    globalThis.scrollTo({
      top:
        globalThis.scrollY +
        document.querySelector(".product").getBoundingClientRect().top,
      behavior: "instant",
    }),
  );
  await capture("reminder");
  await reset();
  await page.getByRole("button", { name: /Product Notes/ }).click();
  await page.getByLabel("下次保存场景").selectOption("refresh");
  await button("调整推荐").click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await button("民谣").click();
  await button("完成").click();
  await button("确认调整").click();
  await page.locator(".notice").first().scrollIntoViewIfNeeded();
  await capture("refresh-failed");
  for (const [input, suffix] of [
    ["想探索一下民谣", "ready"],
    ["这周少推摇滚", "clarification"],
    ["想听爵士", "unsupported"],
  ]) {
    await button("AI 实验").click();
    await page.getByLabel("描述这次想听什么").fill(input);
    await button("生成候选预览").click();
    await page.locator(".candidate").waitFor();
    await page.locator(".candidate").scrollIntoViewIfNeeded();
    await capture(`ai-${suffix}`);
    await button("关闭并放弃草稿").click();
  }
  await writeFile(
    `${directory}/geometry.json`,
    JSON.stringify(metrics, null, 2),
  );
} finally {
  await browser.close();
}
console.log(
  `Captured ${phase}: ${metrics.length} matching states, 390×844 canvas; failure/AI detail views explicitly scrolled.`,
);
