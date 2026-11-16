import { describe, expect, it } from "vitest";

import { startCombat } from "./combat.js";
import { clampOblivion, OBLIVION_MAX, oblivionEffects, oblivionRules } from "./oblivion.js";
import { recordRun, emptyRecords, normalizeRecords } from "./records.js";
import { createRun, enterNode, leaveReward, migrateRun, restAmount, START_HP } from "./run.js";

describe("망각 단계", () => {
  it("단계 값은 0~5의 정수로 맞추고, 단계마다 규칙이 하나씩 쌓입니다", () => {
    expect(clampOblivion(-2)).toBe(0);
    expect(clampOblivion("3")).toBe(3);
    expect(clampOblivion(9)).toBe(OBLIVION_MAX);
    expect(clampOblivion("x")).toBe(0);
    expect(oblivionRules(0)).toEqual([]);
    expect(oblivionRules(3)).toHaveLength(3);
    expect(oblivionRules(OBLIVION_MAX)).toHaveLength(OBLIVION_MAX);
  });

  it("4단계부터 최대 체력 64로 시작하고, 오늘의 신화는 늘 0단계입니다", () => {
    expect(createRun({ seed: 1, guide: "greek", oblivion: 3 })).toMatchObject({ hp: START_HP, oblivion: 3 });
    expect(createRun({ seed: 1, guide: "greek", oblivion: 4 })).toMatchObject({ hp: 64, maxHp: 64, oblivion: 4 });
    expect(createRun({ seed: 1, guide: "greek", oblivion: 5, daily: "2026-11-16" }).oblivion).toBe(0);
  });

  it("1단계는 정예·보스 체력, 2단계는 모든 괴물의 힘, 5단계는 보스의 힘을 올립니다", () => {
    const fight = (/** @type {number} */ oblivion, /** @type {string[]} */ enemyIds) =>
      startCombat({ deck: [], hp: 60, maxHp: 72, relics: [], enemyIds, seed: 4, oblivion });
    expect(fight(1, ["minotaur"]).enemies[0].maxHp).toBe(Math.round(fight(0, ["minotaur"]).enemies[0].maxHp * 1.1));
    expect(fight(1, ["harpy"]).enemies[0].maxHp).toBe(fight(0, ["harpy"]).enemies[0].maxHp);
    expect(fight(1, ["harpy"]).enemies[0].statuses.strength).toBe(0);
    expect(fight(2, ["harpy"]).enemies[0].statuses.strength).toBe(1);
    expect(fight(4, ["hydra"]).enemies[0].statuses.strength).toBe(1);
    expect(fight(5, ["hydra"]).enemies[0].statuses.strength).toBe(3);
    expect(fight(5, ["harpy"]).enemies[0].statuses.strength).toBe(1);
  });

  it("3단계부터 쉼터와 장 사이의 회복이 줄어듭니다", () => {
    const run = { ...createRun({ seed: 2, guide: "norse" }), hp: 20 };
    expect(restAmount(run)).toBe(Math.ceil(run.maxHp * 0.3));
    expect(restAmount({ ...run, oblivion: 3 })).toBe(Math.ceil(run.maxHp * 0.2));
    expect(oblivionEffects(3).actHeal).toBe(0.4);
    // 1장 보스를 이긴 뒤 다음 장으로: 잃은 체력 52의 60%와 40%
    const atBoss = { ...run, position: { row: run.map.rows.length - 1, lane: 1 }, reward: null };
    expect(leaveReward(atBoss).hp).toBe(20 + Math.ceil(52 * 0.6));
    expect(leaveReward({ ...atBoss, oblivion: 3 }).hp).toBe(20 + Math.ceil(52 * 0.4));
  });

  it("전투에도 판의 단계가 넘어갑니다", () => {
    const run = createRun({ seed: 3, guide: "greek", oblivion: 2 });
    const battle = enterNode(run, run.map.rows[0][0].id);
    expect(battle.combat?.enemies.every((e) => e.statuses.strength === 1)).toBe(true);
  });

  it("자유 도전에서 이기면 다음 단계가 열리고, 지거나 오늘의 신화로 이기면 열리지 않습니다", () => {
    const won = (/** @type {number} */ oblivion, daily = null) => ({
      ...createRun({ seed: 5, guide: "greek", oblivion, daily }),
      phase: /** @type {const} */ ("victory"),
    });
    expect(recordRun(emptyRecords(), won(0)).records.oblivion).toBe(1);
    expect(recordRun({ ...emptyRecords(), oblivion: 3 }, won(1)).records.oblivion).toBe(3);
    expect(recordRun({ ...emptyRecords(), oblivion: 5 }, won(5)).records.oblivion).toBe(5);
    expect(recordRun(emptyRecords(), won(0, "2026-11-16")).records.oblivion).toBe(0);
    expect(recordRun(emptyRecords(), { ...won(0), phase: "defeat" }).records.oblivion).toBe(0);
    // 새로 연 단계만 판에 남겨 결과 화면이 알립니다. 이미 열려 있던 단계는 남기지 않습니다.
    expect(recordRun(emptyRecords(), won(0)).run.unlocked).toBe(1);
    expect(recordRun({ ...emptyRecords(), oblivion: 2 }, won(1)).run.unlocked).toBeUndefined();
    expect(normalizeRecords({ oblivion: 99 }).oblivion).toBe(OBLIVION_MAX);
    expect(normalizeRecords({}).oblivion).toBe(0);
  });

  it("단계가 없는 옛 저장은 0단계로 이어 하고, 범위를 벗어난 단계는 버립니다", () => {
    const run = /** @type {any} */ (createRun({ seed: 6, guide: "greek" }));
    delete run.oblivion;
    expect(migrateRun(run)).not.toBeNull();
    expect(migrateRun({ ...run, oblivion: 9 })).toBeNull();
    expect(migrateRun({ ...run, oblivion: 1.5 })).toBeNull();
  });
});
