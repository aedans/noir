import React from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import { cardHeight } from "../Card.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import ExpandableCardList from "../ExpandableCardList.js";
import { Container } from "react-pixi-fiber";
import { useCardInfoList } from "../cardinfolist.js";

export default function Grave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[player].grave);
  const cards = useCardInfoList([...grave].reverse(), [grave]);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} />, []);

  const x = 0;
  const y = targetResolution.height - cardHeight;

  return (
    <Container x={x} y={y}>
      <ExpandableCardList reversed cards={cards} card={card} />
    </Container>
  );
}
