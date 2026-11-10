import { cardDetail } from "./card-detail.js";

export default {
  title: "widgets/CardDetail",
  parameters: { layout: "padded", surface: "light" },
  args: { id: "odin" },
  argTypes: { id: { control: "select", options: ["odin", "heracles", "zeus", "were-jaguar", "quill"] } },
  render: ({ id }) => cardDetail(id),
};

export const WithArt = {};
export const Nemesis = { args: { id: "heracles" } };
export const WithoutArt = { args: { id: "were-jaguar" } };
