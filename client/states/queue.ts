import { io } from "socket.io-client";
import { app } from "..";
import { Init } from "../../common/card";
import { loadCards } from "../card";
import { getDeck } from "../decks";
import { button } from "../sprites/text";
import { beginState } from "../state";
import { center } from "../ui";
import { gameState } from "./game";

export async function queueState(name: string) {
  beginState(`game/${name}`);
  
  const text = button("Waiting for players");

  center(text, app.screen);

  app.stage.addChild(text);

  await loadCards();

  const socket = io(`http://${window.location.hostname}:${window.location.port}`);

  window.addEventListener('popstate', () => {
    socket.close();
  });

  socket.on('start', () => {
    const init: Init = {
      deck: getDeck(name)
    };

    socket.emit('init', init);

    gameState(name, socket);
  });
}