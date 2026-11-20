import relicData from "../data/relics.json" with { type: "json" };

import { armamentIdOf } from "./ark.js";
import { forgeArmament } from "./forge.js";

/**
 * 신화 속 무구와 도구. 전투에서 에너지를 써서 직접 휘두르고, 쓰고 나면 몇 턴 동안 다시 쓸 수 없습니다.
 *
 * 주인과 함께: 그 턴에 주인 신의 카드를 냈다면 효과가 50% 늘어납니다.
 * 묠니르만은 대신 대기시간 없이 바로 손으로 돌아옵니다.
 *
 * 무구는 두 갈래입니다.
 * - ZERO가 먼저 만든 무구(TUNED): 수치를 손으로 맞췄습니다. 이야기·생김새·참고 글은 도감과 출처 목록에서만 쓰므로
 *   tuned-lore.js에 따로 두고 필요할 때 받습니다(lore.js).
 * - Ark 유물에서 온 무구: `pnpm sync:ark`로 받은 `data/relics.json`의 유물을 forge.js가 무구로 만듭니다.
 *   이야기(유래·힘·대가·출전)는 도감에서만 쓰므로 `data/lore.json`에 따로 두고 필요할 때 받습니다(lore.js).
 *   ZERO가 먼저 만든 무구와 같은 유물은 ZERO의 것을 쓰고, ZERO의 보물과 같은 유물은 무구로 넣지 않습니다(ark.js).
 *
 * @typedef {import("#entities/card/index.js").CardDef["effects"][number] & { pierce?: boolean }} ArmEffect
 * @typedef {{
 *   id: string, name: string, nameEn?: string, owner: string, owners: string[], pantheon: string,
 *   cost: number, cooldown: number, effects: (ArmEffect | { op: "cleanse", value: number })[],
 *   bonus: "power" | "return", lore?: string, look?: string, sources?: string[],
 *   ark?: string, form?: import("./ark.js").Form,
 * }} ArmamentDef ark는 Ark 유물에서 온 무구의 유물 slug, form은 그 생김새
 */

/** ZERO가 먼저 수치를 정한 무구 @type {ArmamentDef[]} */
const TUNED = [
  {
    id: "mjolnir",
    name: "묠니르",
    owner: "토르",
    owners: ["thor"],
    pantheon: "norse",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 8, all: true }],
    bonus: "return",
  },
  {
    id: "gungnir",
    name: "궁니르",
    owner: "오딘",
    owners: ["odin"],
    pantheon: "norse",
    cost: 1,
    cooldown: 3,
    effects: [{ op: "damage", value: 11, pierce: true }],
    bonus: "power",
  },
  {
    id: "brisingamen",
    name: "브리싱가멘",
    owner: "프레이야",
    owners: ["freyja"],
    pantheon: "norse",
    cost: 0,
    cooldown: 4,
    effects: [{ op: "strength", value: 2 }],
    bonus: "power",
  },
  {
    id: "aegis",
    name: "아이기스",
    owner: "제우스·아테나",
    owners: ["zeus", "athena"],
    pantheon: "greek",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "block", value: 12 },
      { op: "weak", value: 1, all: true },
    ],
    bonus: "power",
  },
  {
    id: "trident",
    name: "포세이돈의 삼지창",
    owner: "포세이돈",
    owners: ["poseidon"],
    pantheon: "greek",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 5, all: true },
      { op: "vulnerable", value: 1, all: true },
    ],
    bonus: "power",
  },
  {
    id: "kerykeion",
    name: "케리케이온",
    owner: "헤르메스",
    owners: ["hermes"],
    pantheon: "greek",
    cost: 0,
    cooldown: 2,
    effects: [{ op: "draw", value: 2 }],
    bonus: "power",
  },
  {
    id: "sudarshana",
    name: "수다르샤나 차크라",
    owner: "비슈누",
    owners: ["vishnu", "krishna"],
    pantheon: "hindu",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 6, times: 2 }],
    bonus: "power",
  },
  {
    id: "trishula",
    name: "트리슐라",
    owner: "시바",
    owners: ["shiva", "durga"],
    pantheon: "hindu",
    cost: 2,
    cooldown: 3,
    effects: [{ op: "damage", value: 22 }],
    bonus: "power",
  },
  {
    id: "kusanagi",
    name: "쿠사나기노츠루기",
    owner: "스사노오",
    owners: ["susanoo"],
    pantheon: "japanese",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 6, all: true },
      { op: "block", value: 4 },
    ],
    bonus: "power",
  },
  {
    id: "was",
    name: "와스 홀",
    owner: "이집트의 신들",
    owners: ["set", "anubis", "ra"],
    pantheon: "egyptian",
    cost: 0,
    cooldown: 3,
    effects: [{ op: "energy", value: 2 }],
    bonus: "power",
  },
  {
    id: "wedjat",
    name: "우자트의 눈",
    owner: "호루스",
    owners: ["horus", "thoth"],
    pantheon: "egyptian",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "heal", value: 6 },
      { op: "cleanse", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "cheonbuin",
    name: "천부인",
    owner: "단군",
    owners: ["dangun"],
    pantheon: "korean",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "draw", value: 1 },
      { op: "block", value: 5 },
      { op: "damage", value: 5 },
    ],
    bonus: "power",
  },
  {
    id: "gaebolg",
    name: "게 볼그",
    owner: "쿠 훌린",
    owners: ["cuchulainn"],
    pantheon: "celtic",
    cost: 1,
    cooldown: 3,
    effects: [{ op: "erosion", value: 9 }],
    bonus: "power",
  },
  {
    id: "xiuhcoatl",
    name: "시우코아틀",
    owner: "우이칠로포치틀리",
    owners: ["huitzilopochtli"],
    pantheon: "aztec",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 7, all: true }],
    bonus: "power",
  },
  // ZERO 전설 확장의 무구 (나무위키 '전설의 무기·도구'를 참고하고 위키백과로 고증)
  {
    id: "excalibur",
    name: "엑스칼리버",
    owner: "아서 왕",
    owners: ["king-arthur"],
    pantheon: "arthurian",
    cost: 2,
    cooldown: 3,
    effects: [{ op: "damage", value: 10, all: true }],
    bonus: "power",
  },
  {
    id: "galatine",
    name: "갈라틴",
    owner: "가웨인",
    owners: ["gawain"],
    pantheon: "arthurian",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 9 }],
    bonus: "power",
  },
  {
    id: "arondight",
    name: "아론다이트",
    owner: "랜슬롯",
    owners: ["lancelot"],
    pantheon: "arthurian",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 7 },
      { op: "block", value: 4 },
    ],
    bonus: "power",
  },
  {
    id: "gram",
    name: "그람",
    owner: "시구르드",
    owners: ["sigurd"],
    pantheon: "norse",
    cost: 1,
    cooldown: 3,
    effects: [{ op: "damage", value: 16 }],
    bonus: "power",
  },
  {
    id: "balmung",
    name: "발뭉",
    owner: "지크프리트",
    owners: ["siegfried"],
    pantheon: "germanic",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "damage", value: 8 },
      { op: "strength", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "durandal",
    name: "뒤랑달",
    owner: "롤랑",
    owners: ["roland"],
    pantheon: "carolingian",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "block", value: 8 },
      { op: "damage", value: 6 },
    ],
    bonus: "power",
  },
  {
    id: "joyeuse",
    name: "주아외즈",
    owner: "샤를마뉴",
    owners: ["charlemagne"],
    pantheon: "carolingian",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "strength", value: 2 },
      { op: "block", value: 4 },
    ],
    bonus: "power",
  },
  {
    id: "gandiva",
    name: "간디바",
    owner: "아르주나",
    owners: ["arjuna"],
    pantheon: "hindu",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 4, times: 3 }],
    bonus: "power",
  },
  {
    id: "vasavi-shakti",
    name: "바사비 샥티",
    owner: "카르나",
    owners: ["karna"],
    pantheon: "hindu",
    cost: 0,
    cooldown: 99,
    effects: [{ op: "damage", value: 30, pierce: true }],
    bonus: "power",
  },
  {
    id: "vajra",
    name: "바즈라",
    owner: "인드라",
    owners: ["indra"],
    pantheon: "hindu",
    cost: 2,
    cooldown: 3,
    effects: [{ op: "damage", value: 12, all: true }],
    bonus: "power",
  },
  {
    id: "brahmastra",
    name: "브라흐마스트라",
    owner: "라마",
    owners: ["rama"],
    pantheon: "hindu",
    cost: 2,
    cooldown: 4,
    effects: [
      { op: "damage", value: 14, all: true },
      { op: "vulnerable", value: 1, all: true },
    ],
    bonus: "power",
  },
  {
    id: "gae-dearg",
    name: "게 데아그",
    owner: "디어무드",
    owners: ["diarmuid"],
    pantheon: "celtic",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 7, pierce: true },
      { op: "erosion", value: 3 },
    ],
    bonus: "power",
  },
  {
    id: "fragarach",
    name: "프라가라흐",
    owner: "마나난 막 리르",
    owners: ["manannan"],
    pantheon: "celtic",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "damage", value: 10, pierce: true },
      { op: "weak", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "caladbolg",
    name: "칼라드볼그",
    owner: "퍼거스",
    owners: ["fergus"],
    pantheon: "celtic",
    cost: 2,
    cooldown: 3,
    effects: [{ op: "damage", value: 12, all: true }],
    bonus: "power",
  },
  {
    id: "arash-arrow",
    name: "아라시의 화살",
    owner: "아라시",
    owners: ["arash"],
    pantheon: "iranian",
    cost: 2,
    cooldown: 99,
    effects: [{ op: "damage", value: 40 }],
    bonus: "power",
  },
  {
    id: "harpe",
    name: "하르페",
    owner: "페르세우스",
    owners: ["perseus"],
    pantheon: "greek",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 8 },
      { op: "weak", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "ruyi-jingu-bang",
    name: "여의봉",
    owner: "손오공",
    owners: ["sun-wukong"],
    pantheon: "chinese",
    cost: 1,
    cooldown: 2,
    effects: [{ op: "damage", value: 10 }],
    bonus: "power",
  },
  {
    id: "qiankun-quan",
    name: "건곤권",
    owner: "나타",
    owners: ["nezha"],
    pantheon: "chinese",
    cost: 1,
    cooldown: 2,
    effects: [
      { op: "damage", value: 6 },
      { op: "weak", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "yi-bow",
    name: "후예의 활",
    owner: "후예",
    owners: ["hou-yi"],
    pantheon: "chinese",
    cost: 1,
    cooldown: 3,
    effects: [{ op: "damage", value: 3, times: 3, all: true }],
    bonus: "power",
  },
  {
    id: "achilles-shield",
    name: "아킬레우스의 방패",
    owner: "아킬레우스",
    owners: ["achilles"],
    pantheon: "greek",
    cost: 1,
    cooldown: 3,
    effects: [{ op: "block", value: 15 }],
    bonus: "power",
  },
  {
    id: "tarnkappe",
    name: "타른카페",
    owner: "지크프리트",
    owners: ["siegfried"],
    pantheon: "germanic",
    cost: 0,
    cooldown: 3,
    effects: [
      { op: "block", value: 6 },
      { op: "draw", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "megingjord",
    name: "메깅요르드",
    owner: "토르",
    owners: ["thor"],
    pantheon: "norse",
    cost: 0,
    cooldown: 4,
    effects: [{ op: "strength", value: 3 }],
    bonus: "power",
  },
  {
    id: "kinto-un",
    name: "근두운",
    owner: "손오공",
    owners: ["sun-wukong"],
    pantheon: "chinese",
    cost: 0,
    cooldown: 3,
    effects: [
      { op: "energy", value: 1 },
      { op: "draw", value: 1 },
    ],
    bonus: "power",
  },
  {
    id: "manpasikjeok",
    name: "만파식적",
    owner: "신문왕",
    owners: [],
    pantheon: "korean",
    cost: 1,
    cooldown: 3,
    effects: [
      { op: "cleanse", value: 1 },
      { op: "block", value: 8 },
    ],
    bonus: "power",
  },
  {
    id: "magic-lamp",
    name: "요술 램프",
    owner: "알라딘",
    owners: ["aladdin"],
    pantheon: "arabian-nights",
    cost: 0,
    cooldown: 4,
    effects: [
      { op: "energy", value: 1 },
      { op: "draw", value: 2 },
    ],
    bonus: "power",
  },
];

const tunedIds = new Set(TUNED.map((arm) => arm.id));

/**
 * Ark 유물에서 온 무구. ZERO가 먼저 만든 무구와 같은 유물, ZERO의 보물과 같은 유물은 뺍니다.
 * @type {ArmamentDef[]}
 */
const FORGED = /** @type {import("./ark.js").ArkRelic[]} */ (relicData)
  .filter((relic) => {
    const id = armamentIdOf(relic.slug);
    return id !== null && !tunedIds.has(id);
  })
  .map(forgeArmament);

/** 보상과 길잡이 무구로 나오는 무구 전체: ZERO가 먼저 만든 무구 뒤에 Ark 유물의 순서대로 @type {ArmamentDef[]} */
export const ARMAMENTS = [...TUNED, ...FORGED];

/**
 * 히든 무구. 보상이나 길잡이 무구로 나오지 않고, 히든 사건에서 주인과 함께 얻습니다.
 * 밸런스를 일부러 깨는 성능입니다.
 * @type {ArmamentDef[]}
 */
export const HIDDEN_ARMAMENTS = [
  {
    id: "soul-sword",
    name: "영혼의 검",
    owner: "유신",
    owners: ["yushin"],
    pantheon: "hidden",
    cost: 0,
    cooldown: 1,
    effects: [
      { op: "damage", value: 24, all: true, pierce: true },
      { op: "heal", value: 6 },
    ],
    bonus: "power",
    lore: "유신이 쥔 긴 칼. 조선의 두 손 칼 쌍수도를 닮아 날 길이만 150cm에 이르고, 벤 것의 혼을 거두어 주인의 상처를 메운다고 합니다. 혼을 벤다는 이야기는 ZERO가 지은 것입니다.",
    look: "곧고 아주 긴 외날, 둥근 놋쇠 코등이, 붉은 실을 감은 두 손 자루",
    sources: [
      "https://namu.wiki/w/쌍수도",
      "https://en.wikipedia.org/wiki/Korean_sword",
      "http://www.dogum.co.kr/shop/shop/item.php?it_id=1292980231",
    ],
  },
];

const BY_ID = new Map([...ARMAMENTS, ...HIDDEN_ARMAMENTS].map((a) => [a.id, a]));

/** @param {string} id */
export const hasArmament = (id) => BY_ID.has(id);

/** @param {string} id */
export function getArmament(id) {
  const arm = BY_ID.get(id);
  if (!arm) throw new Error(`알 수 없는 무구: ${id}`);
  return arm;
}

/** 대기시간이 이만큼이면 전투마다 한 번만 쓰는 무구입니다 (바사비 샥티, 아라시의 화살) */
const ONCE = 99;

/** @param {ArmamentDef} arm */
export const isOncePerBattle = (arm) => arm.cooldown >= ONCE;

/** 한 판에 들 수 있는 무구 수 */
export const ARMAMENT_SLOTS = 3;
