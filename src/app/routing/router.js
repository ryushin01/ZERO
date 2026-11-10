/**
 * 해시 주소로 화면을 고릅니다. 정적 호스팅 어디서나 새로 고침과 뒤로 가기가 됩니다.
 *   #/          처음 화면
 *   #/new       길잡이 신화 고르기
 *   #/run       진행 중인 판
 *   #/codex     도감
 *   #/guide     도움말
 */
export const ROUTES = ["title", "new", "run", "codex", "guide"];

export function parseRoute(hash = window.location.hash) {
  const path = hash.replace(/^#\/?/, "").split("?")[0];
  const [name = ""] = path.split("/");
  if (name === "") return { name: "title" };
  return { name: ROUTES.includes(name) ? name : "not-found" };
}

/** @param {string} hash */
export function navigate(hash) {
  if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else window.location.hash = hash;
}
