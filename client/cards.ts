import { CardInfo } from "../common/card";

export const cardNames = fetch(`${window.location.origin}/cards`).then(res => res.json() as Promise<string[]>);
const cards: { [name: string]: CardInfo } = {};

export async function loadCards() {
  for (const name of await cardNames) {
    cards[name] = await cardInfo(name);
  }
}

export async function getCardInfo(name: string): Promise<CardInfo> {
  if (!cards[name]) cards[name] = await cardInfo(name);
  return cards[name];
}

async function cardInfo(name: string): Promise<CardInfo> {
  return await fetch(`${window.location.origin}/cards/${name}.json`).then(x => x.json());
}
