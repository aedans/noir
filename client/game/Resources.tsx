import React from "react";
import { useContext } from "react";
import { Container } from "@pixi/react";
import { targetResolution } from "../Camera.js";
import { useClientSelector } from "../store.js";
import Text from "../Text.js";
import { CacheContext, PlanContext, PlayerContext } from "./Game.js";
import { planResources } from "../../common/util.js";

export default function Resources() {
  const player = useContext(PlayerContext);
  const cache = useContext(CacheContext);
  const { plan } = useContext(PlanContext);
  const game = useClientSelector((state) => state.game);
  const { money } = planResources(cache, game, player, plan) || { money: 0 };

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
