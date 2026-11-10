import { describe, expect, it } from "vitest";

import { describePerk, factionOf, factionStatus, perksOf } from "./factions.js";

describe("세력", () => {
  it("신이 많은 계열은 고유한 세력을 가집니다", () => {
    expect(factionOf("korean")).toMatchObject({ name: "한국 신화", title: "홍익인간", perk: "turnHeal" });
    expect(factionOf("norse")).toMatchObject({ title: "아스가르드", perk: "startStrength" });
  });

  it("작은 계열은 신화권의 공통 세력을 씁니다", () => {
    expect(factionOf("baltic")).toMatchObject({ title: "북방의 전사들" });
    expect(factionOf("yoruba")).toMatchObject({ title: "오리샤의 길" });
  });

  it("3장이면 1단계, 5장이면 2단계", () => {
    const status = factionStatus(["korean", "korean", "korean", "norse", "norse", "norse", "norse", "norse", null]);
    expect(status.map((s) => [s.pantheon, s.tier])).toEqual([
      ["norse", 2],
      ["korean", 1],
    ]);
    expect(perksOf(status)).toEqual({ startStrength: 2, turnHeal: 1 });
  });

  it("2장 이하는 효과가 없습니다", () => {
    expect(perksOf(factionStatus(["greek", "greek"]))).toEqual({});
  });

  it("모든 효과를 문장으로 풉니다", () => {
    expect(describePerk("turnHeal", 2)).toBe("매 턴 시작에 체력 2 회복");
  });
});
