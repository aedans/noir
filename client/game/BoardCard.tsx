import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { currentPlayer } from "../../common/gameSlice.js";
import { useClientSelector } from "../store.js";
import { CacheContext, ConnectionContext, HoverContext, PlayerContext, PreparedContext } from "./Game.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import util from "../../common/util.js";
import { PixiContainer } from "../pixi.js";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const connection = useContext(ConnectionContext);
  const { hover, setHover } = useContext(HoverContext);
  const { prepared, setPrepared } = useContext(PreparedContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<PixiContainer>;

  const isHovered = hover.some((card) => card.id == props.state.id);
  const isPrepared = prepared.some((card) => card.id == props.state.id);

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
    return () => setHover([]);
  }, []);

  function pointerdown() {
    if (!props.info.hasActivate && !isPrepared && !props.state.exhausted && props.info.type == "agent") {
      setPrepared((ps) => [...ps, props.state]);
    } else if (isPrepared) {
      setPrepared((ps) => ps.filter((card) => card.id != props.state.id));
    } else if (!props.info.activateTargets) {
      connection.emit({ type: "do", id: props.state.id, prepared });
    }
  }

  function pointerover() {
    if (props.state.exhausted || !props.info.hasActivate) {
      return;
    }

    if (!isDragging) {
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
      props.info.activateTargets,
      prepared
    );

  let x = props.x ?? 0;
  let y = props.y ?? 0;

  if (isPrepared && (hover.length == 0 || isHovered)) {
    y -= 50;
  }

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      state={{ ...props.state, exhausted: isHovered ? true : props.state.exhausted }}
      shouldGlow={shouldGlow}
      shouldDimWhenExhausted
      ref={cardRef}
      interactive
      pointerdown={pointerdown}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  return card;
});
