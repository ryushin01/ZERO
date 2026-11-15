import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    // 한글 글꼴 조각(대부분 4KB 미만)을 CSS에 base64로 넣지 않고 파일로 둠. 넣으면 쓰지 않는 글자까지 CSS에 실림
    assetsInlineLimit: (filePath) => (/\.woff2?$/.test(filePath) ? false : undefined),
  },
  preview: { port: 4173 },
});
