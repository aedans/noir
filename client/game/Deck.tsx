import React from "react";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-pixi-fiber";
import { compareMoney, mapSorted } from "../../common/sort";
import { targetResolution } from "../Camera";
import { defaultUtil, isLoaded, loadCard, useCardInfoList } from "../cards";
import Grid from "../Grid";
import Rectangle from "../Rectangle";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, gameCardWidth } from "./GameCard";

export default function Deck() {
  const [isExpanded, setIsExpanded] = useState(false);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = useCardInfoList(game.players[player].deck);

  const deck = cards.filter((card) => !defaultUtil.canPayCost(game, player, card.info.colors, card.info.cost));
  const sortedDeck = mapSorted(deck, (card) => card.info, compareMoney).map((card) => card.state);

  const x = targetResolution.width - gameCardWidth;
  const y = targetResolution.height - gameCardHeight;

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
        width={gameCardWidth}
        height={gameCardHeight}
        fillAlpha={0.01}
        pointerdown={pointerdown}
        interactive
      />
      <Grid data={sortedDeck} margin={isExpanded ? { x: 1, y: -0.15 } : { x: 0, y: 0 }} x={x} y={y} maxWidth={1}>
        {(state, ref, x, y, i) => (
          <GameCard
            zIndex={20 - i}
            state={state}
            key={state.id}
            ref={ref}
            status={"none"}
            x={x + gameCardWidth / 2}
            y={y + gameCardHeight / 2}
          />
        )}
      </Grid>
    </>
  );
}
