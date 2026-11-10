import { ACT_INFO } from "#entities/map/index.js";

import { battleEffects } from "./battle-fx.js";
import { battleActions, battleKeydown, battleView } from "./battle-view.js";
import { campActions, eventView, restView, shrineView } from "./camp-view.js";
import { endActions, endView } from "./end-view.js";
import { mapActions, mapView } from "./map-view.js";
import { pickActions, pickView } from "./pick-view.js";
import { rewardActions, rewardView } from "./reward-view.js";

import "./run-page.css";

/** @typedef {import("#app/render/app.js").PageContext} Ctx */

const VIEWS = {
  map: { view: mapView, title: "지도", surface: "light" },
  battle: { view: battleView, title: "전투", surface: "dark" },
  reward: { view: rewardView, title: "보상", surface: "light" },
  rest: { view: restView, title: "쉼터", surface: "light" },
  shrine: { view: shrineView, title: "성소", surface: "light" },
  event: { view: eventView, title: "사건", surface: "light" },
  pick: { view: pickView, title: "카드 고르기", surface: "light" },
  victory: { view: endView, title: "승리", surface: "dark" },
  defeat: { view: endView, title: "패배", surface: "dark" },
};

/** @param {Ctx} ctx */
const phaseOf = (ctx) => VIEWS[/** @type {keyof typeof VIEWS} */ (ctx.run?.phase ?? "map")] ?? VIEWS.map;

/** @type {import("#app/render/app.js").Page} */
export const runPage = {
  redirect: (ctx) => (ctx.run ? null : "#/new"),
  // 같은 단계 안에서는 다시 그리기만 하고, 단계가 바뀌면 새 화면으로 다룹니다.
  screen: (ctx) =>
    `run:${ctx.run?.phase ?? "none"}:${ctx.run?.phase === "battle" || ctx.run?.phase === "event" ? ctx.run.path.length : ""}`,
  title: (ctx) => phaseOf(ctx).title,
  surface: (ctx) => /** @type {"dark" | "light"} */ (phaseOf(ctx).surface),
  context: (ctx) => {
    const run = ctx.run;
    if (!run) return "";
    return `${run.act}장 · ${ACT_INFO[run.act].title} — 체력 ${run.combat ? run.combat.player.hp : run.hp}/${run.maxHp}`;
  },
  view: (ctx) => phaseOf(ctx).view(ctx),
  actions: { ...mapActions, ...battleActions, ...rewardActions, ...campActions, ...pickActions, ...endActions },
  afterRender: (ctx, main) => {
    if (ctx.run?.phase === "battle") battleEffects(main);
  },
  keydown: (ctx, event) => {
    if (ctx.run?.phase === "battle") battleKeydown(ctx, event);
  },
};
