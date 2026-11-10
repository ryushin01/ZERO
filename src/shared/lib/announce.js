/**
 * 화면 낭독기에 알릴 말을 공용 라이브 영역으로 보냅니다.
 * 영역은 화면을 다시 그려도 남도록 body 바로 아래에 한 번만 만듭니다.
 */
let region = /** @type {HTMLElement | null} */ (null);
let timer = 0;

function ensureRegion() {
  if (region?.isConnected) return region;
  region = document.createElement("div");
  region.className = "sr-only";
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.dataset.announcer = "";
  document.body.append(region);
  return region;
}

/** @param {string | string[]} message */
export function announce(message) {
  const text = Array.isArray(message) ? message.filter(Boolean).join(" ") : message;
  if (!text) return;
  const target = ensureRegion();
  // 같은 문장이 이어져도 다시 읽도록 비웠다가 채웁니다.
  target.textContent = "";
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    target.textContent = text;
  }, 60);
}
