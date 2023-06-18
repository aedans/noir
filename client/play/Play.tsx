import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import React from "react";
import { useLocation } from "wouter";
import Button from "../Button";
import { hasWon } from "../wins";

export default function Play() {
  const [_, setLocation] = useLocation();

  return (
    <Container x={targetResolution.width / 2} y={targetResolution.height / 2 - 100}>
      <Button
        text="Solo"
        pointerdown={() => {
          setLocation("/solo/");
        }}
      />
      <Button
        text={"Casual"}
        y={200}
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
