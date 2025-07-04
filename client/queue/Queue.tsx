import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "wouter";
import { PlayerId, opponentOf, reset } from "../../common/gameSlice.js";
import { NoirClientSocket, QueueName } from "../../common/network.js";
import Button from "../Button.js";
import { targetResolution } from "../Camera.js";
import { loadCardsFromAction, serverOrigin, trpc } from "../cards.js";
import Game, { ConnectionContext, CosmeticContext, PlanContext, PlayerContext } from "../game/Game.js";
import { getUsername, useClientDispatch, useClientSelector } from "../store.js";
import { setWon } from "../wins.js";
import { CardCosmetic } from "../../common/card.js";
import { batch } from "react-redux";
import { PlanProps } from "../../common/util.js";

export default function Queue(props: { params: { queue: string; deck?: string } }) {
  let [player, setPlayer] = useState(null as PlayerId | null);
  let [names, setNames] = useState(["", ""] as readonly [string, string]);
  const [socket, setSocket] = useState(null as NoirClientSocket | null);
  const [cosmetics, setCosmetics] = useState({} as { [id: string]: CardCosmetic });
  const decks = useClientSelector((state) => state.decks);
  const [message, setMessage] = useState("");
  const [_, setLocation] = useLocation();
  const dispatch = useClientDispatch();
  const [plan, setPlan] = useState([] as PlanProps[]);

  useEffect(() => {
    const socket: NoirClientSocket = io(serverOrigin);

    socket.on("actions", (actions) => {
      (async () => {
        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        batch(() => {
          for (const action of actions) {
            dispatch(action);
          }

          setPlan([]);
        });
      })();
    });

    socket.on("cosmetic", (id, cosmetic) => {
      setCosmetics((cs) => ({ ...cs, [id]: cosmetic }));
    });

    socket.on("error", (message) => {
      setMessage("");
      setMessage(message);
    });

    socket.on("end", (winner) => {
      setMessage("");
      if (winner == "draw") {
        setMessage("Draw.");
      } else if (winner == player) {
        setMessage(`You Win!`);
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

      if (props.params.deck) {
        socket.emit("init", decks[decodeURIComponent(props.params.deck)]);
      } else {
        socket.emit("init", {
          cards: {},
        });
      }
    });

    setSocket(socket);

    trpc.auth
      .query()
      .then(async (profile) => {
        const username = await getUsername();
        socket.emit("queue", decodeURIComponent(props.params.queue) as QueueName, username, profile.token);
      })
      .catch(async () => {
        const username = await getUsername();
        socket.emit("queue", decodeURIComponent(props.params.queue) as QueueName, username, null);
      });

    return () => {
      socket?.close();
      dispatch(reset({ source: undefined }));
    };
  }, []);

  if (player == null || socket == null) {
    return (
      <Button
        text={message == "" ? "Waiting for player" : message}
        x={targetResolution.width / 2}
        y={targetResolution.height / 2}
      />
    );
  } else {
    return (
      <ConnectionContext.Provider
        value={{
          plan: (plan) => socket.emit("plan", plan),
          concede: () => socket.emit("concede"),
        }}
      >
        <PlayerContext.Provider value={player}>
          <CosmeticContext.Provider value={cosmetics}>
            <PlanContext.Provider value={{ plan, setPlan }}>
              <Game message={message} />
            </PlanContext.Provider>
          </CosmeticContext.Provider>
        </PlayerContext.Provider>
      </ConnectionContext.Provider>
    );
  }
}
