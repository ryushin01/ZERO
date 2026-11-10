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

/** @param {import("./armaments.js").ArmamentDef} arm */
export const bonusText = (arm) =>
  arm.bonus === "return"
    ? `이번 턴에 ${arm.owner}의 카드를 냈다면 쓰고 나서 바로 돌아옵니다.`
    : `이번 턴에 ${arm.owner}의 카드를 냈다면 효과가 50% 늘어납니다.`;
