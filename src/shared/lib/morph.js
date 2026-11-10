/**
 * 기존 DOM을 새로 만든 DOM 모양으로 고칩니다. 바뀐 속성과 글자만 손대므로
 * 다시 그려도 초점, 스크롤, CSS 전환 효과가 그대로 이어집니다.
 *
 * - `data-key`가 있는 자식은 키로 짝을 짓고, 없으면 같은 자리의 같은 태그끼리 짝을 짓습니다.
 * - 이벤트는 새 노드에 붙인 리스너가 옮겨지지 않으므로, 화면 이벤트는 위임(data-action)으로 처리합니다.
 * - `data-morph="skip"`인 요소는 안을 건드리지 않습니다. (직접 관리하는 영역)
 */

/** @param {Node} node */
const keyOf = (node) => (node instanceof Element ? node.getAttribute("data-key") : null);

/** @param {Node} a @param {Node} b */
function same(a, b) {
  if (a.nodeType !== b.nodeType) return false;
  if (a instanceof Element && b instanceof Element) {
    return a.tagName === b.tagName && keyOf(a) === keyOf(b);
  }
  return true;
}

/** @param {Element} from @param {Element} to */
function syncAttributes(from, to) {
  for (const { name } of [...from.attributes]) {
    if (!to.hasAttribute(name)) from.removeAttribute(name);
  }
  for (const { name, value } of [...to.attributes]) {
    if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  }
  if (from instanceof HTMLInputElement && to instanceof HTMLInputElement) {
    if (from.type === "checkbox" || from.type === "radio") from.checked = to.checked;
    else if (from.value !== to.value && document.activeElement !== from) from.value = to.value;
  }
}

/** @param {Node} from @param {Node} to */
function morphNode(from, to) {
  if (from.nodeType === Node.TEXT_NODE || from.nodeType === Node.COMMENT_NODE) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  if (!(from instanceof Element) || !(to instanceof Element)) return;
  syncAttributes(from, to);
  if (from.getAttribute("data-morph") === "skip") return;
  morphChildren(from, to);
}

/**
 * @param {Element} parent 기존 부모
 * @param {Element | DocumentFragment} next 새 자식을 담은 부모
 */
export function morphChildren(parent, next) {
  const incoming = [...next.childNodes];
  const existing = [...parent.childNodes];
  /** @type {Map<string, Node>} */
  const keyed = new Map();
  for (const node of existing) {
    const key = keyOf(node);
    if (key) keyed.set(key, node);
  }
  const used = new Set();
  let cursor = 0;

  // 1) 새 자식마다 짝이 될 기존 노드를 찾습니다.
  const matches = incoming.map((target) => {
    const key = keyOf(target);
    /** @type {Node | undefined} */
    let match;
    if (key) {
      match = keyed.get(key);
      if (match && (used.has(match) || !same(match, target))) match = undefined;
    } else {
      for (let i = cursor; i < existing.length; i += 1) {
        const candidate = existing[i];
        if (!used.has(candidate) && !keyOf(candidate) && same(candidate, target)) {
          match = candidate;
          cursor = i + 1;
          break;
        }
      }
    }
    if (match) used.add(match);
    return match;
  });

  // 2) 짝이 없는 기존 노드를 먼저 지웁니다. 그래야 남은 노드가 제자리에 있어 옮길 필요가 없습니다.
  //    (노드를 옮기면 CSS 애니메이션이 처음부터 다시 돕니다.)
  for (const node of existing) {
    if (!used.has(node) && node.parentNode === parent) parent.removeChild(node);
  }

  // 3) 차례대로 고치고, 순서가 실제로 다를 때만 옮기거나 넣습니다.
  incoming.forEach((target, index) => {
    const match = matches[index];
    const node = match ?? target;
    if (match) morphNode(match, target);
    const reference = parent.childNodes[index] ?? null;
    if (node !== reference) parent.insertBefore(node, reference);
  });
}
