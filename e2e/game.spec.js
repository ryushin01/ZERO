import { expect, test } from "@playwright/test";

import { expectAccessible, fightToEnd, phaseOf, startRun } from "./helpers.js";

test.describe("처음 화면", () => {
  test("제목과 시작 버튼이 있고 접근성 검사를 통과합니다 @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ZERO/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Zero");
    await expect(page.getByRole("link", { name: "새 기록 시작" })).toBeVisible();
    await expectAccessible(page);
  });

  test("고리 움직임을 멈출 수 있습니다", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /고리 움직임/ });
    const before = await toggle.getAttribute("aria-pressed");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", before === "true" ? "false" : "true");
  });

  test("본문 바로가기로 본문에 갈 수 있습니다", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "본문 바로가기" });
    await expect(skip).toBeFocused();
  });
});

test.describe("한 판", () => {
  test("길잡이를 고르면 11장으로 시작하고 지도가 접근성 검사를 통과합니다 @mobile", async ({ page }) => {
    await startRun(page);
    await expect(page.getByRole("button", { name: "덱 11장" })).toBeVisible();
    await expectAccessible(page);
  });

  test("키보드만으로 카드를 내고 턴을 넘깁니다", async ({ page }) => {
    await startRun(page);
    await page.locator("[data-action='enter']").first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: /전투/ })).toBeFocused();
    await expectAccessible(page);

    const energy = page.locator(".player__energy-value");
    await expect(energy).toContainText("3");
    const firstCard = page.locator("[data-hand] button.card").first();
    await firstCard.focus();
    await page.keyboard.press("Enter");
    const target = page.locator("[data-action='target']").first();
    if (await target.count()) {
      await expect(target).toBeFocused();
      await page.keyboard.press("Enter");
    }
    await expect(energy).not.toHaveText(/^3/);
    // 일어난 일은 화면 낭독기에 알립니다.
    await expect(page.locator("[data-announcer]")).not.toBeEmpty();

    await page.getByRole("button", { name: "턴 끝내기" }).click();
    await expect(page.getByText(/턴 2/)).toBeVisible();
  });

  test("새로 고쳐도 전투가 이어집니다", async ({ page }) => {
    await startRun(page);
    await page.locator("[data-action='enter']").first().click();
    await page.getByRole("button", { name: "턴 끝내기" }).click();
    await page.reload();
    await expect(page.getByText(/턴 2/)).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /이어 하기/ })).toBeVisible();
  });

  test("전투에서 이기면 카드를 골라 덱에 넣습니다", async ({ page }) => {
    await startRun(page);
    await page.locator("[data-action='enter']").first().click();
    await fightToEnd(page);
    expect(await phaseOf(page)).toBe("reward");
    await expectAccessible(page);
    await page.locator("[data-action='take-card']").first().click();
    await expect(page.getByRole("heading", { name: "카드를 덱에 넣었습니다" })).toBeVisible();
    await page.getByRole("button", { name: "지도로 돌아가기" }).click();
    await expect(page.getByRole("button", { name: "덱 12장" })).toBeVisible();
  });

  test("덱 보기 대화상자는 닫으면 초점을 돌려줍니다", async ({ page }) => {
    await startRun(page);
    const deck = page.getByRole("button", { name: "덱 11장" });
    await deck.click();
    const dialog = page.getByRole("dialog", { name: /내 덱 11장/ });
    await expect(dialog).toBeVisible();
    await expectAccessible(page, "dialog");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(deck).toBeFocused();
  });
});

test.describe("무구와 세력", () => {
  test("길잡이 신화의 무구를 들고 시작하고, 키보드로 휘두릅니다", async ({ page }) => {
    await startRun(page);
    await expect(page.getByRole("heading", { name: "무구 1" })).toBeVisible();
    await page.locator("[data-action='enter']").first().click();
    // 첫 무구에 적이 쓰러지지 않도록 적의 체력을 넉넉히 둔 상태에서 시작합니다.
    await page.evaluate(() => {
      const run = JSON.parse(localStorage.getItem("zero:run"));
      run.combat.enemies = run.combat.enemies.map((e) => ({ ...e, hp: 999, maxHp: 999 }));
      localStorage.setItem("zero:run", JSON.stringify(run));
    });
    await page.reload();
    const arm = page.locator("[data-action='arm']").first();
    await expect(arm).toBeVisible();
    await arm.focus();
    await page.keyboard.press("Enter");
    const target = page.locator("[data-action='target']").first();
    if (await target.count()) {
      await expect(target).toBeFocused();
      await page.keyboard.press("Enter");
    }
    await expect(page.locator("[data-announcer]")).not.toBeEmpty();
    await expect(arm).toHaveAttribute("aria-disabled", "true");
    await expect(arm).toContainText("턴 뒤");
    await expectAccessible(page);
  });

  test("도감에서 무구 14점과 41개 계열의 세력을 봅니다 @mobile", async ({ page }) => {
    await page.goto("/#/codex");
    await page.getByRole("button", { name: "무구", exact: true }).click();
    await expect(page.getByRole("heading", { name: "묠니르" })).toBeVisible();
    await expect(page.locator(".codex__arms > li")).toHaveCount(14);
    await expectAccessible(page);
    await page.getByRole("button", { name: "세력", exact: true }).click();
    await expect(page.getByRole("table", { name: /세력/ })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "한국 신화" })).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("오늘의 신화와 서가 복원", () => {
  test("오늘의 신화로 시작하면 길잡이 신화의 신 둘이 서가에 복원됩니다", async ({ page }) => {
    await page.goto("/#/new/daily");
    await expect(page.getByRole("heading", { level: 1, name: /오늘의 신화 · \d+월 \d+일/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "다른 신화 셋 보기" })).toHaveCount(0);
    await expectAccessible(page);
    await page
      .getByRole("button", { name: /로 시작$/ })
      .first()
      .click();
    await expect(page.getByRole("heading", { level: 1, name: /1장/ })).toBeVisible();

    await page.goto("/#/codex");
    await expect(page.getByText("2 / 133")).toBeVisible();
    await page.getByRole("button", { name: "복원한 신만" }).click();
    await expect(page.getByText("133장 가운데 2장")).toBeVisible();
    await expect(page.locator(".card__badge")).toHaveCount(2);
  });

  test("판이 끝나면 새로 복원한 신을 보여 주고 결과를 복사합니다", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#/new/daily");
    await page
      .getByRole("button", { name: /로 시작$/ })
      .first()
      .click();
    await expect(page.getByRole("heading", { level: 1, name: /1장/ })).toBeVisible();
    await page.evaluate(() => {
      const run = JSON.parse(localStorage.getItem("zero:run"));
      localStorage.setItem(
        "zero:run",
        JSON.stringify({ ...run, phase: "defeat", stats: { ...run.stats, defeatedBy: "kappa" } }),
      );
    });
    await page.goto("/#/run");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "기록이 지워졌습니다" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "이번 판에 새로 복원한 신 2명" })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: "결과 복사하기" }).click();
    await expect(page.getByRole("status").filter({ hasText: "결과를 복사했습니다." })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("ZERO 오늘의 신화");
  });
});

test.describe("도감", () => {
  test("영역으로 찾고 카드 상세에서 Ark로 이어집니다 @mobile", async ({ page }) => {
    await page.goto("/#/codex");
    await expect(page.getByRole("status").filter({ hasText: "133장 가운데 133장" })).toBeVisible();
    await page.getByLabel("이름·영역으로 찾기").fill("번개");
    await expect(page.getByText(/133장 가운데 \d장/)).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("button", { name: /^제우스 / }).click();
    const dialog = page.getByRole("dialog", { name: "제우스" });
    await expect(dialog.getByRole("link", { name: /Ark에서 제우스 읽기/ })).toHaveAttribute(
      "href",
      "https://ark-ryushin01.vercel.app/figures/zeus",
    );
    await expectAccessible(page, "dialog");
  });

  test("괴물과 유물 목록을 봅니다", async ({ page }) => {
    await page.goto("/#/codex");
    await page.getByRole("button", { name: "괴물" }).click();
    await expect(page.getByRole("heading", { name: /히드라/ })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: "유물" }).click();
    await expect(page.getByRole("heading", { name: "아리아드네의 실" })).toBeVisible();
  });
});

test("도움말이 접근성 검사를 통과합니다 @mobile", async ({ page }) => {
  await page.goto("/#/guide");
  await expect(page.getByRole("heading", { level: 1, name: "도움말" })).toBeVisible();
  await expect(page.getByRole("table", { name: /속성별 효과/ })).toBeVisible();
  await expectAccessible(page);
});

test.describe("모바일 @mobile", () => {
  for (const path of ["/", "/#/new", "/#/codex", "/#/guide"]) {
    test(`${path}에서 가로 스크롤이 없습니다 @mobile`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("전투 화면에서 가로 스크롤이 없습니다 @mobile", async ({ page }) => {
    await startRun(page);
    await page.locator("[data-action='enter']").first().click();
    await expect(page.getByRole("button", { name: "턴 끝내기" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expectAccessible(page);
  });
});

test("빌드에 함께 들어간 Storybook이 열립니다", async ({ page }) => {
  const response = await page.goto("/storybook/index.html");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Storybook/);
});
