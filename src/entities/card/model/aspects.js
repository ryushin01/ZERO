/**
 * 신의 관장 영역(Ark의 domains)을 여섯 속성으로 묶습니다.
 * 카드 효과는 이 속성으로 정해지므로, 같은 신이라면 Ark에서 읽은 성격이 카드에도 그대로 드러납니다.
 *
 * @typedef {"war" | "guard" | "wisdom" | "life" | "doom" | "sky"} Aspect
 */

/** @type {Record<Aspect, { mark: string, label: string, en: string, summary: string }>} */
export const ASPECTS = {
  war: { mark: "戰", label: "전투", en: "WAR", summary: "적에게 피해를 줍니다." },
  guard: { mark: "守", label: "수호", en: "WARD", summary: "방어를 쌓아 피해를 막습니다." },
  wisdom: { mark: "智", label: "지혜", en: "LORE", summary: "카드를 더 뽑습니다." },
  life: { mark: "生", label: "생명", en: "LIFE", summary: "체력을 되찾습니다." },
  doom: { mark: "死", label: "죽음", en: "DOOM", summary: "침식과 취약으로 적을 무너뜨립니다." },
  sky: { mark: "天", label: "하늘", en: "SKY", summary: "힘을 키우거나 빛으로 모두를 칩니다." },
};

/** @type {Record<Aspect, string[]>} */
export const ASPECT_DOMAINS = {
  war: [
    "전쟁",
    "전쟁의 전략",
    "번개",
    "천둥",
    "힘",
    "폭풍",
    "바람",
    "사냥",
    "궁술",
    "용기",
    "영웅",
    "분노",
    "복수",
    "정복",
    "파괴",
    "불",
    "쇠",
    "대장장이",
    "대장장이 기술",
    "짐승",
    "야생",
    "괴물",
    "모험",
    "악귀 퇴치",
    "악을 물리침",
    "마귀",
    "지진",
    "말",
  ],
  guard: [
    "수호",
    "보호",
    "보호의 상징",
    "산",
    "대지",
    "가정",
    "가정의 수호",
    "파수",
    "경계",
    "나라 지키기",
    "마을의 수호",
    "인간의 수호",
    "소녀의 수호",
    "집",
    "바다",
    "바닷물",
    "민물",
    "맹세",
    "계약",
    "법",
    "법과 질서",
    "질서",
    "국토",
    "하늘을 기움",
  ],
  wisdom: [
    "지혜",
    "예언",
    "문자",
    "기록",
    "가르침",
    "마법",
    "세이드 마법",
    "주술",
    "점술",
    "예지",
    "예지몽",
    "시",
    "음악",
    "노래",
    "예술",
    "공예",
    "문명",
    "베다",
    "전령",
    "전언",
    "여행",
    "길",
    "상업",
    "무속",
    "꾀",
    "속임수",
    "장난",
    "변신",
    "도둑",
    "운명",
    "운명의 갈림길",
    "시작",
    "장애 제거",
    "불교",
    "정치",
    "연극",
    "춤",
  ],
  life: [
    "치유",
    "풍요",
    "농사",
    "농경",
    "벼",
    "벼농사",
    "옥수수",
    "포도",
    "포도주",
    "출산",
    "사랑",
    "아름다움",
    "욕망",
    "결혼",
    "혼인",
    "모성",
    "어머니",
    "여성",
    "자손",
    "부활",
    "재생",
    "생명",
    "비",
    "물",
    "장수",
    "수명",
    "불사",
    "불멸",
    "신선",
    "즐거움",
    "축제",
    "행운",
    "부",
    "선물",
    "장사의 번성",
    "숲",
    "동물",
    "물고기",
    "새",
    "헌신",
    "선",
  ],
  doom: [
    "저승",
    "저승 안내",
    "죽음",
    "죽은 이",
    "죽음과 영생",
    "죽음과 시험",
    "삶과 죽음",
    "장례",
    "미라",
    "지하 세계",
    "혼돈",
    "혼란",
    "역병",
    "밤",
    "악",
    "뱀",
    "사막",
    "땅속의 부",
    "조상",
    "달",
  ],
  sky: [
    "하늘",
    "하늘과 땅",
    "왕권",
    "신들의 왕",
    "권력",
    "다카마가하라 통치",
    "정의",
    "고행",
    "북쪽 땅",
    "태양",
    "해",
    "빛",
    "금성",
    "창조",
    "인류 창조",
    "유지",
    "화신(아바타라)",
    "시조",
    "건국",
    "왕가의 시작",
  ],
};

/** 하늘 속성 안에서도 결이 다른 영역 */
export const SKY_SUN = ["태양", "해", "빛", "금성"];
export const SKY_CREATION = ["창조", "인류 창조", "유지", "화신(아바타라)", "시조", "건국", "왕가의 시작"];

/** 효과 모양을 바꾸는 영역 */
export const TRAITS = {
  /** 모든 적을 칩니다 */
  thunder: ["번개", "천둥"],
  /** 두 번 나눠 칩니다 */
  storm: ["폭풍", "바람"],
  /** 비용 0의 가벼운 수 */
  trick: ["속임수", "장난", "꾀", "도둑", "변신"],
  /** 턴이 끝나도 손에 남습니다 */
  rebirth: ["부활", "재생", "불사", "불멸", "죽음과 영생"],
};

const LOOKUP = new Map(
  /** @type {[string, Aspect][]} */ (
    Object.entries(ASPECT_DOMAINS).flatMap(([aspect, list]) => list.map((domain) => [domain, aspect]))
  ),
);

/**
 * 영역 하나의 속성. 표에 없으면 가장 가까운 낱말로 찾고, 그래도 없으면 null.
 * @param {string} domain
 * @returns {Aspect | null}
 */
export function aspectOf(domain) {
  const exact = LOOKUP.get(domain);
  if (exact) return exact;
  for (const [known, aspect] of LOOKUP) {
    if (domain.includes(known) || known.includes(domain)) return aspect;
  }
  return null;
}

/**
 * 영역 목록에서 주 속성과 보조 속성을 고릅니다. 앞에 적힌 영역일수록 그 신을 더 잘 나타냅니다.
 * @param {string[]} domains
 * @returns {{ primary: Aspect, secondary: Aspect | null, primaryDomain: string }}
 */
export function pickAspects(domains) {
  const found = domains
    .map((domain) => ({ domain, aspect: aspectOf(domain) }))
    .filter((entry) => entry.aspect !== null);
  if (found.length === 0) return { primary: "war", secondary: null, primaryDomain: domains[0] ?? "" };
  const [first] = found;
  const second = found.find((entry) => entry.aspect !== first.aspect);
  return {
    primary: /** @type {Aspect} */ (first.aspect),
    secondary: second ? /** @type {Aspect} */ (second.aspect) : null,
    primaryDomain: first.domain,
  };
}

/** @param {string[]} domains @param {string[]} list */
export const hasAny = (domains, list) => domains.some((d) => list.includes(d));
