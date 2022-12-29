import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrop } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import { findCard } from "../../common/gameSlice";
import Card, { CardProps, smallCardScale } from "../Card";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { MoveAnimationContext, useLastPos } from "../MoveAnimation";
import { useClientSelector } from "../store";
import { SocketContext } from "./Game";

export type GameCardProps = CardProps & {
  scale?: number;
  status: EnterExitAnimationStatus;
  useLastPos?: boolean;
};

const GameCard = React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const socket = useContext(SocketContext);
  const move = useContext(MoveAnimationContext);
  const game = useClientSelector((state) => state.game.current);
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const { x, y } = useLastPos(props, props.state.id, componentRef);

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

  return (
    <MoveAnimation id={props.state.id} x={x} y={y} scale={props.scale ?? smallCardScale} componentRef={componentRef}>
      <EnterExitAnimation skip={true} status={props.status} componentRef={componentRef}>
        <Card {...props} scale={0} ref={componentRef} />
      </EnterExitAnimation>
    </MoveAnimation>
  );
});

export default GameCard;
