import { siteHeader } from "./site-header.js";

export default {
  title: "widgets/SiteHeader",
  parameters: { layout: "fullscreen" },
  args: { route: "run", context: "1장 · 지상의 경계 — 체력 72/72", deckCount: 11 },
  render: (args) => {
    const header = document.createElement("header");
    header.className = "site-header";
    header.style.position = "static";
    header.append(...siteHeader(args));
    return header;
  },
};

export const InRun = {};
export const Codex = { args: { route: "codex", context: "도감", deckCount: null }, parameters: { surface: "light" } };
