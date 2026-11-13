/** @typedef {import("./model/armaments.js").ArmamentDef} ArmamentDef */
export { armamentArt } from "./lib/illustration.js";
export {
  ARMAMENT_SLOTS,
  ARMAMENTS,
  getArmament,
  hasArmament,
  HIDDEN_ARMAMENTS,
  isOncePerBattle,
} from "./model/armaments.js";
export { bonusText, describeArmament, describeArmEffect } from "./model/describe.js";
export { armamentCard } from "./ui/armament-card.js";
