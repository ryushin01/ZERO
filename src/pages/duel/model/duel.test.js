import { describe, expect, it } from "vitest";

import { CLASSES, getClass } from "./classes.js";
import { getCard } from "#entities/card/index.js";

import { buildDeck, endDuelTurn, isDuelUsable, playDuelCard, reveal, startDuel } from "./duel.js";

describe("클래스", () => {
  it("나무위키의 갈래대로 기본 4종과 근접·민첩·마법·성직·기타 클래스가 있고, 이름이 겹치지 않습니다", () => {
    expect(CLASSES.filter((c) => c.base).map((c) => c.name)).toEqual(["전사", "도적", "마법사", "성직자"]);
    expect(new Set(CLASSES.map((c) => c.id)).size).toBe(CLASSES.length);
    expect(CLASSES.length).toBeGreaterThan(100);
  });
});

describe("덱", () => {
  it("클래스 속성의 신·영웅 10장과 기본 카드 4장으로 짜고, 전설은 두 장까지입니다", () => {
    for (const cls of CLASSES) {
      const deck = buildDeck(cls.id, 7, "t");
      expect(deck).toHaveLength(14);
      expect(deck.filter((c) => getCard(c.id).rarity === "legend").length).toBeLessThanOrEqual(2);
      const figures = deck.filter((c) => getCard(c.id).figureSlug);
      expect(
        figures.every((c) => cls.aspects.includes(getCard(c.id).aspect) || getCard(c.id).secondary === cls.aspects[0]),
      ).toBe(true);
    }
  });

  it("같은 시드면 같은 덱입니다", () => {
    expect(buildDeck("warrior", 3, "a")).toEqual(buildDeck("warrior", 3, "a"));
  });
});

describe("듀얼", () => {
  const start = () => startDuel({ seed: 42, classes: ["warrior", "cleric"] });

  it("넘기기 화면으로 시작하고, 패를 펼치면 플레이어 1이 에너지 3과 카드 5장을 받습니다", () => {
    const state = start();
    expect(state.phase).toBe("handoff");
    expect(state.active).toBe(0);
    const open = reveal(state);
    expect(open.phase).toBe("play");
    expect(open.players[0].energy).toBe(3);
    expect(open.players[0].hand).toHaveLength(5);
  });

  it("공격 카드는 상대를 치고, 차례를 끝내면 상대에게 넘어갑니다", () => {
    let state = reveal(start());
    // 상대의 방어를 없애고 필봉(피해 6)을 쥐여 공격이 반드시 들어가게 합니다.
    state.players[1].block = 0;
    state.players[0].hand = [{ uid: "q", id: "quill", up: false }, ...state.players[0].hand.slice(1)];
    state.players[0].energy = 3;
    const hp = state.players[1].hp;
    state = playDuelCard(state, "q");
    expect(state.players[1].hp).toBeLessThan(hp);
    state = endDuelTurn(state);
    expect(state.active).toBe(1);
    expect(state.phase).toBe("handoff");
    expect(state.players[1].hand).toHaveLength(5);
  });

  it("클래스 능력: 성직자는 매 턴 회복하고, 기사는 방어를 지닌 채 시작합니다", () => {
    expect(startDuel({ seed: 1, classes: ["knight", "mage"] }).players[0].block).toBe(getClass("knight").value);
    let state = reveal(startDuel({ seed: 1, classes: ["mage", "cleric"] }));
    state.players[1].hp = 40;
    state = endDuelTurn(state);
    expect(state.players[1].hp).toBe(40 + getClass("cleric").value);
  });

  it("체력이 0이 되면 상대가 이깁니다", () => {
    let state = reveal(start());
    state.players[1].hp = 1;
    state.players[1].block = 0;
    state.players[0].hand = [{ uid: "x", id: "quill", up: false }];
    state.players[0].energy = 3;
    state = playDuelCard(state, "x");
    expect(state.phase).toBe("over");
    expect(state.winner).toBe(0);
  });

  it("반격을 지닌 상대를 쓰러뜨리면 반격 피해 없이 공격한 쪽이 이깁니다", () => {
    let state = reveal(startDuel({ seed: 5, classes: ["warrior", "gladiator"] }));
    state.players[0].hp = 1;
    state.players[1].hp = 1;
    state.players[1].block = 0;
    state.players[0].hand = [{ uid: "q", id: "quill", up: false }];
    state.players[0].energy = 3;
    state = playDuelCard(state, "q");
    expect(state.winner).toBe(0);
    expect(state.players[0].hp).toBe(1);
  });

  it("침식으로 체력이 절반 아래가 되면 차례 시작에 바로 분노(힘)를 얻습니다", () => {
    let state = reveal(startDuel({ seed: 5, classes: ["mage", "berserker"] }));
    state.players[1].hp = 31;
    state.players[1].statuses.erosion = 3;
    state = endDuelTurn(state);
    expect(state.players[1].hp).toBe(28);
    expect(state.players[1].statuses.strength).toBe(3);
  });
});

describe("저장된 듀얼", () => {
  it("지금 듀얼은 이어 하고, 모양이 다르거나 없는 카드를 가리키면 버립니다", () => {
    const duel = startDuel({ seed: 42, classes: ["warrior", "cleric"] });
    expect(isDuelUsable(duel)).toBe(true);
    expect(isDuelUsable(null)).toBe(false);
    expect(isDuelUsable({ players: [duel.players[0]] })).toBe(false);
    const broken = structuredClone(duel);
    broken.players[1].hand.push({ uid: "x", id: "removed-card", up: false });
    expect(isDuelUsable(broken)).toBe(false);
  });
});
