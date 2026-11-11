import { beforeEach, describe, expect, it } from "vitest";

import { createRun } from "#features/run/index.js";

import { createStore } from "./store.js";

describe("createStore", () => {
  beforeEach(() => localStorage.clear());

  it("다른 탭이 먼저 저장한 서가 복원 기록을 지우지 않습니다", () => {
    const tabA = createStore();
    const tabB = createStore(); // 두 탭이 같은 (빈) 기록에서 시작합니다.
    tabA.setRun(createRun({ seed: 1, guide: "greek" }));
    tabB.setRun(createRun({ seed: 2, guide: "norse" }));
    const saved = JSON.parse(localStorage.getItem("zero:records"));
    expect(saved.seen).toHaveLength(4);
    expect(saved.seen).toEqual(expect.arrayContaining(tabA.state.records.seen.slice(0, 2)));
  });

  it("다른 탭의 기록 변경을 storage 이벤트로 받아옵니다", () => {
    const tab = createStore();
    localStorage.setItem("zero:records", JSON.stringify({ runs: 3, wins: 1, bestFloor: 9, seen: ["zeus"], daily: {} }));
    window.dispatchEvent(new StorageEvent("storage", { key: "zero:records" }));
    expect(tab.state.records).toMatchObject({ runs: 3, seen: ["zeus"] });
  });

  it("기록을 지우면 저장해 둔 듀얼과 화면에 남은 듀얼도 지웁니다", () => {
    const store = createStore();
    localStorage.setItem("zero:duel", JSON.stringify({ players: [{}, {}] }));
    store.setUi("duel", { duel: { players: [{}, {}] }, classes: ["knight", "mage"] });
    store.resetRecords();
    expect(localStorage.getItem("zero:duel")).toBeNull();
    expect(store.state.ui.duel?.duel).toBeNull();
    expect(store.state.ui.duel?.classes).toEqual(["knight", "mage"]);
  });
});
