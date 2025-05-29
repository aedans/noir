import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { PixiContainer } from "./pixi";
import anime from "animejs";
import { useTick, Container } from "@pixi/react";
import Card, { CardProps } from "./Card";

export type CardAnimationState = {
  x: number;
  y: number;
  scale: number;
};

export const CardAnimationContext = React.createContext({ current: {} as { [id: string]: CardAnimationState } });

export function useCardAnimation(
  id: string,
  props: CardAnimationState & {
    skipPosition?: boolean;
    skipScale?: boolean;
    componentRef: MutableRefObject<PixiContainer>;
  }
) {
  const state = useContext(CardAnimationContext);

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

export type AnimatedCardProps = CardProps & {
  x?: number;
  y?: number;
  scale?: number;
}

export default React.forwardRef(function AnimatedCard(props: AnimatedCardProps, ref: Ref<PixiContainer>) {
  const componentRef = useRef() as MutableRefObject<PixiContainer>;

  const { x, y, scale } = useCardAnimation(props.state.id, {
    componentRef,
    x: props.x ?? 0,
    y: props.y ?? 0,
    scale: 1,
  });

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <Container ref={componentRef} x={x} y={y} scale={scale}>
      <Card state={props.state} info={props.info} cosmetic={props.cosmetic} />
    </Container>
  );
});
