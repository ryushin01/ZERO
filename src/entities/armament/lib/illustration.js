import { drawArmament, illustrationUrl } from "#shared/ui/illustration/index.js";

import { armamentSpec } from "../model/portrait.js";

/** @param {import("../model/armaments.js").ArmamentDef} arm */
export const armamentIllustration = (arm) => illustrationUrl(`arm:${arm.id}`, () => drawArmament(armamentSpec(arm)));
