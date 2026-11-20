/**
 * 자동 동기화(.github/workflows/sync-ark.yml)가 바뀐 내용을 CHANGELOG.md의 오늘 날짜 항목에 한 줄로 남깁니다.
 *
 *   node scripts/changelog-sync.mjs <동기화 요약 파일> <Ark 커밋>
 *
 * 요약(pnpm sync:ark의 SYNC_SUMMARY)에서 새로 들어온 것('새 N: …')만 골라 적고, 없으면 기존 기록을 고쳤다고 적습니다.
 * 버전은 1.2.3에 고정되어 있으므로 날짜 제목(## YYYY-MM-DD, 한국 시각) 아래에 붙입니다(scripts/version.test.js).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHANGELOG = join(root, "CHANGELOG.md");

/** 요약 줄에서 새로 들어온 것만 골라 한 줄로 @param {string} summary */
export function changelogLine(summary, arkCommit) {
  const added = summary
    .split("\n")
    .map((line) => line.match(/^- (.+?) \d+\S* \(새 (\d+): (.+)\)$/))
    .filter((match) => match !== null)
    .map((match) => `${match[1]} ${match[2]}(${match[3]})`);
  const what = added.length ? `새로 들어옴 — ${added.join("; ")}` : "기존 기록을 Ark에 맞춤";
  return `- Ark 자동 동기화(ryushin01/Ark@${arkCommit}): ${what}`;
}

/** 오늘(한국 시각) 날짜 제목 아래에 줄을 붙입니다. 제목이 없으면 맨 위 항목 앞에 만듭니다. */
export function addToChangelog(text, line, today) {
  const heading = `## ${today}`;
  if (text.includes(`${heading}\n`)) return text.replace(`${heading}\n\n`, `${heading}\n\n${line}\n`);
  const first = text.indexOf("\n## ");
  return `${text.slice(0, first + 1)}${heading}\n\n${line}\n\n${text.slice(first + 1)}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [summaryFile, arkCommit] = process.argv.slice(2);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const line = changelogLine(readFileSync(summaryFile, "utf8"), arkCommit);
  writeFileSync(CHANGELOG, addToChangelog(readFileSync(CHANGELOG, "utf8"), line, today));
  console.log(line);
}
