import { FIGURES, getPantheon } from "#entities/figure/@x/card.js";

import { hasAny, pickAspects, SKY_CREATION, SKY_SUN, TRAITS } from "./aspects.js";

/**
 * @typedef {import("./aspects.js").Aspect} Aspect
 * @typedef {"basic" | "common" | "rare" | "legend"} Rarity
 * @typedef {"attack" | "skill" | "power"} CardType
 * @typedef {"damage" | "block" | "draw" | "heal" | "energy" | "strength" | "foundation" | "erosion" | "vulnerable" | "weak"} EffectOp
 * @typedef {{ op: EffectOp, value: number, times?: number, all?: boolean }} Effect
 * @typedef {{
 *   id: string,
 *   figureSlug: string | null,
 *   pantheonSlug: string | null,
 *   continent: string | null,
 *   name: string,
 *   nameEn: string,
 *   epithet: string,
 *   summary: string,
 *   domains: string[],
 *   rarity: Rarity,
 *   type: CardType,
 *   aspect: Aspect,
 *   secondary: Aspect | null,
 *   cost: number,
 *   effects: Effect[],
 *   exhaust: boolean,
 *   retain: boolean,
 *   target: "enemy" | "none",
 *   upgraded: boolean,
 *   source: "ark" | "zero" | "basic", wiki: string | null,
 * }} CardDef
 */

/** 희귀도와 비용별 효과의 몫. 기본 카드 「필봉」(피해 6)이 1입니다. */
const BUDGET = {
  normal: { common: 1.35, rare: 1.6, legend: 3.2 },
  trick: { common: 0.8, rare: 0.95, legend: 1.25 },
};

/** 효과마다 몫 1에 해당하는 수치 */
const RATE = {
  damage: 6,
  damageAll: 4.5,
  damageTwice: 3.2,
  block: 5.5,
  draw: 1.6,
  heal: 2.2,
  lifeBlock: 3.6,
  erosion: 3.5,
  strength: 1.4,
  foundation: 2.4,
};

const ENEMY_OPS = new Set(["damage", "erosion", "vulnerable", "weak"]);
const POWER_OPS = new Set(["strength", "foundation"]);

/** @param {number} value @param {number} [min] */
const amount = (value, min = 1) => Math.max(min, Math.round(value));

/**
 * 주 속성이 내는 효과
 * @param {Aspect} aspect @param {number} units @param {string[]} domains
 * @returns {Effect[]}
 */
function primaryEffects(aspect, units, domains) {
  switch (aspect) {
    case "war":
      if (hasAny(domains, TRAITS.thunder)) return [{ op: "damage", value: amount(RATE.damageAll * units), all: true }];
      if (hasAny(domains, TRAITS.storm)) return [{ op: "damage", value: amount(RATE.damageTwice * units), times: 2 }];
      return [{ op: "damage", value: amount(RATE.damage * units) }];
    case "guard":
      return [{ op: "block", value: amount(RATE.block * units) }];
    case "wisdom":
      return [{ op: "draw", value: amount(RATE.draw * units) }];
    case "life":
      return [
        { op: "block", value: amount(RATE.lifeBlock * units) },
        { op: "heal", value: amount(RATE.heal * units, 1) },
      ];
    case "doom":
      return [{ op: "erosion", value: amount(RATE.erosion * units) }];
    case "sky":
      if (hasAny(domains, SKY_SUN)) return [{ op: "damage", value: amount(RATE.damageAll * units), all: true }];
      if (hasAny(domains, SKY_CREATION)) return [{ op: "foundation", value: amount(RATE.foundation * units) }];
      return [{ op: "strength", value: amount(RATE.strength * units) }];
    default:
      return [];
  }
}

/**
 * 보조 속성이 덧붙이는 작은 효과
 * @param {Aspect} aspect @param {number} units @param {string[]} domains
 * @returns {Effect[]}
 */
function secondaryEffects(aspect, units, domains) {
  switch (aspect) {
    case "war":
      return hasAny(domains, TRAITS.thunder)
        ? [{ op: "damage", value: amount(RATE.damageAll * units, 2), all: true }]
        : [{ op: "damage", value: amount(RATE.damage * units, 2) }];
    case "guard":
      return [{ op: "block", value: amount(RATE.block * units, 2) }];
    case "wisdom":
      return [{ op: "draw", value: 1 }];
    case "life":
      return [{ op: "heal", value: amount(RATE.heal * units * 1.6, 1) }];
    case "doom":
      return [{ op: "vulnerable", value: amount(units * 1.2) }];
    case "sky":
      return units >= 0.9 ? [{ op: "energy", value: 1 }] : [{ op: "block", value: amount(RATE.block * units, 2) }];
    default:
      return [];
  }
}

/** 같은 효과는 하나로 합칩니다. 피해는 대상과 횟수가 같을 때만 합칩니다. @param {Effect[]} effects */
function merge(effects) {
  /** @type {Effect[]} */
  const merged = [];
  for (const effect of effects) {
    const same = merged.find(
      (e) => e.op === effect.op && Boolean(e.all) === Boolean(effect.all) && (e.times ?? 1) === (effect.times ?? 1),
    );
    if (same) same.value += effect.value;
    else merged.push({ ...effect });
  }
  return merged;
}

/** @param {Effect[]} effects @param {boolean} power @returns {CardType} */
function typeOf(effects, power) {
  if (power) return "power";
  return effects.some((e) => e.op === "damage") ? "attack" : "skill";
}

/** @param {Effect[]} effects */
const needsTarget = (effects) => effects.some((e) => ENEMY_OPS.has(e.op) && !e.all);

/**
 * Ark의 신 한 명을 카드로 만듭니다.
 * @param {import("#entities/figure/@x/card.js").Figure} figure
 * @returns {CardDef}
 */
export function buildFigureCard(figure) {
  const pantheon = getPantheon(figure.pantheonSlug);
  const { domains } = figure;
  const { primary, secondary } = pickAspects(domains);
  /** @type {Rarity} */
  const rarity = figure.rarity ?? (figure.order === 1 ? "legend" : figure.order <= 3 ? "rare" : "common");
  const trick = hasAny(domains, TRAITS.trick);
  const units = BUDGET[trick ? "trick" : "normal"][rarity];
  const cost = trick ? 0 : rarity === "legend" ? 2 : 1;

  const main = primaryEffects(primary, units * (secondary ? 0.75 : 1), domains);
  const extra = secondary ? secondaryEffects(secondary, units * 0.35, domains) : [];
  const effects = merge([...main, ...extra]);
  const power = main.some((e) => POWER_OPS.has(e.op));
  const bigHeal = effects.some((e) => e.op === "heal" && e.value >= 4);

  return {
    id: figure.slug,
    figureSlug: figure.slug,
    pantheonSlug: figure.pantheonSlug,
    continent: pantheon?.continent ?? null,
    name: figure.name,
    nameEn: figure.nameEn,
    epithet: figure.epithet,
    summary: figure.summary,
    domains,
    rarity,
    type: typeOf(effects, power),
    aspect: primary,
    secondary,
    cost,
    effects,
    exhaust: bigHeal && !power,
    retain: hasAny(domains, TRAITS.rebirth),
    target: needsTarget(effects) ? "enemy" : "none",
    upgraded: false,
    source: figure.source ?? "ark",
    wiki: figure.wiki ?? null,
  };
}

/** 사서가 처음 들고 시작하는 기본 카드 @type {CardDef[]} */
export const BASIC_CARDS = [
  {
    id: "quill",
    figureSlug: null,
    pantheonSlug: null,
    continent: null,
    name: "필봉",
    nameEn: "Quill",
    epithet: "사서의 붓끝",
    summary: "Ark의 사서가 기록을 지우려는 것을 붓끝으로 찌릅니다.",
    domains: [],
    rarity: "basic",
    type: "attack",
    aspect: "war",
    secondary: null,
    cost: 1,
    effects: [{ op: "damage", value: 6 }],
    exhaust: false,
    retain: false,
    target: "enemy",
    upgraded: false,
    source: "basic",
    wiki: null,
  },
  {
    id: "shelf",
    figureSlug: null,
    pantheonSlug: null,
    continent: null,
    name: "서가",
    nameEn: "Shelf",
    epithet: "사서의 방벽",
    summary: "책장을 세워 날아드는 망각을 막습니다.",
    domains: [],
    rarity: "basic",
    type: "skill",
    aspect: "guard",
    secondary: null,
    cost: 1,
    effects: [{ op: "block", value: 5 }],
    exhaust: false,
    retain: false,
    target: "none",
    upgraded: false,
    source: "basic",
    wiki: null,
  },
];

/** 신 카드 전체 (Ark의 신과 영웅 순서) */
export const FIGURE_CARDS = FIGURES.map(buildFigureCard);

const CATALOG = new Map([...BASIC_CARDS, ...FIGURE_CARDS].map((card) => [card.id, card]));

/** @param {number} value @param {EffectOp} op */
function raise(value, op) {
  if (op === "energy") return value;
  if (op === "draw" || op === "strength" || op === "foundation" || op === "vulnerable" || op === "weak")
    return value + 1;
  return value + Math.max(2, Math.round(value * 0.33));
}

/**
 * 카드 정의를 찾습니다. 강화된 카드는 수치를 올린 사본을 돌려줍니다.
 * @param {string} id @param {boolean} [upgraded]
 * @returns {CardDef}
 */
export function getCard(id, upgraded = false) {
  const base = CATALOG.get(id);
  if (!base) throw new Error(`알 수 없는 카드: ${id}`);
  if (!upgraded) return base;
  return {
    ...base,
    upgraded: true,
    effects: base.effects.map((effect) => ({ ...effect, value: raise(effect.value, effect.op) })),
  };
}

/** @param {string} id */
export const hasCard = (id) => CATALOG.has(id);
