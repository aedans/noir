import React from "react";
import { useContext } from "react";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import BoardCard from "./BoardCard.js";
import { useCardInfoList } from "../CardList.js";
import { gameCardHeight, gameCardWidth, gameCardWidthDiff } from "./GameCard.js";

export default function Board() {
  const player = useContext(PlayerContext);
  const board = useClientSelector((state) => state.game.players[player].board);
  const cards = useCardInfoList(board, [board]);

  const scale = Math.min(1, 8 / cards.length);
  const scaledCardWidth = scale * gameCardWidth;
  const x = (targetResolution.width - cards.length * scaledCardWidth) / 2 + scaledCardWidth / 2;
  const y = targetResolution.height * (3 / 4) - gameCardHeight / 2;

  return (
    <>
      {cards.map(({ state, info }, i) => (
        <BoardCard
          scale={scale}
          state={state}
          info={info}
          key={state.id}
          x={x + i * (scaledCardWidth + gameCardWidthDiff)}
          y={y}
        />
      ))}
    </>
  );
}
