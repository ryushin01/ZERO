import { ARMAMENTS, armamentCard, HIDDEN_ARMAMENTS } from "#entities/armament/index.js";
import { ASPECTS, cardFace, cardIllustration, getCard, HIDDEN_ART, KEYWORDS } from "#entities/card/index.js";
import { ENEMIES, isNemesis } from "#entities/enemy/index.js";
import { describePerk, factionOf, TIERS } from "#entities/faction/index.js";
import { CONTINENT_LABEL, getArt, getFigure, getPantheon, kindLabel } from "#entities/figure/index.js";
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
  const faction = card.pantheonSlug ? factionOf(card.pantheonSlug) : null;
  const hiddenArt = HIDDEN_ART[card.id];
  const owned = card.figureSlug
    ? [...ARMAMENTS, ...HIDDEN_ARMAMENTS].filter((a) => a.owners.includes(/** @type {string} */ (card.figureSlug)))
    : [];
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
      "div",
      { class: "card-detail__art" },
      h(
        "figure",
        null,
        h("img", {
          class: "card-detail__illust",
          src: cardIllustration(card),
          alt: hiddenArt?.alt ?? `${card.name}의 일러스트. ${card.epithet}의 모습을 그렸습니다.`,
        }),
        h(
          "figcaption",
          { class: "card-detail__credit" },
          hiddenArt ? `${card.name} 일러스트 · ${hiddenArt.credit}` : "ZERO 일러스트 · 코드로 그린 그림",
        ),
      ),
      art
        ? h(
            "figure",
            { class: "card-detail__source" },
            h("figcaption", { class: "label muted" }, "Ark 소장 자료"),
            h("img", { src: art.src, alt: art.alt, loading: "lazy" }),
            h(
              "p",
              { class: "card-detail__credit" },
              h("strong", null, art.title),
              [art.dateLabel, art.holder].filter(Boolean).join(" · "),
              h(
                "span",
                null,
                // 저작자를 알 수 없는 자료는 이름 없이 라이선스부터 적습니다.
                art.credit.artist ? `${art.credit.artist} · ` : "",
                art.credit.licenseUrl ? external(art.credit.licenseUrl, art.credit.license) : art.credit.license,
                " · ",
                external(art.credit.sourceUrl, "Wikimedia Commons"),
              ),
            ),
          )
        : null,
    ),
    h(
      "div",
      { class: "card-detail__info" },
      h(
        "p",
        { class: "label muted" },
        pantheon
          ? `${pantheon.name} · ${CONTINENT_LABEL[pantheon.continent]} · ${kindLabel(getFigure(/** @type {string} */ (card.figureSlug)) ?? {})}${card.source === "zero" ? " · ZERO 전설 확장" : ""}`
          : card.source === "hidden"
            ? "히든 · Ark에 기록되지 않은 자"
            : "Ark 사서의 카드",
      ),
      h("p", { class: "card-detail__en display fit", lang: "en", style: { "--len": card.nameEn.length } }, card.nameEn),
      h("p", { class: "card-detail__epithet serif" }, card.epithet),
      h("p", { class: "card-detail__summary" }, card.summary),
      // 전설 확장은 Ark의 소개 페이지가 없으므로 소개 문단을 여기서 보여 줍니다.
      card.source === "zero"
        ? (getFigure(/** @type {string} */ (card.figureSlug))?.description ?? []).map((text) =>
            h("p", { class: "card-detail__description" }, text),
          )
        : null,
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
            faction ? h("dt", null, "세력") : null,
            faction
              ? h(
                  "dd",
                  null,
                  `${faction.title} — ${TIERS[0]}장: ${describePerk(faction.perk, faction.values[0])}, ${TIERS[1]}장: ${describePerk(faction.perk, faction.values[1])}`,
                )
              : null,
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
      owned.length
        ? h(
            "section",
            { class: "card-detail__arms", "aria-label": `${card.name}의 무구` },
            h("p", { class: "label muted" }, "이 신의 무구 · 함께 쓰면 강해집니다"),
            owned.map((arm) => armamentCard(arm)),
          )
        : null,
      card.figureSlug && card.source !== "hidden"
        ? h(
            "p",
            { class: "card-detail__links" },
            // Ark에 있는 신은 Ark로, ZERO가 더한 전설의 영웅은 위키백과로 잇습니다.
            card.source === "zero"
              ? card.wiki
                ? external(card.wiki, `위키백과에서 ${card.name} 읽기`)
                : null
              : [
                  external(arkFigureUrl(card.figureSlug), `Ark에서 ${card.name} 읽기`),
                  pantheon ? external(arkPantheonUrl(pantheon.slug), `Ark의 ${pantheon.name}`) : null,
                ],
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
