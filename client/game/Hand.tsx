import React from "react";
import { targetResolution } from "../Camera";
import { CardStateInfo } from "../../common/card";
import HandCard from "./HandCard";
import { cardHeight, cardWidth } from "../Card";
import { useTimeShadowFilter } from "../time";
import { Container } from "react-pixi-fiber";

export type HandProps = {
  cards: CardStateInfo[];
};

export default function Hand(props: HandProps) {
  const timeShadowFilterRef = useTimeShadowFilter(10);

  let offset = cardWidth - 20;
  if (offset * props.cards.length > 2500) {
    offset /= (offset * props.cards.length) / 2500;
  }

  const x = (targetResolution.width - props.cards.length * offset) / 2 + cardWidth / 2;
  const y = targetResolution.height * (3 / 4) + cardHeight / 2 + 20;

  return (
    <Container filters={[timeShadowFilterRef.current]}>
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
