import React, { ReactNode, useContext } from "react";
import { Container } from "react-pixi-fiber";
import { cardHeight, cardWidth } from "../Card";
import { useDrop } from "react-dnd";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import { CardState } from "../../common/card";
import { PlayerContext, SocketContext } from "./Game";
import { GameCard } from "./GameCard";

export default function Board() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.players[player].board);

  const [{}, drop] = useDrop(() => ({
    accept: "card",
    drop: (state: CardState) => {
      socket.current.emit("action", { type: "play", id: state.id });
    },
    collect: () => ({}),
  }));

  const cardNodes: ReactNode[] = [];

  let x = 0;
  for (const card of cards) {
    cardNodes.push(<GameCard state={card} key={card.id} x={x} />);
    x += cardWidth / 4 + 10;
  }

  return (
    <>
      <Rectangle
        ref={(current) => drop({ current })}
        width={targetResolution.width}
        height={cardHeight * (3 / 4)}
        visible={false}
      />
      <Container x={(targetResolution.width - x) / 2} y={cardHeight / 2}>
        {cardNodes}
      </Container>
    </>
  );
}
