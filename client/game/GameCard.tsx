import React, { MutableRefObject, Ref, useImperativeHandle } from "react";
import { Container } from "react-pixi-fiber";
import Card, { CardProps } from "../Card";
import MoveAnimation from "../MoveAnimation";

const GameCard = React.forwardRef(function GameCard(props: CardProps, ref: Ref<Container>) {
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  return (
    <MoveAnimation id={props.state.id} componentRef={componentRef}>
      <Card scale={1 / 4} {...props} ref={componentRef} />
    </MoveAnimation>
  );
});

export default GameCard;
