import { Ticker } from "pixi.js";
import React, { MutableRefObject, ReactNode, useContext, useEffect, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import gsap from "gsap";

export type MoveAnimationState = { [id: string]: { x: number; y: number } };

export const MoveAnimationContext = React.createContext({ current: {} as MoveAnimationState });

export type MoveAnimationProps = {
  id: string;
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  doesExist: boolean;
};

export default function MoveAnimation(props: MoveAnimationProps) {
  const state = useContext(MoveAnimationContext);

  useEffect(() => {
    function onTick() {
      if (props.componentRef.current && props.doesExist) {
        state.current[props.id] = props.componentRef.current.getGlobalPosition();
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  }, []);

  useLayoutEffect(() => {
    const prevPosition = state.current[props.id];
    if (prevPosition && props.doesExist) {
      const pos = props.componentRef.current.parent.toLocal(prevPosition);
      gsap.killTweensOf(props.componentRef.current);
      gsap.from(props.componentRef.current.transform.position, {
        duration: 0.1,
        x: pos.x,
        y: pos.y,
      });
    }
  });

  return <>{props.children}</>;
}
