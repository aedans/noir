import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container, PixiElement } from "react-pixi-fiber";
import Card, { CardProps, smallCardScale } from "../Card";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { useLastPos } from "../MoveAnimation";

export type EditorCardProps = CardProps &
  PixiElement<Container> & {
    useLastPos?: boolean;
    status: EnterExitAnimationStatus;
  };

const EditorCard = React.forwardRef(function EditorCard(props: EditorCardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <EnterExitAnimation skip={props.status == "entering"} status={props.status} componentRef={componentRef}>
      <MoveAnimation
        skipPosition={props.status == "none"}
        id={props.state.id}
        x={x}
        y={y}
        scale={smallCardScale}
        componentRef={componentRef}
      >
        <Container {...props} scale={smallCardScale} ref={componentRef}>
          <Card state={props.state} />
        </Container>
      </MoveAnimation>
    </EnterExitAnimation>
  );
});

export default EditorCard;
