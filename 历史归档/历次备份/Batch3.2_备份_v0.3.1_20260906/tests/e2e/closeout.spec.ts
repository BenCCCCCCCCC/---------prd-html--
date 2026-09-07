import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { getState, notes, want, commit } from "../helpers";
const sizes = [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
] as const;
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
async function naturalStart(page: Page, scale = 100) {
  await page.goto("/#/demo");
  if (scale === 200)
    await page.addStyleTag({ content: "html{font-size:200%}" });
}
async function visibleFeedback(page: Page) {
  const panel = page.getByRole("region", { name: "本轮调整结果" });
  await expect(panel).toBeInViewport({ ratio: 1 });
  for (const control of await panel.getByRole("button").all()) {
    const target = await control.boundingBox();
    expect(target!.width).toBeGreaterThanOrEqual(44);
    expect(target!.height).toBeGreaterThanOrEqual(44);
  }
  const bounds = await panel.boundingBox();
  const overlaps = await page.getByTestId("product").evaluate((product, r) => {
    return Array.from(product.querySelectorAll("button,a,summary"))
      .filter((n) => !n.closest(".product-feedback"))
      .filter((n) => {
        const b = n.getBoundingClientRect();
        return (
          b.width &&
          b.height &&
          b.left < r!.x + r!.width &&
          b.right > r!.x &&
          b.top < r!.y + r!.height &&
          b.bottom > r!.y
        );
      })
      .map((n) => n.textContent);
  }, bounds);
  expect(overlaps).toEqual([]);
  return panel;
}
for (const [width, height] of sizes)
  for (const scale of [100, 200]) {
    test(`closeout natural save undo ${width} ${scale}% no scroll or covered controls`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await naturalStart(page, scale);
      const dir = `artifacts/batch3-1/regression-closeout/natural/${width}-${scale}`;
      await mkdir(dir, { recursive: true });
      await page.screenshot({ path: `${dir}/opened.png` });
      await want(page);
      await button(page, "完成").click();
      await page.screenshot({ path: `${dir}/editing.png` });
      const y = await page.evaluate(() => scrollY);
      await button(page, "确认调整").click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(y);
      const afterCommitY = await page.evaluate(() => scrollY);
      const feedback = await visibleFeedback(page);
      await expect(button(page, "撤销")).toBeInViewport({ ratio: 1 });
      await expect(feedback).not.toContainText(/revision|operationId/);
      await page.screenshot({ path: `${dir}/saved.png` });
      const op = (await getState(page)).operations.at(-1).operationId;
      await button(page, "撤销").click();
      await expect(feedback).toContainText("已撤销本轮调整");
      await expect(feedback).not.toContainText("已保存");
      await expect(button(page, "撤销")).toHaveCount(0);
      await visibleFeedback(page);
      const state = await getState(page);
      expect(state.session.positiveTagIds).toBeNull();
      const undone = state.logs.filter(
        (e: { name: string }) => e.name === "adjustment_undone",
      );
      expect(undone).toHaveLength(1);
      expect(undone[0].targetOperationId).toBe(op);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(y);
      await page.screenshot({ path: `${dir}/undone.png` });
      await writeFile(
        `${dir}/evidence.json`,
        JSON.stringify(
          {
            width,
            height,
            scale,
            beforeCommitY: y,
            afterCommitY,
            afterUndoY: await page.evaluate(() => scrollY),
            operationId: op,
            revision: state.revision,
            capture:
              "Natural page opening and actions; no screenshot scroll calls",
          },
          null,
          2,
        ),
      );
    });
  }

test("closeout toast expiry preserves persistent undo, success cannot be repeated", async ({
  page,
}) => {
  await page.clock.install();
  await naturalStart(page);
  await want(page);
  await commit(page);
  await page.clock.fastForward(10001);
  await expect(page.locator(".product-feedback")).toHaveCount(0);
  await page.getByText("当前调整与恢复", { exact: true }).click();
  await expect(button(page, "撤销上次调整")).toBeEnabled();
  await button(page, "撤销上次调整").click();
  expect((await getState(page)).session.positiveTagIds).toBeNull();
  await expect(button(page, "撤销上次调整")).toBeDisabled();
  await expect(page.locator(".product-feedback")).toContainText(
    "已撤销本轮调整",
  );
});

test("closeout undo replaces receipt without restarting original ten-second deadline", async ({
  page,
}) => {
  await page.clock.install();
  await naturalStart(page);
  await want(page);
  await commit(page);
  await page.clock.fastForward(9000);
  await button(page, "撤销").click();
  await expect(page.locator(".receipt")).toContainText("已撤销");
  await page.clock.fastForward(1001);
  await expect(page.locator(".product-feedback")).toHaveCount(0);
});

test("closeout old receipt targets its own operation after unrelated management transaction", async ({
  page,
}) => {
  await naturalStart(page);
  await button(page, "调整本次推荐偏好").click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await button(page, "民谣").click();
  await commit(page);
  const a = (await getState(page)).operations.at(-1).operationId;
  await button(page, "调整本次推荐偏好").click();
  await button(page, "已保存偏好 →").click();
  await button(page, "恢复平衡").click();
  await button(page, "确认移除").click();
  const b = (await getState(page)).operations.at(-1).operationId;
  expect(a).not.toBe(b);
  await button(page, "关闭并放弃草稿").click();
  await button(page, "撤销").click();
  const s = await getState(page);
  expect(s.session.positiveTagIds).toBeNull();
  const events = s.logs.filter((e: Record<string, unknown>) =>
    JSON.stringify(e).includes("adjustment_undone"),
  );
  expect(JSON.stringify(events.at(-1))).toContain(a);
  expect(JSON.stringify(events.at(-1))).not.toContain(b);
});

test("closeout conflict and session expiry never report undo success", async ({
  page,
}) => {
  await naturalStart(page);
  await want(page);
  await commit(page);
  await notes(page);
  await button(page, "模拟撤销冲突").click();
  await button(page, "撤销").click();
  await expect(page.locator(".product-feedback")).toContainText(
    "设置已有新的修改",
  );
  await expect(page.locator(".product-feedback")).not.toContainText(
    /已撤销|已保存/,
  );
  expect((await getState(page)).session.freshness).toBe("explore");
  await button(page, "重置演示").click();
  await want(page);
  await commit(page);
  await button(page, "推进4小时").click();
  await button(page, "撤销").click();
  await expect(page.locator(".product-feedback")).not.toContainText("已撤销");
  expect((await getState(page)).sessionStarted).toBeNull();
});

for (const [width, height] of sizes)
  for (const scale of [100, 200])
    for (const protection of ["off", "active", "review_required"])
      test(`closeout refresh failure truthful protection ${protection} ${width} ${scale}%`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await naturalStart(page, scale);
        await notes(page);
        await page.getByLabel("下次保存场景").selectOption("refresh");
        if (protection !== "off") {
          await button(page, "调整本次推荐偏好").click();
          await page.getByRole("button", { name: /影响范围/ }).click();
          await page.getByRole("switch").check();
          await commit(page);
          if (protection === "review_required") {
            await button(page, "推进4小时").click();
            await want(page);
            await commit(page);
          }
        } else {
          await want(page);
          await commit(page);
        }
        const panel = await visibleFeedback(page);
        await expect(panel).toContainText("设置已保存，推荐尚未刷新");
        await expect(panel).toContainText(
          protection === "off"
            ? "临时收听未开启"
            : protection === "active"
              ? "临时收听中"
              : "已到提醒时间",
        );
        await expect(panel).not.toContainText(/revision|operationId/);
        const copySize = await panel
          .locator(".feedback-copy")
          .evaluate((el) => ({
            visible: el.clientHeight,
            content: el.scrollHeight,
          }));
        expect(copySize.content).toBeLessThanOrEqual(copySize.visible + 1);
        expect((await getState(page)).protection).toBe(protection);
        await mkdir("artifacts/batch3-1/regression-closeout/protection", {
          recursive: true,
        });
        await page.screenshot({
          path: `artifacts/batch3-1/regression-closeout/protection/${protection}-${width}-${scale}.png`,
        });
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
      });

async function tabTo(page: Page, target: Locator) {
  for (let n = 0; n < 90; n++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw Error("Keyboard target unreachable");
}
for (const [width, height] of sizes)
  test(`closeout keyboard quick undo ${width} 200%`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await naturalStart(page, 200);
    await tabTo(page, button(page, "更多：快捷少推"));
    await page.keyboard.press("Enter");
    await tabTo(page, page.getByRole("radio", { name: /少推歌曲/ }));
    await page.keyboard.press("Space");
    await tabTo(page, button(page, "确认调整"));
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(y);
    await visibleFeedback(page);
    await tabTo(page, button(page, "撤销"));
    await page.keyboard.press("Enter");
    await expect(page.locator(".product-feedback")).toContainText("已撤销");
    await mkdir("artifacts/batch3-1/regression-closeout/keyboard", {
      recursive: true,
    });
    await page.screenshot({
      path: `artifacts/batch3-1/regression-closeout/keyboard/${width}.png`,
    });
  });

test("closeout AI equal values and null have distinct honest copy", async ({
  page,
}) => {
  await naturalStart(page);
  await want(page);
  await commit(page);
  await button(page, "AI 实验 · 本地解析").click();
  await page.getByLabel("描述这次想听什么").fill("想听民谣");
  await button(page, "生成候选预览").click();
  await expect(page.locator(".candidate-diff")).toContainText(
    "未提及，保持不变",
  );
  await expect(page.locator(".candidate-diff")).toContainText("与当前设置一致");
  const revision = (await getState(page)).revision;
  await button(page, "采用到草稿").click();
  expect((await getState(page)).revision).toBe(revision);
});
