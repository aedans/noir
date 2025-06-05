import React, { useCallback, useContext } from "react";
import { targetResolution } from "../Camera";
import GameCard, { gameCardHeightDiff, gameCardWidth, gameCardHeight, gameCardZoom } from "./GameCard";
import { PlanContext } from "./Game";
import CardList, { useCardInfoList } from "../CardList";
import { useTimeShadowFilter } from "../time";
import { Container } from "@pixi/react";
import { useClientSelector } from "../store";
import { AnimatedCardProps } from "../AnimatedCard";
import { CardState, CardStateInfo } from "../../common/card";

export default function Plan() {
  const { plan, setPlan } = useContext(PlanContext);
  const turn = useClientSelector((state) => state.game.turn);
  const timeShadowFilterRef = useTimeShadowFilter(10);
  const cards = useCardInfoList(
    plan.map((x) => x.card),
    [plan]
  );

  const removeFromPlan = useCallback((state: CardState) => {
    setPlan((plan) => plan.filter((x) => !state.id.includes(x.card.id)));
  }, []);

  const planCard = useCallback(
    (props: AnimatedCardProps) => (
      <GameCard {...props} zoomOffsetY={gameCardHeightDiff} pointerdown={() => removeFromPlan(props.state)} />
    ),
    []
  );

  const x = 0;
  const y = (targetResolution.height - gameCardHeight) / 2 - cards.length * gameCardHeightDiff;

  const listCards: CardStateInfo[] = [];
  for (let i = 0; i < cards.length; i++) {
    if (i >= plan.length) continue;
    const id = plan[i].type == "activate" ? `activate:${cards[i].state.id}-${turn}` : cards[i].state.id;
    listCards.push({ info: cards[i].info, state: { ...cards[i].state, id } });
  }

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
        cards={listCards}
        hoverScale={gameCardZoom}
      />
    </Container>
  );
}
