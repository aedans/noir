import React from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import { opponentOf } from "../../common/gameSlice.js";
import GameCard, {
  GameCardProps,
  gameCardHeight,
  gameCardHeightDiff,
  gameCardWidth,
  gameCardWidthDiff,
  gameCardZoom,
} from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";
import { useCardInfoList } from "../CardList.js";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.players[opponentOf(player)].grave);
  const cards = useCardInfoList([...grave], [grave]);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} zoomOffsetY={gameCardHeightDiff} />, []);

  const x = gameCardWidthDiff;
  const y = 0;

  return (
    <ExpandableCardList
      x={x}
      y={y}
      cardWidth={gameCardWidth}
      cardHeight={gameCardHeight}
      cards={cards}
      card={card}
      hoverScale={gameCardZoom}
    />
  );
}
