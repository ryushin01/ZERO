import { describeArmament, getArmament } from "#entities/armament/index.js";
import { bondEffects } from "#entities/bond/index.js";
import { cardFace, getCard } from "#entities/card/index.js";
import { canWearGear, closeGear, equipArm, equipPartner, isPartnerCard, sortDeck } from "#features/run/index.js";
import { h, withJosa } from "#shared/lib/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */
/** @typedef {import("#features/run/model/combat.js").CardInstance} CardInstance */

/** 카드에 끼운 것을 짧게 @param {CardInstance} instance */
function gearLabel(instance) {
  const parts = [];
  if (instance.gear?.arm) parts.push(getArmament(instance.gear.arm).name);
  if (instance.gear?.partner) parts.push(getCard(instance.gear.partner.id).name);
  return parts.length ? parts.join(" · ") : undefined;
}

/**
 * 장착 화면: 덱의 신·영웅 카드에 무구·도구와 탈것·동반자를 끼웁니다.
 * @param {Ctx} ctx
 */
export function gearView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const cards = sortDeck(run.deck.filter(canWearGear));
  const chosen = cards.find((c) => c.uid === ctx.ui.gearUid) ?? null;
  const card = chosen ? getCard(chosen.id, chosen.up) : null;
  const partners = chosen ? sortDeck(run.deck.filter((c) => c.uid !== chosen.uid && isPartnerCard(c) && !c.gear)) : [];
  const owner = (/** @type {string} */ armId) =>
    Boolean(card?.figureSlug && getArmament(armId).owners.includes(card.figureSlug));

  return h(
    "section",
    { class: "pick gear" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Arm your myths"),
      h("h1", null, "장착"),
      h(
        "p",
        null,
        "신과 영웅의 카드에 무구·도구 하나와 탈것·동반자 하나를 끼웁니다. 그 카드를 내면 끼운 것의 효과가 함께 터지고, 무구는 에너지와 대기시간이 들지 않습니다. 주인 신의 무구나 신화 속 짝(오딘과 슬레이프니르)이면 더 강해집니다.",
      ),
    ),
    h(
      "div",
      { class: "pick__bar" },
      h(
        "p",
        { role: "status", class: "pick__status" },
        card ? `${withJosa(card.name, "을/를")} 골랐습니다.` : "장착할 카드를 고르세요.",
      ),
      h(
        "div",
        { class: "actions" },
        h("button", { type: "button", class: "button button--solid", "data-action": "close-gear" }, "지도로 돌아가기"),
      ),
    ),
    chosen && card
      ? h(
          "div",
          { class: "gear__slots" },
          h(
            "section",
            { class: "gear__slot", "aria-labelledby": "gear-arm" },
            h("h2", { id: "gear-arm", class: "label muted" }, "무구·도구"),
            run.armaments.length
              ? h(
                  "ul",
                  { class: "gear__options" },
                  run.armaments.map((id) => {
                    const arm = getArmament(id);
                    const on = chosen.gear?.arm === id;
                    const elsewhere = run.deck.find((c) => c.uid !== chosen.uid && c.gear?.arm === id);
                    return h(
                      "li",
                      { "data-key": id },
                      h(
                        "button",
                        {
                          type: "button",
                          class: "choice",
                          "data-action": "equip-arm",
                          "data-id": on ? "" : id,
                          "aria-pressed": on ? "true" : "false",
                        },
                        h("strong", null, `${arm.name}${owner(id) ? " · 주인" : ""}`),
                        h(
                          "span",
                          { class: "muted" },
                          `${describeArmament(arm).join(", ")}${owner(id) ? " (50% 강해짐)" : ""}`,
                          elsewhere ? ` — 지금 ${getCard(elsewhere.id).name}에 끼움` : "",
                        ),
                      ),
                    );
                  }),
                )
              : h("p", { class: "muted" }, "아직 지닌 무구가 없습니다."),
          ),
          h(
            "section",
            { class: "gear__slot", "aria-labelledby": "gear-partner" },
            h("h2", { id: "gear-partner", class: "label muted" }, "탈것·동반자"),
            chosen.gear?.partner
              ? h(
                  "p",
                  null,
                  (() => {
                    const partner = /** @type {NonNullable<NonNullable<CardInstance["gear"]>["partner"]>} */ (
                      chosen.gear?.partner
                    );
                    const bond = bondEffects(card.figureSlug, /** @type {string} */ (getCard(partner.id).figureSlug));
                    return `${getCard(partner.id).name} — ${bond.title}: ${bond.text}`;
                  })(),
                )
              : null,
            chosen.gear?.partner
              ? h(
                  "button",
                  { type: "button", class: "button button--quiet", "data-action": "equip-partner", "data-uid": "" },
                  "탈것·동반자 빼기",
                )
              : partners.length
                ? h(
                    "ul",
                    { class: "gear__options" },
                    partners.map((instance) => {
                      const partner = getCard(instance.id, instance.up);
                      const bond = bondEffects(card.figureSlug, /** @type {string} */ (partner.figureSlug));
                      return h(
                        "li",
                        { "data-key": instance.uid },
                        h(
                          "button",
                          { type: "button", class: "choice", "data-action": "equip-partner", "data-uid": instance.uid },
                          h("strong", null, partner.name),
                          h("span", { class: "muted" }, `${bond.title}: ${bond.text}`),
                        ),
                      );
                    }),
                  )
                : h(
                    "p",
                    { class: "muted" },
                    "덱에 슬레이프니르·페가수스·후긴과 무닌·케르베로스 같은 탈것·동반자 카드가 있으면 끼울 수 있습니다.",
                  ),
          ),
        )
      : null,
    h(
      "ul",
      { class: "pick__cards" },
      cards.map((instance) =>
        h(
          "li",
          { "data-key": instance.uid },
          cardFace(getCard(instance.id, instance.up), {
            tag: "button",
            badge: gearLabel(instance),
            attrs: {
              "data-action": "select-gear-card",
              "data-uid": instance.uid,
              "aria-pressed": chosen?.uid === instance.uid ? "true" : "false",
            },
          }),
        ),
      ),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const gearActions = {
  "select-gear-card"(ctx, el) {
    const uid = el.dataset.uid;
    ctx.setUi({ gearUid: ctx.ui.gearUid === uid ? null : uid });
  },
  "equip-arm"(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    const id = el.dataset.id || null;
    ctx.setRun(equipArm(run, ctx.ui.gearUid, id));
    ctx.announce(id ? `${withJosa(getArmament(id).name, "을/를")} 끼웠습니다.` : "무구를 뺐습니다.");
  },
  "equip-partner"(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    const uid = el.dataset.uid || null;
    const partner = uid ? run.deck.find((c) => c.uid === uid) : null;
    ctx.setRun(equipPartner(run, ctx.ui.gearUid, uid));
    ctx.announce(partner ? `${withJosa(getCard(partner.id).name, "을/를")} 끼웠습니다.` : "탈것·동반자를 뺐습니다.");
  },
  "close-gear"(ctx) {
    ctx.setUi({ gearUid: null });
    ctx.setRun(closeGear(/** @type {NonNullable<Ctx["run"]>} */ (ctx.run)));
  },
};
