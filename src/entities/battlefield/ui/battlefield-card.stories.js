import { BATTLEFIELDS, getBattlefield } from "../model/battlefields.js";

import { battlefieldCard } from "./battlefield-card.js";

export default {
  title: "entities/battlefield/BattlefieldCard",
  parameters: { surface: "light" },
  args: { id: "valhalla", compact: false },
  argTypes: { id: { control: "select", options: BATTLEFIELDS.map((b) => b.id) } },
  render: ({ id, compact }) => {
    const wrap = document.createElement("div");
    wrap.style.width = compact ? "360px" : "300px";
    wrap.append(battlefieldCard(getBattlefield(id), { compact, pantheonNames: ["북유럽 신화"] }));
    return wrap;
  },
};

/** 도감: 풍경, 효과, 소개와 출처 */
export const Full = {};

/** 지도: 풍경과 효과만 */
export const Compact = { args: { id: "atlantis", compact: true } };

/** 아우터 유니버스 */
export const Outer = { args: { id: "ginnungagap" } };
