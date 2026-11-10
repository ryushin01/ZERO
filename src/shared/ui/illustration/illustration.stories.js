import { drawArmament, drawScene, illustrationUrl } from "./index.js";

/** 일러스트 그리기 엔진: 몸 형태·머리·지물·배경을 바꿔 봅니다. */
export default {
  title: "shared/Illustration",
  parameters: { layout: "centered" },
  args: {
    form: "figure",
    body: "warrior",
    head: "helm",
    item: "spear",
    pose: "raise",
    motif: "columns",
    glow: "#ff7a3a",
    legend: true,
    thunder: false,
  },
  argTypes: {
    form: {
      control: "select",
      options: ["figure", "serpent", "naga", "bird", "beast", "rider", "stone", "moai", "pair", "head", "void"],
    },
    body: { control: "select", options: ["warrior", "robed", "gown", "giant", "demon", "hag"] },
    head: {
      control: "select",
      options: [
        "bare",
        "helm",
        "crown",
        "horned",
        "antlers",
        "jackal",
        "falcon",
        "ibis",
        "elephant",
        "sun",
        "moon",
        "feathers",
        "demon",
      ],
    },
    item: {
      control: "select",
      options: ["spear", "sword", "hammer", "bolt", "trident", "staff", "chakra", "lyre", "scroll", "torch", "orb"],
    },
    pose: { control: "inline-radio", options: ["raise", "thrust", "hold", "cast", "rest"] },
    motif: {
      control: "select",
      options: [
        "columns",
        "mountains",
        "stones",
        "pyramid",
        "ziggurat",
        "temple",
        "pagoda",
        "steps",
        "baobab",
        "waves",
        "totem",
      ],
    },
    glow: { control: "color" },
  },
  render: ({ form, body, head, item, pose, motif, glow, legend, thunder }) => {
    const img = document.createElement("img");
    img.width = 300;
    img.alt = "일러스트 예시";
    const svg = drawScene({
      id: `story-${form}-${body}-${head}`,
      form,
      motif,
      sky: ["#081c1d", "#1f5650"],
      glow,
      skin: "#c9a27e",
      cloth: "#8a2a1e",
      metal: "#c9a24a",
      legend,
      thunder,
      scale: 1.08,
      figure: { body, head, item, pose, beard: true, hair: "#2a1a10", cape: true },
      creature: { heads: 3, beast: "wolf", bird: "falcon" },
    });
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return img;
  },
};

export const Figure = {};
export const Serpent = { args: { form: "serpent", glow: "#b8f08a" } };
export const Beast = { args: { form: "beast", motif: "mountains", glow: "#9fd4ff" } };

/** 무구 한 점 */
export const Armament = {
  render: () => {
    const img = document.createElement("img");
    img.width = 300;
    img.alt = "묠니르 그림 예시";
    img.src = illustrationUrl("story-arm", () =>
      drawArmament({
        id: "story",
        item: "hammer",
        sky: ["#08121c", "#2a4660"],
        glow: "#fff0b0",
        metal: "#a9b4bd",
        cloth: "#5a4632",
      }),
    );
    return img;
  },
};
