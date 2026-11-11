/**
 * Ark의 신 정보로 일러스트 사양을 만듭니다.
 * 신화권마다 하늘·배경·피부·천의 색을 정하고, 관장 영역으로 지물과 기운을 고릅니다.
 * 대표적인 신은 도상(圖像)에 맞게 따로 정해 둡니다. 표에 없는 신도 영역만으로 그려지므로,
 * Ark에 새 신이 늘어나도 같은 화풍으로 바로 카드가 됩니다.
 *
 * @typedef {import("./figures.js").Figure} Figure
 * @typedef {import("#shared/ui/illustration/index.js").SceneSpec} SceneSpec
 */
import { mix } from "#shared/ui/illustration/index.js";

/** 신화권의 색과 배경 */
const REGIONS = {
  greek: { motif: "columns", sky: ["#081c1d", "#1f5650"], skin: "#c9a27e", cloth: "#d9d2bf", metal: "#c9a24a" },
  north: { motif: "mountains", sky: ["#08121c", "#2a4660"], skin: "#d6b49a", cloth: "#5a4632", metal: "#a9b4bd" },
  celtic: { motif: "stones", sky: ["#0b170f", "#2c5236"], skin: "#d6b49a", cloth: "#3e6b3a", metal: "#c9a24a" },
  egypt: { motif: "pyramid", sky: ["#160c04", "#6e4210"], skin: "#a8744a", cloth: "#efe6cf", metal: "#e0b84a" },
  nearEast: { motif: "ziggurat", sky: ["#140b06", "#5e3416"], skin: "#a8744a", cloth: "#8a2a1e", metal: "#e0b84a" },
  india: { motif: "temple", sky: ["#16080f", "#5e1c36"], skin: "#a06a44", cloth: "#e0782a", metal: "#f0c04a" },
  eastAsia: { motif: "pagoda", sky: ["#0b0b12", "#352a48"], skin: "#d9b38c", cloth: "#9a2a22", metal: "#d6b25a" },
  americas: { motif: "steps", sky: ["#061614", "#1b5244"], skin: "#9a6440", cloth: "#1f8a7a", metal: "#e3b23c" },
  africa: { motif: "baobab", sky: ["#140a05", "#62300f"], skin: "#6b4128", cloth: "#c8501e", metal: "#d9a441" },
  oceania: { motif: "waves", sky: ["#04131d", "#13505e"], skin: "#8a5a38", cloth: "#b5652b", metal: "#d9b36a" },
  arctic: { motif: "totem", sky: ["#061219", "#21424e"], skin: "#a87a58", cloth: "#2a3a4a", metal: "#c97a3a" },
  medieval: { motif: "stones", sky: ["#0d0f16", "#33384e"], skin: "#d6b49a", cloth: "#6a1e22", metal: "#b8c0c8" },
  frontier: { motif: "mountains", sky: ["#0c1410", "#2e4a36"], skin: "#c99a74", cloth: "#7a2a22", metal: "#9aa4ac" },
  crimson: { motif: "none", sky: ["#1a0304", "#a3161a"], skin: "#efe4d8", cloth: "#232227", metal: "#d9b25a" },
  steppe: { motif: "mountains", sky: ["#0e1018", "#4a3e2a"], skin: "#c08a60", cloth: "#2a5a8a", metal: "#d6b25a" },
};

/** @type {Record<string, keyof typeof REGIONS>} */
const PANTHEON_REGION = {
  greek: "greek",
  etruscan: "greek",
  minoan: "greek",
  thracian: "greek",
  norse: "north",
  finnish: "north",
  baltic: "north",
  estonian: "north",
  "anglo-saxon": "north",
  slavic: "north",
  hungarian: "north",
  celtic: "celtic",
  armenian: "celtic",
  egyptian: "egypt",
  mesopotamian: "nearEast",
  hittite: "nearEast",
  canaanite: "nearEast",
  arabian: "nearEast",
  iranian: "nearEast",
  hindu: "india",
  tibetan: "india",
  burmese: "india",
  thai: "india",
  indonesian: "india",
  chinese: "eastAsia",
  japanese: "eastAsia",
  korean: "eastAsia",
  vietnamese: "eastAsia",
  ainu: "eastAsia",
  maya: "americas",
  aztec: "americas",
  inca: "americas",
  olmec: "americas",
  zapotec: "americas",
  mixtec: "americas",
  haida: "arctic",
  yoruba: "africa",
  fon: "africa",
  dogon: "africa",
  polynesian: "oceania",
  "rapa-nui": "oceania",
  // ZERO 전설 확장
  arthurian: "celtic",
  carolingian: "medieval",
  germanic: "north",
  roman: "greek",
  "european-folklore": "medieval",
  "american-folklore": "frontier",
  "turko-mongol": "steppe",
  "arabian-nights": "nearEast",
  // 히든
  hidden: "crimson",
};

/** 주 속성의 기운 색 */
const GLOW = {
  war: "#ff7a3a",
  guard: "#e8c37a",
  wisdom: "#7af0d6",
  life: "#b8f08a",
  doom: "#b48aff",
  sky: "#fff0b0",
};

/**
 * 도상에 맞춘 신들. 표에 없는 신은 아래 infer()가 영역으로 정합니다.
 * form이 없으면 사람 모양(figure)입니다.
 * @type {Record<string, Partial<SceneSpec> & { f?: Record<string, any>, c?: Record<string, any> }>}
 */
const ICONS = {
  zeus: {
    thunder: true,
    f: { body: "robed", head: "bare", beard: true, hair: "#e8e2d4", item: "bolt", pose: "raise", cape: true },
  },
  athena: { f: { body: "gown", head: "helm", item: "spear", pose: "hold", shield: true } },
  apollo: { f: { body: "warrior", head: "wreath", hair: "#d9a441", item: "lyre", pose: "cast", cape: true } },
  aphrodite: { f: { body: "gown", head: "bare", hair: "#c9a24a", item: "mirror", pose: "cast" } },
  poseidon: {
    motif: "waves",
    f: { body: "warrior", head: "crown", beard: true, hair: "#2a3a4a", item: "trident", pose: "thrust" },
  },
  odin: {
    f: {
      body: "robed",
      head: "widehat",
      beard: true,
      hair: "#c9c2b0",
      item: "spear",
      pose: "hold",
      cape: true,
      wings: "dark",
    },
  },
  thor: {
    thunder: true,
    f: { body: "warrior", head: "helm", beard: true, hair: "#a8462a", item: "hammer", pose: "raise", cape: true },
  },
  freyja: { f: { body: "gown", head: "crown", hair: "#d9a441", item: "orb", pose: "cast", cape: true } },
  loki: { fire: true, f: { body: "warrior", head: "hood", item: "flame", pose: "cast" } },
  osiris: { skin: "#4f7a4a", f: { body: "robed", head: "crown", beard: true, item: "crook", pose: "hold" } },
  isis: { f: { body: "gown", head: "cowhorns", hair: "#1a120a", item: "ankh", pose: "cast", wings: "gold" } },
  anubis: { f: { body: "robed", head: "jackal", item: "was", pose: "hold" } },
  gilgamesh: { f: { body: "warrior", head: "bare", beard: true, hair: "#1a120a", item: "sword", pose: "raise" } },
  ishtar: { f: { body: "gown", head: "horned", hair: "#1a120a", item: "orb", pose: "cast", wings: "dark" } },
  marduk: { f: { body: "warrior", head: "crown", beard: true, hair: "#1a120a", item: "bolt", pose: "raise" } },
  vishnu: { skin: "#3a5aa0", f: { body: "robed", head: "crown", item: "chakra", pose: "cast", arms: 4 } },
  shiva: { skin: "#4a6a9a", f: { body: "warrior", head: "moon", hair: "#1a120a", item: "trident", pose: "hold" } },
  ganesha: { f: { body: "robed", head: "elephant", item: "axe", pose: "hold", arms: 4 } },
  "izanagi-izanami": { form: "pair", f: { head: "bare", hair: "#1a120a", item: "spear" } },
  amaterasu: { f: { body: "gown", head: "sun", hair: "#1a120a", item: "mirror", pose: "cast" } },
  susanoo: { f: { body: "warrior", head: "bare", hair: "#1a120a", beard: true, item: "sword", pose: "raise" } },
  raijin: { thunder: true, f: { body: "demon", head: "demon", hair: "#1a120a", item: "drum", pose: "raise" } },
  hera: { f: { body: "gown", head: "crown", hair: "#3a2414", item: "staff", pose: "hold" } },
  artemis: { f: { body: "gown", head: "moon", hair: "#3a2414", item: "spear", pose: "thrust" } },
  hermes: { f: { body: "warrior", head: "wingedhelm", item: "caduceus", pose: "cast" } },
  hades: {
    f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "bident", pose: "hold", cape: true },
  },
  heimdall: { f: { body: "warrior", head: "helm", item: "horn", pose: "cast", cape: true } },
  ra: { f: { body: "robed", head: "falcon", item: "was", pose: "hold" } },
  horus: { f: { body: "warrior", head: "falcon", item: "spear", pose: "thrust", wings: "gold" } },
  thoth: { f: { body: "robed", head: "ibis", item: "scroll", pose: "cast" } },
  enki: { f: { body: "robed", head: "horned", beard: true, hair: "#1a120a", item: "vase", pose: "cast" } },
  tiamat: { form: "serpent", c: { heads: 1, scale: "#2a5a6a" } },
  brahma: {
    f: { body: "robed", head: "fourfaced", beard: true, hair: "#e8e2d4", item: "scroll", pose: "hold", arms: 4 },
  },
  krishna: { skin: "#3a5aa0", f: { body: "robed", head: "crown", item: "flute", pose: "cast" } },
  fujin: { f: { body: "demon", head: "demon", hair: "#2a3a2a", item: "windbag", pose: "raise" } },
  pangu: { f: { body: "giant", head: "horned", beard: true, hair: "#3a2a1a", item: "axe", pose: "raise" } },
  nuwa: { form: "naga", f: { head: "crown", hair: "#1a120a", item: "orb", pose: "cast" } },
  change: { f: { body: "gown", head: "moon", hair: "#1a120a", item: "none", pose: "cast" } },
  cernunnos: { f: { body: "robed", head: "antlers", beard: true, hair: "#3a2a1a", item: "snakes", pose: "hold" } },
  cuchulainn: { f: { body: "warrior", head: "bare", hair: "#1a120a", item: "spear", pose: "thrust", shield: true } },
  brigid: { fire: true, f: { body: "gown", head: "veil", item: "torch", pose: "raise" } },
  morrigan: { f: { body: "gown", head: "hood", item: "spear", pose: "hold", wings: "dark" } },
  quetzalcoatl: { form: "serpent", c: { feathered: true, scale: "#1f8a7a" } },
  kukulkan: { form: "serpent", c: { feathered: true, scale: "#4f8a3a" } },
  tezcatlipoca: { f: { body: "warrior", head: "feathers", item: "mirror", pose: "cast" } },
  huitzilopochtli: { fire: true, f: { body: "warrior", head: "feathers", item: "torch", pose: "raise", shield: true } },
  tlaloc: { thunder: true, f: { body: "robed", head: "mask", item: "bolt", pose: "raise" } },
  dangun: { f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "sword", pose: "hold" } },
  bari: { f: { body: "gown", head: "veil", item: "bell", pose: "cast" } },
  sansin: { f: { body: "robed", head: "bare", beard: true, hair: "#e8e2d4", item: "staff", pose: "hold" } },
  // 한국 신화: 건국 신화·무속 신화·설화에 전해지는 모습
  hwanin: { f: { body: "robed", head: "crown", beard: true, hair: "#e8e2d4", item: "orb", pose: "cast", cape: true } },
  hwanung: { f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "bell", pose: "raise" } },
  ungnyeo: { f: { body: "gown", head: "bare", hair: "#1a120a", item: "sheaf", pose: "hold" } },
  haemosu: {
    f: { body: "warrior", head: "sun", beard: true, hair: "#1a120a", item: "sword", pose: "raise", cape: true },
  },
  yuhwa: { f: { body: "gown", head: "bare", hair: "#1a120a", item: "sheaf", pose: "cast" } },
  dongmyeong: { f: { body: "warrior", head: "bare", hair: "#1a120a", item: "bow", pose: "cast", cape: true } },
  hyeokgeose: { f: { body: "robed", head: "crown", hair: "#1a120a", item: "orb", pose: "hold" } },
  suro: { f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "orb", pose: "cast" } },
  seolmundae: {
    scale: 1.2,
    f: { body: "gown", head: "bare", hair: "#3a3a3a", item: "none", pose: "rest", build: 1.12 },
  },
  samsin: { f: { body: "gown", head: "veil", hair: "#e8e2d4", item: "flower", pose: "cast" } },
  jacheongbi: { f: { body: "gown", head: "bare", hair: "#1a120a", item: "sheaf", pose: "raise" } },
  gangnim: { f: { body: "robed", head: "widehat", item: "scroll", pose: "hold", cape: true } },
  siwang: {
    f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "scroll", pose: "hold", build: 1.08 },
  },
  cheoyong: {
    f: { body: "robed", head: "bare", beard: true, hair: "#1a120a", item: "flower", pose: "raise", sleeves: true },
  },
  ilwol: { form: "pair", f: { head: "moon", hair: "#1a120a", item: "orb" } },
  choeyeong: {
    f: { body: "warrior", head: "helm", beard: true, hair: "#1a120a", item: "sword", pose: "guard", cape: true },
  },
  jangseung: { form: "post" },
  chiyou: {
    thunder: true,
    f: { body: "giant", head: "horned", beard: true, hair: "#1a120a", item: "doubleaxe", pose: "smite" },
  },
  jeseok: { f: { body: "robed", head: "cap", item: "bell", pose: "cast" } },
  utturi: { f: { body: "warrior", head: "bare", hair: "#1a120a", item: "sword", pose: "leap", wings: "light" } },
  "seol-jukhwa": {
    f: { body: "warrior", head: "helm", hair: "#1a120a", item: "sword", pose: "charge", hairStyle: "long" },
  },
  vainamoinen: { f: { body: "robed", head: "bare", beard: true, hair: "#e8e2d4", item: "lyre", pose: "cast" } },
  ilmarinen: {
    fire: true,
    f: { body: "warrior", head: "bare", beard: true, hair: "#6a3a1a", item: "hammer", pose: "raise" },
  },
  louhi: { f: { body: "hag", head: "hag", item: "staff", pose: "hold", wings: "dark" } },
  itzamna: { f: { body: "robed", head: "feathers", item: "scroll", pose: "cast" } },
  chaac: { thunder: true, f: { body: "warrior", head: "mask", item: "axe", pose: "raise" } },
  "maize-god": { f: { body: "robed", head: "feathers", item: "sheaf", pose: "cast" } },
  dionysus: { f: { body: "robed", head: "wreath", hair: "#3a2414", item: "cup", pose: "cast" } },
  hephaestus: {
    fire: true,
    f: { body: "warrior", head: "bare", beard: true, hair: "#1a120a", item: "hammer", pose: "raise" },
  },
  heracles: { f: { body: "warrior", head: "lion", beard: true, hair: "#3a2414", item: "club", pose: "raise" } },
  medusa: { f: { body: "gown", head: "snakes", item: "none", pose: "cast" } },
  set: { f: { body: "warrior", head: "setanimal", item: "was", pose: "thrust" } },
  hathor: { f: { body: "gown", head: "cowhorns", hair: "#1a120a", item: "bell", pose: "cast" } },
  bastet: { f: { body: "gown", head: "cat", item: "bell", pose: "cast" } },
  lakshmi: { f: { body: "gown", head: "crown", hair: "#1a120a", item: "flower", pose: "cast", arms: 4 } },
  hanuman: { f: { body: "warrior", head: "monkey", item: "club", pose: "raise" } },
  durga: { f: { body: "gown", head: "crown", hair: "#1a120a", item: "trident", pose: "thrust", arms: 4 } },
  frigg: { f: { body: "gown", head: "veil", item: "staff", pose: "hold" } },
  tyr: {
    f: {
      body: "warrior",
      head: "helm",
      beard: true,
      hair: "#6a4a2a",
      item: "sword",
      pose: "raise",
      shield: false,
      oneHand: true,
    },
  },
  "ahura-mazda": {
    f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "orb", pose: "cast", wings: "gold" },
  },
  mithra: { f: { body: "warrior", head: "cap", item: "sword", pose: "thrust", cape: true } },
  baal: {
    thunder: true,
    f: { body: "warrior", head: "horned", beard: true, hair: "#1a120a", item: "bolt", pose: "raise" },
  },
  astarte: { f: { body: "gown", head: "horned", hair: "#1a120a", item: "spear", pose: "hold" } },
  teshub: {
    thunder: true,
    f: { body: "warrior", head: "horned", beard: true, hair: "#1a120a", item: "axe", pose: "raise" },
  },
  illuyanka: { form: "serpent", c: { heads: 1, scale: "#4a3a2a" } },
  dushara: { form: "stone" },
  perun: {
    thunder: true,
    f: { body: "warrior", head: "bare", beard: true, hair: "#c9c2b0", item: "axe", pose: "raise" },
  },
  svetovid: { f: { body: "robed", head: "fourfaced", beard: true, hair: "#c9c2b0", item: "horn", pose: "cast" } },
  "baba-yaga": { f: { body: "hag", head: "hag", item: "club", pose: "hold" } },
  perkunas: {
    thunder: true,
    f: { body: "warrior", head: "bare", beard: true, hair: "#c9c2b0", item: "axe", pose: "raise" },
  },
  kalevipoeg: { f: { body: "giant", head: "bare", hair: "#d9a441", item: "sword", pose: "raise" } },
  vanapagan: { f: { body: "demon", head: "demon", hair: "#1a120a", item: "club", pose: "hold" } },
  tinia: {
    thunder: true,
    f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "bolt", pose: "raise" },
  },
  charun: { f: { body: "demon", head: "demon", item: "hammer", pose: "hold", wings: "dark" } },
  menrva: { f: { body: "gown", head: "helm", item: "spear", pose: "hold", shield: true } },
  "snake-goddess": { f: { body: "gown", head: "crown", hair: "#1a120a", item: "snakes", pose: "raise" } },
  turul: { form: "bird", c: { bird: "falcon" } },
  emese: { f: { body: "gown", head: "veil", item: "orb", pose: "cast" } },
  weland: {
    fire: true,
    f: { body: "warrior", head: "bare", beard: true, hair: "#6a4a2a", item: "hammer", pose: "raise", wings: "light" },
  },
  beowulf: {
    f: { body: "warrior", head: "helm", beard: true, hair: "#d9a441", item: "sword", pose: "raise", shield: true },
  },
  "thracian-heros": { form: "rider", f: { head: "helm", item: "spear" } },
  shango: { thunder: true, f: { body: "warrior", head: "crown", item: "doubleaxe", pose: "raise" } },
  eshu: { f: { body: "robed", head: "cap", item: "staff", pose: "hold" } },
  orunmila: { f: { body: "robed", head: "crown", item: "scroll", pose: "cast" } },
  nommo: { form: "naga", f: { head: "bare", item: "vase", pose: "cast" } },
  gu: { f: { body: "warrior", head: "bare", item: "sword", pose: "raise" } },
  "mawu-lisa": { form: "pair", f: { head: "moon", item: "orb" } },
  inti: { f: { body: "robed", head: "sun", item: "staff", pose: "hold" } },
  viracocha: { f: { body: "robed", head: "sun", beard: true, hair: "#e8e2d4", item: "staff", pose: "hold" } },
  raven: { form: "bird", c: { bird: "raven" } },
  "were-jaguar": { f: { body: "warrior", head: "jaguar", item: "none", pose: "cast" } },
  cocijo: { thunder: true, f: { body: "robed", head: "mask", item: "bolt", pose: "raise" } },
  "eight-deer": { f: { body: "warrior", head: "jaguar", item: "spear", pose: "thrust", shield: true } },
  maui: { fire: true, f: { body: "warrior", head: "bare", hair: "#1a120a", item: "hook", pose: "raise" } },
  ku: { f: { body: "warrior", head: "feathers", item: "club", pose: "raise" } },
  makemake: { f: { body: "warrior", head: "falcon", item: "orb", pose: "cast" } },
  moai: { form: "moai" },
  "kimun-kamuy": { form: "beast", c: { beast: "bear" } },
  gesar: { form: "rider", f: { head: "helm", item: "sword" } },
  "palden-lhamo": { form: "rider", skin: "#3a4a8a", f: { head: "demon", item: "club" } },
  "thanh-giong": { form: "rider", fire: true, f: { head: "bare", item: "club" } },
  "lac-long-quan": {
    motif: "waves",
    f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "pearl", pose: "cast" },
  },
  thotsakan: { f: { body: "warrior", head: "tenheads", item: "sword", pose: "raise" } },
  barong: { form: "beast", c: { beast: "barong" } },
  // ZERO 전설 확장
  "king-arthur": {
    f: {
      body: "warrior",
      head: "crown",
      beard: true,
      hair: "#c9a24a",
      item: "sword",
      pose: "raise",
      cape: true,
      shield: true,
    },
  },
  merlin: { f: { body: "robed", head: "hood", beard: true, hair: "#e8e2d4", item: "staff", pose: "cast" } },
  lancelot: { f: { body: "warrior", head: "helm", item: "sword", pose: "thrust", shield: true, cape: true } },
  gawain: { f: { body: "warrior", head: "helm", item: "sword", pose: "raise", shield: true } },
  tristan: { f: { body: "warrior", head: "bare", hair: "#6a3a1a", item: "lyre", pose: "cast", cape: true } },
  "morgan-le-fay": { f: { body: "gown", head: "crown", hair: "#1a120a", item: "orb", pose: "cast", cape: true } },
  galahad: { f: { body: "warrior", head: "helm", item: "sword", pose: "hold", shield: true } },
  achilles: { f: { body: "warrior", head: "helm", item: "spear", pose: "thrust", shield: true } },
  hector: {
    f: { body: "warrior", head: "helm", beard: true, hair: "#1a120a", item: "spear", pose: "hold", shield: true },
  },
  odysseus: { f: { body: "warrior", head: "cap", beard: true, hair: "#3a2414", item: "bow", pose: "cast" } },
  perseus: { f: { body: "warrior", head: "wingedhelm", item: "sword", pose: "raise", shield: true } },
  bellerophon: { f: { body: "warrior", head: "helm", item: "spear", pose: "thrust", wings: "light" } },
  orpheus: { f: { body: "robed", head: "wreath", hair: "#3a2414", item: "lyre", pose: "cast" } },
  atalanta: { f: { body: "gown", head: "bare", hair: "#6a3a1a", item: "bow", pose: "cast" } },
  orion: { f: { body: "giant", head: "bare", beard: true, hair: "#1a120a", item: "club", pose: "raise" } },
  chiron: { form: "rider", f: { head: "bare", item: "bow" } },
  sigurd: {
    f: { body: "warrior", head: "helm", beard: true, hair: "#c9a24a", item: "sword", pose: "raise", cape: true },
  },
  siegfried: { f: { body: "warrior", head: "bare", hair: "#d9a441", item: "sword", pose: "raise", cape: true } },
  brynhild: {
    f: { body: "gown", head: "helm", hair: "#d9a441", item: "spear", pose: "hold", shield: true, wings: "light" },
  },
  skadi: { f: { body: "gown", head: "hood", item: "bow", pose: "cast" } },
  arjuna: { f: { body: "warrior", head: "crown", item: "bow", pose: "cast" } },
  karna: { f: { body: "warrior", head: "sun", item: "spear", pose: "thrust" } },
  rama: { skin: "#3a5aa0", f: { body: "warrior", head: "crown", item: "bow", pose: "cast" } },
  indra: { thunder: true, f: { body: "warrior", head: "crown", item: "bolt", pose: "raise", arms: 4 } },
  parashurama: { f: { body: "warrior", head: "bare", beard: true, hair: "#1a120a", item: "axe", pose: "raise" } },
  "sun-wukong": { f: { body: "warrior", head: "monkey", item: "staff", pose: "raise" } },
  "hou-yi": { f: { body: "warrior", head: "bare", hair: "#1a120a", item: "bow", pose: "cast" } },
  nezha: { fire: true, f: { body: "warrior", head: "bare", hair: "#1a120a", item: "spear", pose: "thrust" } },
  "yellow-emperor": { f: { body: "robed", head: "crown", beard: true, hair: "#1a120a", item: "sword", pose: "hold" } },
  rostam: { f: { body: "warrior", head: "helm", beard: true, hair: "#1a120a", item: "club", pose: "raise" } },
  arash: { f: { body: "warrior", head: "bare", beard: true, hair: "#1a120a", item: "bow", pose: "cast" } },
  "erkhii-mergen": { f: { body: "warrior", head: "cap", item: "bow", pose: "cast" } },
  "robin-hood": { f: { body: "warrior", head: "hood", item: "bow", pose: "cast" } },
  "william-tell": { f: { body: "warrior", head: "cap", beard: true, hair: "#6a3a1a", item: "bow", pose: "cast" } },
  "saint-george": { f: { body: "warrior", head: "helm", item: "spear", pose: "thrust", shield: true } },
  roland: { f: { body: "warrior", head: "helm", item: "sword", pose: "raise", shield: true } },
  charlemagne: {
    f: { body: "robed", head: "crown", beard: true, hair: "#e8e2d4", item: "sword", pose: "hold", cape: true },
  },
  "paul-bunyan": { f: { body: "giant", head: "cap", beard: true, hair: "#1a120a", item: "axe", pose: "raise" } },
  "john-henry": { f: { body: "giant", head: "bare", hair: "#1a120a", item: "hammer", pose: "raise" } },
  aladdin: { f: { body: "warrior", head: "cap", item: "lamp", pose: "cast" } },
  scheherazade: { f: { body: "gown", head: "veil", item: "scroll", pose: "cast" } },
  sinbad: {
    motif: "waves",
    f: { body: "warrior", head: "cap", beard: true, hair: "#1a120a", item: "sword", pose: "raise" },
  },
  "jeon-u-chi": { f: { body: "robed", head: "cap", item: "scroll", pose: "cast" } },
  "hong-gil-dong": { f: { body: "warrior", head: "cap", item: "sword", pose: "raise" } },
  "daebyeol-sobyeol": { form: "pair", f: { head: "bare", hair: "#1a120a", item: "bow" } },
  geotaji: { f: { body: "warrior", head: "bare", hair: "#1a120a", item: "bow", pose: "cast" } },
  "yamato-takeru": { fire: true, f: { body: "warrior", head: "bare", hair: "#1a120a", item: "sword", pose: "raise" } },
  "minamoto-no-raiko": { f: { body: "warrior", head: "helm", item: "sword", pose: "raise" } },
  "shuten-doji": { f: { body: "demon", head: "demon", hair: "#c8501e", item: "cup", pose: "cast" } },
  "ibaraki-doji": { f: { body: "demon", head: "demon", hair: "#e8e2d4", item: "none", pose: "raise" } },
  "ibuki-doji": { f: { body: "giant", head: "demon", hair: "#1a120a", item: "cup", pose: "hold" } },
  "tamamo-no-mae": { f: { body: "gown", head: "crown", hair: "#d9a441", item: "orb", pose: "cast" } },
  kiyohime: { fire: true, f: { body: "gown", head: "snakes", hair: "#1a120a", item: "flame", pose: "cast" } },
  "sakata-kintoki": { f: { body: "giant", head: "bare", hair: "#1a120a", item: "axe", pose: "raise" } },
  benkei: { f: { body: "giant", head: "hood", item: "spear", pose: "hold" } },
  vritra: { form: "serpent", c: { heads: 1, scale: "#3a4a2a" } },
  koschei: { f: { body: "hag", head: "crown", item: "staff", pose: "hold" } },
  enkidu: { f: { body: "warrior", head: "bare", hair: "#3a2a1a", item: "none", pose: "cast" } },
  ereshkigal: { f: { body: "gown", head: "horned", hair: "#1a120a", item: "staff", pose: "hold", wings: "dark" } },
  "jade-rabbit": { form: "beast", c: { beast: "rabbit" } },
  // Ark 0.16 몬스터: 신화에 전해지는 모습
  euryale: { f: { body: "gown", head: "snakes", item: "none", pose: "raise", wings: "gold" } },
  cerberus: { form: "beast", c: { beast: "wolf", heads: 3 } },
  minotaur: {
    skin: "#5a3a26",
    f: { body: "giant", head: "horned", hair: "#2a1a10", item: "doubleaxe", pose: "smite" },
  },
  hydra: { form: "serpent", c: { heads: 7 } },
  chimera: { form: "beast", c: { beast: "lion", wings: true } },
  pegasus: { form: "beast", c: { beast: "horse", wings: true } },
  polyphemus: { f: { body: "giant", head: "cyclops", beard: true, hair: "#2a1a10", item: "club", pose: "smite" } },
  typhon: {
    form: "naga",
    thunder: true,
    f: { head: "demon", hair: "#1a120a", item: "none", pose: "raise", wings: "dark" },
  },
  talos: { skin: "#a8742a", f: { body: "giant", head: "helm", item: "none", pose: "guard", build: 1.1 } },
  fenrir: { form: "beast", c: { beast: "wolf", chained: true } },
  jormungandr: { form: "serpent", scale: 1.2, c: { heads: 1 } },
  sleipnir: { form: "beast", c: { beast: "horse", legs: 8 } },
  nidhogg: { form: "serpent", c: { heads: 1, wings: true } },
  "huginn-muninn": { form: "bird", c: { bird: "raven" } },
  fafnir: { form: "serpent", c: { heads: 1, wings: true } },
  ammit: { form: "beast", c: { beast: "ammit" } },
  apep: { form: "serpent", c: { heads: 1 } },
  sphinx: { form: "beast", c: { beast: "lion" } },
  bennu: { form: "bird", fire: true, c: { bird: "falcon" } },
  sirens: {
    f: { body: "gown", head: "bare", hair: "#1a120a", item: "lyre", pose: "cast", wings: "light", hairStyle: "long" },
  },
  scylla: { form: "serpent", c: { heads: 6 } },
  charybdis: { form: "void" },
  oberon: { f: { body: "robed", head: "crown", item: "orb", pose: "cast", wings: "light" } },
  melusine: { form: "naga", f: { head: "crown", hair: "#d9a441", item: "none", pose: "cast" } },
  rangda: { f: { body: "hag", head: "demon", hair: "#e8e2d4", item: "none", pose: "raise" } },
};

/**
 * 신화 속 도상에서 가져온 동반 동물과 움직이는 자세, 머리 모양.
 * 오딘의 까마귀, 아테나의 올빼미, 두르가의 사자처럼 전해지는 상징만 씁니다.
 * @type {Record<string, Record<string, any>>}
 */
const EXTRAS = {
  zeus: { companion: "eagle" },
  odin: { companion: "ravens" },
  thor: { companion: "goat", pose: "smite" },
  athena: { companion: "owl", pose: "guard" },
  freyja: { companion: "cat", hairStyle: "braid" },
  artemis: { companion: "deer", hairStyle: "long" },
  hera: { companion: "peacock", hairStyle: "long" },
  aphrodite: { companion: "dove", hairStyle: "long" },
  hades: { companion: "dog" },
  dionysus: { companion: "tiger" },
  tyr: { companion: "wolf", pose: "guard" },
  horus: { companion: "eagle" },
  bastet: { companion: "cat" },
  anubis: { companion: "dog" },
  durga: { companion: "lion", pose: "charge" },
  shiva: { companion: "serpent" },
  vishnu: { companion: "eagle" },
  ishtar: { companion: "lion", hairStyle: "long" },
  gilgamesh: { companion: "lion", pose: "smite" },
  dangun: { companion: "bear" },
  sansin: { companion: "tiger" },
  // 유화는 아들 주몽에게 비둘기 편에 보리씨를 보냈다고 전합니다.
  yuhwa: { companion: "dove", hairStyle: "long" },
  dongmyeong: { hairStyle: "topknot" },
  samsin: { hairStyle: "long" },
  jacheongbi: { hairStyle: "braid" },
  hwanung: { companion: "tiger" },
  ungnyeo: { companion: "bear", hairStyle: "long" },
  susanoo: { companion: "serpent", pose: "charge" },
  cernunnos: { companion: "deer" },
  morrigan: { companion: "ravens", hairStyle: "long" },
  quetzalcoatl: { companion: "serpent" },
  huitzilopochtli: { companion: "eagle", pose: "charge" },
  romulus: { companion: "wolf" },
  merlin: { companion: "owl" },
  "morgan-le-fay": { companion: "raven", hairStyle: "long" },
  "hou-yi": { companion: "raven", hairStyle: "topknot" },
  "saint-george": { pose: "charge" },
  // 움직이는 자세
  sigurd: { pose: "smite", hairStyle: "braid" },
  rostam: { pose: "smite" },
  "paul-bunyan": { pose: "smite" },
  "john-henry": { pose: "smite" },
  parashurama: { pose: "smite" },
  "sakata-kintoki": { pose: "smite" },
  achilles: { pose: "charge" },
  lancelot: { pose: "charge" },
  nezha: { pose: "charge", hairStyle: "topknot" },
  karna: { pose: "charge" },
  bellerophon: { pose: "leap" },
  perseus: { pose: "leap" },
  "sun-wukong": { pose: "leap" },
  "yamato-takeru": { pose: "leap", hairStyle: "topknot" },
  "hong-gil-dong": { pose: "leap", hairStyle: "topknot" },
  hector: { pose: "guard" },
  galahad: { pose: "guard" },
  roland: { pose: "guard" },
  bedivere: { pose: "guard" },
  brynhild: { pose: "charge", hairStyle: "braid" },
  loki: { hairStyle: "wild" },
  scathach: { pose: "charge", hairStyle: "braid" },
  gareth: { pose: "guard" },
};

/** 옷 색을 신마다 밝게·어둡게, 혹은 다른 색 쪽으로 조금 옮깁니다. @param {string} cloth @param {string} slug */
function tint(cloth, slug) {
  const r = seedOf(`${slug}:cloth`);
  const accents = ["#e8e2d4", "#1a1612", "#7a2a22", "#2a4a6a", "#4a5a2a", "#6a4a8a", "#a8742a"];
  return mix(cloth, accents[Math.floor(r * accents.length)], 0.18 + r * 0.22);
}

/**
 * 한국 신화권은 색 없이 흑백으로 그립니다: 신과 무구는 한지 같은 밝은 회색, 괴물은 먹 같은 짙은 회색.
 */
export const MONO_ACCENT = { light: "#d4cfc5", dark: "#2a2927" };

/** 흑백으로 그리는 신화 계열 */
const MONO_PANTHEONS = new Set(["korean"]);

/** 이름에서 얻는 고정 난수 (같은 신은 늘 같은 모습) @param {string} text */
function seedOf(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967296;
}

/**
 * 표에 없는 모습을 이름으로 고르게 섞습니다: 체격, 머리 모양, 싸우는 신의 자세.
 * @param {Figure} figure @param {string} region @param {Record<string, any>} f
 */
function variety(figure, region, f) {
  const r = seedOf(figure.slug);
  const r2 = seedOf(`${figure.slug}:2`);
  const female = f.body === "gown";
  const fighter = f.body === "warrior" || f.body === "giant";
  const eastern = region === "eastAsia";
  return {
    build: 0.92 + r * 0.18,
    hairStyle: female
      ? r2 < 0.5
        ? "long"
        : "braid"
      : eastern && r2 < 0.5
        ? "topknot"
        : r2 > 0.85
          ? "wild"
          : undefined,
    pose:
      fighter && f.pose === "raise" && !f.shield
        ? ["raise", "smite", "charge", "leap"][Math.floor(r2 * 4)]
        : fighter && f.pose === "thrust"
          ? r2 < 0.5
            ? "charge"
            : "thrust"
          : f.pose,
  };
}

const has = (domains, list) => domains.some((d) => list.includes(d));

/**
 * 영역으로 정하는 기본 모습
 * @param {Figure} figure
 * @returns {Partial<SceneSpec> & { f?: Record<string, any>, c?: Record<string, any> }}
 */
function infer(figure) {
  const d = figure.domains;
  const female = /여신|여왕|공주|어머니|여인|여주인|마녀/.test(figure.epithet + figure.summary.slice(0, 30));
  const hero = has(d, ["영웅", "전쟁", "용기", "정복", "힘"]);
  const item = has(d, ["번개", "천둥"])
    ? "bolt"
    : has(d, ["바다", "바닷물"])
      ? "trident"
      : has(d, ["대장장이", "대장장이 기술", "쇠"])
        ? "hammer"
        : has(d, ["사냥", "궁술"])
          ? "spear"
          : has(d, ["전쟁", "영웅", "정복", "용기"])
            ? "sword"
            : has(d, ["불"])
              ? "torch"
              : has(d, ["지혜", "문자", "기록", "가르침", "점술"])
                ? "scroll"
                : has(d, ["음악", "시", "노래"])
                  ? "lyre"
                  : has(d, ["풍요", "농사", "농경", "벼", "벼농사", "옥수수"])
                    ? "sheaf"
                    : has(d, ["치유", "생명", "물", "비"])
                      ? "vase"
                      : has(d, ["저승", "죽음", "저승 안내"])
                        ? "staff"
                        : has(d, ["사랑", "아름다움"])
                          ? "flower"
                          : "orb";
  return {
    thunder: has(d, ["번개", "천둥"]),
    fire: has(d, ["불"]),
    f: {
      body: female ? "gown" : hero ? "warrior" : "robed",
      head: has(d, ["왕권", "신들의 왕", "건국"])
        ? "crown"
        : has(d, ["태양", "해", "빛"])
          ? "sun"
          : has(d, ["달"])
            ? "moon"
            : female
              ? "veil"
              : hero
                ? "helm"
                : "bare",
      beard: !female && !hero,
      hair: female ? "#1a120a" : "#3a2a1a",
      item,
      pose: hero || item === "bolt" ? "raise" : item === "trident" ? "thrust" : "cast",
      shield: hero && item === "sword",
      cape: hero,
    },
  };
}

/**
 * @param {Figure} figure
 * @param {{ aspect: keyof typeof GLOW, legend: boolean }} card
 * @returns {SceneSpec}
 */
export function portraitSpec(figure, { aspect, legend }) {
  const regionKey = PANTHEON_REGION[figure.pantheonSlug] ?? "greek";
  const region = REGIONS[regionKey] ?? REGIONS.greek;
  const icon = ICONS[figure.slug] ?? infer(figure);
  const base = icon.f ?? {};
  const fig = icon.form && icon.form !== "figure" ? base : { ...base, ...variety(figure, regionKey, base) };
  return {
    id: figure.slug,
    form: /** @type {SceneSpec["form"]} */ (icon.form ?? "figure"),
    motif: icon.motif ?? region.motif,
    sky: /** @type {[string, string]} */ (region.sky),
    glow: GLOW[aspect] ?? GLOW.sky,
    skin: icon.skin ?? region.skin,
    accent: MONO_PANTHEONS.has(figure.pantheonSlug) ? MONO_ACCENT.light : undefined,
    // 같은 신화권이라도 신마다 옷 색의 밝기와 기운이 조금씩 다릅니다.
    cloth: icon.cloth ?? tint(region.cloth, figure.slug),
    metal: region.metal,
    legend,
    scale: icon.scale ?? (legend ? 1.12 : 1.04),
    thunder: icon.thunder,
    fire: icon.fire,
    figure: /** @type {any} */ ({ ...fig, ...EXTRAS[figure.slug] }),
    creature: icon.c,
  };
}

export { MONO_PANTHEONS, PANTHEON_REGION, REGIONS };
