import React, { useCallback } from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { useCardInfoList } from "../cards";
import { cardHeight } from "../Card";
import GameCard, { GameCardProps } from "./GameCard";
import ExpandableCardList from "../ExpandableCardList";
import { Container } from "react-pixi-fiber";

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
