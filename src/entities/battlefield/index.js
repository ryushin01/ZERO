/**
 * @typedef {import("./model/battlefields.js").Battlefield} Battlefield
 * @typedef {import("./model/battlefields.js").Realm} Realm
 */
export { battlefieldIllustration } from "./lib/illustration.js";
export {
  BATTLEFIELDS,
  battlefieldsOf,
  describeField,
  getBattlefield,
  REALMS,
  realmOfAct,
  TERRAIN_RATE,
} from "./model/battlefields.js";
export { battlefieldCard } from "./ui/battlefield-card.js";
