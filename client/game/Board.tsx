import React, { createRef, ReactNode, useContext } from "react";
import { Container } from "react-pixi-fiber";
import { cardHeight, cardWidth } from "../Card";
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
      socket.current.emit("action", { type: "play", id: state.id });
    },
    collect: () => ({}),
  }));

  let x = (targetResolution.width - cards.length * (gameCardWidth + 10)) / 2 + gameCardWidth / 2;
  let y = targetResolution.height * (2 / 4) + gameCardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <Container x={x} y={y}>
        <EnterExitAnimator elements={cards}>
          {(state, status, i) =>
            i != null ? (
              <GameCard state={state} status={status} key={state.id} x={i * (gameCardWidth + 10)} />
            ) : (
              <GameCard useLastPos={true} state={state} status={status} key={state.id} ref={createRef()} />
            )
          }
        </EnterExitAnimator>
      </Container>
    </>
  );
}
