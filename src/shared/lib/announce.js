/**
 * 화면 낭독기에 알릴 말을 공용 라이브 영역(`role="status"`)으로 보냅니다.
 * 영역은 index.html에 처음부터 두고 내용만 바꿉니다. 알릴 때 새로 만들면 일부 화면 낭독기가 첫 알림을 읽지 않습니다.
 * `role="status"`가 이미 polite 라이브 영역이므로 aria-live를 또 적지 않습니다.
 */
let region = /** @type {HTMLElement | null} */ (null);
let timer = 0;

function ensureRegion() {
  if (region?.isConnected) return region;
  region = document.querySelector("[data-announcer]");
  if (region) return region;
  // index.html 밖(Storybook·테스트)에서는 처음 알릴 때 만듭니다.
  region = document.createElement("div");
  region.className = "sr-only";
  region.setAttribute("role", "status");
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
