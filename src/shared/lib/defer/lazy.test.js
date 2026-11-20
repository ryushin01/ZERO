import { describe, expect, it, vi } from "vitest";

import { lazyModule } from "./lazy.js";

describe("lazyModule", () => {
  it("여러 번 불러도 한 번만 받고, 받은 뒤에는 바로 꺼내 씁니다", async () => {
    const importer = vi.fn(async () => ({ default: { zeus: "하늘" } }));
    const lazy = lazyModule(importer);
    expect(lazy.get()).toBeNull();
    const [a, b] = await Promise.all([lazy.load(), lazy.load()]);
    expect(a).toBe(b);
    expect(lazy.get()).toEqual({ zeus: "하늘" });
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it("받지 못했으면 다음에 다시 받습니다", async () => {
    const importer = vi
      .fn()
      .mockRejectedValueOnce(new Error("끊김"))
      .mockResolvedValueOnce({ default: [1] });
    const lazy = lazyModule(importer);
    await expect(lazy.load()).rejects.toThrow("끊김");
    await expect(lazy.load()).resolves.toEqual([1]);
    expect(importer).toHaveBeenCalledTimes(2);
  });
});
