import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  start,
  want,
  commit,
  enableProtection,
  getState,
  notes,
  noOverflow,
  key,
} from "../helpers";
test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => {
    throw error;
  });
});
test("AC01 AC02 AC03 initial draft / return / cancel / focus return", async ({
  page,
}) => {
  await start(page);
  const trigger = page.getByRole("button", { name: "调整推荐", exact: true });
  await trigger.click();
  await expect(page.getByRole("button", { name: "确认调整" })).toBeDisabled();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /本次想听/ })).toContainText(
    "探索",
  );
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("button", { name: /本次想听/ })).toContainText(
    "平衡",
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
test("AC04 4th tag blocked without replacing selection", async ({ page }) => {
  await start(page);
  await want(page);
  await page.getByRole("button", { name: "流行", exact: true }).click();
  await page.getByRole("button", { name: "摇滚", exact: true }).click();
  await page.getByRole("button", { name: "古典", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("最多选择3");
  await expect(page.locator(".tag-grid button[aria-pressed=true]")).toHaveCount(
    3,
  );
});
test("AC05 Demo 1 exploration changes queue and undo", async ({ page }) => {
  await start(page);
  const before = (await getState(page)).queue;
  await want(page);
  await commit(page);
  let s = await getState(page);
  expect(s.session.positiveTagIds).toEqual(["genre_folk"]);
  expect(s.persistent.positiveTagIds).toEqual([]);
  expect(s.queue).not.toEqual(before);
  expect(s.trackId).toBe("T01");
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  s = await getState(page);
  expect(s.session.positiveTagIds).toBeNull();
  expect(s.queue).toEqual(before);
});
test("AC06 promote requires explicit diff confirmation and management", async ({
  page,
}) => {
  await start(page);
  await want(page);
  await commit(page);
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("radio", { name: /长期偏好/ }).check();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await expect(page.getByRole("button", { name: "确认调整" })).toBeDisabled();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("checkbox", { name: "保存当前差异到长期" }).check();
  await commit(page);
  await expect(
    page.getByRole("heading", { name: "确认长期保存差异" }),
  ).toBeVisible();
  expect((await getState(page)).persistent.positiveTagIds).toEqual([]);
  await page.getByRole("button", { name: "确认长期保存", exact: true }).click();
  expect((await getState(page)).persistent.positiveTagIds).toEqual([
    "genre_folk",
  ]);
  expect((await getState(page)).session.positiveTagIds).toBeNull();
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: "已保存偏好 →" }).click();
  await page.getByRole("button", { name: "移除民谣", exact: true }).click();
  await page.getByRole("button", { name: "确认移除", exact: true }).click();
  expect((await getState(page)).persistent.positiveTagIds).toEqual([]);
});
test("AC08 conflicting tag prompts explicit resolution", async ({ page }) => {
  await start(page);
  await want(page);
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: /不想听/ }).click();
  await page.getByRole("radio", { name: /少推风格/ }).check();
  await commit(page);
  await expect(page.getByRole("alert")).toContainText("同一标签");
  expect((await getState(page)).revision).toBe(0);
});
test("AC11 Demo 2 direct negative artist and undo", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "Demo 2", exact: true }).click();
  await page.getByRole("button", { name: "更多：快捷少推" }).click();
  await page.getByRole("radio", { name: /少推音乐人/ }).check();
  await page.getByRole("button", { name: "确认调整" }).click();
  expect((await getState(page)).session.negativeTargets).toEqual([
    { kind: "artist", id: "A01" },
  ]);
  await expect(page.getByRole("status")).toContainText("仍可能出现");
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  expect((await getState(page)).session.negativeTargets).toEqual([]);
});
test("AC14 AC15 AC16 AC17 Demo 3 playlist isolation and reminder", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "Demo 3", exact: true }).click();
  await enableProtection(page);
  await page.getByLabel("新建受控播放来源").selectOption("playlist");
  expect((await getState(page)).source).toBe("playlist");
  await notes(page);
  await page.getByRole("button", { name: "推进4小时", exact: true }).click();
  expect((await getState(page)).protection).toBe("review_required");
  await expect(page.locator(".protection-bar")).toContainText(
    "当前仍不用于长期推荐",
  );
  await expect(page.locator(".mini-player")).toContainText("保护持续");
  await page.getByRole("button", { name: "继续4小时", exact: true }).click();
  expect((await getState(page)).protection).toBe("active");
  await page.getByRole("button", { name: "推进4小时", exact: true }).click();
  await page.getByRole("button", { name: "关闭临时收听", exact: true }).click();
  const s = await getState(page);
  expect(s.protection).toBe("off");
  expect(
    s.logs
      .filter((e: { name: string }) => e.name === "playback_segment")
      .every((e: { longTermEligible: boolean }) => !e.longTermEligible),
  ).toBe(true);
});
test("AC19 save failure retry and refresh failure keeps protection", async ({
  page,
}) => {
  await start(page);
  await notes(page);
  await page.getByLabel("下次保存场景").selectOption("save");
  await want(page);
  await commit(page);
  await expect(page.getByRole("alert")).toContainText("保存失败");
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByLabel("下次保存场景").selectOption("refresh");
  await enableProtection(page);
  await expect(
    page.getByRole("status").filter({ hasText: "设置已保存，推荐尚未刷新。" }),
  ).toBeVisible();
  expect((await getState(page)).protection).toBe("active");
  await page.getByRole("button", { name: "重试刷新" }).click();
  expect((await getState(page)).refreshStatus).toBe("ready");
});
test("AC20 stale response discarded; version conflict retains draft", async ({
  page,
}) => {
  await start(page);
  await want(page);
  await commit(page);
  await notes(page);
  const q = (await getState(page)).queue;
  await page.getByRole("button", { name: "旧响应晚到" }).click();
  expect((await getState(page)).queue).toEqual(q);
  await page.getByRole("button", { name: "打开并模拟版本冲突" }).click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "熟悉", exact: true }).check();
  await commit(page);
  await expect(page.getByRole("alert")).toContainText("版本冲突");
  await page.getByRole("button", { name: "核对当前版本并保留草稿" }).click();
  await page.getByRole("button", { name: "确认调整" }).click();
  expect((await getState(page)).session.freshness).toBe("familiar");
});
test("AC21 undo conflict does not overwrite newer state", async ({ page }) => {
  await start(page);
  await want(page);
  await commit(page);
  await notes(page);
  await page.getByRole("button", { name: "模拟撤销冲突" }).click();
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(
    page.getByText("设置已有新的修改，请查看当前状态后调整。", { exact: true }),
  ).toBeVisible();
  expect((await getState(page)).session.freshness).toBe("explore");
});
test("AC23 empty result conservative fallback", async ({ page }) => {
  await start(page);
  await notes(page);
  await page.getByRole("button", { name: "模拟结果为空" }).click();
  await page.getByRole("button", { name: /推荐队列/ }).click();
  await expect(
    page.getByRole("heading", { name: "当前没有可用结果" }),
  ).toBeVisible();
  expect((await getState(page)).trackId).toBe("T01");
  await page.getByRole("button", { name: "恢复正常候选池" }).click();
  expect((await getState(page)).queue.length).toBe(8);
});
test("AC24 AI ready editable draft requires final confirmation", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  await page.getByLabel("描述这次想听什么").fill("以后都想多听民谣");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(
    page.getByRole("heading", { name: "已识别 · 请核对候选" }),
  ).toBeVisible();
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "采用到草稿" }).click();
  await expect(page.getByRole("button", { name: /影响范围/ })).toContainText(
    "仅本次",
  );
  expect((await getState(page)).revision).toBe(0);
  await page.getByRole("button", { name: "确认调整" }).click();
  expect((await getState(page)).session.positiveTagIds).toEqual(["genre_folk"]);
  expect((await getState(page)).persistent.positiveTagIds).toEqual([]);
});
for (const [input, status] of [
  ["这周少推摇滚", "需要确认"],
  ["删除我的全部播放历史", "暂不支持"],
])
  test("AC25 AI " + status, async ({ page }) => {
    await start(page);
    await page.getByRole("button", { name: "AI 实验", exact: true }).click();
    await page.getByLabel("描述这次想听什么").fill(input);
    await page.getByRole("button", { name: "生成候选预览" }).click();
    await expect(
      page.getByRole("heading", { name: status, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "采用到草稿" }),
    ).toBeDisabled();
    expect((await getState(page)).revision).toBe(0);
  });
test("AC26 cancel parse leaves no candidate", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  await page.getByLabel("描述这次想听什么").fill("想听民谣");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await page.getByRole("button", { name: "取消解析", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已取消解析");
  await expect(page.getByRole("button", { name: "采用到草稿" })).toBeDisabled();
});
test("AC27 reload restores synthetic state; raw text absent; reset is namespaced; no outbound request", async ({
  page,
}) => {
  const outside: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:5173")) outside.push(r.url());
  });
  await start(page);
  await want(page);
  await commit(page);
  await page.evaluate(() => sessionStorage.setItem("unrelated", "retain"));
  await page.getByRole("button", { name: "AI 实验", exact: true }).click();
  await page.getByLabel("描述这次想听什么").fill("不要写进存储的原文");
  await page.getByRole("button", { name: "生成候选预览" }).click();
  await expect(
    page.getByRole("heading", { name: "暂不支持", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate((k) => sessionStorage.getItem(k), key),
  ).not.toContain("不要写进存储的原文");
  await page.reload();
  expect((await getState(page)).session.positiveTagIds).toEqual(["genre_folk"]);
  await page.getByRole("button", { name: "重置演示", exact: true }).click();
  expect((await getState(page)).revision).toBe(0);
  expect(await page.evaluate(() => sessionStorage.getItem("unrelated"))).toBe(
    "retain",
  );
  expect(outside).toEqual([]);
});
test("AC28 keyboard modal traps focus at 320px and 200% text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await start(page);
  await page.addStyleTag({ content: "html{font-size:200%}" });
  const trigger = page.getByRole("button", { name: "调整推荐", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document.querySelector("dialog")?.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector("dialog")?.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});
test("AC29 honest first screen and actual simulated playback", async ({
  page,
}) => {
  await start(page);
  await expect(page.getByText("交互模拟 · 不播放声音")).toBeVisible();
  await page.getByRole("button", { name: "播放模拟", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "暂停模拟", exact: true }),
  ).toBeVisible();
  expect(await page.locator("audio,video").count()).toBe(0);
});
test("AC30 disabling AI does not break three manual tasks", async ({
  page,
}) => {
  await start(page);
  await notes(page);
  await page.getByRole("checkbox", { name: "启用 R07 本地实验" }).uncheck();
  await expect(
    page.getByRole("button", { name: "AI 实验", exact: true }),
  ).toHaveCount(0);
  await want(page);
  await commit(page);
  await page.getByRole("button", { name: "更多：快捷少推" }).click();
  await page.getByRole("radio", { name: /少推音乐人/ }).check();
  await page.getByRole("button", { name: "确认调整" }).click();
  await enableProtection(page);
  expect((await getState(page)).protection).toBe("active");
});
test("AC31 AC32 AC33 AC34 decisions JSON renders quick/deep labels and stacked alternatives", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#/overview");
  const quick = page.getByTestId("quick-decisions");
  await expect(quick.locator("[data-decision-id]")).toHaveCount(3);
  for (const id of ["T02", "T04", "T07"])
    await expect(quick.locator(`[data-decision-id="${id}"]`)).toBeVisible();
  const deep = page.getByTestId("deep-decisions");
  await expect(deep.locator(":scope > details")).toHaveCount(8);
  for (const d of await deep.locator(":scope > details").all()) {
    await d.locator(":scope > summary").click();
    await d.locator("article details summary").click();
    await expect(d.locator(".validation")).toBeVisible();
  }
  await expect(page.getByText("延后 · 方案 C").last()).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "A/B 对照实验：先过健康 Gate，再看效果",
    }),
  ).toBeVisible();
  await noOverflow(page);
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await noOverflow(page);
});
test("axe pages and core sheets", async ({ page }) => {
  await page.goto("/#/overview");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await start(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await want(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "完成", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /影响范围/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
