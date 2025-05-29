import { AppProvider, Container, createRoot } from "@pixi/react";
import Card, { cardHeight, cardWidth } from "../client/Card";
import { defaultCardState } from "../common/gameSlice";
import { Root } from "./Root";
import React from "react";
import { CardStateInfo, fillPartialCardInfo } from "../common/card";
import ExpandableCardList from "../client/ExpandableCardList";
import AnimatedCard, { CardAnimationContext } from "../client/AnimatedCard";

export default {
  title: "CardList",
  args: {
    size: 3,
  },
  argTypes: {
    size: { control: { type: "range", min: 1, max: 10 } },
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
          <CardAnimationContext.Provider value={{ current: {} }}>
            <ExpandableCardList
              x={0}
              y={0}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              card={(props) => <AnimatedCard {...props} />}
              cards={createCards(args.size)}
            />
          </CardAnimationContext.Provider>
        </AppProvider>
      );
    });
  },
};
