import { ARMAMENTS, getArmament, HIDDEN_ARMAMENTS } from "../model/armaments.js";

import { armamentCard } from "./armament-card.js";

export default {
  title: "entities/armament/ArmamentCard",
  parameters: { surface: "light" },
  args: { id: "mjolnir", full: true },
  argTypes: { id: { control: "select", options: [...ARMAMENTS, ...HIDDEN_ARMAMENTS].map((a) => a.id) } },
  render: ({ id, full }) => {
    const wrap = document.createElement("div");
    wrap.style.width = full ? "300px" : "360px";
    wrap.append(armamentCard(getArmament(id), { full }));
    return wrap;
  },
};

/** 도감: 이야기까지 */
export const Full = {};

/** 보상·카드 상세: 효과까지 */
export const Compact = { args: { id: "gungnir", full: false } };

/** 히든 무구: 영혼의 검 */
export const Hidden = { args: { id: "soul-sword" } };
