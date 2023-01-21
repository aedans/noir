import { useEffect, useLayoutEffect, useState } from "react";
import { AnyAction } from "redux";
import { CardInfo, CardState, PartialCardInfoComputation, runPartialCardInfoComputation } from "../common/card";
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

export function isLoaded(card: { name: string }) {
  return card.name in cards;
}

export async function loadCard(card: { name: string }) {
  if (!isLoaded(card)) {
    cards[card.name] = await getPartialCardInfoComputation(card);
  }
}

export async function loadCardsFromAction(action: AnyAction) {
  if (action.type == "game/addCard") {
    await loadCard({ name: action.payload.name });
  }

  if (action.type == "history/setAction") {
    await loadCardsFromAction(action.payload.action);
  }
}

export function getCardInfo(game: GameState, card: CardState, base = false) {
  try {
    if (!(card.name in cards)) {
      throw new Error(`Card ${card.name} is not loaded`);
    }

    let info = runPartialCardInfoComputation(cards[card.name], defaultUtil, game, card);
    if (!base) {
      info = defaultUtil.updateCardInfo(game, card, info);
    }

    return info;
  } catch (e) {
    console.error(`Error getting card info for ${card.name}`);
    throw e;
  }
}

export async function getCards() {
  return await fetch(`${serverOrigin}/cards.json`).then((x) => x.json());
}

export function useCardInfo(card: CardState) {
  const game = useClientSelector((state) => state.game.current);
  const [cardInfo, setCardInfo] = useState(runPartialCardInfoComputation(() => ({}), defaultUtil, game, card));

  useEffect(() => {
    let isMounted = true;

    if (!isLoaded(card)) {
      (async () => {
        await loadCard(card);
        if (!isMounted) return;
        setCardInfo(getCardInfo(game, card));
      })();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (isLoaded(card)) {
      setCardInfo(getCardInfo(game, card));
    }
  }, [game]);

  return cardInfo;
}

export type CardInfoList = { state: CardState; info: CardInfo }[];

export function useCardInfoList(states: CardState[], deps?: ReadonlyArray<unknown>) {
  const [cards, setCards] = useState([] as CardInfoList);
  const game = useClientSelector((state) => state.game.current);

  useEffect(
    () => {
      (async () => {
        for (const card of states.filter((c) => !isLoaded(c))) {
          try {
            await loadCard(card);
          } catch (e) {
            console.error(e);
          }
        }

        setCards(states.filter((card) => isLoaded(card)).map((state) => ({ state, info: getCardInfo(game, state) })));
      })();
    },
    deps ? deps : [states]
  );

  return cards;
}
