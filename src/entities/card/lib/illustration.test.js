import { describe, expect, it } from "vitest";

import { hasArtwork } from "#shared/ui/artwork/index.js";

import { BASIC_CARDS, FIGURE_CARDS } from "../model/build.js";
import { HIDDEN_CARDS } from "../model/hidden.js";
import { cardArt } from "./illustration.js";

describe("cardArt", () => {
  it("신·영웅·괴물 카드와 사서의 기본 카드마다 제 그림이 있습니다", () => {
    const missing = [
      ...FIGURE_CARDS.map((card) => `figure:${card.figureSlug}`),
      ...BASIC_CARDS.map((card) => `card:${card.id}`),
    ].filter((key) => !hasArtwork(key));
    expect(missing).toEqual([]);
  });

  it("카드마다 자기 그림을 쓰고, 히든 카드는 허락받은 그림 파일을 씁니다", () => {
    const odin = FIGURE_CARDS.find((card) => card.figureSlug === "odin");
    expect(cardArt(/** @type {any} */ (odin)).src).toBe("/illust/l/figure-odin.webp");
    expect(cardArt(HIDDEN_CARDS[0]).src).toBe("/art/hidden/yushin.jpg");
  });

  it("그림이 아직 없는 새 카드는 서가 그림으로 둡니다", () => {
    const fresh = { ...BASIC_CARDS[0], id: "new", figureSlug: "nobody" };
    expect(cardArt(/** @type {any} */ (fresh)).src).toBe("/illust/l/card-shelf.webp");
  });
});
