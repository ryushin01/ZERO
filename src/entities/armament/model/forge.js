import { pickAspects } from "#entities/card/@x/armament.js";
import { getFigure } from "#entities/figure/@x/armament.js";

import { armamentIdOf, RELIC_FOES } from "./ark.js";

/**
 * Ark 유물로 ZERO의 무구를 만듭니다. 수치는 손으로 정하지 않고 유물의 생김새와 주인의 관장 영역에서 계산합니다.
 * 카드가 신의 관장 영역에서 효과를 얻는 것(entities/card/model/build.js)과 같은 방식입니다.
 *
 * - 생김새(form)가 효과의 모양과 비용·대기시간을 정합니다. 칼은 한 적을 크게, 철퇴는 모두를, 활은 세 번 나눠 칩니다.
 * - 무기와 방어구는 주인의 주 속성이 작은 효과를 덧붙이고, 그만큼 주 효과가 줄어듭니다.
 *   지혜의 신이 쥔 칼은 카드를 1장 뽑게 하고, 죽음의 신이 쥔 칼은 침식을 남깁니다.
 * - 효과의 수치는 ZERO가 먼저 정한 무구와 같습니다(칼 = 갈라틴, 창 = 궁니르, 활 = 간디바, 방패 = 아이기스 등).
 *   다만 쉬는 턴은 하나씩 깁니다. 무구가 39점에서 143점으로 늘며 거의 모든 계열이 제 무구를 들고 시작하게 되었기 때문입니다.
 *
 * @typedef {import("./ark.js").Form} Form
 * @typedef {import("./ark.js").ArkRelic} ArkRelic
 * @typedef {import("#entities/card/@x/armament.js").Aspect} Aspect
 * @typedef {{ op: string, value: number, all?: boolean, times?: number, pierce?: boolean }} ForgedEffect
 */

/** 생김새마다 비용, 대기시간, 효과 @type {Record<Form, { cost: number, cooldown: number, effects: ForgedEffect[] }>} */
export const FORMS = {
  blade: { cost: 1, cooldown: 3, effects: [{ op: "damage", value: 10 }] },
  spear: { cost: 1, cooldown: 4, effects: [{ op: "damage", value: 11, pierce: true }] },
  bow: { cost: 1, cooldown: 3, effects: [{ op: "damage", value: 4, times: 3 }] },
  blunt: { cost: 1, cooldown: 3, effects: [{ op: "damage", value: 7, all: true }] },
  bolt: { cost: 2, cooldown: 4, effects: [{ op: "damage", value: 12, all: true }] },
  disc: { cost: 1, cooldown: 3, effects: [{ op: "damage", value: 6, times: 2 }] },
  shield: {
    cost: 1,
    cooldown: 4,
    effects: [
      { op: "block", value: 12 },
      { op: "weak", value: 1, all: true },
    ],
  },
  armor: { cost: 1, cooldown: 4, effects: [{ op: "block", value: 14 }] },
  veil: {
    cost: 0,
    cooldown: 4,
    effects: [
      { op: "block", value: 6 },
      { op: "draw", value: 1 },
    ],
  },
  bind: {
    cost: 1,
    cooldown: 4,
    effects: [
      { op: "weak", value: 2, all: true },
      { op: "vulnerable", value: 1, all: true },
    ],
  },
  vessel: {
    cost: 1,
    cooldown: 4,
    effects: [
      { op: "heal", value: 5 },
      { op: "block", value: 6 },
    ],
  },
  elixir: {
    cost: 1,
    cooldown: 4,
    effects: [
      { op: "heal", value: 6 },
      { op: "cleanse", value: 1 },
    ],
  },
  horn: { cost: 0, cooldown: 5, effects: [{ op: "strength", value: 2 }] },
  lyre: {
    cost: 0,
    cooldown: 4,
    effects: [
      { op: "weak", value: 1, all: true },
      { op: "draw", value: 1 },
    ],
  },
  mirror: {
    cost: 0,
    cooldown: 4,
    effects: [
      { op: "vulnerable", value: 1, all: true },
      { op: "draw", value: 1 },
    ],
  },
  jewel: {
    cost: 0,
    cooldown: 5,
    effects: [
      { op: "strength", value: 1 },
      { op: "energy", value: 1 },
    ],
  },
  ride: {
    cost: 0,
    cooldown: 4,
    effects: [
      { op: "energy", value: 1 },
      { op: "draw", value: 1 },
    ],
  },
  scroll: { cost: 0, cooldown: 3, effects: [{ op: "draw", value: 2 }] },
  staff: { cost: 0, cooldown: 4, effects: [{ op: "energy", value: 2 }] },
  stone: {
    cost: 1,
    cooldown: 4,
    effects: [
      { op: "block", value: 10 },
      { op: "strength", value: 1 },
    ],
  },
  hoard: {
    cost: 0,
    cooldown: 5,
    effects: [
      { op: "energy", value: 1 },
      { op: "draw", value: 2 },
    ],
  },
};

/** 이름으로 생김새를 가리지 못한 도구는 주인의 주 속성을 따릅니다. @type {Record<Aspect, Form>} */
const TOOL_BY_ASPECT = { war: "horn", guard: "stone", wisdom: "scroll", life: "elixir", doom: "bind", sky: "staff" };

const ATTACK_FORMS = new Set(["blade", "spear", "bow", "blunt", "bolt", "disc"]);
const GUARD_FORMS = new Set(["shield", "armor", "stone"]);

/**
 * 주인의 주 속성이 무기에 덧붙이는 효과. 주 효과는 scale만큼으로 줄입니다. 전투의 신은 무기를 온전히 휘두릅니다.
 * @type {Record<Aspect, { scale: number, add: ForgedEffect } | null>}
 */
const ATTACK_TOUCH = {
  war: null,
  guard: { scale: 0.75, add: { op: "block", value: 4 } },
  wisdom: { scale: 0.8, add: { op: "draw", value: 1 } },
  life: { scale: 0.8, add: { op: "heal", value: 3 } },
  doom: { scale: 0.75, add: { op: "erosion", value: 3 } },
  sky: { scale: 0.8, add: { op: "strength", value: 1 } },
};

/** 주인의 주 속성이 방어구에 덧붙이는 효과. 수호의 신은 방어구를 온전히 씁니다. @type {typeof ATTACK_TOUCH} */
const GUARD_TOUCH = {
  war: { scale: 0.75, add: { op: "damage", value: 5 } },
  guard: null,
  wisdom: { scale: 0.8, add: { op: "draw", value: 1 } },
  life: { scale: 0.8, add: { op: "heal", value: 3 } },
  doom: { scale: 0.8, add: { op: "weak", value: 1, all: true } },
  sky: { scale: 0.8, add: { op: "strength", value: 1 } },
};

/** 무구 카드에 적는 주인 이름. 넷 이상이면 셋까지 적고 "등"을 붙입니다. @param {string[]} names */
const ownerLabel = (names) => (names.length > 3 ? `${names.slice(0, 3).join("·")} 등` : names.join("·"));

/**
 * 생김새와 주 속성으로 효과를 만듭니다.
 * @param {Form} form @param {Aspect} aspect
 * @returns {ForgedEffect[]}
 */
export function forgeEffects(form, aspect) {
  const effects = FORMS[form].effects.map((effect) => ({ ...effect }));
  const touch = ATTACK_FORMS.has(form) ? ATTACK_TOUCH[aspect] : GUARD_FORMS.has(form) ? GUARD_TOUCH[aspect] : null;
  if (!touch) return effects;
  const [main] = effects;
  main.value = Math.max(1, Math.round(main.value * touch.scale));
  // 모두를 치는 무기에는 한 적에게 남는 침식 대신 모두에게 취약을 겁니다.
  const add = touch.add.op === "erosion" && main.all ? { op: "vulnerable", value: 1, all: true } : touch.add;
  const same = effects.find(
    (e) => e.op === add.op && Boolean(e.all) === Boolean(add.all) && (e.times ?? 1) === 1 && !e.pierce,
  );
  if (same) same.value += add.value;
  else effects.push({ ...add });
  return effects;
}

/**
 * Ark 유물 하나로 무구를 만듭니다. 첫 번째 주인이 무구의 계열과 속성을 정하고, 유물 이야기에서 주인과 맞선 인물은 주인에서 뺍니다.
 * @param {ArkRelic} relic
 * @returns {import("./armaments.js").ArmamentDef}
 */
export function forgeArmament(relic) {
  const foes = RELIC_FOES[relic.slug] ?? [];
  const owners = relic.figureSlugs
    .filter((slug) => !foes.includes(slug))
    .map((slug) => getFigure(slug))
    .filter((figure) => figure !== undefined);
  const [lead] = owners;
  const aspect = lead ? pickAspects(lead.domains).primary : "war";
  // 생김새는 동기화 때 이름으로 가려 두었습니다(ark.js의 formOf). 가리지 못한 도구는 주인의 속성을 따릅니다.
  const form = relic.form ?? TOOL_BY_ASPECT[aspect];
  const { cost, cooldown } = FORMS[form];
  return {
    id: /** @type {string} */ (armamentIdOf(relic.slug)),
    name: relic.name,
    owner: ownerLabel(owners.map((figure) => figure.name)),
    owners: owners.map((figure) => figure.slug),
    pantheon: lead?.pantheonSlug ?? "",
    cost,
    cooldown,
    effects: /** @type {import("./armaments.js").ArmamentDef["effects"]} */ (forgeEffects(form, aspect)),
    bonus: "power",
    lore: "",
    sources: [],
    ark: relic.slug,
    form,
  };
}
