import { app } from "..";
import { button } from "../sprites/text";
import { beginState, pushState } from "../state";
import { below, center } from "../ui";
import { cardsState } from "./cards";
import { decksState } from "./decks";
import { queueState } from "./queue";

export function menuState() {
  beginState('');
  
  const queue = button("Queue");
  const decks = button("Decks");
  const cards = button("Cards");
  
  queue.on('pointerdown', () => pushState(menuState, () => decksState(queueState)));
  decks.on('pointerdown', () => pushState(menuState, decksState));
  cards.on('pointerdown', () => pushState(menuState, cardsState));

  center(queue, app.screen);
  center(decks, app.screen);
  center(cards, app.screen);
  below(queue, decks, 5);
  below(decks, cards, 5);

  app.stage.addChild(queue);
  app.stage.addChild(decks);
  app.stage.addChild(cards);
}