import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Container, Sprite } from "react-pixi-fiber";
import { currentPlayer } from "../../common/gameSlice";
import { getCardColor } from "../Card";
import { defaultUtil } from "../cards";
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

  useImperativeHandle(ref, () => cardRef.current);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: props.info.activateTargets ? "target" : "card",
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
    if (!props.info.activateTargets) {
      socket.emit("action", { type: "do", id: props.state.id });
    }
  }

  function pointerover() {
    if (props.state.exhausted || !props.info.hasActivateEffect) {
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
        props.info.colors,
        props.info.activateCost,
        props.info.activateTargets
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
    props.info.hasActivateEffect &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(
      new Map(),
      game,
      props.state,
      player,
      props.info.colors,
      props.info.activateCost,
      props.info.activateTargets
    );

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

  if (props.info.activateTargets && !props.state.exhausted) {
    const target = (
      <Reticle
        x={x}
        y={y}
        ref={targetRef}
        isDragging={isDragging}
        color={getCardColor(props.info.colors)}
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
