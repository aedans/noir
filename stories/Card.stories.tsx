import { AppProvider, createRoot } from "@pixi/react";
import { cardHeight, cardWidth } from "../client/Card";
import { Root } from "./Root";
import React from "react";
import { fillPartialCardInfo } from "../common/card";
import AnimatedCard from "../client/AnimatedCard";
import parse from "color-parse";
import { getColor } from "../client/color";

export default {
  title: "Card",
  args: {
    x: 0,
    y: 0,
    scale: 100,
    name: "Random Citizen",
    hidden: true,
    exhausted: false,
    type: "agent",
    colors: [],
    moneyCost: 3,
    agentCost: 0,
    text: "",
    keywords: [["disloyal"]],
    shouldGlow: false,
    borderTint: undefined,
    level: 0,
    top: false,
    props: {},
    modifiers: [],
  },
  argTypes: {
    x: { control: { type: "range", min: 1, max: 1000 } },
    y: { control: { type: "range", min: 1, max: 1000 } },
    scale: { control: { type: "range", min: 0, max: 200 } },
    level: { control: { type: "range", min: 0, max: 3 } },
    borderTint: { control: { type: "color", presetColors: ['#767676', '#eb6300', '#0087eb', '#12eb00', '#d800eb'] } },
  },
};

export const Default = {
  render: (args, ctx) => {
    return new Root(ctx.parameters.pixi, (root) => {
      const scale = args.scale / 100;

      let borderTint: number | undefined = undefined;
      if (args.borderTint) {
        const value = parse(args.borderTint);
        borderTint = getColor({ r: value.values[0], g: value.values[1], b: value.values[2] });
      }

      createRoot(root.view).render(
        <AppProvider value={ctx.parameters.pixi.app}>
          <AnimatedCard
            shouldDimWhenExhausted
            scale={scale}
            x={args.x + (cardWidth / 2) * scale}
            y={args.y + (cardHeight / 2) * scale}
            state={{
              id: "",
              name: args.name,
              hidden: args.hidden,
              exhausted: args.exhausted,
              props: args.props,
              modifiers: args.modifiers,
            }}
            info={fillPartialCardInfo({
              type: args.type,
              colors: args.colors,
              cost: {
                money: args.moneyCost,
                agents: args.agentCost,
              },
              text: args.text,
              keywords: args.keywords,
            })}
            shouldGlow={args.shouldGlow}
            borderTint={borderTint}
            cosmetic={{ level: args.level, top: args.top }}
          />
        </AppProvider>
      );
    });
  },
};
