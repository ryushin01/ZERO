import { getRelic, RELICS } from "../model/relics.js";

import { relicCard } from "./relic-card.js";

export default {
  title: "entities/relic/RelicCard",
  parameters: { surface: "light" },
  args: { id: "ariadne", owned: false },
  argTypes: {
    id: { control: "select", options: RELICS.map((r) => r.id) },
  },
  render: ({ id, owned }) => {
    const wrap = document.createElement("div");
    wrap.style.width = "280px";
    wrap.append(relicCard(getRelic(id), { owned }));
    return wrap;
  },
};

export const Default = {};
export const Owned = { args: { id: "golden-apple", owned: true } };
