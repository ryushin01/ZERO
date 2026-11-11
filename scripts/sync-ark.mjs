/**
 * Ark(세계 신화 도서관)의 목업 데이터에서 신화 계열, 신과 영웅, 대표 자료 이미지를 가져옵니다.
 *
 *   ARK_DIR=../Ark pnpm sync:ark
 *
 * - Ark의 TypeScript 목업을 Node의 타입 지우기로 그대로 읽습니다. (Node 22.18 이상)
 * - 신마다 첫 번째 자료 이미지를 카드 그림으로 쓰며, macOS `sips`로 긴 변 420px JPEG로 줄입니다.
 * - 결과는 src/entities/figure/data/*.json 과 public/art/*.jpg 에 씁니다. 결과물을 커밋하므로
 *   Ark 저장소가 없어도 게임은 빌드됩니다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arkDir = resolve(root, process.env.ARK_DIR ?? "../Ark");
const entities = join(arkDir, "src/entities");

if (!existsSync(entities)) {
  console.error(`Ark 저장소를 찾지 못했습니다: ${arkDir}\nARK_DIR 환경 변수로 위치를 알려 주세요.`);
  process.exit(1);
}

const load = async (file) => import(pathToFileURL(file).href);

const { MOCK_PANTHEONS } = await load(join(entities, "pantheon/api/mock-data.ts"));
const { MOCK_FIGURES } = await load(join(entities, "figure/api/mock-data.ts"));

// 자료 목업은 JSON을 속성 없이 가져오므로, 임시 사본에서 import 속성을 붙여 읽습니다.
const exhibitFile = join(entities, "exhibit/api/mock-data.ts");
const commonsFile = join(entities, "exhibit/api/mock/commons-images.json");
const temp = mkdtempSync(join(tmpdir(), "zero-sync-"));
const patched = join(temp, "exhibits.ts");
writeFileSync(
  patched,
  readFileSync(exhibitFile, "utf8").replace(
    /import commonsImages from "[^"]+";/,
    `import commonsImages from ${JSON.stringify(pathToFileURL(commonsFile).href)} with { type: "json" };`,
  ),
);
const { MOCK_EXHIBITS } = await load(patched);
rmSync(temp, { recursive: true, force: true });

const pantheons = MOCK_PANTHEONS.map(({ slug, name, nameEn, region, continent, eraLabel, eraYear, summary }) => ({
  slug,
  name,
  nameEn,
  region,
  continent,
  eraLabel,
  eraYear,
  summary,
})).sort((a, b) => a.eraYear - b.eraYear);

const figures = MOCK_FIGURES.map(
  ({ slug, pantheonSlug, kind, grade, name, nameEn, epithet, domains, summary, order }) => ({
    slug,
    pantheonSlug,
    // 분류(신·영웅·몬스터·그 밖의 존재)와 몬스터 등급(신수·영수·몬스터)
    kind: kind ?? "god",
    grade: grade ?? null,
    name,
    nameEn,
    epithet,
    domains,
    summary,
    order,
  }),
);

const artDir = join(root, "public/art");
mkdirSync(artDir, { recursive: true });

const art = {};
for (const figure of figures) {
  const exhibit = MOCK_EXHIBITS.find((e) => e.figureSlug === figure.slug);
  if (!exhibit) continue;
  const source = join(arkDir, "public", exhibit.image.src);
  const target = join(artDir, `${figure.slug}.jpg`);
  if (!existsSync(target)) {
    execFileSync(
      "sips",
      ["-s", "format", "jpeg", "-s", "formatOptions", "60", "--resampleHeightWidthMax", "420", source, "--out", target],
      {
        stdio: "ignore",
      },
    );
  }
  art[figure.slug] = {
    src: `/art/${figure.slug}.jpg`,
    title: exhibit.title,
    alt: exhibit.image.alt,
    holder: exhibit.holder,
    dateLabel: exhibit.dateLabel,
    credit: exhibit.image.credit,
  };
}

const dataDir = join(root, "src/entities/figure/data");
mkdirSync(dataDir, { recursive: true });
const write = (name, value) => writeFileSync(join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`);
write("pantheons.json", pantheons);
write("figures.json", figures);
write("art.json", art);

console.log(`계열 ${pantheons.length}, 신 ${figures.length}, 그림 ${Object.keys(art).length}점을 가져왔습니다.`);
