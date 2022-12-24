import React, { MutableRefObject, Ref, useImperativeHandle, useRef } from "react";
import { Container } from "react-pixi-fiber";
import Card, { CardProps, smallCardScale } from "../Card";

const EditorCard = React.forwardRef(function GameCard(props: CardProps, ref: Ref<Container>) {
  const componentRef = useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  return <Card scale={smallCardScale} {...props} x={props.x} y={props.y} ref={componentRef} />;
});

export default EditorCard;
