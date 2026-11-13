import { describe, expect, it } from "vitest";
import { describeCombatEffect } from "./combat-effect.js";

describe("describeCombatEffect", () => {
  it("전장과 세력이 함께 쓰는 효과를 문장으로 쓴다", () => {
    expect(describeCombatEffect("startBlock", 6)).toBe("전투가 시작되면 방어 6");
    expect(describeCombatEffect("firstDraw", 1)).toBe("전투 첫 턴에 카드 1장 더 뽑기");
    expect(describeCombatEffect("endHeal", 3)).toBe("전투가 끝나면 체력 3 회복");
  });

  it("목록에 없는 효과는 null이라 부르는 쪽이 이어서 쓴다", () => {
    expect(describeCombatEffect("tide", 2)).toBeNull();
  });
});
