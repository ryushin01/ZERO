// 첫 화면에서 받는 JS·CSS의 크기 예산.
// 화면별 코드 분할 뒤에는 첫 화면이 한 파일이 아니므로, 빌드 매니페스트(dist/.vite/manifest.json)에서
// 진입 묶음과 그것이 정적으로 가져오는 묶음을 모두 모아 합친 크기를 잽니다. (다른 화면은 들어갈 때 받으므로 빼고)
import { existsSync, readFileSync } from "node:fs";

const MANIFEST = "dist/.vite/manifest.json";

function firstScreen() {
  if (!existsSync(MANIFEST)) throw new Error(`${MANIFEST}가 없습니다. 먼저 pnpm build를 실행하세요.`);
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const entry = Object.keys(manifest).find((key) => manifest[key].isEntry);
  const chunks = new Set();
  const css = new Set();
  const walk = (key) => {
    if (chunks.has(key)) return;
    chunks.add(key);
    for (const file of manifest[key].css ?? []) css.add(`dist/${file}`);
    for (const next of manifest[key].imports ?? []) walk(next);
  };
  walk(entry);
  return { js: [...chunks].map((key) => `dist/${manifest[key].file}`), css: [...css] };
}

const { js, css } = firstScreen();

export default [
  { name: "첫 화면 JS (진입 묶음과 함께 받는 묶음)", path: js, gzip: true, limit: "115 kB" },
  { name: "첫 화면 CSS", path: css, gzip: true, limit: "12 kB" },
];
