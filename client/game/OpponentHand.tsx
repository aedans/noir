import React, { useContext } from "react";
import { opponentOf } from "../../common/gameSlice";
import { targetResolution } from "../Camera";
import { cardHeight, cardWidth } from "../Card";
import { useCardInfoList } from "../cards";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard from "./GameCard";

export default function OpponentHand() {
  const player = useContext(PlayerContext);
  const deck = useClientSelector((state) => state.game.current.players[opponentOf(player)].deck);
  const cards = useCardInfoList(deck, [deck]);

  const x = (targetResolution.width - cards.length * (cardWidth + 10)) / 2 + cardWidth / 2;
  const y = cardHeight / 2;

  return (
    <>
      {cards.map(({ state, info }, i) => (
        <GameCard state={state} info={info} key={state.id} x={x + i * (cardWidth + 10)} y={y} />
      ))}
    </>
  );
}
