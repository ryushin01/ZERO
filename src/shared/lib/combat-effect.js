/**
 * 전투 시작·첫 턴·매 턴·전투 끝에 붙는 효과를 문장으로 씁니다. 전장 효과와 세력 효과가 함께 써서 같은 효과는 같은 문장이 됩니다.
 * 이 목록에 없는 효과면 null을 돌려주고, 부르는 쪽이 자기 효과를 이어서 씁니다.
 * @param {string} kind
 * @param {number} value
 * @returns {string | null}
 */
export function describeCombatEffect(kind, value) {
  switch (kind) {
    case "startBlock":
      return `전투가 시작되면 방어 ${value}`;
    case "startStrength":
      return `전투가 시작되면 힘 ${value}`;
    case "startWeakAll":
      return `전투가 시작되면 모든 적에게 약화 ${value}`;
    case "startVulnAll":
      return `전투가 시작되면 모든 적에게 취약 ${value}`;
    case "startErosionAll":
      return `전투가 시작되면 모든 적에게 침식 ${value}`;
    case "startDamageAll":
      return `전투가 시작되면 모든 적에게 피해 ${value}`;
    case "firstDraw":
      return `전투 첫 턴에 카드 ${value}장 더 뽑기`;
    case "firstEnergy":
      return `전투 첫 턴에 에너지 ${value} 더`;
    case "turnBlock":
      return `매 턴 시작에 방어 ${value}`;
    case "turnHeal":
      return `매 턴 시작에 체력 ${value} 회복`;
    case "endHeal":
      return `전투가 끝나면 체력 ${value} 회복`;
    default:
      return null;
  }
}
