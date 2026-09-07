import sharp from "sharp";
import { readdir } from "node:fs/promises";
const dir = process.argv[2] ?? "artifacts/batch3-1/print/pages";
const files = (await readdir(dir)).filter((n) => n.endsWith(".png")).sort();
const cells = [];
for (let i = 0; i < files.length; i++)
  cells.push({
    input: await sharp(`${dir}/${files[i]}`)
      .resize(210, 297, { fit: "contain", background: "white" })
      .png()
      .toBuffer(),
    left: (i % 4) * 224 + 7,
    top: Math.floor(i / 4) * 315 + 10,
  });
await sharp({
  create: {
    width: 896,
    height: Math.ceil(files.length / 4) * 315,
    channels: 3,
    background: "#d6d6d6",
  },
})
  .composite(cells)
  .png()
  .toFile(process.argv[3] ?? "artifacts/batch3-1/print/contact.png");
console.log(`Rendered ${files.length} PDF pages into contact sheet.`);
