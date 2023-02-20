import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientDispatch, useClientSelector } from "../store";
import EndTurn from "./EndTurn";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import { PlayerId } from "../../common/gameSlice";
import Resources from "./Resources";
import { batchActions } from "redux-batched-actions";
import { loadCardsFromAction, serverOrigin } from "../cards";
import OpponentBoard from "./OpponentBoard";
import { io, Socket } from "socket.io-client";
import Button from "../Button";
import OpponentHand from "./OpponentHand";
import { reset } from "../../common/historySlice";
import Message from "./Message";
import Grave from "./Grave";
import { Target } from "../../common/card";
import HandAndDeck from "./HandAndDeck";
import OpponentGrave from "./OpponentGrave";

export const SocketContext = React.createContext(null as unknown as Socket);
export const PlayerContext = React.createContext(0 as PlayerId);

export const HoverContext = React.createContext(
  {} as {
    hover: Target[];
    setHover: Dispatch<SetStateAction<Target[]>>;
  }
);

export const PreparedContext = React.createContext(
  {} as {
    prepared: Target[];
    setPrepared: Dispatch<SetStateAction<Target[]>>;
  }
)

export default function Game(props: { params: { queue: string; deck: string } }) {
  const [player, setPlayer] = useState(null as PlayerId | null);
  const [socket, setSocket] = useState(null as Socket | null);
  const [hover, setHover] = useState([] as Target[]);
  const [prepared, setPrepared] = useState([] as Target[]);
  const [message, setMessage] = useState("");
  const cards = useRef({} as MoveAnimationState);
  const decks = useClientSelector((state) => state.decks);
  const dispatch = useClientDispatch();

  useEffect(() => {
    const socket = io(serverOrigin);

    socket.on("actions", (actions, name) => {
      (async () => {
        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        dispatch(batchActions(actions, name));
        setPrepared([]);
      })();
    });

    socket.on("error", (message) => {
      setMessage("");
      setMessage(message);
    });

    socket.on("init", (player) => {
      setPlayer(player);

      socket.emit("init", {
        deck: decks[decodeURIComponent(props.params.deck)],
      });
    });

    setSocket(socket);

    socket.emit("queue", decodeURIComponent(props.params.queue));

    return () => {
      socket?.close();
      dispatch(reset());
    };
  }, []);

  if (player == null || socket == null) {
    return <Button text={"Waiting for player"} x={targetResolution.width / 2} y={targetResolution.height / 2} />;
  }

  return (
    <SocketContext.Provider value={socket}>
      <MoveAnimationContext.Provider value={cards}>
        <PlayerContext.Provider value={player}>
          <HoverContext.Provider value={{ hover, setHover }}>
            <PreparedContext.Provider value={{ prepared, setPrepared }}>
              <Container>
                <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
                <OpponentHand />
                <OpponentBoard />
                <Board />
                <EndTurn />
                <Resources />
                <HandAndDeck />
                <OpponentGrave />
                <Grave />
                <Message text={message} />
              </Container>
            </PreparedContext.Provider>
          </HoverContext.Provider>
        </PlayerContext.Provider>
      </MoveAnimationContext.Provider>
    </SocketContext.Provider>
  );
}
