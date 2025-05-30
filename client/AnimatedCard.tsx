import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { PixiContainer } from "./pixi";
import anime from "animejs";
import { useTick, Container } from "@pixi/react";
import Card, { CardProps, isCardPropsEqual } from "./Card";

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
  zIndex?: number;
  angle?: number;
  eventMode?: Parameters<typeof Container>[0]["eventMode"];
  pointerover?: Parameters<typeof Container>[0]["pointerover"];
  pointerout?: Parameters<typeof Container>[0]["pointerout"];
  pointerdown?: Parameters<typeof Container>[0]["pointerdown"];
};

export function isAnimatedCardPropsEqual(a: AnimatedCardProps, b: AnimatedCardProps) {
  return (
    a.x == b.x &&
    a.y == b.y &&
    a.zIndex == b.zIndex &&
    a.angle == b.angle &&
    a.scale == b.scale &&
    a.eventMode == b.eventMode &&
    a.pointerover == b.pointerover &&
    a.pointerout == b.pointerout &&
    a.pointerdown == b.pointerdown &&
    isCardPropsEqual(a, b)
  );
}

export default React.forwardRef(function AnimatedCard(props: AnimatedCardProps, ref: Ref<PixiContainer>) {
  const componentRef = useRef() as MutableRefObject<PixiContainer>;

  const { x, y, scale } = useCardAnimation(props.state.id, {
    componentRef,
    x: props.x ?? 0,
    y: props.y ?? 0,
    scale: props.scale ?? 1,
  });

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <Container
      ref={componentRef}
      x={x}
      y={y}
      scale={scale}
      zIndex={props.zIndex}
      angle={props.angle}
      eventMode={props.eventMode}
      pointerover={props.pointerover}
      pointerout={props.pointerout}
      pointerdown={props.pointerdown}
    >
      <Card
        state={props.state}
        info={props.info}
        cosmetic={props.cosmetic}
        shouldGlow={props.shouldGlow}
        shouldDimWhenExhausted={props.shouldDimWhenExhausted}
        borderTint={props.borderTint}
      />
    </Container>
  );
});
