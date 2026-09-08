import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
const dir = "artifacts/batch3/print";
const pages = (await readdir(dir))
  .filter((n) => /^page-\d+\.png$/.test(n))
  .sort();
const tiles = [];
for (const [i, page] of pages.entries())
  tiles.push({
    input: await sharp(`${dir}/${page}`)
      .resize(240, 340, { fit: "contain", background: "white" })
      .png()
      .toBuffer(),
    left: (i % 4) * 250,
    top: Math.floor(i / 4) * 360,
  });
await sharp({
  create: {
    width: 1000,
    height: Math.ceil(pages.length / 4) * 360,
    channels: 3,
    background: "#dddddd",
  },
})
  .composite(tiles)
  .png()
  .toFile(`${dir}/contact.png`);
await mkdir("artifacts/batch3/comparisons", { recursive: true });
console.log(`Rendered ${pages.length} print pages into contact sheet.`);
const shots = "tests/visual/screens.spec.ts-snapshots/batch3-candidate";
for (const width of [320,390,768,1440]) {
  const names = (await readdir(shots)).filter(n=>n.endsWith(`-${width}-win32.png`)).sort();
  for (let group=0;group<2;group++) {
    const composition = [];
    for (const [i,name] of names.slice(group*9,group*9+9).entries()) {
      composition.push({input:await sharp(`${shots}/${name}`).resize(270,580,{fit:"contain",background:"white"}).png().toBuffer(),left:(i%3)*280,top:Math.floor(i/3)*610+25});
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="270" height="25"><text x="4" y="18" font-family="sans-serif" font-size="11">${name.replace("-win32.png","")}</text></svg>`);
      composition.push({input:label,left:(i%3)*280,top:Math.floor(i/3)*610});
    }
    await sharp({create:{width:840,height:1830,channels:3,background:"#eeeeee"}}).composite(composition).png().toFile(`artifacts/batch3/comparisons/review-${width}-${group+1}.png`);
  }
}
