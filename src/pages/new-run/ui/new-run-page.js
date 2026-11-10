import { cardFace, getCard } from "#entities/card/index.js";
import { figuresOf } from "#entities/figure/index.js";
import { createRun, guideCards, guideOptions } from "#features/run/index.js";
import { h, randomSeed } from "#shared/lib/index.js";

import "./new-run-page.css";

/** @param {import("#app/render/app.js").PageContext} ctx */
function view(ctx) {
  const seed = ctx.ui.seed;
  const options = seed ? guideOptions(seed) : [];
  const ongoing = ctx.run && ctx.run.phase !== "victory" && ctx.run.phase !== "defeat";

  return h(
    "section",
    { class: "new-run" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Choose your guide"),
      h("h1", null, "길잡이 신화를 고르세요"),
      h(
        "p",
        null,
        "고른 신화의 신 둘이 처음 덱에 들어오고, 보상에도 그 신화의 카드가 자주 나옵니다. 같은 신화의 카드를 이어 내면 공명합니다.",
      ),
    ),
    ongoing
      ? h(
          "p",
          { class: "notice" },
          `진행 중인 판(${ctx.run.act}장 ${ctx.run.stats.floors}층)이 있습니다. 새로 시작하면 지금 판은 지워집니다.`,
        )
      : null,
    h(
      "ol",
      { class: "new-run__list" },
      options.map((pantheon) => {
        const starters = guideCards(pantheon.slug).map((id) => getCard(id));
        const count = figuresOf(pantheon.slug).length;
        return h(
          "li",
          { class: "new-run__option", "data-key": pantheon.slug },
          h("p", { class: "new-run__en display", lang: "en", "aria-hidden": "true" }, pantheon.nameEn),
          h("h2", { class: "new-run__name serif" }, pantheon.name),
          h("p", { class: "label muted" }, `${pantheon.region} · ${pantheon.eraLabel} · 신과 영웅 ${count}`),
          h("p", { class: "new-run__summary" }, pantheon.summary),
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
      h("button", { type: "button", class: "button", "data-action": "reroll" }, "다른 신화 셋 보기"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면으로"),
    ),
  );
}

/** @type {import("#app/render/app.js").Page} */
export const newRunPage = {
  title: () => "길잡이 신화 고르기",
  surface: () => "light",
  context: () => "새 기록",
  view,
  mount(ctx) {
    if (!ctx.ui.seed) ctx.setUi({ seed: randomSeed() });
  },
  actions: {
    reroll(ctx) {
      ctx.setUi({ seed: randomSeed() });
      ctx.announce("다른 신화 셋을 불러왔습니다.");
    },
    start(ctx, el) {
      const guide = /** @type {string} */ (el.dataset.slug);
      const seed = ctx.ui.seed ?? randomSeed();
      ctx.setUi({ seed: randomSeed() });
      ctx.setRun(createRun({ seed, guide }));
      ctx.navigate("#/run");
    },
  },
};
