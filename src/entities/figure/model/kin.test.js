import { describe, expect, it } from "vitest";

import { getFigure, getPantheon } from "./figures.js";
import { genealogies, isKinLoaded, kinOf, loadKin, WORK_MEDIUM_LABEL, worksOf } from "./kin.js";

/** @param {{ name: string }[]} list */
const names = (list) => list.map((person) => person.name);

describe("계보와 작품", () => {
  it("받기 전에는 비어 있고, 받은 뒤에 Ark의 계보 21개 계열을 그대로 씁니다", async () => {
    expect(isKinLoaded()).toBe(false);
    expect(kinOf("zeus").parents).toEqual([]);
    await loadKin();
    expect(isKinLoaded()).toBe(true);
    expect(genealogies().length).toBeGreaterThanOrEqual(21);
    for (const genealogy of genealogies()) {
      expect(getPantheon(genealogy.pantheonSlug), genealogy.pantheonSlug).toBeDefined();
      expect(genealogy.source).toBeTruthy();
    }
  });

  it("여러 곳에 나오는 인물도 부모·형제자매·배우자·자녀를 한데 모읍니다", async () => {
    await loadKin();
    const zeus = kinOf("zeus");
    expect(names(zeus.parents)).toEqual(expect.arrayContaining(["크로노스", "레아"]));
    expect(names(zeus.siblings)).toEqual(expect.arrayContaining(["포세이돈", "하데스"]));
    expect(names(zeus.partners)).toContain("헤라");
    expect(zeus.children.map((child) => child.slug)).toEqual(expect.arrayContaining(["athena", "apollo"]));
    expect(names([...zeus.parents, ...zeus.siblings, ...zeus.partners, ...zeus.children])).not.toContain("제우스");
    expect(zeus.source).toContain("신들의 계보");
  });

  it("계보의 인물 slug는 모두 ZERO의 카드가 있는 인물입니다", async () => {
    await loadKin();
    /** @type {string[]} */
    const missing = [];
    /** @param {import("./kin.js").KinNode} node */
    const walk = (node) => {
      if (node.slug && !getFigure(node.slug)) missing.push(node.slug);
      for (const union of node.unions ?? []) {
        if (union.partner?.slug && !getFigure(union.partner.slug)) missing.push(union.partner.slug);
        for (const child of union.children ?? []) walk(child);
      }
    };
    for (const genealogy of genealogies()) for (const root of genealogy.roots) walk(root);
    expect(missing).toEqual([]);
  });

  it("공개된 현대 작품을 그 인물에게 이어 줍니다", async () => {
    await loadKin();
    expect(worksOf("odin").map((work) => work.slug)).toContain("final-fantasy");
    for (const work of worksOf("gilgamesh")) expect(WORK_MEDIUM_LABEL[work.medium]).toBeTruthy();
    expect(worksOf("nobody")).toEqual([]);
  });
});
