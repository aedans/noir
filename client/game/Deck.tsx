import React from "react";
import { useContext } from "react";
import { compareMoney, mapSorted } from "../../common/sort";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import CardList from "./CardList";
import { defaultUtil, useCardInfoList } from "../cards";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";

export default function Deck() {
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck);

  const deck = cards.filter(
    (card) => !defaultUtil.canPayCost(game, card.state, player, card.info.colors, card.info.cost)
  );
  const sortedDeck = mapSorted(deck, (card) => card.info, compareMoney).map((card) => card.state);

  const x = targetResolution.width - smallCardWidth;
  const y = targetResolution.height - smallCardHeight;

  return (
    <CardList cards={sortedDeck} x={x} y={y} />
  );
}
