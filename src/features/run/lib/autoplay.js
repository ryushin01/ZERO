import { getCard } from "#entities/card/index.js";
import { getEnemy } from "#entities/enemy/index.js";
import { reachableNodes } from "#entities/map/index.js";

import { canPlay, endTurn, livingEnemies, playCard, previewCard } from "../model/combat.js";
import { getEvent } from "../model/events.js";
import {
  chooseEvent,
  enterNode,
  leaveReward,
  pickableCards,
  requestPick,
  resolvePick,
  rest,
  takeCard,
  takeRelic,
  updateCombat,
} from "../model/run.js";

/**
 * 규칙만으로 한 판을 끝까지 두는 단순한 자동 플레이어.
 * 테스트에서 모든 화면 흐름이 막히지 않는지, 난이도가 지나치지 않은지 확인할 때 씁니다.
 */

/** 이번 턴 들어올 피해 @param {import("../model/combat.js").CombatState} state */
function incoming(state) {
  let total = 0;
  for (const enemy of livingEnemies(state)) {
    const def = getEnemy(enemy.id);
    for (const action of def.intents[enemy.intent].actions) {
      if (action.op !== "attack") continue;
      const times = action.times === "heads" ? enemy.heads : (action.times ?? 1);
      let value = action.value + enemy.statuses.strength;
      if (enemy.statuses.weak > 0) value = Math.floor(value * 0.75);
      total += value * times;
    }
  }
  return total;
}

/** @param {import("../model/combat.js").CombatState} state */
function score(state, instance) {
  const { card, effects, chain } = previewCard(state, instance);
  const value = (op) => effects.filter((e) => e.op === op).reduce((sum, e) => sum + e.value * (e.times ?? 1), 0);
  const threat = Math.max(0, incoming(state) - state.player.block);
  let s = 0;
  if (card.type === "power") s += 30;
  s += value("damage") * (effects.some((e) => e.all) ? livingEnemies(state).length : 1);
  s += Math.min(value("block"), threat) * 1.2;
  s += value("draw") * 4 + value("energy") * 8 + value("erosion") * 1.5 + value("vulnerable") * 3;
  s += Math.min(value("heal"), state.player.maxHp - state.player.hp);
  if (chain) s += 3;
  return s / Math.max(0.6, card.cost);
}

/** @param {import("../model/combat.js").CombatState} start */
export function autoBattle(start, maxTurns = 60) {
  let state = start;
  while (!state.outcome && state.turn <= maxTurns) {
    for (let guard = 0; guard < 20 && !state.outcome; guard += 1) {
      const playable = state.hand.filter((c) => canPlay(state, c.uid).ok);
      if (playable.length === 0) break;
      const best = playable.reduce((a, b) => (score(state, b) > score(state, a) ? b : a));
      const target = livingEnemies(state).reduce((a, b) => (b.hp < a.hp ? b : a));
      state = playCard(state, best.uid, target.uid);
    }
    if (!state.outcome) state = endTurn(state);
  }
  return state;
}

/**
 * @param {import("../model/run.js").Run} start
 * @param {() => number} random 0~1
 */
export function autoRun(start, random) {
  let run = start;
  for (let step = 0; step < 400; step += 1) {
    switch (run.phase) {
      case "map": {
        const options = reachableNodes(run.map, run.position);
        run = enterNode(run, options[Math.floor(random() * options.length)].id);
        break;
      }
      case "battle":
        run = updateCombat(run, autoBattle(/** @type {any} */ (run.combat)));
        break;
      case "reward": {
        const reward = /** @type {any} */ (run.reward);
        if (reward.cards.length) {
          const best = reward.cards.reduce((a, b) =>
            ({ legend: 3, rare: 2, common: 1 })[getCard(b).rarity] >
            { legend: 3, rare: 2, common: 1 }[getCard(a).rarity]
              ? b
              : a,
          );
          run = takeCard(run, best);
        }
        if (reward.relics.length) run = takeRelic(run, reward.relics[0]);
        run = leaveReward(run);
        break;
      }
      case "rest":
        run =
          run.hp < run.maxHp * 0.6
            ? rest(run)
            : requestPick(run, { purpose: "upgrade", count: 1, title: "", then: "map" });
        break;
      case "shrine":
        run = requestPick(run, { purpose: "remove", count: 1, title: "", then: "map" });
        break;
      case "pick": {
        const cards = pickableCards(run);
        const basic = cards.find((c) => c.id === "quill") ?? cards[0];
        run = resolvePick(run, basic ? [basic.uid] : []);
        break;
      }
      case "event": {
        const event = getEvent(/** @type {string} */ (run.event));
        const choices = event.choices.filter((c) => !c.available || c.available(run));
        run = chooseEvent(run, choices[Math.floor(random() * choices.length)].id);
        break;
      }
      default:
        return run;
    }
  }
  return run;
}
