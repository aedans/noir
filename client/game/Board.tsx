import React, { createRef, useContext } from "react";
import { cardHeight } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { PlayerContext, SocketContext } from "./Game";
import GameCard, { gameCardHeight, gameCardWidth } from "./GameCard";
import { EnterExitAnimator } from "../EnterExitAnimation";

export default function Board() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.players[player].board);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      socket.emit("action", { type: "play", id: state.id });
    },
    collect: () => ({}),
  }));

  const x = (targetResolution.width - cards.length * (gameCardWidth + 10)) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (2 / 4) + gameCardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <EnterExitAnimator elements={cards}>
        {(state, status, i) =>
          i != null ? (
            <GameCard state={state} status={status} key={state.id} x={x + i * (gameCardWidth + 10)} y={y} />
          ) : (
            <GameCard useLastPos={true} state={state} status={status} key={state.id} ref={createRef()} />
          )
        }
      </EnterExitAnimator>
    </>
  );
}
