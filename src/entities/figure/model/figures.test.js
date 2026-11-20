import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import figureData from "../data/figures.json" with { type: "json" };
import summaries from "../data/summaries.json" with { type: "json" };

/** 전설 확장 원본(게임에는 pnpm legends가 고른 것만 들어감). 테스트는 저장소 맨 위에서 돕니다. */
const legendData = JSON.parse(readFileSync(join(process.cwd(), "scripts/legends/legends.json"), "utf8"));

import { FIGURES, getFigure, getSummary, loadSummaries } from "./figures.js";
import { PANTHEON_REGION } from "./regions.js";

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

  it("Ark 인물의 소개는 첫 화면 묶음 밖의 파일에 따로 두고, 받은 뒤에 꺼내 씁니다", async () => {
    for (const figure of figureData) {
      expect(figure, figure.slug).not.toHaveProperty("summary");
      expect(/** @type {Record<string, string>} */ (summaries)[figure.slug], figure.slug).toBeTruthy();
    }
    expect(getSummary("zeus")).toBeUndefined();
    await loadSummaries();
    expect(getSummary("zeus")).toBe(summaries.zeus);
  });

  it("Ark의 신화 계열은 모두 신화권이 정해져 있습니다 (세력 효과의 기본값)", () => {
    const missing = [...new Set(FIGURES.map((f) => f.pantheonSlug))].filter((slug) => !PANTHEON_REGION[slug]);
    expect(missing).toEqual([]);
  });
});
