import { lazyModule } from "#shared/lib/index.js";

/**
 * Ark의 계보(신화 계열마다 집안 내력)와 신화를 빌려 쓴 현대 작품.
 * 카드 상세와 도감의 계보 탭에서만 쓰므로 첫 화면 묶음에서 빼고 따로 받습니다. (pnpm sync:ark가 그대로 씀)
 *
 * 계보는 나무 모양입니다. 사람(KinNode)마다 결합(Union: 배우자와 자녀)이 있고, 자녀가 다시 사람입니다.
 * 같은 인물이 여러 곳에 나올 수 있어(제우스는 크로노스의 자녀이자 여러 여신의 배우자), 인물 slug로 모아 봅니다.
 *
 * @typedef {{ name: string, nameEn: string, slug?: string, note?: string }} Person
 * @typedef {{ partner: Person | null, note?: string, children?: KinNode[] }} Union 배우자가 없으면 홀로 낳은 자녀
 * @typedef {Person & { unions?: Union[] }} KinNode
 * @typedef {{ pantheonSlug: string, source: string, roots: KinNode[] }} Genealogy
 * @typedef {{ slug: string, title: string, titleOriginal: string, medium: string, year: number | null, creator: string, summary: string, figureSlugs: string[] }} Work
 * @typedef {{ name: string, nameEn: string, slug?: string }} Relative
 * @typedef {{ parents: Relative[], siblings: Relative[], partners: Relative[], children: Relative[], source: string }} Kin
 */

const genealogyData = lazyModule(() => import("../data/genealogy.json", { with: { type: "json" } }));
const workData = lazyModule(() => import("../data/works.json", { with: { type: "json" } }));

/** 계보와 작품을 받습니다. 여러 번 불러도 한 번만 받습니다. */
export const loadKin = () => Promise.all([genealogyData.load(), workData.load()]);

/** 계보와 작품을 이미 받았는지 */
export const isKinLoaded = () => genealogyData.get() !== null && workData.get() !== null;

/** 받은 계보 전체 (아직이면 빈 목록) @returns {Genealogy[]} */
export const genealogies = () => /** @type {Genealogy[] | null} */ (genealogyData.get()) ?? [];

/** 작품 갈래의 이름 (Ark와 같음) @type {Record<string, string>} */
export const WORK_MEDIUM_LABEL = { game: "게임", anime: "애니메이션", novel: "소설", "visual-novel": "비주얼 노벨" };

/** @param {Person} person */
const keyOf = (person) => person.slug ?? person.name;

/**
 * 한 인물의 가족. 계보를 받기 전에는 모두 비어 있습니다(loadKin).
 * @param {string} slug
 * @returns {Kin}
 */
export function kinOf(slug) {
  /** @type {Record<"parents" | "siblings" | "partners" | "children", Map<string, Relative>>} */
  const found = { parents: new Map(), siblings: new Map(), partners: new Map(), children: new Map() };
  /** @param {keyof typeof found} group @param {Person | null | undefined} person */
  const add = (group, person) => {
    if (!person || keyOf(person) === slug) return;
    const { name, nameEn } = person;
    found[group].set(keyOf(person), person.slug ? { name, nameEn, slug: person.slug } : { name, nameEn });
  };
  let source = "";
  for (const genealogy of genealogies()) {
    let here = false;
    /** @param {KinNode} node @param {Union | null} from @param {KinNode | null} parent */
    const walk = (node, from, parent) => {
      if (node.slug === slug) {
        here = true;
        if (parent && from) {
          add("parents", parent);
          add("parents", from.partner);
          for (const child of from.children ?? []) add("siblings", child);
        }
        for (const union of node.unions ?? []) {
          add("partners", union.partner);
          for (const child of union.children ?? []) add("children", child);
        }
      }
      for (const union of node.unions ?? []) {
        if (union.partner?.slug === slug) {
          here = true;
          add("partners", node);
          for (const child of union.children ?? []) add("children", child);
        }
        for (const child of union.children ?? []) walk(child, union, node);
      }
    };
    for (const root of genealogy.roots) walk(root, null, null);
    if (here && !source) source = genealogy.source;
  }
  return {
    parents: [...found.parents.values()],
    siblings: [...found.siblings.values()],
    partners: [...found.partners.values()],
    children: [...found.children.values()],
    source,
  };
}

/**
 * 그 인물이 나오는 현대 작품 (Ark가 공개한 것). 받기 전에는 빈 목록입니다.
 * @param {string} slug
 * @returns {Work[]}
 */
export const worksOf = (slug) =>
  /** @type {Work[] | null} */ (workData.get() ?? []).filter((work) => work.figureSlugs.includes(slug));
