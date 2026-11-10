import { getCard } from "#entities/card/index.js";

/**
 * 여러 판에 걸친 기록. 덱에 넣은 적 있는 신은 '서가에 복원'되어 도감에 남습니다.
 * 히든 카드는 복원 진행도와 따로 `found`에 남기고, 찾은 뒤에만 도감에 보입니다.
 *
 * @typedef {{ floors: number, act: number, won: boolean, guide: string }} DailyResult
 * @typedef {{ runs: number, wins: number, bestFloor: number, seen: string[], found: string[], daily: Record<string, DailyResult> }} Records
 */

/** @returns {Records} */
export const emptyRecords = () => ({ runs: 0, wins: 0, bestFloor: 0, seen: [], found: [], daily: {} });

/** 저장된 값을 지금 모양으로 맞춥니다 @param {any} saved @returns {Records} */
export function normalizeRecords(saved) {
  const base = emptyRecords();
  if (!saved || typeof saved !== "object") return base;
  return {
    runs: Number(saved.runs) || 0,
    wins: Number(saved.wins) || 0,
    bestFloor: Number(saved.bestFloor) || 0,
    seen: Array.isArray(saved.seen) ? saved.seen.filter((id) => typeof id === "string") : [],
    found: Array.isArray(saved.found) ? saved.found.filter((id) => typeof id === "string") : [],
    daily: saved.daily && typeof saved.daily === "object" ? saved.daily : {},
  };
}

/** @param {DailyResult | undefined} a @param {DailyResult} b 더 나은 결과 */
function better(a, b) {
  if (!a) return b;
  if (a.won !== b.won) return a.won ? a : b;
  return b.floors > a.floors ? b : a;
}

/**
 * run의 변화를 기록에 반영합니다. 바뀐 것이 없으면 같은 객체를 돌려줍니다.
 * @param {Records} records
 * @param {import("./run.js").Run} run
 * @returns {{ records: Records, run: import("./run.js").Run }}
 */
export function recordRun(records, run) {
  let nextRecords = records;
  let nextRun = run;

  const ids = [...new Set(run.deck.map((c) => c.id))];
  const fresh = ids.filter(
    (id) => getCard(id).figureSlug && getCard(id).source !== "hidden" && !records.seen.includes(id),
  );
  const found = ids.filter((id) => getCard(id).source === "hidden" && !records.found.includes(id));
  if (found.length) nextRecords = { ...nextRecords, found: [...nextRecords.found, ...found] };
  if (fresh.length) {
    nextRecords = { ...nextRecords, seen: [...nextRecords.seen, ...fresh] };
    nextRun = { ...nextRun, discovered: [...(nextRun.discovered ?? []), ...fresh] };
  }

  const finished = (run.phase === "victory" || run.phase === "defeat") && !run.recorded;
  if (finished) {
    const won = run.phase === "victory";
    nextRecords = {
      ...nextRecords,
      runs: nextRecords.runs + 1,
      wins: nextRecords.wins + (won ? 1 : 0),
      bestFloor: Math.max(nextRecords.bestFloor, run.stats.floors),
    };
    if (run.daily) {
      const result = { floors: run.stats.floors, act: run.act, won, guide: run.guide };
      nextRecords = {
        ...nextRecords,
        daily: { ...nextRecords.daily, [run.daily]: better(nextRecords.daily[run.daily], result) },
      };
    }
    nextRun = { ...nextRun, recorded: true };
  }
  return { records: nextRecords, run: nextRun };
}
