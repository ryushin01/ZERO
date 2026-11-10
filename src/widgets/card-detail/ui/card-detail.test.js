import { describe, expect, it } from "vitest";

import { cardDetail } from "./card-detail.js";

describe("cardDetail", () => {
  it("Ark의 신 상세로 새 창 링크를 걸고 새 창임을 알립니다", () => {
    const el = cardDetail("odin");
    const link = el.querySelector("a[href='https://ark-ryushin01.vercel.app/figures/odin']");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.textContent).toContain("(새 창)");
  });

  it("자료 그림에는 Ark의 대체 텍스트와 출처를 붙입니다", () => {
    const el = cardDetail("odin");
    expect(el.querySelector("img")?.getAttribute("alt")).toBeTruthy();
    expect(el.querySelector("figcaption")?.textContent).toContain("Wikimedia Commons");
  });

  it("천적인 괴물을 알려 줍니다", () => {
    expect(cardDetail("heracles").textContent).toContain("히드라에게 피해 50% 증가");
  });
});
