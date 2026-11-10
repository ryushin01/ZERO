import { cardFace, getCard } from "#entities/card/index.js";
import { cancelPick, pickableCards, resolvePick, sortDeck } from "#features/run/index.js";
import { h, withJosa } from "#shared/lib/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

/** @param {Ctx} ctx */
export function pickView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const pick = /** @type {NonNullable<typeof run.pick>} */ (run.pick);
  const cards = sortDeck(pickableCards(run));
  const selected = cards.some((c) => c.uid === ctx.ui.selected) ? ctx.ui.selected : null;
  const chosen = selected ? cards.find((c) => c.uid === selected) : null;
  const verb = pick.purpose === "remove" ? "지우기" : "강화하기";

  return h(
    "section",
    { class: "pick" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, pick.purpose === "remove" ? "Let go" : "Temper"),
      h("h1", null, pick.title),
      h(
        "p",
        null,
        pick.purpose === "remove" ? "덱에서 영영 지울 카드를 고르세요." : "강화할 카드를 고르세요. 수치가 오릅니다.",
        pick.cost?.hp ? ` 체력 ${withJosa(pick.cost.hp, "을/를")} 잃습니다.` : "",
      ),
    ),
    h(
      "div",
      { class: "pick__bar" },
      h(
        "p",
        { role: "status", class: "pick__status" },
        chosen ? `${withJosa(getCard(chosen.id, chosen.up).name, "을/를")} 골랐습니다.` : "아직 고르지 않았습니다.",
      ),
      chosen && pick.purpose === "upgrade"
        ? h(
            "div",
            { class: "pick__preview" },
            h("p", { class: "label muted" }, "강화하면"),
            cardFace(getCard(chosen.id, true), { size: "s" }),
          )
        : null,
      h(
        "div",
        { class: "actions" },
        h(
          "button",
          {
            type: "button",
            class: "button button--solid",
            "data-action": "confirm-pick",
            "aria-disabled": chosen ? null : "true",
          },
          chosen ? `${getCard(chosen.id).name} ${verb}` : verb,
        ),
        h("button", { type: "button", class: "button button--quiet", "data-action": "cancel-pick" }, "그만두기"),
      ),
    ),
    h(
      "ul",
      { class: "pick__cards" },
      cards.map((instance) =>
        h(
          "li",
          { "data-key": instance.uid },
          cardFace(getCard(instance.id, instance.up), {
            tag: "button",
            attrs: {
              "data-action": "select-card",
              "data-uid": instance.uid,
              "aria-pressed": selected === instance.uid ? "true" : "false",
            },
          }),
        ),
      ),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const pickActions = {
  "select-card"(ctx, el) {
    const uid = el.dataset.uid;
    ctx.setUi({ selected: ctx.ui.selected === uid ? null : uid });
  },
  "confirm-pick"(ctx) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    if (!ctx.ui.selected || !run.deck.some((c) => c.uid === ctx.ui.selected)) {
      ctx.announce("먼저 카드를 고르세요.");
      return;
    }
    const next = resolvePick(run, [ctx.ui.selected]);
    ctx.setUi({ selected: null });
    ctx.setRun(next);
    ctx.announce(next.notice ?? "");
  },
  "cancel-pick"(ctx) {
    ctx.setUi({ selected: null });
    ctx.setRun(cancelPick(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run)));
  },
};
