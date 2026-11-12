/**
 * 신화 속 보물. 정예와 보스를 쓰러뜨리면 얻습니다. 휘두르는 무기는 무구(entities/armament)로 따로 둡니다.
 * 효과는 전투 엔진이 id로 확인합니다.
 *
 * @typedef {{ id: string, name: string, origin: string, text: string, lore: string }} RelicDef
 */

/** @type {RelicDef[]} */
export const RELICS = [
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
    id: "feather",
    name: "마아트의 깃털",
    origin: "이집트",
    text: "전투가 시작되면 모든 적에게 약화 1을 겁니다.",
    lore: "죽은 이의 심장과 무게를 견주는 진리의 깃털.",
  },
  {
    id: "amrita",
    name: "암리타",
    origin: "인도",
    text: "얻을 때 최대 체력이 12 늘어납니다.",
    lore: "신들과 아수라가 우유 바다를 저어 얻은 불사의 감로.",
  },
  {
    id: "sampo",
    name: "삼포",
    origin: "핀란드",
    text: "카드 보상에 고를 카드가 하나 더 나옵니다.",
    lore: "일마리넨이 벼려 낸, 끝없이 곡식과 소금과 돈을 내는 맷돌.",
  },
  {
    id: "ariadne",
    name: "아리아드네의 실",
    origin: "그리스",
    text: "전투 첫 턴에 카드를 2장 더 뽑습니다.",
    lore: "테세우스가 미궁에서 길을 잃지 않게 해 준 실타래.",
  },
  {
    id: "golden-apple",
    name: "이둔의 사과",
    origin: "북유럽",
    text: "장이 바뀔 때 체력을 모두 회복합니다.",
    lore: "신들을 늙지 않게 하는 이둔의 황금 사과.",
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
export const hasRelic = (id) => BY_ID.has(id);

/** @param {string} id */
export function getRelic(id) {
  const relic = BY_ID.get(id);
  if (!relic) throw new Error(`알 수 없는 유물: ${id}`);
  return relic;
}
