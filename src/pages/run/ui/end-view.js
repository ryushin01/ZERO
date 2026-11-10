import { getEnemy } from "#entities/enemy/index.js";
import { getRelic } from "#entities/relic/index.js";
import { guideName, sortDeck } from "#features/run/index.js";
import { h } from "#shared/lib/index.js";
import { cardFace, getCard } from "#entities/card/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

/** @param {Ctx} ctx */
export function endView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const won = run.phase === "victory";
  const foes = run.stats.defeatedBy?.split(",").map((id) => getEnemy(id).name);

  return h(
    "section",
    { class: "end" },
    h(
      "header",
      { class: "page-head end__head" },
      h("p", { class: "display end__en", lang: "en" }, won ? "Remembered" : "Returned to zero"),
      h("h1", null, won ? "신화를 지켜 냈습니다" : "기록이 지워졌습니다"),
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
        ["덱", `${run.deck.length}장`],
        ["유물", run.relics.map((id) => getRelic(id).name).join(", ") || "없음"],
      ].map(([term, value]) => h("div", null, h("dt", { class: "label muted" }, term), h("dd", null, value))),
    ),
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "button button--solid", "data-action": "new-run" }, "새 기록 시작"),
      h("a", { href: "#/codex", class: "button" }, "도감 보기"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면"),
    ),
    h("h2", { class: "label muted end__deck-title" }, "마지막 덱"),
    h(
      "ul",
      { class: "end__deck" },
      sortDeck(run.deck).map((c) => h("li", { "data-key": c.uid }, cardFace(getCard(c.id, c.up), { size: "s" }))),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx) => void>} */
export const endActions = {
  "new-run"(ctx) {
    ctx.setRun(null);
    ctx.navigate("#/new");
  },
};
