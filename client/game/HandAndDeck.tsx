import React from "react";
import { useContext, useMemo } from "react";
import { CardStateInfo } from "../../common/card.js";
import util, { ordered } from "../../common/util.js";
import { useClientSelector } from "../store.js";
import Deck from "./Deck.js";
import { CacheContext, PlayerContext } from "./Game.js";
import Hand from "./Hand.js";
import { useCardInfoList } from "../CardList.js";

export default function HandAndDeck() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck, [game]);

  const { hand, deck } = useMemo(() => {
    const hand = [] as CardStateInfo[];
    const deck = [] as CardStateInfo[];

    for (const card of ordered(cards, ["color", "money"], (card) => card.info)) {
      if (util.canPayCost(cache, game, card.state, player, card.info.colors, card.info.cost, card.info.targets, [])) {
        hand.push(card);
      } else {
        deck.push(card);
      }
    }

    return { hand, deck };
  }, [cards]);

  return (
    <>
      <Hand cards={hand} />
      <Deck cards={deck} />
    </>
  );
}
