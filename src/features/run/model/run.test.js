import { describe, expect, it } from "vitest";

import { getBattlefield } from "#entities/battlefield/index.js";
import { createRng } from "#shared/lib/index.js";

import { autoRun } from "../lib/autoplay.js";
import {
  chooseEvent,
  createRun,
  currentField,
  enterNode,
  fieldsFor,
  guideCards,
  migrateRun,
  guideOptions,
  leaveReward,
  resolvePick,
  takeArmament,
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

  it("히든 캐릭터와 함께 시작하면 유신과 영혼의 검을 처음부터 듭니다", () => {
    const run = createRun({ seed: 1, guide: "greek", hidden: true });
    expect(run.deck).toHaveLength(12);
    expect(run.deck.some((c) => c.id === "yushin")).toBe(true);
    expect(run.armaments).toContain("soul-sword");
    expect(run.armaments).toHaveLength(2);
  });

  it("길잡이 후보는 신이 셋 이상인 계열 세 개입니다", () => {
    const options = guideOptions(5);
    expect(options).toHaveLength(3);
    expect(new Set(options.map((p) => p.slug)).size).toBe(3);
  });
});

describe("migrateRun", () => {
  it("0.2.0 저장을 옮기고, 무기였던 유물은 무구로 바꿉니다", () => {
    const old = { ...createRun({ seed: 9, guide: "greek" }), version: 1, relics: ["aegis", "ankh"] };
    delete old.armaments;
    old.reward = {
      title: "",
      cards: [],
      relics: ["mjolnir", "sampo"],
      relicPick: true,
      cardTaken: false,
      relicTaken: false,
    };
    old.combat = { relics: ["aegis", "ankh"], hand: [], enemies: [] };
    const run = migrateRun(old);
    expect(run.version).toBe(2);
    expect(run.relics).toEqual(["ankh"]);
    expect(run.armaments).toEqual(["aegis"]);
    expect(run.reward.relics).toEqual(["sampo"]);
    expect(run.combat).toMatchObject({ playedFigures: [], perks: {}, armaments: [{ id: "aegis", cd: 0 }] });
  });

  it("알 수 없는 저장은 버립니다", () => {
    expect(migrateRun(null)).toBeNull();
    expect(migrateRun({ version: 99 })).toBeNull();
  });
});

describe("무구와 세력", () => {
  it("길잡이 신화의 무구 하나를 들고 시작합니다", () => {
    expect(["mjolnir", "gungnir", "brisingamen"]).toContain(createRun({ seed: 1, guide: "norse" }).armaments[0]);
    expect(createRun({ seed: 1, guide: "finnish" }).armaments).toHaveLength(1);
  });

  it("덱의 세력 효과를 전투에 넘깁니다", () => {
    let run = createRun({ seed: 6, guide: "korean" });
    run = {
      ...run,
      deck: [...run.deck, { uid: "x1", id: "sansin", up: false }, { uid: "x2", id: "jeseok", up: false }],
    };
    run = enterNode(run, run.map.rows[0][0].id);
    expect(run.combat.perks).toEqual({ turnHeal: 1 });
  });

  it("정예를 이기면 무구 후보 둘 가운데 하나를 고릅니다", () => {
    let run = createRun({ seed: 7, guide: "greek" });
    run = enterNode(run, run.map.rows[0][0].id);
    run = updateCombat(run, { ...run.combat, tier: "elite", outcome: "win" });
    expect(run.reward.armaments).toHaveLength(2);
    const [first, second] = run.reward.armaments;
    run = takeArmament(run, first);
    expect(run.armaments).toContain(first);
    expect(takeArmament(run, second).armaments).not.toContain(second);
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

describe("히든 사건 붉은 방", () => {
  /** 첫 줄 칸을 모두 사건으로 바꾼 run @param {number} seed */
  const atEvent = (seed) => {
    const run = createRun({ seed, guide: "korean" });
    run.map = {
      ...run.map,
      rows: run.map.rows.map((row, i) => (i === 0 ? row.map((n) => ({ ...n, type: "event" })) : row)),
    };
    return { run, nodeId: run.map.rows[0][0].id };
  };

  it("사건 칸에서 드물게 열리고, 유신이 덱에 있으면 열리지 않습니다", () => {
    const events = Array.from({ length: 300 }, (_, i) => {
      const { run, nodeId } = atEvent(i + 1);
      return enterNode(run, nodeId).event;
    });
    const hidden = events.filter((e) => e === "crimson").length;
    expect(hidden).toBeGreaterThan(5);
    expect(hidden).toBeLessThan(60);

    const seed = events.indexOf("crimson") + 1;
    const { run, nodeId } = atEvent(seed);
    run.deck.push({ uid: "y", id: "yushin", up: false });
    expect(enterNode(run, nodeId).event).not.toBe("crimson");
  });

  it("오늘의 신화에서는 열리지 않습니다", () => {
    const events = Array.from({ length: 200 }, (_, i) => {
      const { run, nodeId } = atEvent(i + 1);
      run.daily = "2026-11-10";
      return enterNode(run, nodeId).event;
    });
    expect(events).not.toContain("crimson");
  });

  it("영혼의 검은 무구 자리에 세지 않아 보통 무구를 세 점까지 모읍니다", () => {
    /** @param {string[]} armaments @param {string} offer */
    const offered = (armaments, offer) => ({
      ...createRun({ seed: 3, guide: "norse", hidden: true }),
      armaments,
      reward: {
        title: "",
        cards: [],
        relics: [],
        relicPick: false,
        cardTaken: false,
        relicTaken: false,
        armaments: [offer],
        armamentTaken: false,
      },
    });
    const third = takeArmament(offered(["mjolnir", "gungnir", "soul-sword"], "aegis"), "aegis");
    expect(third.armaments).toEqual(["mjolnir", "gungnir", "soul-sword", "aegis"]);
    const fourth = takeArmament(offered(third.armaments, "trident"), "trident");
    expect(fourth.armaments).not.toContain("trident");
  });

  it("사내를 따르면 최대 체력 10을 잃고 유신과 영혼의 검을 얻습니다 (무구 자리를 넘어도)", () => {
    let run = { ...createRun({ seed: 6, guide: "korean" }), phase: "event", event: "crimson" };
    run.armaments = ["mjolnir", "gungnir", "aegis"];
    const maxHp = run.maxHp;
    run = chooseEvent(run, "follow");
    expect(run.maxHp).toBe(maxHp - 10);
    expect(run.deck.some((c) => c.id === "yushin")).toBe(true);
    expect(run.armaments).toEqual(["mjolnir", "gungnir", "aegis", "soul-sword"]);
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

describe("전장", () => {
  it("장마다 그 영역의 전장 하나를 시드로 정합니다", () => {
    const run = createRun({ seed: 11, guide: "greek" });
    expect(getBattlefield(run.fields?.[1] ?? "").realm).toBe("sanctuary");
    expect(getBattlefield(run.fields?.[2] ?? "").realm).toBe("divine");
    expect(getBattlefield(run.fields?.[3] ?? "").realm).toBe("outer");
    expect(createRun({ seed: 11, guide: "norse" }).fields).toEqual(run.fields);
    expect(currentField(run).id).toBe(run.fields?.[1]);
  });

  it("전투에 지금 장의 전장을 넘깁니다", () => {
    const run = createRun({ seed: 5, guide: "greek" });
    const node = run.map.rows[0][0];
    const next = enterNode(run, node.id);
    expect(next.combat?.field?.id).toBe(run.fields?.[1]);
  });

  it("이차원의 균열에서는 다른 영역의 전장이 겹치고, 이기면 유물 둘 가운데 하나를 고릅니다", () => {
    const run = createRun({ seed: 9, guide: "greek" });
    run.map = {
      ...run.map,
      rows: run.map.rows.map((row, i) => (i === 0 ? row.map((n) => ({ ...n, type: "rift" })) : row)),
    };
    const inRift = enterNode(run, run.map.rows[0][0].id);
    expect(inRift.combat?.tier).toBe("elite");
    expect(inRift.combat?.field?.name).toMatch(/^이차원 · /);
    expect(getBattlefield(inRift.combat?.field?.id ?? "").realm).not.toBe("sanctuary");
    const won = updateCombat(inRift, { .../** @type {any} */ (inRift.combat), outcome: "win" });
    expect(won.reward?.title).toBe("균열을 닫았습니다");
    expect(won.reward?.relicPick).toBe(true);
    expect(won.rift).toBeNull();
  });

  it("전장이 생기기 전의 저장도 시드로 전장을 정해 이어 갑니다", () => {
    const saved = /** @type {any} */ (createRun({ seed: 7, guide: "greek" }));
    delete saved.fields;
    expect(migrateRun(saved)?.fields).toEqual(fieldsFor(7));
  });
});
