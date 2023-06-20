import React, { useContext } from "react";
import { cardHeight, cardWidth } from "../Card";
import { useDrop } from "react-dnd";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import BoardCard from "./BoardCard";
import { useCardInfoList } from "../cards";

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
