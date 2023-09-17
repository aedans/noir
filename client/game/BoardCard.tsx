import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { currentPlayer } from "../../common/gameSlice.js";
import { useClientSelector } from "../store.js";
import { CacheContext, ConnectionContext, PlayerContext } from "./Game.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const connection = useContext(ConnectionContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<PixiContainer>;

  useImperativeHandle(ref, () => cardRef.current);

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: props.info.activateTargets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );

  useEffect(() => {
    if (props.info.activateTargets) {
      dragPreview(cardRef);
    }
  });

  function pointerdown() {
    connection.emit({ type: "do", id: props.state.id });
  }

  const shouldGlow =
    !props.state.activated &&
    props.info.hasActivate &&
    currentPlayer(game) == player &&
    util.canPayCost(
      cache,
      game,
      props.state,
      player,
      props.info.colors,
      props.info.activateCost,
      props.info.activateTargets
    );

  let x = props.x ?? 0;
  let y = props.y ?? 0;

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      state={{ ...props.state }}
      shouldGlow={shouldGlow}
      shouldDimWhenExhausted
      ref={cardRef}
      interactive
      pointerdown={pointerdown}
    />
  );

  return card;
});
