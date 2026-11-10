import { describe, expect, it } from "vitest";

import { dailyKey, dailySeed, shareText } from "./daily.js";
import { emptyRecords, normalizeRecords, recordRun } from "./records.js";
import { createRun } from "./run.js";

describe("recordRun", () => {
  it("덱에 넣은 신을 서가에 기록하고, 이번 판에 새로 기록한 신을 남깁니다", () => {
    const run = createRun({ seed: 1, guide: "greek" });
    const { records, run: next } = recordRun(emptyRecords(), run);
    expect(records.seen).toHaveLength(2); // 길잡이 카드 둘, 기본 카드는 빼고
    expect(next.discovered).toEqual(records.seen);
    // 같은 덱을 다시 기록해도 늘지 않습니다
    const again = recordRun(records, next);
    expect(again.records).toBe(records);
    expect(again.run).toBe(next);
  });

  it("끝난 판은 한 번만 셉니다", () => {
    const run = { ...createRun({ seed: 2, guide: "norse" }), phase: "victory" };
    const first = recordRun(emptyRecords(), run);
    expect(first.records).toMatchObject({ runs: 1, wins: 1 });
    expect(first.run.recorded).toBe(true);
    expect(recordRun(first.records, first.run).records.runs).toBe(1);
  });

  it("오늘의 신화는 그날의 가장 좋은 결과를 남깁니다", () => {
    const base = createRun({ seed: 3, guide: "egyptian", daily: "2026-11-10" });
    const deep = { ...base, phase: "defeat", act: 2, stats: { ...base.stats, floors: 12 } };
    const shallow = { ...base, phase: "defeat", act: 1, stats: { ...base.stats, floors: 4 } };
    let records = recordRun(emptyRecords(), deep).records;
    records = recordRun(records, shallow).records;
    expect(records.daily["2026-11-10"]).toMatchObject({ floors: 12, won: false });
  });

  it("예전 모양의 기록도 읽습니다", () => {
    expect(normalizeRecords({ runs: 3, wins: 1, bestFloor: 9 })).toMatchObject({ runs: 3, seen: [], daily: {} });
    expect(normalizeRecords(null)).toEqual(emptyRecords());
  });
});

describe("오늘의 신화", () => {
  it("한국 시간으로 날짜를 셉니다", () => {
    expect(dailyKey(new Date("2026-11-10T15:30:00Z"))).toBe("2026-11-11");
    expect(dailyKey(new Date("2026-11-10T14:59:00Z"))).toBe("2026-11-10");
  });

  it("같은 날은 같은 시드, 다른 날은 다른 시드", () => {
    expect(dailySeed("2026-11-10")).toBe(dailySeed("2026-11-10"));
    expect(dailySeed("2026-11-10")).not.toBe(dailySeed("2026-11-11"));
    expect(dailySeed("2026-11-10")).toBeLessThan(2 ** 31);
  });

  it("나눌 글에 날짜와 결과, 주소가 들어갑니다", () => {
    const run = { ...createRun({ seed: 4, guide: "greek", daily: "2026-11-10" }), phase: "defeat" };
    const text = shareText(run, "https://zero-ryushin01.vercel.app/");
    expect(text).toContain("오늘의 신화 11월 10일");
    expect(text).toContain("그리스 신화 · 1장에서 쓰러짐");
    expect(text).toContain("https://zero-ryushin01.vercel.app/");
  });
});
