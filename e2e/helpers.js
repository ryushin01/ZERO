import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

/** axe로 WCAG 2.2 AA 규칙을 검사합니다. (KWCAG 준수의 일부만 확인합니다) */
export async function expectAccessible(page, include) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

/** 새 판을 시작하고 지도 화면까지 갑니다. */
export async function startRun(page) {
  await page.goto("/#/new");
  await page
    .getByRole("button", { name: /로 시작$/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1, name: /1장/ })).toBeVisible();
}

/** 지금 판의 단계 */
export const phaseOf = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("zero:run") ?? "null")?.phase);

/** 전투를 이길 때까지 카드를 내고 턴을 넘깁니다. 지면 그대로 돌아옵니다. */
export async function fightToEnd(page) {
  for (let step = 0; step < 150; step += 1) {
    if ((await phaseOf(page)) !== "battle") return;
    const card = page.locator("[data-hand] button.card:not([aria-disabled='true'])").first();
    if (await card.count()) {
      await card.click();
      const target = page.locator("[data-action='target']").first();
      if (await target.count()) await target.click();
    } else {
      await page.getByRole("button", { name: "턴 끝내기" }).click();
    }
  }
}
