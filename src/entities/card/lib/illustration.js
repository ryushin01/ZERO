import { getFigure, portraitSpec } from "#entities/figure/@x/card.js";
import { drawArmament, drawScene, illustrationUrl } from "#shared/ui/illustration/index.js";

import { HIDDEN_SCENES } from "../model/hidden.js";

/**
 * 카드 그림의 data URL. 신은 Ark의 정보로 그린 전신 일러스트, 사서의 기본 카드는 붓과 책장입니다.
 * @param {import("../model/build.js").CardDef} card
 */
export function cardIllustration(card) {
  const hidden = HIDDEN_SCENES[card.id];
  if (hidden) return illustrationUrl(`card:${card.id}`, () => drawScene(hidden));
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
      sky: ["#0b0806", "#2a2420"],
      glow: "#e9eae4",
      metal: "#c9a24a",
      cloth: "#5a4632",
    }),
  );
}
