import { h } from "#shared/lib/index.js";

import { battlefieldArt } from "../lib/illustration.js";
import { describeField, REALMS } from "../model/battlefields.js";

import "./battlefield-card.css";

/**
 * 전장 한 곳: 풍경, 영역, 이름, 전장 효과, 소개
 * 소개에 참고한 글(source)은 화면 대신 README의 출처(docs/credits.md)에 적습니다.
 * @param {import("../model/battlefields.js").Battlefield} field
 * @param {{ heading?: "h2" | "h3", compact?: boolean, pantheonNames?: string[] }} [options]
 */
export function battlefieldCard(field, { heading = "h2", compact = false, pantheonNames = [] } = {}) {
  const realm = REALMS[field.realm];
  return h(
    "article",
    { class: ["battlefield", compact && "battlefield--compact"] },
    h("img", { ...battlefieldArt(field, { sizes: "200px" }), class: "battlefield__art", alt: "" }),
    h(
      "div",
      { class: "battlefield__body" },
      h("p", { class: "label muted" }, `전장 · ${realm.label}`),
      h(heading, { class: "battlefield__name" }, field.name),
      h("p", { class: "battlefield__en display", lang: "en" }, field.nameEn),
      h("p", { class: "battlefield__effect" }, describeField(field)),
      pantheonNames.length
        ? h(
            "p",
            { class: "battlefield__terrain muted" },
            `지형 공명: ${pantheonNames.join(", ")} 카드의 피해·방어·회복·침식 25% 증가`,
          )
        : null,
      compact ? null : h("p", { class: "battlefield__summary" }, field.summary),
    ),
  );
}
