import { Ticker } from "pixi.js";
import React, { MutableRefObject, ReactNode, useContext, useEffect, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import gsap from "gsap";

export type MoveAnimationState = { [key: string]: { x: number; y: number } };

export const MoveAnimationContext = React.createContext({ current: {} });

export type MoveAnimationProps = {
  id: string;
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
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
    const prevPosition = state.current[props.id];
    if (prevPosition) {
      const pos = props.componentRef.current.parent.toLocal(prevPosition);
      gsap.killTweensOf(props.componentRef.current);
      gsap.from(props.componentRef.current.transform.position, {
        duration: .1,
        x: pos.x,
        y: pos.y,
      });
    }
  });

  return <>{props.children}</>;
}
