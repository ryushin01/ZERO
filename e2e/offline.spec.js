import { expect, test } from "@playwright/test";

import { expectAccessible, startRun } from "./helpers.js";

/**
 * 오프라인 검사: localhost 밖으로 나가는 요청을 모두 끊은 채 주요 화면이 내용과 함께 뜨는지 봅니다.
 * 게임 자료(신·무구·그림·글꼴)는 모두 저장소에 있고, Ark는 동기화 때만 읽으므로 실행 중에는 바깥 요청이 없어야 합니다.
 * 테스트용 빌드에는 .env가 없어 Sentry도 켜지지 않습니다.
 */

/** 바깥 요청을 끊고, 끊긴 주소를 모읍니다. */
async function goOffline(context) {
  /** @type {string[]} */
  const blocked = [];
  await context.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => {
      blocked.push(route.request().url());
      return route.abort("internetdisconnected");
    },
  );
  return blocked;
}

/** 화면의 그림이 모두 받아졌는지(깨진 그림은 naturalWidth가 0) */
const imagesLoaded = (locator) =>
  locator.evaluateAll((list) => list.length > 0 && list.every((img) => img.complete && img.naturalWidth > 0));

test.describe("오프라인", () => {
  test("바깥 요청 없이 처음 화면·도감·카드 상세·도움말·한 판이 내용과 함께 뜹니다", async ({ page, context }) => {
    const blocked = await goOffline(context);

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Zero");
    await expect.poll(() => imagesLoaded(page.locator(".title__tile img"))).toBe(true);
    await expectAccessible(page);

    await page.goto("/#/codex");
    await page.getByLabel("이름·영역으로 찾기").fill("제우스");
    await page.getByRole("button", { name: /^제우스 / }).click();
    const detail = page.getByRole("dialog", { name: "제우스" });
    await expect(detail.locator(".card-detail__source")).toBeVisible();
    await expect.poll(() => imagesLoaded(detail.locator("img"))).toBe(true);
    await expectAccessible(page);
    await page.keyboard.press("Escape");

    await page.goto("/#/guide");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAccessible(page);

    await startRun(page);
    await expect(page.getByRole("button", { name: "덱 12장" })).toBeVisible();
    await expectAccessible(page);

    expect(blocked).toEqual([]);
  });
});
