import { PartialCardInfoComputation } from "../common/card";
import util, { Util } from "../common/util";

export const defaultUtil: Util = {
  ...util,
  getCardInfoImpl,
};

const cards: { [name: string]: PartialCardInfoComputation } = {};

export function getCardInfoImpl(card: { name: string }): PartialCardInfoComputation {
  if (!cards[card.name]) {
    cards[card.name] = require(`../public/cards/${card.name}.js`).card;
  }

  return cards[card.name];
}
