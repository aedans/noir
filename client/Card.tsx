import React, { Ref } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardState } from "../common/card";
import Text from "./Text";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export type CardProps = PixiElement<Container> & {
  state: CardState;
};

export default React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
  return (
    <Container {...props} ref={ref}>
      <Rectangle fill={0xffffff} width={cardWidth} height={cardHeight} />
      <Text text={props.state.name} style={{ fontSize: cardHeight / 10, tint: 0 }} />
    </Container>
  );
});
