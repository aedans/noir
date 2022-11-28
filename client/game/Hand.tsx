import { DisplayObject } from "pixi.js";
import React, { createRef, FunctionComponentElement, Ref, RefObject, useContext } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { CardProps, cardWidth } from "../Card";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { GameCard } from "./GameCard";

const HandCard = React.forwardRef(function HandCard(props: CardProps, ref: Ref<Container>) {
  const [{}, drag] = useDrag(() => ({
    type: "card",
    item: props.state,
    collect: () => ({}),
  }));

  return <GameCard {...props} ref={ref} scale={1 / 4} interactive pointerdown={(e) => drag({ current: e.target })} />;
});

export default function Hand() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.players[player].hand);

  const nodes: FunctionComponentElement<{ ref: RefObject<DisplayObject> }>[] = [];

  let x = 0;
  for (const card of cards) {
    nodes.push(<HandCard state={card} key={card.id} ref={createRef()} x={x} />);
    x += cardWidth / 4 + 10;
  }

  return <Container y={targetResolution.height * (3 / 4)}>{nodes}</Container>;
}
