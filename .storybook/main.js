/** 배포본(dist/storybook)은 앱과 같은 주소에서 열리므로 /illust/·/art/ 그림을 앱의 것으로 씁니다. */
const shared = Boolean(process.env.STORYBOOK_SHARED_PUBLIC);

/** @type {import("@storybook/html-vite").StorybookConfig} */
const config = {
  stories: ["../src/**/*.stories.js"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/html-vite",
  // public을 또 복사하면 그림 수십 MB가 두 벌 올라가므로, 배포본에서만 빼고 로컬에서는 그대로 둡니다.
  // staticDirs와 앱의 Vite 설정(publicDir) 양쪽에서 복사하므로 둘 다 끕니다.
  staticDirs: shared ? [] : ["../public"],
  viteFinal: (vite) => (shared ? { ...vite, publicDir: false } : vite),
};

export default config;
