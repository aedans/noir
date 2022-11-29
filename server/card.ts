import {
  CardState,
  defaultCardInfoComputation,
  PartialCardInfoComputation,
  runCardInfoComputation,
} from "../common/card";
import { GameState } from "../common/gameSlice";

const cards: { [name: string]: PartialCardInfoComputation } = {};

export function getPartialCardInfoComputation(card: { name: string }): PartialCardInfoComputation {
  if (!cards[card.name]) {
    cards[card.name] = require(`../public/cards/${card.name}.js`).card;
  }
  
  return cards[card.name];
}

export function getCardInfo(card: CardState, game: GameState) {
  const partial = getPartialCardInfoComputation(card);
  const required = defaultCardInfoComputation(partial);
  return runCardInfoComputation(required, card, game);
}
