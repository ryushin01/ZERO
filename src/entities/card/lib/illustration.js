import { artworkAttrs, fileAttrs } from "#shared/ui/artwork/index.js";

import { HIDDEN_ART } from "../model/hidden.js";

/**
 * 카드 그림의 img 속성. 신·영웅·괴물 카드는 그 인물을 그린 옛 그림을, 사서의 기본 카드는 책과 펜의 정물화를 씁니다.
 * 히든 카드는 허락을 받아 실은 그림 파일을 씁니다.
 * @param {import("../model/build.js").CardDef} card
 * @param {{ sizes?: string, eager?: boolean }} [options]
 * @returns {import("#shared/ui/artwork/index.js").ArtworkAttrs}
 */
export function cardArt(card, options) {
  const hidden = HIDDEN_ART[card.id];
  if (hidden) return fileAttrs(hidden, options);
  const key = card.figureSlug ? `figure:${card.figureSlug}` : `card:${card.id}`;
  // 그림이 아직 없는 새 카드(예: Ark 동기화로 막 늘어난 신)는 서가 그림으로 둡니다.
  return artworkAttrs(key, options) ?? artworkAttrs("card:shelf", options);
}
