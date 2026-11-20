import { artworkAttrs } from "#shared/ui/artwork/index.js";

/**
 * 무구 그림의 img 속성. 무구를 든 주인이나 무구가 나오는 장면을 그린 옛 그림입니다.
 * 그림이 아직 없는 무구(Ark에 자료 그림이 없는 유물)는 첫 번째 주인의 카드 그림을, 그것도 없으면 서가 그림을 씁니다.
 * @param {import("../model/armaments.js").ArmamentDef} arm
 * @param {{ sizes?: string, eager?: boolean }} [options]
 */
export const armamentArt = (arm, options) =>
  artworkAttrs(`arm:${arm.id}`, options) ??
  (arm.owners[0] ? artworkAttrs(`figure:${arm.owners[0]}`, options) : null) ??
  artworkAttrs("card:shelf", options);
