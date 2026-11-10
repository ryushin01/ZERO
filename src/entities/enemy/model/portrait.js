import { MONO_ACCENT, REGIONS } from "#entities/figure/@x/enemy.js";
import { mix } from "#shared/ui/illustration/index.js";

/**
 * 괴물의 일러스트 사양. 신과 같은 화풍으로, 기운은 불길한 색을 씁니다.
 * @typedef {import("#shared/ui/illustration/index.js").SceneSpec} SceneSpec
 */

/** @type {Record<string, { region: keyof typeof REGIONS, glow: string, skin?: string, mono?: boolean } & Partial<SceneSpec> & { f?: Record<string, any>, c?: Record<string, any> }>} */
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
    f: { body: "warrior", head: "helm", item: "sword", pose: "charge", shield: true },
  },
  dokkaebi: {
    region: "eastAsia",
    mono: true,
    glow: "#ff8a6a",
    skin: "#a8462a",
    f: { body: "demon", head: "demon", hair: "#1a120a", item: "club", pose: "raise" },
  },
  minotaur: {
    region: "greek",
    glow: "#ff7a3a",
    skin: "#5a3a26",
    f: { body: "giant", head: "horned", hair: "#2a1a10", item: "doubleaxe", pose: "smite" },
  },
  hydra: { region: "greek", glow: "#b8f08a", c: { heads: 7, scale: "#3a5a2a" }, form: "serpent" },
  oni: {
    region: "eastAsia",
    glow: "#ff6a4a",
    skin: "#9a2a22",
    f: { body: "giant", head: "demon", hair: "#1a120a", item: "club", pose: "smite", hairStyle: "wild" },
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
    f: { body: "giant", head: "horned", beard: true, hair: "#e8f0f8", item: "club", pose: "smite", build: 1.1 },
  },
  tzitzimitl: {
    region: "americas",
    glow: "#b48aff",
    skin: "#d9d2bf",
    f: { body: "demon", head: "feathers", item: "none", pose: "raise", wings: "dark" },
  },
  rahu: { region: "india", glow: "#ffd27a", form: "head" },
  imugi: { mono: true, region: "eastAsia", glow: "#7af0d6", form: "serpent", c: { heads: 1, scale: "#2a4a4a" } },
  fenrir: { region: "north", glow: "#9fd4ff", form: "beast", c: { beast: "wolf", chained: true } },
  grendel: {
    region: "north",
    glow: "#7af0d6",
    skin: "#4a5048",
    f: { body: "giant", head: "demon", hair: "#1a120a", item: "none", pose: "charge", hairStyle: "wild", build: 1.1 },
  },
  cyclops: {
    region: "greek",
    glow: "#ffb35c",
    skin: "#8a6a4a",
    f: { body: "giant", head: "cyclops", beard: true, hair: "#2a1a10", item: "club", pose: "smite", build: 1.08 },
  },
  fafnir: { region: "north", glow: "#b8f08a", form: "serpent", c: { heads: 1, scale: "#6a5a1a", wings: true } },
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
    // 괴물은 신보다 어두운 배경으로 불길하게 둡니다.
    // 한국 민담의 괴물(도깨비, 이무기)은 흑백으로 둡니다.
    accent: m.mono ? MONO_ACCENT.dark : mix((m.sky ?? region.sky)[1], "#000000", 0.45),
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
