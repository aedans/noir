import React, { useState } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { CardStateInfo } from "../../common/card";
import { cardHeight, cardWidth } from "../Card";
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
    <Container {...props} pointerdown={pointerdown} interactive>
      {props.cards.map(({ state, info }, i) => (
        <GameCard
          zIndex={20 + (props.reverse ? -i : i)}
          state={state}
          info={info}
          key={state.id}
          x={cardWidth / 2}
          y={cardHeight / 2 - (props.reverse ? i : -i) * cardWidth * distance}
        />
      ))}
    </Container>
  );
}
