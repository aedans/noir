import { CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "../common/card";
import { GameState } from "../common/gameSlice";
import util from "../common/util";

export const defaultUtil = {
  ...util,
  getCardInfo,
};

const cards: { [name: string]: PartialCardInfoComputation } = {};

export function getPartialCardInfoComputation(card: { name: string }): PartialCardInfoComputation {
  if (!cards[card.name]) {
    cards[card.name] = require(`../public/cards/${card.name}.js`).card;
  }

  return cards[card.name];
}

export function getCardInfo(game: GameState, card: CardState, base = false) {
  let info = runPartialCardInfoComputation(getPartialCardInfoComputation(card), defaultUtil, game, card);
  if (!base) {
    info = defaultUtil.updateCardInfo(game, card, info);
  }

  return info;
}
