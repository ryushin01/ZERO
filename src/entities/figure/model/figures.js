import artData from "../data/art.json" with { type: "json" };
import figureData from "../data/figures.json" with { type: "json" };
import pantheonData from "../data/pantheons.json" with { type: "json" };

/**
 * @typedef {"asia" | "europe" | "africa" | "americas" | "oceania"} Continent
 * @typedef {{ slug: string, name: string, nameEn: string, region: string, continent: Continent, eraLabel: string, eraYear: number, summary: string }} Pantheon
 * @typedef {{ slug: string, pantheonSlug: string, name: string, nameEn: string, epithet: string, domains: string[], summary: string, order: number }} Figure
 * @typedef {{ artist: string, license: string, licenseUrl: string | null, sourceUrl: string }} Credit
 * @typedef {{ src: string, title: string, alt: string, holder: string | null, dateLabel: string | null, credit: Credit }} Art
 */

/** Ark에서 가져온 신화 계열 (오래된 문헌 순) */
export const PANTHEONS = /** @type {Pantheon[]} */ (pantheonData);
/** Ark에서 가져온 신과 영웅 */
export const FIGURES = /** @type {Figure[]} */ (figureData);
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
