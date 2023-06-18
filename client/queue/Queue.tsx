import React, { useEffect, useState } from "react";
import { batchActions } from "redux-batched-actions";
import { io } from "socket.io-client";
import { useLocation } from "wouter";
import { PlayerId, opponentOf } from "../../common/gameSlice";
import { reset } from "../../common/historySlice";
import { NoirClientSocket } from "../../common/network";
import { QueueName } from "../../server/Queue";
import Button from "../Button";
import { targetResolution } from "../Camera";
import { loadCardsFromAction, serverOrigin } from "../cards";
import Game, { ConnectionContext, PlayerContext } from "../game/Game";
import { getUsername, useClientDispatch, useClientSelector } from "../store";
import { setWon } from "../wins";

export default function Queue(props: { params: { queue: string; deck: string } }) {
  let [player, setPlayer] = useState(null as PlayerId | null);
  let [names, setNames] = useState(["", ""] as readonly [string, string]);
  const [socket, setSocket] = useState(null as NoirClientSocket | null);
  const decks = useClientSelector((state) => state.decks);
  const [message, setMessage] = useState("");
  const [_, setLocation] = useLocation();
  const dispatch = useClientDispatch();

  useEffect(() => {
    const socket: NoirClientSocket = io(serverOrigin);

    socket.on("actions", (actions, name) => {
      (async () => {
        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        dispatch(batchActions(actions, name));
      })();
    });

    socket.on("error", (message) => {
      setMessage("");
      setMessage(message);
    });

    socket.on("end", (winner) => {
      setMessage("");
      if (winner == player) {
        setMessage("You Win!");
        setWon(names[opponentOf(player)]);
      } else {
        setMessage("You Lose.");
      }

      setTimeout(() => {
        setLocation("/");
      }, 2000);
    });

    socket.on("init", (p, ns) => {
      setPlayer((player = p));
      setNames((names = ns));

      socket.emit("init", decks[decodeURIComponent(props.params.deck)]);
    });

    setSocket(socket);

    socket.emit("queue", decodeURIComponent(props.params.queue) as QueueName, getUsername());

    return () => {
      socket?.close();
      dispatch(reset());
    };
  }, []);

  if (player == null || socket == null) {
    return <Button text={"Waiting for player"} x={targetResolution.width / 2} y={targetResolution.height / 2} />;
  } else {
    return (
      <ConnectionContext.Provider
        value={{
          emit: (action) => socket.emit("action", action),
          concede: () => socket.emit("concede"),
        }}
      >
        <PlayerContext.Provider value={player}>
          <Game message={message} />
        </PlayerContext.Provider>
      </ConnectionContext.Provider>
    );
  }
}
