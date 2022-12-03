import React, { Context, MutableRefObject, useEffect } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board";
import Hand from "./Hand";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { io, Socket } from "socket.io-client";
import { useClientDispatch, useClientSelector } from "../store";
import EndTurn from "./EndTurn";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import { useSearchParams } from "react-router-dom";
import { reset } from "../../common/gameSlice";

export const SocketContext = React.createContext(undefined as unknown) as Context<MutableRefObject<Socket>>;
export const PlayerContext = React.createContext(0);

export default function Game() {
  const [searchParams] = useSearchParams();
  const cards = React.useRef({} as MoveAnimationState);
  const socket = React.useRef() as MutableRefObject<Socket>;
  const decks = useClientSelector((state) => state.decks);
  const dispatch = useClientDispatch();

  useEffect(() => {
    const url = window.location.origin.toString().replace(/5173/g, "8080");

    socket.current = io(url);

    socket.current.on("action", (action) => dispatch(action));

    socket.current.emit("queue");

    socket.current.emit("init", {
      deck: decks[searchParams.get("deck")!],
    });

    return () => {
      socket.current.close();

      dispatch(reset());
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <MoveAnimationContext.Provider value={cards}>
        <PlayerContext.Provider value={0}>
          <Container sortableChildren={true}>
            <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
            <Board />
            <Hand />
            <EndTurn />
          </Container>
        </PlayerContext.Provider>
      </MoveAnimationContext.Provider>
    </SocketContext.Provider>
  );
}
