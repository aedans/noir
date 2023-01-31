import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Container, Sprite } from "react-pixi-fiber";
import { currentPlayer } from "../../common/gameSlice";
import { getCardColor, smallCardScale } from "../Card";
import { useCardInfo, defaultUtil } from "../cards";
import { useClientSelector } from "../store";
import { HoverContext, SocketContext, PlayerContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";
import Reticle from "./Reticle";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Sprite>>;
  const cardInfo = useCardInfo(props.state);

  useImperativeHandle(ref, () => cardRef.current);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: cardInfo.activateTargets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    []
  );

  useEffect(() => {
    drag(targetRef);
  });

  useEffect(() => {
    return () => setHover([]);
  }, []);

  function pointerdown() {
    if (!cardInfo.activateTargets) {
      socket.emit("action", { type: "do", id: props.state.id });
    }
  }

  function pointerover() {
    if (props.state.exhausted || !cardInfo.hasActivateEffect) {
      return;
    }

    if (!isDragging) {
      const result = defaultUtil.tryPayCost(
        new Map(),
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
        setHover([...result.agents, props.state]);
      }
    }
  }

  function pointerout() {
    if (!isDragging) {
      setHover([]);
    }
  }

  const shouldGlow =
    !props.state.exhausted &&
    cardInfo.hasActivateEffect &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(new Map(), game, props.state, player, cardInfo.colors, cardInfo.activateCost, cardInfo.activateTargets);

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
      shouldDimWhenExhausted
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
