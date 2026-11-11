import { drawLandscape, illustrationUrl } from "#shared/ui/illustration/index.js";

/**
 * 전장 풍경 그림의 data URL
 * @param {import("../model/battlefields.js").Battlefield} field
 */
export const battlefieldIllustration = (field) =>
  illustrationUrl(`field:${field.id}`, () =>
    drawLandscape({ id: `field-${field.id}`, motif: field.motif, sky: field.sky }),
  );
