import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const dir = "artifacts/batch2.1";
await mkdir(`${dir}/comparisons`, { recursive: true });
const map = {
  player: "48-2",
  root: "48-8",
  want: "50-60",
  negative: "52-41",
  "impact-session-off": "52-63",
  "impact-session-on": "52-87",
  "impact-longterm-off": "69-20",
  "impact-longterm-on": "69-45",
  toast: "52-117",
  undo: null,
  reminder: "52-122",
  "refresh-failed": null,
  "ai-ready": null,
  "ai-clarification": null,
  "ai-unsupported": null,
};
const label = (text, width = 390, height = 42) =>
  Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fafafc"/><text x="14" y="27" font-family="Arial" font-size="15" fill="#17171b">${text}</text></svg>`,
  );
for (const [state, node] of Object.entries(map)) {
  const layers = [];
  if (node)
    layers.push({
      input: await sharp(`${dir}/figma/${node}.png`).toBuffer(),
      left: 16,
      top: 58,
    });
  else
    layers.push({
      input: label("PRD-added state. No original Figma frame.", 390, 844),
      left: 16,
      top: 58,
    });
  layers.push({
    input: label(
      node
        ? state === "reminder"
          ? "Figma 52:122 / status precedent only"
          : `Figma ${node.replace("-", ":")} / local reference`
        : "Approved PRD state",
      390,
    ),
    left: 16,
    top: 16,
  });
  for (const [i, phase] of ["before", "after"].entries()) {
    const left = 422 + i * 406;
    layers.push({
      input: label(
        phase === "before"
          ? "Batch 2 / v0.2.1"
          : "Batch 2.1 / candidate - owner review pending",
      ),
      left,
      top: 16,
    });
    layers.push({
      input: await sharp(`${dir}/${phase}/${state}.png`).toBuffer(),
      left,
      top: 58,
    });
  }
  await sharp({
    create: { width: 1234, height: 918, channels: 3, background: "#e6e6ea" },
  })
    .composite(layers)
    .png()
    .toFile(`${dir}/comparisons/${state}.png`);
}
const before = JSON.parse(
  await readFile(`${dir}/before/geometry.json`, "utf8"),
);
const after = JSON.parse(await readFile(`${dir}/after/geometry.json`, "utf8"));
await writeFile(
  `${dir}/geometry-comparison.json`,
  JSON.stringify(
    {
      referenceViewport: "390x844",
      note: "Product origin y=0 for player/root/want/impact/negative; toast/undo/failure/AI are scrolled detail views. Reminder reference is a status precedent, not an exact frame. Product continues below viewport for approved added states.",
      before,
      after,
    },
    null,
    2,
  ),
);
console.log(
  `Created ${Object.keys(map).length} Figma / before / candidate comparisons.`,
);
