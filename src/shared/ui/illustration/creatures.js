import { figure } from "./figure.js";
import { item } from "./items.js";
import { f } from "./kit.js";

/**
 * 사람 모양이 아닌 존재들. figure와 같이 발(바닥 가운데)이 (0,0)입니다.
 * @typedef {import("./figure.js").FigureSpec} FigureSpec
 */

/** 굽이치는 큰 뱀이나 용. heads가 여럿이면 히드라처럼 목이 갈라지고, wings면 용처럼 날개를 폅니다. @param {FigureSpec & { heads?: number, feathered?: boolean, scale?: string, wings?: boolean }} s */
export function serpent(s) {
  const wingArt = s.wings
    ? [-1, 1]
        .map(
          (side) =>
            `<path d="M10 -96 Q${10 + side * 40} -170 ${10 + side * 86} -150 Q${10 + side * 64} -132 ${10 + side * 72} -112 Q${10 + side * 50} -116 ${10 + side * 48} -96 Q${10 + side * 30} -104 10 -88Z" fill="url(#dark)" opacity=".92"/><path d="M10 -96 L${10 + side * 86} -150 M10 -96 L${10 + side * 72} -112 M10 -96 L${10 + side * 48} -96" stroke="${s.scale ?? "#3a3a3a"}" stroke-width="1.6" opacity=".8"/>`,
        )
        .join("")
    : "";
  const body = `M-60 -4 C-90 -30 -40 -60 -10 -50 C30 -40 50 -80 20 -110`;
  const scale = s.scale ?? "url(#cloth)";
  const coil = `<path d="${body}" stroke="url(#dark)" stroke-width="26" fill="none" stroke-linecap="round"/><path d="${body}" stroke="${scale}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="${body}" stroke="url(#metal)" stroke-width="2" stroke-dasharray="3 6" fill="none" opacity=".7"/>`;
  const heads = Math.max(1, s.heads ?? 1);
  const necks = Array.from({ length: heads }, (_, i) => {
    const t = heads === 1 ? 0 : i / (heads - 1) - 0.5;
    const hx = 20 + t * 90;
    const hy = -150 - (1 - Math.abs(t) * 1.4) * 20;
    // 곧은 선에는 그라디언트가 칠해지지 않으므로 목을 늘 조금 굽힙니다. (머리 하나일 때)
    const neck = `M20 -110 Q${f(20 + t * 40 + 14)} -130 ${f(hx)} ${f(hy)}`;
    const feathers = s.feathered
      ? Array.from(
          { length: 7 },
          (_, k) =>
            `<path d="M${f(hx)} ${f(hy)} l${-12 + k * 4} -18" stroke="${["#1f8a7a", "#e3b23c", "#c8501e"][k % 3]}" stroke-width="3.4" stroke-linecap="round"/>`,
        ).join("")
      : "";
    return `<path d="${neck}" stroke="url(#dark)" stroke-width="15" fill="none" stroke-linecap="round"/><path d="${neck}" stroke="${scale}" stroke-width="11" fill="none" stroke-linecap="round"/>${feathers}<path d="M${f(hx - 9)} ${f(hy)} Q${f(hx)} ${f(hy - 12)} ${f(hx + 16)} ${f(hy + 2)} L${f(hx + 6)} ${f(hy + 6)} L${f(hx + 14)} ${f(hy + 10)} Q${f(hx)} ${f(hy + 12)} ${f(hx - 9)} ${f(hy)}Z" fill="url(#dark)"/><circle cx="${f(hx + 2)}" cy="${f(hy - 2)}" r="1.8" fill="${s.glow}"/>`;
  }).join("");
  return `${wingArt}${coil}${necks}`;
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

/**
 * 네발짐승 (곰, 사자, 늑대, 여우, 재규어, 아미트, 말). chained면 펜리르처럼 사슬에 묶이고,
 * heads는 케르베로스처럼 머리를 늘리고, legs는 슬레이프니르처럼 다리를 늘리고, wings는 페가수스처럼 날개를 폅니다.
 * @param {FigureSpec & { beast: string, tails?: number, chained?: boolean, heads?: number, legs?: number, wings?: boolean | string }} s
 */
export function beast(s) {
  if (s.beast === "horse") return horse(s);
  // 달의 옥토끼: 하얀 몸과 긴 귀, 절구를 찧는 공이
  if (s.beast === "rabbit")
    return `<ellipse cx="-4" cy="-44" rx="30" ry="26" fill="#efe9dc"/><circle cx="20" cy="-70" r="17" fill="#efe9dc"/><path d="M12 -84 Q6 -122 14 -128 Q22 -120 20 -86Z M24 -84 Q28 -124 36 -126 Q40 -116 30 -84Z" fill="#efe9dc"/><path d="M15 -90 Q12 -114 15 -120 M27 -90 Q31 -114 34 -118" stroke="#e8a8a0" stroke-width="2.4" fill="none"/><circle cx="27" cy="-72" r="2.2" fill="#a83a3a"/><circle cx="-34" cy="-36" r="7" fill="#efe9dc"/><path d="M-20 -2 h22 M8 -2 h18" stroke="#efe9dc" stroke-width="8" stroke-linecap="round"/><path d="M40 -8 L60 -8 L56 10 L44 10Z" fill="url(#dark)"/><path d="M30 -60 L52 -18" stroke="url(#metal)" stroke-width="4" stroke-linecap="round"/>`;
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
  const chain = s.chained
    ? `<path d="M-60 -2 Q-30 -40 0 -60 Q30 -78 50 -84" stroke="url(#metal)" stroke-width="3.4" stroke-dasharray="6 3" fill="none"/><path d="M40 -84 Q54 -70 66 -86" stroke="url(#metal)" stroke-width="3" stroke-dasharray="5 3" fill="none"/>`
    : "";
  const extraHeads =
    (s.heads ?? 1) > 1
      ? Array.from({ length: (s.heads ?? 1) - 1 }, (_, i) => {
          const dy = (i % 2 ? 1 : -1) * (24 + Math.floor(i / 2) * 16);
          return `<g transform="translate(-10 ${dy})"><ellipse cx="54" cy="-100" rx="18" ry="15" fill="${fur}"/><path d="M42 -112 L44 -130 L54 -114Z M56 -114 L62 -130 L66 -110Z" fill="${fur}"/><path d="M66 -104 L88 -94 L68 -88Z" fill="${fur}"/><circle cx="60" cy="-106" r="2" fill="${s.glow}"/></g>`;
        }).join("")
      : "";
  const beastWings = s.wings
    ? `<path d="M-10 -96 Q-40 -170 -90 -150 Q-60 -134 -66 -114 Q-36 -118 -36 -98Z" fill="url(#dark)" opacity=".9"/>`
    : "";
  return `${beastWings}${tails}${legs}<ellipse cx="0" cy="-74" rx="${f(56 * big)}" ry="${f(32 * big)}" fill="${fur}"/>${s.beast === "jaguar" ? Array.from({ length: 10 }, (_, i) => `<circle cx="${-40 + i * 9}" cy="${-78 + (i % 2) * 10}" r="3" fill="#1a120a" opacity=".7"/>`).join("") : ""}${headShape}${ears}${snout}${jaw}<circle cx="60" cy="-106" r="2.2" fill="${s.glow}"/>${extraHeads}${chain}`;
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

/** 장승: 갓을 쓴 나무 기둥에 부릅뜬 눈과 드러낸 이를 새긴 마을의 수호신 @param {FigureSpec} _s */
export function post(_s) {
  return `<path d="M-20 0 L-18 -150 Q0 -160 18 -150 L20 0Z" fill="url(#dark)"/><path d="M-12 -40 V-6 M0 -60 V-6 M12 -40 V-6" stroke="#000" stroke-opacity=".35" stroke-width="1.6"/><ellipse cx="0" cy="-160" rx="34" ry="6" fill="url(#dark)"/><path d="M-14 -162 Q-14 -186 0 -186 Q14 -186 14 -162Z" fill="url(#dark)"/><circle cx="-9" cy="-130" r="7" fill="#ece4da"/><circle cx="9" cy="-130" r="7" fill="#ece4da"/><circle cx="-9" cy="-130" r="3" fill="#000"/><circle cx="9" cy="-130" r="3" fill="#000"/><path d="M-4 -124 L0 -110 L4 -124" fill="none" stroke="#000" stroke-width="2"/><path d="M-12 -102 H12 V-94 H-12Z" fill="#ece4da"/><path d="M-8 -102 V-94 M-3 -102 V-94 M3 -102 V-94 M8 -102 V-94" stroke="#000" stroke-width="1.2"/><path d="M-14 -84 V-20 M14 -84 V-20" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`;
}

/** 말: 긴 목과 갈기, 다리 수와 날개를 고를 수 있습니다 (페가수스, 슬레이프니르) @param {FigureSpec & { legs?: number, wings?: boolean | string }} s */
function horse(s) {
  const legs = Math.max(4, s.legs ?? 4);
  const xs = Array.from({ length: legs }, (_, i) => -40 + (i * 80) / (legs - 1));
  const legArt = xs
    .map(
      (x) =>
        `<path d="M${f(x)} -52 L${f(x + (x > 0 ? 4 : -4))} -2" stroke="url(#dark)" stroke-width="7" stroke-linecap="round"/>`,
    )
    .join("");
  const wings = s.wings
    ? `<path d="M-6 -86 Q-40 -170 -96 -150 Q-60 -134 -70 -116 Q-40 -120 -40 -98 Q-24 -104 -6 -80Z" fill="#ece4da" opacity=".95"/><path d="M-6 -86 L-96 -150 M-6 -86 L-70 -116 M-6 -86 L-40 -98" stroke="#000" stroke-opacity=".35" stroke-width="1.2"/>`
    : "";
  return `${legArt}<ellipse cx="0" cy="-70" rx="50" ry="22" fill="url(#dark)"/><path d="M36 -80 Q50 -112 58 -126 L72 -116 Q62 -100 50 -70Z" fill="url(#dark)"/><path d="M56 -128 L84 -114 L74 -104 L58 -112Z" fill="url(#dark)"/><path d="M40 -96 Q34 -112 44 -124" stroke="${s.hair ?? "#2a2622"}" stroke-width="5" fill="none"/><path d="M-50 -76 Q-74 -66 -70 -34" stroke="url(#dark)" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="70" cy="-118" r="1.8" fill="${s.glow}"/>${wings}`;
}
