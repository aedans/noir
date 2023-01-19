import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { cardHeight, getCardColor, smallCardHeight, smallCardWidth } from "../Card";
import { useDrag, useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { HoverContext, PlayerContext, SocketContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { Container, Sprite } from "react-pixi-fiber";
import { defaultUtil, useCardInfo } from "../cards";
import { currentPlayer } from "../../common/gameSlice";
import Reticle from "./Reticle";

const BoardCard = React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Sprite>>;
  const cardInfo = useCardInfo(props.state);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.activateTargets ? targetRef : cardRef);
    }

    return () => setHover([]);
  }, [cardInfo]);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: cardInfo.activateTargets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    [cardInfo]
  );

  function pointerdown() {
    if (!cardInfo.activateTargets) {
      socket.emit("action", { type: "do", id: props.state.id });
    }
  }

  function pointerover() {
    if (props.state.exhausted) {
      return;
    }

    const result = defaultUtil.tryPayCost(
      game,
      props.state,
      "activate",
      props.state.name,
      player,
      cardInfo.colors,
      cardInfo.activateCost,
      cardInfo.activateTargets
    );

    if (typeof result != "string") {
      setHover(result.agents);
    }
  }

  function pointerout() {
    setHover([]);
  }

  const shouldGlow =
    !props.state.exhausted &&
    cardInfo.hasActivateEffect &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(game, props.state, player, cardInfo.colors, cardInfo.activateCost, cardInfo.activateTargets);
  
  let x = props.x;
  let y = props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  const card = (
    <GameCard
      {...props}
      shouldGlow={shouldGlow}
      ref={cardRef}
      interactive
      pointerdown={pointerdown}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  if (cardInfo.activateTargets && !props.state.exhausted) {
    const target = (
      <Reticle
        x={x}
        y={y}
        ref={targetRef}
        isDragging={isDragging}
        color={getCardColor(cardInfo)}
        pointerover={pointerover}
        pointerout={pointerout}
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

export default function Board() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[player].board);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      socket.emit("action", { type: "do", id: state.id });
    },
    collect: () => ({}),
  }));

  const x = (targetResolution.width - cards.length * (smallCardWidth + 10)) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (2 / 4) + smallCardHeight / 2;

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <EnterExitAnimator elements={cards}>
        {(state, status, i) =>
          i != null ? (
            <BoardCard state={state} status={status} key={state.id} x={x + i * (smallCardWidth + 10)} y={y} />
          ) : (
            <BoardCard useLastPos={true} state={state} status={status} key={state.id} />
          )
        }
      </EnterExitAnimator>
    </>
  );
}
