import { h } from "#shared/lib/index.js";

import "./relic-card.css";

/**
 * 유물 한 점
 * @param {import("../model/relics.js").RelicDef} relic
 * @param {{ heading?: "h2" | "h3", owned?: boolean, footer?: Node | null }} [options]
 */
export function relicCard(relic, { heading = "h2", owned = false, footer = null } = {}) {
  return h(
    "article",
    { class: ["relic", owned && "relic--owned"] },
    h("p", { class: "label muted" }, relic.origin),
    h(heading, { class: "relic__name" }, relic.name),
    h("p", null, relic.text),
    h("p", { class: "muted relic__lore" }, relic.lore),
    footer,
  );
}
