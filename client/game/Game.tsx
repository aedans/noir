import { Ticker } from "pixi.js";
import React, { MutableRefObject, Ref, useEffect, useImperativeHandle, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import Card, { CardProps } from "../Card";
import { animateTo } from "../animation";
import Board from "./Board";
import Hand from "./Hand";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";

export type GameCardStates = { [id: string]: { x: number; y: number } };

export type GameCardProps = CardProps & {
  cards: MutableRefObject<GameCardStates>;
};

export const GameCard = React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  useEffect(() => {
    function onTick() {
      if (componentRef.current) {
        const lastPosition = componentRef.current.getGlobalPosition();
        props.cards.current[props.state.id] = { x: lastPosition.x, y: lastPosition.y };
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  });

  useLayoutEffect(() => {
    const last = props.cards.current[props.state.id];
    if (last) {
      const nextPosition = { x: componentRef.current.x, y: componentRef.current.y };
      const prevPosition = componentRef.current.parent.toLocal(last);
      componentRef.current.x = prevPosition.x;
      componentRef.current.y = prevPosition.y;
      animateTo(componentRef.current, nextPosition);
    }
  });

  return <Card {...props} ref={componentRef} />;
});

export default function Game() {
  const cards = React.useRef({} as GameCardStates);

  return (
    <Container>
      <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
      <Board cards={cards} />
      <Hand cards={cards} />
    </Container>
  );
}
