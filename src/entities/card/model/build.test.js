import { describe, expect, it } from "vitest";

import { aspectOf, pickAspects } from "./aspects.js";
import { FIGURES } from "#entities/figure/@x/card.js";

import { BASIC_CARDS, FIGURE_CARDS, getCard } from "./build.js";
import { describeCard } from "./describe.js";

describe("영역과 속성", () => {
  it("표에 있는 영역은 바로 찾습니다", () => {
    expect(aspectOf("번개")).toBe("war");
    expect(aspectOf("지혜")).toBe("wisdom");
    expect(aspectOf("저승")).toBe("doom");
  });

  it("앞에 적힌 영역이 주 속성이 됩니다", () => {
    expect(pickAspects(["지혜", "전쟁의 전략", "공예"])).toMatchObject({ primary: "wisdom", secondary: "war" });
  });
});

describe("신 카드", () => {
  it("Ark의 신과 영웅과 ZERO 전설 확장이 모두 카드가 됩니다", () => {
    expect(FIGURE_CARDS).toHaveLength(FIGURES.length);
    expect(FIGURE_CARDS.filter((c) => c.source === "ark").length).toBeGreaterThanOrEqual(133);
    expect(new Set(FIGURE_CARDS.map((c) => c.id)).size).toBe(FIGURES.length);
  });

  it("모든 카드에 효과가 있고 수치는 양수입니다", () => {
    for (const card of [...BASIC_CARDS, ...FIGURE_CARDS]) {
      expect(card.effects.length, card.id).toBeGreaterThan(0);
      for (const effect of card.effects) expect(effect.value, card.id).toBeGreaterThan(0);
      expect(describeCard(card).join(" "), card.id).not.toMatch(/undefined|NaN/);
    }
  });

  it("적을 겨누는 효과가 있으면 대상을 고르는 카드입니다", () => {
    for (const card of FIGURE_CARDS) {
      const single = card.effects.some((e) => ["damage", "erosion", "vulnerable", "weak"].includes(e.op) && !e.all);
      expect(card.target, card.id).toBe(single ? "enemy" : "none");
    }
  });

  it("제우스는 힘을 얻고 번개로 모든 적을 치는 권능입니다", () => {
    const zeus = getCard("zeus");
    expect(zeus).toMatchObject({ rarity: "legend", type: "power", cost: 2 });
    expect(zeus.effects.map((e) => e.op)).toEqual(["strength", "damage"]);
    expect(zeus.effects[1].all).toBe(true);
  });

  it("속임수의 신은 비용이 0입니다", () => {
    expect(getCard("loki").cost).toBe(0);
  });

  it("강화하면 수치가 오르고 원본은 그대로입니다", () => {
    const base = getCard("quill");
    const up = getCard("quill", true);
    expect(up.effects[0].value).toBeGreaterThan(base.effects[0].value);
    expect(getCard("quill").effects[0].value).toBe(6);
  });

  it("여섯 속성이 모두 쓰입니다", () => {
    const aspects = new Set(FIGURE_CARDS.map((c) => c.aspect));
    expect([...aspects].sort()).toEqual(["doom", "guard", "life", "sky", "war", "wisdom"]);
  });
});
