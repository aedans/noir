import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect, useCallback } from "react";
import { useDrag } from "react-dnd";
import { useClientSelector } from "../store.js";
import { CacheContext, CostDisplayContext, PlanContext, PlayerContext } from "./Game.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";
import { canUseCard } from "../cards.js";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const game = useClientSelector((state) => state.game);
  const { costDisplay, setCostDisplay } = useContext(CostDisplayContext);
  const { plan, setPlan } = useContext(PlanContext);
  const cardRef = useRef() as MutableRefObject<PixiContainer>;

  const isExhausted = costDisplay.exhausted.some((card) => card.id == props.state.id);
  const isPrepared = costDisplay.prepared.some((card) => card.id == props.state.id);

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

  useEffect(() => {
    return () => {
      setCostDisplay(({ prepared }) => ({
        exhausted: [],
        prepared: prepared,
      }));
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      setCostDisplay(({ prepared }) => ({
        exhausted: [],
        prepared,
      }));
    }
  }, [isDragging]);

  function pointerdown(e: any) {
    if (props.state.exhausted || props.info.type != "agent") {
      return;
    }

    if (e.nativeEvent.which == 1) {
      if (!props.info.activateTargets && canUseCard(cache, game, player, props.state, "activate", plan)) {
        setPlan((plan) => [
          ...plan,
          { type: "activate", card: props.state, action: { id: props.state.id, prepared: costDisplay.prepared } },
        ]);
      }
    } else if (e.nativeEvent.which == 3) {
      if (!isPrepared) {
        setCostDisplay(({ exhausted, prepared }) => ({
          exhausted,
          prepared: [...prepared, props.state],
        }));
      } else {
        setCostDisplay(({ exhausted, prepared }) => ({
          exhausted,
          prepared: prepared.filter((card) => card.id != props.state.id),
        }));
      }
    }
  }

  function pointerover(e: any) {
    if (props.state.exhausted || !props.info.hasActivate) {
      return;
    }

    if (!isDragging && e.nativeEvent.buttons == 0) {
      setCostDisplay(({ prepared, exhausted }) => {
        const result = util.tryPayCost(
          cache,
          game,
          props.state,
          "activate",
          props.state.name,
          player,
          props.info.colors,
          props.info.activateCost,
          props.info.activateTargets,
          prepared
        );

        if (typeof result != "string") {
          return {
            prepared,
            exhausted: [...result.agents, props.state],
          };
        } else {
          return { prepared, exhausted };
        }
      });
    }
  }

  function pointerout(e: any) {
    if (!isDragging && e.nativeEvent.buttons == 0) {
      setCostDisplay(({ prepared }) => ({
        exhausted: [],
        prepared,
      }));
    }
  }

  const shouldGlow =
    !props.state.exhausted &&
    props.info.hasActivate &&
    canUseCard(cache, game, player, props.state, "activate", plan)

  let x = props.x ?? 0;
  let y = props.y ?? 0;

  if (isPrepared && (costDisplay.exhausted.length == 0 || isExhausted)) {
    y -= 50;
  }

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      state={{ ...props.state, exhausted: isExhausted || props.state.exhausted }}
      shouldGlow={shouldGlow}
      shouldDimWhenExhausted
      ref={cardRef}
      eventMode="static"
      pointerdown={pointerdown}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  return card;
});
