import { describe, expect, it } from "vitest";

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

  it("전설 확장의 인물은 Ark 대신 위키백과로 잇습니다", () => {
    const el = cardDetail("king-arthur");
    expect(el.textContent).toContain("ZERO 전설 확장");
    expect(el.querySelector("a[href^='https://ko.wikipedia.org/']")?.textContent).toContain(
      "위키백과에서 아서 왕 읽기",
    );
    expect(el.querySelector("a[href*='ark-ryushin01']")).toBeNull();
    expect(el.querySelector(".card-detail__arms")?.textContent).toContain("엑스칼리버");
  });
});
