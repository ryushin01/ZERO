import {
  beast,
  bird,
  giantHead,
  moai,
  naga,
  pair,
  post,
  rider,
  scorpionMan,
  serpent,
  stone,
  voidRing,
} from "./creatures.js";
import { figure } from "./figure.js";
import { item } from "./items.js";
import {
  backdrop,
  base,
  defs,
  doc,
  embers,
  finish,
  GROUND,
  hashOf,
  lightning,
  mix,
  mortals,
  rand,
  sky,
  toDataUrl,
} from "./kit.js";

/**
 * 장면 하나를 그립니다.
 *
 * @typedef {{
 *   id: string,
 *   form: "figure" | "serpent" | "naga" | "bird" | "beast" | "rider" | "stone" | "post" | "moai" | "pair" | "head" | "void" | "scorpion",
 *   motif: string,
 *   sky: [string, string],
 *   glow: string, skin: string, cloth: string, metal: string, dark?: string,
 *   scale?: number, legend?: boolean, thunder?: boolean, fire?: boolean, style?: "paint" | "sketch", accent?: string,
 *   figure?: Partial<import("./figure.js").FigureSpec>,
 *   creature?: Record<string, any>,
 * }} SceneSpec
 */

/** @param {SceneSpec} s */
function subject(s) {
  const c = { skin: s.skin, cloth: s.cloth, metal: s.metal, glow: s.glow, dark: s.dark ?? "#0b0806" };
  const spec = /** @type {any} */ ({
    body: "warrior",
    head: "bare",
    item: "none",
    pose: "hold",
    ...c,
    ...s.figure,
    ...s.creature,
  });
  switch (s.form) {
    case "serpent":
      return serpent(spec);
    case "naga":
      return naga(spec);
    case "bird":
      return bird(spec);
    case "beast":
      return beast(spec);
    case "rider":
      return rider(spec);
    case "stone":
      return stone(spec);
    case "post":
      return post(spec);
    case "moai":
      return moai(spec);
    case "pair":
      return pair(spec);
    case "head":
      return giantHead(spec);
    case "void":
      return voidRing(spec);
    case "scorpion":
      return scorpionMan(spec);
    default:
      return figure(spec);
  }
}

/**
 * @param {SceneSpec} s
 * @returns {string} SVG 문서
 */
export function drawScene(s) {
  // 기본은 스케치 화풍입니다. 옛 명암 화풍은 style: "paint"로 그립니다.
  if (s.style !== "paint") return sketchScene(s);
  const r = rand(hashOf(s.id));
  const dark = s.dark ?? "#0b0806";
  const c = { glow: s.glow, skin: s.skin, cloth: s.cloth, metal: s.metal, dark, sky: s.sky };
  const tone = mix(s.sky[0], "#000000", 0.35);
  const scale = s.scale ?? 1;
  return doc(
    [
      defs(c),
      sky(c, r),
      s.thunder ? lightning(s.glow, r, 40 + r() * 120, 0) : "",
      backdrop(s.motif, tone, r),
      s.thunder ? lightning("#ffffff", r, 30 + r() * 140, 10) : "",
      base(c, 46 + scale * 12),
      `<g transform="translate(100 ${GROUND + 2}) scale(${scale})" filter="url(#rim)">${subject(s)}</g>`,
      s.legend ? mortals(mix(dark, s.sky[1], 0.15), r) : "",
      embers(s.fire ? "#ff9a4a" : s.glow, r, s.fire ? 26 : 14),
      finish(),
    ].join(""),
  );
}

/** 스케치 화풍의 색: 옷과 머리는 먹색, 살은 종이색, 쇠는 회색. @param {SceneSpec} s */
const inkColors = (s) => ({
  glow: "#ffffff",
  skin: "#ece4da",
  cloth: mix(s.cloth, "#1c1b1f", 0.82),
  metal: "#9c9a96",
  dark: "#0c0b0d",
});

/** 단색 배경 위에 흔들리는 먹선으로 그리는 스케치 화풍의 필터와 배경 @param {string} accent */
const sketchDefs = (accent) => `<filter id="sketch" x="-20%" y="-20%" width="140%" height="140%">
<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="3" result="n"/>
<feColorMatrix in="SourceGraphic" type="saturate" values="0" result="mono"/>
<feComponentTransfer in="mono" result="ink"><feFuncR type="gamma" exponent="1.25"/><feFuncG type="gamma" exponent="1.25"/><feFuncB type="gamma" exponent="1.25"/></feComponentTransfer>
<feDisplacementMap in="ink" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="wob"/>
<feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="dil"/>
<feComposite in="dil" in2="SourceAlpha" operator="out" result="ring"/>
<feFlood flood-color="#0a090b"/><feComposite in2="ring" operator="in" result="line0"/>
<feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="1" seed="8" result="n2"/>
<feDisplacementMap in="line0" in2="n2" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="line"/>
<feMerge><feMergeNode in="wob"/><feMergeNode in="line"/></feMerge></filter>
<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>
<linearGradient id="accent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(accent, "#ffffff", 0.04)}"/><stop offset="1" stop-color="${mix(accent, "#000000", 0.18)}"/></linearGradient>`;

/**
 * 스케치 화풍: 단색 배경, 먹색 옷, 종이색 살, 흔들리는 외곽선. 받침과 배경 실루엣 없이 인물만 둡니다.
 * @param {SceneSpec} s
 */
function sketchScene(s) {
  const c = { ...inkColors(s), sky: s.sky };
  // 배경은 신화권의 하늘색 한 가지로 칠해 신화권을 구분합니다.
  const accent = s.accent ?? mix(s.sky[1], "#000000", 0.05);
  const r = rand(hashOf(s.id));
  const scale = (s.scale ?? 1) * 0.94;
  return doc(
    [
      defs(c).replace("</defs>", `${sketchDefs(accent)}</defs>`),
      `<rect width="200" height="260" fill="url(#accent)"/>`,
      s.thunder ? lightning("#ffffff", r, 30 + r() * 140, 6) : "",
      // 발밑의 옅은 그림자로 바닥을 잡습니다.
      `<ellipse cx="100" cy="${GROUND + 4}" rx="56" ry="7" fill="#000" opacity=".22"/>`,
      `<g transform="translate(100 ${GROUND + 4}) scale(${scale})" filter="url(#sketch)">${subject({ ...s, ...c })}</g>`,
      `<rect width="200" height="260" filter="url(#paper)"/>`,
    ].join(""),
  );
}

/**
 * 무구 한 점을 크게 그립니다.
 * @param {{ id: string, item: string, sky: [string, string], glow: string, metal: string, cloth: string }} s
 */
export function drawArmament(s) {
  return sketchArmament(s);
}

/**
 * 스케치 화풍의 무구: 신화권 단색 배경 위에 먹선으로 그린 무구 한 점.
 * @param {{ id: string, item: string, sky: [string, string], glow: string, metal: string, cloth: string, accent?: string }} s
 */
function sketchArmament(s) {
  const accent = s.accent ?? mix(s.sky[1], "#000000", 0.05);
  const c = {
    glow: "#ffffff",
    skin: "#ece4da",
    cloth: mix(s.cloth, "#1c1b1f", 0.6),
    metal: "#bdbab4",
    dark: "#0c0b0d",
    sky: s.sky,
  };
  return doc(
    [
      defs(c).replace("</defs>", `${sketchDefs(accent)}</defs>`),
      `<rect width="200" height="260" fill="url(#accent)"/>`,
      `<circle cx="100" cy="128" r="70" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/>`,
      `<g transform="${LONG.has(s.item) ? "translate(112 214) scale(1.5) rotate(-24)" : "translate(100 172) scale(3)"}" filter="url(#sketch)">${item(s.item, c, 92)}</g>`,
      `<rect width="200" height="260" filter="url(#paper)"/>`,
    ].join(""),
  );
}

/**
 * 옛 명암 화풍의 무구 (지금은 쓰지 않음)
 * @param {{ id: string, item: string, sky: [string, string], glow: string, metal: string, cloth: string }} s
 */
export function paintArmament(s) {
  const r = rand(hashOf(s.id));
  const c = { glow: s.glow, skin: "#c8a27a", cloth: s.cloth, metal: s.metal, dark: "#0b0806", sky: s.sky };
  return doc(
    [
      defs(c),
      sky(c, r),
      `<circle cx="100" cy="128" r="70" fill="none" stroke="${s.metal}" stroke-opacity=".25" stroke-width="1"/><circle cx="100" cy="128" r="54" fill="none" stroke="${s.metal}" stroke-opacity=".18" stroke-dasharray="2 5"/>`,
      `<g transform="${LONG.has(s.item) ? "translate(112 214) scale(1.5) rotate(-24)" : "translate(100 172) scale(3)"}" filter="url(#rim)">${item(s.item, c, 92)}</g>`,
      embers(s.glow, r, 22),
      finish(),
    ].join(""),
  );
}

/** 길쭉한 무구는 비스듬히 세우고, 작은 무구는 크게 키워 가운데 둡니다. */
const LONG = new Set([
  "ssangsudo",
  "spear",
  "trident",
  "bident",
  "barbed",
  "was",
  "staff",
  "caduceus",
  "sword",
  "hammer",
  "axe",
  "club",
  "torch",
  "fireserpent",
  "quill",
]);

const cache = new Map();

/** 같은 그림을 다시 만들지 않습니다 @param {string} key @param {() => string} make */
export function illustrationUrl(key, make) {
  if (!cache.has(key)) cache.set(key, toDataUrl(make()));
  return cache.get(key);
}

export { ITEM_KINDS } from "./items.js";
export { mix } from "./kit.js";
