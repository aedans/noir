import React from "react";
import { Container } from "@pixi/react";
import { targetResolution } from "../Camera.js";
import { useLocation } from "wouter";
import Button from "../Button.js";
import { hasWon } from "../wins.js";

export default function Play() {
  const [_, setLocation] = useLocation();

  let y = -200;

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 100}>
      <Button
        text="Solo"
        y={y += 200}
        pointerdown={() => {
          setLocation("/solo/");
        }}
      />
      <Button
        text={"Casual"}
        y={y += 200}
        style={{ tint: hasWon("Random Citizens level 1") ? 0xffffff : 0x767676 }}
        pointerdown={() => {
          if (hasWon("Random Citizens level 1")) {
            setLocation("/enqueue/casual");
          } else {
            alert("Defeat Random Citizens to play against other players");
          }
        }}
      />
    </Container>
  );
}
