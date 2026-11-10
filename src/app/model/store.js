import { isRun } from "#features/run/index.js";
import { STORAGE_KEYS } from "#shared/config/index.js";
import { storage } from "#shared/lib/index.js";

/**
 * 앱 전체 상태. run은 바뀔 때마다 저장해 새로 고침해도 이어 할 수 있습니다.
 * ui는 화면을 다시 그려도 남아야 하는 화면별 임시 상태입니다. (고른 카드, 도감 거르기 등)
 */
export function createStore() {
  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const savedRun = storage.read(STORAGE_KEYS.run, null);

  const state = {
    run: isRun(savedRun) ? savedRun : null,
    settings: { motion: prefersReduced ? "off" : "on", ...storage.read(STORAGE_KEYS.settings, {}) },
    records: { runs: 0, wins: 0, bestFloor: 0, ...storage.read(STORAGE_KEYS.records, {}) },
    /** @type {Record<string, Record<string, any>>} */
    ui: {},
  };
  /** @type {Set<() => void>} */
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** @param {import("#features/run/index.js").Run | null} run */
    setRun(run) {
      const finished = run && (run.phase === "victory" || run.phase === "defeat") && !run.recorded;
      if (finished && run) {
        run = { ...run, recorded: true };
        state.records = {
          runs: state.records.runs + 1,
          wins: state.records.wins + (run.phase === "victory" ? 1 : 0),
          bestFloor: Math.max(state.records.bestFloor, run.stats.floors),
        };
        storage.write(STORAGE_KEYS.records, state.records);
      }
      state.run = run;
      if (run) storage.write(STORAGE_KEYS.run, run);
      else storage.remove(STORAGE_KEYS.run);
      emit();
    },
    /** @param {Partial<typeof state.settings>} patch */
    setSettings(patch) {
      state.settings = { ...state.settings, ...patch };
      storage.write(STORAGE_KEYS.settings, state.settings);
      emit();
    },
    resetRecords() {
      state.records = { runs: 0, wins: 0, bestFloor: 0 };
      storage.remove(STORAGE_KEYS.records);
      emit();
    },
    /** @param {string} key @param {Record<string, any>} patch */
    setUi(key, patch) {
      state.ui[key] = { ...state.ui[key], ...patch };
      emit();
    },
  };
}
