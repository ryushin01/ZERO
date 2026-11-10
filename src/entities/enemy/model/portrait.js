import { REGIONS } from "#entities/figure/@x/enemy.js";

/**
 * 괴물의 일러스트 사양. 신과 같은 화풍으로, 기운은 불길한 색을 씁니다.
 * @typedef {import("#shared/ui/illustration/index.js").SceneSpec} SceneSpec
 */

/** @type {Record<string, { region: keyof typeof REGIONS, glow: string, skin?: string } & Partial<SceneSpec> & { f?: Record<string, any>, c?: Record<string, any> }>} */
const MONSTERS = {
  harpy: {
    region: "greek",
    glow: "#9fe0ff",
    f: { body: "hag", head: "hag", item: "none", pose: "raise", wings: "dark" },
  },
  kappa: {
    region: "eastAsia",
    glow: "#7af0d6",
    skin: "#4f7a3a",
    f: { body: "demon", head: "demon", hair: "#2a3a2a", item: "none", pose: "cast", cape: true },
  },
  draugr: {
    region: "north",
    glow: "#9fd4ff",
    skin: "#6a7a80",
    f: { body: "warrior", head: "helm", item: "sword", pose: "raise", shield: true },
  },
  dokkaebi: {
    region: "eastAsia",
    glow: "#ff8a6a",
    skin: "#a8462a",
    f: { body: "demon", head: "demon", hair: "#1a120a", item: "club", pose: "raise" },
  },
  minotaur: {
    region: "greek",
    glow: "#ff7a3a",
    skin: "#5a3a26",
    f: { body: "giant", head: "horned", hair: "#2a1a10", item: "doubleaxe", pose: "raise" },
  },
  hydra: { region: "greek", glow: "#b8f08a", c: { heads: 5, scale: "#3a5a2a" }, form: "serpent" },
  oni: {
    region: "eastAsia",
    glow: "#ff6a4a",
    skin: "#9a2a22",
    f: { body: "giant", head: "demon", hair: "#1a120a", item: "club", pose: "raise" },
  },
  rakshasa: {
    region: "india",
    glow: "#b48aff",
    skin: "#3a4a5a",
    f: { body: "demon", head: "demon", hair: "#1a120a", item: "sword", pose: "thrust", arms: 4 },
  },
  gumiho: { region: "eastAsia", glow: "#ffd27a", form: "beast", c: { beast: "fox", tails: 9 } },
  girtablullu: {
    region: "nearEast",
    glow: "#ffb35c",
    form: "scorpion",
    f: { head: "helm", item: "spear", pose: "thrust" },
  },
  ammit: { region: "egypt", glow: "#ff7a3a", form: "beast", c: { beast: "ammit" } },
  apep: { region: "egypt", glow: "#b48aff", form: "serpent", c: { heads: 1, scale: "#3a2a4a" } },
  jotunn: {
    region: "north",
    glow: "#9fd4ff",
    skin: "#8aa4b8",
    f: { body: "giant", head: "horned", beard: true, hair: "#e8f0f8", item: "club", pose: "raise" },
  },
  tzitzimitl: {
    region: "americas",
    glow: "#b48aff",
    skin: "#d9d2bf",
    f: { body: "demon", head: "feathers", item: "none", pose: "raise", wings: "dark" },
  },
  rahu: { region: "india", glow: "#ffd27a", form: "head" },
  imugi: { region: "eastAsia", glow: "#7af0d6", form: "serpent", c: { heads: 1, scale: "#2a4a4a" } },
  fenrir: { region: "north", glow: "#9fd4ff", form: "beast", c: { beast: "wolf" } },
  zero: { region: "greek", glow: "#f4efe0", form: "void", sky: ["#000000", "#0b0806"] },
};

/** @param {string} id @param {"normal" | "elite" | "boss"} tier @returns {SceneSpec} */
export function monsterSpec(id, tier) {
  const m = MONSTERS[id] ?? MONSTERS.draugr;
  const region = REGIONS[m.region];
  return {
    id: `monster-${id}`,
    form: /** @type {SceneSpec["form"]} */ (m.form ?? "figure"),
    motif: region.motif,
    sky: /** @type {[string, string]} */ (m.sky ?? region.sky),
    glow: m.glow,
    skin: m.skin ?? region.skin,
    cloth: region.cloth,
    metal: region.metal,
    scale: tier === "boss" ? 1.14 : tier === "elite" ? 1.08 : 1,
    legend: tier !== "normal",
    figure: m.f,
    creature: m.c,
  };
}
