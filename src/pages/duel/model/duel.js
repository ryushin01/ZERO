import { DUEL_HP, getClass } from "./classes.js";
import { FIGURE_CARDS, getCard } from "#entities/card/index.js";
import { createRng, withJosa } from "#shared/lib/index.js";

/**
 * 2인 듀얼: 한 기기에서 두 사람이 번갈아 두는 핫시트 대전.
 * 각자 클래스를 고르면 그 클래스의 속성에 맞는 신·영웅 카드로 덱을 무작위로 짜고, 상대의 체력을 0으로 만들면 이깁니다.
 * 차례가 바뀌면 ‘넘기기’ 화면으로 상대의 손을 가립니다.
 *
 * @typedef {{ uid: string, id: string, up: boolean }} DuelCard
 * @typedef {{ strength: number, weak: number, vulnerable: number, erosion: number, evade: number, foundation: number }} DuelStatuses
 * @typedef {{
 *   name: string, classId: string, hp: number, maxHp: number, block: number, energy: number,
 *   statuses: DuelStatuses, raged: boolean,
 *   draw: DuelCard[], hand: DuelCard[], discard: DuelCard[], exhaust: DuelCard[],
 * }} Duelist
 * @typedef {{ text: string, side: 0 | 1 | null }} DuelLog
 * @typedef {{
 *   seed: number, rng: number, turn: number, active: 0 | 1, phase: "handoff" | "play" | "over",
 *   winner: 0 | 1 | null, players: [Duelist, Duelist], log: DuelLog[],
 * }} DuelState
 */

export const DUEL_HAND = 5;
export const DUEL_ENERGY = 3;
const MAX_HAND = 10;
/** 덱: 클래스 속성의 신·영웅 카드 10장 + 필봉 2장 + 서가 2장 */
const FIGURE_COUNT = 10;

const clone = (/** @type {DuelState} */ s) => structuredClone(s);

/** @param {DuelState} state @param {(rng: ReturnType<typeof createRng>) => any} fn */
function roll(state, fn) {
  const rng = createRng(state.rng);
  const result = fn(rng);
  state.rng = rng.state;
  return result;
}

/** @param {DuelState} state @param {string} text @param {0 | 1 | null} [side] */
const log = (state, text, side = null) => {
  state.log = [...state.log, { text, side }].slice(-30);
};

/**
 * 클래스의 속성에 맞는 신·영웅 카드로 덱을 무작위로 짭니다. 전설 카드는 두 장까지.
 * @param {string} classId @param {number} seed @param {string} prefix
 * @returns {DuelCard[]}
 */
export function buildDeck(classId, seed, prefix) {
  const cls = getClass(classId);
  const rng = createRng(seed);
  const pool = FIGURE_CARDS.filter(
    (c) => cls.aspects.includes(c.aspect) || (c.secondary && cls.aspects[0] === c.secondary),
  );
  const legends = rng.shuffle(pool.filter((c) => c.rarity === "legend")).slice(0, 2);
  const others = rng.shuffle(pool.filter((c) => c.rarity !== "legend")).slice(0, FIGURE_COUNT - legends.length);
  const ids = [...legends, ...others].map((c) => c.id);
  const all = [...ids, "quill", "quill", "shelf", "shelf"];
  return all.map((id, i) => ({ uid: `${prefix}-${i}`, id, up: false }));
}

/** @param {string} name @param {string} classId @param {DuelCard[]} deck @returns {Duelist} */
function makeDuelist(name, classId, deck) {
  const cls = getClass(classId);
  const maxHp = DUEL_HP + (cls.passive === "maxHp" ? cls.value : 0);
  return {
    name,
    classId,
    hp: maxHp,
    maxHp,
    block: 0,
    energy: 0,
    statuses: { strength: 0, weak: 0, vulnerable: 0, erosion: 0, evade: 0, foundation: 0 },
    raged: false,
    draw: deck,
    hand: [],
    discard: [],
    exhaust: [],
  };
}

/** @param {Duelist} p @param {string} kind */
const passive = (p, kind) => {
  const cls = getClass(p.classId);
  return cls.passive === kind ? cls.value : 0;
};

/** @param {DuelState} state @param {0 | 1} side @param {number} count */
function drawCards(state, side, count) {
  const p = state.players[side];
  for (let i = 0; i < count; i += 1) {
    if (p.hand.length >= MAX_HAND) return;
    if (p.draw.length === 0) {
      if (p.discard.length === 0) return;
      p.draw = roll(state, (rng) => rng.shuffle(p.discard));
      p.discard = [];
    }
    const card = p.draw.shift();
    if (card) p.hand.push(card);
  }
}

/**
 * 듀얼을 시작합니다. 첫 차례는 플레이어 1이고, 넘기기 화면부터 보여 줍니다.
 * @param {{ seed: number, classes: [string, string], names?: [string, string] }} options
 * @returns {DuelState}
 */
export function startDuel({ seed, classes, names = ["플레이어 1", "플레이어 2"] }) {
  const rng = createRng(seed);
  const decks = /** @type {[DuelCard[], DuelCard[]]} */ (
    classes.map((id, i) => rng.shuffle(buildDeck(id, seed + i * 7919, `p${i + 1}`)))
  );
  /** @type {DuelState} */
  const state = {
    seed,
    rng: rng.state,
    turn: 0,
    active: 0,
    phase: "handoff",
    winner: null,
    players: [makeDuelist(names[0], classes[0], decks[0]), makeDuelist(names[1], classes[1], decks[1])],
    log: [],
  };
  // 전투 시작 능력: 방어, 힘, 상대 약화·취약
  for (const side of /** @type {const} */ ([0, 1])) {
    const p = state.players[side];
    const foe = state.players[side === 0 ? 1 : 0];
    p.block += passive(p, "startBlock");
    p.statuses.strength += passive(p, "startStrength");
    foe.statuses.weak += passive(p, "weakenFoe");
    foe.statuses.vulnerable += passive(p, "vulnFoe");
  }
  log(
    state,
    `${state.players[0].name}(${getClass(classes[0]).name})와 ${state.players[1].name}(${getClass(classes[1]).name})의 듀얼이 시작됩니다.`,
  );
  beginTurn(state);
  return state;
}

/** 차례가 시작될 때: 침식, 능력, 에너지, 뽑기 @param {DuelState} state */
function beginTurn(state) {
  state.turn += 1;
  const side = state.active;
  const p = state.players[side];
  const first = state.turn <= 2;
  if (!first) p.block = 0;
  if (p.statuses.erosion > 0) {
    p.hp -= p.statuses.erosion;
    log(state, `${p.name}: 침식으로 체력 ${p.statuses.erosion} 잃음`, side);
    p.statuses.erosion -= 1;
    if (checkOver(state)) return;
  }
  p.block += passive(p, "turnBlock") + p.statuses.foundation;
  const heal = passive(p, "turnHeal");
  if (heal) p.hp = Math.min(p.maxHp, p.hp + heal);
  p.statuses.evade = passive(p, "evade");
  let energy = DUEL_ENERGY + (first ? passive(p, "firstEnergy") : 0);
  const blood = passive(p, "bloodcast");
  if (blood) {
    p.hp -= blood;
    energy += 1;
    if (checkOver(state)) return;
  }
  let extra = passive(p, "turnDraw");
  if (passive(p, "gamble")) {
    const pick = roll(state, (rng) => rng.int(0, 2));
    if (pick === 0) energy += 1;
    else if (pick === 1) extra += 1;
    else p.statuses.strength += 1;
    log(state, `${p.name}: 운에 맡긴 결과 ${["에너지 1", "카드 1장", "힘 1"][pick]}`, side);
  }
  p.energy = energy;
  drawCards(state, side, DUEL_HAND + extra);
}

/** @param {DuelState} state */
function checkOver(state) {
  for (const side of /** @type {const} */ ([0, 1])) {
    if (state.players[side].hp <= 0) {
      state.players[side].hp = 0;
      state.phase = "over";
      state.winner = side === 0 ? 1 : 0;
      log(state, `${withJosa(state.players[state.winner].name, "이/가")} 이겼습니다.`);
      return true;
    }
  }
  return false;
}

/** 넘기기 화면에서 패를 펼칩니다 @param {DuelState} prev */
export function reveal(prev) {
  if (prev.phase !== "handoff") return prev;
  const state = clone(prev);
  state.phase = "play";
  return state;
}

/** @param {DuelState} state @param {string} uid */
export function canPlayDuel(state, uid) {
  if (state.phase !== "play") return { ok: false, reason: "지금은 카드를 낼 수 없습니다." };
  const p = state.players[state.active];
  const instance = p.hand.find((c) => c.uid === uid);
  if (!instance) return { ok: false, reason: "손에 없는 카드입니다." };
  const card = getCard(instance.id, instance.up);
  if (card.cost > p.energy) return { ok: false, reason: `에너지가 부족합니다. (필요 ${card.cost}, 남은 ${p.energy})` };
  return { ok: true, reason: "" };
}

/**
 * 상대에게 피해를 줍니다. 방어·비행·관통을 반영하고 반격(가시)을 돌려받습니다.
 * @param {DuelState} state @param {0 | 1} from @param {number} amount @param {boolean} pierce
 */
function strike(state, from, amount, pierce) {
  const attacker = state.players[from];
  const target = state.players[from === 0 ? 1 : 0];
  let value = amount;
  if (target.statuses.vulnerable > 0) value = Math.floor(value * 1.5);
  if (target.statuses.evade > 0) {
    value = Math.floor(value / 2);
    target.statuses.evade -= 1;
  }
  const absorbed = pierce ? 0 : Math.min(target.block, value);
  target.block -= absorbed;
  const lost = value - absorbed;
  target.hp -= lost;
  const thorns = passive(target, "thorns");
  if (thorns) attacker.hp -= thorns;
  return lost;
}

/**
 * 카드를 냅니다. 피해·약화·취약·침식은 상대에게, 방어·회복·힘·뽑기·에너지는 자신에게 겁니다.
 * @param {DuelState} prev @param {string} uid
 */
export function playDuelCard(prev, uid) {
  if (!canPlayDuel(prev, uid).ok) return prev;
  const state = clone(prev);
  const side = state.active;
  const foeSide = side === 0 ? 1 : 0;
  const p = state.players[side];
  const foe = state.players[foeSide];
  const index = p.hand.findIndex((c) => c.uid === uid);
  const [instance] = p.hand.splice(index, 1);
  const card = getCard(instance.id, instance.up);
  p.energy -= card.cost;
  const parts = [];
  const pierce = passive(p, "pierce") > 0;
  for (const effect of card.effects) {
    switch (effect.op) {
      case "damage": {
        let value = effect.value + p.statuses.strength + passive(p, "damageBonus");
        if (p.statuses.weak > 0) value = Math.floor(value * 0.75);
        let dealt = 0;
        for (let i = 0; i < (effect.times ?? 1); i += 1) dealt += strike(state, side, Math.max(0, value), pierce);
        parts.push(`피해 ${dealt}`);
        break;
      }
      case "block":
        p.block += effect.value;
        parts.push(`방어 ${effect.value}`);
        break;
      case "heal":
        p.hp = Math.min(p.maxHp, p.hp + effect.value);
        parts.push(`체력 ${effect.value} 회복`);
        break;
      case "draw":
        drawCards(state, side, effect.value);
        parts.push(`카드 ${effect.value}장`);
        break;
      case "energy":
        p.energy += effect.value;
        parts.push(`에너지 ${effect.value}`);
        break;
      case "strength":
        p.statuses.strength += effect.value;
        parts.push(`힘 ${effect.value}`);
        break;
      case "foundation":
        p.statuses.foundation += effect.value;
        parts.push(`매 턴 방어 ${effect.value}`);
        break;
      case "erosion":
      case "weak":
      case "vulnerable":
        foe.statuses[effect.op] += effect.value;
        parts.push(`상대에게 ${{ erosion: "침식", weak: "약화", vulnerable: "취약" }[effect.op]} ${effect.value}`);
        break;
      default:
        break;
    }
  }
  if (card.type === "attack") {
    const steal = passive(p, "lifesteal");
    if (steal) p.hp = Math.min(p.maxHp, p.hp + steal);
    const poison = passive(p, "poison");
    if (poison) foe.statuses.erosion += poison;
  }
  if (card.exhaust || card.type === "power") p.exhaust.push(instance);
  else p.discard.push(instance);
  log(state, `${p.name}: ${card.name} — ${parts.join(", ") || "효과 없음"}`, side);
  // 광전사처럼 체력이 절반 아래로 떨어지면 힘을 얻습니다. (한 번)
  for (const who of [p, foe]) {
    const rage = passive(who, "rage");
    if (rage && !who.raged && who.hp > 0 && who.hp <= who.maxHp / 2) {
      who.raged = true;
      who.statuses.strength += rage;
    }
  }
  checkOver(state);
  return state;
}

/**
 * 차례를 끝냅니다. 소환한 것이 공격하고, 손을 버리고, 넘기기 화면으로 갑니다.
 * @param {DuelState} prev
 */
export function endDuelTurn(prev) {
  if (prev.phase !== "play") return prev;
  const state = clone(prev);
  const side = state.active;
  const p = state.players[side];
  const summon = passive(p, "summon");
  if (summon) {
    const lost = strike(state, side, summon, false);
    log(state, `${p.name}: 소환한 것이 피해 ${lost}`, side);
    if (checkOver(state)) return state;
  }
  const kept = p.hand.filter((c) => getCard(c.id, c.up).retain);
  p.discard.push(...p.hand.filter((c) => !getCard(c.id, c.up).retain));
  p.hand = kept;
  if (p.statuses.weak > 0) p.statuses.weak -= 1;
  if (p.statuses.vulnerable > 0) p.statuses.vulnerable -= 1;
  state.active = side === 0 ? 1 : 0;
  state.phase = "handoff";
  beginTurn(state);
  return state;
}
