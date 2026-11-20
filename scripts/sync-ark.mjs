/**
 * Ark(세계 신화 도서관)의 목업 데이터를 그대로 가져옵니다: 신화 계열, 신·영웅·몬스터, 유물, 탈것·동반자 짝, 계보, 신화를 빌려 쓴 현대 작품, 대표 자료 이미지.
 *
 *   ARK_DIR=../Ark pnpm sync:ark
 *   SYNC_SUMMARY=summary.md pnpm sync:ark  # 바뀐 내용을 마크다운으로도 씁니다 (자동 동기화 PR 본문)
 *
 * - Ark의 TypeScript 목업을 Node의 타입 지우기로 그대로 읽습니다. (Node 22.18 이상)
 * - 신마다 첫 번째 자료 이미지를 Ark 소장 자료로 쓰며, macOS `sips`로 긴 변 420px JPEG로 줄입니다.
 * - 결과는 src/entities/{figure,armament,bond}/data/*.json 과 public/art/*.jpg 에 씁니다. 결과물을 커밋하므로
 *   Ark 저장소가 없어도 게임은 빌드됩니다.
 * - 첫 화면 묶음을 가볍게 두려고, 카드 상세·도감에서만 보는 긴 글(신 소개, 유물 이야기, 계보, 작품)은 따로 받는 파일에 씁니다.
 * - 카드 그림이 아직 없는 신과 무구에는 Ark 자료의 Commons 그림을 scripts/illustrations/picks.json에 더합니다.
 *   그림 파일은 `pnpm illustrations`가 받습니다. (이미 고른 그림은 건드리지 않음)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { armamentIdOf, formOf } from "../src/entities/armament/model/ark.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arkDir = resolve(root, process.env.ARK_DIR ?? "../Ark");
const entities = join(arkDir, "src/entities");

if (!existsSync(entities)) {
  console.error(`Ark 저장소를 찾지 못했습니다: ${arkDir}\nARK_DIR 환경 변수로 위치를 알려 주세요.`);
  process.exit(1);
}

const load = async (file) => import(pathToFileURL(file).href);

// 탈것·동반자 짝(Ark 0.19.0~)과 유물(Ark 1.1.0~)이 없는 옛 Ark라면 아무것도 쓰기 전에 멈춥니다.
// 그대로 두면 이전 파일이 남아 서로 다른 시점의 데이터가 섞이기 때문입니다.
const bondsFile = join(entities, "figure/model/bonds.ts");
const relicsFile = join(entities, "relic/api/mock-data.ts");
for (const [file, what] of [
  [bondsFile, "탈것·동반자 데이터(Ark 0.19.0 이상)"],
  [relicsFile, "유물 데이터(Ark 1.1.0 이상)"],
]) {
  if (!existsSync(file)) {
    console.error(`Ark에 ${what}가 없습니다: ${file}\n새 Ark를 받은 뒤 다시 실행해 주세요.`);
    process.exit(1);
  }
}

const { MOCK_PANTHEONS } = await load(join(entities, "pantheon/api/mock-data.ts"));
const { MOCK_FIGURES } = await load(join(entities, "figure/api/mock-data.ts"));
const { MOCK_RELICS } = await load(relicsFile);
const { MOCK_GENEALOGIES } = await load(join(entities, "genealogy/api/mock-data.ts"));
const { MOCK_WORKS } = await load(join(entities, "work/api/mock-data.ts"));

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

/** @param {string} file 저장소 맨 위에서 본 경로 */
const readJson = (file, fallback) =>
  existsSync(join(root, file)) ? JSON.parse(readFileSync(join(root, file), "utf8")) : fallback;
/** @param {string} file @param {unknown} value */
const writeJson = (file, value) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), `${JSON.stringify(value, null, 2)}\n`);
};

// 바뀐 내용을 알리려고 이전 결과를 먼저 읽어 둡니다.
const before = {
  pantheons: new Set(readJson("src/entities/figure/data/pantheons.json", []).map((p) => p.slug)),
  figures: new Set(readJson("src/entities/figure/data/figures.json", []).map((f) => f.slug)),
  relics: new Set(readJson("src/entities/armament/data/relics.json", []).map((r) => r.slug)),
  bonds: new Set(readJson("src/entities/bond/data/bonds.json", []).map((b) => `${b.rider}:${b.partner}`)),
};

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

// 소개(summary)는 카드 상세에서만 쓰므로 summaries.json으로 따로 둡니다.
const figures = MOCK_FIGURES.map(({ slug, pantheonSlug, kind, grade, name, nameEn, epithet, domains, order }) => ({
  slug,
  pantheonSlug,
  // 분류(신·영웅·몬스터·그 밖의 존재)와 몬스터 등급(신수·영수·몬스터)
  kind: kind ?? "god",
  grade: grade ?? null,
  name,
  nameEn,
  epithet,
  domains,
  order,
}));
const summaries = Object.fromEntries(MOCK_FIGURES.map((f) => [f.slug, f.summary]));

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

writeJson("src/entities/figure/data/pantheons.json", pantheons);
writeJson("src/entities/figure/data/figures.json", figures);
writeJson("src/entities/figure/data/summaries.json", summaries);
writeJson("src/entities/figure/data/art.json", art);

// 유물: 무구를 만드는 데 쓰는 것(relics.json)과 나머지 기록(lore.json: 영어 이름, 유래·힘·대가·출전, 자료, 순서)을 나눕니다.
// 어느 유물이 어떤 무구가 되는지는 게임 규칙(src/entities/armament/model)이 정하며, 생김새(form)는 여기서 미리 가립니다.
const relics = MOCK_RELICS.map(({ slug, name, nameEn, kind, figureSlugs }) => ({
  slug,
  name,
  kind,
  form: formOf({ slug, name, nameEn, kind }),
  figureSlugs,
}));
const lore = Object.fromEntries(
  MOCK_RELICS.map(({ slug, nameEn, origin, power, price, source, exhibitId, order }) => [
    slug,
    { nameEn, origin, power, price, source, exhibitId: exhibitId ?? null, order },
  ]),
);
writeJson("src/entities/armament/data/relics.json", relics);
writeJson("src/entities/armament/data/lore.json", lore);

// 계보(신화 계열마다 집안 내력)와 신화를 빌려 쓴 현대 작품. 카드 상세와 도감의 계보 탭에서만 쓰므로 따로 받습니다.
// 작품은 Ark가 공개한 것(published)만 씁니다.
const genealogies = MOCK_GENEALOGIES;
const works = MOCK_WORKS.filter((work) => work.status === "published").map(
  ({ slug, title, titleOriginal, medium, year, creator, summary, figureSlugs }) => ({
    slug,
    title,
    titleOriginal,
    medium,
    year,
    creator,
    summary,
    figureSlugs,
  }),
);
writeJson("src/entities/figure/data/genealogy.json", genealogies);
writeJson("src/entities/figure/data/works.json", works);

// 탈것·동반자 짝. 효과는 ZERO의 게임 규칙(entities/bond)에 있고, 짝만 Ark에서 받습니다.
const { BONDS } = await load(bondsFile);
const bonds = BONDS.map(({ rider, partner, relation, note }) => ({
  rider,
  partner,
  relation,
  ...(note ? { note } : {}),
}));
writeJson("src/entities/bond/data/bonds.json", bonds);

// 카드 그림이 아직 없는 신과 무구에 Ark 자료의 Commons 그림을 고릅니다. 초점(pos)은 pnpm illustrations가 찾습니다.
const COMMONS = "https://commons.wikimedia.org/wiki/File:";
/** @param {{ image: { credit: { sourceUrl: string } } } | undefined} exhibit */
const commonsFileOf = (exhibit) => {
  const url = exhibit?.image.credit.sourceUrl ?? "";
  return url.startsWith(COMMONS) ? decodeURIComponent(url.slice(COMMONS.length)).replace(/_/g, " ") : null;
};
const picksFile = "scripts/illustrations/picks.json";
const picks = readJson(picksFile, {});
/** @type {Record<string, [string, { file: string }][]>} */
const additions = { figure: [], arm: [] };
for (const figure of figures) {
  const key = `figure:${figure.slug}`;
  const file = commonsFileOf(MOCK_EXHIBITS.find((e) => e.figureSlug === figure.slug));
  if (!picks[key] && file) additions.figure.push([key, { file }]);
}
for (const relic of MOCK_RELICS) {
  const id = armamentIdOf(relic.slug);
  const key = `arm:${id}`;
  const file = relic.exhibitId ? commonsFileOf(MOCK_EXHIBITS.find((e) => e.id === relic.exhibitId)) : null;
  if (id && !picks[key] && file) additions.arm.push([key, { file }]);
}
// 대상마다 모여 있도록, 같은 갈래의 마지막 그림 바로 뒤에 넣습니다.
const entries = Object.entries(picks);
const merged = {};
entries.forEach(([key, value], i) => {
  merged[key] = value;
  const group = key.split(":")[0];
  if (additions[group] && entries[i + 1]?.[0].split(":")[0] !== group) {
    for (const [k, v] of additions[group]) merged[k] = v;
    delete additions[group];
  }
});
for (const list of Object.values(additions)) for (const [k, v] of list) merged[k] = v;
const newPicks = Object.keys(merged).length - entries.length;
writeJson(picksFile, merged);

// Ark로 옮겨 간 전설 확장이 달라졌을 수 있으므로, 게임이 읽는 전설 확장 파일도 다시 씁니다.
const { writeLegendRuntime } = await import("./legends/runtime.mjs");
writeLegendRuntime();

// 소장 그림과 무구의 출처가 바뀌었을 수 있으므로 출처 목록도 다시 씁니다.
const { writeCredits } = await import("./credits.mjs");
await writeCredits();

const added = {
  pantheons: pantheons.filter((p) => !before.pantheons.has(p.slug)),
  figures: MOCK_FIGURES.filter((f) => !before.figures.has(f.slug)),
  relics: relics.filter((r) => !before.relics.has(r.slug)),
  bonds: bonds.filter((b) => !before.bonds.has(`${b.rider}:${b.partner}`)),
};
const names = (list, limit = 40) =>
  list.length > limit
    ? `${list
        .slice(0, limit)
        .map((x) => x.name)
        .join(", ")} 외 ${list.length - limit}`
    : list.map((x) => x.name).join(", ");
const lines = [
  `- 계열 ${pantheons.length}개${added.pantheons.length ? ` (새 ${added.pantheons.length}: ${names(added.pantheons)})` : ""}`,
  `- 신·영웅·몬스터 ${figures.length}명${added.figures.length ? ` (새 ${added.figures.length}: ${names(added.figures)})` : ""}`,
  `- 유물 ${relics.length}점${added.relics.length ? ` (새 ${added.relics.length}: ${names(added.relics)})` : ""}`,
  `- 탈것·동반자 짝 ${bonds.length}쌍${added.bonds.length ? ` (새 ${added.bonds.length}: ${added.bonds.map((b) => `${b.rider}·${b.partner}`).join(", ")})` : ""}`,
  `- 계보 ${genealogies.length}개 계열, 현대 작품 ${works.length}개`,
  `- Ark 소장 그림 ${Object.keys(art).length}점, 새로 고른 카드·무구 그림 ${newPicks}점`,
];
// Ark에 자료 그림이 없어 카드 그림을 고르지 못한 인물은 서가 그림으로 나오므로, Commons에서 골라 picks.json에 더할 수 있게 알립니다.
const bare = figures.filter((f) => !merged[`figure:${f.slug}`]);
if (bare.length)
  lines.push(`- 카드 그림을 아직 고르지 못한 인물 ${bare.length}명 (Ark에 자료 그림 없음): ${names(bare)}`);
console.log(lines.join("\n"));
if (process.env.SYNC_SUMMARY) writeFileSync(resolve(process.env.SYNC_SUMMARY), `${lines.join("\n")}\n`);
