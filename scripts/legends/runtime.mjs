/**
 * 전설 확장 원본(scripts/legends/legends.json)에서 게임이 실행 중에 쓰는 것만 골라
 * src/entities/figure/data/legends.json 에 씁니다.
 *
 *   pnpm legends
 *
 * - Ark에 아직 없는 계열과 인물: 모든 필드(소개 문단·위키 주소 포함)
 * - Ark로 옮겨 간 인물: 희귀도만 (Ark의 순서로 정하면 아킬레우스 같은 영웅이 일반 카드가 되기 때문입니다)
 *
 * 원본 전체(149명의 소개 문단 등, 약 70 KB)를 첫 화면 묶음에 싣지 않으려는 것입니다.
 * `pnpm sync:ark`도 끝에서 이 파일을 다시 만듭니다. 원본이나 Ark 데이터와 어긋나면 runtime.test.js가 실패합니다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** 전설 확장 원본 */
export const SOURCE_FILE = join(root, "scripts/legends/legends.json");
/** 게임이 읽는 파일 */
export const RUNTIME_FILE = join(root, "src/entities/figure/data/legends.json");

/** @param {string} path */
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** 게임이 읽는 파일의 내용 @returns {string} */
export function renderLegendRuntime() {
  const source = readJson(SOURCE_FILE);
  const arkFigures = new Set(readJson(join(root, "src/entities/figure/data/figures.json")).map((f) => f.slug));
  const arkPantheons = new Set(readJson(join(root, "src/entities/figure/data/pantheons.json")).map((p) => p.slug));
  /** @type {Record<string, string>} */
  const rarity = {};
  for (const figure of source.figures) if (arkFigures.has(figure.slug)) rarity[figure.slug] = figure.rarity;
  const runtime = {
    pantheons: source.pantheons.filter((p) => !arkPantheons.has(p.slug)),
    figures: source.figures.filter((f) => !arkFigures.has(f.slug)),
    rarity,
  };
  return `${JSON.stringify(runtime, null, 2)}\n`;
}

export function writeLegendRuntime() {
  const text = renderLegendRuntime();
  writeFileSync(RUNTIME_FILE, text);
  return JSON.parse(text);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pantheons, figures, rarity } = writeLegendRuntime();
  console.log(
    `Ark에 없는 계열 ${pantheons.length}, 인물 ${figures.length}, Ark로 옮겨 간 인물의 희귀도 ${Object.keys(rarity).length}개를 썼습니다.`,
  );
}
