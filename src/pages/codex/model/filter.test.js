import { describe, expect, it } from "vitest";

import { FIGURE_CARDS } from "#entities/card/index.js";

import { filterCards } from "./filter.js";

describe("filterCards", () => {
  it("영역으로 찾습니다", () => {
    const ids = filterCards(FIGURE_CARDS, { query: "번개" }).map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["zeus", "perun"]));
    expect(filterCards(FIGURE_CARDS, { query: "천둥" }).map((c) => c.id)).toContain("thor");
  });

  it("영문 이름은 대소문자를 가리지 않습니다", () => {
    expect(filterCards(FIGURE_CARDS, { query: "ODIN" }).map((c) => c.id)).toContain("odin");
  });

  it("출처로 거릅니다", () => {
    const cards = [...FIGURE_CARDS, { ...FIGURE_CARDS[0], id: "legend-only", source: /** @type {const} */ ("zero") }];
    expect(filterCards(cards, { source: "zero" }).map((c) => c.id)).toEqual(["legend-only"]);
    expect(filterCards(cards, { source: "ark" }).map((c) => c.id)).not.toContain("legend-only");
  });

  it("복원한 신만 볼 수 있습니다", () => {
    const cards = filterCards(FIGURE_CARDS, { seenOnly: true, seen: ["zeus", "odin"] });
    expect(cards.map((c) => c.id).sort()).toEqual(["odin", "zeus"]);
  });

  it("대륙과 속성으로 거릅니다", () => {
    const cards = filterCards(FIGURE_CARDS, { continent: "oceania", aspect: "all" });
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.continent === "oceania")).toBe(true);
    const war = filterCards(FIGURE_CARDS, { aspect: "war" });
    expect(war.every((c) => c.aspect === "war" || c.secondary === "war")).toBe(true);
  });
});
