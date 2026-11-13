import { artworkAttrs } from "#shared/ui/artwork/index.js";

/**
 * 무구 그림의 img 속성. 무구를 든 주인이나 무구가 나오는 장면을 그린 옛 그림입니다.
 * @param {import("../model/armaments.js").ArmamentDef} arm
 * @param {{ sizes?: string, eager?: boolean }} [options]
 */
export const armamentArt = (arm, options) => artworkAttrs(`arm:${arm.id}`, options);
