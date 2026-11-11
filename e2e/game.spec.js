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
  test("길잡이를 고르면 유신을 더해 12장으로 시작하고 지도가 접근성 검사를 통과합니다 @mobile", async ({ page }) => {
    await startRun(page);
    await expect(page.getByRole("button", { name: "덱 12장" })).toBeVisible();
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
    // 비용 0인 카드(유신 등)는 에너지가 그대로이고, 뽑기 카드는 손이 늘어나므로 알림에 나온 카드 이름으로 확인합니다.
    const firstCard = page.locator("[data-hand] button.card").first();
    const name = ((await firstCard.locator(".card__name").textContent()) ?? "").replace("+", "").trim();
    await firstCard.focus();
    await page.keyboard.press("Enter");
    const target = page.locator("[data-action='target']").first();
    if (await target.count()) {
      await expect(target).toBeFocused();
      await page.keyboard.press("Enter");
    }
    // 일어난 일은 화면 낭독기에 알립니다.
    await expect(page.locator("[data-announcer]")).toContainText(name);

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
    await expect(page.getByRole("button", { name: "덱 13장" })).toBeVisible();
  });

  test("덱 보기 대화상자는 닫으면 초점을 돌려줍니다", async ({ page }) => {
    await startRun(page);
    const deck = page.getByRole("button", { name: "덱 12장" });
    await deck.click();
    const dialog = page.getByRole("dialog", { name: /내 덱 12장/ });
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
    await expect(page.getByRole("heading", { name: "무구 2" })).toBeVisible();
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
    // 전투마다 한 번 쓰는 무구(아라시의 화살 등)는 “다 씀”으로 바뀝니다.
    await expect(arm).toContainText(/턴 뒤|다 씀/);
    await expectAccessible(page);
  });

  test("도감에서 무구와 모든 계열의 세력을 봅니다 @mobile", async ({ page }) => {
    await page.goto("/#/codex");
    await page.getByRole("button", { name: "무구", exact: true }).click();
    await expect(page.getByRole("heading", { name: "묠니르" })).toBeVisible();
    await expect(page.locator(".codex__arms > li")).toHaveCount(40);
    await expectAccessible(page);
    await page.getByRole("button", { name: "세력", exact: true }).click();
    await expect(page.getByRole("table", { name: /세력/ })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "한국 신화" })).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("전장", () => {
  test("지도에 이 장의 전장과 효과가 보이고, 전투 머리에도 전장이 나옵니다 @mobile", async ({ page }) => {
    await startRun(page);
    const field = page.getByRole("region", { name: "이 장의 전장" });
    await expect(field).toContainText("전장 · 성역");
    await expect(field.getByRole("heading", { level: 2 })).toBeVisible();
    await expectAccessible(page);
    await page.locator("[data-action='enter']").first().click();
    await expect(page.locator(".battle__field")).toContainText("전장 · ");
  });

  test("도감의 전장 탭에서 성역·신역·아우터 유니버스와 이차원을 봅니다", async ({ page }) => {
    await page.goto("/#/codex");
    await page.getByRole("button", { name: "전장", exact: true }).click();
    for (const name of [/1장 · 성역/, /2장 · 신역/, /3장 · 아우터 유니버스/, /이차원/]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "발할라" })).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("장착", () => {
  test("지도에서 장착 화면을 열어 카드에 무구와 탈것을 끼웁니다 @mobile", async ({ page }) => {
    await startRun(page);
    // 오딘과 슬레이프니르를 덱에 넣고 시작합니다.
    await page.evaluate(() => {
      const run = JSON.parse(localStorage.getItem("zero:run"));
      run.deck.push({ uid: "e2e-odin", id: "odin", up: false }, { uid: "e2e-sleipnir", id: "sleipnir", up: false });
      localStorage.setItem("zero:run", JSON.stringify(run));
    });
    await page.reload();
    await page.getByRole("button", { name: /장착하기/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "장착" })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: /^오딘 / }).click();
    await page.locator("[data-action='equip-partner']").filter({ hasText: "슬레이프니르" }).click();
    await expect(page.getByText(/아홉 세계를 달리는 여덟 다리/).first()).toBeVisible();
    const arm = page.locator("[data-action='equip-arm']").first();
    await arm.click();
    await expect(arm).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page);
    await page.getByRole("button", { name: "지도로 돌아가기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /1장/ })).toBeVisible();
  });
});

test.describe("2인 듀얼", () => {
  test("클래스를 고르고, 차례마다 넘기기 화면으로 상대의 패를 가리며 번갈아 둡니다 @mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "2인 듀얼" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "2인 듀얼" })).toBeVisible();
    await page.getByLabel("클래스").first().selectOption("knight");
    await page.getByLabel("클래스").nth(1).selectOption("necromancer");
    await expect(page.getByText("전투가 시작되면 방어 12")).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("button", { name: "듀얼 시작" }).click();
    // 단계가 바뀌면 새 화면의 제목으로 초점이 옮겨 갑니다. (화면 낭독기가 차례를 알 수 있게)
    await expect(page.getByRole("heading", { level: 1, name: "플레이어 1의 차례" })).toBeFocused();
    // 넘기기 화면에서는 손이 보이지 않습니다.
    await expect(page.locator("[data-action='duel-card']")).toHaveCount(0);
    await expectAccessible(page);
    await page.getByRole("button", { name: /패 보기/ }).click();
    await expect(page.locator("[data-action='duel-card']")).toHaveCount(5);
    await expectAccessible(page);

    await page.locator("[data-action='duel-card']:not([aria-disabled='true'])").first().click();
    await page.getByRole("button", { name: "차례 끝내기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "플레이어 2의 차례" })).toBeFocused();
    await expect(page.locator("[data-action='duel-card']")).toHaveCount(0);

    // 새로 고침해도 듀얼이 이어지고, 손을 펼친 뒤였더라도 넘기기 화면부터 다시 나옵니다.
    await page.getByRole("button", { name: /패 보기/ }).click();
    await expect(page.locator("[data-action='duel-card']").first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "플레이어 2의 차례" })).toBeVisible();
    await expect(page.locator("[data-action='duel-card']")).toHaveCount(0);

    // 새로 고침으로 이어 둔 판을 끝내고 다시 하면, 이번 판의 클래스(기사·강령술사)로 다시 시작합니다.
    await page.evaluate(() => {
      const duel = JSON.parse(localStorage.getItem("zero:duel"));
      localStorage.setItem("zero:duel", JSON.stringify({ ...duel, phase: "over", winner: 0 }));
    });
    await page.reload();
    await page.getByRole("button", { name: "같은 클래스로 다시" }).click();
    const restarted = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("zero:duel")).players.map((p) => p.classId),
    );
    expect(restarted).toEqual(["knight", "necromancer"]);
  });
});

test.describe("히든", () => {
  test("붉은 방에서 유신과 영혼의 검을 얻고, 도감에 히든으로 남습니다", async ({ page }) => {
    await startRun(page);
    await page.evaluate(() => {
      const run = JSON.parse(localStorage.getItem("zero:run"));
      localStorage.setItem("zero:run", JSON.stringify({ ...run, phase: "event", event: "crimson" }));
    });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "붉은 방" })).toBeVisible();
    await expect(page.getByRole("img", { name: /허리에 손을 얹은 유신/ })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: /사내와 함께 간다/ }).click();
    await expect(page.getByRole("heading", { name: "무구 2" })).toBeVisible();
    await expect(page.getByText("유신이 영혼의 검을 들고 덱에 들어왔습니다.").first()).toBeVisible();

    await page.goto("/#/codex");
    await expect(page.getByRole("heading", { name: "히든" })).toBeVisible();
    await page.getByRole("button", { name: /^유신 / }).click();
    const dialog = page.getByRole("dialog", { name: "유신" });
    await expect(dialog.getByRole("heading", { name: "영혼의 검" })).toBeVisible();
    await expectAccessible(page, "dialog");
  });

  test("도감에서 유신을 찾으면 히든 카드로 보여 줍니다", async ({ page }) => {
    await page.goto("/#/codex");
    await page.getByLabel("이름·영역으로 찾기").fill("유신");
    await expect(page.getByRole("status").filter({ hasText: "히든 1장" })).toBeVisible();
    await expect(page.getByText("맞는 카드가 없습니다")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^유신 / })).toBeVisible();
  });

  test("유신 없이 시작할 수도 있고, 오늘의 신화에서는 고를 수 없습니다", async ({ page }) => {
    await page.goto("/#/new");
    const toggle = page.getByRole("button", { name: "히든 캐릭터 유신과 함께 시작" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await page
      .getByRole("button", { name: /로 시작$/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: "덱 11장" })).toBeVisible();
    await page.goto("/#/new/daily");
    await expect(page.getByRole("button", { name: "히든 캐릭터 유신과 함께 시작" })).toHaveCount(0);
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
    await expect(page.getByText(/서가 복원 2 \/ \d+/)).toBeVisible();
    await page.getByRole("button", { name: "복원한 신만" }).click();
    await expect(page.getByText(/\d+장 가운데 2장/)).toBeVisible();
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
    await expect(page.getByRole("status").filter({ hasText: /(\d+)장 가운데 \1장/ })).toBeVisible();
    await page.getByLabel("이름·영역으로 찾기").fill("번개");
    await expect(page.getByText(/\d+장 가운데 \d+장/)).toBeVisible();
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
