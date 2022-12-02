import React, { useContext } from "react";
import { Container } from "react-pixi-fiber";
import Text from "../Text";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { PlayerContext, SocketContext } from "./Game";
import { useClientSelector } from "../store";
import { currentPlayer } from "../../common/util";

export default function EndTurn() {
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const turn = useClientSelector((state) => state.game.turn);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2;
  const isTurn = currentPlayer({ turn }) == player;

  function pointerdown() {
    socket.current.emit("action", { type: "end" });
  }

  return (
    <Container visible={isTurn} x={x} y={y} interactive pointerdown={pointerdown}>
      <Rectangle fill={0xffffff} width={width} height={height} />
      <Text x={40} y={5} text={"End Turn"} style={{ fontSize: 100, tint: 0x000000 }} />
    </Container>
  );
}
