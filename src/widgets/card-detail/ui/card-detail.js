import { ASPECTS, cardFace, getCard, KEYWORDS } from "#entities/card/index.js";
import { ENEMIES, isNemesis } from "#entities/enemy/index.js";
import { CONTINENT_LABEL, getArt, getPantheon } from "#entities/figure/index.js";
import { arkFigureUrl, arkPantheonUrl } from "#shared/config/index.js";
import { h } from "#shared/lib/index.js";
import { openDialog } from "#shared/ui/index.js";

import "./card-detail.css";

/** @param {string} href @param {string} label */
const external = (href, label) =>
  h(
    "a",
    { href, target: "_blank", rel: "noopener", class: "card-detail__link" },
    label,
    h("span", { class: "sr-only" }, " (새 창)"),
    h("span", { "aria-hidden": "true" }, " ↗"),
  );

/**
 * 카드 한 장의 자세한 정보. Ark의 소개와 자료, 출처를 함께 보여 줍니다.
 * @param {string} cardId
 */
export function cardDetail(cardId) {
  const card = getCard(cardId);
  const upgraded = getCard(cardId, true);
  const pantheon = card.pantheonSlug ? getPantheon(card.pantheonSlug) : null;
  const art = card.figureSlug ? getArt(card.figureSlug) : undefined;
  const nemesisOf = ENEMIES.filter((enemy) => isNemesis(enemy, card));
  const text = [
    ...card.effects.map((e) => e.op),
    card.retain && "보존",
    card.exhaust && "소멸",
    card.type === "power" && "권능",
  ];
  const terms = KEYWORDS.filter(
    (k) =>
      (k.term === "방어" && text.includes("block")) ||
      (k.term === "힘" && text.includes("strength")) ||
      (k.term === "침식" && text.includes("erosion")) ||
      (k.term === "취약" && text.includes("vulnerable")) ||
      (k.term === "약화" && text.includes("weak")) ||
      text.includes(k.term),
  );

  return h(
    "article",
    { class: "card-detail" },
    h(
      "figure",
      { class: "card-detail__art" },
      art
        ? [
            h("img", { src: art.src, alt: art.alt, loading: "lazy" }),
            h(
              "figcaption",
              { class: "card-detail__credit" },
              h("strong", null, art.title),
              [art.dateLabel, art.holder].filter(Boolean).join(" · "),
              h(
                "span",
                null,
                `${art.credit.artist} · `,
                art.credit.licenseUrl ? external(art.credit.licenseUrl, art.credit.license) : art.credit.license,
                " · ",
                external(art.credit.sourceUrl, "Wikimedia Commons"),
              ),
            ),
          ]
        : h("div", { class: "card-detail__noart" }, cardFace(card, { size: "l" })),
    ),
    h(
      "div",
      { class: "card-detail__info" },
      h(
        "p",
        { class: "label muted" },
        pantheon ? `${pantheon.name} · ${CONTINENT_LABEL[pantheon.continent]}` : "Ark 사서의 카드",
      ),
      h("p", { class: "card-detail__en display", lang: "en" }, card.nameEn),
      h("p", { class: "card-detail__epithet serif" }, card.epithet),
      h("p", { class: "card-detail__summary" }, card.summary),
      card.domains.length
        ? h(
            "dl",
            { class: "card-detail__facts" },
            h("dt", null, "관장 영역"),
            h("dd", null, card.domains.join(", ")),
            h("dt", null, "속성"),
            h(
              "dd",
              null,
              `${ASPECTS[card.aspect].mark} ${ASPECTS[card.aspect].label}`,
              card.secondary ? ` · 보조 ${ASPECTS[card.secondary].mark} ${ASPECTS[card.secondary].label}` : "",
              h("span", { class: "muted" }, ` — ${ASPECTS[card.aspect].summary}`),
            ),
            nemesisOf.length ? h("dt", null, "천적") : null,
            nemesisOf.length ? h("dd", null, `${nemesisOf.map((e) => e.name).join(", ")}에게 피해 50% 증가`) : null,
          )
        : null,
      h(
        "div",
        { class: "card-detail__faces" },
        h("div", null, h("p", { class: "label muted" }, "기본"), cardFace(card)),
        h("div", null, h("p", { class: "label muted" }, "강화"), cardFace(upgraded)),
      ),
      terms.length
        ? h(
            "dl",
            { class: "card-detail__terms" },
            terms.map((k) => [h("dt", null, k.term), h("dd", null, k.text)]),
          )
        : null,
      card.figureSlug
        ? h(
            "p",
            { class: "card-detail__links" },
            external(arkFigureUrl(card.figureSlug), `Ark에서 ${card.name} 읽기`),
            pantheon ? external(arkPantheonUrl(pantheon.slug), `Ark의 ${pantheon.name}`) : null,
          )
        : null,
    ),
  );
}

/** @param {string} cardId */
export function openCardDetail(cardId) {
  const card = getCard(cardId);
  return openDialog({ title: card.name, content: cardDetail(cardId), wide: true });
}
