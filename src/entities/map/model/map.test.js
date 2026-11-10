import { describe, expect, it } from "vitest";

import { FLOORS, generateMap, LANES, reachableNodes } from "./map.js";

describe("generateMap", () => {
  const map = generateMap(1, 1234);

  it("층마다 세 칸, 마지막에 보스 하나", () => {
    expect(map.rows).toHaveLength(FLOORS + 1);
    for (const row of map.rows.slice(0, FLOORS)) expect(row).toHaveLength(LANES);
    expect(map.rows[FLOORS]).toEqual([expect.objectContaining({ type: "boss" })]);
  });

  it("첫 층은 전투, 보스 앞 층은 쉼터", () => {
    expect(map.rows[0].every((n) => n.type === "battle")).toBe(true);
    expect(map.rows[FLOORS - 1].every((n) => n.type === "rest")).toBe(true);
  });

  it("모든 칸에서 보스까지 갈 수 있습니다", () => {
    for (const row of map.rows.slice(0, FLOORS)) {
      for (const node of row) expect(reachableNodes(map, node).length).toBeGreaterThan(0);
    }
  });

  it("같은 시드는 같은 지도", () => {
    expect(generateMap(2, 99)).toEqual(generateMap(2, 99));
  });
});
