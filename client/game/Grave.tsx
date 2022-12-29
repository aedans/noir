import React from "react";
import { useContext, useState } from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import { useCardInfoList } from "../cards";
import Grid from "../Grid";
import Rectangle from "../Rectangle";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard from "./GameCard";

export default function Grave() {
  const [isExpanded, setIsExpanded] = useState(false);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const grave = useCardInfoList(game.players[player].grave);
  const sortedGrave = grave.map((card) => card.state).reverse();

  const x = 0;
  const y = targetResolution.height - smallCardHeight;

  function pointerdown() {
    if (grave.length > 0) {
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
      <Grid elements={sortedGrave} margin={isExpanded ? { x: 1, y: -0.15 } : { x: 0, y: 0 }} x={x} y={y} maxWidth={1}>
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
