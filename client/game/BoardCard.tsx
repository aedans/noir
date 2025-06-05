import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect, useCallback } from "react";
import { useDrag } from "react-dnd";
import { useClientSelector } from "../store.js";
import { CacheContext, PlanContext, PlayerContext } from "./Game.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import { PixiContainer } from "../pixi.js";
import { canPayPlan, planResources } from "../../common/util.js";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game);
  const { plan, setPlan } = useContext(PlanContext);
  const cardRef = useRef() as MutableRefObject<PixiContainer>;

  useImperativeHandle(ref, () => cardRef.current);

  const canActivate =
    !props.state.exhausted &&
    props.info.hasActivate &&
    canPayPlan(cache, game, player, plan, { type: "activate", card: props.state });

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: props.info.activateTargets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => canActivate
    }),
    [canActivate]
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
      if (canActivate && !props.info.activateTargets) {
        setPlan((plan) => [...plan, { type: "activate", card: props.state, action: { id: props.state.id } }]);
      }
    }
  }

  function pointerover(e: any) {
    if (props.state.exhausted || !props.info.hasActivate) {
      return;
    }
  }

  let x = props.x ?? 0;
  let y = props.y ?? 0;

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      state={props.state}
      shouldGlow={canActivate}
      shouldDimWhenExhausted
      ref={cardRef}
      eventMode="static"
      pointerdown={pointerdown}
      pointerover={pointerover}
    />
  );

  return card;
});
