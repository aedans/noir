import CardInfoCache from "../common/CardInfoCache.js";
import { CardState, PartialCardInfoComputation } from "../common/card.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const cards: { [name: string]: PartialCardInfoComputation } = {};

export default class LocalCardInfoCache extends CardInfoCache {
  static instance = new LocalCardInfoCache();

  getPartialCardInfoComputation(card: CardState): PartialCardInfoComputation {
    if (!cards[card.name]) {
      cards[card.name] = require(`../public/cards/${card.name}.cjs`).card;
    }

    return cards[card.name];
  }
}
