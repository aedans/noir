import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container } from "react-pixi-fiber";
import Card, { CardProps, smallCardScale } from "../Card";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { useLastPos } from "../MoveAnimation";

export type EditorCardProps = CardProps & {
  useLastPos?: boolean;
  status: EnterExitAnimationStatus;
};

const EditorCard = React.forwardRef(function GameCard(props: EditorCardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <EnterExitAnimation skip={props.status == "entering"} status={props.status} scale={smallCardScale} componentRef={componentRef}>
      <MoveAnimation skip={props.status == "none"} id={props.state.id} x={x} y={y} componentRef={componentRef}>
        <Card scale={smallCardScale} {...props} x={x} y={y} ref={componentRef} />
      </MoveAnimation>
    </EnterExitAnimation>
  );
});

export default EditorCard;
