import React, { MutableRefObject, ReactElement, ReactNode, useLayoutEffect, useRef } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import { Target } from "../common/card";

export type EnterExitAnimationState<T> = { [id: string]: T };

export type EnterExitAnimationStatus = "entering" | "exiting" | "none";

export type EnterExitAnimatorProps<T extends Target> = {
  elements: T[];
  children: (data: T, status: EnterExitAnimationStatus, index: number | null) => ReactElement;
};

export function EnterExitAnimator<T extends Target>(props: EnterExitAnimatorProps<T>) {
  const ref = useRef({} as EnterExitAnimationState<T>);

  let unusedStates = { ...ref.current };
  let i = 0;
  const children = props.elements.map((state) => {
    const status = state.id in ref.current ? "none" : "entering";
    delete unusedStates[state.id];
    ref.current[state.id] = state;
    return props.children(state, status, i++);
  });

  const exiting = Object.values(unusedStates).map((state) => {
    setTimeout(() => delete ref.current[state.id], 100);
    return props.children(state, "exiting", null);
  });

  return <>{[...children, ...exiting]}</>;
}

export type EnterExitAnimationProps = {
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  status: EnterExitAnimationStatus;
  skip?: boolean;
};

export default function EnterExitAnimation(props: EnterExitAnimationProps) {
  useLayoutEffect(() => {
    const container = props.componentRef.current;

    if (!container) {
      return;
    }

    container.alpha = props.status == "exiting" ? 0 : 1;
  });

  return <>{props.children}</>;
}
