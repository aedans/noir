import React, { MutableRefObject, Ref, useCallback, useImperativeHandle, useRef } from "react";
import { Container } from "@pixi/react";
import Card from "../Card.js";
import { PixiContainer } from "../pixi.js";
import { GameCardProps, isGameCardPropsEqual } from "../game/GameCard.js";
import { useClientDispatch } from "../store.js";
import { addDeckCard } from "../decksSlice.js";

export type GridCardProps = GameCardProps & {
  deckName: string;
};

export function isGridCardPropsEqual(a: GridCardProps, b: GridCardProps) {
  return isGameCardPropsEqual(a, b) && a.deckName == b.deckName;
}

export default React.memo(
  React.forwardRef(function GridCard(props: GridCardProps, ref: Ref<PixiContainer>) {
    const dispatch = useClientDispatch();
    const componentRef = useRef() as MutableRefObject<PixiContainer>;

    useImperativeHandle(ref, () => componentRef.current);

    const pointerdown = useCallback(() => {
      dispatch(addDeckCard({ deck: props.deckName, name: props.state.name }));
    }, [props.deckName, props.state.name]);

    return (
      <Container {...props} scale={1} eventMode="static" pointerdown={pointerdown} ref={componentRef}>
        <Card info={props.info} state={props.state} cosmetic={props.cosmetic} />
      </Container>
    );
  }),
  isGridCardPropsEqual
);
