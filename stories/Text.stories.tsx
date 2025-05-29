import { createRoot } from "@pixi/react";
import Text from "../client/Text";
import { Root } from "./Root";
import React from "react";

export default {
  title: "Text",
  args: {
    x: 0,
    y: 0,
    text: "the quick brown fox jumps over the lazy dog",
    fontSize: 100,
    tint: "0xffffff"
  },
  argTypes: {
    x: { control: { type: "range", min: 1, max: 1000 } },
    y: { control: { type: "range", min: 1, max: 1000 } },
    fontSize: { control: { type: "range", minx: 1, max: 1000 } },
    tint: { control: { type: "color" } },
  },
};

export const Default = {
  render: (args, ctx) => {
    return new Root(ctx.parameters.pixi.appReady, (root) => {
      createRoot(root.view).render(<Text {...args} style={{ ...args }} />);
    });
  },
};
