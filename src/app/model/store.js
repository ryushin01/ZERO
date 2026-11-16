import { emptyRecords, migrateRun, normalizeRecords, recordRun } from "#features/run/index.js";
import { STORAGE_KEYS } from "#shared/config/index.js";
import { prefersReducedMotion, storage } from "#shared/lib/index.js";

/**
 * 앱 전체 상태. run은 바뀔 때마다 저장해 새로 고침해도 이어 할 수 있습니다.
 * ui는 화면을 다시 그려도 남아야 하는 화면별 임시 상태입니다. (고른 카드, 도감 거르기 등)
 */
export function createStore() {
  const prefersReduced = prefersReducedMotion();
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
  // 묶음(batch) 안에서는 알림을 모아 두었다가 끝날 때 한 번만 보냅니다.
  let batching = 0;
  let pending = false;
  const emit = () => {
    if (batching > 0) {
      pending = true;
      return;
    }
    listeners.forEach((fn) => fn());
  };

  // 다른 탭에서 판·기록·설정·듀얼이 바뀌면 이 탭도 같은 값으로 다시 그립니다.
  // 그러지 않으면 두 탭에서 이어 할 때 늦게 저장한 탭이 다른 탭의 진행을 덮어씁니다.
  // (key가 null이면 다른 탭이 저장소를 통째로 비운 것입니다)
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      const all = event.key === null;
      if (!all && !Object.values(STORAGE_KEYS).includes(event.key)) return;
      if (all || event.key === STORAGE_KEYS.records)
        state.records = normalizeRecords(storage.read(STORAGE_KEYS.records, null));
      if (all || event.key === STORAGE_KEYS.run) state.run = migrateRun(storage.read(STORAGE_KEYS.run, null));
      if (all || event.key === STORAGE_KEYS.settings)
        state.settings = { motion: prefersReduced ? "off" : "on", ...storage.read(STORAGE_KEYS.settings, {}) };
      // 듀얼은 저장해 둔 것을 다시 읽게 합니다. 손을 펼친 차례였더라도 넘기기 화면부터 보여 줍니다.
      if ((all || event.key === STORAGE_KEYS.duel) && state.ui.duel)
        state.ui.duel = { ...state.ui.duel, duel: undefined };
      emit();
    });
  }

  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /**
     * 여러 변경을 묶어 화면을 한 번만 다시 그립니다. 끝나면 바로(동기로) 그리므로,
     * 묶음 뒤에 이어지는 초점 옮기기는 새 화면을 봅니다.
     * @param {() => void} fn
     */
    batch(fn) {
      batching += 1;
      try {
        fn();
      } finally {
        batching -= 1;
        if (batching === 0 && pending) {
          pending = false;
          emit();
        }
      }
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
      storage.remove(STORAGE_KEYS.duel);
      // 화면에 남아 있는 듀얼도 지워, 듀얼 화면으로 돌아가면 클래스 고르기부터 시작합니다.
      if (state.ui.duel) state.ui.duel = { ...state.ui.duel, duel: null };
      emit();
    },
    /** @param {string} key @param {Record<string, any>} patch */
    setUi(key, patch) {
      state.ui[key] = { ...state.ui[key], ...patch };
      emit();
    },
  };
}
