/**
 * 아주 작은 DOM 생성 도우미.
 *
 *   h("button", { class: "card", onclick: play, "aria-pressed": "false" }, "제우스")
 *
 * - `on*` 속성은 이벤트로, `class`는 문자열·배열로, `style`은 객체로 받습니다.
 * - 값이 false·null·undefined인 속성은 붙이지 않습니다. true는 빈 속성으로 붙입니다.
 * - 자식의 false·null·undefined는 건너뛰고, 배열은 펼칩니다.
 */

/** @typedef {any} Child 노드, 글자, 숫자, 배열. false·null·undefined는 건너뜁니다. */

/**
 * @param {string} tag
 * @param {Record<string, any> | null} [props]
 * @param {...Child} children
 * @returns {HTMLElement}
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "class") {
      el.className = Array.isArray(value) ? value.filter(Boolean).join(" ") : value;
    } else if (key === "style" && typeof value === "object") {
      for (const [prop, v] of Object.entries(value)) {
        if (v !== null && v !== undefined) el.style.setProperty(prop, String(v));
      }
    } else if (key === "html") {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value === true ? "" : String(value));
    }
  }
  append(el, children);
  return el;
}

/** SVG 요소를 만듭니다. 속성 규칙은 h와 같습니다. */
export function svg(tag, props, ...children) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key === "class") el.setAttribute("class", Array.isArray(value) ? value.filter(Boolean).join(" ") : value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
  append(el, children);
  return el;
}

/** @param {Element} el @param {Child[]} children */
function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === false || child === null || child === undefined) continue;
    el.append(child instanceof Node ? child : String(child));
  }
}

/** 화면 낭독기에만 들리는 글 */
export const srOnly = (text) => h("span", { class: "sr-only" }, text);
