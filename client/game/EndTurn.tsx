import React, { useContext } from "react";
import { Container } from "@pixi/react";
import Text from "../Text.js";
import Rectangle from "../Rectangle.js";
import { targetResolution } from "../Camera.js";
import { ConnectionContext, PlanContext } from "./Game.js";

export default function EndTurn() {
  const connection = useContext(ConnectionContext);
  const { plan, setPlan } = useContext(PlanContext);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2;

  function pointerdown() {
    connection.plan(plan);
    setPlan([]);
  }

  return (
    <Container x={x} y={y} eventMode="static" pointerdown={pointerdown}>
      <Rectangle fill={0xffffff} width={width} height={height} />
      <Text x={40} y={10} text={"End Turn"} style={{ fontSize: 100, tint: 0x000000 }} />
    </Container>
  );
}
