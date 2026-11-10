import { describe, expect, it } from "vitest";

import { createRng } from "#shared/lib/index.js";

import { autoRun } from "../lib/autoplay.js";
import {
  chooseEvent,
  createRun,
  enterNode,
  guideCards,
  guideOptions,
  leaveReward,
  resolvePick,
  takeCard,
  updateCombat,
} from "./run.js";

describe("createRun", () => {
  it("기본 카드 9장과 길잡이 계열 카드 2장으로 시작합니다", () => {
    const run = createRun({ seed: 1, guide: "greek" });
    expect(run.deck).toHaveLength(11);
    expect(run.deck.filter((c) => c.id === "quill")).toHaveLength(5);
    expect(run.deck.map((c) => c.id)).toEqual(expect.arrayContaining(guideCards("greek")));
    expect(new Set(run.deck.map((c) => c.uid)).size).toBe(11);
  });

  it("길잡이 후보는 신이 셋 이상인 계열 세 개입니다", () => {
    const options = guideOptions(5);
    expect(options).toHaveLength(3);
    expect(new Set(options.map((p) => p.slug)).size).toBe(3);
  });
});

describe("전투와 보상", () => {
  it("첫 칸은 전투이고, 이기면 카드 보상이 나옵니다", () => {
    let run = createRun({ seed: 2, guide: "norse" });
    run = enterNode(run, run.map.rows[0][0].id);
    expect(run.phase).toBe("battle");
    const combat = { ...run.combat, outcome: "win", enemies: run.combat.enemies.map((e) => ({ ...e, hp: 0 })) };
    run = updateCombat(run, combat);
    expect(run.phase).toBe("reward");
    expect(run.reward.cards).toHaveLength(3);

    const [cardId] = run.reward.cards;
    run = takeCard(run, cardId);
    expect(run.deck).toHaveLength(12);
    expect(takeCard(run, run.reward.cards[1]).deck).toHaveLength(12); // 한 장만

    run = leaveReward(run);
    expect(run.phase).toBe("map");
  });

  it("지면 패배 화면으로 갑니다", () => {
    let run = createRun({ seed: 3, guide: "egyptian" });
    run = enterNode(run, run.map.rows[0][1].id);
    run = updateCombat(run, { ...run.combat, outcome: "lose", player: { ...run.combat.player, hp: 0 } });
    expect(run.phase).toBe("defeat");
  });
});

describe("사건과 카드 고르기", () => {
  it("레테의 강에서 카드를 지울 수 있습니다", () => {
    let run = { ...createRun({ seed: 4, guide: "hindu" }), phase: "event", event: "lethe" };
    run = chooseEvent(run, "sip");
    expect(run.phase).toBe("pick");
    run = resolvePick(run, [run.deck[0].uid]);
    expect(run.deck).toHaveLength(10);
    expect(run.phase).toBe("map");
  });

  it("대장간에서는 체력을 내고 강화합니다", () => {
    let run = { ...createRun({ seed: 4, guide: "hindu" }), phase: "event", event: "forge" };
    run = resolvePick(chooseEvent(run, "forge"), [run.deck[0].uid]);
    expect(run.deck[0].up).toBe(true);
    expect(run.hp).toBe(72 - 7);
  });
});

describe("자동 플레이", () => {
  it("여러 시드로 한 판을 끝까지 막힘 없이 진행합니다", () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      const rng = createRng(seed * 7);
      const run = autoRun(createRun({ seed, guide: guideOptions(seed)[0].slug }), () => rng.float());
      expect(["victory", "defeat"], `seed ${seed}`).toContain(run.phase);
    }
  });
});
