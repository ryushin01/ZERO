/**
 * 탈것·동반자와 결속. 슬레이프니르 같은 카드를 다른 신·영웅의 카드에 끼우면 둘이 한 장이 되고,
 * 그 카드를 낼 때 탈것·동반자의 키워드 효과가 함께 터집니다. 신화 속 짝(오딘과 슬레이프니르)이면
 * 키워드 대신 더 강한 고유 효과가 붙습니다.
 *
 * 짝 데이터는 Ark에 ‘탈것·동반자’ 관계가 생기면 그쪽으로 옮길 수 있게 같은 모양(rider, partner)으로 둡니다.
 *
 * @typedef {"agile" | "vanguard" | "flight" | "scout" | "guard" | "mend"} Keyword
 * @typedef {{ op: string, value: number, all?: boolean }} BondEffect
 * @typedef {{ slug: string, relation: "mount" | "companion", keyword: Keyword }} Partner
 * @typedef {{ rider: string, partner: string, title: string, text: string, effects: BondEffect[], innate?: boolean, costDelta?: number }} Bond
 */

/** @type {Record<Keyword, { label: string, text: string, effects: BondEffect[], innate?: boolean }>} */
export const KEYWORDS = {
  agile: { label: "기동", text: "카드 1장 뽑기", effects: [{ op: "draw", value: 1 }] },
  vanguard: { label: "선제", text: "전투 첫 턴에 반드시 손에 들어옴", effects: [], innate: true },
  flight: { label: "비행", text: "받는 다음 공격 1회 피해 절반", effects: [{ op: "evade", value: 1 }] },
  scout: { label: "정찰", text: "모든 적에게 약화 1", effects: [{ op: "weak", value: 1, all: true }] },
  guard: { label: "수호", text: "방어 5", effects: [{ op: "block", value: 5 }] },
  mend: { label: "치유", text: "체력 4 회복", effects: [{ op: "heal", value: 4 }] },
};

/** 다른 카드에 끼울 수 있는 탈것·동반자 (Ark의 카드) @type {Partner[]} */
export const PARTNERS = [
  { slug: "sleipnir", relation: "mount", keyword: "vanguard" },
  { slug: "pegasus", relation: "mount", keyword: "flight" },
  { slug: "huginn-muninn", relation: "companion", keyword: "scout" },
  { slug: "cerberus", relation: "companion", keyword: "guard" },
  { slug: "turul", relation: "companion", keyword: "flight" },
  { slug: "bennu", relation: "companion", keyword: "mend" },
  { slug: "jade-rabbit", relation: "companion", keyword: "mend" },
  { slug: "sphinx", relation: "companion", keyword: "guard" },
  { slug: "barong", relation: "companion", keyword: "guard" },
  { slug: "chiron", relation: "companion", keyword: "agile" },
];

/** 신화 속 짝: 키워드 대신 고유 효과 @type {Bond[]} */
export const BONDS = [
  {
    rider: "odin",
    partner: "sleipnir",
    title: "아홉 세계를 달리는 여덟 다리",
    text: "전투 첫 턴에 손에 들어오고, 비용 1 감소, 카드 1장 뽑기",
    effects: [{ op: "draw", value: 1 }],
    innate: true,
    costDelta: -1,
  },
  {
    rider: "odin",
    partner: "huginn-muninn",
    title: "생각과 기억",
    text: "모든 적에게 약화 1, 카드 2장 뽑기",
    effects: [
      { op: "weak", value: 1, all: true },
      { op: "draw", value: 2 },
    ],
  },
  {
    rider: "bellerophon",
    partner: "pegasus",
    title: "하늘에서 키마이라를 친 기수",
    text: "받는 공격 2회 피해 절반, 모든 적에게 취약 1",
    effects: [
      { op: "evade", value: 2 },
      { op: "vulnerable", value: 1, all: true },
    ],
  },
  {
    rider: "perseus",
    partner: "pegasus",
    title: "메두사의 피에서 태어난 말",
    text: "받는 다음 공격 1회 피해 절반, 카드 1장 뽑기",
    effects: [
      { op: "evade", value: 1 },
      { op: "draw", value: 1 },
    ],
  },
  {
    rider: "hades",
    partner: "cerberus",
    title: "저승 문의 파수꾼",
    text: "방어 8, 모든 적에게 침식 2",
    effects: [
      { op: "block", value: 8 },
      { op: "erosion", value: 2, all: true },
    ],
  },
  {
    rider: "change",
    partner: "jade-rabbit",
    title: "달의 궁전에서 찧는 불사약",
    text: "체력 6 회복, 방어 4",
    effects: [
      { op: "heal", value: 6 },
      { op: "block", value: 4 },
    ],
  },
];

const PARTNER_BY_SLUG = new Map(PARTNERS.map((p) => [p.slug, p]));

/** 끼울 수 있는 탈것·동반자인지 @param {string | null | undefined} slug */
export const partnerOf = (slug) => (slug ? PARTNER_BY_SLUG.get(slug) : undefined);

/** 짝이면 고유 결속 @param {string | null | undefined} rider @param {string} partner */
export const bondOf = (rider, partner) => BONDS.find((b) => b.rider === rider && b.partner === partner);

/**
 * 카드에 탈것·동반자를 끼웠을 때 붙는 효과
 * @param {string | null | undefined} rider 카드의 신 @param {string} partner 탈것·동반자의 신
 * @returns {{ title: string, text: string, effects: BondEffect[], innate: boolean, costDelta: number }}
 */
export function bondEffects(rider, partner) {
  const bond = bondOf(rider, partner);
  if (bond) {
    return {
      title: bond.title,
      text: bond.text,
      effects: bond.effects,
      innate: Boolean(bond.innate),
      costDelta: bond.costDelta ?? 0,
    };
  }
  const p = /** @type {Partner} */ (partnerOf(partner));
  const k = KEYWORDS[p.keyword];
  return { title: k.label, text: k.text, effects: k.effects, innate: Boolean(k.innate), costDelta: 0 };
}
