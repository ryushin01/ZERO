// @vitest-environment node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import { ARMAMENTS, HIDDEN_ARMAMENTS } from "../../../entities/armament/index.js";
import { BATTLEFIELDS } from "../../../entities/battlefield/index.js";
import { BASIC_CARDS, FIGURE_CARDS, HIDDEN_CARDS } from "../../../entities/card/index.js";
import { RELICS } from "../../../entities/relic/index.js";

/**
 * 이름 글꼴(zero-names.woff2)은 카드·무구·유물·전장 이름에 쓰인 글자만 담은 함렛 600입니다.
 * 이름이 바뀌어 새 글자가 생기면 이 테스트가 실패합니다. 다시 만드는 방법:
 *   UPDATE_NAME_FONT=1 pnpm exec vitest run name-font
 *   pnpm subset:name-font
 */
const CHARS_FILE = join(process.cwd(), "src/app/styles/fonts/zero-names.chars.txt");

function charsOf(names) {
  const chars = new Set();
  for (const name of names) for (const ch of name) if (ch.trim()) chars.add(ch);
  return [...chars].sort().join("");
}

test("이름 글꼴에 모든 카드·무구·유물·전장 이름의 글자가 들어 있습니다", () => {
  const names = [
    ...BASIC_CARDS,
    ...FIGURE_CARDS,
    ...HIDDEN_CARDS,
    ...ARMAMENTS,
    ...HIDDEN_ARMAMENTS,
    ...RELICS,
    ...BATTLEFIELDS,
  ].map((item) => item.name);
  expect(names.length).toBeGreaterThan(300);
  const expected = charsOf(names);
  if (process.env.UPDATE_NAME_FONT) writeFileSync(CHARS_FILE, `${expected}\n`);
  const covered = new Set(readFileSync(CHARS_FILE, "utf8").trim());
  const missing = [...expected].filter((ch) => !covered.has(ch));
  expect(missing.join("")).toBe("");
});
