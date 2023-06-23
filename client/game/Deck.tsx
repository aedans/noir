import React, { useCallback } from "react";
import { targetResolution } from "../Camera.js";
import { CardStateInfo } from "../../common/card.js";
import { cardHeight, cardWidth } from "../Card.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";
import { Container } from "react-pixi-fiber";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const card = useCallback((props: GameCardProps) => <GameCard {...props} />, []);

  const x = targetResolution.width - cardWidth;
  const y = targetResolution.height - cardHeight;

  return (
    <Container x={x} y={y}>
      <ExpandableCardList reversed cards={props.cards} card={card} />
    </Container>
  );
}
