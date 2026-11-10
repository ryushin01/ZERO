/**
 * 카드 효과를 한국어 문장으로 풉니다. 카드 앞면과 화면 낭독기가 같은 문장을 씁니다.
 * @typedef {import("./build.js").Effect} Effect
 * @typedef {import("./build.js").CardDef} CardDef
 */

/** @param {Effect} e @returns {string} */
export function describeEffect(e) {
  switch (e.op) {
    case "damage":
      if (e.all) return `모든 적에게 피해 ${e.value}`;
      if ((e.times ?? 1) > 1) return `피해 ${e.value}씩 ${e.times}번`;
      return `피해 ${e.value}`;
    case "block":
      return `방어 ${e.value}`;
    case "draw":
      return `카드 ${e.value}장 뽑기`;
    case "heal":
      return `체력 ${e.value} 회복`;
    case "energy":
      return `에너지 ${e.value} 얻기`;
    case "strength":
      return `힘 ${e.value} 얻기`;
    case "foundation":
      return `매 턴 시작에 방어 ${e.value}`;
    case "erosion":
      return e.all ? `모든 적에게 침식 ${e.value}` : `침식 ${e.value} 부여`;
    case "vulnerable":
      return e.all ? `모든 적에게 취약 ${e.value}` : `취약 ${e.value} 부여`;
    case "weak":
      return e.all ? `모든 적에게 약화 ${e.value}` : `약화 ${e.value} 부여`;
    default:
      return "";
  }
}

/** 카드 앞면의 효과 문장들 @param {CardDef} card @returns {string[]} */
export function describeCard(card) {
  const lines = card.effects.map(describeEffect);
  if (card.retain) lines.push("보존");
  if (card.exhaust) lines.push("소멸");
  if (card.type === "power") lines.push("권능");
  return lines;
}

export const TYPE_LABEL = { attack: "공격", skill: "기술", power: "권능" };
export const RARITY_LABEL = { basic: "기본", common: "일반", rare: "희귀", legend: "전설" };

/** 용어 풀이. 도움말과 카드 상세가 함께 씁니다. */
export const KEYWORDS = [
  { term: "방어", text: "받는 피해를 먼저 막습니다. 내 턴이 시작되면 사라집니다." },
  { term: "힘", text: "공격 카드의 피해가 힘만큼 늘어납니다. 전투가 끝날 때까지 남습니다." },
  { term: "침식", text: "턴이 시작될 때 침식만큼 체력을 잃고, 침식이 1 줄어듭니다. 방어로 막지 못합니다." },
  { term: "취약", text: "받는 피해가 50% 늘어납니다. 턴이 끝날 때마다 1 줄어듭니다." },
  { term: "약화", text: "주는 피해가 25% 줄어듭니다. 턴이 끝날 때마다 1 줄어듭니다." },
  { term: "보존", text: "턴이 끝나도 버려지지 않고 손에 남습니다." },
  { term: "소멸", text: "내고 나면 이번 전투에서 사라집니다." },
  { term: "권능", text: "내면 효과가 전투 끝까지 이어지고, 카드는 이번 전투에서 사라집니다." },
  { term: "공명", text: "직전에 낸 카드와 신화 계열이 같으면 피해·방어·회복·침식이 50% 늘어납니다." },
  { term: "울림", text: "계열은 달라도 같은 대륙의 신화라면 25% 늘어납니다." },
  { term: "천적", text: "신화 속에서 맞섰던 적에게는 피해가 50% 늘어납니다." },
];
