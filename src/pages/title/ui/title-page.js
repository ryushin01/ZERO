import { cardArt, FIGURE_CARDS } from "#entities/card/index.js";
import { ENEMIES } from "#entities/enemy/index.js";
import { FIGURES, PANTHEONS } from "#entities/figure/index.js";
import { RELICS } from "#entities/relic/index.js";
import { h } from "#shared/lib/index.js";

import "./title-page.css";

/** 고리에 놓을 신들: 신화권이 고루 섞이도록 전설 카드를 골라 씁니다. */
const RING = FIGURE_CARDS.filter((c) => c.rarity === "legend").slice(0, 18);

/** 자리마다 크기를 조금씩 달리합니다 (고정값) */
const SIZES = [120, 96, 140, 104, 128, 92, 150, 112, 100, 136, 118, 90, 146, 108, 124, 98, 132, 114];

/** @param {import("#app/render/app.js").PageContext} ctx */
function view(ctx) {
  const { run, records, settings } = ctx;
  const resumable = run && run.phase !== "victory" && run.phase !== "defeat";
  const motionOn = settings.motion === "on";

  return h(
    "section",
    { class: "title" },
    h(
      "div",
      { class: "title__stage" },
      h(
        "div",
        { class: "title__ring", "aria-hidden": "true", "data-morph": "skip" },
        RING.map((card, index) => {
          return h(
            "figure",
            {
              class: "title__tile",
              style: {
                "--w": `${SIZES[index % SIZES.length]}px`,
                "--i": index,
                "--n": RING.length,
              },
            },
            h("img", { ...cardArt(card, { sizes: `${SIZES[index % SIZES.length]}px`, eager: true }), alt: "" }),
            h("figcaption", { class: "label" }, card.nameEn),
          );
        }),
      ),
      h(
        "div",
        { class: "title__center" },
        h(
          "h1",
          { class: "title__heading" },
          h("span", { class: "display" }, "Zero"),
          h("span", { class: "sr-only" }, " — 신화 덱빌딩"),
        ),
        h(
          "p",
          { class: "title__tagline" },
          h("span", { class: "display", lang: "en" }, "Every myth returns to zero, unless it is remembered."),
          h("span", { class: "serif" }, "기억하지 않으면, 모든 신화는 영(零)으로 돌아갑니다."),
        ),
        h(
          "div",
          { class: "actions" },
          resumable
            ? h(
                "a",
                { href: "#/run", class: "button button--solid" },
                "이어 하기",
                h("span", { class: "label" }, `${run.act}장 · ${run.stats.floors}층`),
              )
            : null,
          h("a", { href: "#/new", class: ["button", !resumable && "button--solid"] }, "새 기록 시작"),
          h("a", { href: "#/new/daily", class: "button" }, "오늘의 신화"),
          h("a", { href: "#/duel", class: "button" }, "2인 듀얼"),
          h("a", { href: "#/guide", class: "button button--quiet" }, "처음이라면 도움말"),
        ),
      ),
    ),
    h(
      "div",
      { class: "title__foot" },
      h(
        "p",
        { class: "label" },
        `신과 영웅 ${FIGURES.length} · 신화 계열 ${PANTHEONS.length} · 괴물 ${ENEMIES.length} · 유물 ${RELICS.length}`,
        records.seen.length > 0 ? ` · 서가 복원 ${records.seen.length}/${FIGURES.length}` : "",
        records.runs > 0 ? ` · 지금까지 ${records.runs}판, 승리 ${records.wins}` : "",
      ),
      h(
        "button",
        {
          type: "button",
          class: "label title__motion",
          "data-action": "toggle-motion",
          "aria-pressed": motionOn ? "true" : "false",
        },
        "고리 움직임",
        h("span", { "aria-hidden": "true" }, motionOn ? " · 켜짐" : " · 꺼짐"),
      ),
    ),
  );
}

/** 지금 첫 화면의 고리. 움직임 설정이 바뀌어 다시 그린 뒤 루프를 다시 켜거나 그대로 둡니다. @type {{ sync: () => void } | null} */
let ring = null;

/**
 * 신들의 그림이 타원을 따라 천천히 돕니다. 움직임을 끄면 그 자리에 멈추고, 매 프레임 돌던 루프도 멈춥니다(배터리).
 * @param {import("#app/render/app.js").PageContext} _ctx @param {HTMLElement} main
 */
function mount(_ctx, main) {
  const tiles = /** @type {HTMLElement[]} */ ([...main.querySelectorAll(".title__tile")]);
  let angle = 0;
  let frame = 0;
  let last = performance.now();
  const moving = () => document.body.dataset.motion === "on";

  const place = () => {
    const stage = /** @type {HTMLElement} */ (main.querySelector(".title__stage"));
    const rx = Math.min(stage.clientWidth * 0.44, 620);
    const ry = Math.min(stage.clientHeight * 0.4, 320);
    tiles.forEach((tile, index) => {
      const a = angle + (index / tiles.length) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      const depth = (Math.sin(a) + 1) / 2; // 아래쪽일수록 앞으로
      tile.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.82 + depth * 0.3).toFixed(3)})`;
      tile.style.zIndex = String(Math.round(depth * 100));
    });
  };

  /** @param {number} now */
  const tick = (now) => {
    if (!moving()) {
      frame = 0;
      return;
    }
    const dt = Math.min(64, now - last);
    last = now;
    angle += dt * 0.00004;
    place();
    frame = requestAnimationFrame(tick);
  };
  /** 움직임이 켜져 있고 루프가 멈춘 상태면 다시 돌립니다. */
  const start = () => {
    if (frame || !moving()) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  place();
  start();
  ring = { sync: start };
  window.addEventListener("resize", place);
  return () => {
    cancelAnimationFrame(frame);
    frame = 0;
    ring = null;
    window.removeEventListener("resize", place);
  };
}

/** @type {import("#app/render/app.js").Page} */
export const titlePage = {
  title: () => "신화 덱빌딩",
  surface: () => "dark",
  context: () => "",
  view,
  mount,
  // 움직임을 다시 켜면 멈춘 루프를 돌립니다. (끄면 다음 프레임에서 루프가 스스로 멈춤)
  afterRender: () => ring?.sync(),
  actions: {
    "toggle-motion": (ctx) => {
      const motion = ctx.settings.motion === "on" ? "off" : "on";
      ctx.setSettings({ motion });
      ctx.announce(motion === "on" ? "고리가 다시 돕니다." : "고리를 멈췄습니다.");
    },
  },
};
