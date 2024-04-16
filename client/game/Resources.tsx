import React from "react";
import { useContext } from "react";
import { Container } from "@pixi/react";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import Text from "../Text.js";
import { PlayerContext } from "./Game.js";

export default function Resources() {
  const player = useContext(PlayerContext);
  const money = useClientSelector((state) => state.game.players[player].money);

  const width = 400;
  const height = 100;
  const x = targetResolution.width - width;
  const y = (targetResolution.height - height) / 2 + 100;

  return (
    <Container x={x} y={y}>
      <Text x={40} y={5} text={"Money: " + money} style={{ fontSize: 100, tint: 0xffffff }} />
    </Container>
  );
}
