/**
 * localStorage를 감싼 저장소. 사생활 보호 모드처럼 저장소가 막혀도 게임은 그대로 돌아갑니다.
 */
export const storage = {
  /** @template T @param {string} key @param {T} fallback @returns {T} */
  read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  /** @param {string} key @param {unknown} value */
  write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장하지 못해도 진행은 이어 갑니다.
    }
  },
  /** @param {string} key */
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // 무시
    }
  },
};
