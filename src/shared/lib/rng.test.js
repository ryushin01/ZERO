import { describe, expect, it } from "vitest";

import { createRng, rollWith } from "./rng.js";

describe("createRng", () => {
  it("같은 시드는 같은 순서를 만듭니다", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.float(), a.float(), a.int(1, 6)]).toEqual([b.float(), b.float(), b.int(1, 6)]);
  });

  it("상태를 꺼내 이어 쓸 수 있습니다", () => {
    const a = createRng(7);
    a.float();
    const resumed = createRng(a.state);
    expect(resumed.float()).toBe(a.float());
  });

  it("shuffle은 원본을 바꾸지 않고 같은 원소를 돌려줍니다", () => {
    const list = [1, 2, 3, 4, 5];
    const shuffled = createRng(1).shuffle(list);
    expect(list).toEqual([1, 2, 3, 4, 5]);
    expect([...shuffled].sort()).toEqual(list);
  });

  it("weighted는 무게가 0인 항목을 고르지 않습니다", () => {
    const rng = createRng(3);
    for (let i = 0; i < 50; i += 1) expect(rng.weighted({ a: 1, b: 0 })).toBe("a");
  });
});

describe("rollWith", () => {
  it("상태 안의 난수로 굴리고 다음 상태를 넣어 두어, 같은 상태에서 다시 굴리면 같은 값이 나옵니다", () => {
    const a = { rng: 7 };
    const b = { rng: 7 };
    expect(rollWith(a, (rng) => rng.float())).toBe(rollWith(b, (rng) => rng.float()));
    expect(a.rng).toBe(b.rng);
    expect(a.rng).not.toBe(7);
  });
});
