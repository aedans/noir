import React, { useContext } from "react";
import { CardState } from "../../common/card";
import { defaultUtil, useCardInfoList } from "../cards";
import { useClientSelector } from "../store";
import Deck from "./Deck";
import { PlayerContext } from "./Game";
import Hand from "./Hand";

export default function HandAndDeck() {
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck);

  const hand = [] as CardState[];
  const deck = [] as CardState[];

  for (const card of cards) {
    if (defaultUtil.canPayCost(game, card.state, player, card.info.colors, card.info.cost, card.info.targets)) {
      hand.push(card.state);
    } else {
      deck.push(card.state);
    }
  }

  return (
    <>
      <Hand cards={hand} />
      <Deck cards={deck} />
    </>
  );
}
