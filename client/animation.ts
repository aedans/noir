import React, { MutableRefObject, useContext, useEffect, useLayoutEffect } from "react";
import { Container, Ticker } from "./pixi";
import anime from "animejs";
import { useTick } from "@pixi/react";

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

  useTick(() => {
    const container = props.componentRef.current;
    if (container && state.current[id]) {
      state.current[id] = {
        x: container.x,
        y: container.y,
        scale: container.transform.scale.x,
      };
    }
  });

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
        easing: "easeOutExpo",
        x: props.scale ?? 0,
        y: props.scale ?? 0,
      });
    }
  }, [props.scale]);

  state.current[id] = state.current[id] ?? { x: props.x, y: props.y, scale: 0 };

  return state.current[id];
}
