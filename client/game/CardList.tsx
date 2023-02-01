import React, { useState } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { CardStateInfo } from "../../common/card";
import { smallCardWidth, smallCardHeight } from "../Card";
import Rectangle from "../Rectangle";
import GameCard from "./GameCard";

export type CardListProps = Omit<PixiElement<Container>, "children"> & {
  cards: CardStateInfo[];
  reverse?: boolean;
};

export default function CardList(props: CardListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const distance = isExpanded ? .2 : 0;

  function pointerdown() {
    if (props.cards.length > 0) {
      setIsExpanded(!isExpanded);
    }
  }

  return (
    <Container {...props}>
      <Rectangle
        width={smallCardWidth}
        height={smallCardHeight}
        fillAlpha={0.01}
        pointerdown={pointerdown}
        interactive
      />
      {props.cards.map(({ state, info }, i) => (
        <GameCard
          zIndex={20 + (props.reverse ? -i : i)}
          state={state}
          info={info}
          key={state.id}
          x={smallCardWidth / 2}
          y={smallCardHeight / 2 - (props.reverse ? i : -i) * smallCardWidth * distance}
        />
      ))}
    </Container>
  );
}
