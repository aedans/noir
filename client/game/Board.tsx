import React, { createRef, MutableRefObject, ReactNode, Ref } from "react";
import { Container } from "react-pixi-fiber";
import { cardHeight, cardWidth } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useNoirDispatch, useNoirSelector } from "../store";
import { CardState } from "../../common/card";
import { playCard } from "./gameSlice";
import { GameCard, GameCardStates } from "./Game";

export type BoardProps = {
  cards: MutableRefObject<GameCardStates>;
};

export default function Board(props: BoardProps) {
  const cards = useNoirSelector((state) => state.game.board);
  const dispatch = useNoirDispatch();

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      dispatch(playCard(state.id));
    },
    collect: () => ({}),
  }));

  const cardNodes: ReactNode[] = [];

  let x = 0;
  for (const card of cards) {
    cardNodes.push(<GameCard cards={props.cards} scale={1 / 4} state={card} key={card.id} x={x} />);
    x += cardWidth / 4 + 10;
  }

  return (
    <Container>
      <Rectangle
        innerRef={(current) => drop({ current })}
        fill={0x202020}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <Container y={cardHeight / 2}>{cardNodes}</Container>
    </Container>
  );
}
