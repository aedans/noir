import React, { Ref, useContext, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { currentPlayer } from "../../common/gameSlice";
import { defaultUtil } from "../cards";
import { useClientSelector } from "../store";
import { ConnectionContext, HoverContext, PlayerContext, PreparedContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";

export default React.forwardRef(function BoardCard(props: GameCardProps, ref: Ref<Container>) {
  const { hover, setHover } = useContext(HoverContext);
  const { prepared, setPrepared } = useContext(PreparedContext);
  const connection = useContext(ConnectionContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;

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
      const result = defaultUtil.tryPayCost(
        new Map(),
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
    !props.state.exhausted &&
    props.info.hasActivate &&
    currentPlayer(game) == player &&
    defaultUtil.canPayCost(
      new Map(),
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
