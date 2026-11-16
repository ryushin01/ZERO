import { describeEffect } from "#entities/card/@x/armament.js";

/**
 * 무구 효과를 문장으로 풉니다.
 * @param {import("./armaments.js").ArmamentDef["effects"][number]} effect
 */
export function describeArmEffect(effect) {
  if (effect.op === "cleanse") return "약화·취약·침식 씻어 내기";
  const text = describeEffect(/** @type {any} */ (effect));
  return "pierce" in effect && effect.pierce ? `${text} (방어 무시)` : text;
}

/** @param {import("./armaments.js").ArmamentDef} arm */
export const describeArmament = (arm) => arm.effects.map(describeArmEffect);

/** 짧은 효과 이름. 전투의 무구 버튼처럼 좁은 자리에 씁니다. */
const SHORT_LABEL = {
  damage: "피해",
  block: "방어",
  draw: "뽑기",
  heal: "회복",
  energy: "에너지",
  strength: "힘",
  erosion: "침식",
  vulnerable: "취약",
  weak: "약화",
};

/**
 * 무구 효과를 짧게 씁니다. (예: 전체 피해 8, 피해 3×2 관통, 정화)
 * @param {{ op: string, value?: number, times?: number, all?: boolean, pierce?: boolean }} effect
 */
export function describeArmEffectShort(effect) {
  if (effect.op === "cleanse") return "정화";
  const times = (effect.times ?? 1) > 1 ? `×${effect.times}` : "";
  const label = SHORT_LABEL[/** @type {keyof typeof SHORT_LABEL} */ (effect.op)] ?? effect.op;
  return `${effect.all ? "전체 " : ""}${label} ${effect.value}${times}${effect.pierce ? " 관통" : ""}`;
}

/** @param {import("./armaments.js").ArmamentDef} arm */
export const bonusText = (arm) =>
  arm.bonus === "return"
    ? `이번 턴에 ${arm.owner}의 카드를 냈다면 쓰고 나서 바로 돌아옵니다.`
    : `이번 턴에 ${arm.owner}의 카드를 냈다면 효과가 50% 늘어납니다.`;
