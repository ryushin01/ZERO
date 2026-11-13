import { describe, expect, it } from "vitest";

import { BATTLEFIELDS } from "../model/battlefields.js";
import { battlefieldArt } from "./illustration.js";

describe("battlefieldArt", () => {
  it("전장마다 그림이 있습니다", () => {
    expect(BATTLEFIELDS.filter((field) => !battlefieldArt(field)).map((field) => field.id)).toEqual([]);
  });
});
