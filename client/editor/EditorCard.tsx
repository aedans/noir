import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container } from "@pixi/react";
import Card, { CardProps } from "../Card.js";
import MoveAnimation from "../MoveAnimation.js";
import { PixiContainer } from "../pixi.js";

export type EditorCardProps = CardProps & Parameters<typeof Container>[0];

export default React.forwardRef(function EditorCard(props: EditorCardProps, ref: Ref<PixiContainer>) {
  const componentRef = useRef() as MutableRefObject<PixiContainer>;

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <MoveAnimation skipPosition skipScale id={props.state.id} componentRef={componentRef}>
      <Container {...props} scale={1} ref={componentRef}>
        <Card state={props.state} info={props.info} cosmetic={props.cosmetic} />
      </Container>
    </MoveAnimation>
  );
});
