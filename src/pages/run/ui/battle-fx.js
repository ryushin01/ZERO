/**
 * 전투의 손맛: 체력이 깎이면 숫자가 떠오르고 대상이 흔들립니다. 방어를 얻으면 '방어 +N'이 뜹니다.
 *
 * - 화면 패치(morph)는 보기에 없는 요소와 속성을 지우므로, 숫자는 본문 밖의 효과 층에 그리고
 *   흔들림은 Web Animations API로 줍니다. (속성을 바꾸지 않습니다)
 * - 장식이므로 화면 낭독기에는 숨기고, 움직임을 끄거나 동작 줄이기를 켜면 나오지 않습니다.
 */

import { prefersReducedMotion } from "#shared/lib/index.js";

/** @type {WeakMap<Element, { hp: number, block: number }>} */
const last = new WeakMap();

const reduced = () => document.body.dataset.motion === "off" || prefersReducedMotion();

function layer() {
  let el = /** @type {HTMLElement | null} */ (document.querySelector("[data-fx-layer]"));
  if (!el) {
    el = document.createElement("div");
    el.className = "fx-layer";
    el.dataset.fxLayer = "";
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);
  }
  return el;
}

/** @param {Element} target @param {string} text @param {"damage" | "heal" | "block"} kind @param {number} offset */
function float(target, text, kind, offset) {
  const rect = target.getBoundingClientRect();
  const span = document.createElement("span");
  span.className = `fx-float fx-float--${kind}`;
  span.textContent = text;
  span.style.left = `${rect.left + rect.width / 2 + offset}px`;
  span.style.top = `${rect.top + Math.min(rect.height * 0.4, 120)}px`;
  layer().append(span);
  const animation = span.animate(
    [
      { transform: "translate(-50%, 0) scale(0.8)", opacity: 0 },
      { transform: "translate(-50%, -18px) scale(1.1)", opacity: 1, offset: 0.2 },
      { transform: "translate(-50%, -64px) scale(1)", opacity: 0 },
    ],
    { duration: 1000, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  animation.onfinish = () => span.remove();
}

/** @param {Element} target @param {number} strength */
function shake(target, strength) {
  const x = Math.min(10, 3 + strength / 3);
  target.animate(
    [
      { transform: "translateX(0)" },
      { transform: `translateX(${-x}px)` },
      { transform: `translateX(${x * 0.7}px)` },
      { transform: `translateX(${-x * 0.4}px)` },
      { transform: "translateX(0)" },
    ],
    { duration: 380, easing: "ease-out" },
  );
}

/**
 * 그린 뒤에 지난 값과 비교합니다. 대상은 data-vital, data-hp, data-block이 있는 요소입니다.
 * @param {HTMLElement} main
 */
export function battleEffects(main) {
  const calm = reduced() || typeof Element.prototype.animate !== "function";
  for (const el of main.querySelectorAll("[data-vital]")) {
    const hp = Number(/** @type {HTMLElement} */ (el).dataset.hp);
    const block = Number(/** @type {HTMLElement} */ (el).dataset.block ?? 0);
    const prev = last.get(el);
    last.set(el, { hp, block });
    if (!prev || calm) continue;
    const lost = prev.hp - hp;
    if (lost > 0) {
      float(el, `−${lost}`, "damage", 0);
      shake(el, lost);
    } else if (lost < 0) {
      float(el, `+${-lost}`, "heal", 0);
    }
    if (block > prev.block) float(el, `방어 +${block - prev.block}`, "block", lost !== 0 ? 56 : 0);
  }
}
