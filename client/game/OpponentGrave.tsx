import React from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import { opponentOf } from "../../common/gameSlice.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";
import { useCardInfoList } from "../CardList.js";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[opponentOf(player)].grave);
  const cards = useCardInfoList([...grave], [grave]);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} />, []);

  const x = 0;
  const y = 0;

  return <ExpandableCardList x={x} y={y} cards={cards} card={card} />;
}
