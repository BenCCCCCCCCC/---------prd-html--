import { expect, type Page } from "@playwright/test";
export const key = "netease-control-demo:v0.5";
export async function start(page: Page) {
  await page.clock.setFixedTime(new Date("2026-09-05T10:00:00Z"));
  await page.goto("/#/demo");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(
    page.getByRole("button", { name: "调整推荐", exact: true }),
  ).toBeVisible();
}
export async function want(page: Page) {
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: /本次想听/ }).click();
  await page.getByRole("radio", { name: "探索", exact: true }).check();
  await page.getByRole("button", { name: "民谣", exact: true }).click();
}
export async function commit(page: Page) {
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "确认调整", exact: true }).click();
}
export async function enableProtection(page: Page) {
  await page.getByRole("button", { name: "调整推荐", exact: true }).click();
  await page.getByRole("button", { name: /影响范围/ }).click();
  await page.getByRole("switch").check();
  await commit(page);
}
export async function getState(page: Page) {
  return page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), key);
}
export async function notes(page: Page) {
  const b = page.getByRole("button", { name: /Product Notes/ });
  if ((await b.getAttribute("aria-expanded")) === "false") await b.click();
}
export async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
