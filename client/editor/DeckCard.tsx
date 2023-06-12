import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Card, { CardProps } from "../Card";
import MoveAnimation, { useLastPos } from "../MoveAnimation";

export type EditorCardProps = CardProps &
  PixiElement<Container> & {
    useLastPos?: boolean;
  };

export default React.forwardRef(function EditorCard(props: EditorCardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <MoveAnimation id={props.state.id} x={x} y={y} scale={1} componentRef={componentRef}>
      <Container {...props} scale={1} ref={componentRef}>
        <Card state={props.state} info={props.info} />
      </Container>
    </MoveAnimation>
  );
});
