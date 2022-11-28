import { DisplayObject, InteractionEvent } from "pixi.js";
import React, { createRef, FunctionComponentElement, Ref, RefObject, useContext } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { currentPlayer } from "../../common/gameSlice";
import { targetResolution } from "../Camera";
import { CardProps, cardWidth } from "../Card";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { GameCard } from "./GameCard";

const HandCard = React.forwardRef(function HandCard(props: CardProps, ref: Ref<Container>) {
  const turn = useClientSelector((state) => state.game.turn);
  const player = useContext(PlayerContext);
  const isTurn = currentPlayer({ turn }) == player;

  const [{}, drag] = useDrag(() => ({
    type: "card",
    item: props.state,
    collect: () => ({}),
  }));

  function pointerdown(e: InteractionEvent) {
    if (isTurn) {
      drag({ current: e.target });
    }
  }

  return <GameCard {...props} ref={ref} scale={1 / 4} interactive pointerdown={pointerdown} />;
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

  return (
    <Container x={(targetResolution.width - x) / 2} y={targetResolution.height * (3 / 4)}>
      {nodes}
    </Container>
  );
}
