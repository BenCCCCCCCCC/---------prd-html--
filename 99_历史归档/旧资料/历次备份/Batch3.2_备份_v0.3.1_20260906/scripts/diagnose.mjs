import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 320, height: 740 } });
await p.goto("http://127.0.0.1:5173");
for (const scale of [1, 2]) {
  await p.addStyleTag({ content: `html{font-size:${scale * 100}%}` });
  console.log(
    "overflow",
    scale,
    await p.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 1 &&
            e.getBoundingClientRect().width > 0,
        )
        .map((e) => ({
          tag: e.tagName,
          class: e.className,
          width: e.getBoundingClientRect().width,
          right: e.getBoundingClientRect().right,
          text: e.textContent?.slice(0, 35),
        }))
        .slice(0, 30),
    ),
  );
}
await b.close();
