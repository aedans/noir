import React, { useContext } from "react";
import { cardHeight, cardWidth } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { ConnectionContext, PlayerContext, PreparedContext } from "./Game";
import BoardCard from "./BoardCard";
import { useCardInfoList } from "../cards";

export default function Board() {
  const connection = useContext(ConnectionContext);
  const player = useContext(PlayerContext);
  const { prepared } = useContext(PreparedContext);
  const board = useClientSelector((state) => state.game.current.players[player].board);
  const cards = useCardInfoList(board, [board]);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      connection.emit({ type: "do", id: state.id, prepared });
    },
    collect: () => ({}),
  }), [prepared]);

  const x = (targetResolution.width - cards.length * (cardWidth + 10)) / 2 + cardWidth / 2;
  const y = targetResolution.height * (2 / 4) + cardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={targetResolution.height * (3 / 4)}
        renderable={false}
      />
      {cards.map(({ state, info }, i) => (
        <BoardCard state={state} info={info} key={state.id} x={x + i * (cardWidth + 10)} y={y} />
      ))}
    </>
  );
}
