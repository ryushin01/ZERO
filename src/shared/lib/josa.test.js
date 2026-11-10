import { describe, expect, it } from "vitest";

import { withJosa } from "./josa.js";

describe("withJosa", () => {
  it("받침 유무에 따라 고릅니다", () => {
    expect(withJosa("하르피이아", "이/가")).toBe("하르피이아가");
    expect(withJosa("미노타우로스", "이/가")).toBe("미노타우로스가");
    expect(withJosa("오딘", "을/를")).toBe("오딘을");
    expect(withJosa("제우스", "을/를")).toBe("제우스를");
  });

  it("괄호를 건너뛰고 앞의 한글을 봅니다", () => {
    expect(withJosa("영(零)", "이/가")).toBe("영(零)이");
  });

  it("숫자는 읽는 소리로 판단합니다", () => {
    expect(withJosa(4, "을/를")).toBe("4를");
    expect(withJosa(7, "을/를")).toBe("7을");
    expect(withJosa(36, "으로/로")).toBe("36으로");
    expect(withJosa(31, "으로/로")).toBe("31로");
  });

  it("ㄹ 받침 뒤의 '으로'는 '로'입니다", () => {
    expect(withJosa("서울", "으로/로")).toBe("서울로");
    expect(withJosa("그리스 신화", "으로/로")).toBe("그리스 신화로");
  });
});
