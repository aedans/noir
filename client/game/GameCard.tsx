import React, { MutableRefObject, Ref, useContext, useImperativeHandle, useLayoutEffect } from "react";
import { Container } from "react-pixi-fiber";
import { findCard } from "../../common/util";
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

  useLayoutEffect(() => {
    const prevPosition = move.current[props.state.id];
    if (props.useLastPos && prevPosition && componentRef.current) {
      componentRef.current.transform.position.copyFrom(componentRef.current.parent.toLocal(prevPosition));
    }
  });

  const doesExist = ["hand", "board"].includes(findCard(game, props.state)?.zone ?? "");
  const hasExisted = props.state.id in move.current;
  const shouldAnimate = (!hasExisted && doesExist) || !doesExist;

  return (
    <EnterExitAnimation duration={shouldAnimate ? 0.1 : 0} status={props.status} componentRef={componentRef}>
      <MoveAnimation doesExist={doesExist} id={props.state.id} componentRef={componentRef}>
        <Card scale={gameCardScale} {...props} ref={componentRef} />
      </MoveAnimation>
    </EnterExitAnimation>
  );
});

export default GameCard;
