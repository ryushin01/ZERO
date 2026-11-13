/**
 * 2인 듀얼의 클래스(직업). 게임에서 흔히 쓰는 직업 이름을 나무위키 「클래스(게임 용어)」의
 * 갈래(기본 클래스의 근접·민첩·마법·성직, 그리고 기타 클래스)대로 모았습니다. 특정 게임의 고유 직업은 넣지 않았습니다.
 * 능력과 덱 구성은 ZERO의 규칙에 맞게 새로 정했습니다.
 *
 * @typedef {"melee" | "agile" | "magic" | "holy" | "other"} ClassGroup
 * @typedef {"war" | "guard" | "wisdom" | "life" | "doom" | "sky"} Aspect
 * @typedef {"startBlock" | "turnBlock" | "startStrength" | "turnHeal" | "turnDraw" | "firstEnergy" | "thorns"
 *   | "lifesteal" | "poison" | "pierce" | "rage" | "bloodcast" | "evade" | "weakenFoe" | "vulnFoe" | "summon"
 *   | "gamble" | "maxHp" | "damageBonus"} PassiveKind
 * @typedef {{ id: string, name: string, en: string, group: ClassGroup, base: boolean, passive: PassiveKind, value: number, aspects: Aspect[] }} ClassDef
 */

/** @type {Record<ClassGroup, { label: string, summary: string }>} */
export const CLASS_GROUPS = {
  melee: { label: "근접", summary: "무기를 들고 앞에서 싸우는 계열" },
  agile: { label: "민첩", summary: "기습과 원거리, 속임수에 능한 계열" },
  magic: { label: "마법", summary: "지식으로 주문을 부리는 계열" },
  holy: { label: "성직", summary: "믿음과 자연의 힘으로 지키고 치유하는 계열" },
  other: { label: "기타", summary: "예술·기술·신분 등 전투 밖에서 온 계열" },
};

/** @type {Record<PassiveKind, (value: number) => string>} */
const PASSIVE_TEXT = {
  startBlock: (v) => `전투가 시작되면 방어 ${v}`,
  turnBlock: (v) => `매 턴 시작에 방어 ${v}`,
  startStrength: (v) => `전투가 시작되면 힘 ${v}`,
  turnHeal: (v) => `매 턴 시작에 체력 ${v} 회복`,
  turnDraw: (v) => `매 턴 카드 ${v}장 더 뽑기`,
  firstEnergy: (v) => `첫 턴에 에너지 ${v} 더`,
  thorns: (v) => `공격받을 때마다 상대에게 피해 ${v}`,
  lifesteal: (v) => `공격 카드를 낼 때마다 체력 ${v} 회복`,
  poison: (v) => `공격 카드를 낼 때마다 상대에게 침식 ${v}`,
  pierce: () => "피해가 상대의 방어를 무시",
  rage: (v) => `체력이 절반 아래로 떨어지면 힘 ${v}`,
  bloodcast: (v) => `매 턴 체력 ${v}을 잃고 에너지 1 더`,
  evade: (v) => `매 턴 받는 공격 ${v}회 피해 절반`,
  weakenFoe: (v) => `전투가 시작되면 상대에게 약화 ${v}`,
  vulnFoe: (v) => `전투가 시작되면 상대에게 취약 ${v}`,
  summon: (v) => `턴이 끝날 때 소환한 것이 상대에게 피해 ${v}`,
  gamble: () => "매 턴 시작에 에너지 1, 카드 1장, 힘 1 가운데 하나를 무작위로",
  maxHp: (v) => `최대 체력 ${v} 더`,
  damageBonus: (v) => `공격 카드의 피해 +${v}`,
};

/** [id, 이름, 영문, 갈래, 능력, 값, 속성들, 기본 클래스?] */
const ROWS = /** @type {[string, string, string, ClassGroup, PassiveKind, number, Aspect[], boolean?][]} */ ([
  // 근접
  ["warrior", "전사", "Warrior", "melee", "damageBonus", 2, ["war", "guard"], true],
  ["barbarian", "야만용사", "Barbarian", "melee", "damageBonus", 3, ["war"]],
  ["berserker", "광전사", "Berserker", "melee", "rage", 3, ["war", "doom"]],
  ["gladiator", "검투사", "Gladiator", "melee", "thorns", 2, ["war"]],
  ["shieldbearer", "방패병", "Shieldbearer", "melee", "turnBlock", 4, ["guard"]],
  ["spearman", "창병", "Spearman", "melee", "pierce", 1, ["war"]],
  ["brawler", "격투가", "Brawler", "melee", "firstEnergy", 1, ["war", "life"]],
  ["knight", "기사", "Knight", "melee", "startBlock", 12, ["guard", "war"]],
  ["guardian", "수호자", "Guardian", "melee", "turnBlock", 3, ["guard"]],
  ["lancer", "창기병", "Lancer", "melee", "pierce", 1, ["war", "sky"]],
  ["paladin", "성기사", "Paladin", "melee", "turnHeal", 2, ["guard", "life"]],
  ["black-knight", "흑기사", "Black Knight", "melee", "poison", 2, ["war", "doom"]],
  ["dark-knight", "암흑 기사", "Dark Knight", "melee", "bloodcast", 2, ["doom", "war"]],
  ["death-knight", "죽음의 기사", "Death Knight", "melee", "lifesteal", 2, ["doom", "war"]],
  ["dragon-knight", "용기사", "Dragon Knight", "melee", "summon", 3, ["war", "sky"]],
  ["swordsman", "검사", "Swordsman", "melee", "evade", 1, ["war"]],
  ["samurai", "무사", "Samurai", "melee", "firstEnergy", 1, ["war"]],
  ["swordmaster", "검성", "Swordmaster", "melee", "damageBonus", 3, ["war"]],
  ["fencer", "펜서", "Fencer", "melee", "evade", 1, ["war", "wisdom"]],
  ["spellsword", "마검사", "Spellsword", "melee", "turnDraw", 1, ["war", "wisdom"]],
  ["gunblade", "총검사", "Gunblade", "melee", "pierce", 1, ["war", "sky"]],
  // 민첩
  ["rogue", "도적", "Rogue", "agile", "poison", 2, ["doom", "war"], true],
  ["bandit", "산적", "Bandit", "agile", "weakenFoe", 1, ["war"]],
  ["pirate", "해적", "Pirate", "agile", "gamble", 1, ["war", "life"]],
  ["assassin", "암살자", "Assassin", "agile", "damageBonus", 3, ["doom"]],
  ["ninja", "닌자", "Ninja", "agile", "evade", 1, ["doom", "wisdom"]],
  ["gambler", "도박사", "Gambler", "agile", "gamble", 1, ["wisdom"]],
  ["shooter", "사수", "Shooter", "agile", "pierce", 1, ["war"]],
  ["archer", "궁수", "Archer", "agile", "damageBonus", 2, ["war", "sky"]],
  ["crossbowman", "석궁사수", "Crossbowman", "agile", "pierce", 1, ["war"]],
  ["ranger", "레인저", "Ranger", "agile", "summon", 2, ["war", "life"]],
  ["gunner", "포수", "Gunner", "agile", "damageBonus", 2, ["war"]],
  ["gunslinger", "총잡이", "Gunslinger", "agile", "firstEnergy", 1, ["war"]],
  ["musketeer", "총사", "Musketeer", "agile", "pierce", 1, ["war", "guard"]],
  ["cannoneer", "대포병", "Cannoneer", "agile", "summon", 3, ["war"]],
  ["sniper", "저격수", "Sniper", "agile", "damageBonus", 3, ["war", "wisdom"]],
  ["hunter", "사냥꾼", "Hunter", "agile", "vulnFoe", 1, ["war", "life"]],
  ["bounty-hunter", "현상금 사냥꾼", "Bounty Hunter", "agile", "vulnFoe", 1, ["war"]],
  ["monster-hunter", "괴물 사냥꾼", "Monster Hunter", "agile", "damageBonus", 2, ["war", "guard"]],
  ["demon-hunter", "악마사냥꾼", "Demon Hunter", "agile", "lifesteal", 2, ["war", "doom"]],
  ["shadow-hunter", "쉐도우 헌터", "Shadow Hunter", "agile", "poison", 2, ["doom"]],
  ["witch-hunter", "위치 헌터", "Witch Hunter", "agile", "weakenFoe", 2, ["life", "war"]],
  ["vampire-hunter", "뱀파이어 헌터", "Vampire Hunter", "agile", "turnHeal", 2, ["war", "life"]],
  ["dragon-slayer", "용살자", "Dragon Slayer", "agile", "rage", 3, ["war"]],
  ["beast-master", "야수조련사", "Beast Master", "agile", "summon", 3, ["life", "war"]],
  // 마법
  ["mage", "마법사", "Mage", "magic", "turnDraw", 1, ["wisdom", "sky"], true],
  ["arcane-mage", "비전 마법사", "Arcane Mage", "magic", "firstEnergy", 1, ["wisdom"]],
  ["elemental-master", "원소술사", "Elemental Master", "magic", "summon", 2, ["sky"]],
  ["pyromancer", "화염술사", "Pyromancer", "magic", "damageBonus", 2, ["war", "sky"]],
  ["cryomancer", "냉기술사", "Cryomancer", "magic", "weakenFoe", 2, ["sky", "guard"]],
  ["electromancer", "전격술사", "Electromancer", "magic", "vulnFoe", 1, ["sky"]],
  ["battle-mage", "배틀메이지", "Battle Mage", "magic", "startBlock", 8, ["war", "wisdom"]],
  ["sage", "현자", "Sage", "magic", "turnDraw", 1, ["wisdom"]],
  ["white-mage", "백마법사", "White Mage", "magic", "turnHeal", 2, ["life", "wisdom"]],
  ["astrologer", "점성술사", "Astrologer", "magic", "firstEnergy", 1, ["sky", "wisdom"]],
  ["psychic", "염동력자", "Psychic", "magic", "pierce", 1, ["wisdom"]],
  ["illusionist", "환술사", "Illusionist", "magic", "evade", 1, ["wisdom"]],
  ["summoner", "소환사", "Summoner", "magic", "summon", 3, ["wisdom", "life"]],
  ["elementalist", "정령사", "Elementalist", "magic", "summon", 2, ["life", "sky"]],
  ["arcanist", "마도학자", "Arcanist", "magic", "turnDraw", 1, ["wisdom", "guard"]],
  ["archmage", "대마법사", "Archmage", "magic", "firstEnergy", 2, ["wisdom", "sky"]],
  ["grand-sorcerer", "대마도사", "Grand Sorcerer", "magic", "damageBonus", 2, ["sky", "wisdom"]],
  ["warlock", "흑마법사", "Warlock", "magic", "bloodcast", 2, ["doom", "wisdom"]],
  ["witch", "마녀", "Witch", "magic", "poison", 2, ["doom", "life"]],
  ["necromancer", "강령술사", "Necromancer", "magic", "summon", 2, ["doom"]],
  ["blood-mage", "혈법사", "Blood Mage", "magic", "lifesteal", 3, ["doom"]],
  ["occultist", "신비술사", "Occultist", "magic", "weakenFoe", 1, ["doom", "wisdom"]],
  // 성직
  ["cleric", "성직자", "Cleric", "holy", "turnHeal", 3, ["life", "guard"], true],
  ["templar", "성전사", "Templar", "holy", "startBlock", 10, ["guard", "war"]],
  ["inquisitor", "이단심문관", "Inquisitor", "holy", "vulnFoe", 2, ["war", "sky"]],
  ["exorcist", "퇴마사", "Exorcist", "holy", "weakenFoe", 2, ["sky", "life"]],
  ["oracle", "예언자", "Oracle", "holy", "turnDraw", 1, ["wisdom", "sky"]],
  ["saint", "성자", "Saint", "holy", "turnHeal", 3, ["life"]],
  ["monk", "수도자", "Monk", "holy", "evade", 1, ["war", "life"]],
  ["druid", "드루이드", "Druid", "holy", "turnHeal", 2, ["life"]],
  ["shaman", "주술사", "Shaman", "holy", "summon", 2, ["sky", "life"]],
  ["onmyoji", "음양사", "Onmyoji", "holy", "summon", 2, ["doom", "wisdom"]],
  ["miko", "무녀", "Shrine Maiden", "holy", "turnBlock", 3, ["sky", "guard"]],
  ["voodoo-priest", "부두술사", "Voodoo Priest", "holy", "poison", 3, ["doom"]],
  ["witch-doctor", "위치 닥터", "Witch Doctor", "holy", "lifesteal", 2, ["life", "doom"]],
  // 기타
  ["bard", "음유시인", "Bard", "other", "turnDraw", 1, ["wisdom", "life"]],
  ["singer", "가수", "Singer", "other", "weakenFoe", 1, ["life"]],
  ["jester", "광대", "Jester", "other", "gamble", 1, ["doom"]],
  ["puppeteer", "인형사", "Puppeteer", "other", "summon", 2, ["wisdom"]],
  ["dancer", "무용수", "Dancer", "other", "evade", 1, ["life"]],
  ["painter", "화가", "Painter", "other", "summon", 2, ["wisdom", "sky"]],
  ["writer", "작가", "Writer", "other", "turnDraw", 1, ["wisdom"]],
  ["gardener", "정원사", "Gardener", "other", "turnHeal", 2, ["life"]],
  ["merchant", "상인", "Merchant", "other", "gamble", 1, ["wisdom"]],
  ["farmer", "농부", "Farmer", "other", "maxHp", 15, ["life", "guard"]],
  ["fisher", "어부", "Fisher", "other", "pierce", 1, ["war", "life"]],
  ["executioner", "망나니", "Executioner", "other", "damageBonus", 3, ["war", "doom"]],
  ["herald", "전령", "Herald", "other", "firstEnergy", 1, ["wisdom"]],
  ["scholar", "학자", "Scholar", "other", "turnDraw", 1, ["wisdom"]],
  ["alchemist", "연금술사", "Alchemist", "other", "poison", 2, ["wisdom", "doom"]],
  ["blacksmith", "대장장이", "Blacksmith", "other", "startBlock", 10, ["guard", "war"]],
  ["mechanic", "기계공", "Mechanic", "other", "summon", 3, ["guard"]],
  ["engineer", "기술자", "Engineer", "other", "turnBlock", 3, ["guard", "wisdom"]],
  ["weapon-master", "웨펀 마스터", "Weapon Master", "other", "damageBonus", 2, ["war"]],
  ["carpenter", "목수", "Carpenter", "other", "turnBlock", 2, ["guard"]],
  ["tailor", "재봉사", "Tailor", "other", "startBlock", 8, ["guard", "life"]],
  ["cook", "요리사", "Cook", "other", "turnHeal", 2, ["life"]],
  ["guild-master", "길드 마스터", "Guild Master", "other", "firstEnergy", 1, ["wisdom", "sky"]],
  ["captain", "단장", "Captain", "other", "startStrength", 1, ["war", "sky"]],
  ["lord", "군주", "Lord", "other", "startStrength", 2, ["sky"]],
  ["king", "왕", "King", "other", "startStrength", 2, ["sky", "guard"]],
  ["queen", "여왕", "Queen", "other", "turnHeal", 2, ["sky", "life"]],
  ["emperor", "황제", "Emperor", "other", "firstEnergy", 1, ["sky"]],
  ["prince", "왕자", "Prince", "other", "startStrength", 1, ["sky", "war"]],
  ["princess", "공주", "Princess", "other", "turnHeal", 2, ["sky", "life"]],
  ["general", "장군", "General", "other", "startStrength", 2, ["war", "sky"]],
  ["cardinal", "추기경", "Cardinal", "other", "turnHeal", 3, ["sky", "life"]],
  ["hero", "용사", "Hero", "other", "rage", 2, ["war", "sky"]],
  ["adventurer", "모험가", "Adventurer", "other", "gamble", 1, ["war", "wisdom"]],
  ["mercenary", "용병", "Mercenary", "other", "damageBonus", 2, ["war"]],
  ["soldier", "군인", "Soldier", "other", "startBlock", 8, ["war", "guard"]],
]);

/** @type {ClassDef[]} */
export const CLASSES = ROWS.map(([id, name, en, group, passive, value, aspects, base = false]) => ({
  id,
  name,
  en,
  group,
  base,
  passive,
  value,
  aspects,
}));

const BY_ID = new Map(CLASSES.map((c) => [c.id, c]));

/** @param {string} id */
export function getClass(id) {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`알 수 없는 클래스: ${id}`);
  return found;
}

/** 클래스 능력을 문장으로 @param {ClassDef} cls */
export const describePassive = (cls) => PASSIVE_TEXT[cls.passive](cls.value);

/** 갈래의 클래스들 (기본 클래스가 먼저) @param {ClassGroup} group */
export const classesOf = (group) =>
  CLASSES.filter((c) => c.group === group).sort((a, b) => Number(b.base) - Number(a.base));

/** 듀얼의 시작 체력 */
export const DUEL_HP = 60;
