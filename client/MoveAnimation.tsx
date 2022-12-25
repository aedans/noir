import anime from "animejs";
import { Ticker } from "pixi.js";
import React, { MutableRefObject, ReactNode, useContext, useEffect, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";

export type MoveAnimationState = { [id: string]: { x: number; y: number } };

export const MoveAnimationContext = React.createContext({ current: {} as MoveAnimationState });

export type MoveAnimationProps = {
  id: string;
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  skip?: boolean;
  x?: number;
  y?: number;
};

export function useLastPos(
  props: { x?: number; y?: number; useLastPos?: boolean },
  id: string,
  ref: MutableRefObject<Container>
) {
  const move = useContext(MoveAnimationContext);

  let x = props.x;
  let y = props.y;

  if (props.useLastPos && id in move.current && ref.current) {
    const prevPosition = ref.current.parent!.toLocal(move.current[id]);
    x = prevPosition.x;
    y = prevPosition.y;  
  }

  return { x, y };
}

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

  useEffect(() => {
    if (!props.skip) {
      const container = props.componentRef.current;
      anime.remove(container.transform.position);
      anime({
        targets: container.transform.position,
        duration: 300,
        easing: "easeOutExpo",
        x: props.x ?? 0,
        y: props.y ?? 0,
      });        
    }
  });

  useLayoutEffect(() => {
    const prev = state.current[props.id];
    const container = props.componentRef.current;
    if (prev && !props.skip) {
      container.position = container.parent.toLocal(prev);
    }
  });

  return <>{props.children}</>;
}
