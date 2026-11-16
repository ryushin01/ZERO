import { getCard } from "#entities/card/index.js";

import { dailyKey } from "./daily.js";
import { clampOblivion, OBLIVION_MAX } from "./oblivion.js";

/**
 * 여러 판에 걸친 기록. 덱에 넣은 적 있는 신은 '서가에 복원'되어 도감에 남습니다.
 * 히든 카드는 복원 진행도와 따로 `found`에 남기고, 찾은 뒤에만 도감에 보입니다.
 *
 * @typedef {{ floors: number, act: number, won: boolean, guide: string }} DailyResult
 * @typedef {{ at: string, guide: string, won: boolean, act: number, floors: number, oblivion: number, daily: string | null }} PastRun
 *   끝난 판 하나. at은 끝난 날(한국 시간, 2026-11-16)
 * @typedef {{
 *   runs: number, wins: number, bestFloor: number, seen: string[], found: string[], daily: Record<string, DailyResult>,
 *   oblivion: number, history: PastRun[],
 * }} Records oblivion: 열린 망각 단계 가운데 가장 높은 단계, history: 지난 판(최근 것부터)
 */

/** 남겨 두는 지난 판 수 */
export const HISTORY_LIMIT = 10;

/** 기록 파일의 종류 표시 (다른 앱의 JSON을 불러오지 않게) */
const FILE_KIND = "zero-records";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 저장된 지난 판 하나가 쓸 수 있는 모양인지 @param {any} past */
const isPastRun = (past) =>
  Boolean(past) &&
  typeof past.at === "string" &&
  DATE.test(past.at) &&
  typeof past.guide === "string" &&
  typeof past.won === "boolean" &&
  [1, 2, 3].includes(past.act) &&
  Number.isFinite(past.floors) &&
  (past.daily === null || (typeof past.daily === "string" && DATE.test(past.daily)));

/** @returns {Records} */
export const emptyRecords = () => ({
  runs: 0,
  wins: 0,
  bestFloor: 0,
  seen: [],
  found: [],
  daily: {},
  oblivion: 0,
  history: [],
});

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
    oblivion: clampOblivion(saved.oblivion),
    history: Array.isArray(saved.history)
      ? saved.history
          .filter(isPastRun)
          .slice(0, HISTORY_LIMIT)
          .map((/** @type {PastRun} */ past) => ({ ...past, oblivion: clampOblivion(past.oblivion) }))
      : [],
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
 * @param {Date} [now] 판이 끝난 때 (지난 판 기록의 날짜)
 * @returns {{ records: Records, run: import("./run.js").Run }}
 */
export function recordRun(records, run, now = new Date()) {
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
      history: [
        {
          at: dailyKey(now),
          guide: run.guide,
          won,
          act: run.act,
          floors: run.stats.floors,
          oblivion: clampOblivion(run.oblivion),
          daily: run.daily ?? null,
        },
        ...(nextRecords.history ?? []),
      ].slice(0, HISTORY_LIMIT),
    };
    // 자유 도전에서 이기면 다음 망각 단계가 열립니다. (오늘의 신화는 늘 0단계라 열지 않음)
    // 이 승리로 새로 열린 단계는 판에도 남겨, 결과 화면이 이미 열려 있던 단계를 또 알리지 않게 합니다.
    if (won && !run.daily) {
      const unlocked = Math.min(OBLIVION_MAX, clampOblivion(run.oblivion) + 1);
      if (unlocked > nextRecords.oblivion) {
        nextRecords = { ...nextRecords, oblivion: unlocked };
        nextRun = { ...nextRun, unlocked };
      }
    }
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

/**
 * 기록 파일(JSON)의 내용. 진행은 브라우저에만 저장되므로, 기기를 옮기거나 사이트 데이터를 지우기 전에 받아 둡니다.
 * 진행 중인 판은 담지 않습니다.
 * @param {Records} records @param {{ motion: string }} settings @param {Date} [now]
 */
export const recordsFile = (records, settings, now = new Date()) => ({
  kind: FILE_KIND,
  version: 1,
  savedAt: now.toISOString(),
  records,
  settings: { motion: settings.motion },
});

/**
 * 기록 파일을 읽습니다. ZERO가 만든 기록 파일이 아니면 null입니다.
 * @param {string} text
 * @returns {{ records: Records, settings: { motion: "on" | "off" } | null } | null}
 */
export function readRecordsFile(text) {
  try {
    const data = JSON.parse(text);
    if (!data || data.kind !== FILE_KIND || !data.records || typeof data.records !== "object") return null;
    const motion = data.settings?.motion;
    return {
      records: normalizeRecords(data.records),
      settings: motion === "on" || motion === "off" ? { motion } : null,
    };
  } catch {
    return null;
  }
}
