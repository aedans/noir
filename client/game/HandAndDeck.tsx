import React, { useContext, useMemo } from "react";
import { CardStateInfo } from "../../common/card";
import { ordered } from "../../common/util";
import { defaultUtil, useCardInfoList } from "../cards";
import { useClientSelector } from "../store";
import Deck from "./Deck";
import { CacheContext, PlayerContext } from "./Game";
import Hand from "./Hand";

export default function HandAndDeck() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck, [game.players[player].deck]);

  const { hand, deck } = useMemo(() => {
    const hand = [] as CardStateInfo[];
    const deck = [] as CardStateInfo[];

    for (const card of ordered(cards, ["color", "money"], (card) => card.info)) {
      if (defaultUtil.canPayCost(cache, game, card.state, player, card.info.colors, card.info.cost, card.info.targets, [])) {
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
