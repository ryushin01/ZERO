/**
 * 페이지를 다 받은 뒤(load) delay만큼 기다렸다가 브라우저가 한가할 때 fn을 부릅니다.
 * 첫 화면 그리기와 겹치지 않게 나중에 해도 되는 일(나머지 글꼴, 카드 상세 자료 미리 받기)에 씁니다.
 * requestIdleCallback이 없는 브라우저(Safari 등)는 기다린 뒤 바로 부릅니다. 취소 함수를 돌려줍니다.
 * @param {() => void} fn
 * @param {{ delay?: number, timeout?: number }} [options] delay: load 뒤 기다리는 시간, timeout: 한가하지 않아도 부를 기한
 * @returns {() => void}
 */
export function afterLoadIdle(fn, { delay = 1000, timeout = 2000 } = {}) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  /** @type {number | undefined} */
  let idle;
  let cancelled = false;
  const run = () => {
    if (!cancelled) fn();
  };
  const schedule = () => {
    timer = setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout });
      else run();
    }, delay);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    clearTimeout(timer);
    window.removeEventListener("load", schedule);
    if (idle !== undefined) window.cancelIdleCallback(idle);
  };
}
