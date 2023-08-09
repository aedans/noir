import React, { MutableRefObject, Ref, useCallback, useContext, useImperativeHandle, useRef } from "react";
import { Container } from "@pixi/react";
import Card from "../Card.js";
import { PixiContainer } from "../pixi.js";
import { MoveAnimationContext, useMoveAnimation } from "../animation.js";
import { useClientDispatch } from "../store.js";
import { removeDeckCard } from "../decksSlice.js";
import { GameCardProps, isGameCardPropsEqual } from "../game/GameCard.js";

export type DeckCardProps = GameCardProps & {
  deckName: string;
};

export function isDeckCardPropsEqual(a: DeckCardProps, b: DeckCardProps) {
  return isGameCardPropsEqual(a, b) && a.deckName == b.deckName;
}

export default React.memo(
  React.forwardRef(function DeckCard(props: DeckCardProps, ref: Ref<PixiContainer>) {
    const dispatch = useClientDispatch();
    const componentRef = useRef() as MutableRefObject<PixiContainer>;
    const context = useContext(MoveAnimationContext);

    const { x, y, scale } = useMoveAnimation(props.state.id, {
      componentRef,
      x: props.x ?? 0,
      y: props.y ?? 0,
      scale: 1,
    });

    useImperativeHandle(ref, () => componentRef.current);

    const pointerdown = useCallback(() => {
      dispatch(removeDeckCard({ deck: props.deckName, name: props.state.name }));
      delete context.current[props.state.id];
    }, [props.state.id, props.deckName, props.state.name]);

    return (
      <Container {...props} interactive pointerdown={pointerdown} x={x} y={y} scale={scale} ref={componentRef}>
        <Card state={props.state} info={props.info} cosmetic={props.cosmetic} />
      </Container>
    );
  }),
  isDeckCardPropsEqual
);
