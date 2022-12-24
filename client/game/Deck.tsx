import React from "react";
import { useContext, useState } from "react";
import { compareMoney, mapSorted } from "../../common/sort";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import { defaultUtil, useCardInfoList } from "../cards";
import Grid from "../Grid";
import Rectangle from "../Rectangle";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard from "./GameCard";

export default function Deck() {
  const [isExpanded, setIsExpanded] = useState(false);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck);

  const deck = cards.filter((card) => !defaultUtil.canPayCost(game, player, card.info.colors, card.info.cost));
  const sortedDeck = mapSorted(deck, (card) => card.info, compareMoney).map((card) => card.state);

  const x = targetResolution.width - smallCardWidth;
  const y = targetResolution.height - smallCardHeight;

  function pointerdown() {
    if (deck.length > 0) {
      setIsExpanded(!isExpanded);
    }
  }

  return (
    <>
      <Rectangle
        x={x}
        y={y}
        width={smallCardWidth}
        height={smallCardHeight}
        fillAlpha={0.01}
        pointerdown={pointerdown}
        interactive
      />
      <Grid elements={sortedDeck} margin={isExpanded ? { x: 1, y: -0.15 } : { x: 0, y: 0 }} x={x} y={y} maxWidth={1}>
        {(state, ref, x, y, i) => (
          <GameCard
            zIndex={20 - i}
            state={state}
            key={state.id}
            ref={ref}
            status={"none"}
            x={x + smallCardWidth / 2}
            y={y + smallCardHeight / 2}
          />
        )}
      </Grid>
    </>
  );
}
