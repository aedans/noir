import { cloneDeep, sample } from "lodash";
import { updateCardInfo, CardInfo, CardState, defaultCardState, PlayerState, Util } from "../common/card";

export const util: Util = { getCardInfo, defaultCardState, sample, copy: cloneDeep }

const cards: { [name: string]: CardInfo } = {}

export function removeCard(name: string) {
  delete cards[name];
}

export function getCardInfo(card: CardState, player: PlayerState, opponent: PlayerState, base: boolean = false) {
  if (!cards[card.name]) {
    cards[card.name] = require(`../assets/scripts/${card.name}.js`).card;
  }

  if (base) {
    return cards[card.name];
  } else {
    return updateCardInfo(util, cards[card.name], card, player, opponent);
  }
}
