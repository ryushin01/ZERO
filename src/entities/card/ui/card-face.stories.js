import { getCard } from "../model/build.js";

import { cardFace } from "./card-face.js";

export default {
  title: "entities/card/CardFace",
  args: { id: "zeus", upgraded: false, tag: "button", size: "m", chain: null, note: "" },
  argTypes: {
    id: {
      control: "select",
      options: ["zeus", "odin", "athena", "heracles", "loki", "osiris", "quill", "shelf", "were-jaguar", "yushin"],
    },
    tag: { control: "inline-radio", options: ["button", "article", "div"] },
    size: { control: "inline-radio", options: ["s", "m", "l"] },
    chain: { control: "inline-radio", options: [null, "resonance", "echo"] },
  },
  render: ({ id, upgraded, tag, size, chain, note }) =>
    cardFace(getCard(id, upgraded), { tag, size, chain, note: note || undefined }),
};

/** 전설: 겹선 테두리 */
export const Legend = {};

/** 일반 카드 */
export const Common = { args: { id: "heracles" } };

/** 그림이 없는 신은 영문 첫 글자를 씁니다 */
export const WithoutArt = { args: { id: "were-jaguar" } };

/** 사서의 기본 카드 */
export const Basic = { args: { id: "quill" } };

/** 직전 카드와 같은 계열이라 공명합니다 */
export const Resonance = { args: { id: "athena", chain: "resonance" } };

/** 천적인 적이 있을 때 */
export const Nemesis = { args: { id: "heracles", note: "천적" } };

/** 강화 */
export const Upgraded = { args: { id: "odin", upgraded: true } };

/** 낼 수 없는 카드 */
export const Disabled = {
  render: () => cardFace(getCard("zeus"), { tag: "button", attrs: { "aria-disabled": "true" } }),
};

/** 밝은 표면 위의 작은 카드 */
export const Small = { args: { id: "isis", size: "s", tag: "div" }, parameters: { surface: "light" } };

/** 히든: 붉은 겹선 테두리 */
export const Hidden = { args: { id: "yushin" } };
