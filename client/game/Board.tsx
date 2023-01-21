import React, { useContext } from "react";
import { cardHeight, smallCardHeight, smallCardWidth } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { PlayerContext, SocketContext } from "./Game";
import BoardCard from "./BoardCard";

export default function Board() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[player].board);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      socket.emit("action", { type: "do", id: state.id });
    },
    collect: () => ({}),
  }));

  const x = (targetResolution.width - cards.length * (smallCardWidth + 10)) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (2 / 4) + smallCardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      {cards.map((state, i) => (
        <BoardCard state={state} key={state.id} x={x + i * (smallCardWidth + 10)} y={y} />
      ))}
    </>
  );
}
