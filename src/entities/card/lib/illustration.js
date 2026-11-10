import { getFigure, portraitSpec } from "#entities/figure/@x/card.js";
import { drawArmament, drawScene, illustrationUrl } from "#shared/ui/illustration/index.js";

import { HIDDEN_ART } from "../model/hidden.js";

/**
 * 카드 그림의 data URL. 신은 Ark의 정보로 그린 전신 일러스트, 사서의 기본 카드는 붓과 책장입니다.
 * @param {import("../model/build.js").CardDef} card
 */
export function cardIllustration(card) {
  // 히든 카드는 허락을 받아 실은 그림 파일을 씁니다.
  const hidden = HIDDEN_ART[card.id];
  if (hidden) return hidden.src;
  if (card.figureSlug) {
    const figure = getFigure(card.figureSlug);
    if (figure) {
      return illustrationUrl(`card:${card.id}:${card.aspect}`, () =>
        drawScene(portraitSpec(figure, { aspect: card.aspect, legend: card.rarity === "legend" })),
      );
    }
  }
  return illustrationUrl(`card:${card.id}`, () =>
    drawArmament({
      id: card.id,
      item: card.id === "shelf" ? "book" : "quill",
      sky: ["#0b0806", "#4a3e32"],
      glow: "#e9eae4",
      metal: "#c9a24a",
      // 스케치 화풍에서 먹색에 섞이므로 밝은 색을 줘야 책장이 보입니다.
      cloth: "#e8e2d4",
    }),
  );
}
