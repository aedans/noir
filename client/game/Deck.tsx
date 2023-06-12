import React from "react";
import { targetResolution } from "../Camera";
import { CardStateInfo } from "../../common/card";
import { cardHeight, cardWidth } from "../Card";
import GameCard from "./GameCard";
import { ExpandableCardList } from "../ExpandableCardList";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const x = targetResolution.width - cardWidth;
  const y = targetResolution.height - cardHeight;

  return <ExpandableCardList reversed cards={props.cards} x={x} y={y} card={(props) => <GameCard {...props} />} />;
}
