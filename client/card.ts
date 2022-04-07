import { cloneDeep, sample, isEqual } from "lodash";
import { Util, CardInfo, updateCardInfo, CardState, defaultCardState, PlayerState } from "../common/card";

export const util: Util = { getCardInfo, defaultCardState, sample, isEqual, cloneDeep }

const cards: { [name: string]: CardInfo } = {};

export async function getCards() {
  const res = await fetch(`http://${window.location.hostname}:${window.location.port}/cards`);
  const cards: string[] = await res.json();
  return cards;
}

export function getCardInfo(card: CardState, player: PlayerState, opponent: PlayerState, base: boolean = false) {
  if (base) {
    return cards[card.name];
  } else {
    return updateCardInfo(util, cards[card.name], card, player, opponent);
  }
}

async function cardInfo(name: string) {
  const cardString = await fetch(`http://${window.location.hostname}:${window.location.port}/scripts/${name}.js`).then(x => x.text());
  const cardInfo: { card: CardInfo } = {} as { card: CardInfo };
  new Function("exports", cardString)(cardInfo);
  return cardInfo.card;
}

export async function loadCardInfo(card: CardState, player: PlayerState, opponent: PlayerState) {
  if (!cards[card.name]) {
    cards[card.name] = await cardInfo(card.name);
  }

  return getCardInfo(card, player, opponent);
}

export async function loadCards() {
  const promises: Promise<void>[] = [];
  for (const card of await getCards()) {
    if (!cards[card]) {
      promises.push(cardInfo(card).then(c => {
        cards[card] = c;
      }));
    }
  }
  await Promise.all(promises);
}
