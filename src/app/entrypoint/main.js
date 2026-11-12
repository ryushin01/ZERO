import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/familjen-grotesk/wght.css";
import "../styles/tokens.css";
import "../styles/base.css";

import { initMonitoring } from "../monitoring/index.js";
import { createApp } from "../render/app.js";

initMonitoring();

createApp({
  header: /** @type {HTMLElement} */ (document.getElementById("site-header")),
  main: /** @type {HTMLElement} */ (document.getElementById("main")),
});
