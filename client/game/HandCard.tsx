import React from "react";
import { Ref, useRef, MutableRefObject, useState, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { cardHeight } from "../Card.js";
import GameCard, { GameCardProps } from "./GameCard.js";
import { PixiContainer } from "../pixi.js";

export default React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const cardRef = useRef() as MutableRefObject<PixiContainer>;
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
