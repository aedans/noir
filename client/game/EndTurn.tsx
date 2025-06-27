import { Container } from "@pixi/react";
import React, { useCallback, useContext } from "react";
import { targetResolution } from "../Camera.js";
import Rectangle from "../Rectangle.js";
import Text from "../Text.js";
import { ConnectionContext, PlanContext } from "./Game.js";

export default function EndTurn() {
  const connection = useContext(ConnectionContext);
  const { plan } = useContext(PlanContext);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2;

  const pointerdown = useCallback(() => {
    connection.plan(plan);
  }, [connection, plan]);

  return (
    <Container x={x} y={y} eventMode="static" pointerdown={pointerdown}>
      <Rectangle fill={0xffffff} width={width} height={height} />
      <Text x={40} y={10} text={"End Turn"} style={{ fontSize: 100, tint: 0x000000 }} />
    </Container>
  );
}
