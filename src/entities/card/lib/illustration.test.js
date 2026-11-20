import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { hasArtwork } from "#shared/ui/artwork/index.js";

import { BASIC_CARDS, FIGURE_CARDS } from "../model/build.js";
import { HIDDEN_CARDS } from "../model/hidden.js";
import { cardArt } from "./illustration.js";

/** Ark 소장 자료(신마다 첫 번째 자료). 첫 화면 묶음 밖의 파일이라 테스트에서는 직접 읽습니다. 테스트는 저장소 맨 위에서 돕니다. */
const arkArt = JSON.parse(readFileSync(join(process.cwd(), "src/entities/figure/data/art.json"), "utf8"));

describe("cardArt", () => {
  it("Ark에 자료 그림이 있는 신·영웅·괴물과 사서의 기본 카드는 모두 제 그림이 있습니다", () => {
    // Ark에 자료 그림이 있으면 pnpm sync:ark가 카드 그림으로 골라 두므로 빠질 수 없습니다.
    // 자료 그림이 없는 새 인물은 Commons에서 손으로 고를 때까지 서가 그림으로 두고, 동기화 요약에 이름이 남습니다.
    const missing = [
      ...FIGURE_CARDS.filter((card) => Object.hasOwn(arkArt, /** @type {string} */ (card.figureSlug))).map(
        (card) => `figure:${card.figureSlug}`,
      ),
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
