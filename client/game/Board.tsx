import React from "react";
import { useContext } from "react";
import { cardHeight, cardWidth } from "../Card.js";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import { PlayerContext } from "./Game.js";
import BoardCard from "./BoardCard.js";
import { useCardInfoList } from "../cardinfolist.js";

export default function Board() {
  const player = useContext(PlayerContext);
  const board = useClientSelector((state) => state.game.current.players[player].board);
  const cards = useCardInfoList(board, [board]);

  const x = (targetResolution.width - cards.length * (cardWidth + 10)) / 2 + cardWidth / 2;
  const y = targetResolution.height * (2 / 4) + cardHeight / 2;

  return (
    <>
      {cards.map(({ state, info }, i) => (
        <BoardCard state={state} info={info} key={state.id} x={x + i * (cardWidth + 10)} y={y} />
      ))}
    </>
  );
}
