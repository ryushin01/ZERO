import { describe, expect, it } from "vitest";

import { getCard } from "#entities/card/index.js";

import {
  canPlay,
  canUseArmament,
  chainOf,
  endTurn,
  playCard,
  previewArmament,
  previewCard,
  startCombat,
  useArmament,
} from "./combat.js";

const base = (id) => getCard(id).effects[0].value;

let n = 0;
const card = (id, up = false) => ({ uid: `${id}-${(n += 1)}`, id, up });

/** 덱 순서를 그대로 두고 싶을 때는 손을 직접 채웁니다. */
function setup({ hand = [], enemyIds = ["kappa"], relics = [], hp = 70 } = {}) {
  const state = startCombat({ deck: [card("quill"), card("shelf")], hp, maxHp: 72, relics, enemyIds, seed: 1 });
  return { ...state, hand: hand.map((id) => card(id)), draw: [], discard: [] };
}

describe("startCombat", () => {
  it("첫 턴에 에너지 3과 카드 5장을 받습니다", () => {
    const deck = Array.from({ length: 10 }, () => card("quill"));
    const state = startCombat({ deck, hp: 72, maxHp: 72, relics: [], enemyIds: ["harpy"], seed: 3 });
    expect(state.energy).toBe(3);
    expect(state.hand).toHaveLength(5);
    expect(state.draw).toHaveLength(5);
  });

  it("세력 효과가 전투 시작과 첫 턴에 적용됩니다", () => {
    const deck = Array.from({ length: 10 }, () => card("quill"));
    const state = startCombat({
      deck,
      hp: 60,
      maxHp: 72,
      relics: ["ariadne"],
      enemyIds: ["harpy"],
      seed: 3,
      perks: { startBlock: 6, startStrength: 1, firstEnergy: 1, firstDraw: 1, turnHeal: 2 },
    });
    expect(state.player.block).toBe(6);
    expect(state.player.statuses.strength).toBe(1);
    expect(state.energy).toBe(4);
    expect(state.hand).toHaveLength(5 + 2 + 1); // 아리아드네의 실 2장, 세력 1장
    expect(state.player.hp).toBe(62);
  });
});

describe("playCard", () => {
  it("필봉은 에너지 1로 피해 6을 줍니다", () => {
    const state = setup({ hand: ["quill"] });
    const enemy = state.enemies[0];
    const after = playCard(state, state.hand[0].uid, enemy.uid);
    expect(after.energy).toBe(2);
    expect(after.enemies[0].hp).toBe(enemy.hp - 6);
    expect(after.discard).toHaveLength(1);
    expect(state.hand).toHaveLength(1); // 원래 상태는 그대로
  });

  it("에너지가 모자라면 낼 수 없습니다", () => {
    const state = { ...setup({ hand: ["zeus"] }), energy: 1 };
    expect(canPlay(state, state.hand[0].uid)).toMatchObject({ ok: false });
    expect(playCard(state, state.hand[0].uid)).toBe(state);
  });

  it("같은 계열을 이어 내면 공명으로 50% 늘어납니다", () => {
    // 헤라클레스(그리스) → 아르테미스(그리스)
    let state = setup({ hand: ["heracles", "artemis"], enemyIds: ["draugr"] });
    state = playCard(state, state.hand[0].uid, state.enemies[0].uid);
    expect(chainOf(state, { pantheonSlug: "greek", continent: "europe" })).toBe("resonance");
    expect(previewCard(state, state.hand[0]).effects[0].value).toBe(Math.floor(base("artemis") * 1.5));
  });

  it("같은 대륙이면 울림으로 25% 늘어납니다", () => {
    let state = setup({ hand: ["heracles", "tyr"], enemyIds: ["kappa"] });
    state = playCard(state, state.hand[0].uid, state.enemies[0].uid);
    expect(previewCard(state, state.hand[0])).toMatchObject({ chain: "echo" });
  });

  it("천적에게는 피해가 50% 늘어납니다", () => {
    const state = setup({ hand: ["heracles"], enemyIds: ["hydra"] });
    const before = state.enemies[0].hp;
    const after = playCard(state, state.hand[0].uid, state.enemies[0].uid);
    expect(before - after.enemies[0].hp).toBe(Math.floor(base("heracles") * 1.5));
  });

  it("권능 카드는 내면 전투에서 빠지고 힘이 남습니다", () => {
    const state = setup({ hand: ["zeus"] });
    const after = playCard(state, state.hand[0].uid);
    expect(after.player.statuses.strength).toBe(base("zeus"));
    expect(after.powers).toHaveLength(1);
    expect(after.discard).toHaveLength(0);
  });

  it("적을 모두 쓰러뜨리면 이깁니다", () => {
    const state = setup({ hand: ["quill"] });
    state.enemies[0].hp = 3;
    expect(playCard(state, state.hand[0].uid, state.enemies[0].uid).outcome).toBe("win");
  });
});

describe("무구", () => {
  const withArms = (armaments, hand = []) => {
    const state = startCombat({ deck: [], hp: 70, maxHp: 72, relics: [], enemyIds: ["jotunn"], seed: 5, armaments });
    return { ...state, hand: hand.map((id) => card(id)), draw: [], discard: [] };
  };

  it("묠니르는 모든 적을 치고 대기시간이 생깁니다", () => {
    let state = withArms(["mjolnir"]);
    const hp = state.enemies[0].hp;
    state = useArmament(state, "mjolnir");
    expect(state.enemies[0].hp).toBeLessThan(hp);
    expect(state.energy).toBe(2);
    expect(canUseArmament(state, "mjolnir").ok).toBe(false);
    expect(state.armaments[0].cd).toBe(2);
  });

  it("토르의 카드를 낸 턴에는 묠니르가 바로 돌아옵니다", () => {
    let state = withArms(["mjolnir"], ["thor"]);
    state = playCard(state, state.hand[0].uid);
    state = useArmament(state, "mjolnir");
    expect(state.armaments[0].cd).toBe(0);
    expect(state.log.at(-1).text).toContain("손으로 돌아옴");
  });

  it("궁니르는 방어를 무시합니다", () => {
    const state = withArms(["gungnir"]);
    state.enemies[0].block = 50;
    const hp = state.enemies[0].hp;
    const after = useArmament(state, "gungnir", state.enemies[0].uid);
    expect(after.enemies[0].hp).toBe(hp - 11);
  });

  it("대기시간은 내 턴이 시작될 때마다 줄어듭니다", () => {
    let state = useArmament(withArms(["kerykeion"]), "kerykeion");
    expect(state.armaments[0].cd).toBe(2);
    state = endTurn(state);
    expect(state.armaments[0].cd).toBe(1);
  });

  it("주인 신과 함께 쓰면 효과가 50% 늘어납니다", () => {
    const state = withArms(["kusanagi"], ["susanoo"]);
    expect(previewArmament(state, "kusanagi").effects[0].value).toBe(6);
    const after = playCard(state, state.hand[0].uid, state.enemies[0].uid);
    expect(previewArmament(after, "kusanagi")).toMatchObject({ withOwner: true });
    expect(previewArmament(after, "kusanagi").effects[1].value).toBe(6); // 방어 4 × 1.5
  });

  it("뽑기·에너지·힘 무구도 주인과 함께면 더 강해집니다", () => {
    const state = withArms(["kerykeion"], ["hermes"]);
    expect(previewArmament(state, "kerykeion").effects[0].value).toBe(2);
    const after = playCard(state, state.hand[0].uid);
    expect(previewArmament(after, "kerykeion").effects[0].value).toBe(3);
  });

  it("바사비 샥티는 전투마다 한 번만 씁니다", () => {
    let state = useArmament(withArms(["vasavi-shakti"]), "vasavi-shakti");
    // 전투가 아무리 길어져도 다시 돌아오지 않습니다.
    for (let i = 0; i < 120; i += 1) {
      state.player.hp = state.player.maxHp;
      state.player.block = 9999;
      for (const enemy of state.enemies) enemy.hp = enemy.maxHp;
      state = endTurn(state);
    }
    expect(canUseArmament(state, "vasavi-shakti")).toMatchObject({ ok: false });
    expect(canUseArmament(state, "vasavi-shakti").reason).toContain("이미 썼습니다");
  });

  it("영혼의 검은 에너지 없이 모든 적의 방어를 뚫고, 체력을 되찾고, 다음 턴에 돌아옵니다", () => {
    let state = withArms(["soul-sword"]);
    state.player.hp = 50;
    state.enemies[0].block = 30;
    const hp = state.enemies[0].hp;
    state = useArmament(state, "soul-sword");
    expect(state.enemies[0].hp).toBe(Math.max(0, hp - 24));
    expect(state.player.hp).toBe(56);
    expect(state.energy).toBe(3);
    expect(canUseArmament(state, "soul-sword").ok).toBe(false);
    state = endTurn(state);
    expect(canUseArmament(state, "soul-sword").ok).toBe(true);
  });

  it("우자트의 눈은 약화·취약·침식을 씻어 냅니다", () => {
    const state = withArms(["wedjat"]);
    state.player.statuses.weak = 2;
    state.player.statuses.erosion = 5;
    const after = useArmament(state, "wedjat");
    expect(after.player.statuses).toMatchObject({ weak: 0, erosion: 0 });
  });
});

describe("endTurn", () => {
  it("방어가 공격을 먼저 막습니다", () => {
    let state = setup({ hand: ["shelf"], enemyIds: ["kappa"] });
    state.enemies[0].intent = 1; // 끌어들이기: 공격 10
    state = playCard(state, state.hand[0].uid);
    const after = endTurn(state);
    expect(after.player.hp).toBe(70 - 5);
    expect(after.turn).toBe(2);
  });

  it("침식은 턴마다 체력을 깎고 1씩 줄어듭니다", () => {
    let state = setup({ hand: ["hades"], enemyIds: ["kappa"] });
    const hp = state.enemies[0].hp;
    state = playCard(state, state.hand[0].uid, state.enemies[0].uid);
    const erosion = base("hades");
    expect(state.enemies[0].statuses.erosion).toBe(erosion);
    const after = endTurn(state);
    expect(after.enemies[0].hp).toBe(hp - erosion);
    expect(after.enemies[0].statuses.erosion).toBe(erosion - 1);
  });

  it("보존 카드는 손에 남습니다", () => {
    const state = setup({ hand: ["quill", "shiva"] });
    const after = endTurn(state);
    expect(after.hand.some((c) => c.id === "shiva")).toBe(true);
  });

  it("체력이 0이 되면 지고, 앙크가 있으면 한 번 되살아납니다", () => {
    const base = setup({ hand: [], enemyIds: ["kappa"], hp: 5 });
    base.enemies[0].intent = 1;
    expect(endTurn(base).outcome).toBe("lose");
    const saved = endTurn({ ...base, relics: ["ankh"] });
    expect(saved.outcome).toBeNull();
    expect(saved.player.hp).toBe(36);
    expect(saved.ankhUsed).toBe(true);
  });

  it("히드라는 머리가 자라면 더 많이 뭅니다", () => {
    let state = setup({ enemyIds: ["hydra"], hp: 70 });
    expect(state.enemies[0].heads).toBe(2);
    state = endTurn(state); // 머리마다 물기 4×2
    expect(state.player.hp).toBe(62);
    state = endTurn(state); // 머리 돋기
    expect(state.enemies[0].heads).toBe(3);
  });

  it("ZERO의 망각은 뽑을 카드를 지웁니다", () => {
    const state = { ...setup({ enemyIds: ["zero"] }), draw: [card("quill"), card("quill"), card("quill")] };
    const after = endTurn(state);
    expect(after.exhaust.length).toBe(2);
  });
});

describe("전장", () => {
  /** @param {import("./combat.js").Field} field @param {string[]} [hand] */
  const onField = (field, hand = []) => {
    const state = startCombat({
      deck: [card("quill"), card("shelf")],
      hp: 70,
      maxHp: 72,
      relics: [],
      enemyIds: ["jotunn"],
      seed: 2,
      field,
    });
    return { ...state, hand: hand.map((id) => card(id)), draw: [], discard: [] };
  };
  const field = (kind, value, pantheons = []) => ({ id: "test", name: "시험장", kind, value, pantheons });

  it("전투 시작 효과를 겁니다 (카멜롯의 방어, 요미의 적 힘)", () => {
    expect(onField(field("startBlock", 8)).player.block).toBe(8);
    expect(onField(field("enemyStrength", 2)).enemies[0].statuses.strength).toBe(2);
  });

  it("밀려드는 바다는 턴이 끝날 때 사서와 모든 적을 칩니다 (방어로 막음)", () => {
    const state = onField(field("tide", 3));
    state.enemies[0].intent = 0;
    const enemyHp = state.enemies[0].hp;
    state.player.block = 1;
    const after = endTurn(state);
    expect(after.enemies[0].hp).toBeLessThanOrEqual(enemyHp - 3);
    expect(after.log.some((l) => l.text.includes("시험장"))).toBe(true);
  });

  it("전장 신화권의 카드는 지형 공명으로 25% 강해집니다", () => {
    const zeus = getCard("zeus");
    const plain = previewCard(onField(field("startBlock", 0), ["zeus"]), card("zeus"));
    const greek = previewCard(
      onField(field("startBlock", 0, [/** @type {string} */ (zeus.pantheonSlug)]), ["zeus"]),
      card("zeus"),
    );
    expect(plain.terrain).toBe(false);
    expect(greek.terrain).toBe(true);
    const damage = (p) => p.effects.find((e) => e.op === "damage")?.value ?? 0;
    expect(damage(greek)).toBeGreaterThan(damage(plain));
  });

  it("지형 공명은 공명처럼 피해·방어·회복·침식만 키우고 뽑기 같은 개수는 그대로 둡니다", () => {
    const odin = getCard("odin");
    const pantheon = /** @type {string} */ (odin.pantheonSlug);
    const plain = previewCard(onField(field("startBlock", 0), ["odin"]), card("odin"));
    const norse = previewCard(onField(field("startBlock", 0, [pantheon]), ["odin"]), card("odin"));
    const draw = (p) => p.effects.find((e) => e.op === "draw")?.value;
    expect(norse.terrain).toBe(true);
    expect(draw(norse)).toBe(draw(plain));
  });

  it("세력과 전장의 같은 효과는 더해집니다", () => {
    const state = startCombat({
      deck: [card("quill")],
      hp: 50,
      maxHp: 72,
      relics: [],
      enemyIds: ["kappa"],
      seed: 4,
      perks: { turnHeal: 1 },
      field: field("turnHeal", 2),
    });
    expect(state.player.hp).toBe(53);
  });
});

describe("장착", () => {
  /** @param {any[]} hand */
  const withHand = (hand) => {
    const state = startCombat({ deck: [], hp: 50, maxHp: 72, relics: [], enemyIds: ["jotunn"], seed: 6 });
    return { ...state, hand, draw: [], discard: [], energy: 3 };
  };

  it("카드에 끼운 무구는 그 카드를 낼 때 에너지 없이 함께 터지고, 주인이면 50% 강해집니다", () => {
    const thor = { uid: "t1", id: "thor", up: false, gear: { arm: "mjolnir" } };
    const zeus = { uid: "z1", id: "zeus", up: false, gear: { arm: "mjolnir" } };
    const owner = previewCard(withHand([thor]), thor);
    const other = previewCard(withHand([zeus]), zeus);
    expect(owner.lines).toContain("무구 묠니르 (주인)");
    expect(other.lines).toContain("무구 묠니르");
    const state = withHand([thor]);
    const hp = state.enemies[0].hp;
    const after = playCard(state, "t1", state.enemies[0].uid);
    expect(after.energy).toBe(3 - getCard("thor").cost);
    expect(after.enemies[0].hp).toBeLessThan(hp - getCard("thor").effects.filter((e) => e.op === "damage").length);
  });

  it("오딘과 슬레이프니르는 결속으로 비용이 1 줄고, 전투 첫 턴에 손에 들어옵니다", () => {
    const odin = { uid: "o1", id: "odin", up: false, gear: { partner: { uid: "s1", id: "sleipnir", up: false } } };
    expect(previewCard(withHand([odin]), odin).cost).toBe(Math.max(0, getCard("odin").cost - 1));
    expect(previewCard(withHand([odin]), odin).lines).toContain("탈것 슬레이프니르 (결속)");
    const deck = [...Array.from({ length: 12 }, () => card("quill")), odin];
    const state = startCombat({ deck, hp: 70, maxHp: 72, relics: [], enemyIds: ["kappa"], seed: 3 });
    expect(state.hand.some((c) => c.uid === "o1")).toBe(true);
  });

  it("비행은 받는 다음 공격의 피해를 절반으로 줄입니다", () => {
    const athena = { uid: "a1", id: "athena", up: false, gear: { partner: { uid: "p1", id: "pegasus", up: false } } };
    const state = withHand([athena]);
    const played = playCard(state, "a1", state.enemies[0].uid);
    expect(played.player.statuses.evade).toBe(1);
  });
});
