import { f } from "./kit.js";

/**
 * 신 곁의 작은 동물. 신화 속 도상(오딘의 까마귀, 아테나의 올빼미, 두르가의 사자 등)을 그립니다.
 * 발치 동물은 그림 왼쪽 아래(-58, 0)에, 새는 어깨나 하늘에 둡니다.
 *
 * @typedef {"raven" | "ravens" | "owl" | "eagle" | "dove" | "peacock" | "wolf" | "lion" | "tiger" | "cat" | "bear" | "goat" | "deer" | "dog" | "serpent" | "boar" | "horse"} Companion
 */

/** 앉아 있는 새 @param {string} fill @param {string} eye @param {number} x @param {number} y @param {number} [k] */
const perched = (fill, eye, x, y, k = 1) =>
  `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><path d="M-6 0 Q-8 -12 0 -16 Q8 -14 7 -4 L12 6 L2 2 Q-4 4 -6 0Z" fill="${fill}"/><circle cx="2" cy="-15" r="5" fill="${fill}"/><path d="M6 -16 L12 -14 L6 -12Z" fill="#c9a24a"/><circle cx="3.5" cy="-16" r="1" fill="${eye}"/></g>`;

/** 날개를 편 새 @param {string} fill @param {string} eye @param {number} x @param {number} y @param {number} [k] */
const flying = (fill, eye, x, y, k = 1) =>
  `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><path d="M0 0 Q-14 -16 -30 -10 Q-18 -6 -10 2 Q-20 4 -24 12 Q-8 8 0 4 Q8 8 24 12 Q20 4 10 2 Q18 -6 30 -10 Q14 -16 0 0Z" fill="${fill}"/><circle cx="0" cy="-2" r="4" fill="${fill}"/><path d="M3 -3 L9 -1 L3 1Z" fill="#c9a24a"/><circle cx="1.5" cy="-3" r=".9" fill="${eye}"/></g>`;

/**
 * 네발짐승. 발이 (0,0), 머리는 오른쪽(+x)을 봅니다.
 * @param {{ body: string, mane?: string, horns?: string, stripes?: boolean, ears?: "point" | "round" | "long", tail?: "long" | "short" | "tuft", eye: string, k?: number }} o
 */
function quad(o) {
  const k = o.k ?? 1;
  const legs = [-14, -7, 9, 16]
    .map((x) => `<path d="M${x} -16 L${x - 1} -1" stroke="${o.body}" stroke-width="4.4" stroke-linecap="round"/>`)
    .join("");
  const tail =
    o.tail === "short"
      ? `<path d="M-19 -24 l-5 -3" stroke="${o.body}" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M-19 -22 Q-30 -26 -28 -40" stroke="${o.body}" stroke-width="${o.tail === "tuft" ? 2.2 : 3.6}" fill="none" stroke-linecap="round"/>${o.tail === "tuft" ? `<circle cx="-28" cy="-41" r="3" fill="${o.mane ?? o.body}"/>` : ""}`;
  const ears =
    o.ears === "round"
      ? `<circle cx="17" cy="-40" r="3" fill="${o.body}"/><circle cx="25" cy="-41" r="3" fill="${o.body}"/>`
      : o.ears === "long"
        ? `<path d="M18 -38 L14 -52 L22 -40Z M24 -38 L24 -53 L28 -39Z" fill="${o.body}"/>`
        : `<path d="M16 -38 L17 -48 L22 -39Z M23 -38 L27 -48 L28 -36Z" fill="${o.body}"/>`;
  const mane = o.mane ? `<circle cx="20" cy="-31" r="11" fill="${o.mane}"/>` : "";
  const horns = o.horns
    ? `<path d="M18 -40 Q12 -52 4 -50 M25 -40 Q30 -54 22 -58" stroke="${o.horns}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : "";
  const stripes = o.stripes
    ? [-10, -3, 4, 11].map((x) => `<path d="M${x} -32 l2 10" stroke="#1a120a" stroke-width="2" opacity=".8"/>`).join("")
    : "";
  return `<g transform="scale(${f(k)})">${tail}${legs}<ellipse cx="0" cy="-24" rx="21" ry="10" fill="${o.body}"/>${stripes}${mane}${horns}<ellipse cx="22" cy="-32" rx="8" ry="7" fill="${o.body}"/>${ears}<path d="M27 -34 L35 -29 L27 -26Z" fill="${o.body}"/><circle cx="24" cy="-34" r="1.3" fill="${o.eye}"/></g>`;
}

/**
 * @param {Companion | undefined} kind
 * @param {{ glow: string, dark: string }} c
 * @returns {{ back: string, front: string }} 인물 뒤에 둘 것과 앞에 둘 것
 */
export function companion(kind, c) {
  const dark = "#16120e";
  const eye = c.glow;
  const at = (inner, x = -60, k = 1) => `<g transform="translate(${x} 0) scale(${f(k)})">${inner}</g>`;
  switch (kind) {
    case "raven":
      return { back: "", front: perched(dark, eye, -24, -142, 1.1) };
    case "ravens":
      return { back: flying(dark, eye, -46, -176, 0.9), front: perched(dark, eye, -24, -142, 1.1) };
    case "owl":
      return {
        back: "",
        front: `<g transform="translate(-26 -142)"><ellipse cx="0" cy="-8" rx="7" ry="9" fill="#8a7a5a"/><path d="M-6 -16 L-5 -21 L-1 -16 M6 -16 L5 -21 L1 -16" stroke="#8a7a5a" stroke-width="2"/><circle cx="-3" cy="-11" r="2.4" fill="#f4efe0"/><circle cx="3" cy="-11" r="2.4" fill="#f4efe0"/><circle cx="-3" cy="-11" r="1" fill="#1a120a"/><circle cx="3" cy="-11" r="1" fill="#1a120a"/></g>`,
      };
    case "eagle":
      return { back: flying("#3a2a1a", eye, -46, -174, 1.3), front: "" };
    case "dove":
      return { back: flying("#efe6cf", "#1a120a", -44, -172, 1), front: "" };
    case "peacock":
      return {
        back: at(
          `${Array.from({ length: 9 }, (_, i) => `<path d="M0 -18 L${f(-30 + i * 7)} ${f(-56 + Math.abs(i - 4) * 4)}" stroke="#1f6a5a" stroke-width="3"/><circle cx="${f(-30 + i * 7)}" cy="${f(-56 + Math.abs(i - 4) * 4)}" r="3" fill="#2a5aa0" stroke="#e3b23c" stroke-width="1"/>`).join("")}<ellipse cx="0" cy="-14" rx="6" ry="10" fill="#2a5aa0"/><circle cx="2" cy="-26" r="3.4" fill="#2a5aa0"/>`,
          -58,
        ),
        front: "",
      };
    case "wolf":
      return { back: "", front: at(quad({ body: "#3a3a40", eye, ears: "point", tail: "long" })) };
    case "dog":
      return { back: "", front: at(quad({ body: "#2a2622", eye, ears: "point", tail: "long", k: 0.9 })) };
    case "lion":
      return { back: "", front: at(quad({ body: "#b5823c", mane: "#7a4a1a", eye, ears: "round", tail: "tuft" }), -62) };
    case "tiger":
      return { back: "", front: at(quad({ body: "#c87a2a", stripes: true, eye, ears: "round", tail: "long" }), -62) };
    case "cat":
      return { back: "", front: at(quad({ body: "#2a2622", eye, ears: "point", tail: "long", k: 0.72 })) };
    case "bear":
      return { back: "", front: at(quad({ body: "#3a2a1e", eye, ears: "round", tail: "short", k: 1.15 }), -62) };
    case "goat":
      return { back: "", front: at(quad({ body: "#8a8478", horns: "#d9c7a0", eye, ears: "point", tail: "short" })) };
    case "deer":
      return {
        back: "",
        front: at(quad({ body: "#a8744a", horns: "#d9c7a0", eye, ears: "long", tail: "short", k: 1.05 })),
      };
    case "boar":
      return { back: "", front: at(quad({ body: "#4a3a2a", eye, ears: "point", tail: "short", k: 0.95 })) };
    case "horse":
      return {
        back: at(quad({ body: "#e8e2d4", mane: "#c9c2b0", eye: "#1a120a", ears: "point", tail: "long", k: 1.25 }), -54),
        front: "",
      };
    case "serpent":
      return {
        back: "",
        front: `<path d="M-46 -2 Q-30 -12 -14 -4 Q2 4 14 -6 Q24 -14 18 -26 Q14 -34 24 -38" stroke="#16120e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-46 -2 Q-30 -12 -14 -4 Q2 4 14 -6 Q24 -14 18 -26 Q14 -34 24 -38" stroke="#4f7a3a" stroke-width="4.4" fill="none" stroke-linecap="round"/><circle cx="25" cy="-39" r="1.4" fill="${eye}"/>`,
      };
    default:
      return { back: "", front: "" };
  }
}

export const COMPANIONS = /** @type {Companion[]} */ ([
  "raven",
  "ravens",
  "owl",
  "eagle",
  "dove",
  "peacock",
  "wolf",
  "lion",
  "tiger",
  "cat",
  "bear",
  "goat",
  "deer",
  "dog",
  "serpent",
  "boar",
  "horse",
]);
