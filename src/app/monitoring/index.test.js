import { afterEach, describe, expect, it, vi } from "vitest";

import { reportMetric } from "./index.js";

/** @returns {import("web-vitals").Metric} */
const metric = (rating) => ({
  name: "LCP",
  value: 4200,
  rating,
  delta: 4200,
  id: "v1",
  entries: [],
  navigationType: "navigate",
});

describe("reportMetric", () => {
  afterEach(() => vi.restoreAllMocks());

  it("DSN이 없으면 나쁜 지표도 오류 없이 넘긴다", () => {
    expect(() => reportMetric(metric("poor"))).not.toThrow();
  });

  it("개발 모드에서는 지표를 콘솔에 남긴다", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    reportMetric(metric("good"));
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("LCP 4200.0 (good)"));
  });
});
