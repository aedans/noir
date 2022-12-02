import React, { Context, MutableRefObject, useEffect } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board";
import Hand from "./Hand";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { io, Socket } from "socket.io-client";
import { GameCardContext, GameCardStates } from "./GameCard";
import { useClientDispatch } from "../store";
import EndTurn from "./EndTurn";

export const SocketContext = React.createContext(undefined as unknown) as Context<MutableRefObject<Socket>>;
export const PlayerContext = React.createContext(0);

export default function Game() {
  const cards = React.useRef({} as GameCardStates);
  const socket = React.useRef() as MutableRefObject<Socket>;
  const dispatch = useClientDispatch();

  useEffect(() => {
    const url = window.location.toString().replace(/[0-9]{4}/g, "8080");

    socket.current = io(url);

    socket.current.on("action", (action) => dispatch(action));

    socket.current.emit("queue");

    return () => {
      socket.current.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <GameCardContext.Provider value={cards}>
        <PlayerContext.Provider value={0}>
          <Container sortableChildren={true}>
            <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
            <EndTurn />
            <Board />
            <Hand />
          </Container>
        </PlayerContext.Provider>
      </GameCardContext.Provider>
    </SocketContext.Provider>
  );
}
