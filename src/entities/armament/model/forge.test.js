import { describe, expect, it } from "vitest";

import { getFigure } from "#entities/figure/@x/armament.js";

import lore from "../data/lore.json" with { type: "json" };
import relics from "../data/relics.json" with { type: "json" };
import { ARK_ALIASES, ARK_TREASURES, armamentIdOf, formOf, RELIC_FOES } from "./ark.js";
import { ARMAMENTS, HIDDEN_ARMAMENTS } from "./armaments.js";
import { forgeEffects, FORMS } from "./forge.js";

describe("Ark 유물에서 온 무구", () => {
  it("Ark 유물은 보물과 같은 것만 빼고 모두 무구가 되며, 무구 id는 겹치지 않습니다", () => {
    const ids = new Set(ARMAMENTS.map((arm) => arm.id));
    for (const relic of relics) {
      const id = armamentIdOf(relic.slug);
      if (Object.hasOwn(ARK_TREASURES, relic.slug)) expect(id, relic.slug).toBeNull();
      else expect(ids.has(/** @type {string} */ (id)), relic.slug).toBe(true);
    }
    const all = [...ARMAMENTS, ...HIDDEN_ARMAMENTS].map((arm) => arm.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("ZERO가 먼저 만든 무구와 같은 유물은 ZERO의 무구와 수치를 그대로 씁니다", () => {
    for (const [slug, id] of Object.entries(ARK_ALIASES)) {
      expect(relics.some((relic) => relic.slug === slug)).toBe(true);
      expect(ARMAMENTS.find((arm) => arm.id === id)?.ark).toBeUndefined();
    }
    expect(ARMAMENTS.find((arm) => arm.id === "mjolnir")).toMatchObject({ bonus: "return", owners: ["thor"] });
  });

  it("유물의 생김새는 지금 판별 규칙과 같습니다 (규칙을 바꿨으면 pnpm sync:ark로 다시 가립니다)", () => {
    for (const relic of relics) {
      const nameEn = /** @type {Record<string, { nameEn: string }>} */ (lore)[relic.slug].nameEn;
      expect(relic.form, relic.slug).toBe(formOf({ ...relic, nameEn }));
    }
  });

  it("이야기 파일은 유물마다 유래·힘·대가·출전을 담습니다", () => {
    expect(Object.keys(lore).sort()).toEqual(relics.map((relic) => relic.slug).sort());
    for (const record of Object.values(lore)) expect(record.origin && record.power && record.source).toBeTruthy();
  });

  it("무구마다 있는 인물이 주인이고, 첫 번째 주인의 계열을 따릅니다", () => {
    for (const arm of ARMAMENTS.filter((a) => a.ark)) {
      expect(arm.owners.length, arm.id).toBeGreaterThan(0);
      for (const slug of arm.owners) expect(getFigure(slug), `${arm.id} → ${slug}`).toBeDefined();
      expect(arm.pantheon).toBe(getFigure(arm.owners[0])?.pantheonSlug);
      expect(FORMS[/** @type {import("./ark.js").Form} */ (arm.form)]).toMatchObject({
        cost: arm.cost,
        cooldown: arm.cooldown,
      });
    }
  });

  it("유물 이야기에서 주인과 맞선 인물은 주인으로 치지 않습니다", () => {
    for (const [slug, foes] of Object.entries(RELIC_FOES)) {
      const arm = ARMAMENTS.find((a) => a.ark === slug);
      expect(arm, slug).toBeDefined();
      for (const foe of foes) expect(arm?.owners).not.toContain(foe);
    }
    expect(ARMAMENTS.find((a) => a.ark === "totsuka-no-tsurugi")?.owner).toBe("스사노오");
  });
});

describe("생김새", () => {
  it("한국어 이름의 끝 낱말, 영어 이름, 종류 순으로 가립니다", () => {
    expect(formOf({ slug: "x", name: "누아다의 칼", nameEn: "Sword of Nuada", kind: "weapon" })).toBe("blade");
    expect(formOf({ slug: "x", name: "루의 창", nameEn: "Spear of Lugh", kind: "weapon" })).toBe("spear");
    expect(formOf({ slug: "x", name: "칸텔레", nameEn: "Kantele", kind: "tool" })).toBe("lyre");
    expect(formOf({ slug: "x", name: "케라우노스", nameEn: "Thunderbolt of Zeus", kind: "weapon" })).toBe("bolt");
    expect(formOf({ slug: "x", name: "이름 없는 보물", nameEn: "Nameless", kind: "treasure" })).toBe("hoard");
    // 도구인데 이름으로 가리지 못하면 주인의 속성을 따릅니다(null)
    expect(formOf({ slug: "x", name: "이름 없는 도구", nameEn: "Nameless", kind: "tool" })).toBeNull();
  });

  it("이름만으로 가리기 어려운 유물은 이야기를 읽고 정해 둔 생김새를 씁니다", () => {
    expect(formOf({ slug: "parashu", name: "파라슈", nameEn: "Parashu", kind: "weapon" })).toBe("blunt");
    expect(formOf({ slug: "pinaka", name: "피나카", nameEn: "Pinaka", kind: "weapon" })).toBe("bow");
  });
});

describe("수치", () => {
  it("전투의 신은 무기를 온전히 휘두르고, 다른 속성은 주 효과를 줄여 작은 효과를 덧붙입니다", () => {
    expect(forgeEffects("blade", "war")).toEqual([{ op: "damage", value: 9 }]);
    expect(forgeEffects("blade", "wisdom")).toEqual([
      { op: "damage", value: 7 },
      { op: "draw", value: 1 },
    ]);
    expect(forgeEffects("blade", "doom")).toEqual([
      { op: "damage", value: 7 },
      { op: "erosion", value: 3 },
    ]);
  });

  it("모두를 치는 무기에는 침식 대신 모두에게 취약을, 방어구에는 같은 효과를 합칩니다", () => {
    expect(forgeEffects("blunt", "doom")).toEqual([
      { op: "damage", value: 5, all: true },
      { op: "vulnerable", value: 1, all: true },
    ]);
    expect(forgeEffects("shield", "doom")).toEqual([
      { op: "block", value: 9 },
      { op: "weak", value: 2, all: true },
    ]);
    expect(forgeEffects("armor", "guard")).toEqual([{ op: "block", value: 13 }]);
  });

  it("도구와 보물은 주인의 속성과 상관없이 생김새의 효과를 씁니다", () => {
    expect(forgeEffects("scroll", "war")).toEqual(FORMS.scroll.effects);
    expect(forgeEffects("elixir", "doom")).toEqual(FORMS.elixir.effects);
  });
});
