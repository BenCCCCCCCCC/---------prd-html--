import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const out = "artifacts/batch3/comparisons";
await mkdir(out, { recursive: true });
const snapshots = "tests/visual/screens.spec.ts-snapshots";
const results = [];
for (const [node, name] of [
  ["48-2", "demo-player"],
  ["48-8", "sheet-root-default"],
  ["50-60", "want-explore-folk"],
  ["69-45", "impact-longterm-on"],
]) {
  const old = `${snapshots}/closeout-candidate/${name}-390-win32.png`;
  const current = `${snapshots}/batch3-candidate/${name}-390-win32.png`;
  const a = await sharp(old).ensureAlpha().raw().toBuffer();
  const b = await sharp(current).ensureAlpha().raw().toBuffer();
  let changed = 0;
  for (let i = 0; i < a.length; i += 4)
    if (a.subarray(i, i + 4).some((c, j) => c !== b[i + j])) changed++;
  results.push({
    node: node.replace("-", ":"),
    state: name,
    changedPixels: changed,
    totalPixels: 390 * 844,
    comparison:
      "Exact pixel comparison at 390x844; differences are evidence, not owner approval",
  });
  const title = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1170" height="48"><rect width="1170" height="48" fill="white"/><g font-family="sans-serif" font-size="18" fill="#17171B"><text x="16" y="30">Figma ${node.replace("-", ":")} / live read</text><text x="406" y="30">v0.2.3 / approved Beta</text><text x="796" y="30">v0.3.0 / candidate</text></g></svg>`,
  );
  await sharp({
    create: { width: 1170, height: 892, channels: 3, background: "white" },
  })
    .composite([
      { input: title, left: 0, top: 0 },
      { input: `artifacts/batch3/figma/${node}.png`, left: 0, top: 48 },
      { input: old, left: 390, top: 48 },
      { input: current, left: 780, top: 48 },
    ])
    .png()
    .toFile(`${out}/${name}-figma-before-after.png`);
}
await writeFile(
  `${out}/pixel-comparison.json`,
  JSON.stringify(results, null, 2),
);
console.log(results);
