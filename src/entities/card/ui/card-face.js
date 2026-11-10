import { getArt, getPantheon } from "#entities/figure/@x/card.js";
import { h } from "#shared/lib/index.js";

import { ASPECTS } from "../model/aspects.js";
import { describeCard, RARITY_LABEL, TYPE_LABEL } from "../model/describe.js";

import "./card-face.css";

/**
 * @typedef {import("../model/build.js").CardDef} CardDef
 * @typedef {{
 *   tag?: "button" | "article" | "div",
 *   lines?: string[],
 *   chain?: "resonance" | "echo" | null,
 *   attrs?: Record<string, any>,
 *   size?: "s" | "m" | "l",
 *   note?: string,
 * }} CardFaceOptions
 */

const CHAIN_LABEL = { resonance: "공명", echo: "울림" };

/**
 * 카드 앞면
 *
 * 버튼일 때는 보이는 글자가 그대로 접근 가능한 이름이 되도록 DOM을 '이름 → 계열 → 효과 → 비용' 순서로 두고,
 * 보이는 자리는 CSS로 옮깁니다. (KWCAG 6.5.3 레이블과 네임)
 * @param {CardDef} card
 * @param {CardFaceOptions} [options]
 */
export function cardFace(card, { tag = "div", lines, chain = null, attrs = {}, size = "m", note } = {}) {
  const keywords = [card.retain && "보존", card.exhaust && "소멸", card.type === "power" && "권능"].filter(Boolean);
  const effectLines = lines ? [...lines, ...keywords] : describeCard(card);
  const art = card.figureSlug ? getArt(card.figureSlug) : undefined;
  const pantheon = card.pantheonSlug ? getPantheon(card.pantheonSlug) : null;
  const aspect = ASPECTS[card.aspect];

  return h(
    tag,
    {
      class: ["card", `card--${card.rarity}`, `card--${size}`, chain && "card--chain"],
      "data-aspect": card.aspect,
      type: tag === "button" ? "button" : null,
      ...attrs,
    },
    h(
      "span",
      { class: "card__body" },
      h("span", { class: "card__name" }, card.name, card.upgraded ? h("span", { class: "card__plus" }, "+") : null),
      h("span", { class: "card__en display", lang: "en", "aria-hidden": "true" }, card.nameEn),
      h("span", { class: "card__meta label" }, pantheon ? pantheon.name : "사서", " · ", TYPE_LABEL[card.type]),
      h(
        "span",
        { class: "card__text" },
        effectLines.map((line) => h("span", { class: "card__line" }, line)),
      ),
      h(
        "span",
        { class: "card__foot label" },
        h("span", { "aria-hidden": "true", class: "card__mark" }, aspect.mark),
        ` ${aspect.label} · ${RARITY_LABEL[card.rarity]}`,
      ),
    ),
    h("span", { class: "card__cost" }, h("span", { class: "sr-only" }, "비용 "), card.cost),
    chain ? h("span", { class: "card__chain label" }, CHAIN_LABEL[chain]) : null,
    note ? h("span", { class: "card__note label" }, note) : null,
    h(
      "span",
      { class: "card__art", "aria-hidden": "true" },
      art
        ? h("img", { src: art.src, alt: "", loading: "lazy", decoding: "async", width: 280, height: 420 })
        : h("span", { class: "card__glyph" }, card.figureSlug ? card.nameEn.charAt(0) : aspect.mark),
    ),
  );
}
