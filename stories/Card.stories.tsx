import { AppProvider, Container, createRoot } from "@pixi/react";
import Card, { cardHeight, cardWidth } from "../client/Card";
import { defaultCardState } from "../common/gameSlice";
import { Root } from "./Root";
import React from "react";
import { fillPartialCardInfo } from "../common/card";
import AnimatedCard from "../client/AnimatedCard";

export default {
  title: "Card",
  args: {
    x: 0,
    y: 0,
    scale: 100,
  },
  argTypes: {
    x: { control: { type: "range", min: 1, max: 1000 } },
    y: { control: { type: "range", min: 1, max: 1000 } },
    scale: { control: { type: "range", min: 0, max: 200 } },
  },
};

export const Default = {
  render: (args, ctx) => {
    return new Root(ctx.parameters.pixi, (root) => {
      const state = defaultCardState("Random Citizen", "");
      const info = fillPartialCardInfo({
        type: "agent",
        cost: { money: 3 },
        keywords: [["disloyal"]],
      });
      const scale = args.scale / 100;
      createRoot(root.view).render(
        <AppProvider value={ctx.parameters.pixi.app}>
          <AnimatedCard
            scale={scale}
            x={args.x +  (cardWidth / 2) * scale}
            y={args.y + (cardHeight / 2) * scale}
            state={state}
            info={info}
          />
        </AppProvider>
      );
    });
  },
};
