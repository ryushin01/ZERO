import { getPantheon, PANTHEON_REGION } from "#entities/figure/@x/faction.js";

/**
 * 세력: 같은 신화 계열의 신을 덱에 모으면 그 계열 전체의 힘이 깨어납니다.
 * 3장이면 1단계, 5장이면 2단계 효과가 전투에 붙습니다.
 *
 * 신이 많은 계열은 고유한 세력 이름과 효과를 갖고, 나머지 계열은 신화권의 공통 효과를 씁니다.
 *
 * @typedef {"startBlock" | "startStrength" | "startWeakAll" | "startVulnAll" | "startErosionAll" | "startDamageAll"
 *   | "firstDraw" | "firstEnergy" | "turnBlock" | "turnHeal" | "endHeal" | "resonanceBoost"} PerkKind
 * @typedef {{ title: string, motto: string, perk: PerkKind, values: [number, number] }} FactionRule
 * @typedef {{ pantheon: string, name: string, title: string, motto: string, perk: PerkKind, values: [number, number] }} Faction
 * @typedef {Partial<Record<PerkKind, number>>} Perks
 */

export const TIERS = [3, 5];

/** 신화권의 공통 세력 @type {Record<string, FactionRule>} */
const REGION_RULES = {
  greek: { title: "올림포스의 질서", motto: "질서는 방패가 됩니다.", perk: "startBlock", values: [6, 12] },
  north: { title: "북방의 전사들", motto: "끝을 알기에 두려움이 없습니다.", perk: "startStrength", values: [1, 2] },
  celtic: { title: "숲의 서약", motto: "서약을 어긴 자는 숲이 갉아먹습니다.", perk: "startErosionAll", values: [3, 6] },
  egypt: { title: "마아트의 저울", motto: "심장의 무게를 답니다.", perk: "startWeakAll", values: [1, 2] },
  nearEast: { title: "점토판의 서기", motto: "기록된 것은 사라지지 않습니다.", perk: "firstDraw", values: [1, 2] },
  india: { title: "윤회의 바퀴", motto: "끝은 다시 시작이 됩니다.", perk: "endHeal", values: [4, 8] },
  eastAsia: { title: "천지의 기운", motto: "하늘과 땅의 기운을 모읍니다.", perk: "firstEnergy", values: [1, 2] },
  americas: { title: "다섯 번째 태양", motto: "태양은 제물을 원합니다.", perk: "startVulnAll", values: [1, 2] },
  africa: { title: "오리샤의 길", motto: "갈림길마다 길잡이가 있습니다.", perk: "turnHeal", values: [1, 2] },
  oceania: { title: "바다를 건넌 이들", motto: "파도는 집이 됩니다.", perk: "turnBlock", values: [2, 4] },
  arctic: { title: "까마귀의 해안", motto: "빛은 훔쳐 온 것입니다.", perk: "firstDraw", values: [1, 2] },
};

/** 신이 많은 계열의 고유 세력 @type {Record<string, FactionRule>} */
const PANTHEON_RULES = {
  greek: { title: "올림포스 열두 신", motto: "올림포스의 질서가 방패가 됩니다.", perk: "startBlock", values: [6, 12] },
  norse: {
    title: "아스가르드",
    motto: "라그나로크를 아는 자들은 물러서지 않습니다.",
    perk: "startStrength",
    values: [1, 2],
  },
  egyptian: { title: "두 땅의 신들", motto: "마아트의 저울이 적을 짓누릅니다.", perk: "startWeakAll", values: [1, 2] },
  hindu: { title: "윤회의 바퀴", motto: "쓰러진 것은 다시 일어납니다.", perk: "endHeal", values: [4, 8] },
  japanese: {
    title: "다카마가하라",
    motto: "높은 하늘의 들판에서 기운이 내려옵니다.",
    perk: "firstEnergy",
    values: [1, 2],
  },
  korean: { title: "홍익인간", motto: "널리 사람을 이롭게 합니다.", perk: "turnHeal", values: [1, 2] },
  chinese: { title: "곤륜", motto: "신선의 산에서 지혜가 흘러내립니다.", perk: "firstDraw", values: [1, 2] },
  mesopotamian: {
    title: "운명의 서판",
    motto: "서판에 새긴 이름은 서로를 부릅니다.",
    perk: "resonanceBoost",
    values: [25, 50],
  },
  celtic: {
    title: "투어허 데 다넌",
    motto: "서약을 어긴 자는 숲이 갉아먹습니다.",
    perk: "startErosionAll",
    values: [3, 6],
  },
  finnish: { title: "칼레발라", motto: "노래가 쇠보다 단단한 벽이 됩니다.", perk: "turnBlock", values: [2, 4] },
  maya: { title: "포폴 부", motto: "옥수수로 빚은 사람들이 다시 일어섭니다.", perk: "startVulnAll", values: [1, 2] },
  aztec: {
    title: "다섯 번째 태양",
    motto: "태양을 움직이려면 불이 필요합니다.",
    perk: "startDamageAll",
    values: [4, 8],
  },
};

/** @param {string} pantheonSlug @returns {Faction} */
export function factionOf(pantheonSlug) {
  const pantheon = getPantheon(pantheonSlug);
  const rule = PANTHEON_RULES[pantheonSlug] ?? REGION_RULES[PANTHEON_REGION[pantheonSlug] ?? "greek"];
  return { pantheon: pantheonSlug, name: pantheon?.name ?? pantheonSlug, ...rule };
}

/** 세력 효과를 문장으로 @param {PerkKind} perk @param {number} value */
export function describePerk(perk, value) {
  switch (perk) {
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
    case "resonanceBoost":
      return `공명이 ${value}%p 더 강해짐`;
    default:
      return "";
  }
}

/**
 * 덱의 카드 계열로 세력 단계를 셉니다.
 * @param {(string | null)[]} pantheonsInDeck 카드마다의 계열 (기본 카드는 null)
 */
export function factionStatus(pantheonsInDeck) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const slug of pantheonsInDeck) if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return [...counts]
    .map(([slug, count]) => {
      const faction = factionOf(slug);
      const tier = count >= TIERS[1] ? 2 : count >= TIERS[0] ? 1 : 0;
      return { ...faction, count, tier };
    })
    .sort((a, b) => b.tier - a.tier || b.count - a.count);
}

/**
 * 켜진 세력 효과를 합칩니다.
 * @param {ReturnType<typeof factionStatus>} status
 * @returns {Perks}
 */
export function perksOf(status) {
  /** @type {Perks} */
  const perks = {};
  for (const f of status) {
    if (f.tier === 0) continue;
    perks[f.perk] = (perks[f.perk] ?? 0) + f.values[f.tier - 1];
  }
  return perks;
}
