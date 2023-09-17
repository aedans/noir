import React from "react";
import { useContext } from "react";
import { opponentOf } from "../../common/gameSlice.js";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import GameCard, { gameCardHeight, gameCardWidth, gameCardWidthDiff } from "./GameCard.js";
import { useCardInfoList } from "../CardList.js";

export default function OpponentBoard() {
  const player = useContext(PlayerContext);
  const board = useClientSelector((state) => state.game.current.players[opponentOf(player)].board);
  const cards = useCardInfoList(board, [board]);

  const scale = Math.min(1, 8 / cards.length);
  const scaledCardWidth = scale * gameCardWidth;
  const x = (targetResolution.width - cards.length * scaledCardWidth) / 2 + scaledCardWidth / 2;
  const y = targetResolution.height * (1 / 4) + gameCardHeight / 2;

  return (
    <>
      {cards.map(({ state, info }, i) => (
        <GameCard
          scale={scale}
          info={info}
          state={state}
          key={state.id}
          x={x + i * (scaledCardWidth + gameCardWidthDiff)}
          y={y}
          shouldDimWhenExhausted
        />
      ))}
    </>
  );
}
