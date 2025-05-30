import { AppProvider, createRoot } from "@pixi/react";
import { cardHeight, cardWidth } from "../client/Card";
import { defaultCardState } from "../common/gameSlice";
import { Root } from "./Root";
import React from "react";
import { CardStateInfo, fillPartialCardInfo } from "../common/card";
import ExpandableCardList from "../client/ExpandableCardList";
import AnimatedCard from "../client/AnimatedCard";

export default {
  title: "CardList",
  args: {
    x: 0,
    y: 0,
    scale: 50,
    size: 10,
    reversed: false,
  },
  argTypes: {
    x: { control: { type: "range", min: 1, max: 1000 } },
    y: { control: { type: "range", min: 1, max: 1000 } },
    scale: { control: { type: "range", min: 0, max: 200 } },
    size: { control: { type: "range", min: 1, max: 50 } },
  },
};

function createCards(size: number) {
  const cards: CardStateInfo[] = [];
  for (let i = 0; i < size; i++) {
    const state = defaultCardState(`Card ${i + 1}`, `Card ${i + 1}`);
    const info = fillPartialCardInfo({});
    cards.push({ state, info });
  }

  return cards;
}

export const Default = {
  render: (args, ctx) => {
    return new Root(ctx.parameters.pixi, (root) => {
      createRoot(root.view).render(
        <AppProvider value={ctx.parameters.pixi.app}>
          <ExpandableCardList
            reversed={args.reversed}
            beginExpanded
            x={args.x}
            y={args.y + (args.reversed ? ((cardHeight * args.scale) / 1000) * (args.size - 1) : 0)}
            cardWidth={cardWidth * (args.scale / 100)}
            cardHeight={cardHeight * (args.scale / 100)}
            card={(props) => <AnimatedCard scale={args.scale / 100} {...props} />}
            cards={createCards(args.size)}
          />
        </AppProvider>
      );
    });
  },
};
