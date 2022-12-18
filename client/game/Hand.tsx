import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, GameCardProps, gameCardWidth } from "./GameCard";
import { getCardInfo } from "../cards";
import Reticle from "./Reticle";
import { getCardColor } from "../Card";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Container>>;
  const cardInfo = getCardInfo(game, props.state);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.targets ? targetRef : cardRef);
    }
  });

  const [{ isDragging, position }, drag] = useDrag(
    () => ({
      type: cardInfo.targets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        position: cardInfo.targets ? monitor.getInitialClientOffset() : monitor.getClientOffset(),
      }),
    }),
    []
  );

  const x = isDragging ? position?.x : props.x;
  const y = isDragging ? position?.y : props.y;

  const card = <GameCard {...props} x={x} y={y} ref={cardRef} interactive />;

  if (cardInfo.targets) {
    const target = <Reticle x={x} y={y} ref={targetRef} isDragging={isDragging} color={getCardColor(cardInfo)} />;
    return (
      <>
        {card}
        {target}
      </>
    );
  } else {
    return card;
  }
});

export default function Hand() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[player].deck);
  const offset = gameCardWidth - 20;

  const x = (targetResolution.width - cards.length * offset) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + gameCardHeight / 2 + 20;

  return (
    <EnterExitAnimator elements={cards}>
      {(state, status, i) =>
        i != null ? (
          <HandCard
            zIndex={20 + i}
            state={state}
            status={status}
            key={state.id}
            x={x + i * offset}
            y={y + Math.abs((i - (cards.length - 1) / 2.0) * 10)}
            angle={(i - (cards.length - 1) / 2.0) * 1}
          />
        ) : (
          <HandCard useLastPos={true} state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
