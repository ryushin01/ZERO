import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { renderLegendRuntime, RUNTIME_FILE, SOURCE_FILE } from "./runtime.mjs";

describe("전설 확장 (게임이 읽는 파일)", () => {
  it("원본과 Ark 데이터에서 만든 내용과 같습니다. 다르면 pnpm legends로 다시 만듭니다", () => {
    expect(readFileSync(RUNTIME_FILE, "utf8")).toBe(renderLegendRuntime());
  });

  it("Ark로 옮겨 간 인물은 희귀도만 남겨, 소개 문단 같은 원본 전체를 싣지 않습니다", () => {
    const source = JSON.parse(readFileSync(SOURCE_FILE, "utf8"));
    const runtime = JSON.parse(readFileSync(RUNTIME_FILE, "utf8"));
    expect(Object.keys(runtime.rarity).length + runtime.figures.length).toBe(source.figures.length);
    expect(readFileSync(RUNTIME_FILE).length).toBeLessThan(readFileSync(SOURCE_FILE).length / 4);
  });
});
