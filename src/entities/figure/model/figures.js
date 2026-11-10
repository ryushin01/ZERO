import artData from "../data/art.json" with { type: "json" };
import figureData from "../data/figures.json" with { type: "json" };
import legendData from "../data/legends.json" with { type: "json" };
import pantheonData from "../data/pantheons.json" with { type: "json" };

/**
 * @typedef {"asia" | "europe" | "africa" | "americas" | "oceania"} Continent
 * @typedef {{ slug: string, name: string, nameEn: string, region: string, continent: Continent, eraLabel: string, eraYear: number, summary: string }} Pantheon
 * @typedef {"ark" | "zero"} Source Ark에서 가져온 기록인지, ZERO가 더한 전설 확장인지
 * @typedef {{
 *   slug: string, pantheonSlug: string, name: string, nameEn: string, epithet: string, domains: string[], summary: string, order: number,
 *   source?: Source, rarity?: "common" | "rare" | "legend", description?: string[], wiki?: string,
 * }} Figure
 * @typedef {{ artist: string, license: string, licenseUrl: string | null, sourceUrl: string }} Credit
 * @typedef {{ src: string, title: string, alt: string, holder: string | null, dateLabel: string | null, credit: Credit }} Art
 */

const arkPantheonSlugs = new Set(/** @type {Pantheon[]} */ (pantheonData).map((p) => p.slug));
const arkFigureSlugs = new Set(/** @type {Figure[]} */ (figureData).map((f) => f.slug));
/** 전설 확장에서 Ark로 옮겨 간 인물은 희귀도만 전설 확장의 것을 따릅니다. */
const legendRarity = new Map(/** @type {Figure[]} */ (legendData.figures).map((f) => [f.slug, f.rarity]));

/**
 * 신화 계열: Ark에서 가져온 계열(오래된 문헌 순) 뒤에, 아직 Ark에 없는 ZERO 전설 확장의 계열을 붙입니다.
 * @type {(Pantheon & { source?: Source, wiki?: string })[]}
 */
export const PANTHEONS = [
  .../** @type {Pantheon[]} */ (pantheonData).map((p) => ({ ...p, source: /** @type {Source} */ ("ark") })),
  .../** @type {Pantheon[]} */ (legendData.pantheons)
    .filter((p) => !arkPantheonSlugs.has(p.slug))
    .map((p) => ({ ...p, source: /** @type {Source} */ ("zero") })),
];

/**
 * 신과 영웅: Ark의 기록 뒤에 ZERO 전설 확장(아서왕 전설, 인도 서사시의 영웅 등)을 붙입니다.
 * 전설 확장은 Ark와 같은 모양으로 두어, 나중에 Ark로 그대로 옮길 수 있습니다.
 * @type {Figure[]}
 */
export const FIGURES = [
  .../** @type {Figure[]} */ (figureData).map((f) => ({
    ...f,
    rarity: legendRarity.get(f.slug),
    source: /** @type {Source} */ ("ark"),
  })),
  .../** @type {Figure[]} */ (legendData.figures)
    .filter((f) => !arkFigureSlugs.has(f.slug))
    .map((f) => ({ ...f, source: /** @type {Source} */ ("zero") })),
];

/** Ark에서 가져온 신과 영웅의 수 */
export const ARK_FIGURE_COUNT = figureData.length;
const ART = /** @type {Record<string, Art>} */ (artData);

export const CONTINENTS = /** @type {const} */ (["asia", "europe", "africa", "americas", "oceania"]);

/** @type {Record<Continent, string>} */
export const CONTINENT_LABEL = {
  asia: "아시아",
  europe: "유럽",
  africa: "아프리카",
  americas: "아메리카",
  oceania: "오세아니아",
};

const pantheonBySlug = new Map(PANTHEONS.map((p) => [p.slug, p]));
const figureBySlug = new Map(FIGURES.map((f) => [f.slug, f]));

/** @param {string} slug */
export const getPantheon = (slug) => pantheonBySlug.get(slug);
/** @param {string} slug */
export const getFigure = (slug) => figureBySlug.get(slug);
/** 카드 그림. 자료가 없는 신은 undefined @param {string} slug */
export const getArt = (slug) => ART[slug];
/** @param {string} pantheonSlug */
export const figuresOf = (pantheonSlug) =>
  FIGURES.filter((f) => f.pantheonSlug === pantheonSlug).sort((a, b) => a.order - b.order);
