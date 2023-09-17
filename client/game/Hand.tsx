import React from "react";
import { targetResolution } from "../Camera.js";
import { CardStateInfo } from "../../common/card.js";
import HandCard from "./HandCard.js";
import { useTimeShadowFilter } from "../time.js";
import { Container } from "@pixi/react";
import { gameCardHeight, gameCardWidth } from "./GameCard.js";

export type HandProps = {
  cards: CardStateInfo[];
};

export default function Hand(props: HandProps) {
  const timeShadowFilterRef = useTimeShadowFilter(10);

  let offset = gameCardWidth - 20;
  if (offset * props.cards.length > 2500) {
    offset /= (offset * props.cards.length) / 2500;
  }

  const x = (targetResolution.width - props.cards.length * offset) / 2 + gameCardWidth / 2;
  const y = targetResolution.height - gameCardHeight / 2 + 20;

  return (
    <Container filters={[timeShadowFilterRef.current]} zIndex={1} sortableChildren>
      {props.cards.map(({ state, info }, i) => (
        <HandCard
          zIndex={20 + i}
          state={state}
          info={info}
          key={state.id}
          x={x + i * offset}
          y={y + Math.abs((i - (props.cards.length - 1) / 2.0) * 10)}
          angle={(i - (props.cards.length - 1) / 2.0) * 1}
        />
      ))}
    </Container>
  );
}
