import React, { MutableRefObject, Ref, useContext, useImperativeHandle, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import { findCard } from "../../common/gameSlice";
import Card, { cardHeight, CardProps, cardWidth } from "../Card";
import EnterExitAnimation, { EnterExitAnimationStatus } from "../EnterExitAnimation";
import MoveAnimation, { MoveAnimationContext } from "../MoveAnimation";
import { useClientSelector } from "../store";

export const gameCardScale = 1 / 4;
export const gameCardWidth = cardWidth * gameCardScale;
export const gameCardHeight = cardHeight * gameCardScale;

export type GameCardProps = CardProps & {
  status: EnterExitAnimationStatus;
  useLastPos?: boolean;
};

const GameCard = React.forwardRef(function GameCard(props: GameCardProps, ref: Ref<Container>) {
  const move = useContext(MoveAnimationContext);
  const game = useClientSelector((state) => state.game);
  const componentRef = React.useRef() as MutableRefObject<Required<Container>>;

  useImperativeHandle(ref, () => componentRef.current);

  const doesExist = ["deck", "board"].includes(findCard(game, props.state)?.zone ?? "");
  const hasExisted = props.state.id in move.current;
  const shouldAnimate = (!hasExisted && doesExist) || !doesExist;

  let x = props.x;
  let y = props.y;

  if (props.useLastPos && props.state.id in move.current && componentRef.current) {
    const prevPosition = componentRef.current.parent.toLocal(move.current[props.state.id]);
    x = prevPosition.x;
    y = prevPosition.y;
  }

  return (
    <EnterExitAnimation duration={shouldAnimate ? 100 : 0} status={props.status} scale={gameCardScale} componentRef={componentRef}>
      <MoveAnimation doesExist={doesExist} id={props.state.id} x={x} y={y} componentRef={componentRef}>
        <Card scale={gameCardScale} {...props} x={x} y={y} ref={componentRef} />
      </MoveAnimation>
    </EnterExitAnimation>
  );
});

export default GameCard;
