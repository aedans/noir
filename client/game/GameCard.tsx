import { Ticker } from "pixi.js";
import React, {
  MutableRefObject,
  Ref,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  Context,
  useContext,
} from "react";
import { Container } from "react-pixi-fiber";
import { findCard } from "../../common/gameSlice";
import { animateTo } from "../animation";
import Card, { CardProps } from "../Card";
import { useClientSelector } from "../store";

export type GameCardStates = { [id: string]: { x: number; y: number } };

export const GameCardContext = React.createContext(undefined as unknown) as Context<MutableRefObject<GameCardStates>>;

export const GameCard = React.forwardRef(function GameCard(props: CardProps, ref: Ref<Container>) {
  const cards = useContext(GameCardContext);
  const game = useClientSelector((state) => state.game);
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  useEffect(() => {
    function onTick() {
      if (componentRef.current) {
        cards.current[props.state.id] = componentRef.current.getGlobalPosition();
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  });

  useLayoutEffect(() => {
    const prevPosition = cards.current[props.state.id];
    if (prevPosition) {
      const nextPosition = componentRef.current.getGlobalPosition();
      componentRef.current.transform.position.copyFrom(componentRef.current.parent.toLocal(prevPosition));
      animateTo(componentRef.current, nextPosition);
    }

    // return () => {
    //   const { zone } = findCard(props.state.id, game);
    //   if (zone == "graveyard") {

    //   }
    // }
  });

  return <Card {...props} ref={componentRef} />;
});
