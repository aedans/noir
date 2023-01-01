import React, { useState } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import { smallCardWidth, smallCardHeight } from "../Card";
import { useCardInfoList } from "../cards";
import Rectangle from "../Rectangle";
import GameCard from "./GameCard";
import Grid from "../Grid";

export type CardListProps = Omit<PixiElement<Container>, "children"> & {
  cards: CardState[];
};

export default function CardList(props: CardListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardInfo = useCardInfoList(props.cards);
  const cards = cardInfo.map((card) => card.state);

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
      <Grid elements={cards} margin={isExpanded ? { x: 1, y: -0.15 } : { x: 0, y: 0 }} maxWidth={1}>
        {(state, ref, x, y, i) => (
          <GameCard
            zIndex={20 - i}
            state={state}
            key={state.id}
            ref={ref}
            status={"none"}
            x={x + smallCardWidth / 2}
            y={y + smallCardHeight / 2}
          />
        )}
      </Grid>
    </Container>
  );
}
