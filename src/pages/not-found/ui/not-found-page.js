import { h } from "#shared/lib/index.js";

/** @type {import("#app/render/app.js").Page} */
export const notFoundPage = {
  title: () => "찾을 수 없는 페이지",
  surface: () => "dark",
  view: () =>
    h(
      "section",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Nothing here"),
      h("h1", null, "이 기록은 이미 지워졌습니다"),
      h("p", null, "주소가 바뀌었거나 없는 화면입니다."),
      h("a", { href: "#/", class: "button" }, "처음 화면으로"),
    ),
};
