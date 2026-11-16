/**
 * 망각 단계(난이도). 자유 도전에서 이기면 다음 단계가 열리고, 단계가 오를수록 규칙이 하나씩 쌓입니다.
 * 오늘의 신화는 모두 같은 조건으로 겨루므로 늘 0단계입니다.
 */

/** 가장 높은 단계 */
export const OBLIVION_MAX = 5;

/** 단계마다 더해지는 규칙. (0단계는 규칙 없음) */
export const OBLIVION_RULES = [
  "",
  "정예와 보스의 체력이 10% 늘어납니다.",
  "모든 괴물이 힘 1을 지니고 싸움을 시작합니다.",
  "쉼터의 회복이 최대 체력의 30%에서 20%로, 장이 바뀔 때 되찾는 체력이 60%에서 40%로 줄어듭니다.",
  "최대 체력 72에서 64로 시작합니다.",
  "보스가 힘 2를 더 지니고 싸움을 시작합니다.",
];

/** 단계 값을 0~최고 단계의 정수로 맞춥니다. @param {unknown} level @returns {number} */
export const clampOblivion = (level) => {
  const n = Math.floor(Number(level));
  return Number.isFinite(n) ? Math.min(OBLIVION_MAX, Math.max(0, n)) : 0;
};

/** 그 단계까지 쌓인 규칙 @param {number} level @returns {string[]} */
export const oblivionRules = (level) => OBLIVION_RULES.slice(1, clampOblivion(level) + 1);

/** 그 단계에서 쓰는 수치 @param {number} level */
export function oblivionEffects(level) {
  const n = clampOblivion(level);
  return {
    /** 정예·보스 체력 배율 */
    toughHp: n >= 1 ? 1.1 : 1,
    /** 모든 괴물이 시작할 때 지니는 힘 */
    enemyStrength: n >= 2 ? 1 : 0,
    /** 쉼터 회복 비율 */
    rest: n >= 3 ? 0.2 : 0.3,
    /** 장이 바뀔 때 잃은 체력에서 되찾는 비율 */
    actHeal: n >= 3 ? 0.4 : 0.6,
    /** 시작 최대 체력에서 빼는 값 */
    startHpCut: n >= 4 ? 8 : 0,
    /** 보스가 더 지니는 힘 */
    bossStrength: n >= 5 ? 2 : 0,
  };
}
