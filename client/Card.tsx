import React, { Ref } from "react";
import { Container, PixiElement, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { cardColors, CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { Texture } from "pixi.js";
import { getCardInfo } from "./cards";
import { useClientSelector } from "./store";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export const colorMap = {
  orange: 0xeb7900,
  blue: 0x00aceb,
  green: 0x83eb00,
  purple: 0xcd00eb,
  any: 0x767676,
};

export type CardProps = PixiElement<Container> & {
  state: CardState;
};

export default React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
  const game = useClientSelector((state) => state.game.current);
  const cardInfo = getCardInfo(game, props.state);
  const color = cardInfo.colors.length == 1 ? cardInfo.colors[0] : "any";

  const dropShadowFilter = new DropShadowFilter({
    alpha: 0.5,
    blur: 1,
    distance: (props.zIndex ?? 0) + 5,
  });

  return (
    <Container pivot={[cardWidth / 2, cardHeight / 2]} filters={[dropShadowFilter]} {...props} ref={ref}>
      <Rectangle fill={colorMap[color]} width={cardWidth - 100} height={cardHeight - 100} x={50} y={50} />
      <Sprite texture={Texture.from("border.png")} />
      <Text
        anchor={[0.5, 0]}
        x={cardWidth / 2 + 100}
        y={110}
        text={props.state.name}
        style={{ fontSize: 128, tint: 0 }}
      />
      <Text
        anchor={[0.5, 0.5]}
        x={cardWidth / 2}
        y={cardHeight * (3 / 4)}
        text={cardInfo.text}
        style={{ fontSize: 128, align: "center", maxWidth: cardWidth - 200, letterSpacing: 1 }}
      />
      <Text anchor={[0.5, 0.5]} x={160} y={200} text={cardInfo.cost.money} style={{ fontSize: 128, tint: 0 }} />
    </Container>
  );
});
