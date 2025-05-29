import { AppProvider, Container, createRoot } from "@pixi/react";
import Card, { cardHeight, cardWidth } from "../client/Card";
import { defaultCardState } from "../common/gameSlice";
import { Root } from "./Root";
import React from "react";
import { fillPartialCardInfo } from "../common/card";

export default {
  title: "Card",
  args: {},
  argTypes: {},
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
      createRoot(root.view).render(
        <AppProvider value={ctx.parameters.pixi.app}>
          <Container x={cardWidth / 2} y={cardHeight / 2}>
            <Card state={state} info={info} {...args} />
          </Container>
        </AppProvider>
      );
    });
  },
};
