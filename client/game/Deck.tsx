import React from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import CardList from "./CardList";
import { CardState } from "../../common/card";

export type DeckProps = {
  cards: CardState[];
};

export default function Deck(props: DeckProps) {
  const x = targetResolution.width - smallCardWidth;
  const y = targetResolution.height - smallCardHeight;

  return <CardList reverse cards={props.cards} x={x} y={y} />;
}
