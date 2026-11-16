// @vitest-environment node
import { execFileSync } from "node:child_process";

import { expect, test } from "vitest";

// 글꼴 도구를 새 프로세스로 띄우므로, 다른 테스트와 함께 돌아 느릴 때도 넉넉히 기다립니다.
test("화면 글자 파일에 소스의 한글·기호가 모두 들어 있습니다 (빠졌으면 pnpm fonts)", { timeout: 30_000 }, () => {
  const output = execFileSync("node", ["scripts/build-fonts.mjs", "--check"], { encoding: "utf8" });
  expect(output).toContain("OK");
});
