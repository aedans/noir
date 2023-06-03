import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Card, { CardProps } from "../Card";
import MoveAnimation from "../MoveAnimation";

export type EditorCardProps = CardProps & PixiElement<Container>;

export default React.forwardRef(function EditorCard(props: EditorCardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <MoveAnimation skipPosition id={props.state.id} scale={1} componentRef={componentRef}>
      <Container {...props} scale={1} ref={componentRef}>
        <Card state={props.state} info={props.info} />
      </Container>
    </MoveAnimation>
  );
});
