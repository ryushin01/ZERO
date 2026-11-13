/**
 * 출처 전체 목록(docs/credits.md)을 데이터에서 만듭니다.
 *
 *   pnpm credits
 *
 * 화면에는 출처를 적지 않고 README의 출처 표와 이 목록에 모읍니다.
 * 게임 그림(scripts/illustrations/credits.json), Ark 소장 그림(art.json), 무구의 고증 자료(sources),
 * 전장의 소개 자료(source)가 바뀌면 다시 만들어야 하며, `pnpm illustrations`와 `pnpm sync:ark`도 끝에서 이 목록을 다시 씁니다.
 * 데이터와 목록이 어긋나면 credits.test.js가 실패합니다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CREDITS_FILE = join(root, "docs/credits.md");
const ILLUSTRATION_CREDITS = "scripts/illustrations/credits.json";

const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

/** 표 칸에 넣을 글: 줄바꿈과 세로 막대를 풉니다. @param {unknown} text */
const cell = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();

const LICENSE_LABEL = {
  "Public domain": "퍼블릭 도메인",
  "No restrictions": "제한 없음",
  "Copyrighted free use": "자유 이용 허락",
};

/** @param {{ license: string, licenseUrl: string | null }} credit */
const license = ({ license, licenseUrl }) => {
  const label = LICENSE_LABEL[license] ?? license;
  return licenseUrl ? `[${cell(label)}](${licenseUrl})` : cell(label);
};

/** 저작자를 알 수 없는 자료는 '작자 미상'으로 적습니다. @param {string | null} name */
const artist = (name) => (!name || /^unknown/i.test(name) ? "작자 미상" : cell(name));

/** @param {string} url */
const referenceLabel = (url) =>
  url.includes("namu.wiki") ? "나무위키" : url.includes("en.wikipedia") ? "영어 위키백과" : "위키백과";

/** @param {string[]} urls */
const references = (urls) => urls.map((url) => `[${referenceLabel(url)}](${encodeURI(decodeURI(url))})`).join(" · ");

/** 출처 목록 Markdown을 만듭니다. */
export async function renderCredits() {
  const figures = readJson("src/entities/figure/data/figures.json");
  const art = readJson("src/entities/figure/data/art.json");
  const { ARMAMENTS, HIDDEN_ARMAMENTS } = await import("../src/entities/armament/model/armaments.js");
  const { BATTLEFIELDS } = await import("../src/entities/battlefield/model/battlefields.js");
  const nameOf = new Map(figures.map((f) => [f.slug, f.name]));

  const artRows = Object.entries(art).map(
    ([slug, a]) =>
      `| ${cell(nameOf.get(slug) ?? slug)} | ${cell(a.title)} | ${artist(a.credit.artist)} | ${license(a.credit)} | [Wikimedia Commons](${a.credit.sourceUrl}) |`,
  );
  const arms = [...ARMAMENTS, ...HIDDEN_ARMAMENTS].filter((arm) => arm.sources.length);
  const armRows = arms.map((arm) => `| ${cell(arm.name)} | ${references(arm.sources)} |`);
  const fieldRows = BATTLEFIELDS.map((field) => `| ${cell(field.name)} | ${references([field.source])} |`);

  // 카드·괴물·전장·무구 그림 (pnpm illustrations가 만든 credits.json)
  const { ENEMIES } = await import("../src/entities/enemy/model/enemies.js");
  const { BASIC_CARDS } = await import("../src/entities/card/model/build.js");
  const subject = {
    figure: nameOf,
    enemy: new Map(ENEMIES.map((e) => [e.id, e.name])),
    field: new Map(BATTLEFIELDS.map((f) => [f.id, f.name])),
    arm: new Map([...ARMAMENTS, ...HIDDEN_ARMAMENTS].map((a) => [a.id, a.name])),
    card: new Map(BASIC_CARDS.map((c) => [c.id, c.name])),
  };
  const KIND = { figure: "카드", enemy: "괴물", field: "전장", arm: "무구", card: "기본 카드" };
  const illustrations = existsSync(join(root, ILLUSTRATION_CREDITS)) ? readJson(ILLUSTRATION_CREDITS) : {};
  const illustrationRows = Object.entries(illustrations).map(([key, a]) => {
    const [kind, id] = key.split(":");
    const name = `${KIND[kind]} ${subject[kind]?.get(id) ?? id}`;
    return `| ${cell(name)} | ${cell(a.title)}${a.date ? ` (${cell(a.date)})` : ""} | ${artist(a.artist)} | ${license(a)} | [Wikimedia Commons](${a.page}) |`;
  });

  return [
    "# 출처",
    "",
    "ZERO가 쓰는 외부 자료의 전체 목록입니다. 화면에는 출처를 적지 않고 [README의 출처](../README.md#출처)와 이 목록에 모읍니다.",
    "",
    "> 이 파일은 `pnpm credits`가 데이터에서 만듭니다. 직접 고치지 말고 데이터를 고친 뒤 다시 만드세요.",
    "",
    `## 카드·괴물·전장·무구 그림 (${illustrationRows.length}점)`,
    "",
    "게임 화면의 그림입니다. 그 신화를 그린 옛 회화·판화·삽화와 박물관 소장품을 Wikimedia Commons에서 골라 `pnpm illustrations`로 받아 줄였습니다(`scripts/illustrations/picks.json`). CC BY-SA 그림을 줄인 파일은 같은 라이선스를 따릅니다.",
    "",
    "| 대상 | 작품 | 저작자 | 사용 허락 | 원본 |",
    "| --- | --- | --- | --- | --- |",
    ...illustrationRows,
    "",
    `## Ark 소장 그림 (${artRows.length}점)`,
    "",
    "카드 상세의 'Ark 소장 자료'입니다. [Ark](https://ark-ryushin01.vercel.app)가 Wikimedia Commons에서 고른 자료를 그대로 받아 씁니다.",
    "",
    "| 신·영웅 | 자료 | 저작자 | 사용 허락 | 원본 |",
    "| --- | --- | --- | --- | --- |",
    ...artRows,
    "",
    `## 무구 고증 자료 (${armRows.length}점)`,
    "",
    "무구의 이야기와 생김새를 쓸 때 참고한 글입니다. 글은 게임에 맞게 새로 썼습니다.",
    "",
    "| 무구 | 참고 |",
    "| --- | --- |",
    ...armRows,
    "",
    `## 전장 소개 자료 (${fieldRows.length}곳)`,
    "",
    "| 전장 | 참고 |",
    "| --- | --- |",
    ...fieldRows,
    "",
  ].join("\n");
}

/** docs/credits.md를 다시 씁니다. */
export async function writeCredits() {
  writeFileSync(CREDITS_FILE, await renderCredits());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeCredits();
  console.log("docs/credits.md를 다시 만들었습니다.");
}
