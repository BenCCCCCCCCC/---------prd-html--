import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const out = "artifacts/batch3-1/comparisons";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  locale: "zh-CN",
  reducedMotion: "reduce",
});
await page.clock.setFixedTime(new Date("2026-09-06T02:22:00Z"));
await page.goto("http://127.0.0.1:5173/#/demo");
await page.getByRole("checkbox", { name: "显示标注" }).uncheck();
// Reference comparison alignment only; natural submit/undo evidence is a separate unchanged test.
await page.evaluate(() =>
  globalThis.scrollTo(
    0,
    globalThis.scrollY +
      document.querySelector(".product").getBoundingClientRect().top,
  ),
);
await page.getByRole("button", { name: "播放模拟", exact: true }).click();
const results = [];
for (const [node, name] of [
  ["48-2", "player"],
  ["48-8", "root"],
  ["50-60", "want"],
  ["69-45", "impact"],
]) {
  if (name === "root")
    await page
      .getByRole("button", { name: "调整本次推荐偏好", exact: true })
      .click();
  if (name === "want") {
    await page.getByRole("button", { name: /本次想听/ }).click();
    await page.getByRole("radio", { name: "探索", exact: true }).check();
    await page.getByRole("button", { name: "民谣", exact: true }).click();
  }
  if (name === "impact") {
    await page.getByRole("button", { name: "关闭并放弃草稿" }).click();
    await page
      .getByRole("button", { name: "调整本次推荐偏好", exact: true })
      .click();
    await page.getByRole("button", { name: /影响范围/ }).click();
    await page.getByRole("radio", { name: /长期偏好/ }).check();
    await page.getByRole("switch").check();
  }
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.getByTestId("product").boundingBox();
  const current = `${out}/${name}-actual.png`;
  await page.screenshot({
    path: current,
    clip: { x: bounds.x, y: bounds.y, width: 390, height: 844 },
    animations: "disabled",
  });
  const baseReference = await sharp("finalization_input/reference/48-2.png")
    .ensureAlpha()
    .toBuffer();
  const top = { root: 400, want: 243, impact: 344 }[name];
  // Exported sheets have a flattened gray backdrop. Reconstruct only that backdrop
  // from the exact context's 42% black overlay; retain supplied sheet pixels verbatim.
  const reference =
    name === "player"
      ? baseReference
      : await sharp(baseReference)
          .composite([
            {
              input: Buffer.from(
                '<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844"><rect width="390" height="844" fill="black" fill-opacity=".42"/></svg>',
              ),
            },
            {
              input: await sharp(`finalization_input/reference/${node}.png`)
                .extract({ left: 0, top, width: 390, height: 844 - top })
                .toBuffer(),
              left: 0,
              top,
            },
          ])
          .toBuffer();
  await sharp(reference).toFile(`${out}/${name}-reference.png`);
  const a = await sharp(reference).removeAlpha().raw().toBuffer(),
    b = await sharp(current).removeAlpha().raw().toBuffer();
  const diff = Buffer.alloc(a.length),
    blend = Buffer.alloc(a.length);
  let absolute = 0,
    changed = 0;
  for (let i = 0; i < a.length; i += 3) {
    let delta = 0;
    for (let k = 0; k < 3; k++) {
      const d = Math.abs(a[i + k] - b[i + k]);
      absolute += d;
      delta = Math.max(delta, d);
      diff[i + k] = d;
      blend[i + k] = Math.round((a[i + k] + b[i + k]) / 2);
    }
    if (delta > 12) changed++;
  }
  await sharp(diff, { raw: { width: 390, height: 844, channels: 3 } })
    .png()
    .toFile(`${out}/${name}-diff.png`);
  await sharp(blend, { raw: { width: 390, height: 844, channels: 3 } })
    .png()
    .toFile(`${out}/${name}-overlay50.png`);
  await sharp({
    create: { width: 780, height: 844, channels: 3, background: "white" },
  })
    .composite([
      { input: reference, left: 0, top: 0 },
      { input: current, left: 390, top: 0 },
    ])
    .png()
    .toFile(`${out}/${name}-figma-actual.png`);
  const oldNames = {
    player: "demo-player",
    root: "sheet-root-default",
    want: "want-explore-folk",
    impact: "impact-longterm-on",
  };
  await sharp({
    create: { width: 1170, height: 844, channels: 3, background: "white" },
  })
    .composite([
      { input: reference, left: 0, top: 0 },
      {
        input: `tests/visual/screens.spec.ts-snapshots/batch3-candidate/${oldNames[name]}-390-win32.png`,
        left: 390,
        top: 0,
      },
      { input: current, left: 780, top: 0 },
    ])
    .png()
    .toFile(`${out}/${name}-figma-before-after.png`);
  const geometry = await page.evaluate(() =>
    Object.fromEntries(
      [
        ".product",
        ".record-stage",
        ".adjust-entry",
        ".track-heading",
        ".progress-line",
        ".play-controls",
        ".sheet-inner",
        ".segmented",
        ".category-tabs",
        ".radio-row",
        ".switch-row",
      ].map((sel) => {
        const r = document.querySelector(sel)?.getBoundingClientRect();
        return [
          sel,
          r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
        ];
      }),
    ),
  );
  results.push({
    node: node.replace("-", ":"),
    state: name,
    framePixels: 390 * 844,
    changedOver12: changed,
    meanAbsoluteChannelDifference: absolute / a.length,
    maskedPixels: 0,
    geometry,
    approval: "MANUAL_REVIEW_REQUIRED",
  });
}
await writeFile(
  `${out}/measurements.json`,
  JSON.stringify(
    {
      method:
        "Full 390x844 frame, no exclusion masks. Figma overlays composited on original player. Same explore/folk/long-term/protection draft choices; clock text, canonical duration and necessary expanded rules are documented differences.",
      results,
    },
    null,
    2,
  ),
);
await browser.close();
console.log(
  results.map(({ node, changedOver12, meanAbsoluteChannelDifference }) => ({
    node,
    changedOver12,
    meanAbsoluteChannelDifference,
  })),
);
