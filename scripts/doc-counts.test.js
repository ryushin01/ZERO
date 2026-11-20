import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { applyCounts, countsFromData, DOC_FILES } from "./doc-counts.mjs";

describe("문서 속 수량", () => {
  it("README와 문서에 표시한 수량이 데이터와 같습니다. 다르면 pnpm docs:counts로 고칩니다", async () => {
    const counts = await countsFromData();
    for (const file of DOC_FILES) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      expect(applyCounts(text, counts), file).toBe(text);
    }
  });

  it("README의 Ark에 따라 바뀌는 수량은 모두 표시해 둡니다", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    for (const name of ["figures", "pantheons", "armaments", "illustrations", "arkArt", "genealogies"])
      expect(readme, name).toContain(`<!--count:${name}-->`);
  });

  it("모르는 수량 이름은 멈춥니다", () => {
    expect(() => applyCounts("<!--count:nothing-->1<!--/count-->", {})).toThrow("nothing");
  });
});
