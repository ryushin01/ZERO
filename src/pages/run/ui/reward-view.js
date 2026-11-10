import { ARMAMENT_SLOTS, armamentCard, getArmament } from "#entities/armament/index.js";
import { cardFace, getCard } from "#entities/card/index.js";
import { getRelic, relicCard } from "#entities/relic/index.js";
import { leaveReward, takeArmament, takeCard, takeRelic } from "#features/run/index.js";
import { h, withJosa } from "#shared/lib/index.js";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

/** @param {Ctx} ctx */
export function rewardView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const reward = /** @type {NonNullable<typeof run.reward>} */ (run.reward);
  const atBoss = run.position?.row === run.map.rows.length - 1;
  const leaveLabel = atBoss ? (run.act === 3 ? "기록을 마무리하기" : `${run.act + 1}장으로`) : "지도로 돌아가기";

  return h(
    "section",
    { class: "reward" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Spoils"),
      h("h1", null, reward.title),
      reward.cards.length ? h("p", null, "카드 한 장을 골라 덱에 넣을 수 있습니다. 넣지 않고 지나가도 됩니다.") : null,
    ),
    reward.cards.length
      ? h(
          "section",
          { class: "reward__group", "aria-labelledby": "reward-cards" },
          h(
            "h2",
            { id: "reward-cards", class: "label muted" },
            reward.cardTaken ? "카드를 덱에 넣었습니다" : "카드 고르기",
          ),
          h(
            "ul",
            { class: "reward__cards" },
            reward.cards.map((id) => {
              const card = getCard(id);
              return h(
                "li",
                { "data-key": id },
                cardFace(card, {
                  tag: "button",
                  size: "l",
                  attrs: {
                    "data-action": "take-card",
                    "data-id": id,
                    "aria-disabled": reward.cardTaken ? "true" : null,
                  },
                }),
                h(
                  "button",
                  {
                    type: "button",
                    class: "button button--quiet reward__more",
                    "data-action": "detail",
                    "data-id": id,
                  },
                  `${card.name} 자세히`,
                ),
              );
            }),
          ),
        )
      : null,
    reward.armaments?.length
      ? h(
          "section",
          { class: "reward__group", "aria-labelledby": "reward-arms" },
          h(
            "h2",
            { id: "reward-arms", class: "label muted" },
            reward.armamentTaken ? "무구를 들었습니다" : `무구 하나 고르기 (최대 ${ARMAMENT_SLOTS}점)`,
          ),
          h(
            "ul",
            { class: "reward__arms" },
            reward.armaments.map((id) => {
              const arm = getArmament(id);
              const owned = run.armaments.includes(id);
              return h(
                "li",
                { "data-key": `arm-${id}` },
                armamentCard(arm, {
                  full: true,
                  footer: h(
                    "button",
                    {
                      type: "button",
                      class: ["button", !reward.armamentTaken && "button--solid"],
                      "data-action": "take-armament",
                      "data-id": id,
                      "aria-disabled": reward.armamentTaken ? "true" : null,
                    },
                    owned ? "들었음" : `${arm.name} 들기`,
                  ),
                }),
              );
            }),
          ),
        )
      : null,
    reward.relics.length
      ? h(
          "section",
          { class: "reward__group", "aria-labelledby": "reward-relics" },
          h(
            "h2",
            { id: "reward-relics", class: "label muted" },
            reward.relicTaken ? "유물을 얻었습니다" : reward.relicPick ? "유물 하나 고르기" : "유물",
          ),
          h(
            "ul",
            { class: "reward__relics" },
            reward.relics.map((id) => {
              const relic = getRelic(id);
              const owned = run.relics.includes(id);
              return h(
                "li",
                { "data-key": id },
                relicCard(relic, {
                  heading: "h3",
                  owned,
                  footer: h(
                    "button",
                    {
                      type: "button",
                      class: ["button", !reward.relicTaken && "button--solid"],
                      "data-action": "take-relic",
                      "data-id": id,
                      "aria-disabled": reward.relicTaken ? "true" : null,
                    },
                    owned ? "얻음" : `${relic.name} 얻기`,
                  ),
                }),
              );
            }),
          ),
        )
      : null,
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "button button--solid", "data-action": "leave-reward" }, leaveLabel),
    ),
  );
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement) => void>} */
export const rewardActions = {
  "take-card"(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    if (run.reward?.cardTaken) {
      ctx.announce("이번 보상에서는 카드를 이미 골랐습니다.");
      return;
    }
    const id = /** @type {string} */ (el.dataset.id);
    ctx.setRun(takeCard(run, id));
    ctx.announce(`${withJosa(getCard(id).name, "을/를")} 덱에 넣었습니다. 덱 ${run.deck.length + 1}장.`);
  },
  "take-armament"(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    if (run.reward?.armamentTaken) {
      ctx.announce("이번 보상에서는 무구를 이미 골랐습니다.");
      return;
    }
    const arm = getArmament(/** @type {string} */ (el.dataset.id));
    const next = takeArmament(run, arm.id);
    if (next === run) {
      ctx.announce(`무구는 ${ARMAMENT_SLOTS}점까지만 들 수 있어 ${withJosa(arm.name, "을/를")} 들지 못했습니다.`);
      return;
    }
    ctx.setRun(next);
    ctx.announce(`${withJosa(arm.name, "을/를")} 들었습니다. 전투에서 에너지 ${arm.cost}로 휘두를 수 있습니다.`);
  },
  "take-relic"(ctx, el) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    if (run.reward?.relicTaken) {
      ctx.announce("유물은 하나만 얻을 수 있습니다.");
      return;
    }
    const id = /** @type {string} */ (el.dataset.id);
    ctx.setRun(takeRelic(run, id));
    ctx.announce(`${withJosa(getRelic(id).name, "을/를")} 얻었습니다. ${getRelic(id).text}`);
  },
  detail(ctx, el) {
    ctx.openCard(/** @type {string} */ (el.dataset.id));
  },
  "leave-reward"(ctx) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    const next = leaveReward(run);
    ctx.setRun(next);
    if (next.act !== run.act) ctx.announce(`${next.act}장에 들어섰습니다. 체력을 ${next.hp - run.hp} 회복했습니다.`);
  },
};
