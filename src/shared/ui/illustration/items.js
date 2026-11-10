import { f } from "./kit.js";

/**
 * 지물과 무구. 손잡이가 (0,0)에 오고 위(-y)로 뻗는 모양으로 그립니다.
 * 신의 손에 들릴 때는 손 위치로 옮기고 돌리며, 무구 카드에서는 크게 확대해 씁니다.
 *
 * @typedef {{ glow: string, metal: string, dark: string, cloth: string }} ItemColors
 */

const WOOD = "#3b2a1c";

/** @type {Record<string, (c: ItemColors, len: number) => string>} */
const ITEMS = {
  // 쌍수도: 곧고 아주 긴 외날, 둥근 놋쇠 코등이, 붉은 실을 감은 두 손 자루 (손잡이가 0, 위로 날)
  ssangsudo: (c, l) =>
    `<path d="M-2.6 -9 V${-l * 1.15} Q-1.4 ${-l * 1.22} 2.8 ${-l * 1.2} L2.8 -9Z" fill="url(#metal)"/><path d="M-0.4 -11 V${-l * 1.14}" stroke="#ffffff" stroke-opacity=".45" stroke-width=".7"/><rect x="-8" y="-9.5" width="16" height="4" rx="2" fill="#d9b25a"/><rect x="-2.8" y="-5.5" width="5.6" height="26" fill="#a3161a"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M-2.8 ${-4 + i * 4} L2.8 ${-1 + i * 4} M2.8 ${-4 + i * 4} L-2.8 ${-1 + i * 4}" stroke="#5e0a0c" stroke-width=".8"/>`).join("")}<rect x="-3.2" y="20" width="6.4" height="3" rx="1" fill="#d9b25a"/>`,
  spear: (c, l) =>
    `<path d="M-1.6 ${l * 0.35} V${-l}" stroke="${WOOD}" stroke-width="3.2"/><path d="M0 ${-l - 22} L5 ${-l - 4} L0 ${-l + 2} L-5 ${-l - 4}Z" fill="url(#metal)"/>`,
  sword: (c, l) =>
    `<path d="M-2.6 -10 L0 ${-l * 0.85} L2.6 -10Z" fill="url(#metal)"/><path d="M-9 -9 H9 V-6 H-9Z" fill="url(#metal)"/><path d="M-1.8 -6 V8" stroke="${WOOD}" stroke-width="3.6"/><circle cy="10" r="2.6" fill="url(#metal)"/>`,
  hammer: (c, l) =>
    `<path d="M0 10 V${-l * 0.5}" stroke="${WOOD}" stroke-width="4.4"/><path d="M-15 ${-l * 0.5 - 18} H15 Q18 ${-l * 0.5 - 9} 15 ${-l * 0.5} H-15 Q-18 ${-l * 0.5 - 9} -15 ${-l * 0.5 - 18}Z" fill="url(#metal)"/><path d="M-11 ${-l * 0.5 - 12} H11" stroke="${c.dark}" stroke-width="1" opacity=".5"/>`,
  axe: (c, l) =>
    `<path d="M0 12 V${-l * 0.75}" stroke="${WOOD}" stroke-width="3.6"/><path d="M1 ${-l * 0.75 + 2} Q18 ${-l * 0.75 - 8} 20 ${-l * 0.75 + 16} Q12 ${-l * 0.75 + 10} 1 ${-l * 0.75 + 16}Z" fill="url(#metal)"/>`,
  doubleaxe: (c, l) =>
    `<path d="M0 12 V${-l * 0.75}" stroke="${WOOD}" stroke-width="3.6"/><path d="M0 ${-l * 0.75 - 2} Q18 ${-l * 0.75 - 14} 18 ${-l * 0.75 + 12} Q10 ${-l * 0.75 + 6} 0 ${-l * 0.75 + 10} Q-10 ${-l * 0.75 + 6} -18 ${-l * 0.75 + 12} Q-18 ${-l * 0.75 - 14} 0 ${-l * 0.75 - 2}Z" fill="url(#metal)"/>`,
  club: (c, l) =>
    `<path d="M-2 10 L-6 ${-l * 0.7} Q0 ${-l * 0.8} 6 ${-l * 0.7} L2 10Z" fill="${WOOD}"/><circle cx="-4" cy="${-l * 0.5}" r="2" fill="${c.dark}"/><circle cx="3" cy="${-l * 0.6}" r="2" fill="${c.dark}"/>`,
  trident: (c, l) =>
    `<path d="M0 ${l * 0.35} V${-l}" stroke="url(#metal)" stroke-width="3"/><path d="M-11 ${-l + 12} Q-11 ${-l - 2} -10 ${-l - 12} M11 ${-l + 12} Q11 ${-l - 2} 10 ${-l - 12} M-11 ${-l + 12} H11 M0 ${-l} V${-l - 20}" stroke="url(#metal)" stroke-width="3" fill="none"/><path d="M-10 ${-l - 18} l-2.5 7 h5Z M10 ${-l - 18} l-2.5 7 h5Z M0 ${-l - 26} l-3 8 h6Z" fill="url(#metal)"/>`,
  bident: (c, l) =>
    `<path d="M0 ${l * 0.35} V${-l}" stroke="url(#metal)" stroke-width="3"/><path d="M-8 ${-l + 8} H8 M-8 ${-l + 8} V${-l - 16} M8 ${-l + 8} V${-l - 16}" stroke="url(#metal)" stroke-width="3" fill="none"/>`,
  staff: (c, l) =>
    `<path d="M0 ${l * 0.35} V${-l}" stroke="${WOOD}" stroke-width="3.4"/><circle cy="${-l - 5}" r="5.5" fill="${c.glow}" opacity=".9"/><circle cy="${-l - 5}" r="11" fill="${c.glow}" opacity=".25" filter="url(#soft)"/>`,
  was: (c, l) =>
    `<path d="M0 ${l * 0.35} V${-l}" stroke="url(#metal)" stroke-width="3"/><path d="M0 ${-l} Q-2 ${-l - 10} 6 ${-l - 12} L9 ${-l - 9} L3 ${-l - 6}" stroke="url(#metal)" stroke-width="3" fill="none"/><path d="M0 ${l * 0.35} l-4 6 M0 ${l * 0.35} l4 6" stroke="url(#metal)" stroke-width="2.4"/>`,
  crook: (c, l) =>
    `<path d="M0 12 V${-l * 0.6} Q0 ${-l * 0.6 - 14} 9 ${-l * 0.6 - 12} Q14 ${-l * 0.6 - 8} 10 ${-l * 0.6 - 3}" stroke="url(#metal)" stroke-width="3.2" fill="none"/><path d="M0 0 h-2" stroke="#2a4fa0" stroke-width="4"/>`,
  caduceus: (c, l) =>
    `<path d="M0 ${l * 0.3} V${-l * 0.8}" stroke="url(#metal)" stroke-width="2.6"/><path d="M0 ${-l * 0.1} C8 ${-l * 0.2} 8 ${-l * 0.3} 0 ${-l * 0.4} S-8 ${-l * 0.6} 0 ${-l * 0.7} M0 ${-l * 0.1} C-8 ${-l * 0.2} -8 ${-l * 0.3} 0 ${-l * 0.4} S8 ${-l * 0.6} 0 ${-l * 0.7}" stroke="#4f8a4a" stroke-width="2" fill="none"/><path d="M0 ${-l * 0.82} q-12 -6 -18 2 q8 0 18 4 q10 -4 18 -4 q-6 -8 -18 -2Z" fill="url(#metal)"/>`,
  bolt: (c, l) =>
    `<path d="M4 6 L-6 ${-l * 0.35} L2 ${-l * 0.35} L-4 ${-l * 0.8} L10 ${-l * 0.3} L2 ${-l * 0.3}Z" fill="${c.glow}" opacity=".45" filter="url(#soft)" transform="scale(1.4)"/><path d="M4 6 L-6 ${-l * 0.35} L2 ${-l * 0.35} L-4 ${-l * 0.8} L10 ${-l * 0.3} L2 ${-l * 0.3}Z" fill="#ffffff"/>`,
  torch: (c, l) =>
    `<path d="M0 10 V${-l * 0.45}" stroke="${WOOD}" stroke-width="4"/><path d="M0 ${-l * 0.45 - 30} Q12 ${-l * 0.45 - 10} 6 ${-l * 0.45} H-6 Q-12 ${-l * 0.45 - 12} 0 ${-l * 0.45 - 30}Z" fill="#ff7a2a"/><path d="M0 ${-l * 0.45 - 20} Q6 ${-l * 0.45 - 8} 3 ${-l * 0.45} H-3 Q-6 ${-l * 0.45 - 8} 0 ${-l * 0.45 - 20}Z" fill="#ffd27a"/><circle cy="${-l * 0.45 - 12}" r="18" fill="#ff7a2a" opacity=".3" filter="url(#soft)"/>`,
  flame: () =>
    `<circle cy="-8" r="16" fill="#ff7a2a" opacity=".35" filter="url(#soft)"/><path d="M0 -26 Q10 -12 6 0 H-6 Q-10 -12 0 -26Z" fill="#ff8a3a"/><path d="M0 -16 Q5 -6 3 0 H-3 Q-5 -6 0 -16Z" fill="#ffe08a"/>`,
  orb: (c) =>
    `<circle cy="-8" r="16" fill="${c.glow}" opacity=".35" filter="url(#soft)"/><circle cy="-8" r="7" fill="${c.glow}"/><circle cx="-2" cy="-10" r="2.4" fill="#ffffff" opacity=".8"/>`,
  pearl: (c) =>
    `<circle cy="-8" r="15" fill="#ffffff" opacity=".25" filter="url(#soft)"/><circle cy="-8" r="6.5" fill="#f4efe0"/><path d="M-12 -2 q12 -14 24 0" stroke="${c.glow}" stroke-width="1.4" fill="none"/>`,
  chakra: (c) =>
    `<circle cy="-12" r="18" fill="${c.glow}" opacity=".3" filter="url(#soft)"/><circle cy="-12" r="11" fill="none" stroke="url(#metal)" stroke-width="3.4"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0 -12 l0 -11" stroke="url(#metal)" stroke-width="1.4" transform="rotate(${i * 45} 0 -12)"/>`).join("")}<circle cy="-12" r="3" fill="url(#metal)"/>`,
  ankh: () =>
    `<path d="M0 10 V-14 M-8 -14 H8" stroke="url(#metal)" stroke-width="3.4"/><ellipse cy="-22" rx="5" ry="8" fill="none" stroke="url(#metal)" stroke-width="3"/>`,
  lyre: () =>
    `<path d="M-10 0 Q-16 -20 -8 -34 M10 0 Q16 -20 8 -34 M-12 -30 H12 M-10 0 H10" stroke="url(#metal)" stroke-width="2.6" fill="none"/>${[-5, 0, 5].map((x) => `<path d="M${x} -1 V-29" stroke="#f4efe0" stroke-width=".6"/>`).join("")}`,
  scroll: (c) =>
    `<rect x="-12" y="-16" width="24" height="16" fill="#e8dcbc"/><rect x="-14" y="-18" width="4" height="20" rx="2" fill="${WOOD}"/><rect x="10" y="-18" width="4" height="20" rx="2" fill="${WOOD}"/><path d="M-7 -12 H7 M-7 -8 H5 M-7 -4 H7" stroke="${c.dark}" stroke-width=".8"/>`,
  mirror: (c) =>
    `<circle cy="-16" r="11" fill="url(#metal)"/><circle cy="-16" r="8" fill="${c.glow}" opacity=".8"/><path d="M0 -5 V8" stroke="url(#metal)" stroke-width="3"/>`,
  sheaf: () =>
    `${[-6, -2, 2, 6].map((x) => `<path d="M0 6 Q${x} -16 ${x * 1.6} -34" stroke="#c9a24a" stroke-width="1.6" fill="none"/><ellipse cx="${x * 1.6}" cy="-34" rx="2.4" ry="5" fill="#e0b84a"/>`).join("")}<path d="M-5 -4 H5" stroke="#7a4a12" stroke-width="2.4"/>`,
  snakes: () =>
    `<path d="M0 6 C-8 -4 8 -12 0 -22 S-6 -34 2 -40" stroke="#4f7a3a" stroke-width="3" fill="none"/><circle cx="2" cy="-41" r="2.6" fill="#4f7a3a"/>`,
  horn: () =>
    `<path d="M-3 4 Q-4 -10 10 -22 L16 -16 Q4 -6 4 4Z" fill="#e8dcbc"/><path d="M10 -22 L16 -16" stroke="url(#metal)" stroke-width="3"/>`,
  flute: () => `<path d="M-14 -4 L18 -16" stroke="#c9a24a" stroke-width="3.2" stroke-linecap="round"/>`,
  bell: (c) =>
    `<path d="M0 8 V-6" stroke="url(#metal)" stroke-width="2.6"/><path d="M-8 -6 Q-8 -22 0 -24 Q8 -22 8 -6Z" fill="url(#metal)"/><circle cy="-4" r="2" fill="${c.dark}"/>`,
  vase: () =>
    `<path d="M-7 -2 Q-12 -12 -6 -22 H6 Q12 -12 7 -2Z" fill="url(#metal)"/><path d="M6 -16 Q20 -6 24 16" stroke="#7fd4ff" stroke-width="3" fill="none" opacity=".8"/>`,
  hook: () =>
    `<path d="M0 8 V-24 Q0 -36 -10 -32 Q-16 -28 -12 -20" stroke="#e8dcbc" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  windbag: (c) =>
    `<path d="M-4 0 Q-34 -6 -30 -30 Q-24 -46 0 -40 Q16 -36 8 -22" fill="url(#cloth)" stroke="${c.dark}" stroke-width=".8"/><path d="M-36 -40 q-10 6 -6 16 M-40 -24 q-8 6 -2 14" stroke="${c.glow}" stroke-width="1.6" fill="none" opacity=".7"/>`,
  cup: () =>
    `<path d="M-8 -14 H8 Q8 -4 0 -2 Q-8 -4 -8 -14Z M0 -2 V6 M-5 6 H5" fill="url(#metal)" stroke="url(#metal)" stroke-width="2"/><circle cx="-3" cy="-16" r="2" fill="#7a2a4a"/><circle cx="2" cy="-17" r="2" fill="#7a2a4a"/>`,
  flower: () =>
    `<path d="M0 8 V-10" stroke="#4f7a3a" stroke-width="2"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="-20" rx="3.6" ry="7" fill="#f2b8c6" transform="rotate(${a} 0 -14)"/>`).join("")}<circle cy="-14" r="3" fill="#ffd27a"/>`,
  drum: (c) =>
    `<ellipse cy="-8" rx="10" ry="8" fill="url(#cloth)" stroke="url(#metal)" stroke-width="1.6"/><path d="M-6 -12 q6 -4 12 0" stroke="${c.dark}" stroke-width="1" fill="none"/>`,
  aegis: (c) =>
    `<circle cy="-20" r="22" fill="url(#metal)"/><circle cy="-20" r="17" fill="url(#cloth)"/>${Array.from({ length: 10 }, (_, i) => `<path d="M0 -42 q3 -5 0 -9" stroke="#4f7a3a" stroke-width="2" fill="none" transform="rotate(${i * 36} 0 -20)"/>`).join("")}<circle cy="-20" r="8" fill="url(#skin)"/>${Array.from({ length: 6 }, (_, i) => `<path d="M0 -26 q4 -4 2 -8" stroke="#4f7a3a" stroke-width="1.4" fill="none" transform="rotate(${-60 + i * 24} 0 -20)"/>`).join("")}<circle cx="-3" cy="-21" r="1.2" fill="${c.glow}"/><circle cx="3" cy="-21" r="1.2" fill="${c.glow}"/>`,
  eye: (c) =>
    `<circle cy="-16" r="20" fill="${c.glow}" opacity=".25" filter="url(#soft)"/><path d="M-20 -16 Q0 -32 20 -16 Q0 -2 -20 -16Z" fill="#f4efe0"/><circle cy="-16" r="6" fill="#2a4fa0"/><circle cy="-16" r="2.6" fill="#000"/><path d="M-22 -22 Q0 -38 22 -22" stroke="url(#metal)" stroke-width="3" fill="none"/><path d="M-4 -8 L-6 6 M4 -9 Q10 4 18 2 Q22 -2 18 -6" stroke="url(#metal)" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  treasures: (c) =>
    `<g transform="translate(-14 4) rotate(-14)"><path d="M-2 -6 L0 -46 L2 -6Z" fill="url(#metal)"/><path d="M-7 -6 H7" stroke="url(#metal)" stroke-width="3"/></g><g transform="translate(14 -2)"><circle cy="-18" r="10" fill="url(#metal)"/><circle cy="-18" r="7" fill="${c.glow}" opacity=".8"/></g><g transform="translate(0 6)"><path d="M-6 -2 Q-7 -14 0 -16 Q7 -14 6 -2Z" fill="url(#metal)"/><circle cy="-1" r="1.6" fill="${c.dark}"/></g>`,
  barbed: (c, l) =>
    `<path d="M0 ${l * 0.35} V${-l}" stroke="#e8dcbc" stroke-width="3"/><path d="M0 ${-l - 22} L5 ${-l - 4} L0 ${-l + 2} L-5 ${-l - 4}Z" fill="#e8dcbc"/>${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${-l + 4 + i * 7} l-7 -6 M0 ${-l + 4 + i * 7} l7 -6" stroke="#e8dcbc" stroke-width="1.6"/>`).join("")}`,
  fireserpent: () =>
    `<circle cy="-30" r="26" fill="#ff7a2a" opacity=".3" filter="url(#soft)"/><path d="M0 8 C-16 -6 16 -18 0 -32 S-14 -54 4 -60" stroke="#ff7a2a" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="6 2"/><path d="M0 8 C-16 -6 16 -18 0 -32 S-14 -54 4 -60" stroke="#ffd27a" stroke-width="2" fill="none"/><path d="M0 -60 l12 -6 l-2 8 l8 4 l-14 2Z" fill="#ff8a3a"/>`,
  necklace: (c) =>
    `<path d="M-22 -40 Q0 2 22 -40" stroke="url(#metal)" stroke-width="3.4" fill="none"/>${[-16, -8, 0, 8, 16].map((x, i) => `<circle cx="${x}" cy="${-22 + Math.abs(x) * -0.9 + 6 - (i === 2 ? -6 : 0)}" r="${i === 2 ? 6 : 3.4}" fill="${i === 2 ? "#ff8a3a" : c.glow}"/>`).join("")}`,
  quill: (c) =>
    `<path d="M-1 12 Q-16 -20 -2 -54 Q10 -76 26 -88 Q22 -56 12 -30 Q6 -8 3 12Z" fill="#f4efe0"/><path d="M-1 10 Q4 -30 24 -84" stroke="${c.dark}" stroke-width="1.4" fill="none" opacity=".6"/>${[-60, -46, -32, -18].map((y, k) => `<path d="M${2 + k * 2} ${y} l-10 6 M${4 + k * 2} ${y} l9 4" stroke="${c.dark}" stroke-width=".7" opacity=".35"/>`).join("")}<path d="M-2 10 L0 22 L3 10Z" fill="url(#metal)"/>`,
  book: () =>
    `<rect x="-22" y="-16" width="44" height="12" fill="url(#cloth)"/><rect x="-18" y="-30" width="38" height="12" fill="url(#dark)" stroke="url(#metal)" stroke-width=".8"/><rect x="-20" y="-44" width="40" height="12" fill="url(#cloth)"/><path d="M-20 -38 H20 M-18 -24 H20 M-22 -10 H22" stroke="url(#metal)" stroke-width="1"/>`,
  bow: (c) =>
    `<path d="M-4 30 Q-30 -10 -4 -70" stroke="#4a3220" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-4 30 L-4 -70" stroke="#e8dcbc" stroke-width=".9"/><path d="M-4 -20 L34 -26" stroke="#4a3220" stroke-width="2"/><path d="M34 -26 l-8 -4 l1 8Z" fill="url(#metal)"/><path d="M-4 -20 l-5 -4 M-4 -20 l-5 4" stroke="${c.glow}" stroke-width="1.4"/>`,
  lamp: (c) =>
    `<circle cx="10" cy="-26" r="14" fill="${c.glow}" opacity=".3" filter="url(#soft)"/><path d="M-16 -8 Q-12 -20 4 -18 Q16 -18 22 -26 L26 -24 Q18 -10 6 -8Z" fill="url(#metal)"/><path d="M-16 -8 Q-24 -12 -20 -18" stroke="url(#metal)" stroke-width="2" fill="none"/><path d="M24 -26 Q30 -40 18 -50 Q26 -40 14 -38" stroke="${c.glow}" stroke-width="2" fill="none" opacity=".8"/>`,
  ring: (c) =>
    `<circle cy="-16" r="16" fill="${c.glow}" opacity=".25" filter="url(#soft)"/><circle cy="-16" r="10" fill="none" stroke="url(#metal)" stroke-width="4"/><circle cy="-27" r="3" fill="${c.glow}"/>`,
  cloud: (c) =>
    `<path d="M-30 -10 Q-34 -24 -20 -26 Q-16 -40 0 -36 Q12 -46 22 -34 Q36 -34 32 -20 Q40 -8 26 -6 L-24 -6 Q-36 -6 -30 -10Z" fill="#f4efe0" opacity=".9"/><path d="M-22 -12 Q-4 -20 20 -12" stroke="${c.glow}" stroke-width="1.6" fill="none" opacity=".7"/>`,
  belt: () =>
    `<path d="M-26 -20 Q0 -8 26 -20 L26 -10 Q0 2 -26 -10Z" fill="url(#metal)"/><rect x="-6" y="-20" width="12" height="14" rx="2" fill="url(#cloth)" stroke="url(#metal)" stroke-width="1.4"/>`,
  cloak: (c) =>
    `<path d="M-8 -40 Q-30 -10 -24 14 Q0 22 24 14 Q30 -10 8 -40Z" fill="url(#dark)" opacity=".85"/><path d="M-8 -40 Q-30 -10 -24 14" stroke="${c.glow}" stroke-width="1.2" fill="none" opacity=".6"/>`,
  none: () => "",
};

/**
 * @param {string} kind @param {ItemColors} c @param {number} [len]
 */
export function item(kind, c, len = 80) {
  // 곧은 선은 경계 상자의 폭이 0이라 그라디언트가 칠해지지 않으므로, 선에는 단색 금속을 씁니다.
  return (ITEMS[kind] ?? ITEMS.none)(c, len).replaceAll('stroke="url(#metal)"', `stroke="${c.metal}"`);
}

/** 둥근 방패 @param {ItemColors} c @param {number} [r] */
export function shield(c, r = 19) {
  return `<circle r="${r}" fill="url(#metal)"/><circle r="${f(r * 0.78)}" fill="url(#cloth)"/><circle r="${f(r * 0.28)}" fill="url(#metal)"/><circle r="${r}" fill="none" stroke="${c.dark}" stroke-opacity=".5"/>`;
}

export const ITEM_KINDS = Object.keys(ITEMS);
