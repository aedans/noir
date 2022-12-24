import { useEffect, useLayoutEffect, useState } from "react";
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

export function getCardInfo(game: GameState, card: CardState, base = false) {
  let info = runPartialCardInfoComputation(cards[card.name], defaultUtil, game, card);
  if (!base) {
    info = defaultUtil.updateCardInfo(game, card, info);
  }

  return info;
}

export async function getCards() {
  return await fetch(`${serverOrigin}/cards.json`).then((x) => x.json());
}

export function useCardInfo(card: CardState) {
  const game = useClientSelector((state) => state.game.current);
  const hasLoaded = isLoaded(card);
  const [cardInfo, setCardInfo] = useState(runPartialCardInfoComputation(() => ({}), defaultUtil, game, card));

  useEffect(() => {
    if (!hasLoaded) {
      (async () => {
        await loadCard(card);
        setCardInfo(getCardInfo(game, card));
      })();
    }
  }, []);

  useLayoutEffect(() => {
    if (hasLoaded) {
      setCardInfo(getCardInfo(game, card));
    }
  }, [game]);

  return cardInfo;
}

export function useCardInfoList(states: CardState[], deps?: ReadonlyArray<unknown>) {
  const [cards, setCards] = useState([] as { state: CardState; info: CardInfo }[]);
  const game = useClientSelector((state) => state.game.current);

  useEffect(
    () => {
      (async () => {
        for (const card of states.filter((c) => !isLoaded(c))) {
          await loadCard(card);
        }

        setCards(states.filter((card) => isLoaded(card)).map((state) => ({ state, info: getCardInfo(game, state) })));
      })();
    },
    deps ? deps : [states]
  );

  return cards;
}
