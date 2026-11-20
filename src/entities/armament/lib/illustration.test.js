import { describe, expect, it } from "vitest";

import { hasArtwork } from "#shared/ui/artwork/index.js";

import lore from "../data/lore.json" with { type: "json" };
import relics from "../data/relics.json" with { type: "json" };
import { armamentIdOf } from "../model/ark.js";
import { ARMAMENTS, HIDDEN_ARMAMENTS } from "../model/armaments.js";
import { armamentArt } from "./illustration.js";

describe("armamentArt", () => {
  it("히든 무구까지 무구마다 그림이 있습니다", () => {
    const all = [...ARMAMENTS, ...HIDDEN_ARMAMENTS];
    expect(all.filter((arm) => !armamentArt(arm)).map((arm) => arm.id)).toEqual([]);
  });

  it("ZERO가 만든 무구와 Ark에 자료 그림이 있는 유물은 제 그림을 씁니다", () => {
    const tuned = ARMAMENTS.filter((arm) => !arm.ark).map((arm) => arm.id);
    const pictured = relics
      .filter((relic) => /** @type {Record<string, { exhibitId: string | null }>} */ (lore)[relic.slug].exhibitId)
      .map((relic) => armamentIdOf(relic.slug));
    const missing = [...new Set([...tuned, ...pictured])].filter((id) => id && !hasArtwork(`arm:${id}`));
    expect(missing).toEqual([]);
  });

  it("그림이 없는 유물은 첫 번째 주인의 카드 그림을 씁니다", () => {
    const bare = ARMAMENTS.find((arm) => arm.ark && !hasArtwork(`arm:${arm.id}`));
    if (!bare) return;
    expect(armamentArt(bare)?.src).toContain(`figure-${bare.owners[0]}`);
  });
});
