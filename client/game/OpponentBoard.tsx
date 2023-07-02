import React from "react";
import { useContext } from "react";
import { opponentOf } from "../../common/gameSlice.js";
import { targetResolution } from "../Camera.js";
import { cardHeight, cardWidth } from "../Card.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import GameCard from "./GameCard.js";
import { useCardInfoList } from "../cardinfolist.js";

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
