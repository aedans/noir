import React, { useContext } from "react";
import { opponentOf } from "../../common/gameSlice";
import { targetResolution } from "../Camera";
import { cardHeight, cardWidth } from "../Card";
import { useCardInfoList } from "../cards";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard from "./GameCard";

export default function OpponentBoard() {
  const player = useContext(PlayerContext);
  const board = useClientSelector((state) => state.game.current.players[opponentOf(player)].board);
  const cards = useCardInfoList(board, [board]);

  const x = (targetResolution.width - cards.length * (cardWidth + 10)) / 2 + cardWidth / 2;
  const y = targetResolution.height * (1 / 4) + cardHeight / 2;

  return (
    <>
      {cards.map(({ state, info }, i) => (
        <GameCard info={info} state={state} key={state.id} x={x + i * (cardWidth + 10)} y={y} shouldDimWhenExhausted />
      ))}
    </>
  );
}
