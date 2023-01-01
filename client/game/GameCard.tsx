import { GlowFilter } from "@pixi/filter-glow";
import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrop } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import Card, { CardProps, getCardColor, smallCardScale } from "../Card";
import { useCardInfo } from "../cards";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { useLastPos } from "../MoveAnimation";
import { HoverContext, SocketContext } from "./Game";

export type GameCardProps = CardProps & {
  scale?: number;
  status: EnterExitAnimationStatus;
  useLastPos?: boolean;
  shouldGlow?: boolean;
};

export default React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const { hover } = useContext(HoverContext);
  const socket = useContext(SocketContext);
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);
  const cardInfo = useCardInfo(props.state);

  useImperativeHandle(ref, () => componentRef.current);

  const [{}, drop] = useDrop(() => ({
    accept: "target",
    drop: (state: CardState) => {
      socket.emit("action", { type: "do", id: state.id, target: { id: props.state.id } });
    },
    collect: () => ({}),
  }));

  useEffect(() => {
    drop(componentRef);
  });

  const isHovered = hover != null && hover.some((agent) => agent.id == props.state.id);

  const filter = new GlowFilter({
    color: getCardColor(cardInfo),
    quality: 1,
    outerStrength: props.shouldGlow ? 4 : 0,
  });

  return (
    <MoveAnimation id={props.state.id} x={x} y={y} scale={props.scale ?? smallCardScale} componentRef={componentRef}>
      <EnterExitAnimation skip={true} status={props.status} componentRef={componentRef}>
        <Card
          {...props}
          filters={[filter]}
          state={{ ...props.state, exhausted: isHovered ? true : props.state.exhausted }}
          scale={0}
          ref={componentRef}
        />
      </EnterExitAnimation>
    </MoveAnimation>
  );
});
