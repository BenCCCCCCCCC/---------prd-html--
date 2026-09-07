import { createRequire } from "node:module";
import { readdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
for (const w of [320, 390, 768, 1440]) {
  const names = (await readdir("artifacts/screenshots")).filter(
    (n) =>
      n.endsWith("-" + w + ".png") &&
      !/^(round1|case-demo|review-contact)/.test(n),
  );
  const layers = [];
  for (let i = 0; i < names.length; i++) {
    layers.push({
      input: await sharp("artifacts/screenshots/" + names[i])
        .resize(300, 370, { fit: "inside" })
        .png()
        .toBuffer(),
      left: (i % 4) * 300,
      top: Math.floor(i / 4) * 400 + 30,
    });
    layers.push({
      input: Buffer.from(
        `<svg width="300" height="30"><rect width="300" height="30" fill="white"/><text x="4" y="20" font-size="12">${names[i]}</text></svg>`,
      ),
      left: (i % 4) * 300,
      top: Math.floor(i / 4) * 400,
    });
  }
  await sharp({
    create: {
      width: 1200,
      height: Math.ceil(names.length / 4) * 400,
      channels: 3,
      background: "#dedede",
    },
  })
    .composite(layers)
    .png()
    .toFile(`artifacts/screenshots/review-contact-${w}.png`);
}
