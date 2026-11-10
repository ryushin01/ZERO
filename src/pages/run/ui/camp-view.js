import { cardIllustration, getCard } from "#entities/card/index.js";
import { getFigure } from "#entities/figure/index.js";
import { getEvent, requestPick, rest, restAmount, skipToMap } from "#features/run/index.js";
import { chooseEvent } from "#features/run/index.js";
import { arkFigureUrl } from "#shared/config/index.js";
import { h } from "#shared/lib/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

/** @param {{ en: string, title: string, lead: string, figure?: string }} head @param {Node[]} body */
function scene(head, body) {
  const figure = head.figure ? getFigure(head.figure) : null;
  const art = figure ? cardIllustration(getCard(figure.slug)) : null;
  return h(
    "section",
    { class: ["scene", art && "scene--art"] },
    art && figure
      ? h(
          "figure",
          { class: "scene__art" },
          h("img", { src: art, alt: `${figure.name}의 일러스트` }),
          h(
            "figcaption",
            { class: "label muted" },
            `${figure.name} · ${figure.epithet}`,
            " · ",
            h(
              "a",
              { href: arkFigureUrl(figure.slug), target: "_blank", rel: "noopener" },
              "Ark에서 읽기",
              h("span", { class: "sr-only" }, " (새 창)"),
              h("span", { "aria-hidden": "true" }, " ↗"),
            ),
          ),
        )
      : null,
    h(
      "div",
      { class: "scene__body" },
      h("p", { class: "display scene__en fit", lang: "en", style: { "--len": head.en.length } }, head.en),
      h("h1", { class: "scene__title serif" }, head.title),
      h("p", { class: "scene__lead" }, head.lead),
      ...body,
    ),
  );
}

/** @param {{ action: string, label: string, detail: string, disabled?: string | null, id?: string }} option */
function choice({ action, label, detail, disabled = null, id }) {
  return h(
    "li",
    null,
    h(
      "button",
      {
        type: "button",
        class: "choice",
        "data-action": action,
        "data-id": id ?? null,
        "aria-disabled": disabled ? "true" : null,
      },
      h("span", { class: "choice__label" }, label),
      h("span", { class: "choice__detail" }, detail),
      disabled ? h("span", { class: "choice__why label" }, disabled) : null,
    ),
  );
}

/** @param {Ctx} ctx */
export function restView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const heal = Math.min(restAmount(run), run.maxHp - run.hp);
  const canUpgrade = run.deck.some((c) => !c.up);
  return scene({ en: "Hearth", title: "쉼터", lead: `모닥불 곁에서 숨을 고릅니다. 체력 ${run.hp} / ${run.maxHp}.` }, [
    h(
      "ul",
      { class: "choices" },
      choice({
        action: "rest",
        label: "쉬기",
        detail: `체력 ${heal} 회복`,
        disabled: heal === 0 ? "체력이 가득합니다" : null,
      }),
      choice({
        action: "upgrade",
        label: "벼리기",
        detail: "카드 1장 강화",
        disabled: canUpgrade ? null : "강화할 카드가 없습니다",
      }),
    ),
  ]);
}

/** @param {Ctx} ctx */
export function shrineView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  return scene(
    { en: "Shrine", title: "성소", lead: "이름 모를 신의 제단입니다. 바친 것은 돌아오지 않지만, 덱은 가벼워집니다." },
    [
      h(
        "ul",
        { class: "choices" },
        choice({
          action: "remove",
          label: "덜어 내기",
          detail: "카드 1장을 덱에서 지우기",
          disabled: run.deck.length <= 5 ? "덱이 너무 얇습니다" : null,
        }),
        choice({
          action: "upgrade",
          label: "기도하기",
          detail: "카드 1장 강화",
          disabled: run.deck.some((c) => !c.up) ? null : "강화할 카드가 없습니다",
        }),
        choice({ action: "leave", label: "지나가기", detail: "아무것도 하지 않고 떠나기" }),
      ),
    ],
  );
}

/** @param {Ctx} ctx */
export function eventView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const event = getEvent(/** @type {string} */ (run.event));
  return scene({ en: event.en, title: event.title, lead: event.text[0], figure: event.figure }, [
    ...event.text.slice(1).map((p) => h("p", null, p)),
    h(
      "ul",
      { class: "choices" },
      event.choices.map((c) => {
        const [label, detail = ""] = c.label.split(" · ");
        const disabled = c.available && !c.available(run) ? "지금은 고를 수 없습니다" : null;
        return choice({ action: "choose", id: c.id, label, detail, disabled });
      }),
    ),
    h("p", { class: "label muted" }, `체력 ${run.hp} / ${run.maxHp} · 덱 ${run.deck.length}장`),
  ]);
}

/** @param {HTMLElement} el */
const blocked = (el) => el.getAttribute("aria-disabled") === "true";

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const campActions = {
  rest(ctx, el) {
    if (blocked(el)) return ctx.announce("체력이 가득합니다.");
    const next = rest(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run));
    ctx.setRun(next);
    ctx.announce(next.notice ?? "");
  },
  upgrade(ctx, el) {
    if (blocked(el)) return ctx.announce("강화할 카드가 없습니다.");
    ctx.setRun(
      requestPick(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run), {
        purpose: "upgrade",
        count: 1,
        title: "강화할 카드",
        then: "map",
      }),
    );
  },
  remove(ctx, el) {
    if (blocked(el)) return ctx.announce("덱이 너무 얇아 덜어 낼 수 없습니다.");
    ctx.setRun(
      requestPick(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run), {
        purpose: "remove",
        count: 1,
        title: "덜어 낼 카드",
        then: "map",
      }),
    );
  },
  leave(ctx) {
    ctx.setRun(skipToMap(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run)));
  },
  choose(ctx, el) {
    if (blocked(el)) return ctx.announce("지금은 고를 수 없는 선택지입니다.");
    const next = chooseEvent(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run), /** @type {string} */ (el.dataset.id));
    ctx.setRun(next);
    if (next.notice) ctx.announce(next.notice);
  },
};
