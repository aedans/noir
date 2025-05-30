import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect, useCallback } from "react";
import { useDrag } from "react-dnd";
import { useClientSelector } from "../store.js";
import { CacheContext, PlanContext, PlayerContext } from "./Game.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";
import { canUseCard } from "../cards.js";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game);
  const { plan, setPlan } = useContext(PlanContext);
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

  function pointerdown(e: any) {
    if (props.state.exhausted || props.info.type != "agent") {
      return;
    }

    if (e.nativeEvent.which == 1) {
      if (
        props.info.hasActivate &&
        !props.info.activateTargets &&
        canUseCard(cache, game, player, props.state, "activate", plan)
      ) {
        setPlan((plan) => [
          ...plan,
          { type: "activate", card: props.state, action: { id: props.state.id } },
        ]);
      }
    }
  }

  function pointerover(e: any) {
    if (props.state.exhausted || !props.info.hasActivate) {
      return;
    }
  }

  const shouldGlow =
    !props.state.exhausted && props.info.hasActivate && canUseCard(cache, game, player, props.state, "activate", plan);

  let x = props.x ?? 0;
  let y = props.y ?? 0;

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      state={props.state}
      shouldGlow={shouldGlow}
      shouldDimWhenExhausted
      ref={cardRef}
      eventMode="static"
      pointerdown={pointerdown}
      pointerover={pointerover}
    />
  );

  return card;
});
