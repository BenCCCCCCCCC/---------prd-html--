import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { start, getState, noOverflow } from "../helpers";

test("B21 V03 categories retain cross-tab choices, theme reachable and fourth rejected", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "调整本次推荐偏好", exact: true })
    .click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await expect(
    page.getByRole("button", { name: "民谣", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "民谣", exact: true }).click();
  await page.getByRole("tab", { name: "曲风", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "情绪", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "安静", exact: true }).click();
  await page.getByRole("tab", { name: "情绪", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "主题", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "纯音乐", exact: true }).click();
  await page.getByRole("tab", { name: "场景", exact: true }).click();
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("最多选择3");
  await expect(page.locator(".selected-tags")).toContainText(
    "民谣、安静、纯音乐",
  );
  await page.getByRole("tab", { name: "曲风", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "民谣", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "完成", exact: true }).click();
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: /本次想听/ }).click();
  await expect(page.locator(".selected-tags")).toContainText("纯音乐");
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  expect((await getState(page)).session.positiveTagIds).toEqual([
    "genre_folk",
    "mood_calm",
    "theme_instrumental",
  ]);
});

test("B21 V04 keyboard Switch remains independent from scope and draft commit", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "调整本次推荐偏好", exact: true })
    .click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  const toggle = page.getByRole("switch", { name: "本次听歌不影响长期推荐" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await expect(page.getByRole("radio", { name: /^仅本次/ })).toBeChecked();
  expect((await getState(page)).protection).toBe("off");
  await page.getByRole("radio", { name: /长期偏好/ }).check();
  await expect(toggle).toBeChecked();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole("radio", { name: /长期偏好/ })).toBeChecked();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  expect((await getState(page)).protection).toBe("active");
  expect((await getState(page)).persistent.positiveTagIds).toEqual([]);
});

test("B21 V05 candidate segmented and category edits only adopt into draft", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "AI 实验 · 本地解析", exact: true })
    .click();
  await page.getByLabel("描述这次想听什么").fill("想探索一下民谣");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await page.getByRole("radio", { name: "熟悉", exact: true }).check();
  await page.getByRole("tab", { name: "主题", exact: true }).click();
  await page.getByRole("button", { name: "纯音乐", exact: true }).click();
  await expect(page.locator(".candidate-diff")).toContainText("熟悉");
  await expect(page.locator(".candidate-diff")).toContainText("纯音乐");
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "采用到草稿" }).click();
  await expect(page.getByRole("button", { name: /本次想听/ })).toContainText(
    "熟悉",
  );
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  expect((await getState(page)).session.freshness).toBe("familiar");
  expect((await getState(page)).session.positiveTagIds).toEqual([
    "genre_folk",
    "theme_instrumental",
  ]);
});

test("B21 V05 unmentioned freshness stays null and can be explicitly restored", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "AI 实验 · 本地解析", exact: true })
    .click();
  await page.getByLabel("描述这次想听什么").fill("想听民谣");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(page.locator(".candidate-diff")).toContainText(
    "未提及，保持不变",
  );
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page
    .getByRole("button", { name: "新鲜程度保持不变", exact: true })
    .click();
  await page.getByRole("button", { name: "采用到草稿" }).click();
  await expect(page.getByRole("button", { name: /本次想听/ })).toContainText(
    "平衡",
  );
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
  expect((await getState(page)).session.freshness).toBeNull();
});

for (const width of [320, 390, 768, 1440])
  test(`B21 ${width} 200% text controls usable and canvas-aligned modal`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width,
      height:
        width === 320 ? 740 : width === 768 ? 1024 : width === 1440 ? 900 : 844,
    });
    await start(page);
    await page.addStyleTag({ content: "html{font-size:200%}" });
    await page
      .getByRole("button", { name: "调整本次推荐偏好", exact: true })
      .click();
    const product = await page.getByTestId("product").boundingBox();
    const dialog = await page.getByRole("dialog").boundingBox();
    expect(dialog!.x).toBeCloseTo(product!.x, 0);
    expect(dialog!.width).toBeCloseTo(product!.width, 0);
    await page.getByRole("button", { name: /本次想听/ }).click();
    await page.getByRole("tab", { name: "主题", exact: true }).click();
    await page.getByRole("button", { name: "纯音乐", exact: true }).click();
    await page.screenshot({
      path: `artifacts/batch3-1/after/want-200percent-${width}.png`,
    });
    await page.getByRole("button", { name: "完成", exact: true }).click();
    await page.getByRole("button", { name: /影响范围/ }).click();
    await page.getByRole("switch").focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "完成", exact: true }).click();
    await page.getByRole("button", { name: "确认调整", exact: true }).click();
    expect((await getState(page)).protection).toBe("active");
    await expect(
      page.getByRole("button", { name: "撤销", exact: true }),
    ).toBeInViewport();
    await noOverflow(page);
  });

test("B21 axe category panels, selected radio and Switch", async ({ page }) => {
  await start(page);
  await page
    .getByRole("button", { name: "调整本次推荐偏好", exact: true })
    .click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page.getByRole("tab", { name: "主题", exact: true }).click();
  await page.getByRole("button", { name: "纯音乐", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("switch").check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
