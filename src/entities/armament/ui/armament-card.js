import { h } from "#shared/lib/index.js";

import { armamentArt } from "../lib/illustration.js";
import { isOncePerBattle } from "../model/armaments.js";
import { bonusText, describeArmament } from "../model/describe.js";
import { armamentLore, loadArmamentLore } from "../model/lore.js";

import "./armament-card.css";

/** @param {{ lore: string, price: string | null }} story */
const storyParts = (story) => [
  h("p", { class: "armament__lore" }, story.lore),
  story.price ? h("p", { class: "armament__price muted" }, `대가 — ${story.price}`) : null,
];

/**
 * 도감의 무구 이야기. Ark 유물에서 온 무구의 이야기는 첫 화면 묶음에 넣지 않고 따로 받으므로,
 * 아직 받지 않았으면 빈 자리를 두었다가 받은 뒤 채웁니다.
 * @param {import("../model/armaments.js").ArmamentDef} arm
 */
function storySlot(arm) {
  const story = armamentLore(arm);
  if (story) return h("div", { class: "armament__story" }, storyParts(story));
  const slot = h("div", { class: "armament__story" });
  loadArmamentLore()
    .then(() => {
      const loaded = armamentLore(arm);
      if (loaded) slot.replaceChildren(...storyParts(loaded).filter((node) => node !== null));
      else slot.remove();
    })
    // 받지 못하면 이야기 없이 둡니다. (그림과 효과는 그대로)
    .catch(() => slot.remove());
  return slot;
}

/**
 * 무구 한 점. 도감에서는 이야기(Ark 유물이면 대가까지), 보상·지도에서는 효과까지 보여 줍니다.
 * 고증에 참고한 글(sources)은 화면 대신 README의 출처(docs/credits.md)에 적습니다.
 * @param {import("../model/armaments.js").ArmamentDef} arm
 * @param {{ heading?: "h2" | "h3", full?: boolean, footer?: Node | null }} [options]
 */
export function armamentCard(arm, { heading = "h3", full = false, footer = null } = {}) {
  return h(
    "article",
    { class: ["armament", full && "armament--full"] },
    h("img", { ...armamentArt(arm, { sizes: "200px" }), class: "armament__art", alt: "" }),
    h(
      "div",
      { class: "armament__body" },
      h("p", { class: "label muted" }, `${arm.owner}의 무구`),
      h(heading, { class: "armament__name" }, arm.name),
      h(
        "p",
        { class: "armament__cost label" },
        `에너지 ${arm.cost} · ${isOncePerBattle(arm) ? "전투마다 한 번" : `쓰고 나면 ${arm.cooldown}턴 쉼`}`,
      ),
      h("p", { class: "armament__effect" }, describeArmament(arm).join(". ")),
      h("p", { class: "armament__bonus muted" }, bonusText(arm)),
      full ? storySlot(arm) : null,
      footer,
    ),
  );
}
