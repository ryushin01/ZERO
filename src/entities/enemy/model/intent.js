/**
 * 적의 다음 행동을 글로 풉니다. 화면에는 짧게, 화면 낭독기에는 문장으로 알립니다.
 * @typedef {import("./enemies.js").Action} Action
 */

/** @param {Action} action @param {{ strength?: number, heads?: number, weak?: number, vulnerable?: number }} [state] 적의 힘·머리·약화와 플레이어의 취약 */
export function describeAction(action, state = {}) {
  switch (action.op) {
    case "attack": {
      const times = action.times === "heads" ? (state.heads ?? 1) : (action.times ?? 1);
      let value = action.value + (state.strength ?? 0);
      if ((state.weak ?? 0) > 0) value = Math.floor(value * 0.75);
      if ((state.vulnerable ?? 0) > 0) value = Math.floor(value * 1.5);
      value = Math.max(0, value);
      return times > 1 ? `공격 ${value}×${times}` : `공격 ${value}`;
    }
    case "block":
      return `방어 ${action.value}`;
    case "strength":
      return `힘 +${action.value}`;
    case "weak":
      return `약화 ${action.value}`;
    case "vulnerable":
      return `취약 ${action.value}`;
    case "erosion":
      return `침식 ${action.value}`;
    case "eclipse":
      return `일식: 다음 턴 에너지 −${action.value}`;
    case "heal":
      return `회복 ${action.value}`;
    case "erase":
      return `망각: 뽑을 카드 ${action.value}장 지움`;
    case "grow":
      return `머리 +${action.value}`;
    default:
      return "";
  }
}

/** 행동의 성격. 아이콘 대신 짧은 글자로 보여 줍니다. */
export function intentKind(actions) {
  if (actions.some((a) => a.op === "attack")) return "공격";
  if (actions.some((a) => ["weak", "vulnerable", "erosion", "eclipse", "erase"].includes(a.op))) return "방해";
  if (actions.some((a) => ["strength", "grow"].includes(a.op))) return "강화";
  return "대비";
}
