import { describe, expect, it } from "vitest";

import figureData from "../data/figures.json" with { type: "json" };
import legendData from "../data/legends.json" with { type: "json" };

import { FIGURES, getFigure } from "./figures.js";

describe("신과 영웅", () => {
  it("전설 확장의 인물은 한 번씩만 들어가고, Ark에 있으면 Ark의 기록을 따릅니다", () => {
    const ark = new Set(figureData.map((f) => f.slug));
    for (const legend of legendData.figures) {
      const found = FIGURES.filter((f) => f.slug === legend.slug);
      expect(found, legend.slug).toHaveLength(1);
      expect(found[0].source).toBe(ark.has(legend.slug) ? "ark" : "zero");
      expect(found[0].rarity).toBe(legend.rarity);
    }
  });

  it("Ark로 옮겨 간 아킬레우스는 전설 희귀도를 지킵니다", () => {
    expect(getFigure("achilles")).toMatchObject({ source: "ark", rarity: "legend" });
  });
});
