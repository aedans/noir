import React from "react";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { defaultUtil, isLoaded, loadCard } from "../cards";
import { EnterExitAnimator } from "../EnterExitAnimation";
import Grid from "../Grid";
import Rectangle from "../Rectangle";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, gameCardWidth } from "./GameCard";

export default function Deck() {
  const [_, setHasLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = game.players[player].deck;

  useEffect(() => {
    if (cards.some((card) => !isLoaded(card))) {
      setHasLoaded(false);
    }

    (async () => {
      for (const card of cards.filter((c) => !isLoaded(c))) {
        await loadCard(card);
      }

      setHasLoaded(true);
    })();
  }, [cards]);

  const deck = cards
    .filter((card) => isLoaded(card))
    .filter((card) => {
      const info = defaultUtil.getCardInfo(game, card);
      return !defaultUtil.canPayCost(game, player, info.colors, info.cost);
    });

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
      <Grid
        data={deck}
        margin={isExpanded ? { x: 1, y: -0.15 } : { x: 0, y: 0 }}
        x={x}
        y={y}
        maxWidth={1}
      >
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
