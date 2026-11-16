// README 화면(docs/images/*.jpg)과 공유 그림(public/og.jpg)을 다시 찍습니다. 판의 상태는 localStorage(zero:run)로 만들어 같은 장면을 찍습니다.
// 먼저 프로덕션 빌드를 띄워 두세요: pnpm build && pnpm preview
// 사용: BASE_URL=http://localhost:4173 pnpm screenshots
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const OUT = "docs/images";
const browser = await chromium.launch();

async function open(path = "/", { viewport = { width: 1440, height: 900 }, scale = 1 } = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    isMobile: scale > 1,
    locale: "ko-KR",
  });
  const page = await context.newPage();
  await go(page, path);
  return { page, context };
}

async function go(page, path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

async function shot(page, name, wait = 1500) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 82 });
  console.log("저장", name);
}

/** 판 상태를 고치고 다시 그립니다. */
async function patchRun(page, patch) {
  await page.evaluate((source) => {
    const run = JSON.parse(localStorage.getItem("zero:run"));
    const next = new Function("run", source)(run) ?? run;
    localStorage.setItem("zero:run", JSON.stringify(next));
  }, patch);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
}

/** 그리스 신화가 있는 셋이 나올 때까지 다시 고른 뒤, 그 신화로 시작합니다(무구 아이기스). */
async function startGreek(page) {
  await go(page, "/#/new");
  for (let i = 0; i < 30; i += 1) {
    if (await page.getByRole("button", { name: "그리스 신화로 시작" }).count()) break;
    await page.getByRole("button", { name: "다른 신화 셋 보기" }).click();
    await page.waitForTimeout(150);
  }
  await page.getByRole("button", { name: "그리스 신화로 시작" }).click();
  await page.getByRole("heading", { level: 1, name: /1장/ }).waitFor();
}

// 공유 그림(public/og.jpg, 1200×630): 지금 첫 화면을 그대로 찍습니다.
{
  const { page, context } = await open("/", { viewport: { width: 1200, height: 630 } });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "public/og.jpg", type: "jpeg", quality: 85 });
  console.log("저장 og (public/og.jpg)");
  await context.close();
}

// 첫 화면과 새 판 화면
{
  const { page, context } = await open("/");
  await shot(page, "title", 2500);
  await go(page, "/#/new");
  await shot(page, "new");
  await context.close();
}

// 지도, 전투(드라우그), 정예 보상, 사건, 장착
{
  const { page, context } = await open("/");
  await startGreek(page);
  await shot(page, "map");

  // 첫 전투의 적을 드라우그로 둡니다.
  await page.locator("[data-action='enter']").first().click();
  await page.waitForTimeout(800);
  await patchRun(
    page,
    `run.combat.enemies = run.combat.enemies.slice(0, 1).map((e) => ({ ...e, id: "draugr" })); return run;`,
  );
  await shot(page, "battle");

  // 정예 보상: 카드 셋, 무구 와스 홀과 케리케이온, 유물 암리타
  await patchRun(
    page,
    `run.phase = "reward"; run.combat = null;
     run.reward = { title: "정예를 물리쳤습니다", cards: run.deck.slice(0, 3).map((c) => c.id), relics: ["amrita"], relicPick: false,
       cardTaken: false, relicTaken: false, armaments: ["was", "kerykeion"], armamentTaken: false };
     return run;`,
  );
  await page.setViewportSize({ width: 1440, height: 1400 });
  await shot(page, "reward");
  await page.setViewportSize({ width: 1440, height: 900 });

  // 미미르의 샘
  await patchRun(page, `run.phase = "event"; run.event = "mimir"; run.reward = null; return run;`);
  await shot(page, "event");

  // 붉은 방(히든 사건)
  await patchRun(page, `run.phase = "event"; run.event = "crimson"; return run;`);
  await shot(page, "hidden-event");

  // 장착: 오딘에 슬레이프니르를 끼웁니다.
  await patchRun(
    page,
    `run.phase = "map"; run.event = null;
     run.deck.push({ uid: "shot-odin", id: "odin", up: false }, { uid: "shot-sleipnir", id: "sleipnir", up: false });
     return run;`,
  );
  await page.getByRole("button", { name: /장착하기/ }).click();
  await page.getByRole("button", { name: /^오딘 / }).click();
  await page.locator("[data-action='equip-partner']").filter({ hasText: "슬레이프니르" }).click();
  await page.locator("[data-action='equip-arm']").first().click();
  await shot(page, "gear");
  await context.close();
}

// 도감: 기사 찾기, 아서 상세, 무구, 세력, 괴물, 유신
{
  const { page, context } = await open("/#/codex");
  await page.getByLabel("이름·영역으로 찾기").fill("기사");
  await page.evaluate(() => document.activeElement?.blur());
  await shot(page, "codex");
  await page.getByLabel("이름·영역으로 찾기").fill("아서");
  await page.getByRole("button", { name: /^아서/ }).first().click();
  await shot(page, "detail");
  await page.keyboard.press("Escape");
  await page.getByLabel("이름·영역으로 찾기").fill("유신");
  await page.getByRole("button", { name: /^유신 / }).click();
  await shot(page, "hidden-detail");
  await page.keyboard.press("Escape");
  await page.getByLabel("이름·영역으로 찾기").fill("");
  await page.getByRole("tab", { name: "무구", exact: true }).click();
  await shot(page, "arms");
  await page.getByRole("tab", { name: "세력", exact: true }).click();
  await shot(page, "factions");
  await page.getByRole("tab", { name: "괴물", exact: true }).click();
  await shot(page, "enemies");
  await context.close();
}

// 오늘의 신화와 판이 끝난 화면
{
  const { page, context } = await open("/#/new/daily");
  await shot(page, "daily");
  await page
    .getByRole("button", { name: /로 시작$/ })
    .first()
    .click();
  await page.getByRole("heading", { level: 1, name: /1장/ }).waitFor();
  await patchRun(page, `run.phase = "defeat"; run.stats = { ...run.stats, defeatedBy: "kappa" }; return run;`);
  await go(page, "/#/run");
  await page.reload({ waitUntil: "networkidle" });
  await shot(page, "end");
  await context.close();
}

// 2인 듀얼: 성기사 대 강령술사, 플레이어 1이 패를 본 화면
{
  const { page, context } = await open("/");
  await page.getByRole("link", { name: "2인 듀얼" }).click();
  await page.getByLabel("클래스").first().selectOption("paladin");
  await page.getByLabel("클래스").nth(1).selectOption("necromancer");
  await page.getByRole("button", { name: "듀얼 시작" }).click();
  await page.getByRole("button", { name: /패 보기/ }).click();
  await shot(page, "duel");
  await context.close();
}

// 모바일
{
  const { page, context } = await open("/", { viewport: { width: 390, height: 844 }, scale: 2 });
  await shot(page, "mobile-title", 2500);
  await startGreek(page);
  await page.locator("[data-action='enter']").first().click();
  await page.waitForTimeout(800);
  await patchRun(
    page,
    `run.combat.enemies = run.combat.enemies.slice(0, 1).map((e) => ({ ...e, id: "draugr" })); return run;`,
  );
  await shot(page, "mobile-battle");
  await context.close();
}

await browser.close();
