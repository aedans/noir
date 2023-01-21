import React from "react";
import { targetResolution } from "../Camera";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { smallCardHeight, smallCardWidth } from "../Card";
import { CardState } from "../../common/card";
import HandCard from "./HandCard";

export type HandProps = {
  cards: CardState[];
};

export default function Hand(props: HandProps) {
  let offset = smallCardWidth - 20;
  if (offset * props.cards.length > 2500) {
    offset /= (offset * props.cards.length) / 2500;
  }

  const x = (targetResolution.width - props.cards.length * offset) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + smallCardHeight / 2 + 20;

  return (
    <EnterExitAnimator elements={props.cards}>
      {(state, status, i) =>
        i != null ? (
          <HandCard
            zIndex={20 + i}
            state={state}
            status={status}
            key={state.id}
            x={x + i * offset}
            y={y + Math.abs((i - (props.cards.length - 1) / 2.0) * 10)}
            angle={(i - (props.cards.length - 1) / 2.0) * 1}
          />
        ) : (
          <HandCard useLastPos state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
