import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, GameCardProps, gameCardWidth } from "./GameCard";
import { getCardInfo } from "../cards";
import Rectangle from "../Rectangle";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const game = useClientSelector((state) => state.game);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Container>>;
  const cardInfo = getCardInfo(game, props.state);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.targets ? targetRef : cardRef);
    }
  });

  const [{ isDragging, position }, drag] = useDrag(() => ({
    type: cardInfo.targets ? "target" : "card",
    item: props.state,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      position: cardInfo.targets ? monitor.getInitialClientOffset() : monitor.getClientOffset(),
    }),
  }), []);

  const x = isDragging ? position?.x : props.x;
  const y = isDragging ? position?.y : props.y;

  const card = <GameCard {...props} x={x} y={y} ref={cardRef} interactive />;

  if (cardInfo.targets) {
    const target = isDragging ? (
      <Rectangle
        pivot={[100, 100]}
        zIndex={100}
        x={x}
        y={y}
        width={200}
        height={200}
        fill={0xff0000}
        ref={targetRef}
        alpha={1}
        interactive
      />
    ) : (
      <Rectangle
        pivot={[gameCardWidth / 2, gameCardHeight / 2]}
        zIndex={100}
        x={x}
        y={y}
        width={gameCardWidth}
        height={gameCardHeight}
        ref={targetRef}
        alpha={0}
        interactive
      />
    );
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
  const cards = useClientSelector((state) => state.game.players[player].deck);

  const x = (targetResolution.width - cards.length * (gameCardWidth + 10)) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + gameCardHeight / 2;

  return (
    <EnterExitAnimator elements={cards}>
      {(state, status, i) =>
        i != null ? (
          <HandCard
            zIndex={20 + i}
            state={state}
            status={status}
            key={state.id}
            x={x + i * (gameCardWidth + 10)}
            y={y}
          />
        ) : (
          <HandCard useLastPos={true} state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
