import React from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import CardList from "./CardList";
import { CardState } from "../../common/card";
import deepEqual from "deep-equal";

export type DeckProps = {
  cards: CardState[];
};

export default function Deck(props: DeckProps) {
  const x = targetResolution.width - smallCardWidth;
  const y = targetResolution.height - smallCardHeight;

  return <CardList cards={props.cards} x={x} y={y} />;
}
