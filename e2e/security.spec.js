import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { startRun } from "./helpers.js";

/** 운영(Vercel)에서 앱 문서에 붙는 헤더. vercel.json에서 읽어 미리보기 서버의 응답에 똑같이 붙입니다. */
function productionHeaders(path) {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  /** @type {Record<string, string>} */
  const headers = {};
  for (const rule of config.headers) {
    const pattern = new RegExp(`^${rule.source.replace(/\(\.\*\)/g, ".*")}$`);
    if (!pattern.test(path)) continue;
    for (const { key, value } of rule.headers) headers[key.toLowerCase()] = value;
  }
  return headers;
}

test.describe("보안 헤더", () => {
  test("앱 문서에 CSP·nosniff·Referrer-Policy·틀 막기가 있고, Storybook에는 CSP를 걸지 않습니다", () => {
    const app = productionHeaders("/");
    expect(app["content-security-policy"]).toContain("script-src 'self'");
    expect(app["content-security-policy"]).toContain("object-src 'none'");
    expect(app["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(app["x-content-type-options"]).toBe("nosniff");
    expect(app["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(productionHeaders("/storybook/index.html")["content-security-policy"]).toBeUndefined();
  });

  test("운영과 같은 CSP에서 한 판·도감·카드 상세·듀얼을 돌아도 위반이 없습니다", async ({ page }) => {
    const headers = productionHeaders("/");
    // 앱 문서(/) 응답에만 운영 헤더를 붙입니다. (미리보기 서버는 vercel.json을 읽지 않음)
    await page.route(
      (url) => url.pathname === "/" || url.pathname === "/index.html",
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
      },
    );
    await page.addInitScript(() => {
      /** @type {string[]} */
      const found = [];
      Object.defineProperty(window, "__cspViolations", { value: found });
      document.addEventListener("securitypolicyviolation", (event) => {
        found.push(`${event.violatedDirective} ${event.blockedURI}`);
      });
    });
    const violations = () => page.evaluate(() => /** @type {any} */ (window).__cspViolations);

    await page.goto("/");
    await expect(page.locator(".title__tile img").first()).toBeVisible();

    await startRun(page);
    await page.locator("[data-action='enter']").first().click();
    const card = page.locator("[data-hand] button.card:not([aria-disabled='true'])").first();
    await card.click();
    const target = page.locator("[data-action='target']").first();
    if (await target.count()) await target.click();

    await page.goto("/#/codex");
    await page.getByLabel("이름·영역으로 찾기").fill("제우스");
    await page.getByRole("button", { name: /^제우스 / }).click();
    await expect(page.getByRole("dialog", { name: "제우스" }).locator(".card-detail__source")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto("/#/duel");
    await page.getByLabel("클래스").first().selectOption("knight");
    await page.getByRole("button", { name: "듀얼 시작" }).click();

    expect(await violations()).toEqual([]);
  });
});
