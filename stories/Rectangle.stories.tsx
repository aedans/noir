import { createRoot } from "@pixi/react";
import Rectangle from "../client/Rectangle";
import React from "react";
import { Root } from "./Root";

export default {
  title: "Rectangle",
  args: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: "0xffffff",
    fillAlpha: 100,
  },
  argTypes: {
    x: { control: { type: "range", min: 1, max: 1000 } },
    y: { control: { type: "range", min: 1, max: 1000 } },
    width: { control: { type: "range", min: 1, max: 1000 } },
    height: { control: { type: "range", min: 1, max: 1000 } },
    fill: { control: { type: "color" } },
    fillAlpha: { control: { type: "range", min: 0, max: 100 } },
  },
};

export const Default = {
  render: (args, ctx) => {
    return new Root(ctx.parameters.pixi.appReady, (root) => {
      createRoot(root.view).render(<Rectangle {...args} fillAlpha={args.fillAlpha / 100} />);
    });
  },
};
