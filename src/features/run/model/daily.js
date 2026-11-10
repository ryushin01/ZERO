import { guideName } from "./run.js";

/**
 * 오늘의 신화: 날짜로 시드를 정해 모두가 같은 길잡이 후보와 지도로 겨룹니다.
 * 날짜는 한국 시간(UTC+9) 기준입니다.
 */

/** @param {Date} [date] @returns {string} 예) 2026-11-10 */
export function dailyKey(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 날짜 문자열을 31비트 시드로 (FNV-1a) @param {string} key */
export function dailySeed(key) {
  let hash = 0x811c9dc5;
  for (const ch of `zero:${key}`) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 2 ** 31;
}

/** @param {string} key 2026-11-10 → 11월 10일 */
export function dailyLabel(key) {
  const [, month, day] = key.split("-").map(Number);
  return `${month}월 ${day}일`;
}

/**
 * 결과를 나눌 글
 * @param {import("./run.js").Run} run
 * @param {string} url
 */
export function shareText(run, url) {
  const won = run.phase === "victory";
  const outcome = won ? "승리" : `${run.act}장에서 쓰러짐`;
  const head = run.daily ? `ZERO 오늘의 신화 ${dailyLabel(run.daily)}` : "ZERO 신화 덱빌딩";
  return [
    head,
    `${guideName(run)} · ${outcome} · ${run.stats.floors}칸`,
    `괴물 ${run.stats.battles} · 정예 ${run.stats.elites} · 보스 ${run.stats.bosses}`,
    `${"■".repeat(run.stats.bosses)}${"□".repeat(3 - run.stats.bosses)}`,
    url,
  ]
    .filter(Boolean)
    .join("\n");
}
