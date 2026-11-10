import { drawScene, illustrationUrl } from "#shared/ui/illustration/index.js";

import { getEnemy } from "../model/enemies.js";
import { monsterSpec } from "../model/portrait.js";

/** 괴물 그림의 data URL @param {string} id */
export function enemyIllustration(id) {
  const def = getEnemy(id);
  return illustrationUrl(`enemy:${id}`, () => drawScene(monsterSpec(id, def.tier)));
}
