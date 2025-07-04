import React from "react";
import { useContext, useMemo } from "react";
import { CardStateInfo } from "../../common/card.js";
import { canPayPlan, ordered, planResources } from "../../common/util.js";
import { useClientSelector } from "../store.js";
import Deck from "./Deck.js";
import { CacheContext, PlanContext, PlayerContext } from "./Game.js";
import Hand from "./Hand.js";
import { useCardInfoList } from "../CardList.js";

export default function HandAndDeck() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const { plan } = useContext(PlanContext);
  const game = useClientSelector((state) => state.game);
  const cards = useCardInfoList(game.players[player].deck, [game]);

  const { hand, deck } = useMemo(() => {
    const hand = [] as CardStateInfo[];
    const deck = [] as CardStateInfo[];

    for (const card of ordered(cards, ["color", "money"], (card) => card.info)) {
      if (plan.some((x) => x.card.id == card.state.id)) {
        continue;
      }

      if (canPayPlan(cache, game, player, plan, { type: "play", card: card.state })) {
        hand.push(card);
      } else {
        deck.push(card);
      }
    }

    return { hand, deck };
  }, [cards, plan]);

  return (
    <>
      <Hand cards={hand} />
      <Deck cards={deck} />
    </>
  );
}
