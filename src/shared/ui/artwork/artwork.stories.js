import { h } from "#shared/lib/index.js";

import artworks from "./artworks.json" with { type: "json" };
import { artworkAttrs } from "./index.js";

const KEYS = Object.keys(artworks);

export default {
  title: "shared/Artwork",
  args: { key: "figure:odin", ratio: "1.54 / 1" },
  argTypes: {
    key: { control: "select", options: KEYS },
    ratio: { control: "inline-radio", options: ["1.54 / 1", "200 / 260", "4 / 3"] },
  },
  /** 카드(가로로 넓은 칸)·무구(세로 칸)·전장(4:3)처럼 잘라 볼 때 초점이 칸 안에 들어오는지 봅니다. */
  render: ({ key, ratio }) =>
    h(
      "figure",
      { style: { margin: "0", display: "grid", gap: "8px", width: "320px" } },
      h("img", {
        ...artworkAttrs(key, { sizes: "320px", eager: true }),
        alt: "",
        style: {
          width: "100%",
          height: "auto",
          "aspect-ratio": ratio,
          "object-fit": "cover",
          "object-position": artworks[key][2],
        },
      }),
      h("figcaption", { class: "label" }, `${key} · 초점 ${artworks[key][2]}`),
    ),
};

/** 신 카드 */
export const Figure = {};

/** 괴물 */
export const Enemy = { args: { key: "enemy:hydra" } };

/** 전장 */
export const Field = { args: { key: "field:avalon", ratio: "4 / 3" } };

/** 무구 */
export const Armament = { args: { key: "arm:mjolnir", ratio: "200 / 260" } };
