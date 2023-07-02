import anime from "animejs";
import { PixiContainer, Ticker } from "./pixi.js";
import React, { MutableRefObject, ReactNode, useContext, useEffect, useLayoutEffect } from "react";

export type MoveAnimationState = {
  [id: string]: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  };
};

export const MoveAnimationContext = React.createContext({ current: {} as MoveAnimationState });

export type MoveAnimationProps = {
  id: string;
  componentRef: MutableRefObject<PixiContainer>;
  children: ReactNode;
  skipPosition?: boolean;
  skipScale?: boolean;
  x?: number;
  y?: number;
  scale?: number;
};

export function useLastPos(
  props: { x?: number; y?: number; useLastPos?: boolean },
  id: string,
  ref: MutableRefObject<PixiContainer>
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
      const component = props.componentRef.current;
      if (component) {
        state.current[props.id] = {
          x: component.toGlobal({ x: 0, y: 0 }).x,
          y: component.toGlobal({ x: 0, y: 0 }).y,
          scaleX: component.transform.scale.x,
          scaleY: component.transform.scale.y,
        };
      }
    }

    Ticker.shared.add(onTick);
    return () => {
      Ticker.shared.remove(onTick);
    };
  }, []);

  useEffect(() => {
    const component = props.componentRef.current;

    if (!component) {
      return;
    }

    if (!props.skipPosition) {
      anime.remove(component.transform.position);
      anime({
        targets: component.transform.position,
        duration: 700,
        easing: "easeOutExpo",
        x: props.x ?? 0,
        y: props.y ?? 0,
      });
    }
  }, [props.x, props.y]);

  useEffect(() => {
    const component = props.componentRef.current;

    if (!component) {
      return;
    }

    if (!props.skipScale) {
      anime.remove(component.transform.scale);
      anime({
        targets: component.transform.scale,
        duration: 700,
        delay: -20,
        easing: "easeOutExpo",
        x: props.scale ?? 0,
        y: props.scale ?? 0,
      });
    }
  }, [props.scale]);

  useLayoutEffect(() => {
    const prev = state.current[props.id];
    const component = props.componentRef.current;
    if (prev && component && !props.skipPosition) {
      component.position = component.parent.toLocal(prev);
      component.scale = { x: prev.scaleX, y: prev.scaleY };
    } else if (!props.skipScale) {
      component.scale = { x: 0, y: 0 };
    }
  }, [props.x, props.y, props.scale]);

  return <>{props.children}</>;
}
