import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/familjen-grotesk/wght.css";
// 신·무구·유물·전장의 이름은 Ark 제목과 같은 함렛 600. 이름에 쓰인 글자가 든 조각만 받습니다.
import "@fontsource/hahmlet/600.css";
import "../styles/tokens.css";
import "../styles/base.css";

import { createApp } from "../render/app.js";

createApp({
  header: /** @type {HTMLElement} */ (document.getElementById("site-header")),
  main: /** @type {HTMLElement} */ (document.getElementById("main")),
});
