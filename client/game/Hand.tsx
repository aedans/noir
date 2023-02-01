import React from "react";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import { CardStateInfo } from "../../common/card";
import HandCard from "./HandCard";

export type HandProps = {
  cards: CardStateInfo[];
};

export default function Hand(props: HandProps) {
  let offset = smallCardWidth - 20;
  if (offset * props.cards.length > 2500) {
    offset /= (offset * props.cards.length) / 2500;
  }

  const x = (targetResolution.width - props.cards.length * offset) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + smallCardHeight / 2 + 20;

  return (
    <>
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
    </>
  );
}
