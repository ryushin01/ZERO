/**
 * Ark의 기록을 지워 세계를 태초의 공허로 되돌리려는 괴물들.
 * 괴물은 Ark에 없는 존재로만 골라, Ark의 신과 영웅은 모두 플레이어의 카드로 남깁니다.
 *
 * 천적(nemesis): 신화 속에서 그 괴물과 맞섰던 신·영웅, 계열, 영역의 카드는 피해가 50% 늘어납니다.
 *
 * @typedef {"attack" | "block" | "strength" | "weak" | "vulnerable" | "erosion" | "eclipse" | "heal" | "erase" | "grow"} ActionOp
 * @typedef {{ op: ActionOp, value: number, times?: number | "heads" }} Action
 * @typedef {{ name: string, actions: Action[] }} Intent
 * @typedef {{ figures?: string[], pantheons?: string[], domains?: string[], note: string }} Nemesis
 * @typedef {{
 *   id: string, name: string, nameEn: string, origin: string, lore: string,
 *   tier: "normal" | "elite" | "boss", act: 1 | 2 | 3, hp: [number, number],
 *   intents: Intent[], order: "cycle" | "random", heads?: number, nemesis: Nemesis | null,
 * }} EnemyDef
 */

/** @type {EnemyDef[]} */
export const ENEMIES = [
  // 1장 · 지상의 경계
  {
    id: "harpy",
    name: "하르피이아",
    nameEn: "Harpy",
    origin: "그리스 신화",
    lore: "사람의 얼굴에 새의 몸을 한 돌풍의 정령. 식탁의 음식을 낚아채 가듯 기록을 채 갑니다.",
    tier: "normal",
    act: 1,
    hp: [20, 24],
    order: "cycle",
    intents: [
      { name: "할퀴기", actions: [{ op: "attack", value: 3, times: 2 }] },
      {
        name: "낚아채기",
        actions: [
          { op: "attack", value: 5 },
          { op: "weak", value: 1 },
        ],
      },
      { name: "급강하", actions: [{ op: "attack", value: 7 }] },
    ],
    nemesis: { domains: ["바람"], note: "바람의 신 앞에서는 날개를 펴지 못합니다." },
  },
  {
    id: "kappa",
    name: "갓파",
    nameEn: "Kappa",
    origin: "일본 민담",
    lore: "머리 접시에 물을 담은 물가의 요괴. 물에 젖은 책장은 다시 읽을 수 없습니다.",
    tier: "normal",
    act: 1,
    hp: [38, 42],
    order: "cycle",
    intents: [
      {
        name: "물보라",
        actions: [
          { op: "block", value: 6 },
          { op: "attack", value: 6 },
        ],
      },
      { name: "끌어들이기", actions: [{ op: "attack", value: 10 }] },
      {
        name: "씨름",
        actions: [
          { op: "vulnerable", value: 1 },
          { op: "attack", value: 4 },
        ],
      },
    ],
    nemesis: null,
  },
  {
    id: "draugr",
    name: "드라우그",
    nameEn: "Draugr",
    origin: "북유럽 사가",
    lore: "무덤에서 일어난 망자. 이름이 잊힌 무덤일수록 더 무거워집니다.",
    tier: "normal",
    act: 1,
    hp: [44, 48],
    order: "cycle",
    intents: [
      { name: "내려치기", actions: [{ op: "attack", value: 9 }] },
      {
        name: "무덤의 무게",
        actions: [
          { op: "strength", value: 2 },
          { op: "block", value: 5 },
        ],
      },
      { name: "움켜쥐기", actions: [{ op: "attack", value: 7 }] },
    ],
    nemesis: { domains: ["영웅"], note: "사가의 영웅들은 망자를 다시 무덤에 눕혔습니다." },
  },
  {
    id: "dokkaebi",
    name: "도깨비",
    nameEn: "Dokkaebi",
    origin: "한국 민담",
    lore: "방망이를 든 장난꾸러기. 밤새 씨름을 걸고, 날이 밝으면 빗자루로 돌아갑니다.",
    tier: "normal",
    act: 1,
    hp: [40, 44],
    order: "random",
    intents: [
      { name: "방망이", actions: [{ op: "attack", value: 11 }] },
      { name: "씨름 한판", actions: [{ op: "attack", value: 4, times: 2 }] },
      {
        name: "도깨비불",
        actions: [
          { op: "block", value: 8 },
          { op: "strength", value: 1 },
        ],
      },
    ],
    nemesis: { pantheons: ["korean"], note: "한국 신화의 신들은 도깨비를 다스릴 줄 압니다." },
  },
  {
    id: "minotaur",
    name: "미노타우로스",
    nameEn: "Minotaur",
    origin: "그리스 신화",
    lore: "크레타 미궁의 소머리 괴물. 길을 잃게 하는 것이 그의 무기입니다.",
    tier: "elite",
    act: 1,
    hp: [76, 81],
    order: "cycle",
    intents: [
      { name: "돌진", actions: [{ op: "attack", value: 12 }] },
      {
        name: "뿔 치기",
        actions: [
          { op: "attack", value: 6, times: 2 },
          { op: "vulnerable", value: 1 },
        ],
      },
      {
        name: "미궁의 포효",
        actions: [
          { op: "strength", value: 2 },
          { op: "block", value: 8 },
        ],
      },
    ],
    nemesis: { pantheons: ["minoan"], note: "미궁이 있던 크레타의 신들은 그 길을 압니다." },
  },
  {
    id: "hydra",
    name: "히드라",
    nameEn: "Hydra",
    origin: "그리스 신화",
    lore: "레르나 늪의 머리 여럿 달린 물뱀. 머리 하나를 자르면 둘이 자랍니다.",
    tier: "boss",
    act: 1,
    hp: [125, 125],
    heads: 2,
    order: "cycle",
    intents: [
      { name: "머리마다 물기", actions: [{ op: "attack", value: 4, times: "heads" }] },
      {
        name: "머리 돋기",
        actions: [
          { op: "grow", value: 1 },
          { op: "block", value: 12 },
        ],
      },
      {
        name: "독 숨결",
        actions: [
          { op: "erosion", value: 3 },
          { op: "attack", value: 5 },
        ],
      },
    ],
    nemesis: { figures: ["heracles"], note: "헤라클레스의 열두 과업 가운데 두 번째가 히드라 퇴치였습니다." },
  },

  // 2장 · 모래와 강
  {
    id: "oni",
    name: "오니",
    nameEn: "Oni",
    origin: "일본 민담",
    lore: "쇠몽둥이를 든 뿔 달린 귀신. 저승의 문지기라고도 합니다.",
    tier: "normal",
    act: 2,
    hp: [67, 72],
    order: "cycle",
    intents: [
      { name: "쇠몽둥이", actions: [{ op: "attack", value: 14 }] },
      {
        name: "분노",
        actions: [
          { op: "block", value: 10 },
          { op: "strength", value: 2 },
        ],
      },
      { name: "연타", actions: [{ op: "attack", value: 6, times: 2 }] },
    ],
    nemesis: { figures: ["susanoo"], domains: ["악귀 퇴치"], note: "스사노오는 머리 여덟 달린 뱀도 베었습니다." },
  },
  {
    id: "rakshasa",
    name: "락샤사",
    nameEn: "Rakshasa",
    origin: "인도 신화",
    lore: "모습을 바꾸는 밤의 귀신. 「라마야나」에서 라마와 하누만에 맞섰습니다.",
    tier: "normal",
    act: 2,
    hp: [43, 47],
    order: "cycle",
    intents: [
      {
        name: "홀리는 손톱",
        actions: [
          { op: "attack", value: 8 },
          { op: "weak", value: 1 },
        ],
      },
      { name: "난도질", actions: [{ op: "attack", value: 5, times: 2 }] },
      { name: "밤의 저주", actions: [{ op: "erosion", value: 4 }] },
    ],
    nemesis: { figures: ["hanuman", "durga", "vishnu"], note: "하누만과 두르가는 락샤사와 아수라를 물리쳤습니다." },
  },
  {
    id: "gumiho",
    name: "구미호",
    nameEn: "Gumiho",
    origin: "동아시아 민담",
    lore: "천 년을 산 아홉 꼬리 여우. 사람의 기억을 먹고 사람이 되려 합니다.",
    tier: "normal",
    act: 2,
    hp: [58, 63],
    order: "cycle",
    intents: [
      {
        name: "홀림",
        actions: [
          { op: "vulnerable", value: 2 },
          { op: "weak", value: 1 },
        ],
      },
      { name: "여우 구슬", actions: [{ op: "attack", value: 13 }] },
      {
        name: "기억 먹기",
        actions: [
          { op: "heal", value: 10 },
          { op: "block", value: 6 },
        ],
      },
    ],
    nemesis: null,
  },
  {
    id: "girtablullu",
    name: "기르타블룰루",
    nameEn: "Girtablullu",
    origin: "메소포타미아 신화",
    lore: "해가 뜨고 지는 마슈산의 문을 지키는 전갈 인간.",
    tier: "normal",
    act: 2,
    hp: [65, 69],
    order: "cycle",
    intents: [
      {
        name: "독침",
        actions: [
          { op: "attack", value: 9 },
          { op: "erosion", value: 3 },
        ],
      },
      { name: "산문 지키기", actions: [{ op: "block", value: 12 }] },
      { name: "집게", actions: [{ op: "attack", value: 15 }] },
    ],
    nemesis: { figures: ["gilgamesh"], note: "길가메시는 전갈 인간을 설득해 마슈산의 문을 지났습니다." },
  },
  {
    id: "ammit",
    name: "아미트",
    nameEn: "Ammit",
    origin: "이집트 신화",
    lore: "악어 머리, 사자 몸, 하마 다리의 '죽은 이를 먹는 자'. 깃털보다 무거운 심장을 삼킵니다.",
    tier: "elite",
    act: 2,
    hp: [125, 130],
    order: "cycle",
    intents: [
      { name: "심장 삼키기", actions: [{ op: "attack", value: 16 }] },
      {
        name: "포식",
        actions: [
          { op: "attack", value: 10 },
          { op: "heal", value: 8 },
        ],
      },
      {
        name: "저울질",
        actions: [
          { op: "weak", value: 2 },
          { op: "vulnerable", value: 2 },
        ],
      },
    ],
    nemesis: {
      figures: ["anubis", "thoth", "osiris"],
      note: "심장의 무게를 다는 자리에는 아누비스와 토트, 오시리스가 있었습니다.",
    },
  },
  {
    id: "apep",
    name: "아포피스",
    nameEn: "Apep",
    origin: "이집트 신화",
    lore: "밤마다 태양의 배를 삼키려 드는 혼돈의 큰 뱀.",
    tier: "boss",
    act: 2,
    hp: [197, 197],
    order: "cycle",
    intents: [
      { name: "똬리", actions: [{ op: "attack", value: 9, times: 2 }] },
      {
        name: "일식",
        actions: [
          { op: "eclipse", value: 1 },
          { op: "block", value: 15 },
        ],
      },
      { name: "태양 삼키기", actions: [{ op: "attack", value: 18 }] },
      {
        name: "허물 벗기",
        actions: [
          { op: "strength", value: 1 },
          { op: "erosion", value: 4 },
        ],
      },
    ],
    nemesis: { figures: ["ra", "set"], note: "세트는 라의 태양 배 앞머리에서 아포피스를 찔렀습니다." },
  },

  // 3장 · 세계의 끝
  {
    id: "jotunn",
    name: "서리 거인",
    nameEn: "Jötunn",
    origin: "북유럽 신화",
    lore: "세계가 생기기 전 얼음에서 태어난 거인의 후예.",
    tier: "normal",
    act: 3,
    hp: [81, 85],
    order: "cycle",
    intents: [
      { name: "얼음 망치", actions: [{ op: "attack", value: 18 }] },
      {
        name: "빙벽",
        actions: [
          { op: "block", value: 16 },
          { op: "strength", value: 2 },
        ],
      },
      {
        name: "눈보라",
        actions: [
          { op: "attack", value: 9 },
          { op: "weak", value: 2 },
        ],
      },
    ],
    nemesis: { figures: ["thor"], note: "토르는 묠니르로 수많은 거인을 쓰러뜨렸습니다." },
  },
  {
    id: "tzitzimitl",
    name: "치치미틀",
    nameEn: "Tzitzimitl",
    origin: "아즈텍 신화",
    lore: "일식 때 내려와 세상을 삼킨다는 별의 악령.",
    tier: "normal",
    act: 3,
    hp: [49, 54],
    order: "cycle",
    intents: [
      { name: "별똥 세례", actions: [{ op: "attack", value: 5, times: 3 }] },
      { name: "어둠 뿌리기", actions: [{ op: "erosion", value: 5 }] },
      { name: "내려앉기", actions: [{ op: "attack", value: 12 }] },
    ],
    nemesis: {
      figures: ["huitzilopochtli"],
      domains: ["태양"],
      note: "태양신 우이칠로포치틀리는 날마다 별의 무리를 몰아냅니다.",
    },
  },
  {
    id: "rahu",
    name: "라후",
    nameEn: "Rahu",
    origin: "인도 신화",
    lore: "불사의 감로를 훔쳐 마시다 머리만 남은 아수라. 해와 달을 삼켜 일식을 일으킵니다.",
    tier: "normal",
    act: 3,
    hp: [78, 83],
    order: "cycle",
    intents: [
      {
        name: "해 삼키기",
        actions: [
          { op: "eclipse", value: 1 },
          { op: "attack", value: 10 },
        ],
      },
      { name: "머리 박치기", actions: [{ op: "attack", value: 18 }] },
      {
        name: "감로의 힘",
        actions: [
          { op: "block", value: 14 },
          { op: "strength", value: 1 },
        ],
      },
    ],
    nemesis: { figures: ["vishnu"], note: "비슈누가 원반으로 라후의 목을 베었습니다." },
  },
  {
    id: "imugi",
    name: "이무기",
    nameEn: "Imugi",
    origin: "한국 민담",
    lore: "천 년을 기다렸으나 용이 되지 못한 큰 뱀. 그 원한이 물길을 막습니다.",
    tier: "normal",
    act: 3,
    hp: [85, 90],
    order: "cycle",
    intents: [
      {
        name: "승천 준비",
        actions: [
          { op: "block", value: 14 },
          { op: "strength", value: 3 },
        ],
      },
      { name: "꼬리 치기", actions: [{ op: "attack", value: 13 }] },
      { name: "휘감기", actions: [{ op: "attack", value: 6, times: 3 }] },
    ],
    nemesis: null,
  },
  {
    id: "fenrir",
    name: "펜리르",
    nameEn: "Fenrir",
    origin: "북유럽 신화",
    lore: "라그나로크에 사슬을 끊고 오딘을 삼킨다는 거대한 늑대.",
    tier: "elite",
    act: 3,
    hp: [166, 170],
    order: "cycle",
    intents: [
      { name: "물어뜯기", actions: [{ op: "attack", value: 10, times: 2 }] },
      {
        name: "울부짖음",
        actions: [
          { op: "strength", value: 3 },
          { op: "block", value: 10 },
        ],
      },
      { name: "삼키기", actions: [{ op: "attack", value: 24 }] },
    ],
    nemesis: { figures: ["tyr", "odin"], note: "티르는 펜리르를 묶으려고 오른손을 내주었습니다." },
  },
  {
    id: "zero",
    name: "영(零)",
    nameEn: "Zero",
    origin: "모든 신화의 처음",
    lore: "세계가 생기기 전의 공허. 그리스의 카오스, 북유럽의 긴눙가가프, 이집트의 눈이 가리키는 그것. 모든 기록을 처음으로 되돌리려 합니다.",
    tier: "boss",
    act: 3,
    hp: [336, 336],
    order: "cycle",
    intents: [
      {
        name: "망각",
        actions: [
          { op: "erase", value: 2 },
          { op: "attack", value: 12 },
        ],
      },
      { name: "무(無)의 비", actions: [{ op: "attack", value: 7, times: 3 }] },
      {
        name: "공허",
        actions: [
          { op: "block", value: 30 },
          { op: "strength", value: 3 },
        ],
      },
      { name: "되돌림", actions: [{ op: "attack", value: 30 }] },
    ],
    nemesis: {
      domains: ["창조", "인류 창조", "하늘과 땅"],
      note: "공허에서 세상을 처음 지은 창조의 신들은 공허를 다시 밀어낼 수 있습니다.",
    },
  },
];

const BY_ID = new Map(ENEMIES.map((e) => [e.id, e]));

/** @param {string} id */
export function getEnemy(id) {
  const enemy = BY_ID.get(id);
  if (!enemy) throw new Error(`알 수 없는 적: ${id}`);
  return enemy;
}

/** 장마다 나오는 적 무리 */
export const ENCOUNTERS = {
  1: {
    easy: [["kappa"], ["draugr"], ["harpy"]],
    normal: [["harpy", "harpy"], ["dokkaebi"], ["kappa", "harpy"], ["draugr"], ["dokkaebi", "harpy"]],
    elite: [["minotaur"]],
    boss: ["hydra"],
  },
  2: {
    easy: [["rakshasa"], ["gumiho"]],
    normal: [["oni"], ["rakshasa", "rakshasa"], ["gumiho"], ["girtablullu"], ["rakshasa", "gumiho"]],
    elite: [["ammit"]],
    boss: ["apep"],
  },
  3: {
    easy: [["tzitzimitl"], ["rahu"]],
    normal: [["jotunn"], ["tzitzimitl", "tzitzimitl"], ["rahu"], ["imugi"], ["jotunn", "tzitzimitl"]],
    elite: [["fenrir"]],
    boss: ["zero"],
  },
};

/**
 * 카드가 이 적의 천적인지 봅니다.
 * @param {EnemyDef} enemy
 * @param {{ figureSlug: string | null, pantheonSlug: string | null, domains: string[] }} card
 */
export function isNemesis(enemy, card) {
  const n = enemy.nemesis;
  if (!n || !card.figureSlug) return false;
  return Boolean(
    n.figures?.includes(card.figureSlug) ||
    (card.pantheonSlug && n.pantheons?.includes(card.pantheonSlug)) ||
    n.domains?.some((d) => card.domains.includes(d)),
  );
}
