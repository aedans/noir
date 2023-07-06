import React, { MutableRefObject, useContext, useEffect, useLayoutEffect } from "react";
import { Container, Ticker } from "./pixi";
import anime from "animejs";

export type MoveAnimationState = {
  x: number;
  y: number;
  scale: number;
};

export const MoveAnimationContext = React.createContext({ current: {} as { [id: string]: MoveAnimationState } });

export function useMoveAnimation(
  id: string,
  props: MoveAnimationState & {
    skipPosition?: boolean;
    skipScale?: boolean;
    componentRef: MutableRefObject<Container>;
  }
) {
  const state = useContext(MoveAnimationContext);

  useEffect(() => {
    function onTick() {
      const container = props.componentRef.current;
      if (container) {
        state.current[id] = {
          x: container.x,
          y: container.y,
          scale: container.transform.scale.x,
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
    const prev = state.current[id];
    const container = props.componentRef.current;
    if (prev && container && !props.skipPosition) {
      container.position = prev;
      container.scale = { x: prev.scale, y: prev.scale };
    } else if (!props.skipScale) {
      container.scale = { x: 0, y: 0 };
    }
  }, [props.x, props.y, props.scale]);

  return state.current[id] ?? { x: props.x, y: props.y, scale: props.scale };
}
