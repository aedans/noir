import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrop } from "react-dnd";
import { Container, InteractiveComponent } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import Card, { CardProps, isCardPropsEqual, smallCardScale } from "../Card";
import MoveAnimation, { useLastPos } from "../MoveAnimation";
import { HoverContext, SocketContext } from "./Game";

export type GameCardProps = CardProps &
  InteractiveComponent & {
    scale?: number;
    useLastPos?: boolean;
    x?: number;
    y?: number;
    zIndex?: number;
    angle?: number;
    interactive?: boolean;
  };

export function isGameCardPropsEqual(a: GameCardProps, b: GameCardProps) {
  return (
    isCardPropsEqual(a, b) &&
    a.scale == b.scale &&
    a.useLastPos == b.useLastPos &&
    a.x == b.x &&
    a.y == b.y &&
    a.zIndex == b.zIndex &&
    a.angle == b.angle &&
    a.interactive == b.interactive
  );
}

export default React.memo(
  React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
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

    useEffect(() => {
      (componentRef.current as any).convertTo3d?.();
    }, []);

    const isHovered = hover.some((agent) => agent.id == props.state.id);

    return (
      <MoveAnimation id={props.state.id} x={x} y={y} scale={props.scale ?? smallCardScale} componentRef={componentRef}>
        <Container {...props} scale={0} ref={componentRef}>
          <Card
            state={{ ...props.state, exhausted: isHovered ? true : props.state.exhausted }}
            shadow={props.shadow}
            shouldGlow={props.shouldGlow || isOver}
            shouldDimWhenExhausted={props.shouldDimWhenExhausted}
          />
        </Container>
      </MoveAnimation>
    );
  }),
  isGameCardPropsEqual
);
