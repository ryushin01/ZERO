import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/familjen-grotesk/wght.css";
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
