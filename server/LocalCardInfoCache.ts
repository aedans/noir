import CardInfoCache from "../common/CardInfoCache.js";
import { CardState, PartialCardInfoComputation } from "../common/card.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cards: { [name: string]: PartialCardInfoComputation } = {};

export default class LocalCardInfoCache extends CardInfoCache {
  static instance = new LocalCardInfoCache();

  getPartialCardInfoComputation(card: CardState): PartialCardInfoComputation {
    if (!card.name) {
      throw new Error(`Card name is "${card.name}"`);
    }

    if (!cards[card.name]) {
      const path = `../public/cards/${card.name}.cjs`;  
      cards[card.name] = require(path).card;
    }

    return cards[card.name];
  }
}
