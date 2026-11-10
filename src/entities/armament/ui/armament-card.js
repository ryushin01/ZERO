import { h } from "#shared/lib/index.js";

import { armamentIllustration } from "../lib/illustration.js";
import { bonusText, describeArmament } from "../model/describe.js";

import "./armament-card.css";

/**
 * 무구 한 점. 도감에서는 이야기와 출처까지, 보상·지도에서는 효과까지 보여 줍니다.
 * @param {import("../model/armaments.js").ArmamentDef} arm
 * @param {{ heading?: "h2" | "h3", full?: boolean, footer?: Node | null }} [options]
 */
export function armamentCard(arm, { heading = "h3", full = false, footer = null } = {}) {
  return h(
    "article",
    { class: ["armament", full && "armament--full"] },
    h("img", {
      class: "armament__art",
      src: armamentIllustration(arm),
      alt: "",
      width: 200,
      height: 260,
      decoding: "async",
    }),
    h(
      "div",
      { class: "armament__body" },
      h("p", { class: "label muted" }, `${arm.owner}의 무구`),
      h(heading, { class: "armament__name" }, arm.name),
      h("p", { class: "armament__cost label" }, `에너지 ${arm.cost} · 쓰고 나면 ${arm.cooldown}턴 쉼`),
      h("p", { class: "armament__effect" }, describeArmament(arm).join(". ")),
      h("p", { class: "armament__bonus muted" }, bonusText(arm)),
      full ? h("p", { class: "armament__lore" }, arm.lore) : null,
      full
        ? h(
            "p",
            { class: "armament__sources label" },
            "참고 ",
            arm.sources.map((url, i) => [
              i ? " · " : "",
              h(
                "a",
                { href: url, target: "_blank", rel: "noopener" },
                url.includes("namu.wiki") ? "나무위키" : url.includes("en.wikipedia") ? "영어 위키백과" : "위키백과",
                h("span", { class: "sr-only" }, " (새 창)"),
              ),
            ]),
          )
        : null,
      footer,
    ),
  );
}
