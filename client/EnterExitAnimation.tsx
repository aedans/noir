import anime from "animejs";
import React, { MutableRefObject, ReactNode, useLayoutEffect, useRef } from "react";
import { Container } from "react-pixi-fiber";

export type EnterExitAnimationState<T> = { [id: string]: T };

export type EnterExitAnimationStatus = "entering" | "exiting" | "none";

export type EnterExitAnimatorProps<T extends { id: string }> = {
  elements: T[];
  children: (state: T, status: EnterExitAnimationStatus, index: number | null) => JSX.Element;
};

export function EnterExitAnimator<T extends { id: string }>(props: EnterExitAnimatorProps<T>) {
  const ref = React.useRef({} as EnterExitAnimationState<T>);

  let unusedStates = { ...ref.current };
  let i = 0;
  const children = props.elements.map((state) => {
    const status = state.id in ref.current ? "none" : "entering";
    delete unusedStates[state.id];
    ref.current[state.id] = state;
    return props.children(state, status, i++);
  });

  const exiting = Object.values(unusedStates).map((state) => {
    delete ref.current[state.id];
    return props.children(state, "exiting", null);
  });

  return <>{[...children, ...exiting]}</>;
}

export type EnterExitAnimationProps = {
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  status: EnterExitAnimationStatus;
  duration: number;
};

export default function EnterExitAnimation(props: EnterExitAnimationProps) {
  const scale = useRef() as MutableRefObject<{ _x: number; _y: number }>;

  useLayoutEffect(() => {
    const container = props.componentRef.current;
    if (!scale.current) {
      scale.current = { ...container.transform.scale };
    }

    if (props.status == "entering") {
      container.scale = { x: 0, y: 0 };
      anime({
        targets: container.transform.scale,
        duration: props.duration,
        easing: "linear",
        x: scale.current._x,
        y: scale.current._y,
      });
    }

    if (props.status == "exiting") {
      anime({
        targets: container.transform.scale,
        duration: props.duration,
        easing: "linear",
        x: 0,
        y: 0,
      });
    }
  });

  return <>{props.children}</>;
}
