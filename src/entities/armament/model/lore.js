import { lazyModule } from "#shared/lib/index.js";

/**
 * 무구의 이야기. 도감의 무구 칸에서만 쓰므로 첫 화면 묶음에서 빼고 따로 받습니다.
 * - Ark 유물에서 온 무구: Ark의 기록(유래·힘·대가·출전 등)을 그대로 담은 `data/lore.json`
 * - ZERO가 먼저 만든 무구: ZERO가 쓴 이야기·생김새·참고 글(`tuned-lore.js`)
 * @typedef {{ nameEn: string, origin: string, power: string, price: string, source: string, exhibitId: string | null, order: number }} RelicLore
 */
const arkLore = lazyModule(() => import("../data/lore.json", { with: { type: "json" } }));
const tunedLore = lazyModule(() => import("./tuned-lore.js").then((module) => ({ default: module.TUNED_LORE })));

/** 무구의 이야기를 받습니다. 여러 번 불러도 한 번만 받습니다. */
export const loadArmamentLore = () => Promise.all([arkLore.load(), tunedLore.load()]);

/**
 * 무구의 이야기. 히든 무구는 바로, 나머지는 이야기를 받은 뒤에 돌려줍니다. 아직이면 null
 * @param {import("./armaments.js").ArmamentDef} arm
 * @returns {{ lore: string, price: string | null } | null}
 */
export function armamentLore(arm) {
  if (arm.lore) return { lore: arm.lore, price: null };
  if (arm.ark) {
    const record = /** @type {Record<string, RelicLore> | null} */ (arkLore.get())?.[arm.ark];
    return record ? { lore: `${record.origin} ${record.power}`, price: record.price || null } : null;
  }
  const tuned = tunedLore.get()?.[arm.id];
  return tuned ? { lore: tuned.lore, price: null } : null;
}
