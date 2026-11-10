/**
 * 히든 카드. 도감과 보상에 나오지 않고, 드물게 열리는 사건 ‘붉은 방’에서만 얻습니다.
 * 밸런스를 일부러 깨는 카드이므로 신 카드(FIGURE_CARDS)와 서가 복원 진행도에 넣지 않습니다.
 *
 * @typedef {import("./build.js").CardDef} CardDef
 * @typedef {import("#shared/ui/illustration/index.js").SceneSpec} SceneSpec
 */

/** @type {CardDef[]} */
export const HIDDEN_CARDS = [
  {
    id: "yushin",
    figureSlug: "yushin",
    pantheonSlug: null,
    continent: null,
    name: "유신",
    nameEn: "Yushin",
    epithet: "영혼의 검을 쥔 검은 도포",
    summary:
      "Ark 어디에도 기록되지 않은 검객입니다. 붉은 방에서만 모습을 드러내고, 한 번 베면 적의 무리가 함께 쓰러집니다.",
    domains: ["검", "영혼"],
    rarity: "hidden",
    type: "attack",
    aspect: "war",
    secondary: "doom",
    cost: 0,
    effects: [
      { op: "damage", value: 15, times: 2, all: true },
      { op: "strength", value: 2 },
    ],
    exhaust: false,
    retain: true,
    target: "none",
    upgraded: false,
    source: "hidden",
    wiki: null,
  },
];

/** 히든 카드의 그림 사양: 붉은 배경에 긴 검은 머리, 흰 동정과 고름의 검은 도포, 허리에 얹은 손 */
/** @type {Record<string, SceneSpec>} */
export const HIDDEN_SCENES = {
  yushin: {
    id: "yushin",
    form: "figure",
    motif: "none",
    sky: ["#1a0304", "#a3161a"],
    glow: "#f4efe0",
    skin: "#efe4d8",
    cloth: "#232227",
    metal: "#d9b25a",
    dark: "#08070a",
    legend: false,
    scale: 1.14,
    figure: {
      body: "robed",
      head: "bare",
      hair: "#0d0c10",
      longHair: true,
      collar: "#f4efe0",
      sleeves: true,
      hipHand: true,
      item: "ssangsudo",
      pose: "ground",
    },
  },
};
