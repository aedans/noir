import React, { useCallback, useContext } from "react";
import { targetResolution } from "../Camera";
import GameCard, {
  GameCardProps,
  gameCardHeightDiff,
  gameCardWidth,
  gameCardHeight,
  gameCardZoom,
} from "./GameCard";
import { PlanContext } from "./Game";
import CardList, { useCardInfoList } from "../CardList";

export default function Plan() {
  const { plan } = useContext(PlanContext);
  const card = useCallback((props: GameCardProps) => <GameCard {...props} zoomOffsetY={gameCardHeightDiff} />, []);
  const cards = useCardInfoList(
    plan.map((x) => x.card),
    [plan]
  );

  const x = 0;
  const y = (targetResolution.height - gameCardHeight) / 2 - (cards.length * gameCardHeightDiff);

  return (
    <CardList
      expanded
      x={x}
      y={y}
      cardWidth={gameCardWidth}
      cardHeight={gameCardHeight}
      cards={cards.map((x, i) => ({ info: x.info, state: { ...x.state, id: `${x.state.id}-${i}` } }))}
      card={card}
      hoverScale={gameCardZoom}
    />
  );
}
