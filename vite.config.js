import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    // 첫 화면에서 받는 묶음을 크기 예산(.size-limit.js)이 찾도록 매니페스트를 남깁니다.
    manifest: true,
    // 한글 글꼴 조각(대부분 4KB 미만)을 CSS에 base64로 넣지 않고 파일로 둠. 넣으면 쓰지 않는 글자까지 CSS에 실림
    assetsInlineLimit: (filePath) => (/\.woff2?$/.test(filePath) ? false : undefined),
  },
  preview: { port: 4173 },
});
