import { ARMAMENTS } from "#entities/armament/index.js";
import { cardFace, getCard } from "#entities/card/index.js";
import { describePerk, factionOf, TIERS } from "#entities/faction/index.js";
import { figuresOf, getPantheon } from "#entities/figure/index.js";
import { createRun, dailyKey, dailyLabel, dailySeed, guideCards, guideOptions } from "#features/run/index.js";
import { h, randomSeed } from "#shared/lib/index.js";

import "./new-run-page.css";

/** 길잡이 신화의 세력과 처음 들고 갈 무구 @param {string} slug */
function newRunExtras(slug) {
  const faction = factionOf(slug);
  const native = ARMAMENTS.filter((a) => a.pantheon === slug);
  return h(
    "dl",
    { class: "new-run__extras" },
    h("dt", { class: "label muted" }, "세력"),
    h("dd", null, `${faction.title} · ${TIERS[0]}장이면 ${describePerk(faction.perk, faction.values[0])}`),
    h("dt", { class: "label muted" }, "무구"),
    h(
      "dd",
      null,
      native.length ? `${native.map((a) => a.name).join(", ")} 가운데 하나` : "신화의 무구 가운데 하나를 무작위로",
    ),
  );
}

/** 히든 캐릭터와 함께 시작할지 (자유 도전에서만, 기본은 함께) @param {import("#app/render/app.js").PageContext} ctx */
const withHidden = (ctx) => !isDaily(ctx) && ctx.ui.hidden !== false;

/** @param {import("#app/render/app.js").PageContext} ctx */
const isDaily = (ctx) => ctx.route.params[0] === "daily";

/** 오늘의 신화는 날짜로, 자유 도전은 화면에 담아 둔 무작위 시드로 @param {import("#app/render/app.js").PageContext} ctx */
const seedOf = (ctx) => (isDaily(ctx) ? dailySeed(shownDay(ctx)) : ctx.ui.seed);

/** 화면에 보여 준 날짜. 자정을 넘겨 고르면 지금 날짜와 달라집니다. @param {import("#app/render/app.js").PageContext} ctx */
const shownDay = (ctx) => ctx.ui.day ?? dailyKey();

/** @param {import("#app/render/app.js").PageContext} ctx */
function view(ctx) {
  const daily = isDaily(ctx);
  const today = shownDay(ctx);
  const seed = seedOf(ctx);
  const options = seed ? guideOptions(seed) : [];
  const ongoing = ctx.run && ctx.run.phase !== "victory" && ctx.run.phase !== "defeat";
  const best = ctx.records.daily[today];

  return h(
    "section",
    { class: "new-run" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, daily ? "Myth of the day" : "Choose your guide"),
      h("h1", null, daily ? `오늘의 신화 · ${dailyLabel(today)}` : "길잡이 신화를 고르세요"),
      h(
        "p",
        null,
        daily
          ? "오늘은 누구나 같은 신화 셋과 같은 지도로 시작합니다. 여러 번 도전할 수 있고, 가장 좋은 결과가 남습니다."
          : "고른 신화의 신 둘이 처음 덱에 들어오고, 보상에도 그 신화의 카드가 자주 나옵니다. 같은 신화의 카드를 이어 내면 공명합니다.",
      ),
    ),
    daily && best
      ? h(
          "p",
          { class: "notice" },
          `오늘의 기록: ${getPantheon(best.guide)?.name ?? ""} · ${best.won ? "승리" : `${best.act}장에서 쓰러짐`} · ${best.floors}칸`,
        )
      : null,
    ongoing
      ? h(
          "p",
          { class: "notice" },
          `진행 중인 판(${ctx.run.act}장 ${ctx.run.stats.floors}층)이 있습니다. 새로 시작하면 지금 판은 지워집니다.`,
        )
      : null,
    daily
      ? null
      : h(
          "div",
          { class: "new-run__hidden" },
          h(
            "button",
            {
              type: "button",
              class: "chip",
              "data-action": "toggle-hidden",
              "aria-pressed": withHidden(ctx) ? "true" : "false",
            },
            "히든 캐릭터 유신과 함께 시작",
          ),
          h(
            "p",
            { class: "muted" },
            "유신 카드와 무구 영혼의 검을 처음부터 듭니다. 밸런스를 일부러 깨는 성능이라 오늘의 신화에서는 쓸 수 없습니다.",
          ),
        ),
    h(
      "ol",
      { class: "new-run__list" },
      options.map((pantheon) => {
        const starters = guideCards(pantheon.slug).map((id) => getCard(id));
        const count = figuresOf(pantheon.slug).length;
        return h(
          "li",
          { class: "new-run__option", "data-key": pantheon.slug },
          h(
            "p",
            {
              class: "new-run__en display fit",
              lang: "en",
              "aria-hidden": "true",
              style: { "--len": pantheon.nameEn.length },
            },
            pantheon.nameEn,
          ),
          h("h2", { class: "new-run__name serif" }, pantheon.name),
          h("p", { class: "label muted" }, `${pantheon.region} · ${pantheon.eraLabel} · 신과 영웅 ${count}`),
          h("p", { class: "new-run__summary" }, pantheon.summary),
          newRunExtras(pantheon.slug),
          h(
            "ul",
            { class: "new-run__cards", "aria-label": `${pantheon.name}가 처음 덱에 넣어 주는 카드` },
            starters.map((card) => h("li", null, cardFace(card, { size: "s" }))),
          ),
          h(
            "button",
            { type: "button", class: "button button--solid", "data-action": "start", "data-slug": pantheon.slug },
            `${pantheon.name}로 시작`,
          ),
        );
      }),
    ),
    h(
      "div",
      { class: "actions" },
      daily
        ? h("a", { href: "#/new", class: "button" }, "자유 도전으로")
        : h("button", { type: "button", class: "button", "data-action": "reroll" }, "다른 신화 셋 보기"),
      daily ? null : h("a", { href: "#/new/daily", class: "button" }, "오늘의 신화"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면으로"),
    ),
  );
}

/** @type {import("#app/render/app.js").Page} */
export const newRunPage = {
  title: (ctx) => (isDaily(ctx) ? "오늘의 신화" : "길잡이 신화 고르기"),
  surface: () => "light",
  context: (ctx) => (isDaily(ctx) ? "오늘의 신화" : "새 기록"),
  view,
  mount(ctx) {
    if (isDaily(ctx)) ctx.setUi({ day: dailyKey() });
    else if (!ctx.ui.seed) ctx.setUi({ seed: randomSeed() });
  },
  actions: {
    "toggle-hidden"(ctx) {
      const next = !withHidden(ctx);
      ctx.setUi({ hidden: next });
      ctx.announce(next ? "유신과 함께 시작합니다." : "유신 없이 시작합니다.");
    },
    reroll(ctx) {
      ctx.setUi({ seed: randomSeed() });
      ctx.announce("다른 신화 셋을 불러왔습니다.");
    },
    start(ctx, el) {
      const guide = /** @type {string} */ (el.dataset.slug);
      if (isDaily(ctx) && shownDay(ctx) !== dailyKey()) {
        // 화면을 연 뒤 날짜가 바뀌었습니다. 오늘의 후보로 다시 그리고 다시 고르게 합니다.
        ctx.setUi({ day: dailyKey() });
        ctx.announce("날짜가 바뀌어 오늘의 신화 후보가 바뀌었습니다. 다시 골라 주세요.");
        return;
      }
      const daily = isDaily(ctx) ? shownDay(ctx) : null;
      const seed = seedOf(ctx) ?? randomSeed();
      if (!daily) ctx.setUi({ seed: randomSeed() });
      ctx.setRun(createRun({ seed, guide, daily, hidden: withHidden(ctx) }));
      ctx.navigate("#/run");
    },
  },
};
