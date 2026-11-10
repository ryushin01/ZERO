import { beast, bird, giantHead, moai, naga, pair, rider, scorpionMan, serpent, stone, voidRing } from "./creatures.js";
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
 *   form: "figure" | "serpent" | "naga" | "bird" | "beast" | "rider" | "stone" | "moai" | "pair" | "head" | "void" | "scorpion",
 *   motif: string,
 *   sky: [string, string],
 *   glow: string, skin: string, cloth: string, metal: string, dark?: string,
 *   scale?: number, legend?: boolean, thunder?: boolean, fire?: boolean,
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

/**
 * 무구 한 점을 크게 그립니다.
 * @param {{ id: string, item: string, sky: [string, string], glow: string, metal: string, cloth: string }} s
 */
export function drawArmament(s) {
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
