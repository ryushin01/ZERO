/**
 * Ark의 유물(entities/relic)을 ZERO의 무구로 옮기는 규칙. 동기화 스크립트(pnpm sync:ark)도 이 파일을 씁니다.
 *
 * - ZERO가 먼저 수치를 정해 둔 무구와 같은 유물은 ZERO의 id로 잇습니다. (저장된 판이 무구 id를 씁니다)
 * - 전투 엔진이 효과를 따로 처리하는 ZERO의 보물(entities/relic)과 같은 유물은 무구로 넣지 않습니다.
 * - 나머지 유물은 이름과 종류로 생김새(form)를 가리고, forge.js가 생김새와 주인의 관장 영역으로 수치를 정합니다.
 *   생김새는 영어 이름까지 보므로 동기화 때 미리 가려 `data/relics.json`에 적습니다. (판별 표는 첫 화면 묶음에 넣지 않음)
 *
 * @typedef {"weapon" | "armor" | "tool" | "treasure" | "ornament"} RelicKind Ark 유물의 종류
 * @typedef {{ slug: string, name: string, kind: RelicKind, form: Form | null, figureSlugs: string[] }} ArkRelic 게임이 읽는 유물(data/relics.json)
 * @typedef {"blade" | "spear" | "bow" | "blunt" | "bolt" | "disc" | "shield" | "armor" | "veil" | "bind" | "vessel" | "elixir" | "horn" | "lyre" | "mirror" | "jewel" | "ride" | "scroll" | "staff" | "stone" | "hoard"} Form 무구의 생김새
 */

/** Ark 유물 slug → 같은 무구의 ZERO id (ZERO가 먼저 만든 무구) */
export const ARK_ALIASES = /** @type {Record<string, string>} */ ({
  caduceus: "kerykeion",
  "sudarshana-chakra": "sudarshana",
  "gae-bulg": "gaebolg",
  durendal: "durandal",
  "aladdin-lamp": "magic-lamp",
  "shield-of-achilles": "achilles-shield",
  "bow-of-hou-yi": "yi-bow",
});

/** Ark 유물 slug → 같은 물건인 ZERO 보물 id. 보물은 무구로 넣지 않습니다. */
export const ARK_TREASURES = /** @type {Record<string, string>} */ ({
  draupnir: "draupnir",
  "feather-of-maat": "feather",
  amrita: "amrita",
  sampo: "sampo",
  "ariadnes-thread": "ariadne",
  "apples-of-idunn": "golden-apple",
  "golden-fleece": "fleece",
  // ZERO에서 Ark로 옮긴 보물 (2026-11-20)
  yeouiju: "yeouiju",
  ankh: "ankh",
});

/**
 * Ark 유물이 ZERO에서 쓰는 무구 id. ZERO의 보물과 같은 유물이면 null
 * @param {string} slug
 */
export const armamentIdOf = (slug) => (Object.hasOwn(ARK_TREASURES, slug) ? null : (ARK_ALIASES[slug] ?? slug));

/**
 * 유물 이야기에서 주인과 맞선 인물. Ark는 유물에 얽힌 인물을 모두 적으므로(figureSlugs),
 * 무구의 주인(주인과 함께 쓰면 50% 강해짐)에서는 이 인물들을 뺍니다.
 * @type {Record<string, string[]>}
 */
export const RELIC_FOES = {
  gleipnir: ["fenrir"], // 묶인 늑대
  "net-of-hephaestus": ["aphrodite"], // 그물에 걸린 여신
  "tablet-of-destinies": ["tiamat"], // 마르두크가 쓰러뜨린 바다의 여신
  "seven-ornaments-of-ishtar": ["ereshkigal"], // 저승의 문에서 장신구를 벗긴 언니
  "totsuka-no-tsurugi": ["yamata-no-orochi"], // 이 칼에 토막 난 뱀
  higekiri: ["ibaraki-doji"], // 팔을 베인 오니
  "dojigiri-yasutsuna": ["shuten-doji"], // 목을 베인 오니
  "gavsar-mace": ["zahhak"], // 철퇴에 맞은 뱀의 왕
  "south-pointing-chariot": ["chiyou"], // 안개 속에서 길을 잃게 한 적장
  "smoking-mirror": ["quetzalcoatl"], // 거울에 속아 나라를 떠난 신
  "blowgun-of-the-hero-twins": ["vucub-caquix"], // 턱을 맞은 거짓 태양
};

/**
 * 이름만으로 가리기 어려운 유물의 생김새. Ark의 이야기(유래·힘)를 읽고 정했습니다.
 * @type {Record<string, Form>}
 */
export const FORM_OVERRIDES = {
  // 북유럽
  gjallarhorn: "horn", // 헤임달이 불어 신들을 부르는 뿔나팔
  gleipnir: "bind", // 펜리르를 묶은 끈
  hringhorni: "ride", // 발드르의 배
  "mead-of-poetry": "scroll", // 마시면 시인이나 학자가 되는 꿀술
  skidbladnir: "ride", // 접어 주머니에 넣는 프레이르의 배
  // 그리스
  "helm-of-darkness": "veil", // 쓰면 모습이 보이지 않는 투구
  "apple-of-discord": "bind", // 여신들을 다투게 한 사과
  cestus: "lyre", // 누구든 사로잡는 아프로디테의 띠
  "pandoras-jar": "bind", // 온갖 재앙이 갇힌 항아리
  "psyches-box": "lyre", // 저승의 깊은 잠이 든 상자
  "brand-of-meleager": "vessel", // 남아 있는 동안 목숨이 이어지는 장작
  "green-girdle": "armor", // 두르면 누구도 해칠 수 없는 띠 (아서왕 전설)
  // 메소포타미아·이집트·가나안·페르시아
  "plant-of-youth": "elixir", // 먹으면 다시 젊어지는 풀
  "crook-and-flail": "staff", // 오시리스의 왕홀
  "sistrum-of-hathor": "lyre", // 세트 같은 악을 쫓는 딸랑이 악기
  "yagrush-and-ayamur": "blunt", // 바알의 두 곤봉 '쫓는 자'와 '모는 자'
  sharur: "blunt", // 닌우르타의 말하는 철퇴
  "derafsh-kaviani": "horn", // 사람들을 모은 카베의 깃발
  "simurgh-feather": "elixir", // 태우면 시무르그가 와서 상처를 고침
  // 인도
  "kavacha-kundala": "armor", // 어떤 무기에도 다치지 않는 갑옷과 귀걸이
  parashu: "blunt", // 파라슈라마의 도끼
  pinaka: "bow", // 시바의 활
  syamantaka: "hoard", // 날마다 금을 낳는 보석
  kaumodaki: "blunt", // 비슈누의 철퇴
  panchajanya: "horn", // 싸움의 시작을 알리는 크리슈나의 고둥
  "pushpaka-vimana": "ride", // 하늘을 나는 수레
  pashupatastra: "bolt", // 온 세상을 멸할 수 있는 시바의 무기
  // 동아시아
  "ame-no-nuboko": "spear", // 바다를 휘저어 섬을 만든 창
  "five-colored-stones": "stone", // 여와가 하늘을 메운 돌
  "flowers-of-life": "elixir", // 숨이 끊어진 이를 되살리는 꽃과 약수
  "jingu-er": "bind", // 주문을 외면 조여드는 손오공의 테
  "nine-toothed-rake": "bow", // 한 번에 구멍 아홉 개를 내는 저팔계의 쇠갈퀴
  xirang: "stone", // 저절로 자라 둑이 되는 흙
  "nine-tripods": "mirror", // 요괴의 모습을 새겨 미리 알게 한 솥
  "ochre-whip": "elixir", // 풀의 독과 약을 가린 신농의 채찍
  "ryugu-rice-bale-and-bell": "hoard", // 퍼내도 줄지 않는 쌀가마
  tamatebako: "bind", // 열면 세월이 덮치는 상자
  "hanasaka-ashes": "elixir", // 마른 나무에 꽃을 피우는 재
  "uchide-no-kozuchi": "horn", // 흔들면 몸을 키우는 요술 방망이
  jamyeonggo: "veil", // 적이 오면 저절로 울리는 북
  "divine-crossbow": "bolt", // 한 번 쏘면 수많은 적이 쓰러지는 쇠뇌
  // 유럽 민담·전설
  "needle-of-koschei": "mirror", // 불사신 코셰이의 목숨이 숨은 바늘
  "mortar-of-baba-yaga": "ride", // 타고 숲 위를 나는 절구
  "wits-of-orlando": "elixir", // 롤랑의 제정신을 담은 병
  olifant: "horn", // 롤랑의 뿔나팔
  "round-table": "horn", // 기사들이 같은 자격으로 모이는 원탁
  "rake-of-lemminkainens-mother": "elixir", // 아들의 몸을 건져 되살린 갈퀴
  "gusli-of-sadko": "lyre", // 바다 왕을 불러낸 현악기
  "crossbow-of-william-tell": "spear", // 아들 머리 위의 사과를 맞힌 석궁
  "lia-fail": "stone", // 참된 왕을 알아보는 운명의 돌
  // 아메리카·오세아니아·아프리카
  "jawbone-of-maui": "blunt", // 해를 때린 턱뼈
  manaiakalani: "bind", // 섬을 낚아 올린 낚싯바늘
  "blowgun-of-the-hero-twins": "spear", // 부쿱 카킥스의 턱을 맞힌 바람총
  "oshe-shango": "bolt", // 벼락을 내리는 샹고의 도끼
  "opon-ifa": "scroll", // 이파 점판
};

/** 한국어 이름의 끝 낱말 → 생김새. 긴 낱말부터 봅니다. @type {[string, Form][]} */
const NAME_ENDINGS = /** @type {[string, Form][]} */ (
  [
    ["삼지창", "spear"],
    ["투창", "spear"],
    ["작살", "spear"],
    ["창", "spear"],
    ["화살", "bow"],
    ["쇠뇌", "bow"],
    ["활", "bow"],
    ["언월도", "blade"],
    ["단검", "blade"],
    ["검", "blade"],
    ["칼", "blade"],
    ["낫", "blade"],
    ["망치", "blunt"],
    ["철퇴", "blunt"],
    ["곤봉", "blunt"],
    ["몽둥이", "blunt"],
    ["도끼", "blunt"],
    ["봉", "blunt"],
    ["벼락", "bolt"],
    ["번개", "bolt"],
    ["원반", "disc"],
    ["차크라", "disc"],
    ["방패", "shield"],
    ["갑옷", "armor"],
    ["투구", "armor"],
    ["망토", "veil"],
    ["모자", "veil"],
    ["두건", "veil"],
    ["날개옷", "veil"],
    ["옷", "veil"],
    ["그물", "bind"],
    ["밧줄", "bind"],
    ["사슬", "bind"],
    ["족쇄", "bind"],
    ["올가미", "bind"],
    ["실타래", "bind"],
    ["끈", "bind"],
    ["성배", "vessel"],
    ["가마솥", "vessel"],
    ["솥", "vessel"],
    ["술잔", "vessel"],
    ["뿔잔", "vessel"],
    ["잔", "vessel"],
    ["그릇", "vessel"],
    ["항아리", "vessel"],
    ["단지", "vessel"],
    ["상자", "vessel"],
    ["사과", "elixir"],
    ["복숭아", "elixir"],
    ["감로", "elixir"],
    ["꿀술", "elixir"],
    ["영약", "elixir"],
    ["불사약", "elixir"],
    ["열매", "elixir"],
    ["약초", "elixir"],
    ["뿔나팔", "horn"],
    ["나팔", "horn"],
    ["허리띠", "horn"],
    ["북", "horn"],
    ["방울", "horn"],
    ["피리", "lyre"],
    ["하프", "lyre"],
    ["리라", "lyre"],
    ["칸텔레", "lyre"],
    ["거문고", "lyre"],
    ["비파", "lyre"],
    ["거울", "mirror"],
    ["목걸이", "jewel"],
    ["반지", "jewel"],
    ["팔찌", "jewel"],
    ["왕관", "jewel"],
    ["관", "jewel"],
    ["귀걸이", "jewel"],
    ["전차", "ride"],
    ["수레", "ride"],
    ["신발", "ride"],
    ["샌들", "ride"],
    ["날개", "ride"],
    ["구름", "ride"],
    ["양탄자", "ride"],
    ["배", "ride"],
    ["서판", "scroll"],
    ["두루마리", "scroll"],
    ["책", "scroll"],
    ["지팡이", "staff"],
    ["홀", "staff"],
    ["돌", "stone"],
    ["바위", "stone"],
    ["구슬", "hoard"],
    ["여의주", "hoard"],
    ["보석", "hoard"],
    ["진주", "hoard"],
    ["보물", "hoard"],
  ].sort((a, b) => b[0].length - a[0].length)
);

/** 영어 이름의 낱말 → 생김새 @type {[RegExp, Form][]} */
const EN_WORDS = [
  [/\b(sword|blade|sabre|saber|dagger|knife|sickle|scythe|katana)\b/i, "blade"],
  [/\b(spear|lance|javelin|trident|harpoon|pike)\b/i, "spear"],
  [/\b(bow|arrows?|crossbow)\b/i, "bow"],
  [/\b(hammer|mace|club|axe|cudgel)\b/i, "blunt"],
  [/\b(thunderbolt|lightning|thunder)\b/i, "bolt"],
  [/\b(discus|chakram|chakra)\b/i, "disc"],
  [/\b(shield|aegis)\b/i, "shield"],
  [/\b(armou?r|helm|helmet|mail|breastplate|cuirass)\b/i, "armor"],
  [/\b(cloak|cap|hat|mantle|veil|hood|robe|cape)\b/i, "veil"],
  [/\b(net|chains?|rope|fetters?|thread|ribbon|leash|lasso|noose|cord)\b/i, "bind"],
  [/\b(cup|chalice|grail|cauldron|bowl|vessel|jar|pot|cornucopia|box|basket|goblet|pitcher)\b/i, "vessel"],
  [/\b(apples?|peach(es)?|mead|elixir|nectar|ambrosia|herb|fruit|potion|wine|soma)\b/i, "elixir"],
  [/\b(horn|drum|bells?|conch|trumpet|gong|girdle|belt)\b/i, "horn"],
  [/\b(lyre|harp|flute|pipes?|panpipes|lute|syrinx|kantele)\b/i, "lyre"],
  [/\bmirror\b/i, "mirror"],
  [/\b(necklace|ring|bracelet|crown|earrings?|torc|diadem|brooch|armlet|circlet)\b/i, "jewel"],
  [/\b(ship|boat|chariot|sandals|shoes|boots|wings|cloud|carpet|wagon|cart)\b/i, "ride"],
  [/\b(book|tablets?|scrolls?)\b/i, "scroll"],
  [/\b(staff|wand|sceptre|scepter|rod)\b/i, "staff"],
  [/\b(stone|rock|seal)\b/i, "stone"],
  [/\b(jewels?|gems?|pearl|treasure|gold|hoard)\b/i, "hoard"],
];

/** 이름으로 가리지 못했을 때 종류마다 쓰는 생김새. 도구는 주인의 속성을 따릅니다(forge.js). @type {Record<RelicKind, Form | null>} */
const KIND_FORM = { weapon: "blade", armor: "armor", ornament: "jewel", treasure: "hoard", tool: null };

/**
 * 유물의 생김새. 정해 둔 것 → 한국어 이름의 끝 낱말 → 영어 이름의 낱말 → 종류 순으로 봅니다.
 * 도구인데 이름으로 가리지 못했으면 null (주인의 속성으로 정함)
 * @param {{ slug: string, name: string, nameEn: string, kind: RelicKind }} relic
 * @returns {Form | null}
 */
export function formOf({ slug, name, nameEn, kind }) {
  if (Object.hasOwn(FORM_OVERRIDES, slug)) return FORM_OVERRIDES[slug];
  const korean = name.replace(/\s*\(.*\)$/, "").trim();
  for (const [ending, form] of NAME_ENDINGS) if (korean.endsWith(ending)) return form;
  for (const [pattern, form] of EN_WORDS) if (pattern.test(nameEn)) return form;
  return KIND_FORM[kind] ?? null;
}
