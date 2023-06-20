import React, { useCallback } from "react";
import { useContext } from "react";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { opponentOf } from "../../common/gameSlice";
import { useCardInfoList } from "../cards";
import GameCard, { GameCardProps } from "./GameCard";
import ExpandableCardList from "../ExpandableCardList";
import { Container } from "react-pixi-fiber";

export default function OpponentGrave() {
  const player = useContext(PlayerContext);
  const grave = useClientSelector((state) => state.game.current.players[opponentOf(player)].grave);
  const cards = useCardInfoList([...grave], [grave]);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} />, []);

  const x = 0;
  const y = 0;

  return (
    <Container x={x} y={y}>
      <ExpandableCardList cards={cards} card={card} />
    </Container>
  );
}
