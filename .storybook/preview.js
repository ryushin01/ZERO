import "@fontsource/neuton/300.css";
import "@fontsource/neuton/400.css";
import "@fontsource/neuton/700.css";
import "@fontsource/neuton/800.css";
import "../src/app/styles/fonts/zero-serif.css";
import "../src/app/styles/fonts/zero-serif-rest.css";
import "../src/app/styles/tokens.css";
import "../src/app/styles/base.css";

/** @type {import("@storybook/html-vite").Preview} */
const preview = {
  parameters: {
    a11y: { test: "error" },
    layout: "centered",
  },
  globalTypes: {
    surface: {
      description: "표면",
      toolbar: { title: "표면", items: ["dark", "light"], dynamicTitle: true },
    },
  },
  initialGlobals: { surface: "dark" },
  decorators: [
    (story, context) => {
      document.documentElement.lang = "ko";
      document.body.dataset.surface = context.parameters.surface ?? context.globals.surface ?? "dark";
      return story();
    },
  ],
};

export default preview;
