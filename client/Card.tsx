import React, { Ref } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export type CardProps = PixiElement<Container> & {
  state: CardState;
};

export default React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
  const dropShadowFilter = new DropShadowFilter({
    alpha: 1,
    blur: 1,
    distance: (props.zIndex ?? 0) + 5,
  });

  return (
    <Container filters={[dropShadowFilter]} {...props} ref={ref}>
      <Rectangle fill={0xffffff} width={cardWidth} height={cardHeight} />
      <Text anchor={[0.5, 0]} x={cardWidth / 2} y={50} text={props.state.name} style={{ fontSize: 168, tint: 0 }} />
    </Container>
  );
});
