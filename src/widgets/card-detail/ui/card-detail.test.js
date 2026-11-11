import { describe, expect, it } from "vitest";

import { getCard } from "#entities/card/index.js";

import { cardDetail } from "./card-detail.js";

describe("cardDetail", () => {
  it("Ark의 신 상세로 새 창 링크를 걸고 새 창임을 알립니다", () => {
    const el = cardDetail("odin");
    const link = el.querySelector("a[href='https://ark-ryushin01.vercel.app/figures/odin']");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.textContent).toContain("(새 창)");
  });

  it("새 일러스트에 대체 텍스트를 붙이고, Ark 소장 자료는 출처와 함께 보여 줍니다", () => {
    const el = cardDetail("odin");
    expect(el.querySelector(".card-detail__illust")?.getAttribute("alt")).toContain("오딘의 일러스트");
    const source = el.querySelector(".card-detail__source");
    expect(source?.textContent).toContain("Ark 소장 자료");
    expect(source?.querySelector("img")?.getAttribute("alt")).toBeTruthy();
    expect(source?.textContent).toContain("Wikimedia Commons");
  });

  it("세력과 주인 신의 무구를 보여 줍니다", () => {
    const el = cardDetail("thor");
    expect(el.textContent).toContain("아스가르드");
    expect(el.querySelector(".card-detail__arms")?.textContent).toContain("묠니르");
  });

  it("천적인 괴물을 알려 줍니다", () => {
    expect(cardDetail("heracles").textContent).toContain("히드라에게 피해 50% 증가");
  });

  it("Ark로 옮겨 간 전설의 영웅은 Ark로 잇고, 희귀도는 전설 확장의 것을 따릅니다", () => {
    const el = cardDetail("king-arthur");
    expect(el.textContent).not.toContain("ZERO 전설 확장");
    expect(el.querySelector("a[href$='/figures/king-arthur']")?.textContent).toContain("Ark에서 아서 왕 읽기");
    expect(el.querySelector(".card-detail__arms")?.textContent).toContain("엑스칼리버");
    expect(getCard("achilles").rarity).toBe("legend");
  });

  it("저작자를 알 수 없는 소장 자료는 null 대신 라이선스부터 적습니다", () => {
    const el = cardDetail("loki");
    expect(el.querySelector(".card-detail__source")?.textContent).not.toContain("null");
  });
});
