import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** ZERO의 버전은 1.2.3으로 고정합니다. 기능이 바뀌어도 버전은 올리지 않습니다. (docs/development.md의 '버전') */
const FIXED = "1.2.3";

/** 테스트는 저장소 맨 위에서 돕니다. @param {string} path */
const read = (path) => readFileSync(join(process.cwd(), path), "utf8");

describe("고정 버전", () => {
  it("package.json과 README 배지의 버전이 1.2.3입니다", () => {
    expect(JSON.parse(read("package.json")).version).toBe(FIXED);
    expect(read("README.md")).toContain(`badge/version-${FIXED}-`);
  });

  it("변경 기록은 1.2.3 항목 위로 버전 대신 날짜 제목만 씁니다", () => {
    const headings = read("CHANGELOG.md")
      .split("\n")
      .filter((line) => line.startsWith("## "));
    const fixedAt = headings.findIndex((line) => line.startsWith(`## ${FIXED} `));
    expect(fixedAt).toBeGreaterThanOrEqual(0);
    for (const line of headings.slice(0, fixedAt)) expect(line).toMatch(/^## \d{4}-\d{2}-\d{2}/);
  });
});
