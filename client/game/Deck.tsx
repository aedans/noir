import React, { useCallback } from "react";
import { targetResolution } from "../Camera.js";
import { CardStateInfo } from "../../common/card.js";
import { cardHeight, cardWidth } from "../Card.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";
import { Container } from "@pixi/react";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const card = useCallback((props: GameCardProps) => <GameCard {...props} />, []);

  const x = targetResolution.width - cardWidth;
  const y = targetResolution.height - cardHeight;

  return <ExpandableCardList x={x} y={y} reversed cards={props.cards} card={card} />;
}
