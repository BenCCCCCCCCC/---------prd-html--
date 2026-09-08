import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
await mkdir("public/documents", { recursive: true });
await mkdir("src/assets/player", { recursive: true });
await copyFile(
  "finalization_input/content/PRD_v0.6_提交候选.md",
  "docs/PRD_v0.6.md",
);
await copyFile("finalization_input/content/SOURCES.md", "docs/SOURCES_v0.6.md");
await copyFile(
  "finalization_input/content/网易云音乐_PRD_v0.6_提交候选.docx",
  "public/documents/PRD_v0.6_提交候选.docx",
);
const raw = await readFile("artifacts/batch3-1/figma/raw-player.png");
const base = await sharp(raw).resize(390, 844).png().toBuffer();
const out = "src/assets/player/";
// Exact supplied image slices. Dynamic text and tested controls are rendered separately.
const slices = {
  status: [0, 0, 390, 44],
  stage: [0, 96, 390, 424],
  cover: [94, 250, 204, 204],
  back: [20, 54, 24, 28],
  refresh: [344, 53, 29, 30],
  count: [20, 532, 54, 25],
  heart: [264, 576, 47, 32],
  comment: [337, 576, 32, 32],
  loop: [25, 708, 28, 28],
  previous: [104, 708, 24, 28],
  pause: [178, 704, 32, 38],
  next: [263, 708, 26, 28],
  queue: [339, 708, 27, 29],
  device: [24, 779, 25, 29],
  bulb: [131, 779, 25, 29],
  info: [237, 779, 24, 29],
  more: [340, 779, 31, 29],
};
for (const [name, [left, top, width, height]] of Object.entries(slices))
  await sharp(base)
    .extract({ left, top, width, height })
    .png()
    .toFile(out + name + ".png");
await sharp(base)
  .extract({ left: 0, top: 0, width: 1, height: 844 })
  .resize(390, 844, { fit: "fill" })
  .png()
  .toFile(out + "background.png");
// Alternative fictional tracks use a different crop of the same authorized reference artwork.
await sharp(out + "cover.png")
  .extract({ left: 35, top: 15, width: 145, height: 145 })
  .resize(204, 204)
  .png()
  .toFile(out + "cover-detail.png");
await writeFile(
  "artifacts/batch3-1/figma/asset-provenance.json",
  JSON.stringify(
    {
      fileKey: "ZbKyQeHug7rM5P88GBSmlY",
      node: "48:2",
      fillNode: "48:3",
      source:
        "live download_assets rawImages; downloaded successfully this run",
      rawSha256: createHash("sha256").update(raw).digest("hex"),
      sourceDimensions: await sharp(raw).metadata(),
      workingSize: [390, 844],
      slices,
      background:
        "leftmost image column stretched horizontally; original vertical luminance preserved",
      scope:
        "local reference reproduction only; no audio or account integration; publication rights not approved",
    },
    null,
    2,
  ),
);
const coverVariants = {};
for (let n = 1; n <= 6; n++) {
  const side = 128 + n * 7,
    left = (204 - side) / 2,
    top = n * 3;
  const crop = { left: Math.floor(left), top, width: side, height: side };
  await sharp(out + "cover.png")
    .extract(crop)
    .resize(204, 204)
    .png()
    .toFile(out + `cover-${n}.png`);
  coverVariants[`geometric-${n}`] = { asset: `cover-${n}.png`, crop };
}
await writeFile(
  "artifacts/batch3-1/figma/cover-mapping.json",
  JSON.stringify(
    {
      source:
        "same authorized artwork; original catalog cover IDs retained, no original geometric drawings reused",
      referenceTrack: "T01 uses uncropped cover.png",
      variants: coverVariants,
    },
    null,
    2,
  ),
);
console.log(
  "Exact v0.6 source and DOCX copied; original player slices extracted.",
);
