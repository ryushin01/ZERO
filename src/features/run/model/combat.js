import { getArmament } from "#entities/armament/index.js";
import { describeEffect, getCard } from "#entities/card/index.js";
import { getEnemy, isNemesis } from "#entities/enemy/index.js";
import { createRng, withJosa } from "#shared/lib/index.js";

/**
 * 전투 엔진. 모든 함수는 상태를 복사해 새 상태를 돌려주는 순수 함수입니다.
 * 화면은 상태만 그리고, 규칙은 모두 여기 있습니다.
 *
 * @typedef {{ uid: string, id: string, up: boolean }} CardInstance
 * @typedef {{ strength: number, weak: number, vulnerable: number, erosion: number }} Statuses
 * @typedef {{
 *   uid: string, id: string, hp: number, maxHp: number, block: number,
 *   statuses: Statuses, heads: number, intent: number,
 * }} EnemyState
 * @typedef {{ hp: number, maxHp: number, block: number, statuses: Statuses & { eclipse: number, foundation: number } }} PlayerState
 * @typedef {{ text: string, tone: "player" | "enemy" | "info" }} LogEntry
 * @typedef {{
 *   turn: number, energy: number, maxEnergy: number,
 *   player: PlayerState, enemies: EnemyState[],
 *   draw: CardInstance[], hand: CardInstance[], discard: CardInstance[], exhaust: CardInstance[], powers: CardInstance[],
 *   chain: { pantheon: string, continent: string | null } | null,
 *   attackPlayed: boolean, relics: string[], ankhUsed: boolean,
 *   armaments: { id: string, cd: number }[], playedFigures: string[], perks: import("#entities/faction/index.js").Perks,
 *   rng: number, log: LogEntry[], history: LogEntry[], outcome: "win" | "lose" | null, tier: "normal" | "elite" | "boss",
 * }} CombatState
 */

export const HAND_SIZE = 5;
export const MAX_HAND = 10;
export const BASE_ENERGY = 3;

const RESONANCE = 1.5;
const ECHO = 1.25;
const NEMESIS = 1.5;

const emptyStatuses = () => ({ strength: 0, weak: 0, vulnerable: 0, erosion: 0 });

/** @param {CombatState} state */
const clone = (state) => structuredClone(state);

/** @param {CombatState} state @param {string} text @param {LogEntry["tone"]} [tone] */
const log = (state, text, tone = "info") => state.log.push({ text, tone });

/** 상태 안의 난수 상태로 한 번 굴립니다 @param {CombatState} state */
function withRng(state, fn) {
  const rng = createRng(state.rng);
  const result = fn(rng);
  state.rng = rng.state;
  return result;
}

/**
 * @param {{
 *   deck: CardInstance[], hp: number, maxHp: number, relics: string[],
 *   enemyIds: string[], seed: number, tier?: CombatState["tier"], ankhUsed?: boolean,
 *   armaments?: string[], perks?: CombatState["perks"],
 * }} options
 * @returns {CombatState}
 */
export function startCombat({
  deck,
  hp,
  maxHp,
  relics,
  enemyIds,
  seed,
  tier = "normal",
  ankhUsed = false,
  armaments = [],
  perks = {},
}) {
  const rng = createRng(seed);
  /** @type {CombatState} */
  const state = {
    turn: 0,
    energy: 0,
    maxEnergy: BASE_ENERGY,
    player: { hp, maxHp, block: 0, statuses: { ...emptyStatuses(), eclipse: 0, foundation: 0 } },
    enemies: enemyIds.map((id, index) => {
      const def = getEnemy(id);
      const maxHpRoll = rng.int(def.hp[0], def.hp[1]);
      return {
        uid: `${id}-${index}`,
        id,
        hp: maxHpRoll,
        maxHp: maxHpRoll,
        block: 0,
        statuses: emptyStatuses(),
        heads: def.heads ?? 1,
        // 같은 적이 여럿이면 행동이 겹치지 않게 시작을 엇갈립니다.
        intent: def.tier === "boss" ? 0 : (index + rng.int(0, def.intents.length - 1)) % def.intents.length,
      };
    }),
    draw: rng.shuffle(deck),
    hand: [],
    discard: [],
    exhaust: [],
    powers: [],
    chain: null,
    attackPlayed: false,
    relics,
    ankhUsed,
    armaments: armaments.map((id) => ({ id, cd: 0 })),
    playedFigures: [],
    perks,
    rng: rng.state,
    log: [],
    history: [],
    outcome: null,
    tier,
  };

  applyStartPerks(state);
  if (relics.includes("feather")) {
    for (const enemy of state.enemies) enemy.statuses.weak += 1;
    log(state, "마아트의 깃털: 모든 적에게 약화 1");
  }
  const names = state.enemies.map((e) => getEnemy(e.id).name).join(", ");
  log(state, `${withJosa(names, "이/가")} 나타났습니다.`, "enemy");
  beginPlayerTurn(state);
  return remember(state);
}

/** 세력이 전투 시작에 거는 효과 @param {CombatState} state */
function applyStartPerks(state) {
  const p = state.perks;
  const parts = [];
  if (p.startBlock) {
    state.player.block += p.startBlock;
    parts.push(`방어 ${p.startBlock}`);
  }
  if (p.startStrength) {
    state.player.statuses.strength += p.startStrength;
    parts.push(`힘 ${p.startStrength}`);
  }
  for (const [kind, status, label] of /** @type {const} */ ([
    ["startWeakAll", "weak", "약화"],
    ["startVulnAll", "vulnerable", "취약"],
    ["startErosionAll", "erosion", "침식"],
  ])) {
    if (!p[kind]) continue;
    for (const enemy of state.enemies) enemy.statuses[status] += p[kind];
    parts.push(`모든 적에게 ${label} ${p[kind]}`);
  }
  if (p.startDamageAll) {
    for (const enemy of state.enemies) hitEnemy(state, enemy, p.startDamageAll);
    parts.push(`모든 적에게 피해 ${p.startDamageAll}`);
  }
  if (parts.length) log(state, `세력의 힘: ${parts.join(", ")}`, "player");
}

/** @param {CombatState} state @param {number} count */
function drawCards(state, count) {
  for (let i = 0; i < count; i += 1) {
    if (state.hand.length >= MAX_HAND) return;
    if (state.draw.length === 0) {
      if (state.discard.length === 0) return;
      state.draw = withRng(state, (rng) => rng.shuffle(state.discard));
      state.discard = [];
    }
    const card = state.draw.shift();
    if (card) state.hand.push(card);
  }
}

/** @param {CombatState} state */
function beginPlayerTurn(state) {
  state.turn += 1;
  const { player } = state;
  player.block = state.turn === 1 ? player.block : 0;

  if (player.statuses.erosion > 0) {
    player.hp -= player.statuses.erosion;
    log(state, `침식으로 체력 ${withJosa(player.statuses.erosion, "을/를")} 잃었습니다.`, "enemy");
    player.statuses.erosion -= 1;
    if (checkDefeat(state)) return;
  }
  if (state.perks.turnBlock) player.block += state.perks.turnBlock;
  if (state.perks.turnHeal && player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + state.perks.turnHeal);
    log(state, `세력의 힘으로 체력 ${state.perks.turnHeal} 회복`, "player");
  }
  if (state.turn > 1) for (const arm of state.armaments) arm.cd = Math.max(0, arm.cd - 1);
  if (player.statuses.foundation > 0) {
    player.block += player.statuses.foundation;
    log(state, `권능으로 ${withJosa(`방어 ${player.statuses.foundation}`, "을/를")} 얻었습니다.`, "player");
  }

  let energy = BASE_ENERGY - player.statuses.eclipse;
  if (player.statuses.eclipse > 0) log(state, `일식으로 에너지가 ${player.statuses.eclipse} 줄었습니다.`, "enemy");
  player.statuses.eclipse = 0;
  if (state.turn === 1) energy += state.perks.firstEnergy ?? 0;
  if (state.turn % 3 === 0 && state.relics.includes("draupnir")) energy += 1;
  state.energy = Math.max(0, energy);
  state.maxEnergy = BASE_ENERGY;

  state.chain = null;
  state.attackPlayed = false;
  state.playedFigures = [];
  const extra = state.turn === 1 ? (state.relics.includes("ariadne") ? 2 : 0) + (state.perks.firstDraw ?? 0) : 0;
  drawCards(state, HAND_SIZE + extra);
}

/** 쓰러졌는지 보고, 앙크가 있으면 한 번 되살립니다 @param {CombatState} state */
function checkDefeat(state) {
  if (state.player.hp > 0) return false;
  if (state.relics.includes("ankh") && !state.ankhUsed) {
    state.ankhUsed = true;
    state.player.hp = Math.floor(state.player.maxHp / 2);
    log(state, `앙크가 빛나며 체력 ${withJosa(state.player.hp, "으로/로")} 되살아났습니다.`, "player");
    return false;
  }
  state.player.hp = 0;
  state.outcome = "lose";
  log(state, "기록이 모두 지워졌습니다.", "enemy");
  return true;
}

/** @param {CombatState} state */
function checkVictory(state) {
  if (state.outcome) return true;
  if (state.enemies.every((e) => e.hp <= 0)) {
    state.outcome = "win";
    log(state, "괴물을 모두 물리쳤습니다.", "player");
    return true;
  }
  return false;
}

/**
 * 직전에 낸 신 카드와의 관계
 * @param {CombatState} state
 * @param {{ pantheonSlug: string | null, continent: string | null }} card
 * @returns {"resonance" | "echo" | null}
 */
export function chainOf(state, card) {
  if (!state.chain || !card.pantheonSlug) return null;
  if (state.chain.pantheon === card.pantheonSlug) return "resonance";
  if (card.continent && state.chain.continent === card.continent) return "echo";
  return null;
}

/** 공명·울림의 배율. 운명의 서판 세력은 공명을 더 키웁니다. @param {CombatState} state @param {"resonance" | "echo"} chain */
const chainRate = (state, chain) =>
  chain === "resonance" ? RESONANCE + (state.perks?.resonanceBoost ?? 0) / 100 : ECHO;

/**
 * 손에 든 카드가 지금 내면 어떤 수치가 되는지. 대상별 취약·천적은 빼고 계산합니다.
 * @param {CombatState} state @param {CardInstance} instance
 */
export function previewCard(state, instance) {
  const card = getCard(instance.id, instance.up);
  const chain = chainOf(state, card);
  const rate = chain ? chainRate(state, chain) : 1;
  const effects = scaleEffects(state, card.effects, rate);
  return { card, chain, effects, lines: effects.map(describeEffect) };
}

/**
 * 효과 수치에 배율·힘·약화를 반영합니다. 카드와 무구가 함께 씁니다.
 * @param {CombatState} state @param {any[]} list @param {number} rate
 */
function scaleEffects(state, list, rate) {
  const strength = state.player.statuses.strength;
  const weak = state.player.statuses.weak > 0;
  return list.map((effect) => {
    if (effect.op === "damage") {
      let value = Math.floor(effect.value * rate) + strength;
      if (weak) value = Math.floor(value * 0.75);
      return { ...effect, value: Math.max(0, value) };
    }
    if (["block", "heal", "erosion"].includes(effect.op)) return { ...effect, value: Math.floor(effect.value * rate) };
    return effect;
  });
}

/** @param {CombatState} state @param {string} uid */
export function canPlay(state, uid) {
  if (state.outcome) return { ok: false, reason: "전투가 끝났습니다." };
  const instance = state.hand.find((c) => c.uid === uid);
  if (!instance) return { ok: false, reason: "손에 없는 카드입니다." };
  const card = getCard(instance.id, instance.up);
  if (card.cost > state.energy)
    return { ok: false, reason: `에너지가 부족합니다. (필요 ${card.cost}, 남은 ${state.energy})` };
  return { ok: true, reason: "" };
}

/** @param {CombatState} state */
export const livingEnemies = (state) => state.enemies.filter((e) => e.hp > 0);

/**
 * 적에게 피해를 줍니다. 반환값은 실제로 깎인 체력.
 * @param {CombatState} state @param {EnemyState} enemy @param {number} amount
 */
function hitEnemy(state, enemy, amount, pierce = false) {
  let rest = amount;
  if (enemy.block > 0 && !pierce) {
    const absorbed = Math.min(enemy.block, rest);
    enemy.block -= absorbed;
    rest -= absorbed;
  }
  enemy.hp = Math.max(0, enemy.hp - rest);
  if (enemy.hp === 0) log(state, `${withJosa(getEnemy(enemy.id).name, "이/가")} 쓰러졌습니다.`, "player");
  return rest;
}

/**
 * 효과를 차례로 적용합니다. 카드와 무구가 함께 씁니다.
 * @param {CombatState} state @param {any[]} effects @param {EnemyState | null} target
 * @param {{ figureSlug: string | null, pantheonSlug: string | null, domains: string[] }} source 천적 판정에 쓰는 출처
 * @param {string[]} parts 기록할 문장
 */
function applyEffects(state, effects, target, source, parts) {
  const card = source;
  for (const effect of effects) {
    switch (effect.op) {
      case "damage": {
        const targets = effect.all ? livingEnemies(state) : target ? [target] : [];
        for (const enemy of targets) {
          const def = getEnemy(enemy.id);
          let value = effect.value;
          const nemesis = isNemesis(def, card);
          if (nemesis) value = Math.floor(value * NEMESIS);
          if (enemy.statuses.vulnerable > 0) value = Math.floor(value * 1.5);
          let dealt = 0;
          for (let i = 0; i < (effect.times ?? 1); i += 1) {
            if (enemy.hp > 0) dealt += hitEnemy(state, enemy, value, Boolean(effect.pierce));
          }
          parts.push(`${def.name}에게 피해 ${dealt}${nemesis ? " (천적)" : ""}`);
        }
        break;
      }
      case "block":
        state.player.block += effect.value;
        parts.push(`방어 ${effect.value}`);
        break;
      case "draw":
        drawCards(state, effect.value);
        parts.push(`카드 ${effect.value}장 뽑기`);
        break;
      case "heal": {
        const before = state.player.hp;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.value);
        if (state.player.hp > before) parts.push(`체력 ${state.player.hp - before} 회복`);
        break;
      }
      case "energy":
        state.energy += effect.value;
        parts.push(`에너지 ${effect.value}`);
        break;
      case "strength":
        state.player.statuses.strength += effect.value;
        parts.push(`힘 ${effect.value}`);
        break;
      case "foundation":
        state.player.statuses.foundation += effect.value;
        parts.push(`매 턴 방어 ${effect.value}`);
        break;
      case "erosion":
      case "vulnerable":
      case "weak": {
        const targets = effect.all ? livingEnemies(state) : target ? [target] : [];
        for (const enemy of targets) enemy.statuses[effect.op] += effect.value;
        const label = { erosion: "침식", vulnerable: "취약", weak: "약화" }[effect.op];
        parts.push(
          `${effect.all ? "모든 적에게" : target ? `${getEnemy(target.id).name}에게` : ""} ${label} ${effect.value}`.trim(),
        );
        break;
      }
      case "cleanse": {
        const st = state.player.statuses;
        st.weak = 0;
        st.vulnerable = 0;
        st.erosion = 0;
        parts.push("약화·취약·침식을 씻어 냄");
        break;
      }
      default:
        break;
    }
  }
}

/**
 * 카드를 냅니다.
 * @param {CombatState} prev @param {string} uid @param {string | null} [targetUid]
 * @returns {CombatState}
 */
export function playCard(prev, uid, targetUid = null) {
  const check = canPlay(prev, uid);
  if (!check.ok) return prev;
  const state = clone(prev);
  state.log = [];
  const index = state.hand.findIndex((c) => c.uid === uid);
  const [instance] = state.hand.splice(index, 1);
  const { card, chain, effects } = previewCard(prev, instance);

  const alive = livingEnemies(state);
  const target = card.target === "enemy" ? (alive.find((e) => e.uid === targetUid) ?? alive[0] ?? null) : null;

  state.energy -= card.cost;
  const parts = [];
  if (chain === "resonance") parts.push("공명");
  if (chain === "echo") parts.push("울림");

  applyEffects(state, effects, target, card, parts);

  if (card.type === "attack") state.attackPlayed = true;
  if (card.type === "power") state.powers.push(instance);
  else if (card.exhaust) state.exhaust.push(instance);
  else state.discard.push(instance);

  log(state, `${card.name}${card.upgraded ? "+" : ""}: ${parts.join(", ")}`, "player");

  if (card.figureSlug) state.playedFigures.push(card.figureSlug);
  state.chain = card.pantheonSlug ? { pantheon: card.pantheonSlug, continent: card.continent } : null;

  checkVictory(state);
  return remember(state);
}

/**
 * 적 한 명이 행동합니다.
 * @param {CombatState} state @param {EnemyState} enemy
 */
function enemyAct(state, enemy) {
  const def = getEnemy(enemy.id);
  enemy.block = 0;
  if (enemy.statuses.erosion > 0) {
    enemy.hp = Math.max(0, enemy.hp - enemy.statuses.erosion);
    log(
      state,
      `${withJosa(def.name, "이/가")} 침식으로 체력 ${withJosa(enemy.statuses.erosion, "을/를")} 잃었습니다.`,
      "player",
    );
    enemy.statuses.erosion -= 1;
    if (enemy.hp === 0) {
      log(state, `${withJosa(def.name, "이/가")} 쓰러졌습니다.`, "player");
      return;
    }
  }

  const intent = def.intents[enemy.intent];
  const parts = [];
  for (const action of intent.actions) {
    switch (action.op) {
      case "attack": {
        const times = action.times === "heads" ? enemy.heads : (action.times ?? 1);
        let value = action.value + enemy.statuses.strength;
        if (enemy.statuses.weak > 0) value = Math.floor(value * 0.75);
        if (state.player.statuses.vulnerable > 0) value = Math.floor(value * 1.5);
        value = Math.max(0, value);
        let lost = 0;
        for (let i = 0; i < times; i += 1) {
          const absorbed = Math.min(state.player.block, value);
          state.player.block -= absorbed;
          lost += value - absorbed;
          state.player.hp -= value - absorbed;
        }
        parts.push(times > 1 ? `공격 ${value}×${times}, 체력 ${lost} 잃음` : `공격 ${value}, 체력 ${lost} 잃음`);
        break;
      }
      case "block":
        enemy.block += action.value;
        parts.push(`방어 ${action.value}`);
        break;
      case "strength":
        enemy.statuses.strength += action.value;
        parts.push(`힘 ${action.value}`);
        break;
      case "heal":
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + action.value);
        parts.push(`체력 ${action.value} 회복`);
        break;
      case "grow":
        enemy.heads += action.value;
        parts.push(`머리가 ${enemy.heads}개가 됨`);
        break;
      case "weak":
      case "vulnerable":
      case "erosion":
      case "eclipse":
        state.player.statuses[action.op] += action.value;
        parts.push(
          `${{ weak: "약화", vulnerable: "취약", erosion: "침식", eclipse: "일식" }[action.op]} ${action.value}`,
        );
        break;
      case "erase": {
        const erased = [];
        for (let i = 0; i < action.value; i += 1) {
          const pile = state.draw.length > 0 ? state.draw : state.discard;
          if (pile.length === 0) break;
          const at = withRng(state, (rng) => rng.int(0, pile.length - 1));
          const [card] = pile.splice(at, 1);
          state.exhaust.push(card);
          erased.push(getCard(card.id, card.up).name);
        }
        if (erased.length) parts.push(`망각: ${erased.join(", ")} 지워짐`);
        break;
      }
      default:
        break;
    }
    if (state.player.hp <= 0) break;
  }
  log(state, `${def.name}의 ${intent.name}: ${parts.join(", ")}`, "enemy");

  if (enemy.statuses.weak > 0) enemy.statuses.weak -= 1;
  if (enemy.statuses.vulnerable > 0) enemy.statuses.vulnerable -= 1;
  enemy.intent = nextIntent(state, def, enemy.intent);
}

/** @param {CombatState} state @param {import("#entities/enemy/index.js").EnemyDef} def @param {number} current */
function nextIntent(state, def, current) {
  const count = def.intents.length;
  if (def.order === "cycle") return (current + 1) % count;
  return withRng(state, (rng) => {
    const pick = rng.int(0, count - 2);
    return pick >= current ? pick + 1 : pick;
  });
}

/**
 * 턴을 마칩니다. 적이 행동하고 다음 내 턴이 시작됩니다.
 * @param {CombatState} prev
 * @returns {CombatState}
 */
export function endTurn(prev) {
  if (prev.outcome) return prev;
  const state = clone(prev);
  state.log = [];

  const kept = [];
  for (const instance of state.hand) {
    if (getCard(instance.id, instance.up).retain) kept.push(instance);
    else state.discard.push(instance);
  }
  state.hand = kept;
  const { statuses } = state.player;
  if (statuses.weak > 0) statuses.weak -= 1;
  if (statuses.vulnerable > 0) statuses.vulnerable -= 1;

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    enemyAct(state, enemy);
    if (checkVictory(state)) return remember(state);
    if (state.player.hp <= 0 && checkDefeat(state)) return remember(state);
  }
  log(state, `${state.turn + 1}번째 턴입니다.`);
  beginPlayerTurn(state);
  return remember(state);
}

/** 이번 행동의 기록을 전체 기록 끝에 붙입니다. 화면에는 최근 기록만 보여 줍니다. @param {CombatState} state */
function remember(state) {
  state.history = [...state.history, ...state.log].slice(-40);
  return state;
}

/**
 * 무구가 지금 어떤 수치가 되는지. 주인 신의 카드를 이번 턴에 냈다면 효과가 늘어납니다.
 * @param {CombatState} state @param {string} id
 */
export function previewArmament(state, id) {
  const arm = getArmament(id);
  const withOwner = arm.owners.some((slug) => state.playedFigures.includes(slug));
  const boosted = withOwner && arm.bonus === "power";
  // 피해·방어·회복·침식은 50% 늘리고, 뽑기·에너지·힘·약화·취약처럼 작은 수는 절반(최소 1)을 더합니다.
  const effects = scaleEffects(state, arm.effects, boosted ? 1.5 : 1).map((e) =>
    boosted && ["draw", "energy", "strength", "weak", "vulnerable"].includes(e.op)
      ? { ...e, value: e.value + Math.max(1, Math.floor(e.value / 2)) }
      : e,
  );
  const target = effects.some((e) => ["damage", "erosion", "vulnerable", "weak"].includes(e.op) && !e.all)
    ? "enemy"
    : "none";
  return { arm, withOwner, effects, target };
}

/** @param {CombatState} state @param {string} id */
export function canUseArmament(state, id) {
  if (state.outcome) return { ok: false, reason: "전투가 끝났습니다." };
  const slot = state.armaments.find((a) => a.id === id);
  if (!slot) return { ok: false, reason: "지니지 않은 무구입니다." };
  const arm = getArmament(id);
  if (slot.cd > 0)
    return { ok: false, reason: `${withJosa(arm.name, "은/는")} ${slot.cd}턴 뒤에 다시 쓸 수 있습니다.` };
  if (arm.cost > state.energy)
    return { ok: false, reason: `에너지가 부족합니다. (필요 ${arm.cost}, 남은 ${state.energy})` };
  return { ok: true, reason: "" };
}

/**
 * 무구를 씁니다.
 * @param {CombatState} prev @param {string} id @param {string | null} [targetUid]
 * @returns {CombatState}
 */
export function useArmament(prev, id, targetUid = null) {
  if (!canUseArmament(prev, id).ok) return prev;
  const state = clone(prev);
  state.log = [];
  const { arm, withOwner, effects, target: kind } = previewArmament(prev, id);
  const alive = livingEnemies(state);
  const target = kind === "enemy" ? (alive.find((e) => e.uid === targetUid) ?? alive[0] ?? null) : null;
  state.energy -= arm.cost;

  const parts = withOwner ? [`${withJosa(arm.owner, "과/와")} 함께`] : [];
  // 주인 신을 천적으로 둔 괴물에게는 무구도 천적으로 통합니다. (비슈누의 원반과 라후 등)
  const source = { figureSlug: arm.owners[0], pantheonSlug: arm.pantheon, domains: [] };
  applyEffects(state, effects, target, source, parts);

  const slot = /** @type {{ id: string, cd: number }} */ (state.armaments.find((a) => a.id === id));
  slot.cd = withOwner && arm.bonus === "return" ? 0 : arm.cooldown;
  if (withOwner && arm.bonus === "return") parts.push(`${withJosa(arm.name, "이/가")} 손으로 돌아옴`);
  log(state, `${arm.name}: ${parts.join(", ")}`, "player");

  checkVictory(state);
  return remember(state);
}
