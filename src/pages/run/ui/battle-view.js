import { armamentIllustration, getArmament, isOncePerBattle } from "#entities/armament/index.js";
import { describeField } from "#entities/battlefield/index.js";
import { cardFace, getCard } from "#entities/card/index.js";
import { describeAction, enemyIllustration, getEnemy, intentKind, isNemesis } from "#entities/enemy/index.js";
import { getFigure, getPantheon } from "#entities/figure/index.js";
import {
  canPlay,
  canUseArmament,
  endTurn,
  livingEnemies,
  playCard,
  previewArmament,
  previewCard,
  updateCombat,
  useArmament,
} from "#features/run/index.js";
import { h, withJosa } from "#shared/lib/index.js";

import "./battle-view.css";

/**
 * @typedef {import("#app/render/app.js").PageContext} Ctx
 * @typedef {import("#features/run/index.js").CombatState} CombatState
 */

const STATUS_LABEL = {
  strength: "힘",
  weak: "약화",
  vulnerable: "취약",
  erosion: "침식",
  eclipse: "일식",
  foundation: "매 턴 방어",
};

/** @param {Record<string, number>} statuses */
function statusList(statuses) {
  const items = Object.entries(statuses).filter(([, value]) => value > 0);
  if (!items.length) return null;
  return h(
    "ul",
    { class: "statuses", "aria-label": "상태" },
    items.map(([key, value]) =>
      h("li", { class: ["status", `status--${key}`], "data-key": key }, `${STATUS_LABEL[key] ?? key} ${value}`),
    ),
  );
}

/** @param {number} value @param {number} max @param {string} label */
function bar(value, max, label) {
  return h(
    "div",
    { class: "bar" },
    h(
      "p",
      { class: "bar__text" },
      h("span", { class: "label muted" }, label),
      h("span", { class: "bar__value" }, `${Math.max(0, value)}`, h("span", { class: "muted" }, ` / ${max}`)),
    ),
    h(
      "span",
      { class: "bar__track", "aria-hidden": "true" },
      h("span", { class: "bar__fill", style: { "--ratio": Math.max(0, value) / max } }),
    ),
  );
}

/** @param {CombatState} combat @param {CombatState["enemies"][number]} enemy @param {boolean} targeting */
function enemyPlate(combat, enemy, targeting) {
  const def = getEnemy(enemy.id);
  const dead = enemy.hp <= 0;
  const intent = def.intents[enemy.intent];
  const actionText = intent.actions
    .map((a) =>
      describeAction(a, {
        strength: enemy.statuses.strength,
        heads: enemy.heads,
        weak: enemy.statuses.weak,
        vulnerable: combat.player.statuses.vulnerable,
      }),
    )
    .join(" · ");
  const nemesisNames = def.nemesis
    ? [
        ...(def.nemesis.figures ?? []).map((slug) => getFigure(slug)?.name ?? slug),
        ...(def.nemesis.pantheons ?? []).map((slug) => `${getPantheon(slug)?.name ?? slug}의 신들`),
        ...(def.nemesis.domains ?? []).map((d) => `‘${d}’의 신`),
      ]
    : [];

  return h(
    "li",
    {
      class: ["enemy", dead && "enemy--dead", def.tier !== "normal" && `enemy--${def.tier}`],
      "data-key": enemy.uid,
      "data-vital": enemy.uid,
      "data-hp": enemy.hp,
      "data-block": enemy.block,
    },
    h(
      "article",
      { class: "enemy__inner", "aria-labelledby": `enemy-${enemy.uid}` },
      h("img", {
        class: "enemy__art",
        src: enemyIllustration(enemy.id),
        alt: "",
        width: 200,
        height: 260,
        decoding: "async",
      }),
      dead
        ? h("p", { class: "enemy__intent label" }, "쓰러짐")
        : h(
            "p",
            { class: "enemy__intent" },
            h("span", { class: "label muted" }, `다음 행동 · ${intentKind(intent.actions)}`),
            h("strong", { class: "enemy__action" }, actionText),
            h("span", { class: "muted enemy__intent-name" }, intent.name),
          ),
      h(
        "h2",
        { class: "enemy__name", id: `enemy-${enemy.uid}` },
        h(
          "span",
          { class: "display enemy__en fit", lang: "en", "aria-hidden": "true", style: { "--len": def.nameEn.length } },
          def.nameEn,
        ),
        h("span", { class: "serif enemy__ko" }, def.name),
      ),
      h(
        "p",
        { class: "label muted" },
        def.origin,
        def.tier === "elite" ? " · 정예" : def.tier === "boss" ? " · 보스" : "",
      ),
      dead ? null : bar(enemy.hp, enemy.maxHp, "체력"),
      dead || enemy.block === 0 ? null : h("p", { class: "enemy__block" }, `방어 ${enemy.block}`),
      dead ? null : statusList(enemy.statuses),
      def.heads && !dead ? h("p", { class: "label muted" }, `머리 ${enemy.heads}개`) : null,
      nemesisNames.length && !dead
        ? h("p", { class: "enemy__nemesis label" }, `천적 · ${nemesisNames.join(", ")}`)
        : null,
      targeting && !dead
        ? h(
            "button",
            {
              type: "button",
              class: "button button--solid enemy__target",
              "data-action": "target",
              "data-uid": enemy.uid,
            },
            `${def.name}에게 내기`,
          )
        : null,
    ),
  );
}

/** @param {Ctx} ctx */
export function battleView(ctx) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  const combat = /** @type {CombatState} */ (run.combat);
  const selectedUid = combat.hand.some((c) => c.uid === ctx.ui.selected) ? ctx.ui.selected : null;
  const selectedCard = selectedUid ? combat.hand.find((c) => c.uid === selectedUid) : null;
  const selectedArm =
    typeof ctx.ui.selected === "string" && ctx.ui.selected.startsWith("arm:") ? ctx.ui.selected.slice(4) : null;
  const selectedName = selectedCard
    ? getCard(selectedCard.id, selectedCard.up).name
    : selectedArm
      ? getArmament(selectedArm).name
      : null;
  const alive = livingEnemies(combat);

  return h(
    "section",
    { class: "battle" },
    h(
      "header",
      { class: "battle__head" },
      h("h1", { class: "label" }, `${run.act}장 ${run.stats.floors}층 · 전투`),
      combat.field
        ? h(
            "p",
            { class: "battle__field label" },
            `전장 · ${combat.field.name} — ${describeField({ field: /** @type {any} */ (combat.field.kind), value: combat.field.value })}`,
          )
        : null,
      h("p", { class: "label muted" }, `턴 ${combat.turn}`),
    ),
    h(
      "ul",
      { class: "battle__enemies", "aria-label": "적" },
      combat.enemies.map((e) => enemyPlate(combat, e, Boolean(selectedName))),
    ),
    h(
      "div",
      { class: "battle__player" },
      h(
        "div",
        {
          class: "player__vitals",
          "data-vital": "player",
          "data-hp": combat.player.hp,
          "data-block": combat.player.block,
        },
        h("h2", { class: "sr-only" }, "나의 상태"),
        bar(combat.player.hp, combat.player.maxHp, "체력"),
        h("p", { class: ["player__block", combat.player.block === 0 && "muted"] }, `방어 ${combat.player.block}`),
        statusList(combat.player.statuses),
      ),
      h(
        "p",
        { class: "player__energy" },
        h("span", { class: "label muted" }, "에너지"),
        h(
          "span",
          { class: "player__energy-value display" },
          `${combat.energy}`,
          h("span", { class: "muted" }, `/${combat.maxEnergy}`),
        ),
      ),
      h(
        "div",
        { class: "player__piles" },
        h(
          "button",
          { type: "button", class: "pile", "data-action": "pile", "data-pile": "draw" },
          h("span", { class: "label muted" }, "뽑을 카드"),
          h("span", { class: "pile__count" }, combat.draw.length),
        ),
        h(
          "button",
          { type: "button", class: "pile", "data-action": "pile", "data-pile": "discard" },
          h("span", { class: "label muted" }, "버린 카드"),
          h("span", { class: "pile__count" }, combat.discard.length),
        ),
        h(
          "button",
          { type: "button", class: "pile", "data-action": "pile", "data-pile": "exhaust" },
          h("span", { class: "label muted" }, "사라진 카드"),
          h("span", { class: "pile__count" }, combat.exhaust.length + combat.powers.length),
        ),
      ),
      combat.armaments.length
        ? h(
            "div",
            { class: "player__arms" },
            h("h2", { class: "sr-only" }, "무구"),
            h(
              "ul",
              null,
              combat.armaments.map((slot) => {
                const { arm, withOwner, effects } = previewArmament(combat, slot.id);
                const ok = canUseArmament(combat, slot.id).ok;
                return h(
                  "li",
                  { "data-key": slot.id },
                  h(
                    "button",
                    {
                      type: "button",
                      class: ["arm", withOwner && "arm--owner"],
                      "data-action": "arm",
                      "data-arm-id": slot.id,
                      "aria-disabled": ok ? null : "true",
                      "aria-pressed": selectedArm === slot.id ? "true" : "false",
                    },
                    h("img", { class: "arm__art", src: armamentIllustration(arm), alt: "", width: 200, height: 260 }),
                    h(
                      "span",
                      { class: "arm__text" },
                      h("span", { class: "arm__name" }, arm.name),
                      h(
                        "span",
                        { class: "arm__meta label" },
                        slot.cd > 0 && isOncePerBattle(arm) ? "다 씀 · " : slot.cd > 0 ? `${slot.cd}턴 뒤 · ` : "",
                        `에너지 ${arm.cost}`,
                      ),
                      h(
                        "span",
                        { class: "arm__effect" },
                        effects.map((e) => (e.op === "cleanse" ? "정화" : describeEffectShort(e))).join(", "),
                      ),
                      withOwner ? h("span", { class: "arm__owner label" }, `${arm.owner}과 함께`) : null,
                    ),
                  ),
                );
              }),
            ),
          )
        : null,
      h(
        "div",
        { class: "player__turn" },
        selectedName
          ? h(
              "p",
              { class: "player__hint", role: "status" },
              `${selectedName}: 대상을 고르세요.`,
              h("button", { type: "button", class: "button button--quiet", "data-action": "cancel-target" }, "취소"),
            )
          : h("p", { class: "player__hint", role: "status" }),
        h(
          "button",
          { type: "button", class: "button button--solid player__end", "data-action": "end-turn", "data-end-turn": "" },
          "턴 끝내기",
        ),
      ),
    ),
    h(
      "div",
      { class: "battle__hand-wrap" },
      h("h2", { class: "sr-only" }, `손에 든 카드 ${combat.hand.length}장`),
      combat.hand.length
        ? h(
            "ul",
            { class: "battle__hand", "data-hand": "", style: { "--count": combat.hand.length } },
            combat.hand.map((instance, index) => {
              const { card, chain, terrain, lines } = previewCard(combat, instance);
              const playable = canPlay(combat, instance.uid).ok;
              const nemesis = alive.some((enemy) => isNemesis(getEnemy(enemy.id), card));
              return h(
                "li",
                { "data-key": instance.uid, style: { "--i": index } },
                cardFace(card, {
                  tag: "button",
                  lines,
                  chain,
                  // 천적과 지형 공명(이 전장 신화권의 카드)을 함께 알립니다.
                  note: [nemesis && "천적", terrain && "지형"].filter(Boolean).join(" · ") || undefined,
                  attrs: {
                    "data-action": "card",
                    "data-uid": instance.uid,
                    "aria-pressed": selectedUid === instance.uid ? "true" : "false",
                    "aria-disabled": playable ? null : "true",
                  },
                }),
              );
            }),
          )
        : h("p", { class: "muted battle__empty" }, "손에 든 카드가 없습니다."),
    ),
    h(
      "section",
      { class: "battle__log", "aria-labelledby": "battle-log-title" },
      h("h2", { id: "battle-log-title", class: "label muted" }, "전투 기록"),
      h(
        "ol",
        null,
        combat.history
          .slice(-6)
          .map((entry, index, list) =>
            h(
              "li",
              { class: `log--${entry.tone}`, "data-key": `${combat.history.length - list.length + index}` },
              entry.text,
            ),
          ),
      ),
    ),
  );
}

/** 무구 버튼의 짧은 효과 글 @param {any} e */
function describeEffectShort(e) {
  const map = {
    damage: "피해",
    block: "방어",
    draw: "뽑기",
    heal: "회복",
    energy: "에너지",
    strength: "힘",
    erosion: "침식",
    vulnerable: "취약",
    weak: "약화",
  };
  const times = (e.times ?? 1) > 1 ? `×${e.times}` : "";
  return `${e.all ? "전체 " : ""}${map[e.op] ?? e.op} ${e.value}${times}${e.pierce ? " 관통" : ""}`;
}

/** 카드를 낸 뒤 초점을 옆 카드나 턴 끝내기 버튼으로 옮깁니다. @param {number} index */
function refocus(index) {
  const cards = /** @type {HTMLElement[]} */ ([...document.querySelectorAll("[data-hand] button.card")]);
  const next = cards[Math.min(index, cards.length - 1)] ?? document.querySelector("[data-end-turn]");
  /** @type {HTMLElement | null} */ (next)?.focus();
}

/** @param {Ctx} ctx @param {CombatState} next @param {number} index */
function commit(ctx, next, index) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  ctx.setUi({ selected: null });
  ctx.setRun(updateCombat(run, next));
  ctx.announce(next.log.map((entry) => entry.text));
  if (!next.outcome) refocus(index);
}

/** 무구를 쓴 뒤 상태를 반영하고, 초점은 그 무구 버튼에 둡니다. @param {Ctx} ctx @param {CombatState} next @param {string} id */
function commitArm(ctx, next, id) {
  const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
  ctx.setUi({ selected: null });
  ctx.setRun(updateCombat(run, next));
  ctx.announce(next.log.map((entry) => entry.text));
  if (!next.outcome) /** @type {HTMLElement | null} */ (document.querySelector(`[data-arm-id="${id}"]`))?.focus();
}

/** @type {Record<string, (ctx: Ctx, el: HTMLElement, event: Event) => void>} */
export const battleActions = {
  card(ctx, el) {
    const combat = /** @type {CombatState} */ (ctx.run?.combat);
    const uid = /** @type {string} */ (el.dataset.uid);
    const check = canPlay(combat, uid);
    if (!check.ok) {
      ctx.announce(check.reason);
      return;
    }
    if (ctx.ui.selected === uid) {
      ctx.setUi({ selected: null });
      ctx.announce("카드 선택을 취소했습니다.");
      return;
    }
    const instance = /** @type {import("#features/run/index.js").CardInstance} */ (
      combat.hand.find((c) => c.uid === uid)
    );
    const card = getCard(instance.id, instance.up);
    const alive = livingEnemies(combat);
    const index = combat.hand.indexOf(instance);
    if (card.target === "enemy" && alive.length > 1) {
      ctx.setUi({ selected: uid });
      ctx.announce(`${withJosa(card.name, "을/를")} 낼 대상을 고르세요.`);
      /** @type {HTMLElement | null} */ (document.querySelector("[data-action='target']"))?.focus();
      return;
    }
    commit(ctx, playCard(combat, uid, alive[0]?.uid ?? null), index);
  },
  arm(ctx, el) {
    const combat = /** @type {CombatState} */ (ctx.run?.combat);
    const id = /** @type {string} */ (el.dataset.armId);
    const check = canUseArmament(combat, id);
    if (!check.ok) {
      ctx.announce(check.reason);
      return;
    }
    if (ctx.ui.selected === `arm:${id}`) {
      ctx.setUi({ selected: null });
      ctx.announce("무구 선택을 취소했습니다.");
      return;
    }
    const { arm, target } = previewArmament(combat, id);
    const alive = livingEnemies(combat);
    if (target === "enemy" && alive.length > 1) {
      ctx.setUi({ selected: `arm:${id}` });
      ctx.announce(`${withJosa(arm.name, "을/를")} 휘두를 대상을 고르세요.`);
      /** @type {HTMLElement | null} */ (document.querySelector("[data-action='target']"))?.focus();
      return;
    }
    commitArm(ctx, useArmament(combat, id, alive[0]?.uid ?? null), id);
  },
  target(ctx, el) {
    const combat = /** @type {CombatState} */ (ctx.run?.combat);
    const uid = ctx.ui.selected;
    if (!uid) return;
    if (uid.startsWith("arm:")) {
      commitArm(ctx, useArmament(combat, uid.slice(4), el.dataset.uid ?? null), uid.slice(4));
      return;
    }
    const index = combat.hand.findIndex((c) => c.uid === uid);
    commit(ctx, playCard(combat, uid, el.dataset.uid ?? null), index);
  },
  "cancel-target"(ctx) {
    const uid = ctx.ui.selected;
    ctx.setUi({ selected: null });
    const selector = uid?.startsWith("arm:") ? `[data-arm-id="${uid.slice(4)}"]` : `[data-uid="${uid}"]`;
    /** @type {HTMLElement | null} */ (document.querySelector(selector))?.focus();
  },
  "end-turn"(ctx) {
    const run = /** @type {NonNullable<Ctx["run"]>} */ (ctx.run);
    const next = endTurn(/** @type {CombatState} */ (run.combat));
    ctx.setUi({ selected: null });
    ctx.setRun(updateCombat(run, next));
    ctx.announce(next.log.map((entry) => entry.text));
    if (!next.outcome) /** @type {HTMLElement | null} */ (document.querySelector("[data-hand] button.card"))?.focus();
  },
  pile(ctx, el) {
    const combat = /** @type {CombatState} */ (ctx.run?.combat);
    const pile = el.dataset.pile;
    if (pile === "draw") {
      // 뽑을 순서가 드러나지 않게 정렬해서 보여 줍니다.
      const sorted = [...combat.draw].sort((a, b) => a.id.localeCompare(b.id));
      ctx.openDeck("뽑을 카드", sorted, "뽑을 카드가 없습니다. 버린 카드를 섞어 다시 씁니다.");
    } else if (pile === "discard") ctx.openDeck("버린 카드", combat.discard);
    else ctx.openDeck("사라진 카드", [...combat.exhaust, ...combat.powers], "이번 전투에서 사라진 카드가 없습니다.");
  },
};

/** @param {Ctx} ctx @param {KeyboardEvent} event */
export function battleKeydown(ctx, event) {
  if (event.key === "Escape" && ctx.ui.selected) {
    event.preventDefault();
    battleActions["cancel-target"](ctx, /** @type {any} */ (null), event);
  }
}
