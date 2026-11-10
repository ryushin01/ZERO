import { figure } from "./figure.js";
import { item } from "./items.js";
import { f } from "./kit.js";

/**
 * 사람 모양이 아닌 존재들. figure와 같이 발(바닥 가운데)이 (0,0)입니다.
 * @typedef {import("./figure.js").FigureSpec} FigureSpec
 */

/** 굽이치는 큰 뱀이나 용. heads가 여럿이면 히드라처럼 목이 갈라집니다. @param {FigureSpec & { heads?: number, feathered?: boolean, scale?: string }} s */
export function serpent(s) {
  const body = `M-60 -4 C-90 -30 -40 -60 -10 -50 C30 -40 50 -80 20 -110`;
  const scale = s.scale ?? "url(#cloth)";
  const coil = `<path d="${body}" stroke="url(#dark)" stroke-width="26" fill="none" stroke-linecap="round"/><path d="${body}" stroke="${scale}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="${body}" stroke="url(#metal)" stroke-width="2" stroke-dasharray="3 6" fill="none" opacity=".7"/>`;
  const heads = Math.max(1, s.heads ?? 1);
  const necks = Array.from({ length: heads }, (_, i) => {
    const t = heads === 1 ? 0 : i / (heads - 1) - 0.5;
    const hx = 20 + t * 90;
    const hy = -150 - (1 - Math.abs(t) * 1.4) * 20;
    const neck = `M20 -110 Q${f(20 + t * 40)} -130 ${f(hx)} ${f(hy)}`;
    const feathers = s.feathered
      ? Array.from(
          { length: 7 },
          (_, k) =>
            `<path d="M${f(hx)} ${f(hy)} l${-12 + k * 4} -18" stroke="${["#1f8a7a", "#e3b23c", "#c8501e"][k % 3]}" stroke-width="3.4" stroke-linecap="round"/>`,
        ).join("")
      : "";
    return `<path d="${neck}" stroke="url(#dark)" stroke-width="15" fill="none" stroke-linecap="round"/><path d="${neck}" stroke="${scale}" stroke-width="11" fill="none" stroke-linecap="round"/>${feathers}<path d="M${f(hx - 9)} ${f(hy)} Q${f(hx)} ${f(hy - 12)} ${f(hx + 16)} ${f(hy + 2)} L${f(hx + 6)} ${f(hy + 6)} L${f(hx + 14)} ${f(hy + 10)} Q${f(hx)} ${f(hy + 12)} ${f(hx - 9)} ${f(hy)}Z" fill="url(#dark)"/><circle cx="${f(hx + 2)}" cy="${f(hy - 2)}" r="1.8" fill="${s.glow}"/>`;
  }).join("");
  return `${coil}${necks}`;
}

/** 사람 상체에 뱀 꼬리 (여와, 놈모) @param {FigureSpec} s */
export function naga(s) {
  const tail = `M0 -88 C-10 -40 -60 -40 -50 -10 C-40 14 30 6 40 -6`;
  return `<path d="${tail}" stroke="url(#dark)" stroke-width="28" fill="none" stroke-linecap="round"/><path d="${tail}" stroke="url(#cloth)" stroke-width="22" fill="none" stroke-linecap="round"/><g transform="translate(0 4)">${figure({ ...s, body: "warrior", noLegs: true })}</g>`;
}

/** 큰 새 (투룰, 까마귀) @param {FigureSpec & { bird?: "falcon" | "raven" }} s */
export function bird(s) {
  const dark = s.bird === "raven";
  const fill = dark ? "url(#dark)" : "url(#cloth)";
  const wing = (side) =>
    Array.from(
      { length: 7 },
      (_, i) =>
        `<path d="M${side * 8} -96 Q${side * (40 + i * 8)} ${-150 + i * 10} ${side * (70 + i * 6)} ${-96 + i * 12} Q${side * 30} -88 ${side * 8} -80Z" fill="${fill}" opacity="${f(1 - i * 0.08)}"/>`,
    ).join("");
  const held = dark
    ? `<g transform="translate(20 -112)">${item("orb", s)}</g>`
    : `<g transform="translate(-2 -44) rotate(-90)">${item("sword", s, 60)}</g>`;
  return `${wing(-1)}${wing(1)}<ellipse cx="0" cy="-80" rx="20" ry="34" fill="${fill}"/><circle cx="0" cy="-122" r="13" fill="${fill}"/><path d="M10 -124 L26 -118 L10 -114Z" fill="url(#metal)"/><circle cx="4" cy="-126" r="2" fill="${s.glow}"/><path d="M-8 -46 L-12 0 M8 -46 L12 0" stroke="url(#metal)" stroke-width="4"/>${held}`;
}

/** 네발짐승 (곰, 사자, 늑대, 여우, 재규어, 아미트) @param {FigureSpec & { beast: string, tails?: number }} s */
export function beast(s) {
  const fur = s.beast === "wolf" || s.beast === "bear" ? "url(#dark)" : "url(#cloth)";
  const big = s.beast === "bear" ? 1.15 : 1;
  const legs = [-44, -26, 24, 42]
    .map(
      (x) => `<path d="M${x} -50 L${x - 4} -2" stroke="${fur}" stroke-width="${f(14 * big)}" stroke-linecap="round"/>`,
    )
    .join("");
  const tails = Array.from({ length: s.tails ?? 1 }, (_, i) => {
    const a = -60 + i * (120 / Math.max(1, (s.tails ?? 1) - 1 || 1));
    return `<path d="M-48 -70 Q-80 -90 -76 -130" stroke="${fur}" stroke-width="${s.tails ? 9 : 7}" fill="none" stroke-linecap="round" transform="rotate(${f((s.tails ?? 1) > 1 ? a / 3 : 0)} -48 -70)"/>`;
  }).join("");
  const headShape =
    s.beast === "lion" || s.beast === "barong"
      ? `<circle cx="52" cy="-104" r="30" fill="#b5823c"/><circle cx="54" cy="-100" r="18" fill="${fur}"/>`
      : `<ellipse cx="54" cy="-100" rx="20" ry="17" fill="${fur}"/>`;
  const snout =
    s.beast === "bear"
      ? `<ellipse cx="72" cy="-94" rx="9" ry="7" fill="${fur}"/>`
      : `<path d="M66 -104 L92 -92 L68 -86Z" fill="${fur}"/>`;
  const ears =
    s.beast === "bear"
      ? `<circle cx="42" cy="-116" r="6" fill="${fur}"/><circle cx="62" cy="-118" r="6" fill="${fur}"/>`
      : `<path d="M42 -112 L44 -134 L54 -114Z M56 -114 L64 -134 L68 -110Z" fill="${fur}"/>`;
  const jaw =
    s.beast === "wolf" || s.beast === "ammit"
      ? `<path d="M70 -90 L90 -84 M74 -88 L76 -82 M82 -86 L84 -80" stroke="#f4efe0" stroke-width="2"/>`
      : "";
  return `${tails}${legs}<ellipse cx="0" cy="-74" rx="${f(56 * big)}" ry="${f(32 * big)}" fill="${fur}"/>${s.beast === "jaguar" ? Array.from({ length: 10 }, (_, i) => `<circle cx="${-40 + i * 9}" cy="${-78 + (i % 2) * 10}" r="3" fill="#1a120a" opacity=".7"/>`).join("") : ""}${headShape}${ears}${snout}${jaw}<circle cx="60" cy="-106" r="2.2" fill="${s.glow}"/>`;
}

/** 말 탄 영웅 @param {FigureSpec} s */
export function rider(s) {
  const horse = `<ellipse cx="0" cy="-70" rx="48" ry="22" fill="url(#dark)"/>${[-36, -22, 22, 38].map((x) => `<path d="M${x} -56 L${x + (x > 0 ? 6 : -6)} -2" stroke="url(#dark)" stroke-width="8" stroke-linecap="round"/>`).join("")}<path d="M36 -80 Q52 -110 60 -122 L72 -112 Q62 -100 48 -70Z" fill="url(#dark)"/><path d="M58 -124 L80 -112 L70 -104Z" fill="url(#dark)"/><path d="M-48 -76 Q-70 -70 -66 -40" stroke="url(#dark)" stroke-width="6" fill="none"/><path d="M40 -100 Q30 -110 34 -118" stroke="${s.cloth}" stroke-width="4" fill="none"/>`;
  return `${horse}<g transform="translate(-4 -62) scale(.62)">${figure({ ...s, body: "warrior", pose: "raise", noLegs: true })}</g>`;
}

/** 서 있는 돌 (두샤라의 바이틸로스) @param {FigureSpec} s */
export function stone(s) {
  return `<path d="M-26 0 L-22 -120 Q0 -132 22 -120 L26 0Z" fill="url(#dark)"/><path d="M-12 -104 H12 M-14 -60 H14" stroke="${s.glow}" stroke-width="2" opacity=".7"/><circle cx="0" cy="-86" r="5" fill="${s.glow}"/>`;
}

/** 모아이 @param {FigureSpec} s */
export function moai(s) {
  // 길쭉한 머리, 깊은 눈두덩, 긴 코, 굳게 다문 입, 붉은 돌 모자(푸카오)
  return `<path d="M-30 0 L-32 -60 Q-36 -84 -30 -104 L-26 -150 Q-24 -168 0 -170 Q24 -168 26 -150 L30 -104 Q36 -84 32 -60 L30 0Z" fill="url(#dark)"/>
<path d="M-24 -136 H-4 M4 -136 H24" stroke="#000" stroke-width="7" stroke-linecap="round" opacity=".7"/>
<path d="M-2 -134 L-8 -98 Q0 -92 8 -98 L2 -134Z" fill="url(#skin)" opacity=".55"/>
<path d="M-14 -82 H14" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M-30 -112 Q-38 -118 -34 -96 M30 -112 Q38 -118 34 -96" stroke="url(#dark)" stroke-width="6" fill="none"/>
<path d="M-20 -60 Q0 -54 20 -60 M-26 -40 Q0 -30 26 -40" stroke="${s.glow}" stroke-width="1.4" fill="none" opacity=".45"/>
<ellipse cx="0" cy="-176" rx="26" ry="10" fill="#7a2e1c"/><rect x="-22" y="-194" width="44" height="18" rx="6" fill="#9a3a22"/>`;
}

/** 부부 신 (이자나기와 이자나미, 마우-리사) @param {FigureSpec} s */
export function pair(s) {
  return `<g transform="translate(-26 0) scale(.86)">${figure({ ...s, body: "robed", head: s.head, pose: "raise" })}</g><g transform="translate(30 0) scale(.82)">${figure({ ...s, body: "gown", head: s.head === "moon" ? "sun" : "veil", item: "none", pose: "rest" })}</g>`;
}

/** 일식을 일으키는 거대한 머리 (라후) @param {FigureSpec} s */
export function giantHead(s) {
  return `<circle cx="40" cy="-150" r="24" fill="#ffd27a"/><path d="M-60 -60 Q-70 -170 0 -176 Q70 -170 60 -60 Q0 -30 -60 -60Z" fill="url(#dark)"/><path d="M-40 -96 Q0 -60 40 -96 Q0 -40 -40 -96Z" fill="#1a0505"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${-30 + i * 10} -88 l4 ${i % 2 ? 14 : 10} l4 ${i % 2 ? -14 : -10}Z" fill="#f4efe0"/>`).join("")}<path d="M-34 -130 L-10 -120 M34 -130 L10 -120" stroke="#000" stroke-width="5" stroke-linecap="round"/><circle cx="-20" cy="-114" r="5" fill="${s.glow}"/><circle cx="20" cy="-114" r="5" fill="${s.glow}"/><path d="M-30 -160 L-40 -190 L-20 -168 L0 -196 L20 -168 L40 -190 L30 -160Z" fill="url(#metal)"/>`;
}

/** 공허 ZERO: 빛을 빨아들이는 고리 @param {FigureSpec} s */
export function voidRing(s) {
  return `<ellipse cx="0" cy="-118" rx="70" ry="48" fill="none" stroke="${s.glow}" stroke-width="14" opacity=".25" filter="url(#blur)"/><ellipse cx="0" cy="-118" rx="64" ry="42" fill="#000"/><ellipse cx="0" cy="-118" rx="64" ry="42" fill="none" stroke="#f4efe0" stroke-width="3"/><ellipse cx="0" cy="-118" rx="34" ry="42" fill="none" stroke="#f4efe0" stroke-width="3"/>${Array.from({ length: 18 }, (_, i) => `<path d="M${f(Math.cos(i) * 90)} ${f(-118 + Math.sin(i * 1.7) * 70)} L${f(Math.cos(i) * 60)} ${f(-118 + Math.sin(i * 1.7) * 44)}" stroke="#f4efe0" stroke-width=".8" opacity=".45"/>`).join("")}`;
}

/** 전갈 인간 @param {FigureSpec} s */
export function scorpionMan(s) {
  const tail = `M-10 -90 Q-60 -110 -56 -170 Q-50 -200 -24 -190`;
  return `<path d="${tail}" stroke="url(#dark)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="12 3"/><path d="M-24 -190 L-10 -186 L-22 -178Z" fill="url(#metal)"/>${figure({ ...s, body: "warrior" })}`;
}
