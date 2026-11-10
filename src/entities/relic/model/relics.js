/**
 * 신화 속 보물. 정예와 보스를 쓰러뜨리면 얻습니다.
 * 효과는 전투 엔진이 id로 확인합니다.
 *
 * @typedef {{ id: string, name: string, origin: string, text: string, lore: string }} RelicDef
 */

/** @type {RelicDef[]} */
export const RELICS = [
  {
    id: "aegis",
    name: "아이기스",
    origin: "그리스",
    text: "전투가 시작되면 방어 10을 얻습니다.",
    lore: "제우스와 아테나가 든 방패.",
  },
  {
    id: "draupnir",
    name: "드라우프니르",
    origin: "북유럽",
    text: "세 번째 턴마다 에너지 1을 더 얻습니다.",
    lore: "아흐레마다 같은 반지 여덟 개를 떨군다는 오딘의 팔찌.",
  },
  {
    id: "yeouiju",
    name: "여의주",
    origin: "동아시아",
    text: "전투가 끝나면 체력 5를 회복합니다.",
    lore: "뜻하는 것을 이뤄 준다는 용의 구슬.",
  },
  {
    id: "ankh",
    name: "앙크",
    origin: "이집트",
    text: "쓰러질 때 한 번, 최대 체력의 절반으로 되살아납니다.",
    lore: "신들이 손에 든 생명의 표지.",
  },
  {
    id: "kusanagi",
    name: "쿠사나기",
    origin: "일본",
    text: "턴마다 처음 내는 공격 카드의 피해가 4 늘어납니다.",
    lore: "스사노오가 야마타노오로치의 꼬리에서 꺼낸 칼.",
  },
  {
    id: "feather",
    name: "마아트의 깃털",
    origin: "이집트",
    text: "전투가 시작되면 모든 적에게 약화 1을 겁니다.",
    lore: "죽은 이의 심장과 무게를 견주는 진리의 깃털.",
  },
  {
    id: "cheonbuin",
    name: "천부인",
    origin: "한국",
    text: "전투 첫 턴에 카드를 2장 더 뽑습니다.",
    lore: "환인이 환웅에게 내린 세 가지 보물.",
  },
  {
    id: "amrita",
    name: "암리타",
    origin: "인도",
    text: "얻을 때 최대 체력이 12 늘어납니다.",
    lore: "신들과 아수라가 우유 바다를 저어 얻은 불사의 감로.",
  },
  {
    id: "mjolnir",
    name: "묠니르",
    origin: "북유럽",
    text: "공명할 때마다 모든 적에게 피해 3을 줍니다.",
    lore: "던지면 반드시 돌아오는 토르의 망치.",
  },
  {
    id: "sampo",
    name: "삼포",
    origin: "핀란드",
    text: "카드 보상에 고를 카드가 하나 더 나옵니다.",
    lore: "일마리넨이 벼려 낸, 끝없이 곡식과 소금과 돈을 내는 맷돌.",
  },
  {
    id: "gungnir",
    name: "궁니르",
    origin: "북유럽",
    text: "전투 첫 턴에 에너지 1을 더 얻습니다.",
    lore: "던지면 빗나가지 않는 오딘의 창.",
  },
  {
    id: "fleece",
    name: "황금 양털",
    origin: "그리스",
    text: "쉼터에서 회복하는 체력이 절반 더 늘어납니다.",
    lore: "이아손과 아르고호 원정대가 찾아 나선 보물.",
  },
];

const BY_ID = new Map(RELICS.map((r) => [r.id, r]));

/** @param {string} id */
export function getRelic(id) {
  const relic = BY_ID.get(id);
  if (!relic) throw new Error(`알 수 없는 유물: ${id}`);
  return relic;
}
