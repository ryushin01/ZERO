import { h } from "#shared/lib/index.js";

import "./site-header.css";

/**
 * 고정 머리글. 왼쪽 로고, 가운데 지금 위치, 오른쪽 메뉴의 세 칸 구성입니다.
 * @param {{ route: string, context: string, deckCount: number | null }} props
 */
export function siteHeader({ route, context, deckCount }) {
  const link = (href, name, label) =>
    h("li", null, h("a", { href, class: "site-header__link", "aria-current": route === name ? "page" : null }, label));

  return [
    h(
      "a",
      { href: "#/", class: "site-header__brand" },
      h("span", { class: "sr-only" }, "ZERO 처음 화면"),
      // 로고는 장식이고, 링크의 이름은 위의 숨은 글자(ZERO 처음 화면)가 맡습니다.
      h("img", { class: "site-header__logo", src: "/logo.png", alt: "", width: 44, height: 96 }),
    ),
    h("p", { class: "site-header__context label" }, context),
    h(
      "nav",
      { class: "site-header__nav", "aria-label": "주 메뉴" },
      h(
        "ul",
        null,
        deckCount !== null
          ? h(
              "li",
              null,
              h(
                "button",
                { type: "button", class: "site-header__link", "data-action": "open-deck" },
                `덱 ${deckCount}장`,
              ),
            )
          : null,
        link("#/codex", "codex", "도감"),
        link("#/guide", "guide", "도움말"),
      ),
    ),
  ];
}
