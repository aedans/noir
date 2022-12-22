import { useEffect, useState } from "react";
import { AnyAction } from "redux";
import { CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "../common/card";
import { GameState } from "../common/gameSlice";
import util from "../common/util";
import { useClientSelector } from "./store";

export const serverOrigin = window.location.origin.toString().replace(/5173/g, "8080");

export const defaultUtil = {
  ...util,
  getCardInfo,
};

const cards: { [name: string]: PartialCardInfoComputation } = {};

async function getPartialCardInfoComputation(card: { name: string }) {
  try {
    const cardString = await fetch(`${serverOrigin}/cards/${card.name}.js`).then((x) => x.text());
    const cardInfo = {} as { card: PartialCardInfoComputation };
    new Function("exports", cardString)(cardInfo);
    return cardInfo.card;
  } catch (e) {
    console.error(`Error loading card ${card.name}`);
    throw e;
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

export async function getCards() {
  return await fetch(`${serverOrigin}/cards.json`).then((x) => x.json());
}

export function useCardInfo(card: CardState) {
  const game = useClientSelector((state) => state.game.current);
  const hasLoaded = card.name in cards;
  const [cardInfo, setCardInfo] = useState(
    hasLoaded ? getCardInfo(game, card) : runPartialCardInfoComputation(() => ({}), defaultUtil, game, card)
  );

  useEffect(() => {
    if (!hasLoaded) {
      (async () => {
        await loadCard(card);
        setCardInfo(getCardInfo(game, card));
      })();
    }
  }, []);

  return cardInfo;
}
