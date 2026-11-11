/**
 * 전장. 한 판은 성역(1장) → 신역(2장) → 아우터 유니버스(3장)를 지나고, 지도 곳곳에 드물게
 * 이차원의 균열이 열립니다. 성역과 신역의 장소는 NewWorld의 신화·전설 여행지에서 골랐고,
 * 아우터 유니버스는 여러 신화가 전하는 태초의 공간입니다.
 *
 * 전장마다 효과가 하나 있고(세력과 같은 방식으로 전투에 붙음), 그 전장이 속한 신화권의 카드는
 * ‘지형 공명’으로 피해·방어·회복·침식이 25% 늘어납니다. (공명·울림과 같은 범위로, 뽑기·에너지 같은 개수는 그대로)
 *
 * @typedef {"sanctuary" | "divine" | "outer" | "rift"} Realm
 * @typedef {"startBlock" | "startStrength" | "startWeakAll" | "startVulnAll" | "startErosionAll" | "startDamageAll"
 *   | "firstDraw" | "firstEnergy" | "turnBlock" | "turnHeal" | "endHeal" | "tide" | "enemyStrength"} FieldKind
 * @typedef {{
 *   id: string, name: string, nameEn: string, realm: Realm, pantheons: string[],
 *   summary: string, field: FieldKind, value: number, motif: string, sky: [string, string], source: string,
 * }} Battlefield
 */

/** @type {Record<Realm, { label: string, en: string, act: 1 | 2 | 3 | null, summary: string }>} */
export const REALMS = {
  sanctuary: {
    label: "성역",
    en: "SANCTUARY",
    act: 1,
    summary: "사람의 땅에 남은 전설의 장소들. 신화와 현실이 맞닿은 곳에서 기록을 지키는 싸움이 시작됩니다.",
  },
  divine: {
    label: "신역",
    en: "DIVINE REALM",
    act: 2,
    summary: "신들의 거처와 낙원, 저승. 괴물들은 이제 신들의 자리까지 갉아먹고 있습니다.",
  },
  outer: {
    label: "아우터 유니버스",
    en: "OUTER UNIVERSE",
    act: 3,
    summary: "세계가 생기기 전의 공간. 모든 신화가 처음이라 부르는 곳에서 영(零)이 기다립니다.",
  },
  rift: {
    label: "이차원",
    en: "THE RIFT",
    act: null,
    summary: "지도 곳곳에 드물게 열리는 균열. 다른 세계의 그림자가 흘러들어 와 강한 괴물과 큰 보상이 있습니다.",
  },
};

/** 지형 공명: 전장의 신화권 카드가 얻는 배율 */
export const TERRAIN_RATE = 1.25;

const wiki = (title) => `https://ko.wikipedia.org/wiki/${title}`;
const enwiki = (title) => `https://en.wikipedia.org/wiki/${title}`;

/** @type {Battlefield[]} */
export const BATTLEFIELDS = [
  // 성역: 사람의 땅에 남은 전설의 장소
  {
    id: "avalon",
    name: "아발론",
    nameEn: "Avalon",
    realm: "sanctuary",
    pantheons: ["arthurian", "celtic"],
    summary: "서쪽 바다 너머 사과나무의 섬. 마지막 전투에서 다친 아서 왕이 몸을 누이러 간 곳입니다.",
    field: "turnHeal",
    value: 2,
    motif: "stones",
    sky: ["#0b170f", "#2c5236"],
    source: wiki("아발론"),
  },
  {
    id: "camelot",
    name: "카멜롯",
    nameEn: "Camelot",
    realm: "sanctuary",
    pantheons: ["arthurian"],
    summary: "원탁의 기사들이 모이던 아서 왕의 성. 성벽이 서 있는 한 기사들은 물러서지 않습니다.",
    field: "startBlock",
    value: 8,
    motif: "stones",
    sky: ["#0d0f16", "#33384e"],
    source: wiki("카멜롯"),
  },
  {
    id: "atlantis",
    name: "아틀란티스",
    nameEn: "Atlantis",
    realm: "sanctuary",
    pantheons: ["greek", "roman"],
    summary: "플라톤이 전한 바다의 제국. 하룻밤 사이에 가라앉았고, 그 바다는 지금도 모두를 덮칩니다.",
    field: "tide",
    value: 2,
    motif: "waves",
    sky: ["#04131d", "#13505e"],
    source: wiki("아틀란티스"),
  },
  {
    id: "arcadia",
    name: "아르카디아",
    nameEn: "Arcadia",
    realm: "sanctuary",
    pantheons: ["greek", "roman"],
    summary: "목신 판이 피리를 부는 목가의 땅. 한가로운 들판에서는 생각이 맑아집니다.",
    field: "firstDraw",
    value: 2,
    motif: "columns",
    sky: ["#081c1d", "#1f5650"],
    source: wiki("아르카디아_(이상향)"),
  },
  {
    id: "thule",
    name: "툴레",
    nameEn: "Thule",
    realm: "sanctuary",
    pantheons: ["norse", "finnish"],
    summary: "세상의 북쪽 끝에 있다는 땅. 지지 않는 해 아래 냉기가 적들을 둔하게 합니다.",
    field: "startWeakAll",
    value: 1,
    motif: "mountains",
    sky: ["#08121c", "#2a4660"],
    source: wiki("툴레"),
  },
  {
    id: "ys",
    name: "이스",
    nameEn: "Ys",
    realm: "sanctuary",
    pantheons: ["celtic"],
    summary: "브르타뉴 바다에 잠긴 도시. 성문이 열리던 밤처럼 적들의 방비가 무너집니다.",
    field: "startVulnAll",
    value: 1,
    motif: "waves",
    sky: ["#061614", "#1b4a52"],
    source: wiki("이스_(신화)"),
  },
  {
    id: "shangri-la",
    name: "샹그릴라",
    nameEn: "Shangri-La",
    realm: "sanctuary",
    pantheons: ["tibetan"],
    summary: "히말라야 어딘가에 숨었다는 골짜기. 산이 감싸 주는 동안 사서를 지켜 줍니다.",
    field: "turnBlock",
    value: 2,
    motif: "mountains",
    sky: ["#16080f", "#5e1c36"],
    source: wiki("샹그릴라"),
  },
  {
    id: "shambhala",
    name: "샴발라",
    nameEn: "Shambhala",
    realm: "sanctuary",
    pantheons: ["tibetan", "hindu"],
    summary: "말세에 세상을 구하러 올 왕이 산다는 숨은 왕국. 싸움을 시작할 때부터 지혜가 깃듭니다.",
    field: "firstEnergy",
    value: 1,
    motif: "temple",
    sky: ["#16080f", "#5e1c36"],
    source: wiki("샴발라"),
  },
  {
    id: "peach-blossom",
    name: "무릉도원",
    nameEn: "Peach Blossom Spring",
    realm: "sanctuary",
    pantheons: ["chinese"],
    summary: "어부가 복사꽃 숲을 따라가다 찾았다는 마을. 싸움이 끝나면 지친 몸이 쉬어 갑니다.",
    field: "endHeal",
    value: 6,
    motif: "pagoda",
    sky: ["#0b0b12", "#352a48"],
    source: wiki("무릉도원"),
  },
  {
    id: "ieodo",
    name: "이어도",
    nameEn: "Ieodo",
    realm: "sanctuary",
    pantheons: ["korean"],
    summary: "바다에 나가 돌아오지 못한 이들이 산다는 제주의 섬. 그 그리움이 적들을 갉아먹습니다.",
    field: "startErosionAll",
    value: 3,
    motif: "waves",
    sky: ["#0b0b12", "#352a48"],
    source: wiki("이어도"),
  },
  {
    id: "el-dorado",
    name: "엘도라도",
    nameEn: "El Dorado",
    realm: "sanctuary",
    pantheons: ["inca", "aztec", "maya"],
    summary: "온몸에 금가루를 바른 왕의 전설에서 시작된 황금의 땅. 넘치는 금빛이 힘이 됩니다.",
    field: "startStrength",
    value: 1,
    motif: "steps",
    sky: ["#061614", "#1b5244"],
    source: wiki("엘도라도"),
  },
  {
    id: "aztlan",
    name: "아스틀란",
    nameEn: "Aztlán",
    realm: "sanctuary",
    pantheons: ["aztec"],
    summary: "아즈텍 사람들이 떠나왔다는 백로의 섬. 첫 해가 뜨는 곳에서 적들이 불길에 그을립니다.",
    field: "startDamageAll",
    value: 5,
    motif: "steps",
    sky: ["#061614", "#1b5244"],
    source: wiki("아스틀란"),
  },
  // 신역: 신들의 거처와 낙원, 저승
  {
    id: "olympus",
    name: "올림포스",
    nameEn: "Olympus",
    realm: "divine",
    pantheons: ["greek"],
    summary: "구름 위 열두 신의 궁전. 싸움이 시작되면 하늘에서 번개가 먼저 떨어집니다.",
    field: "startDamageAll",
    value: 8,
    motif: "columns",
    sky: ["#081c1d", "#1f5650"],
    source: wiki("올림포스산"),
  },
  {
    id: "asgard",
    name: "아스가르드",
    nameEn: "Asgard",
    realm: "divine",
    pantheons: ["norse"],
    summary: "무지개다리 비프로스트 너머 아사 신족의 나라. 신들의 성벽이 매 턴 사서를 감쌉니다.",
    field: "turnBlock",
    value: 3,
    motif: "mountains",
    sky: ["#08121c", "#2a4660"],
    source: wiki("아스가르드"),
  },
  {
    id: "valhalla",
    name: "발할라",
    nameEn: "Valhalla",
    realm: "divine",
    pantheons: ["norse"],
    summary: "오딘이 쓰러진 전사들을 모으는 전당. 이곳의 전사는 싸움을 시작할 때부터 힘이 넘칩니다.",
    field: "startStrength",
    value: 2,
    motif: "mountains",
    sky: ["#08121c", "#2a4660"],
    source: wiki("발할라"),
  },
  {
    id: "sumeru",
    name: "수미산",
    nameEn: "Mount Sumeru",
    realm: "divine",
    pantheons: ["hindu", "tibetan", "burmese", "thai"],
    summary: "세계의 한가운데 솟은 우주의 산. 정상에 오르면 온 세상이 한눈에 보입니다.",
    field: "firstDraw",
    value: 2,
    motif: "temple",
    sky: ["#16080f", "#5e1c36"],
    source: wiki("수미산"),
  },
  {
    id: "kunlun",
    name: "곤륜산",
    nameEn: "Kunlun",
    realm: "divine",
    pantheons: ["chinese"],
    summary: "서왕모가 불사약을 지킨다는 서쪽 끝의 산. 매 턴 상처가 아뭅니다.",
    field: "turnHeal",
    value: 2,
    motif: "pagoda",
    sky: ["#0b0b12", "#352a48"],
    source: wiki("곤륜산"),
  },
  {
    id: "takamagahara",
    name: "다카마가하라",
    nameEn: "Takamagahara",
    realm: "divine",
    pantheons: ["japanese"],
    summary: "아마테라스가 다스리는 하늘의 들판. 해가 떠오르듯 첫 턴에 기운이 차오릅니다.",
    field: "firstEnergy",
    value: 1,
    motif: "pagoda",
    sky: ["#0b0b12", "#352a48"],
    source: wiki("다카마가하라"),
  },
  {
    id: "dilmun",
    name: "딜문",
    nameEn: "Dilmun",
    realm: "divine",
    pantheons: ["mesopotamian"],
    summary: "수메르 신화가 노래한 깨끗하고 밝은 땅. 병도 늙음도 없어 싸움 뒤에 몸이 회복됩니다.",
    field: "endHeal",
    value: 8,
    motif: "ziggurat",
    sky: ["#140b06", "#5e3416"],
    source: wiki("딜문"),
  },
  {
    id: "aaru",
    name: "아아루",
    nameEn: "Aaru",
    realm: "divine",
    pantheons: ["egyptian"],
    summary: "오시리스가 다스리는 갈대의 들판. 심판을 통과한 이를 갈대가 지켜 줍니다.",
    field: "turnBlock",
    value: 2,
    motif: "pyramid",
    sky: ["#160c04", "#6e4210"],
    source: enwiki("Aaru"),
  },
  {
    id: "elysion",
    name: "엘리시온",
    nameEn: "Elysium",
    realm: "divine",
    pantheons: ["greek"],
    summary: "영웅과 의인이 머무는 축복의 들판. 이곳에 선 이는 처음부터 굳게 서 있습니다.",
    field: "startBlock",
    value: 10,
    motif: "columns",
    sky: ["#081c1d", "#1f5650"],
    source: wiki("엘리시온"),
  },
  {
    id: "tir-na-nog",
    name: "티르 나 노그",
    nameEn: "Tír na nÓg",
    realm: "divine",
    pantheons: ["celtic", "arthurian"],
    summary: "늙지 않는 젊음의 땅. 오신이 니엄을 따라 건너간 바다 너머의 섬입니다.",
    field: "turnHeal",
    value: 1,
    motif: "stones",
    sky: ["#0b170f", "#2c5236"],
    source: wiki("티르_나_노그"),
  },
  {
    id: "hades",
    name: "하데스의 명계",
    nameEn: "The Underworld",
    realm: "divine",
    pantheons: ["greek"],
    summary: "스틱스강 너머 죽은 이들의 나라. 망각의 물이 적들의 몸을 서서히 지웁니다.",
    field: "startErosionAll",
    value: 4,
    motif: "columns",
    sky: ["#06080a", "#1a2a2a"],
    source: wiki("하데스"),
  },
  {
    id: "yomi",
    name: "요미노쿠니",
    nameEn: "Yomi",
    realm: "divine",
    pantheons: ["japanese"],
    summary: "이자나미가 머무는 어둠의 나라. 어둠 속의 괴물들은 더 사납습니다.",
    field: "enemyStrength",
    value: 1,
    motif: "pagoda",
    sky: ["#08060c", "#241a30"],
    source: wiki("요미"),
  },
  {
    id: "xibalba",
    name: "시발바",
    nameEn: "Xibalba",
    realm: "divine",
    pantheons: ["maya", "aztec"],
    summary: "쌍둥이 영웅이 공놀이로 이긴 공포의 저승. 저승의 군주들은 쉽게 물러서지 않습니다.",
    field: "enemyStrength",
    value: 2,
    motif: "steps",
    sky: ["#040c0a", "#12302a"],
    source: wiki("시발바"),
  },
  // 아우터 유니버스: 세계가 생기기 전의 공간
  {
    id: "ginnungagap",
    name: "긴눙가가프",
    nameEn: "Ginnungagap",
    realm: "outer",
    pantheons: ["norse"],
    summary: "얼음의 니플헤임과 불의 무스펠헤임 사이에 벌어진 틈. 얼음과 불이 부딪쳐 모두를 할퀴습니다.",
    field: "tide",
    value: 3,
    motif: "void",
    sky: ["#04060a", "#18243a"],
    source: wiki("긴눙가가프"),
  },
  {
    id: "chaos",
    name: "카오스",
    nameEn: "Chaos",
    realm: "outer",
    pantheons: ["greek"],
    summary: "헤시오도스가 맨 처음 생겨났다고 한 텅 빈 틈. 형태 없는 힘이 괴물들에게 흘러듭니다.",
    field: "enemyStrength",
    value: 2,
    motif: "void",
    sky: ["#050508", "#1e1e2e"],
    source: enwiki("Chaos_(cosmogony)"),
  },
  {
    id: "nun",
    name: "누",
    nameEn: "Nu",
    realm: "outer",
    pantheons: ["egyptian"],
    summary: "이집트 신화의 태초의 물. 모든 것이 이 물에서 나왔고, 다시 이 물로 돌아가 쉬어 갑니다.",
    field: "turnHeal",
    value: 3,
    motif: "void",
    sky: ["#04080a", "#123040"],
    source: wiki("누_(이집트_신화)"),
  },
  {
    id: "hundun",
    name: "혼돈",
    nameEn: "Hundun",
    realm: "outer",
    pantheons: ["chinese"],
    summary: "얼굴에 구멍이 없던 중앙의 임금. 일곱 구멍을 뚫어 주자 죽었다는 장자의 이야기 속 태초입니다.",
    field: "firstEnergy",
    value: 1,
    motif: "void",
    sky: ["#06060a", "#28203a"],
    source: wiki("혼돈_(신화)"),
  },
  {
    id: "abzu",
    name: "압주",
    nameEn: "Abzu",
    realm: "outer",
    pantheons: ["mesopotamian"],
    summary: "티아마트의 바다와 섞이기 전, 땅 밑에 고여 있던 태초의 민물. 그 깊이가 괴물들을 녹입니다.",
    field: "startErosionAll",
    value: 4,
    motif: "void",
    sky: ["#060806", "#1e2e1e"],
    source: enwiki("Abzu"),
  },
];

const BY_ID = new Map(BATTLEFIELDS.map((b) => [b.id, b]));

/** @param {string} id */
export function getBattlefield(id) {
  const field = BY_ID.get(id);
  if (!field) throw new Error(`알 수 없는 전장: ${id}`);
  return field;
}

/** 그 영역의 전장들 @param {Realm} realm */
export const battlefieldsOf = (realm) => BATTLEFIELDS.filter((b) => b.realm === realm);

/** 장마다 지나는 영역 @param {1 | 2 | 3} act @returns {Realm} */
export const realmOfAct = (act) => (act === 1 ? "sanctuary" : act === 2 ? "divine" : "outer");

/** 전장 효과를 문장으로 씁니다. @param {Pick<Battlefield, "field" | "value">} field */
export function describeField({ field, value }) {
  switch (field) {
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
    case "tide":
      return `턴이 끝날 때마다 사서와 모든 적이 피해 ${value}`;
    case "enemyStrength":
      return `모든 적이 힘 ${value}을 지니고 시작`;
    default:
      return "";
  }
}
