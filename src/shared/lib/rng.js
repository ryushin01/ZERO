/**
 * 시드로 재현할 수 있는 난수 (mulberry32).
 * 상태를 숫자 하나로 들고 다니므로 저장과 테스트가 쉽습니다.
 */

/** @param {number} state @returns {[number, number]} [0~1 난수, 다음 상태] */
export function next(state) {
  const s = (state + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/**
 * 상태를 안에 품은 난수 생성기. `rng.state`로 다음 상태를 꺼내 저장합니다.
 * @param {number} seed
 */
export function createRng(seed) {
  let state = seed | 0;
  const rng = {
    get state() {
      return state;
    },
    /** 0 이상 1 미만 */
    float() {
      const [value, nextState] = next(state);
      state = nextState;
      return value;
    },
    /** min 이상 max 이하 정수 */
    int(min, max) {
      return min + Math.floor(rng.float() * (max - min + 1));
    },
    /** @template T @param {readonly T[]} list @returns {T} */
    pick(list) {
      return list[Math.floor(rng.float() * list.length)];
    },
    /** @template T @param {readonly T[]} list @returns {T[]} 새 배열 */
    shuffle(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng.float() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    /** @template T @param {readonly T[]} list @param {number} count @returns {T[]} 겹치지 않게 count개 */
    sample(list, count) {
      return rng.shuffle(list).slice(0, count);
    },
    /** @template {string} K @param {Record<K, number>} weights @returns {K} */
    weighted(weights) {
      const entries = /** @type {[K, number][]} */ (Object.entries(weights));
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = rng.float() * total;
      for (const [key, weight] of entries) {
        roll -= weight;
        if (roll < 0) return key;
      }
      return entries[entries.length - 1][0];
    },
  };
  return rng;
}

/** 새 판의 시드 */
export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}
