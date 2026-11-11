import { h } from "#shared/lib/index.js";

import { battlefieldIllustration } from "../lib/illustration.js";
import { describeField, REALMS } from "../model/battlefields.js";

import "./battlefield-card.css";

/**
 * 전장 한 곳: 풍경, 영역, 이름, 전장 효과, 소개와 출처
 * @param {import("../model/battlefields.js").Battlefield} field
 * @param {{ heading?: "h2" | "h3", compact?: boolean, pantheonNames?: string[] }} [options]
 */
export function battlefieldCard(field, { heading = "h2", compact = false, pantheonNames = [] } = {}) {
  const realm = REALMS[field.realm];
  return h(
    "article",
    { class: ["battlefield", compact && "battlefield--compact"] },
    h("img", { class: "battlefield__art", src: battlefieldIllustration(field), alt: "", width: 200, height: 260 }),
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
      compact
        ? null
        : h(
            "p",
            { class: "label muted battlefield__source" },
            "참고 ",
            h(
              "a",
              { href: field.source, target: "_blank", rel: "noopener" },
              "위키백과",
              h("span", { class: "sr-only" }, " (새 창)"),
            ),
          ),
    ),
  );
}
