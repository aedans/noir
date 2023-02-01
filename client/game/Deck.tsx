import React from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import CardList from "./CardList";
import { CardStateInfo } from "../../common/card";

export type DeckProps = {
  cards: CardStateInfo[];
};

export default function Deck(props: DeckProps) {
  const x = targetResolution.width - smallCardWidth;
  const y = targetResolution.height - smallCardHeight;

  return <CardList reverse cards={props.cards} x={x} y={y} />;
}
