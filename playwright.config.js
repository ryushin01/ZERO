import { defineConfig, devices } from "@playwright/test";

const PORT = 4179;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // 화면 전환 효과가 끝나기 전에 명도 대비를 재지 않도록 동작 줄이기 환경에서 검사합니다.
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", reducedMotion: "reduce" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: {
    // 배포와 같은 결과물(dist)을 검사합니다. 먼저 pnpm build를 실행하세요.
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
