import React, { useState } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import { smallCardWidth, smallCardHeight } from "../Card";
import { useCardInfoList } from "../cards";
import Rectangle from "../Rectangle";
import GameCard from "./GameCard";

export type CardListProps = Omit<PixiElement<Container>, "children"> & {
  cards: CardState[];
  reverse?: boolean;
};

export default function CardList(props: CardListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardInfo = useCardInfoList(props.cards);
  const cards = cardInfo.map((card) => card.state);
  const sortedCards = props.reverse ? [...cards.reverse()] : [...cards];

  const distance = isExpanded ? .2 : 0;

  function pointerdown() {
    if (cardInfo.length > 0) {
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
      {sortedCards.map((state, i) => (
        <GameCard
          zIndex={20 + (props.reverse ? -i : i)}
          state={state}
          key={state.id}
          x={smallCardWidth / 2}
          y={smallCardHeight / 2 - (props.reverse ? i : -i) * smallCardWidth * distance}
        />
      ))}
    </Container>
  );
}
