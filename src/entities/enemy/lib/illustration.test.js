import { describe, expect, it } from "vitest";

import { ENEMIES } from "../model/enemies.js";
import { enemyArt } from "./illustration.js";

describe("enemyArt", () => {
  it("괴물마다 그림이 있습니다", () => {
    expect(ENEMIES.filter((enemy) => !enemyArt(enemy.id)).map((enemy) => enemy.id)).toEqual([]);
  });
});
