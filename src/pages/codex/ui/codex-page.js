import { ASPECTS, cardFace, FIGURE_CARDS } from "#entities/card/index.js";
import { describeAction, ENEMIES } from "#entities/enemy/index.js";
import { CONTINENT_LABEL, CONTINENTS, getFigure, getPantheon } from "#entities/figure/index.js";
import { relicCard, RELICS } from "#entities/relic/index.js";
import { h } from "#shared/lib/index.js";

import { filterCards } from "../model/filter.js";

import "./codex-page.css";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

const TABS = [
  { id: "cards", label: "신과 영웅" },
  { id: "enemies", label: "괴물" },
  { id: "relics", label: "유물" },
];

/** @param {string} action @param {string} value @param {boolean} pressed @param {string} label */
const toggle = (action, value, pressed, label) =>
  h(
    "button",
    {
      type: "button",
      class: "chip",
      "data-action": action,
      "data-value": value,
      "aria-pressed": pressed ? "true" : "false",
    },
    label,
  );

/** @param {Ctx} ctx */
function cardsTab(ctx) {
  const { query = "", continent = "all", aspect = "all" } = ctx.ui;
  const cards = filterCards(FIGURE_CARDS, { query, continent, aspect });
  return [
    h(
      "div",
      { class: "codex__filters" },
      h(
        "p",
        { class: "codex__search" },
        h("label", { for: "codex-query", class: "label" }, "이름·영역으로 찾기"),
        h("input", {
          id: "codex-query",
          type: "search",
          value: query,
          "data-input": "query",
          placeholder: "예) 번개, 오딘, 저승",
          autocomplete: "off",
        }),
      ),
      h(
        "div",
        { class: "codex__group", role: "group", "aria-label": "대륙" },
        toggle("continent", "all", continent === "all", "모든 대륙"),
        CONTINENTS.map((c) => toggle("continent", c, continent === c, CONTINENT_LABEL[c])),
      ),
      h(
        "div",
        { class: "codex__group", role: "group", "aria-label": "속성" },
        toggle("aspect", "all", aspect === "all", "모든 속성"),
        Object.entries(ASPECTS).map(([key, a]) => toggle("aspect", key, aspect === key, `${a.mark} ${a.label}`)),
      ),
    ),
    h("p", { class: "codex__count label", role: "status" }, `${FIGURE_CARDS.length}장 가운데 ${cards.length}장`),
    cards.length
      ? h(
          "ul",
          { class: "codex__cards" },
          cards.map((card) =>
            h(
              "li",
              { "data-key": card.id },
              cardFace(card, { tag: "button", attrs: { "data-action": "open-card", "data-id": card.id } }),
            ),
          ),
        )
      : h("p", { class: "muted codex__empty" }, "맞는 카드가 없습니다. 거르기를 풀어 보세요."),
  ];
}

function enemiesTab() {
  return h(
    "ol",
    { class: "codex__enemies" },
    ENEMIES.map((enemy) =>
      h(
        "li",
        { class: "codex-enemy", "data-key": enemy.id },
        h(
          "p",
          { class: "label muted" },
          `${enemy.act}장 · ${{ normal: "괴물", elite: "정예", boss: "보스" }[enemy.tier]} · ${enemy.origin}`,
        ),
        h(
          "h2",
          { class: "codex-enemy__name" },
          h("span", { class: "display", lang: "en", "aria-hidden": "true" }, enemy.nameEn),
          h("span", { class: "serif" }, enemy.name),
        ),
        h("p", null, enemy.lore),
        h(
          "dl",
          { class: "codex-enemy__facts" },
          h("dt", null, "체력"),
          h("dd", null, enemy.hp[0] === enemy.hp[1] ? `${enemy.hp[0]}` : `${enemy.hp[0]}–${enemy.hp[1]}`),
          h("dt", null, "행동"),
          h(
            "dd",
            null,
            enemy.intents
              .map((i) => `${i.name}(${i.actions.map((a) => describeAction(a, { heads: enemy.heads })).join(", ")})`)
              .join(" → "),
          ),
          enemy.nemesis ? h("dt", null, "천적") : null,
          enemy.nemesis
            ? h(
                "dd",
                null,
                [
                  ...(enemy.nemesis.figures ?? []).map((s) => getFigure(s)?.name),
                  ...(enemy.nemesis.pantheons ?? []).map((s) => `${getPantheon(s)?.name}의 신들`),
                  ...(enemy.nemesis.domains ?? []).map((d) => `‘${d}’ 영역의 신`),
                ].join(", "),
                h("span", { class: "muted" }, ` — ${enemy.nemesis.note}`),
              )
            : null,
        ),
      ),
    ),
  );
}

function relicsTab() {
  return h(
    "ul",
    { class: "codex__relics" },
    RELICS.map((relic) => h("li", { "data-key": relic.id }, relicCard(relic))),
  );
}

/** @param {Ctx} ctx */
function view(ctx) {
  const tab = ctx.ui.tab ?? "cards";
  return h(
    "section",
    { class: "codex" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Codex"),
      h("h1", null, "도감"),
      h(
        "p",
        null,
        "Ark에 기록된 신과 영웅이 그대로 카드가 되었습니다. 카드를 누르면 Ark의 소개와 자료, 출처를 볼 수 있습니다.",
      ),
    ),
    h(
      "div",
      { class: "codex__tabs", role: "group", "aria-label": "도감 구분" },
      TABS.map((t) => toggle("tab", t.id, tab === t.id, t.label)),
    ),
    h(
      "div",
      { class: "codex__panel" },
      tab === "cards" ? cardsTab(ctx) : tab === "enemies" ? enemiesTab() : relicsTab(),
    ),
  );
}

/** @type {import("#app/render/app.js").Page} */
export const codexPage = {
  title: () => "도감",
  surface: () => "light",
  context: () => "도감",
  view,
  actions: {
    tab: (ctx, el) => ctx.setUi({ tab: el.dataset.value }),
    continent: (ctx, el) => ctx.setUi({ continent: el.dataset.value }),
    aspect: (ctx, el) => ctx.setUi({ aspect: el.dataset.value }),
    "open-card": (ctx, el) => ctx.openCard(/** @type {string} */ (el.dataset.id)),
  },
  inputs: {
    query: (ctx, el) => ctx.setUi({ query: el.value }),
  },
};
