import { describe, expect, it } from "vitest";

import { createRng } from "#shared/lib/index.js";

import { createRun, guideOptions } from "../model/run.js";

import { autoRun } from "./autoplay.js";

/**
 * 단순한 자동 플레이어로 100판을 둡니다. 사람은 공명과 천적을 노려 더 잘 두므로,
 * 봇의 승률이 너무 높으면 쉬운 것이고 0에 가까우면 사람에게도 벽입니다.
 */
describe("난이도", () => {
  it("자동 플레이어의 승률이 3%에서 40% 사이이고, 1장 보스에서 절반 넘게 쓰러지지 않습니다", () => {
    let wins = 0;
    let firstAct = 0;
    const runs = 100;
    for (let seed = 1; seed <= runs; seed += 1) {
      const rng = createRng(seed * 31);
      const run = autoRun(createRun({ seed, guide: guideOptions(seed)[seed % 3].slug }), () => rng.float());
      if (run.phase === "victory") wins += 1;
      if (run.phase === "defeat" && run.act === 1) firstAct += 1;
    }
    expect(wins / runs).toBeGreaterThanOrEqual(0.03);
    expect(wins / runs).toBeLessThanOrEqual(0.4);
    expect(firstAct / runs).toBeLessThan(0.5);
    // 100판을 끝까지 두므로, 다른 테스트와 함께 돌 때를 생각해 시간을 넉넉히 줍니다.
  }, 60_000);
});
