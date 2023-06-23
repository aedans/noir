import { useState, useContext, useEffect } from "react";
import { CardState, CardStateInfo } from "../common/card";
import { isLoaded, loadCard } from "./cards";
import { CacheContext } from "./game/Game";
import { useClientSelector } from "./store";

export function useCardInfoList(states: CardState[], deps: ReadonlyArray<unknown>) {
  const [cards, setCards] = useState([] as CardStateInfo[]);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game.current);

  function resetCards() {
    setCards(states.filter((card) => isLoaded(card)).map((state) => ({ state, info: cache.getCardInfo(game, state) })));
  }

  useEffect(() => {
    const promises: Promise<any>[] = [];
    for (const card of states.filter((c) => !isLoaded(c))) {
      try {
        promises.push(loadCard(card).then(() => resetCards()));
      } catch (e) {
        console.error(e);
      }
    }

    Promise.all(promises).then(() => resetCards());
  }, deps);

  return cards;
}
