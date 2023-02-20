import React from "react";
import { Ref, useContext, useRef, MutableRefObject, useState, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { cardHeight } from "../Card";
import { defaultUtil } from "../cards";
import { useClientSelector } from "../store";
import { HoverContext, PlayerContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";

export default React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const [zoom, setZoom] = useState(false);

  useImperativeHandle(ref, () => cardRef.current);

  const [{ isDragging, globalPosition }, drag, dragPreview] = useDrag(
    () => ({
      type: props.info.targets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    []
  );

  useEffect(() => {
    if (props.info.targets) {
      dragPreview(cardRef);
    } else {
      drag(cardRef);
    }
  });

  useEffect(() => {
    if (isDragging) {
      const result = defaultUtil.tryPayCost(
        new Map(),
        game,
        props.state,
        "play",
        props.state.name,
        player,
        props.info.colors,
        props.info.cost,
        props.info.targets
      );

      if (typeof result != "string") {
        setHover(result.agents);
      }
    } else {
      setHover([]);
    }
  }, [isDragging]);

  useEffect(() => {
    return () => setHover([]);
  }, []);

  let x = props.x;
  let y = zoom ? (props.y ?? 0) - cardHeight / 10 : props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  function pointerover() {
    if (!isDragging) {
      setZoom(true);
    }
  }

  function pointerout() {
    if (!isDragging) {
      setZoom(false);
    }
  }

  const scale = zoom ? 1.2 : 1;

  const card = (
    <GameCard
      {...props}
      shadow={20}
      x={x}
      y={y}
      scale={scale}
      ref={cardRef}
      interactive={!isDragging || !props.info.targets}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  return card;
});
