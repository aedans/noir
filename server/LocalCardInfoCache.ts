import importSync from "import-sync";
import CardInfoCache from "../common/CardInfoCache.js";
import { CardState, PartialCardInfoComputation } from "../common/card.js";

const cards: { [name: string]: PartialCardInfoComputation } = {};

export default class LocalCardInfoCache extends CardInfoCache {
  static instance = new LocalCardInfoCache();

  getPartialCardInfoComputation(card: CardState): PartialCardInfoComputation {
    if (!card.name) {
      throw new Error(`Card name is "${card.name}"`);
    }

    if (!cards[card.name]) {
      const path = `../cards/${card.name}`;
      cards[card.name] = importSync(path).card;
    }

    return cards[card.name];
  }
}
