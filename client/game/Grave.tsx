import React from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight } from "../Card";
import CardList from "./CardList";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";

export default function Grave() {
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = game.players[player].grave;
  const sortedCards = [...cards].reverse();

  const x = 0;
  const y = targetResolution.height - smallCardHeight;

  return <CardList cards={sortedCards} x={x} y={y} />;
}
