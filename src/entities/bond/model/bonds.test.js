import { describe, expect, it } from "vitest";

import arkBonds from "../data/bonds.json" with { type: "json" };

import { bondEffects, BONDS, PARTNERS } from "./bonds.js";

describe("결속", () => {
  it("Ark의 짝마다 ZERO의 효과가 있습니다", () => {
    expect(BONDS).toHaveLength(arkBonds.length);
    expect(BONDS.find((b) => b.rider === "odin" && b.partner === "sleipnir")).toMatchObject({
      relation: "mount",
      costDelta: -1,
    });
  });

  it("Ark의 짝은 모두 끼울 수 있는 탈것·동반자이고, 관계도 같습니다", () => {
    for (const bond of arkBonds) {
      const partner = PARTNERS.find((p) => p.slug === bond.partner);
      expect(partner?.relation, bond.partner).toBe(bond.relation);
    }
  });

  it("짝이 아니면 탈것·동반자의 키워드를 씁니다", () => {
    expect(bondEffects("thor", "sleipnir")).toMatchObject({ title: "선제", innate: true, costDelta: 0 });
  });
});
