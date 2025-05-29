import React, { MutableRefObject, Ref, useCallback, useContext, useImperativeHandle, useRef } from "react";
import { PixiContainer } from "../pixi.js";
import AnimatedCard, { AnimatedCardProps, CardAnimationContext, isAnimatedCardPropsEqual } from "../AnimatedCard.js";
import { useClientDispatch } from "../store.js";
import { removeDeckCard } from "../decksSlice.js";

export type DeckCardProps = AnimatedCardProps & {
  deckName: string;
};

export function isDeckCardPropsEqual(a: DeckCardProps, b: DeckCardProps) {
  return isAnimatedCardPropsEqual(a, b) && a.deckName == b.deckName;
}

export default React.memo(
  React.forwardRef(function DeckCard(props: DeckCardProps, ref: Ref<PixiContainer>) {
    const dispatch = useClientDispatch();
    const componentRef = useRef() as MutableRefObject<PixiContainer>;
    const context = useContext(CardAnimationContext);

    useImperativeHandle(ref, () => componentRef.current);

    const pointerdown = useCallback(() => {
      dispatch(removeDeckCard({ deck: props.deckName, name: props.state.name }));
      delete context.current[props.state.id];
    }, [props.state.id, props.deckName, props.state.name]);

    return (
      <AnimatedCard
        {...props}
        eventMode="static"
        pointerdown={pointerdown}
        x={props.x ?? 0}
        y={props.y ?? 0}
        scale={1}
        ref={componentRef}
        state={props.state}
        info={props.info}
        cosmetic={props.cosmetic}
      />
    );
  }),
  isDeckCardPropsEqual
);
