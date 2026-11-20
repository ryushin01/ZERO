import { describe, expect, it } from "vitest";

import { addToChangelog, changelogLine } from "./changelog-sync.mjs";

const SUMMARY = `- 계열 51개
- 신·영웅·몬스터 475명
- 유물 152점 (새 9: 와스 홀, 갈라틴)
- 탈것·동반자 짝 14쌍
- 계보 21개 계열, 현대 작품 2개
- Ark 소장 그림 408점, 새로 고른 카드·무구 그림 0점
`;

describe("자동 동기화의 변경 기록", () => {
  it("새로 들어온 것만 골라 한 줄로 적습니다", () => {
    expect(changelogLine(SUMMARY, "46620b7")).toBe(
      "- Ark 자동 동기화(ryushin01/Ark@46620b7): 새로 들어옴 — 유물 9(와스 홀, 갈라틴)",
    );
    expect(changelogLine("- 계열 51개\n", "abc1234")).toBe(
      "- Ark 자동 동기화(ryushin01/Ark@abc1234): 기존 기록을 Ark에 맞춤",
    );
  });

  it("오늘 날짜 항목이 있으면 그 맨 위에, 없으면 새 날짜 항목을 만들어 붙입니다", () => {
    const log = "# 변경 기록\n\n> 안내\n\n## 2026-11-20\n\n- 전\n\n## 1.2.3 - 2026-11-15\n";
    expect(addToChangelog(log, "- 새 줄", "2026-11-20")).toBe(
      "# 변경 기록\n\n> 안내\n\n## 2026-11-20\n\n- 새 줄\n- 전\n\n## 1.2.3 - 2026-11-15\n",
    );
    expect(addToChangelog(log, "- 새 줄", "2026-11-21")).toBe(
      "# 변경 기록\n\n> 안내\n\n## 2026-11-21\n\n- 새 줄\n\n## 2026-11-20\n\n- 전\n\n## 1.2.3 - 2026-11-15\n",
    );
  });
});
