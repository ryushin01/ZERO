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

  it("다른 탭이 판을 바꾸면 이 탭도 그 판으로 다시 그려, 늦게 저장한 탭이 덮어쓰지 않게 합니다", () => {
    const tabA = createStore();
    const tabB = createStore();
    let renders = 0;
    tabB.subscribe(() => (renders += 1));
    const run = createRun({ seed: 5, guide: "greek" });
    tabA.setRun(run);
    // 브라우저는 저장한 탭이 아니라 다른 탭에만 storage 이벤트를 보냅니다.
    window.dispatchEvent(new StorageEvent("storage", { key: "zero:run" }));
    expect(tabB.state.run?.seed).toBe(5);
    expect(renders).toBe(1);

    tabA.setRun(null);
    window.dispatchEvent(new StorageEvent("storage", { key: "zero:run" }));
    expect(tabB.state.run).toBeNull();
  });

  it("다른 탭의 설정과 듀얼 변경, 저장소 전체 비우기도 받아옵니다", () => {
    const tab = createStore();
    localStorage.setItem("zero:settings", JSON.stringify({ motion: "off" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "zero:settings" }));
    expect(tab.state.settings.motion).toBe("off");

    tab.setUi("duel", { duel: { players: [{}, {}] }, classes: ["knight", "mage"] });
    window.dispatchEvent(new StorageEvent("storage", { key: "zero:duel" }));
    expect(tab.state.ui.duel?.duel).toBeUndefined();
    expect(tab.state.ui.duel?.classes).toEqual(["knight", "mage"]);

    tab.setRun(createRun({ seed: 6, guide: "norse" }));
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(tab.state.run).toBeNull();
    expect(tab.state.records.seen).toEqual([]);
  });

  it("상관없는 저장소 열쇠의 변경은 다시 그리지 않습니다", () => {
    const tab = createStore();
    let renders = 0;
    tab.subscribe(() => (renders += 1));
    window.dispatchEvent(new StorageEvent("storage", { key: "other-app" }));
    expect(renders).toBe(0);
  });

  it("묶음 갱신은 끝날 때 한 번만 다시 그리고, 끝나자마자(동기로) 그립니다", () => {
    const store = createStore();
    let renders = 0;
    store.subscribe(() => (renders += 1));
    store.batch(() => {
      store.setUi("run", { selected: null });
      store.setRun(createRun({ seed: 8, guide: "greek" }));
      store.batch(() => store.setUi("run", { selected: "c1" }));
      expect(renders).toBe(0);
    });
    expect(renders).toBe(1);
    store.setUi("run", { selected: null });
    expect(renders).toBe(2);
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
