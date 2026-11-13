import { artworkAttrs } from "#shared/ui/artwork/index.js";

/**
 * 전장 그림의 img 속성. 그 낙원·명계·태초를 그린 옛 그림입니다.
 * @param {import("../model/battlefields.js").Battlefield} field
 * @param {{ sizes?: string, eager?: boolean }} [options]
 */
export const battlefieldArt = (field, options) => artworkAttrs(`field:${field.id}`, options);
