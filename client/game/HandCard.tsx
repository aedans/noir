import React, { useContext } from "react";
import { Ref, useRef, MutableRefObject, useImperativeHandle, useEffect } from "react";
import { useDrag } from "react-dnd";
import GameCard, { GameCardProps, gameCardHeightDiff } from "./GameCard.js";
import { PixiContainer } from "../pixi.js";
import { useClientSelector } from "../store.js";
import { PlayerContext, CacheContext, CostDisplayContext } from "./Game.js";
import util from "../../common/util.js";

export default React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<PixiContainer>) {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const { costDisplay, setCostDisplay } = useContext(CostDisplayContext);
  const game = useClientSelector((state) => state.game);
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

  useEffect(() => {
    if (isDragging) {
      setCostDisplay(({ prepared, exhausted }) => {
        const result = util.tryPayCost(
          cache,
          game,
          props.state,
          "play",
          props.state.name,
          player,
          props.info.colors,
          props.info.cost,
          props.info.targets,
          costDisplay.prepared
        );

        if (typeof result != "string") {
          return {
            prepared,
            exhausted: result.agents,
          };
        } else {
          return { prepared, exhausted };
        }
      });
    } else {
      setCostDisplay(({ prepared }) => ({
        exhausted: [],
        prepared,
      }));
    }
  }, [isDragging]);

  useEffect(() => {
    return () => {
      setCostDisplay(({ prepared }) => ({
        exhausted: [],
        prepared: prepared,
      }));
    };
  }, []);

  let x = props.x;
  let y = props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  const card = (
    <GameCard
      {...props}
      x={x}
      y={y}
      ref={cardRef}
      zoomOffsetY={-gameCardHeightDiff}
      zIndex={isDragging ? 10000 : props.zIndex}
    />
  );

  return card;
});
