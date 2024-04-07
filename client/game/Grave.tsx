import React from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
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

export default function Grave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.players[player].grave);
  const cards = useCardInfoList([...grave].reverse(), [grave]);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} zoomOffsetY={gameCardHeightDiff} />, []);

  const x = gameCardWidthDiff;
  const y = targetResolution.height - gameCardHeight - gameCardHeightDiff * 2;

  return (
    <ExpandableCardList
      x={x}
      y={y}
      cardWidth={gameCardWidth}
      cardHeight={gameCardHeight}
      reversed
      cards={cards}
      card={card}
      hoverScale={gameCardZoom}
    />
  );
}
