import { DisplayObject } from "pixi.js";
import React, { createRef, FunctionComponentElement, MutableRefObject, Ref, RefObject } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { cardWidth } from "../Card";
import { useNoirSelector } from "../store";
import { GameCard, GameCardProps, GameCardStates } from "./Game";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const [{}, drag] = useDrag(() => ({
    type: "card",
    item: props.state,
    collect: () => ({}),
  }));

  return <GameCard {...props} ref={ref} scale={1 / 4} interactive pointerdown={(e) => drag({ current: e.target })} />;
});

export type HandProps = {
  cards: MutableRefObject<GameCardStates>;
};

export default function Hand(props: HandProps) {
  const cards = useNoirSelector((state) => state.game.hand);

  const nodes: FunctionComponentElement<{ ref: RefObject<DisplayObject> }>[] = [];

  let x = 0;
  for (const card of cards) {
    nodes.push(<HandCard cards={props.cards} state={card} key={card.id} ref={createRef()} x={x} />);
    x += cardWidth / 4 + 10;
  }

  return <Container y={targetResolution.height * (3 / 4)}>{nodes}</Container>;
}
