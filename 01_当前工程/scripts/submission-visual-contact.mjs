import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
const dir = "artifacts/batch3-1/regression-screenshots";
const output = "artifacts/batch3-1/visual-review";
await mkdir(output, { recursive: true });
for (const size of [320, 390, 768, 1440]) {
  const files = (await readdir(dir)).filter((n) => n.endsWith(`-${size}.png`) && !n.startsWith("case-demo"));
  const cells = [];
  for (let i = 0; i < files.length; i++) {
    const x = (i % 4) * 280, y = Math.floor(i / 4) * 370;
    cells.push({ input: await sharp(`${dir}/${files[i]}`).resize(264, 330, { fit: "contain", background: "white" }).png().toBuffer(), left: x + 8, top: y + 24 });
    cells.push({ input: Buffer.from(`<svg width="280" height="24"><text x="5" y="17" font-family="sans-serif" font-size="11">${files[i]}</text></svg>`), left: x, top: y });
  }
  await sharp({ create: { width: 1120, height: Math.ceil(files.length / 4) * 370, channels: 3, background: "#ddd" } }).composite(cells).png().toFile(`${output}/states-${size}.png`);
}
