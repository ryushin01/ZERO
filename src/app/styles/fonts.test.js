// @vitest-environment node
import { execFileSync } from "node:child_process";

import { expect, test } from "vitest";

test("화면 글자 파일에 소스의 한글·기호가 모두 들어 있습니다 (빠졌으면 pnpm fonts)", () => {
  const output = execFileSync("node", ["scripts/build-fonts.mjs", "--check"], { encoding: "utf8" });
  expect(output).toContain("OK");
});
