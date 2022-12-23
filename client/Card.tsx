import React, { createRef, MutableRefObject, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Container, PixiElement, Sprite } from "react-pixi-fiber";
import Rectangle from "./Rectangle";
import { targetResolution } from "./Camera";
import { CardInfo, CardKeyword, CardState } from "../common/card";
import Text from "./Text";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { Filter, filters, Texture } from "pixi.js";
import { useCardInfo } from "./cards";
import anime from "animejs";

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

export function getDisplayName(keyword: CardKeyword) {
  const displayNameMap: { [T in CardKeyword]: string } = {
    disloyal: "Disloyal",
    protected: "Protected",
    vip: "VIP",
  };

  return displayNameMap[keyword];
}

export type CardProps = PixiElement<Container> & {
  state: CardState;
};

export default React.forwardRef(function Card(props: CardProps, ref: Ref<Container>) {
  const cardInfo = useCardInfo(props.state);
  const containerRef = useRef() as MutableRefObject<Required<Container>>;
  const dimFilterRef = useRef(new filters.ColorMatrixFilter());

  useImperativeHandle(ref, () => containerRef.current);

  useEffect(() => {
    (containerRef.current as any).convertTo3d?.();
    dimFilterRef.current.alpha = 0;
  }, []);

  const dropShadowFilter = new DropShadowFilter({
    alpha: 0.5,
    blur: 1,
    distance: (props.zIndex ?? 0) + 5,
  });

  useEffect(() => {
    dimFilterRef.current.greyscale(0, true);
    anime({
      targets: dimFilterRef.current,
      duration: 300,
      easing: "easeOutExpo",
      alpha: props.state.exhausted ? 0.5 : 0,
    });
  }, [props.state.exhausted]);

  const currentFilters: Filter[] = [dimFilterRef.current, dropShadowFilter];
  if (props.filters) {
    currentFilters.push(...props.filters);
  }

  let text = cardInfo.text;
  if (cardInfo.keywords.length > 0) {
    text = `${cardInfo.keywords.map(getDisplayName).join(", ")}\n${text}`.trim();
  }

  return (
    <Container pivot={[cardWidth / 2, cardHeight / 2]} {...props} filters={currentFilters} ref={containerRef}>
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
        text={text}
        style={{ fontSize: 128, align: "center", maxWidth: cardWidth - 200, letterSpacing: 1 }}
      />
      <Text
        anchor={[0.5, 0.5]}
        x={160}
        y={200}
        text={Math.max(0, cardInfo.cost.money)}
        style={{ fontSize: 128, tint: 0 }}
      />
    </Container>
  );
});
