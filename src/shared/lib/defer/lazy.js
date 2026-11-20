/**
 * 첫 화면 묶음에서 빼고 필요할 때 받는 모듈(긴 글을 담은 JSON 등).
 * 여러 번 불러도 한 번만 받고, 받지 못했으면 다음에 다시 받을 수 있게 합니다.
 * @template T
 * @param {() => Promise<{ default: T }>} importer 동적 import
 */
export function lazyModule(importer) {
  /** @type {T | null} */
  let value = null;
  /** @type {Promise<T> | null} */
  let loading = null;
  return {
    /** @returns {Promise<T>} */
    load() {
      loading ??= importer()
        .then((module) => (value = module.default))
        .catch((error) => {
          loading = null;
          throw error;
        });
      return loading;
    },
    /** 이미 받은 값. 아직 받지 않았으면 null */
    get: () => value,
  };
}
