import React, { useContext } from "react";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { useClientSelector } from "../store";
import Text from "../Text";
import { PlayerContext } from "./Game";

export default function Resources() {
  const player = useContext(PlayerContext);
  const money = useClientSelector((state) => state.game.current.players[player].money);

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
