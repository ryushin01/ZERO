/**
 * 도감 거르기. 이름(한글·영문), 별칭, 관장 영역, 신화 계열 이름에서 찾습니다.
 * @typedef {import("#entities/card/index.js").CardDef} CardDef
 */
import { getPantheon } from "#entities/figure/index.js";

/**
 * @param {CardDef[]} cards
 * @param {{ query?: string, continent?: string, aspect?: string, seenOnly?: boolean, seen?: string[] }} filters
 */
export function filterCards(cards, { query = "", continent = "all", aspect = "all", seenOnly = false, seen = [] }) {
  const q = query.trim().toLowerCase();
  return cards.filter((card) => {
    if (seenOnly && !seen.includes(card.id)) return false;
    if (continent !== "all" && card.continent !== continent) return false;
    if (aspect !== "all" && card.aspect !== aspect && card.secondary !== aspect) return false;
    if (!q) return true;
    const pantheon = card.pantheonSlug ? (getPantheon(card.pantheonSlug)?.name ?? "") : "";
    return [card.name, card.nameEn, card.epithet, pantheon, ...card.domains].some((text) =>
      text.toLowerCase().includes(q),
    );
  });
}
