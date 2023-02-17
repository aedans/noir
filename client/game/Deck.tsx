import React from "react";
import { targetResolution } from "../Camera";
import CardList from "./CardList";
import { CardStateInfo } from "../../common/card";
import { cardHeight, cardWidth } from "../Card";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const x = targetResolution.width - cardWidth;
  const y = targetResolution.height - cardHeight;

  return <CardList reverse cards={props.cards} x={x} y={y} />;
}
