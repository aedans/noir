import { AnyAction } from "redux";
import { CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "../common/card";
import { GameState } from "../common/gameSlice";
import util from "../common/util";

export const defaultUtil = {
  ...util,
  getCardInfo,
};

const cards: { [name: string]: PartialCardInfoComputation } = {};

async function getPartialCardInfoComputation(card: { name: string }) {
  const cardString = await fetch(`${window.location.origin}/cards/${card.name}.js`).then((x) => x.text());
  const cardInfo = {} as { card: PartialCardInfoComputation };
  new Function("exports", cardString)(cardInfo);
  return cardInfo.card;
}

export async function loadCardsFromAction(action: AnyAction) {
  if (action.type == "game/createCard") {
    await loadCard({ name: action.payload.name });
  }
}

export async function loadCard(card: { name: string }) {
  if (!(card.name in cards)) {
    cards[card.name] = await getPartialCardInfoComputation(card);
  }
}

export function getCardInfo(game: GameState, card: CardState) {
  return runPartialCardInfoComputation(cards[card.name], defaultUtil, game, card);
}
