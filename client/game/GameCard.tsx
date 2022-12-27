import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { CardState } from "../../common/card";
import { findCard } from "../../common/gameSlice";
import Card, { CardProps, smallCardHeight, smallCardScale } from "../Card";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { MoveAnimationContext, useLastPos } from "../MoveAnimation";
import { useClientSelector } from "../store";
import { SocketContext } from "./Game";

export type GameCardProps = CardProps & {
  status: EnterExitAnimationStatus;
  useLastPos?: boolean;
};

const GameCard = React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const socket = useContext(SocketContext);
  const move = useContext(MoveAnimationContext);
  const game = useClientSelector((state) => state.game.current);
  const componentRef = useRef() as MutableRefObject<Required<Container>>;
  const [zoom, setZoom] = useState(false);
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

  const location = findCard(game, props.state);
  const doesExist = ["deck", "board"].includes(location?.zone ?? "");
  const hasExisted = props.state.id in move.current;
  const shouldAnimate = (!hasExisted && doesExist) || !doesExist;

  return (
    <MoveAnimation
      id={props.state.id}
      x={x}
      y={zoom ? (y ?? 0) - smallCardHeight / 10 : y}
      scale={zoom ? smallCardScale * 1.2 : smallCardScale}
      componentRef={componentRef}
    >
      <EnterExitAnimation skip={!shouldAnimate} status={props.status} componentRef={componentRef}>
        <Card
          {...props}
          scale={0}
          zIndex={zoom ? 1000 : props.zIndex}
          ref={componentRef}
          pointerover={() => setZoom(true)}
          pointerout={() => setZoom(false)}
        />
      </EnterExitAnimation>
    </MoveAnimation>
  );
});

export default GameCard;
