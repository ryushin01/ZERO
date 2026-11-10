import { ARMAMENTS, armamentCard, HIDDEN_ARMAMENTS } from "#entities/armament/index.js";
import { ASPECTS, cardFace, FIGURE_CARDS, HIDDEN_CARDS } from "#entities/card/index.js";
import { describeAction, enemyIllustration, ENEMIES } from "#entities/enemy/index.js";
import { describePerk, factionOf, TIERS } from "#entities/faction/index.js";
import { CONTINENT_LABEL, CONTINENTS, figuresOf, getFigure, getPantheon, PANTHEONS } from "#entities/figure/index.js";
import { relicCard, RELICS } from "#entities/relic/index.js";
import { h } from "#shared/lib/index.js";

import { filterCards } from "../model/filter.js";

import "./codex-page.css";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

const TABS = [
  { id: "cards", label: "신과 영웅" },
  { id: "enemies", label: "괴물" },
  { id: "armaments", label: "무구" },
  { id: "factions", label: "세력" },
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

/** Ark에 아직 없는 전설 확장 카드가 있는지 */
const HAS_LEGENDS = FIGURE_CARDS.some((card) => card.source === "zero");

/** @param {Ctx} ctx */
function cardsTab(ctx) {
  const { query = "", continent = "all", aspect = "all", seenOnly = false, source = "all" } = ctx.ui;
  const { seen } = ctx.records;
  const cards = filterCards(FIGURE_CARDS, { query, continent, aspect, seenOnly, seen, source });
  // 히든 카드도 같은 검색어와 거르기로 찾습니다. (서가 복원과 출처 거르기에는 들지 않음)
  const hidden = seenOnly || source !== "all" ? [] : filterCards(HIDDEN_CARDS, { query, continent, aspect });
  const ratio = seen.length / FIGURE_CARDS.length;
  return [
    h(
      "div",
      { class: "codex__progress" },
      h(
        "p",
        { class: "label" },
        h("span", { class: "muted" }, "서가 복원 "),
        `${seen.length} / ${FIGURE_CARDS.length}`,
      ),
      h(
        "span",
        { class: "codex__track", "aria-hidden": "true" },
        h("span", { class: "codex__fill", style: { "--ratio": ratio } }),
      ),
      h(
        "p",
        { class: "muted codex__progress-text" },
        "판을 거듭하며 덱에 넣은 신은 서가에 복원되어 ‘복원’ 표시가 붙습니다.",
      ),
    ),
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
      // 전설 확장이 모두 Ark로 옮겨 가면 출처로 거를 일이 없으므로 감춥니다.
      HAS_LEGENDS
        ? h(
            "div",
            { class: "codex__group", role: "group", "aria-label": "출처" },
            toggle("source", "all", source === "all", "모든 출처"),
            toggle("source", "ark", source === "ark", "Ark의 기록"),
            toggle("source", "zero", source === "zero", "전설 확장"),
          )
        : null,
      h(
        "div",
        { class: "codex__group", role: "group", "aria-label": "서가 복원" },
        h(
          "button",
          { type: "button", class: "chip", "data-action": "seen-only", "aria-pressed": seenOnly ? "true" : "false" },
          "복원한 신만",
        ),
      ),
    ),
    h(
      "p",
      { class: "codex__count label", role: "status" },
      `${FIGURE_CARDS.length}장 가운데 ${cards.length}장${hidden.length ? ` · 히든 ${hidden.length}장` : ""}`,
    ),
    cards.length || hidden.length
      ? h(
          "ul",
          { class: "codex__cards" },
          cards.map((card) =>
            h(
              "li",
              { "data-key": card.id },
              cardFace(card, {
                tag: "button",
                badge: seen.includes(card.id) ? "복원" : undefined,
                attrs: { "data-action": "open-card", "data-id": card.id },
              }),
            ),
          ),
        )
      : h(
          "p",
          { class: "muted codex__empty" },
          seenOnly && seen.length === 0
            ? "아직 복원한 신이 없습니다. 한 판을 시작하면 길잡이 신화의 신부터 기록됩니다."
            : "맞는 카드가 없습니다. 거르기를 풀어 보세요.",
        ),
    hiddenSection(hidden),
  ];
}

/** 히든 카드. 새 기록을 시작할 때 바로 데려갈 수 있습니다. @param {typeof HIDDEN_CARDS} cards 거르기를 거친 히든 카드 */
function hiddenSection(cards) {
  if (!cards.length) return null;
  return h(
    "section",
    { class: "codex__hidden", "aria-labelledby": "codex-hidden" },
    h("h2", { id: "codex-hidden", class: "codex__hidden-title serif" }, "히든"),
    h(
      "p",
      { class: "muted codex__intro" },
      "Ark에 기록되지 않은 자. 새 기록을 시작할 때 함께 데려갈 수 있고, 드물게 붉은 방에서도 만납니다.",
    ),
    h(
      "ul",
      { class: "codex__cards" },
      cards.map((card) =>
        h(
          "li",
          { "data-key": card.id },
          cardFace(card, { tag: "button", attrs: { "data-action": "open-card", "data-id": card.id } }),
        ),
      ),
    ),
  );
}

function enemiesTab() {
  return h(
    "ol",
    { class: "codex__enemies" },
    ENEMIES.map((enemy) =>
      h(
        "li",
        { class: "codex-enemy", "data-key": enemy.id },
        h("img", {
          class: "codex-enemy__art",
          src: enemyIllustration(enemy.id),
          alt: "",
          width: 200,
          height: 260,
          loading: "lazy",
        }),
        h(
          "p",
          { class: "label muted" },
          `${enemy.act}장 · ${{ normal: "괴물", elite: "정예", boss: "보스" }[enemy.tier]} · ${enemy.origin}`,
        ),
        h(
          "h2",
          { class: "codex-enemy__name" },
          h(
            "span",
            { class: "display fit", lang: "en", "aria-hidden": "true", style: { "--len": enemy.nameEn.length } },
            enemy.nameEn,
          ),
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

function armamentsTab() {
  const hidden = HIDDEN_ARMAMENTS;
  return [
    h(
      "p",
      { class: "codex__intro muted" },
      "신화 속 무구는 전투에서 에너지를 써서 직접 휘두르고, 쓰고 나면 몇 턴 쉬어야 합니다. 주인 신의 카드를 낸 턴에 쓰면 더 강해집니다. 이야기와 생김새는 위키백과와 나무위키를 참고했습니다.",
    ),
    h(
      "ul",
      { class: "codex__arms" },
      [...ARMAMENTS, ...hidden].map((arm) =>
        h("li", { "data-key": arm.id }, armamentCard(arm, { heading: "h2", full: true })),
      ),
    ),
  ];
}

function factionsTab() {
  const rows = PANTHEONS.map((p) => ({ p, f: factionOf(p.slug), count: figuresOf(p.slug).length }));
  return [
    h(
      "p",
      { class: "codex__intro muted" },
      `같은 신화 계열의 신을 덱에 ${TIERS[0]}장 모으면 1단계, ${TIERS[1]}장 모으면 2단계 세력의 힘이 전투에 붙습니다. 신이 많은 계열은 고유한 세력을, 나머지는 신화권의 공통 세력을 갖습니다.`,
    ),
    h(
      "div",
      { class: "guide__table-wrap", role: "region", "aria-labelledby": "faction-caption", tabindex: "0" },
      h(
        "table",
        { class: "codex__table" },
        h("caption", { id: "faction-caption" }, `신화 계열 ${PANTHEONS.length}개의 세력`),
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { scope: "col" }, "신화 계열"),
            h("th", { scope: "col" }, "세력"),
            h("th", { scope: "col" }, `${TIERS[0]}장`),
            h("th", { scope: "col" }, `${TIERS[1]}장`),
            h("th", { scope: "col" }, "신과 영웅"),
          ),
        ),
        h(
          "tbody",
          null,
          rows.map(({ p, f, count }) =>
            h(
              "tr",
              { "data-key": p.slug },
              h("th", { scope: "row" }, p.name),
              h("td", null, h("strong", null, f.title), h("br"), h("span", { class: "muted" }, f.motto)),
              h("td", null, describePerk(f.perk, f.values[0])),
              h("td", null, describePerk(f.perk, f.values[1])),
              h("td", null, `${count}명`),
            ),
          ),
        ),
      ),
    ),
  ];
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
        HAS_LEGENDS
          ? "Ark에 기록된 신과 영웅, 그리고 ZERO가 더한 전설의 영웅이 카드가 되었습니다. 카드를 누르면 소개와 함께 Ark 또는 위키백과로 이어집니다."
          : "Ark에 기록된 신과 영웅, 아서왕 전설과 천일야화의 인물이 모두 카드가 되었습니다. 카드를 누르면 소개와 함께 Ark로 이어집니다.",
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
      tab === "cards"
        ? cardsTab(ctx)
        : tab === "enemies"
          ? enemiesTab()
          : tab === "armaments"
            ? armamentsTab()
            : tab === "factions"
              ? factionsTab()
              : relicsTab(),
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
    "seen-only": (ctx) => ctx.setUi({ seenOnly: !ctx.ui.seenOnly }),
    source: (ctx, el) => ctx.setUi({ source: el.dataset.value }),
    "open-card": (ctx, el) => ctx.openCard(/** @type {string} */ (el.dataset.id)),
  },
  inputs: {
    query: (ctx, el) => ctx.setUi({ query: el.value }),
  },
};
