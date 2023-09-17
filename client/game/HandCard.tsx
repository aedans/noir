import React from "react";
import { Ref, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import GameCard, { GameCardProps, gameCardHeight, gameCardHeightDiff, gameCardScale } from "./GameCard.js";
import { PixiContainer } from "../pixi.js";

export default React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const cardRef = useRef() as MutableRefObject<PixiContainer>;

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
  let y = props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  const card = (
    <GameCard {...props} x={x} y={y} ref={cardRef} zoomOffsetY={-gameCardHeightDiff} zIndex={isDragging ? 10000 : props.zIndex} />
  );

  return card;
});
