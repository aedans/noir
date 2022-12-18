import React, { Ref } from "react";
import { Container, PixiElement, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardInfo, CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { Filter, filters, Texture } from "pixi.js";
import { getCardInfo } from "./cards";
import { useClientSelector } from "./store";

export const cardHeight = targetResolution.height;
export const cardWidth = cardHeight * (1 / 1.4);

export function getCardColor(cardInfo: CardInfo) {
  const colorMap = {
    orange: 0xeb7900,
    blue: 0x00aceb,
    green: 0x83eb00,
    purple: 0xcd00eb,
    any: 0x767676,
  };

  return colorMap[cardInfo.colors.length == 1 ? cardInfo.colors[0] : "any"];
}

export type CardProps = PixiElement<Container> & {
  state: CardState;
};

export default React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
  const game = useClientSelector((state) => state.game.current);
  const cardInfo = getCardInfo(game, props.state);

  const dropShadowFilter = new DropShadowFilter({
    alpha: 0.5,
    blur: 1,
    distance: (props.zIndex ?? 0) + 5,
  });

  const dimFilter = new filters.ColorMatrixFilter();
  if (!props.state.prepared) {
    dimFilter.greyscale(0, true);
    dimFilter.alpha = .5;
  }

  const currentFilters: Filter[] = [dimFilter, dropShadowFilter];
  if (props.filters) {
    currentFilters.push(...props.filters);
  }

  return (
    <Container pivot={[cardWidth / 2, cardHeight / 2]} {...props} filters={currentFilters} ref={ref}>
      <Rectangle fill={getCardColor(cardInfo)} width={cardWidth - 100} height={cardHeight - 100} x={50} y={50} />
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
