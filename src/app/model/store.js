import { emptyRecords, migrateRun, normalizeRecords, recordRun } from "#features/run/index.js";
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
    // 이전 버전의 저장도 지금 형식으로 옮겨 이어 할 수 있게 합니다.
    run: migrateRun(savedRun),
    settings: { motion: prefersReduced ? "off" : "on", ...storage.read(STORAGE_KEYS.settings, {}) },
    records: normalizeRecords(storage.read(STORAGE_KEYS.records, null)),
    /** @type {Record<string, Record<string, any>>} */
    ui: {},
  };
  /** @type {Set<() => void>} */
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  // 다른 탭에서 기록이 바뀌면 이 탭의 도감과 결과에도 반영합니다.
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEYS.records) return;
      state.records = normalizeRecords(storage.read(STORAGE_KEYS.records, null));
      emit();
    });
  }

  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** @param {import("#features/run/index.js").Run | null} run */
    setRun(run) {
      // 덱에 들어온 신과 끝난 판의 결과를 여러 판에 걸친 기록에 반영합니다.
      // 다른 탭이 먼저 저장한 기록을 지우지 않도록, 저장된 최신 기록 위에 반영합니다.
      if (run) {
        const latest = normalizeRecords(storage.read(STORAGE_KEYS.records, state.records));
        const result = recordRun(latest, run);
        if (result.records !== latest) storage.write(STORAGE_KEYS.records, result.records);
        state.records = result.records;
        run = result.run;
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
      state.records = emptyRecords();
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
