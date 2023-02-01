import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Card, { CardProps, smallCardScale } from "../Card";
import MoveAnimation from "../MoveAnimation";

export type EditorCardProps = CardProps & PixiElement<Container>;

export default React.forwardRef(function EditorCard(props: EditorCardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <MoveAnimation skipPosition id={props.state.id} scale={smallCardScale} componentRef={componentRef}>
      <Container {...props} scale={smallCardScale} ref={componentRef}>
        <Card state={props.state} info={props.info}  />
      </Container>
    </MoveAnimation>
  );
});
