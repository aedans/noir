import React from "react";
import { useContext } from "react";
import { Container } from "@pixi/react";
import Text from "../Text.js";
import { targetResolution } from "../Camera.js";
import { ConnectionContext } from "./Game.js";

export default function Concede() {
  const connection = useContext(ConnectionContext);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2 + 200;

  function pointerdown() {
    connection.concede();
  }

  return (
    <Container x={x} y={y} interactive pointerdown={pointerdown}>
      <Text x={40} y={10} text={"Concede"} style={{ fontSize: 100, tint: 0x000000 }} />
    </Container>
  );
}
