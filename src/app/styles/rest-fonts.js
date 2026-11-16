import { afterLoadIdle } from "#shared/lib/index.js";

/** 페이지를 다 받은 뒤 기다리는 시간. 첫 화면 그리기와 겹치지 않게 함 */
const DELAY_MS = 1000;
const IDLE_TIMEOUT_MS = 2000;

/**
 * 화면 글자 파일에 없는 한글을 위한 글꼴 조각 CSS를 페이지를 다 받고 한가할 때 붙입니다.
 * 조각 파일은 그 글자를 화면에 쓸 때만 받습니다. 취소 함수를 돌려줍니다.
 * @param {string} href
 * @returns {() => void}
 */
export function attachRestFonts(href) {
  /** @type {HTMLLinkElement | undefined} */
  let link;
  const cancel = afterLoadIdle(
    () => {
      const element = document.createElement("link");
      element.rel = "stylesheet";
      element.href = href;
      // print로 걸어 가장 낮은 우선순위로 받고, 다 받은 뒤 화면에 적용
      element.media = "print";
      element.onload = () => {
        element.media = "all";
      };
      document.head.append(element);
      link = element;
    },
    { delay: DELAY_MS, timeout: IDLE_TIMEOUT_MS },
  );
  return () => {
    cancel();
    link?.remove();
  };
}
