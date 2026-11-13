import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { CREDITS_FILE, renderCredits } from "./credits.mjs";

describe("출처 목록 (docs/credits.md)", () => {
  it("데이터에서 만든 목록과 같습니다. 다르면 pnpm credits로 다시 만듭니다", async () => {
    expect(readFileSync(CREDITS_FILE, "utf8")).toBe(await renderCredits());
  });

  it("Ark 소장 그림마다 사용 허락과 원본 링크를 적습니다", async () => {
    const rows = (await renderCredits()).split("\n").filter((line) => line.includes("[Wikimedia Commons]("));
    const art = JSON.parse(readFileSync(join(dirname(CREDITS_FILE), "../src/entities/figure/data/art.json"), "utf8"));
    expect(rows).toHaveLength(Object.keys(art).length);
    for (const row of rows) expect(row.split(" | ")).toHaveLength(5);
  });
});
