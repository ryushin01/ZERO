import { ARMAMENT_SLOTS, ARMAMENTS } from "#entities/armament/index.js";
import { FIGURE_CARDS, getCard } from "#entities/card/index.js";
import { ENCOUNTERS } from "#entities/enemy/index.js";
import { figuresOf, getPantheon, PANTHEONS } from "#entities/figure/index.js";
import { factionStatus, perksOf } from "#entities/faction/index.js";
import { generateMap, reachableNodes } from "#entities/map/index.js";
import { RELICS } from "#entities/relic/index.js";
import { createRng, withJosa } from "#shared/lib/index.js";

import { startCombat } from "./combat.js";
import { getEvent, HIDDEN_EVENT, HIDDEN_EVENT_CHANCE } from "./events.js";

/**
 * 한 판의 흐름. 모든 함수는 run을 복사해 새 run을 돌려줍니다.
 *
 * @typedef {import("./combat.js").CardInstance} CardInstance
 * @typedef {import("./combat.js").CombatState} CombatState
 * @typedef {"map" | "battle" | "reward" | "rest" | "shrine" | "event" | "pick" | "victory" | "defeat"} Phase
 * @typedef {{ purpose: "remove" | "upgrade", count: number, title: string, then: Phase, cost?: { hp?: number } }} PickRequest
 * @typedef {{
 *   cards: string[], relics: string[], relicPick: boolean, cardTaken: boolean, relicTaken: boolean, title: string,
 *   armaments?: string[], armamentTaken?: boolean,
 * }} Reward
 * @typedef {{
 *   version: number, seed: number, rng: number, guide: string,
 *   hp: number, maxHp: number, deck: CardInstance[], relics: string[], ankhUsed: boolean, armaments: string[],
 *   act: 1 | 2 | 3, map: import("#entities/map/index.js").ActMap, position: { row: number, lane: number } | null,
 *   phase: Phase, combat: CombatState | null, reward: Reward | null, event: string | null, pick: PickRequest | null,
 *   lastEncounter: string, nextUid: number, notice: string | null, path: string[], recorded?: boolean,
 *   daily?: string | null, discovered?: string[],
 *   stats: { floors: number, battles: number, elites: number, bosses: number, defeatedBy: string | null },
 * }} Run
 */

export const RUN_VERSION = 2;
export const START_HP = 72;

/** @param {Run} run */
const clone = (run) => structuredClone(run);

/** @param {Run} run @param {(rng: ReturnType<typeof createRng>) => any} fn */
function roll(run, fn) {
  const rng = createRng(run.rng);
  const value = fn(rng);
  run.rng = rng.state;
  return value;
}

/** @param {Run} run @param {string} id @param {boolean} [up] @returns {CardInstance} */
function makeCard(run, id, up = false) {
  run.nextUid += 1;
  return { uid: `c${run.nextUid}`, id, up };
}

/** 길잡이로 고를 수 있는 신화 계열 (신이 셋 이상) */
export const GUIDE_PANTHEONS = PANTHEONS.filter((p) => figuresOf(p.slug).length >= 3);

/** 새 판에서 고를 길잡이 계열 셋 @param {number} seed */
export function guideOptions(seed) {
  return createRng(seed).sample(GUIDE_PANTHEONS, 3);
}

/** 길잡이 계열이 시작 덱에 넣어 주는 카드 둘 @param {string} pantheonSlug */
export function guideCards(pantheonSlug) {
  const figures = figuresOf(pantheonSlug);
  const rare = figures.find((f) => f.order === 2) ?? figures[0];
  const common = figures.find((f) => f.order >= 4) ?? figures.find((f) => f.order === 3) ?? figures[1];
  return [rare.slug, common.slug];
}

/**
 * @param {{ seed: number, guide: string, daily?: string | null, hidden?: boolean }} options
 * @returns {Run}
 */
export function createRun({ seed, guide, daily = null, hidden = false }) {
  /** @type {Run} */
  const run = {
    version: RUN_VERSION,
    seed,
    rng: seed ^ 0x5bd1e995,
    guide,
    hp: START_HP,
    maxHp: START_HP,
    deck: [],
    relics: [],
    armaments: [],
    ankhUsed: false,
    act: 1,
    map: generateMap(1, seed),
    position: null,
    phase: "map",
    combat: null,
    reward: null,
    event: null,
    pick: null,
    lastEncounter: "",
    nextUid: 0,
    notice: null,
    path: [],
    daily,
    discovered: [],
    stats: { floors: 0, battles: 0, elites: 0, bosses: 0, defeatedBy: null },
  };
  const ids = [
    ...Array.from({ length: 5 }, () => "quill"),
    ...Array.from({ length: 4 }, () => "shelf"),
    ...guideCards(guide),
  ];
  run.deck = ids.map((id) => makeCard(run, id));
  // 길잡이 신화에 전해지는 무구가 있으면 그것을, 없으면 아무 무구나 하나 들고 떠납니다.
  const native = ARMAMENTS.filter((a) => a.pantheon === guide);
  run.armaments = [roll(run, (rng) => rng.pick(native.length ? native : ARMAMENTS)).id];
  // 히든 캐릭터와 함께 시작하면 유신과 영혼의 검을 처음부터 듭니다. (무구 자리와 따로)
  if (hidden) {
    run.deck.push(makeCard(run, "yushin"));
    run.armaments.push("soul-sword");
  }
  return run;
}

/** 적 무리를 고릅니다. 같은 무리가 연달아 나오지 않게 합니다. @param {Run} run @param {"easy" | "normal" | "elite"} pool */
function chooseEncounter(run, pool) {
  const options = ENCOUNTERS[run.act][pool];
  const fresh = options.filter((group) => group.join() !== run.lastEncounter);
  const group = roll(run, (rng) => rng.pick(fresh.length ? fresh : options));
  run.lastEncounter = group.join();
  return group;
}

/** @param {Run} run @param {string[]} enemyIds @param {CombatState["tier"]} tier */
function beginBattle(run, enemyIds, tier) {
  run.phase = "battle";
  run.combat = startCombat({
    deck: run.deck,
    hp: run.hp,
    maxHp: run.maxHp,
    relics: run.relics,
    enemyIds,
    seed: roll(run, (rng) => rng.int(1, 2 ** 30)),
    tier,
    ankhUsed: run.ankhUsed,
    armaments: run.armaments,
    perks: perksOf(factionStatus(run.deck.map((c) => getCard(c.id).pantheonSlug))),
  });
}

/**
 * 지도에서 칸을 고릅니다.
 * @param {Run} prev @param {string} nodeId
 * @returns {Run}
 */
export function enterNode(prev, nodeId) {
  if (prev.phase !== "map") return prev;
  const node = reachableNodes(prev.map, prev.position).find((n) => n.id === nodeId);
  if (!node) return prev;
  const run = clone(prev);
  run.position = { row: node.row, lane: node.lane };
  run.path.push(node.id);
  run.stats.floors += 1;
  run.notice = null;

  switch (node.type) {
    case "battle":
      beginBattle(run, chooseEncounter(run, node.row <= 1 ? "easy" : "normal"), "normal");
      break;
    case "elite":
      beginBattle(run, chooseEncounter(run, "elite"), "elite");
      break;
    case "boss":
      beginBattle(run, ENCOUNTERS[run.act].boss, "boss");
      break;
    case "rest":
      run.phase = "rest";
      break;
    case "shrine":
      run.phase = "shrine";
      break;
    case "event":
      run.phase = "event";
      run.event = roll(run, (rng) =>
        !run.deck.some((c) => c.id === "yushin") && rng.float() < HIDDEN_EVENT_CHANCE
          ? HIDDEN_EVENT.id
          : rng.pick(["oracle", "mimir", "library", "lethe", "forge", "bari", "loki"]),
      );
      break;
    default:
      break;
  }
  return run;
}

/** 희귀도 가중치 */
const RARITY_WEIGHTS = {
  normal: { common: 60, rare: 37, legend: 3 },
  elite: { common: 30, rare: 58, legend: 12 },
  boss: { common: 0, rare: 0, legend: 1 },
};

/**
 * 카드 보상 후보. 길잡이 계열 카드가 더 자주 나옵니다.
 * @param {Run} run @param {CombatState["tier"]} tier @param {{ pantheon?: string, count?: number }} [options]
 */
function rollCards(run, tier, { pantheon, count } = {}) {
  const total = count ?? (run.relics.includes("sampo") ? 4 : 3);
  /** @type {string[]} */
  const picked = [];
  return roll(run, (rng) => {
    for (let guard = 0; picked.length < total && guard < 200; guard += 1) {
      const rarity = rng.weighted(RARITY_WEIGHTS[tier]);
      const fromGuide = !pantheon && rng.float() < 0.35;
      const pool = FIGURE_CARDS.filter(
        (c) =>
          c.rarity === rarity &&
          (pantheon ? c.pantheonSlug === pantheon : !fromGuide || c.pantheonSlug === run.guide) &&
          !picked.includes(c.id),
      );
      const fallback = FIGURE_CARDS.filter(
        (c) => (pantheon ? c.pantheonSlug === pantheon : true) && !picked.includes(c.id),
      );
      const choice = pool.length ? rng.pick(pool) : fallback.length ? rng.pick(fallback) : null;
      if (!choice) break;
      picked.push(choice.id);
    }
    return picked;
  });
}

/** @param {Run} run @param {number} count */
function rollRelics(run, count) {
  const unowned = RELICS.filter((r) => !run.relics.includes(r.id)).map((r) => r.id);
  return roll(run, (rng) => rng.sample(unowned, count));
}

/** @param {Run} run @param {string} id */
function gainRelic(run, id) {
  if (run.relics.includes(id)) return;
  run.relics.push(id);
  if (id === "amrita") {
    run.maxHp += 12;
    run.hp += 12;
  }
}

/**
 * 전투 상태를 받아 반영합니다. 끝났으면 보상이나 패배로 넘어갑니다.
 * @param {Run} prev @param {CombatState} combat
 * @returns {Run}
 */
export function updateCombat(prev, combat) {
  const run = clone(prev);
  run.combat = combat;
  run.hp = combat.player.hp;
  if (combat.ankhUsed && !run.ankhUsed) {
    run.ankhUsed = true;
    run.relics = run.relics.filter((r) => r !== "ankh");
  }
  if (combat.outcome === "lose") {
    run.phase = "defeat";
    run.stats.defeatedBy = combat.enemies.map((e) => e.id).join(",");
    return run;
  }
  if (combat.outcome !== "win") return run;

  run.combat = null;
  if (run.relics.includes("yeouiju")) run.hp = Math.min(run.maxHp, run.hp + 5);
  const endHeal = combat.perks?.endHeal ?? 0;
  if (endHeal) run.hp = Math.min(run.maxHp, run.hp + endHeal);
  const { tier } = combat;
  if (tier === "normal") run.stats.battles += 1;
  if (tier === "elite") run.stats.elites += 1;
  if (tier === "boss") run.stats.bosses += 1;

  run.phase = "reward";
  run.reward = {
    title: tier === "boss" ? "보스를 물리쳤습니다" : tier === "elite" ? "정예를 물리쳤습니다" : "괴물을 물리쳤습니다",
    cards: rollCards(run, tier),
    relics: tier === "boss" ? rollRelics(run, 3) : tier === "elite" ? rollRelics(run, 1) : [],
    relicPick: tier === "boss",
    cardTaken: false,
    relicTaken: false,
    armaments: tier === "elite" && run.armaments.length < ARMAMENT_SLOTS ? rollArmaments(run, 2) : [],
    armamentTaken: false,
  };
  return run;
}

/** 보상 카드를 덱에 넣습니다. @param {Run} prev @param {string} cardId */
export function takeCard(prev, cardId) {
  if (!prev.reward || prev.reward.cardTaken || !prev.reward.cards.includes(cardId)) return prev;
  const run = clone(prev);
  run.deck.push(makeCard(run, cardId));
  /** @type {Reward} */ (run.reward).cardTaken = true;
  return run;
}

/** 아직 없는 무구 후보 @param {Run} run @param {number} count */
function rollArmaments(run, count) {
  const unowned = ARMAMENTS.filter((a) => !run.armaments.includes(a.id)).map((a) => a.id);
  return roll(run, (rng) => rng.sample(unowned, count));
}

/** 보상 무구 하나를 고릅니다 @param {Run} prev @param {string} id */
export function takeArmament(prev, id) {
  const reward = prev.reward;
  if (!reward || reward.armamentTaken || !reward.armaments?.includes(id)) return prev;
  if (prev.armaments.length >= ARMAMENT_SLOTS) return prev;
  const run = clone(prev);
  run.armaments.push(id);
  /** @type {Reward} */ (run.reward).armamentTaken = true;
  return run;
}

/** @param {Run} prev @param {string} relicId */
export function takeRelic(prev, relicId) {
  if (!prev.reward || prev.reward.relicTaken || !prev.reward.relics.includes(relicId)) return prev;
  const run = clone(prev);
  gainRelic(run, relicId);
  const reward = /** @type {Reward} */ (run.reward);
  // 보스 보상은 하나만 고르고, 정예 보상은 하나뿐입니다.
  reward.relicTaken = true;
  return run;
}

/** 지금 칸이 보스였는지 @param {Run} run */
const atBoss = (run) => run.position !== null && run.position.row === run.map.rows.length - 1;

/**
 * 보상 화면을 닫고 지도나 다음 장, 승리로 넘어갑니다.
 * @param {Run} prev
 * @returns {Run}
 */
export function leaveReward(prev) {
  const run = clone(prev);
  run.reward = null;
  if (!atBoss(run)) {
    run.phase = "map";
    return run;
  }
  if (run.act === 3) {
    run.phase = "victory";
    return run;
  }
  run.act = /** @type {2 | 3} */ (run.act + 1);
  run.map = generateMap(run.act, run.seed);
  run.position = null;
  run.hp = run.relics.includes("golden-apple")
    ? run.maxHp
    : Math.min(run.maxHp, run.hp + Math.ceil((run.maxHp - run.hp) * 0.6));
  run.phase = "map";
  return run;
}

/** 쉼터에서 회복하는 양 @param {Run} run */
export const restAmount = (run) => Math.ceil(run.maxHp * 0.3 * (run.relics.includes("fleece") ? 1.5 : 1));

/** @param {Run} prev */
export function rest(prev) {
  const run = clone(prev);
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + restAmount(run));
  run.notice = `쉼터에서 체력 ${withJosa(run.hp - before, "을/를")} 회복했습니다.`;
  run.phase = "map";
  return run;
}

/**
 * 카드 고르기 화면을 엽니다. (쉼터·성소·사건)
 * @param {Run} prev @param {PickRequest} pick
 */
export function requestPick(prev, pick) {
  const run = clone(prev);
  run.phase = "pick";
  run.pick = pick;
  return run;
}

/** 고를 수 있는 카드 @param {Run} run */
export function pickableCards(run) {
  if (!run.pick) return [];
  return run.pick.purpose === "upgrade" ? run.deck.filter((c) => !c.up) : run.deck;
}

/**
 * 카드를 지우거나 강화합니다.
 * @param {Run} prev @param {string[]} uids
 */
export function resolvePick(prev, uids) {
  if (!prev.pick) return prev;
  const run = clone(prev);
  const pick = /** @type {PickRequest} */ (run.pick);
  if (pick.purpose === "remove") run.deck = run.deck.filter((c) => !uids.includes(c.uid));
  else run.deck = run.deck.map((c) => (uids.includes(c.uid) ? { ...c, up: true } : c));
  if (pick.cost?.hp) run.hp = Math.max(1, run.hp - pick.cost.hp);
  run.notice =
    pick.purpose === "remove" ? `카드 ${uids.length}장을 덜어 냈습니다.` : `카드 ${uids.length}장을 강화했습니다.`;
  run.phase = pick.then;
  run.pick = null;
  return run;
}

/** 고르지 않고 닫습니다 @param {Run} prev */
export function cancelPick(prev) {
  if (!prev.pick) return prev;
  const run = clone(prev);
  run.phase = "map";
  run.pick = null;
  return run;
}

/** 쉼터·성소·사건을 그냥 지나갑니다 @param {Run} prev */
export function skipToMap(prev) {
  const run = clone(prev);
  run.phase = "map";
  run.event = null;
  return run;
}

/**
 * 사건의 선택지를 고릅니다.
 * @param {Run} prev @param {string} choiceId
 */
export function chooseEvent(prev, choiceId) {
  if (!prev.event) return prev;
  const event = getEvent(prev.event);
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice || (choice.available && !choice.available(prev))) return prev;
  const run = clone(prev);
  run.event = null;
  run.phase = "map";
  run.notice = null;
  choice.apply(run, {
    roll: (fn) => roll(run, fn),
    makeCard: (id, up) => makeCard(run, id, up),
    rollCards: (tier, options) => rollCards(run, tier, options),
    rollRelics: (count) => rollRelics(run, count),
    gainRelic: (id) => gainRelic(run, id),
    pickPantheon: () => roll(run, (rng) => rng.pick(GUIDE_PANTHEONS)),
  });
  if (!run.notice && choice.result) run.notice = choice.result;
  return run;
}

/** 덱을 비용과 이름 순으로 @param {CardInstance[]} deck */
export function sortDeck(deck) {
  return [...deck].sort((a, b) => {
    const ca = getCard(a.id, a.up);
    const cb = getCard(b.id, b.up);
    return ca.cost - cb.cost || ca.name.localeCompare(cb.name, "ko") || Number(a.up) - Number(b.up);
  });
}

/** 저장된 run이 이 버전에서 읽을 수 있는지 @param {unknown} value @returns {value is Run} */
export function isRun(value) {
  return Boolean(value && typeof value === "object" && /** @type {Run} */ (value).version === RUN_VERSION);
}

/** 0.3.0에서 무구로 옮긴 옛 유물 */
const MOVED_RELICS = ["aegis", "kusanagi", "cheonbuin", "mjolnir", "gungnir"];

/**
 * 이전 버전의 저장을 지금 형식으로 옮깁니다. 옮길 수 없으면 null.
 * 1 → 2: 무구와 세력이 생겼고, 무기였던 유물이 무구가 되었습니다.
 * @param {unknown} value
 * @returns {Run | null}
 */
export function migrateRun(value) {
  if (!value || typeof value !== "object") return null;
  const saved = /** @type {any} */ (structuredClone(value));
  if (saved.version === RUN_VERSION) return saved;
  if (saved.version !== 1 || !Array.isArray(saved.deck)) return null;

  // 옛 유물 가운데 무기는 같은 이름의 무구로 바꿔 줍니다. (천부인 유물은 무구 천부인)
  const moved = (saved.relics ?? []).filter((id) => MOVED_RELICS.includes(id));
  saved.relics = (saved.relics ?? []).filter((id) => !MOVED_RELICS.includes(id));
  const native = ARMAMENTS.filter((a) => a.pantheon === saved.guide).map((a) => a.id);
  saved.armaments = [...new Set([...moved, ...(native.length ? [native[0]] : ["kerykeion"])])].slice(0, ARMAMENT_SLOTS);
  if (saved.reward) {
    saved.reward.relics = (saved.reward.relics ?? []).filter((id) => !MOVED_RELICS.includes(id));
    saved.reward.armaments = saved.reward.armaments ?? [];
    saved.reward.armamentTaken = saved.reward.armamentTaken ?? false;
  }
  if (saved.combat) {
    saved.combat.relics = saved.relics;
    saved.combat.armaments = saved.combat.armaments ?? saved.armaments.map((id) => ({ id, cd: 0 }));
    saved.combat.playedFigures = saved.combat.playedFigures ?? [];
    saved.combat.perks = saved.combat.perks ?? {};
  }
  saved.version = RUN_VERSION;
  return saved;
}

/** 길잡이 계열 이름 @param {Run} run */
export const guideName = (run) => getPantheon(run.guide)?.name ?? "";
