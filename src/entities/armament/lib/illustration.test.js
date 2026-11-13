import { describe, expect, it } from "vitest";

import { ARMAMENTS, HIDDEN_ARMAMENTS } from "../model/armaments.js";
import { armamentArt } from "./illustration.js";

describe("armamentArt", () => {
  it("히든 무구까지 무구마다 그림이 있습니다", () => {
    const all = [...ARMAMENTS, ...HIDDEN_ARMAMENTS];
    expect(all.filter((arm) => !armamentArt(arm)).map((arm) => arm.id)).toEqual([]);
  });
});
