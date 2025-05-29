import importSync from "import-sync";
import CardInfoCache from "../common/CardInfoCache.js";
import { CardState, PartialCardInfo } from "../common/card.js";

const cards: { [name: string]: PartialCardInfo } = {};

export default class LocalCardInfoCache extends CardInfoCache {
  static instance = new LocalCardInfoCache();

  getPartialCardInfo(card: CardState): PartialCardInfo {
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
