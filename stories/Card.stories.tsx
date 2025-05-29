import { AppProvider, Container, createRoot } from "@pixi/react";
import Card from "../client/Card";
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
    return new Root(ctx.parameters.pixi.appReady, (root) => {
      const state = defaultCardState("", "");
      const info = fillPartialCardInfo({});
      createRoot(root.view).render(
        <AppProvider value={ctx.parameters.pixi.app}>
          <Container x={300} y={300}>
            <Card state={state} info={info} {...args} />
          </Container>
        </AppProvider>
      );
    });
  },
};
