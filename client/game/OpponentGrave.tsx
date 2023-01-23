import React from "react";
import { useContext } from "react";
import CardList from "./CardList";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { opponentOf } from "../../common/gameSlice";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[opponentOf(player)].grave);
  const sortedCards = [...cards].reverse();

  const x = 0;
  const y = 0;

  return <CardList cards={sortedCards} x={x} y={y} />;
}
