import React from "react";
import { useContext } from "react";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { opponentOf } from "../../common/gameSlice";
import { useCardInfoList } from "../cards";
import GameCard from "./GameCard";
import { ExpandableCardList } from "../ExpandableCardList";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[opponentOf(player)].grave);
  const cards = useCardInfoList([...grave], [grave]);

  const x = 0;
  const y = 0;

  return <ExpandableCardList cards={cards} x={x} y={y} card={(props) => <GameCard {...props} />} />;
}
