/** @type {import("@storybook/html-vite").StorybookConfig} */
const config = {
  stories: ["../src/**/*.stories.js"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/html-vite",
  staticDirs: ["../public"],
};

export default config;
