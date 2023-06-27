import React, { useContext } from "react";
import { Container } from "@pixi/react";
import Text from "../Text.js";
import Rectangle from "../Rectangle.js";
import { targetResolution } from "../Camera.js";
import { ConnectionContext, PlayerContext } from "./Game.js";
import { useClientSelector } from "../store.js";
import { currentPlayer } from "../../common/gameSlice.js";

export default function EndTurn() {
  const connection = useContext(ConnectionContext);
  const player = useContext(PlayerContext);
  const turn = useClientSelector((state) => state.game.current.turn);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2;
  const isTurn = currentPlayer({ turn }) == player;

  function pointerdown() {
    connection.emit({ type: "end" });
  }

  return (
    <Container renderable={isTurn} x={x} y={y} interactive pointerdown={pointerdown}>
      <Rectangle fill={0xffffff} width={width} height={height} />
      <Text x={40} y={10} text={"End Turn"} style={{ fontSize: 100, tint: 0x000000 }} />
    </Container>
  );
}
