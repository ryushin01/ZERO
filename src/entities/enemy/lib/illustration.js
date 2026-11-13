import { artworkAttrs } from "#shared/ui/artwork/index.js";

/**
 * 괴물 그림의 img 속성. 신화 속 그 괴물을 그린 옛 그림입니다.
 * @param {string} id
 * @param {{ sizes?: string, eager?: boolean }} [options]
 */
export const enemyArt = (id, options) => artworkAttrs(`enemy:${id}`, options);
