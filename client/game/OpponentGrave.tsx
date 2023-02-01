import React from "react";
import { useContext } from "react";
import CardList from "./CardList";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { opponentOf } from "../../common/gameSlice";
import { useCardInfoList } from "../cards";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[opponentOf(player)].grave);
  const cards = useCardInfoList([...grave].reverse(), [grave]);

  const x = 0;
  const y = 0;

  return <CardList cards={cards} x={x} y={y} />;
}
