import anime, { AnimeInstance } from "animejs";
import { Ticker } from "pixi.js";
import React, { MutableRefObject, ReactNode, useContext, useEffect, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";

export type MoveAnimationState = { [id: string]: { x: number; y: number } };

export const MoveAnimationContext = React.createContext({ current: {} as MoveAnimationState });

export type MoveAnimationProps = {
  id: string;
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  doesExist: boolean;
  x?: number,
  y?: number,
};

export default function MoveAnimation(props: MoveAnimationProps) {
  const state = useContext(MoveAnimationContext);

  useEffect(() => {
    function onTick() {
      if (props.componentRef.current) {
        state.current[props.id] = props.componentRef.current.getGlobalPosition();
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  }, []);

  useLayoutEffect(() => {
    const prev = state.current[props.id];
    const container = props.componentRef.current;
    if (prev && props.doesExist) {
      container.position = container.parent.toLocal(prev);
      anime({
        targets: container.transform.position,
        duration: 100,
        easing: "linear",
        x: props.x ?? 0,
        y: props.y ?? 0,
      });
    }
  });

  return <>{props.children}</>;
}
