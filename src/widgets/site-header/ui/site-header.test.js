import { describe, expect, it } from "vitest";

import { siteHeader } from "./site-header.js";

describe("siteHeader", () => {
  it("지금 화면의 메뉴에 aria-current를 붙입니다", () => {
    const nodes = siteHeader({ route: "codex", context: "도감", deckCount: null });
    const nav = nodes.find((n) => n.tagName === "NAV");
    expect(nav.querySelector("[aria-current='page']")?.textContent).toBe("도감");
  });

  it("진행 중인 판에서만 덱 버튼을 보여 줍니다", () => {
    const withDeck = siteHeader({ route: "run", context: "", deckCount: 12 });
    expect(withDeck.find((n) => n.tagName === "NAV").querySelector("[data-action='open-deck']")?.textContent).toBe(
      "덱 12장",
    );
    const without = siteHeader({ route: "title", context: "", deckCount: null });
    expect(without.find((n) => n.tagName === "NAV").querySelector("[data-action='open-deck']")).toBeNull();
  });
});
