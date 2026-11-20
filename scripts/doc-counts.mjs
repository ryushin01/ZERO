/**
 * 문서 속 수량을 데이터에서 다시 씁니다.
 *
 *   pnpm docs:counts   (pnpm sync:ark·pnpm illustrations도 끝에서 부릅니다)
 *
 * Ark 동기화로 인물·유물·그림 수가 바뀌어도 README와 문서의 숫자가 맞도록, 숫자 자리를
 * `<!--count:figures-->475<!--/count-->`처럼 표시해 두고 이 스크립트가 데이터의 값으로 바꿉니다.
 * 표시와 데이터가 어긋나면 doc-counts.test.js가 실패합니다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 수량을 고쳐 쓰는 문서 */
export const DOC_FILES = ["README.md", "docs/card-rules.md", "docs/development.md"];

const MARK = /<!--count:([a-zA-Z]+)-->(\d+)<!--\/count-->/g;

const readJson = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));

/** 데이터에서 센 수량 @returns {Promise<Record<string, number>>} */
export async function countsFromData() {
  const { FIGURES, PANTHEONS } = await import("../src/entities/figure/model/figures.js");
  const { ARMAMENTS } = await import("../src/entities/armament/model/armaments.js");
  const { armamentIdOf } = await import("../src/entities/armament/model/ark.js");
  const relics = readJson("src/entities/armament/data/relics.json");
  const artworks = Object.keys(readJson("src/shared/ui/artwork/artworks.json"));
  const tuned = new Set(ARMAMENTS.filter((arm) => !arm.ark).map((arm) => arm.id));
  return {
    figures: FIGURES.length,
    pantheons: PANTHEONS.length,
    armaments: ARMAMENTS.length,
    tunedArmaments: tuned.size,
    forgedArmaments: ARMAMENTS.length - tuned.size,
    arkRelics: relics.length,
    arkTunedMatches: relics.filter((relic) => tuned.has(/** @type {string} */ (armamentIdOf(relic.slug)))).length,
    arkTreasures: relics.filter((relic) => armamentIdOf(relic.slug) === null).length,
    illustrations: artworks.length,
    figureIllustrations: artworks.filter((key) => key.startsWith("figure:")).length,
    armamentIllustrations: artworks.filter((key) => key.startsWith("arm:")).length,
    arkArt: Object.keys(readJson("src/entities/figure/data/art.json")).length,
    genealogies: readJson("src/entities/figure/data/genealogy.json").length,
  };
}

/**
 * 표시한 자리의 숫자를 바꿉니다. 모르는 이름이 있으면 멈춥니다.
 * @param {string} text @param {Record<string, number>} counts
 */
export function applyCounts(text, counts) {
  return text.replace(MARK, (_, name) => {
    if (!Object.hasOwn(counts, name)) throw new Error(`모르는 수량 이름입니다: ${name}`);
    return `<!--count:${name}-->${counts[name]}<!--/count-->`;
  });
}

/** 문서들의 수량을 다시 씁니다. 바뀐 문서 이름을 돌려줍니다. */
export async function writeDocCounts() {
  const counts = await countsFromData();
  const changed = [];
  for (const file of DOC_FILES) {
    const path = join(root, file);
    const text = readFileSync(path, "utf8");
    const next = applyCounts(text, counts);
    if (next !== text) {
      writeFileSync(path, next);
      changed.push(file);
    }
  }
  return changed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changed = await writeDocCounts();
  console.log(changed.length ? `수량을 고쳤습니다: ${changed.join(", ")}` : "문서의 수량이 데이터와 같습니다.");
}
