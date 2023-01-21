import React from "react";
import { Ref, useContext, useRef, MutableRefObject, useState, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Container, Sprite } from "react-pixi-fiber";
import { getCardColor, smallCardHeight, smallCardScale } from "../Card";
import { useCardInfo, defaultUtil } from "../cards";
import { useClientSelector } from "../store";
import { HoverContext, PlayerContext } from "./Game";
import GameCard, { GameCardProps } from "./GameCard";
import Reticle from "./Reticle";

export default React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const { setHover } = useContext(HoverContext);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Sprite>>;
  const cardInfo = useCardInfo(props.state);
  const [zoom, setZoom] = useState(false);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.targets ? targetRef : cardRef);
    }

    return () => setHover([]);
  }, [cardInfo]);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: cardInfo.targets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    [cardInfo]
  );

  let x = props.x;
  let y = zoom ? (props.y ?? 0) - smallCardHeight / 10 : props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  function pointerover() {
    if (!isDragging) {
      setZoom(true);

      const result = defaultUtil.tryPayCost(
        game,
        props.state,
        "play",
        props.state.name,
        player,
        cardInfo.colors,
        cardInfo.cost,
        cardInfo.targets
      );

      if (typeof result != "string") {
        setHover(result.agents);
      }
    }
  }

  function pointerout() {
    if (!isDragging) {
      setZoom(false);
      setHover([]);
    }
  }

  const scale = zoom ? smallCardScale * 1.2 : smallCardScale;

  const card = (
    <GameCard
      {...props}
      shadow={20}
      x={x}
      y={y}
      scale={scale}
      zIndex={zoom ? 100 : props.zIndex}
      ref={cardRef}
      interactive={props.status != "exiting"}
      pointerover={pointerover}
      pointerout={pointerout}
    />
  );

  if (cardInfo.targets) {
    const target = (
      <Reticle
        x={x}
        y={y}
        ref={targetRef}
        isDragging={isDragging}
        color={getCardColor(cardInfo)}
        angle={props.angle}
        scale={scale}
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