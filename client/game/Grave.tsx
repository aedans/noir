import React from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { useCardInfoList } from "../cards";
import { cardHeight } from "../Card";
import GameCard from "./GameCard";
import { ExpandableCardList } from "../ExpandableCardList";

export default function Grave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[player].grave);
  const cards = useCardInfoList([...grave].reverse(), [grave]);

  const x = 0;
  const y = targetResolution.height - cardHeight;

  return <ExpandableCardList reversed cards={cards} x={x} y={y} card={(props) => <GameCard {...props} />} />;
}
