import { MONO_ACCENT, MONO_PANTHEONS, PANTHEON_REGION, REGIONS } from "#entities/figure/@x/armament.js";

/** 무구 그림 사양 @param {import("./armaments.js").ArmamentDef} arm */
export function armamentSpec(arm) {
  const region = REGIONS[PANTHEON_REGION[arm.pantheon] ?? "greek"];
  return {
    id: `arm-${arm.id}`,
    item: arm.item,
    sky: /** @type {[string, string]} */ (region.sky),
    glow:
      arm.item === "fireserpent"
        ? "#ff8a3a"
        : arm.item === "eye"
          ? "#7af0d6"
          : arm.pantheon === "hidden"
            ? "#f4efe0"
            : "#fff0b0",
    metal: region.metal,
    cloth: region.cloth,
    // 한국 신화의 무구는 흑백
    accent: MONO_PANTHEONS.has(arm.pantheon) ? MONO_ACCENT.light : undefined,
  };
}
