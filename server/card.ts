import { CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "../common/card";
import { GameState } from "../common/gameSlice";
import util from "../common/util";

const cards: { [name: string]: PartialCardInfoComputation } = {};

export function getPartialCardInfoComputation(card: { name: string }): PartialCardInfoComputation {
  if (!cards[card.name]) {
    cards[card.name] = require(`../public/cards/${card.name}.js`).card;
  }

  return cards[card.name];
}

export function getCardInfo(game: GameState, card: CardState) {
  return runPartialCardInfoComputation(getPartialCardInfoComputation(card), util, game, card);
}
