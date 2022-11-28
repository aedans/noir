import {
  CardState,
  defaultCardInfoComputation,
  PartialCardInfoComputation,
  runCardInfoComputation,
} from "../common/card";
import { GameState } from "../common/gameSlice";
import fs from "fs";

const cards: { [name: string]: PartialCardInfoComputation } = {};

export function getPartialCardInfoComputation(card: { name: string }): PartialCardInfoComputation {
  if (!cards[card.name]) {
    cards[card.name] = JSON.parse(fs.readFileSync(`./public/cards/${card.name}.json`, "utf-8"));
  }

  return cards[card.name];
}

export function getCardInfo(card: CardState, game: GameState) {
  const partial = getPartialCardInfoComputation(card);
  const required = defaultCardInfoComputation(partial);
  return runCardInfoComputation(required, card, game);
}
