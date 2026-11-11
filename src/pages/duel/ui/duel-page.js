import { CLASS_GROUPS, CLASSES, classesOf, describePassive, getClass } from "../model/classes.js";
import { ASPECTS, cardFace, getCard } from "#entities/card/index.js";
import { canPlayDuel, endDuelTurn, playDuelCard, reveal, startDuel } from "../model/duel.js";
import { h, randomSeed, withJosa } from "#shared/lib/index.js";

import "./duel-page.css";

/**
 * 2인 듀얼 화면: 클래스 고르기 → 넘기기(상대의 패를 가림) → 내 차례 → 결과
 * 듀얼 상태는 이 화면의 상태(ui.duel)에만 두고 저장하지 않습니다.
 * @typedef {import("#app/render/app.js").PageContext} Ctx
 * @typedef {import("../model/duel.js").DuelState} DuelState
 */

const DEFAULT = /** @type {[string, string]} */ (["warrior", "mage"]);

/** @param {Ctx} ctx */
const picks = (ctx) => /** @type {[string, string]} */ (ctx.ui.classes ?? DEFAULT);

/** @param {Ctx} ctx @returns {DuelState | null} */
const duelOf = (ctx) => ctx.ui.duel ?? null;

/** 클래스 한 줄 소개 @param {string} id */
function classSummary(id) {
  const cls = getClass(id);
  return h(
    "div",
    { class: "duel__class" },
    h("p", { class: "label muted" }, `${CLASS_GROUPS[cls.group].label} 계열${cls.base ? " · 기본 클래스" : ""}`),
    h(
      "p",
      { class: "duel__class-name serif" },
      cls.name,
      h("span", { class: "label muted", lang: "en" }, ` ${cls.en}`),
    ),
    h("p", null, describePassive(cls)),
    h(
      "p",
      { class: "muted" },
      `덱: ${cls.aspects.map((a) => `${ASPECTS[a].mark} ${ASPECTS[a].label}`).join(", ")} 속성의 신·영웅 10장과 기본 카드 4장`,
    ),
  );
}

/** @param {Ctx} ctx */
function setupView(ctx) {
  const chosen = picks(ctx);
  return h(
    "section",
    { class: "duel" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Duel"),
      h("h1", null, "2인 듀얼"),
      h(
        "p",
        null,
        "한 기기에서 두 사람이 번갈아 둡니다. 각자 클래스를 고르면 그 클래스의 속성에 맞는 신·영웅 카드로 덱이 무작위로 짜이고, 상대의 체력을 먼저 0으로 만든 쪽이 이깁니다. 차례가 바뀔 때마다 상대의 패를 가리는 화면이 나옵니다.",
      ),
    ),
    h(
      "div",
      { class: "duel__setup" },
      /** @type {const} */ ([0, 1]).map((side) =>
        h(
          "fieldset",
          { class: "duel__seat", "data-key": `seat-${side}` },
          h("legend", { class: "serif" }, `플레이어 ${side + 1}`),
          h("label", { for: `duel-class-${side}` }, "클래스"),
          h(
            "select",
            { id: `duel-class-${side}`, "data-input": `class-${side}` },
            Object.entries(CLASS_GROUPS).map(([group, info]) =>
              h(
                "optgroup",
                { label: `${info.label} (${classesOf(/** @type {any} */ (group)).length})` },
                classesOf(/** @type {any} */ (group)).map((cls) =>
                  h("option", { value: cls.id, selected: chosen[side] === cls.id }, cls.name),
                ),
              ),
            ),
          ),
          h(
            "button",
            { type: "button", class: "button button--quiet", "data-action": "random-class", "data-side": String(side) },
            "무작위 클래스",
          ),
          classSummary(chosen[side]),
        ),
      ),
    ),
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "button button--solid", "data-action": "start-duel" }, "듀얼 시작"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면으로"),
    ),
  );
}

/** 한 사람의 상태 @param {DuelState["players"][number]} p @param {string} label */
function status(p, label) {
  const s = p.statuses;
  const tags = [
    p.block ? `방어 ${p.block}` : null,
    s.strength ? `힘 ${s.strength}` : null,
    s.weak ? `약화 ${s.weak}` : null,
    s.vulnerable ? `취약 ${s.vulnerable}` : null,
    s.erosion ? `침식 ${s.erosion}` : null,
    s.evade ? `피해 절반 ${s.evade}회` : null,
  ].filter(Boolean);
  return h(
    "section",
    { class: "duel__player", "aria-label": label },
    h("p", { class: "label muted" }, `${getClass(p.classId).name} · ${describePassive(getClass(p.classId))}`),
    h("h2", { class: "duel__name serif" }, p.name),
    h("p", { class: "duel__hp" }, h("span", { class: "label muted" }, "체력 "), `${p.hp} / ${p.maxHp}`),
    h("p", { class: "duel__tags" }, tags.length ? tags.join(" · ") : "상태 없음"),
  );
}

/** @param {Ctx} ctx @param {DuelState} duel */
function handoffView(ctx, duel) {
  const p = duel.players[duel.active];
  return h(
    "section",
    { class: "duel duel--handoff" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, `Turn ${duel.turn}`),
      h("h1", null, `${p.name}의 차례`),
      h("p", null, `기기를 ${p.name}에게 넘겨 주세요. 상대는 화면을 보지 않습니다.`),
    ),
    h("div", { class: "duel__board" }, status(duel.players[0], "플레이어 1"), status(duel.players[1], "플레이어 2")),
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "button button--solid", "data-action": "reveal" }, "준비됐습니다 — 패 보기"),
    ),
  );
}

/** @param {Ctx} ctx @param {DuelState} duel */
function playView(ctx, duel) {
  const me = duel.players[duel.active];
  const foe = duel.players[duel.active === 0 ? 1 : 0];
  return h(
    "section",
    { class: "duel duel--play" },
    h("h1", { class: "label" }, `턴 ${duel.turn} · ${me.name}의 차례`),
    h(
      "div",
      { class: "duel__board" },
      status(foe, "상대"),
      h(
        "section",
        { class: "duel__log", "aria-labelledby": "duel-log" },
        h("h2", { id: "duel-log", class: "label muted" }, "기록"),
        h(
          "ol",
          null,
          duel.log.slice(-6).map((entry, i) => h("li", { "data-key": `log-${duel.log.length - 6 + i}` }, entry.text)),
        ),
      ),
      status(me, "나"),
    ),
    h(
      "div",
      { class: "duel__bar" },
      h("p", { class: "duel__energy" }, h("span", { class: "label muted" }, "에너지 "), `${me.energy}`),
      h("p", { class: "label muted" }, `상대의 손 ${foe.hand.length}장 · 뽑을 카드 ${me.draw.length}장`),
      h("button", { type: "button", class: "button button--solid", "data-action": "end-duel-turn" }, "차례 끝내기"),
    ),
    h(
      "ul",
      { class: "duel__hand", "aria-label": "내 손" },
      me.hand.map((instance) => {
        const ok = canPlayDuel(duel, instance.uid).ok;
        return h(
          "li",
          { "data-key": instance.uid },
          cardFace(getCard(instance.id, instance.up), {
            tag: "button",
            attrs: { "data-action": "duel-card", "data-uid": instance.uid, "aria-disabled": ok ? null : "true" },
          }),
        );
      }),
    ),
  );
}

/** @param {Ctx} ctx @param {DuelState} duel */
function overView(ctx, duel) {
  const winner = duel.players[/** @type {0 | 1} */ (duel.winner)];
  return h(
    "section",
    { class: "duel duel--over" },
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "display", lang: "en" }, "Victory"),
      h("h1", null, `${winner.name}의 승리`),
      h("p", null, `${withJosa(getClass(winner.classId).name, "이/가")} ${duel.turn}턴 만에 이겼습니다.`),
    ),
    h("div", { class: "duel__board" }, status(duel.players[0], "플레이어 1"), status(duel.players[1], "플레이어 2")),
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "button button--solid", "data-action": "rematch" }, "같은 클래스로 다시"),
      h("button", { type: "button", class: "button", "data-action": "new-duel" }, "클래스 다시 고르기"),
      h("a", { href: "#/", class: "button button--quiet" }, "처음 화면으로"),
    ),
  );
}

/** @param {Ctx} ctx */
function view(ctx) {
  const duel = duelOf(ctx);
  if (!duel) return setupView(ctx);
  if (duel.phase === "handoff") return handoffView(ctx, duel);
  if (duel.phase === "over") return overView(ctx, duel);
  return playView(ctx, duel);
}

/** @type {import("#app/render/app.js").Page} */
export const duelPage = {
  title: (ctx) => {
    const duel = duelOf(ctx);
    if (!duel) return "2인 듀얼";
    return duel.phase === "over" ? "듀얼 결과" : `${duel.players[duel.active].name}의 차례`;
  },
  surface: (ctx) => (duelOf(ctx)?.phase === "play" ? "dark" : "light"),
  context: (ctx) => {
    const duel = duelOf(ctx);
    return duel ? `2인 듀얼 · 턴 ${duel.turn}` : "2인 듀얼";
  },
  // 차례와 단계가 바뀔 때마다 새 화면으로 다뤄 제목으로 초점을 옮깁니다.
  screen: (ctx) => {
    const duel = duelOf(ctx);
    return duel ? `duel:${duel.phase}:${duel.turn}` : "duel:setup";
  },
  view,
  actions: {
    "random-class"(ctx, el) {
      const side = Number(el.dataset.side);
      const next = [...picks(ctx)];
      next[side] = CLASSES[Math.floor(Math.random() * CLASSES.length)].id;
      ctx.setUi({ classes: next });
      ctx.announce(`플레이어 ${side + 1}: ${getClass(next[side]).name}`);
    },
    "start-duel"(ctx) {
      ctx.setUi({ duel: startDuel({ seed: randomSeed(), classes: picks(ctx) }) });
    },
    reveal(ctx) {
      ctx.setUi({ duel: reveal(/** @type {DuelState} */ (duelOf(ctx))) });
    },
    "duel-card"(ctx, el) {
      const duel = /** @type {DuelState} */ (duelOf(ctx));
      const check = canPlayDuel(duel, /** @type {string} */ (el.dataset.uid));
      if (!check.ok) {
        ctx.announce(check.reason);
        return;
      }
      const next = playDuelCard(duel, /** @type {string} */ (el.dataset.uid));
      ctx.setUi({ duel: next });
      ctx.announce(next.log[next.log.length - 1]?.text ?? "");
    },
    "end-duel-turn"(ctx) {
      ctx.setUi({ duel: endDuelTurn(/** @type {DuelState} */ (duelOf(ctx))) });
    },
    rematch(ctx) {
      ctx.setUi({ duel: startDuel({ seed: randomSeed(), classes: picks(ctx) }) });
    },
    "new-duel"(ctx) {
      ctx.setUi({ duel: null });
    },
  },
  inputs: {
    "class-0": (ctx, el) => ctx.setUi({ classes: [el.value, picks(ctx)[1]] }),
    "class-1": (ctx, el) => ctx.setUi({ classes: [picks(ctx)[0], el.value] }),
  },
};
