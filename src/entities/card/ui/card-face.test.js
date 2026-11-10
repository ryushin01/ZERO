import { describe, expect, it } from "vitest";

import { getCard } from "../model/build.js";

import { cardFace } from "./card-face.js";

/** 보이는 글자 중 aria-hidden을 뺀 것 (버튼의 접근 가능한 이름과 같은 순서) */
const nameOf = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, " ").trim();
};

describe("cardFace", () => {
  it("버튼 카드의 이름은 카드 이름으로 시작하고 효과와 비용을 담습니다", () => {
    const el = cardFace(getCard("zeus"), { tag: "button" });
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
    expect(el.hasAttribute("aria-label")).toBe(false);
    expect(nameOf(el)).toMatch(/^제우스그리스 신화 · 권능힘 3 얻기/);
    expect(nameOf(el)).toMatch(/비용 2$/);
  });

  it("버튼 안에는 대화형 요소가 없습니다", () => {
    const el = cardFace(getCard("athena"), { tag: "button", chain: "resonance" });
    expect(el.querySelector("a, button, input, [tabindex]")).toBeNull();
    expect(el.textContent).toContain("공명");
  });

  it("카드 그림은 장식이므로 대체 텍스트를 비웁니다", () => {
    const el = cardFace(getCard("odin"));
    expect(el.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("강화 카드는 이름 뒤에 +를 붙입니다", () => {
    expect(nameOf(cardFace(getCard("quill", true), { tag: "button" }))).toMatch(/^필봉\+/);
  });
});
