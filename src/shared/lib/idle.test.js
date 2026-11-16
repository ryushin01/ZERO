import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterLoadIdle } from "./idle.js";

describe("afterLoadIdle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("페이지를 다 받은 뒤 기다렸다가 부르고, 한가할 때를 기다릴 수 있으면 기다립니다", () => {
    const fn = vi.fn();
    /** @type {(() => void) | undefined} */
    let idle;
    vi.stubGlobal("requestIdleCallback", (/** @type {() => void} */ cb) => ((idle = cb), 7));
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    afterLoadIdle(fn, { delay: 500 });
    vi.advanceTimersByTime(499);
    expect(idle).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(fn).not.toHaveBeenCalled();
    idle?.();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("부르기 전에 취소하면 부르지 않습니다", () => {
    const fn = vi.fn();
    const cancel = afterLoadIdle(fn);
    cancel();
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });
});
