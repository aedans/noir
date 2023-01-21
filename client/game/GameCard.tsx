import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrop } from "react-dnd";
import { Container, PixiElement } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import Card, { CardProps, smallCardScale } from "../Card";
import MoveAnimation, { useLastPos } from "../MoveAnimation";
import { HoverContext, SocketContext } from "./Game";

export type GameCardProps = CardProps &
  PixiElement<Container> & {
    scale?: number;
    useLastPos?: boolean;
  };

export default React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const { hover } = useContext(HoverContext);
  const socket = useContext(SocketContext);
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);

  useImperativeHandle(ref, () => componentRef.current);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "target",
    drop: (state: CardState) => {
      socket.emit("action", { type: "do", id: state.id, target: { id: props.state.id } });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    drop(componentRef);
  });

  const isHovered = hover.some((agent) => agent.id == props.state.id);

  return (
    <MoveAnimation id={props.state.id} x={x} y={y} scale={props.scale ?? smallCardScale} componentRef={componentRef}>
      <Container {...props} scale={0} ref={componentRef}>
        <Card
          state={{ ...props.state, exhausted: isHovered ? true : props.state.exhausted }}
          shouldGlow={props.shouldGlow || isOver}
          shadow={props.shadow}
          shouldDimWhenExhausted={props.shouldDimWhenExhausted}
        />
      </Container>
    </MoveAnimation>
  );
});
