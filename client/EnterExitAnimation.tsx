import React, { MutableRefObject, ReactElement, ReactNode, useLayoutEffect, useRef } from "react";
import { Container } from "react-pixi-fiber";
import { CardState } from "../common/card";

export type EnterExitAnimationState = { [id: string]: CardState };

export type EnterExitAnimationStatus = "entering" | "exiting" | "none";

export type EnterExitAnimatorProps = {
  elements: CardState[];
  children: (data: CardState, status: EnterExitAnimationStatus, index: number | null) => ReactElement;
};

export function EnterExitAnimator(props: EnterExitAnimatorProps) {
  const ref = useRef({} as EnterExitAnimationState);

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
