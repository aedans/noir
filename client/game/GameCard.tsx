import { Ticker } from "pixi.js";
import React, { MutableRefObject, Ref, useImperativeHandle, useEffect, useLayoutEffect, Context, useContext } from "react";
import { Container } from "react-pixi-fiber";
import { animateTo } from "../animation";
import Card, { CardProps } from "../Card";

export type GameCardStates = { [id: string]: { x: number; y: number } };

export const GameCardContext = React.createContext(undefined as unknown) as Context<MutableRefObject<GameCardStates>>;

export const GameCard = React.forwardRef(function GameCard(props: CardProps, ref: Ref<Container>) {
  const cards = useContext(GameCardContext);
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  useEffect(() => {
    function onTick() {
      if (componentRef.current) {
        const lastPosition = componentRef.current.getGlobalPosition();
        cards.current[props.state.id] = { x: lastPosition.x, y: lastPosition.y };
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  });

  useLayoutEffect(() => {
    const last = cards.current[props.state.id];
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
