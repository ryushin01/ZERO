/**
 * 히든 카드. 도감과 보상에 나오지 않고, 드물게 열리는 사건 ‘붉은 방’에서만 얻습니다.
 * 밸런스를 일부러 깨는 카드이므로 신 카드(FIGURE_CARDS)와 서가 복원 진행도에 넣지 않습니다.
 *
 * @typedef {import("./build.js").CardDef} CardDef
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

/**
 * 히든 카드의 그림. 코드로 그리지 않고, 그린 분의 허락을 받은 그림을 그대로 씁니다.
 * @type {Record<string, { src: string, width: number, height: number, position: string, alt: string, credit: string }>}
 */
export const HIDDEN_ART = {
  yushin: {
    src: "/art/hidden/yushin.jpg",
    width: 462,
    height: 600,
    position: "50% 22%",
    alt: "붉은 배경 앞에서 눈을 감고 허리에 손을 얹은 유신. 긴 검은 머리가 한쪽 눈을 가리고, 흰 동정과 고름이 달린 검은 도포를 입었습니다.",
    credit: "허락을 받아 실은 그림",
  },
};
