import React, { useCallback, useContext } from "react";
import { targetResolution } from "../Camera";
import GameCard, { gameCardHeightDiff, gameCardWidth, gameCardHeight, gameCardZoom } from "./GameCard";
import { PlanContext } from "./Game";
import CardList, { useCardInfoList } from "../CardList";
import { useTimeShadowFilter } from "../time";
import { Container } from "@pixi/react";
import { useClientSelector } from "../store";
import { AnimatedCardProps } from "../AnimatedCard";
import { CardState } from "../../common/card";

export default function Plan() {
  const { plan, setPlan } = useContext(PlanContext);
  const turn = useClientSelector((state) => state.game.turn);
  const timeShadowFilterRef = useTimeShadowFilter(10);
  const cards = useCardInfoList(
    plan.map((x) => x.card),
    [plan]
  );

  const removeFromPlan = useCallback((state: CardState) => {
    console.log(state);
    setPlan((plan) => plan.filter((x) => x.card.id != state.id));
  }, []);

  const planCard = useCallback(
    (props: AnimatedCardProps) => (
      <GameCard {...props} zoomOffsetY={gameCardHeightDiff} pointerdown={() => removeFromPlan(props.state)} />
    ),
    []
  );

  const x = 0;
  const y = (targetResolution.height - gameCardHeight) / 2 - cards.length * gameCardHeightDiff;

  return (
    <Container filters={[timeShadowFilterRef.current]}>
      <CardList
        expanded
        expandOnHover
        x={x}
        y={y}
        cardWidth={gameCardWidth}
        cardHeight={gameCardHeight}
        card={planCard}
        cards={cards.flatMap((x, i) => {
          if (i >= plan.length) return [];
          const id = plan[i].type == "activate" ? `activate:${x.state.id}-${turn}` : x.state.id;
          return [{ info: x.info, state: { ...x.state, id } }];
        })}
        hoverScale={gameCardZoom}
      />
    </Container>
  );
}
