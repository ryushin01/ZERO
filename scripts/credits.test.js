import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { CREDITS_FILE, renderCredits } from "./credits.mjs";

describe("출처 목록 (docs/credits.md)", () => {
  it("데이터에서 만든 목록과 같습니다. 다르면 pnpm credits로 다시 만듭니다", async () => {
    expect(readFileSync(CREDITS_FILE, "utf8")).toBe(await renderCredits());
  });

  it("Ark 소장 그림마다 사용 허락과 원본 링크를 적습니다", async () => {
    const doc = await renderCredits();
    const ark = doc.slice(doc.indexOf("## Ark 소장 그림"), doc.indexOf("## 무구 고증 자료"));
    const rows = ark.split("\n").filter((line) => line.includes("[Wikimedia Commons]("));
    const art = JSON.parse(readFileSync(join(dirname(CREDITS_FILE), "../src/entities/figure/data/art.json"), "utf8"));
    expect(rows).toHaveLength(Object.keys(art).length);
    for (const row of rows) expect(row.split(" | ")).toHaveLength(5);
  });

  it("게임 그림마다 저작자와 사용 허락, 원본을 적습니다", async () => {
    const doc = await renderCredits();
    const game = doc.slice(doc.indexOf("## 카드·괴물·전장·무구 그림"), doc.indexOf("## Ark 소장 그림"));
    const rows = game.split("\n").filter((line) => line.includes("[Wikimedia Commons]("));
    const picks = JSON.parse(readFileSync(join(dirname(CREDITS_FILE), "../scripts/illustrations/picks.json"), "utf8"));
    expect(rows).toHaveLength(Object.keys(picks).length);
    for (const row of rows) {
      const [, , , license] = row.split(" | ");
      expect(license).toMatch(/퍼블릭 도메인|CC0|CC BY|제한 없음/);
    }
  });
});
