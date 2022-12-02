import React, { MutableRefObject, ReactNode, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import gsap from "gsap";

export type EnterExitAnimationState<T> = { [id: string]: T };

export type EnterExitAnimationStatus = "entering" | "exiting" | "none";

export type EnterExitAnimationProviderProps<T extends { id: string }> = {
  elements: T[];
  children: (state: T, status: EnterExitAnimationStatus, index: number | null) => JSX.Element;
};

export function EnterExitAnimator<T extends { id: string }>(props: EnterExitAnimationProviderProps<T>) {
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
  duration: number,
};

export default function EnterExitAnimation(props: EnterExitAnimationProps) {
  useLayoutEffect(() => {
    const container = props.componentRef.current;

    if (props.status == "entering") {
      gsap.from(container.transform.scale, {
        duration: props.duration,
        x: 0,
        y: 0,
      });
    }
  
    if (props.status == "exiting") {
      gsap.to(container.transform.scale, {
        duration: props.duration,
        x: 0,
        y: 0,
      });
    }
  })

  return <>{props.children}</>;
}
