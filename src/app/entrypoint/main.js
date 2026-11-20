import "@fontsource/neuton/300.css";
import "@fontsource/neuton/400.css";
import "@fontsource/neuton/700.css";
import "@fontsource/neuton/800.css";
// 한글: 마루 부리(ZeroSerif) 중 화면에 쓰는 글자만 담은 파일(pnpm fonts로 만듦)
import "../styles/fonts/zero-serif.css";
import "../styles/tokens.css";
import "../styles/base.css";
import restFontsCss from "../styles/fonts/zero-serif-rest.css?url";
import { attachRestFonts } from "../styles/rest-fonts.js";

import { loadArkArt, loadKin, loadSummaries } from "#entities/figure/index.js";
import { afterLoadIdle } from "#shared/lib/index.js";

import { initMonitoring } from "../monitoring/index.js";
import { createApp } from "../render/app.js";

initMonitoring();

createApp({
  header: /** @type {HTMLElement} */ (document.getElementById("site-header")),
  main: /** @type {HTMLElement} */ (document.getElementById("main")),
});

// 나머지 한글(화면 글자 파일에 없는 글자)은 첫 화면 뒤에 붙임
attachRestFonts(restFontsCss);

// 카드 상세에서만 쓰는 Ark 소장 자료·신 소개·계보는 첫 화면 묶음에서 빼고, 첫 화면 뒤 한가할 때 미리 받아 둠
afterLoadIdle(() => void Promise.all([loadArkArt(), loadSummaries(), loadKin()]).catch(() => undefined), {
  delay: 2000,
});
