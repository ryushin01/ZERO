import { cardFace, getCard } from "#entities/card/index.js";
import { getEnemy } from "#entities/enemy/index.js";
import { FIGURES } from "#entities/figure/index.js";
import { getRelic } from "#entities/relic/index.js";
import { dailyLabel, guideName, shareText, sortDeck } from "#features/run/index.js";
import { h } from "#shared/lib/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

const SITE_URL = "https://zero-ryushin01.vercel.app/";

/** @param {Ctx} ctx */
export function endView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const won = run.phase === "victory";
  const foes = run.stats.defeatedBy?.split(",").map((id) => getEnemy(id).name);
  const discovered = run.discovered ?? [];

  return h(
    "section",
    { class: "end" },
    h(
      "header",
      { class: "page-head end__head" },
      h("p", { class: "display end__en", lang: "en" }, won ? "Remembered" : "Returned to zero"),
      h("h1", null, won ? "신화를 지켜 냈습니다" : "기록이 지워졌습니다"),
      run.daily ? h("p", { class: "label" }, `오늘의 신화 · ${dailyLabel(run.daily)}`) : null,
      h(
        "p",
        null,
        won
          ? "공허는 다시 처음의 어둠으로 물러났습니다. Ark의 서가에 133개의 이름이 그대로 남았습니다."
          : `${run.act}장에서 ${foes?.join(", ") ?? "괴물"}에게 쓰러졌습니다. 기억은 다시 시작할 수 있습니다.`,
      ),
    ),
    h(
      "dl",
      { class: "end__stats" },
      [
        ["길잡이", guideName(run)],
        ["지나온 칸", `${run.stats.floors}칸`],
        ["물리친 괴물", `전투 ${run.stats.battles} · 정예 ${run.stats.elites} · 보스 ${run.stats.bosses}`],
        ["서가 복원", `${ctx.records.seen.length} / ${FIGURES.length}`],
        ["유물", run.relics.map((id) => getRelic(id).name).join(", ") || "없음"],
      ].map(([term, value]) => h("div", null, h("dt", { class: "label muted" }, term), h("dd", null, value))),
    ),
    h(
      "div",
      { class: "actions" },
      h(
        "button",
        {
          type: "button",
          class: "button button--solid",
          "data-action": "new-run",
          "data-daily": run.daily ? "" : null,
        },
        run.daily ? "오늘의 신화 다시 도전" : "새 기록 시작",
      ),
      h("button", { type: "button", class: "button", "data-action": "share" }, "결과 복사하기"),
      h("a", { href: "#/codex", class: "button" }, "도감 보기"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면"),
    ),
    h("p", { class: "end__copied label", role: "status" }, ctx.ui.copied ? "결과를 복사했습니다." : ""),
    discovered.length
      ? [
          h("h2", { class: "label muted end__deck-title" }, `이번 판에 새로 복원한 신 ${discovered.length}명`),
          h(
            "ul",
            { class: "end__deck" },
            discovered.map((id) => h("li", { "data-key": `new-${id}` }, cardFace(getCard(id), { size: "s" }))),
          ),
        ]
      : null,
    h("h2", { class: "label muted end__deck-title" }, "마지막 덱"),
    h(
      "ul",
      { class: "end__deck" },
      sortDeck(run.deck).map((c) => h("li", { "data-key": c.uid }, cardFace(getCard(c.id, c.up), { size: "s" }))),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const endActions = {
  "new-run"(ctx, el) {
    const daily = el.hasAttribute("data-daily");
    ctx.setRun(null);
    ctx.navigate(daily ? "#/new/daily" : "#/new");
  },
  async share(ctx) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    try {
      await navigator.clipboard.writeText(shareText(run, SITE_URL));
      ctx.setUi({ copied: true });
    } catch {
      ctx.announce("이 브라우저에서는 복사할 수 없습니다.");
    }
  },
};
